import React, { useMemo } from "react";

const FALLBACK_REGIONS = [
  { name: "Lagos", scans: 8420, suspicious: 42, x: 18, y: 68 },
  { name: "Abuja", scans: 4210, suspicious: 18, x: 40, y: 48 },
  { name: "Kano", scans: 3180, suspicious: 31, x: 45, y: 18 },
  { name: "Port Harcourt", scans: 2940, suspicious: 15, x: 32, y: 76 },
  { name: "Onitsha", scans: 1860, suspicious: 28, x: 35, y: 65 },
  { name: "Ibadan", scans: 1540, suspicious: 8, x: 22, y: 58 },
  { name: "Enugu", scans: 1120, suspicious: 12, x: 38, y: 60 },
  { name: "Kaduna", scans: 980, suspicious: 9, x: 40, y: 28 },
];

export default function RegionMap({ scanByState, suspiciousByState }) {
  const { regions, maxScans, source } = useMemo(() => {
    if (scanByState?.length) {
      const suspMap = Object.fromEntries(
        (suspiciousByState || []).map((s) => [s.state, s.count]),
      );
      const max = Math.max(...scanByState.map((s) => s.count), 1);
      const regs = scanByState.slice(0, 10).map((s, i) => ({
        name: s.state,
        scans: s.count,
        suspicious: suspMap[s.state] ?? 0,
        x: 18 + (i * 7) % 50,
        y: 28 + (i * 11) % 45,
      }));
      return { regions: regs, maxScans: max, source: "From scan events" };
    }
    return { regions: FALLBACK_REGIONS, maxScans: 8420, source: "Illustrative" };
  }, [scanByState, suspiciousByState]);

  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-white">Regional Activity</h3>
          <p className="text-xs text-gray-500 mt-0.5">Scan distribution — {source}</p>
        </div>
      </div>
      <div className="space-y-2.5">
        {regions.map((region, i) => {
          const pct = (region.scans / maxScans) * 100;
          const susPct = region.suspicious > 20 ? "high" : region.suspicious > 10 ? "medium" : "low";
          return (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xs text-gray-400 w-28 shrink-0 truncate" title={region.name}>
                {region.name}
              </span>
              <div className="flex-1 h-2 rounded-full bg-white/[0.04] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 w-14 text-right shrink-0">
                {region.scans.toLocaleString()}
              </span>
              <span
                className={`text-[10px] w-6 text-center font-medium ${
                  susPct === "high"
                    ? "text-red-400"
                    : susPct === "medium"
                    ? "text-amber-400"
                    : "text-gray-500"
                }`}
              >
                {region.suspicious}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/[0.04]">
        <span className="text-[10px] text-gray-600">Suspicious scans:</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-red-400">●</span>
          <span className="text-[10px] text-gray-600">&gt;20</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-amber-400">●</span>
          <span className="text-[10px] text-gray-600">10-20</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-gray-500">●</span>
          <span className="text-[10px] text-gray-600">&lt;10</span>
        </div>
      </div>
    </div>
  );
}
