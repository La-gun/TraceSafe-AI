/**
 * NigeriaHeatmap — SVG-based choropleth of Nigerian states coloured by risk level.
 * Falls back to a ranked list view. Clicking a state opens a batch detail panel.
 */
import React, { useMemo, useState } from "react";
import { Loader2, AlertTriangle, TrendingUp, MapPin, ChevronRight } from "lucide-react";

// Approximate lat/lng centres for each Nigerian state (for the ranked list)
const STATE_CENTRES = {
  Lagos: { lat: 6.52, lng: 3.38 }, Kano: { lat: 12.0, lng: 8.52 },
  FCT: { lat: 9.07, lng: 7.4 }, Rivers: { lat: 4.84, lng: 6.91 },
  Oyo: { lat: 8.0, lng: 3.9 }, Kaduna: { lat: 10.52, lng: 7.44 },
  Anambra: { lat: 6.21, lng: 7.07 }, Delta: { lat: 5.5, lng: 5.9 },
  Katsina: { lat: 12.99, lng: 7.61 }, Ogun: { lat: 7.16, lng: 3.35 },
  Imo: { lat: 5.49, lng: 7.03 }, Enugu: { lat: 6.44, lng: 7.51 },
  Borno: { lat: 11.83, lng: 13.15 }, Edo: { lat: 6.34, lng: 5.63 },
  Plateau: { lat: 9.22, lng: 9.52 }, Sokoto: { lat: 13.06, lng: 5.24 },
  Akwa_Ibom: { lat: 5.0, lng: 7.85 }, Osun: { lat: 7.56, lng: 4.56 },
  Kwara: { lat: 8.5, lng: 4.55 }, Niger: { lat: 9.93, lng: 5.6 },
  Bauchi: { lat: 10.31, lng: 9.84 }, Adamawa: { lat: 9.33, lng: 12.39 },
  Benue: { lat: 7.19, lng: 8.13 }, Nassarawa: { lat: 8.54, lng: 8.31 },
  Kebbi: { lat: 11.49, lng: 4.19 }, Taraba: { lat: 7.87, lng: 11.37 },
  Kogi: { lat: 7.8, lng: 6.74 }, Cross_River: { lat: 5.87, lng: 8.6 },
  Jigawa: { lat: 12.18, lng: 9.34 }, Zamfara: { lat: 12.17, lng: 6.66 },
  Gombe: { lat: 10.29, lng: 11.17 }, Yobe: { lat: 12.29, lng: 11.44 },
  Abia: { lat: 5.45, lng: 7.52 }, Ebonyi: { lat: 6.26, lng: 8.01 },
  Ekiti: { lat: 7.72, lng: 5.31 }, Ondo: { lat: 7.25, lng: 5.19 },
  Bayelsa: { lat: 4.77, lng: 6.06 },
};

// Normalise state names (handle spaces, Akwa Ibom, etc.)
function normaliseState(s) {
  if (!s) return null;
  return s.trim().replace(/\s+/g, "_");
}

function riskLevel(score) {
  if (score >= 75) return "high";
  if (score >= 40) return "medium";
  return "low";
}

const RISK_COLORS = {
  high:   { fill: "#ef4444", border: "#fca5a5", label: "High Risk",   text: "text-red-400",    bg: "bg-red-500/10 border-red-500/30" },
  medium: { fill: "#f59e0b", border: "#fcd34d", label: "Medium Risk", text: "text-amber-400",  bg: "bg-amber-500/10 border-amber-500/30" },
  low:    { fill: "#10b981", border: "#6ee7b7", label: "Low Risk",    text: "text-emerald-400",bg: "bg-emerald-500/10 border-emerald-500/30" },
  none:   { fill: "#1f2937", border: "#374151", label: "No Data",     text: "text-gray-500",   bg: "bg-gray-500/10 border-gray-500/20" },
};

export default function NigeriaHeatmap({ batches, alerts, isLoading, onLocationSelect }) {
  const [hoveredState, setHoveredState] = useState(null);

  // Group batches by state and compute aggregate risk per state
  const stateRiskMap = useMemo(() => {
    const map = {};
    batches.forEach((batch) => {
      const states = [
        ...(batch.authorised_zones || []),
        ...(batch.anomaly_flags?.length ? [] : []),
      ];
      // Use plant_location state or authorised_zones
      const rawState = batch.plant_location?.split("—")?.[0]?.split(",")?.[0]?.trim()
        || (batch.authorised_zones || [])[0];
      if (!rawState) return;
      const key = normaliseState(rawState);
      if (!map[key]) map[key] = { batches: [], alertCount: 0, maxScore: 0, state: rawState };
      map[key].batches.push(batch);
      const score = batch.diversion_score || 0;
      if (score > map[key].maxScore) map[key].maxScore = score;
    });

    // Layer in alert counts
    alerts.forEach((alert) => {
      const key = normaliseState(alert.detected_zone || alert.expected_zone);
      if (key && map[key]) map[key].alertCount += 1;
    });

    return map;
  }, [batches, alerts]);

  // Build sorted state list for the ranked view
  const rankedStates = useMemo(() => {
    return Object.entries(stateRiskMap)
      .map(([key, data]) => ({ key, ...data, risk: riskLevel(data.maxScore) }))
      .sort((a, b) => b.maxScore - a.maxScore);
  }, [stateRiskMap]);

  const handleStateClick = (stateKey) => {
    const data = stateRiskMap[stateKey];
    if (!data) return;
    onLocationSelect({ state: data.state || stateKey, batches: data.batches, alertCount: data.alertCount, maxScore: data.maxScore });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Legend */}
      <div className="flex flex-wrap gap-3 items-center">
        <span className="text-xs text-gray-500">Risk level:</span>
        {Object.entries(RISK_COLORS).filter(([k]) => k !== "none").map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cfg.fill }} />
            <span className="text-xs text-gray-400">{cfg.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 ml-2">
          <AlertTriangle className="w-3 h-3 text-gray-500" />
          <span className="text-xs text-gray-500">Size = alert frequency</span>
        </div>
      </div>

      {/* Visual map — bubble chart on a Nigeria silhouette placeholder */}
      <div className="relative bg-[#0A0F1C] border border-white/[0.08] rounded-3xl overflow-hidden" style={{ minHeight: 420 }}>
        {/* Background grid */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

        <div className="absolute top-4 left-4 text-[10px] text-gray-600 font-mono uppercase tracking-wider">Nigeria — Diversion Risk by State</div>

        {/* Bubble positions: use normalised lat/lng mapped to SVG space */}
        {/* Nigeria spans roughly lat 4–14, lng 3–15 */}
        <svg viewBox="0 0 600 480" className="w-full h-full absolute inset-0" style={{ minHeight: 420 }}>
          {Object.entries(STATE_CENTRES).map(([stateKey, centre]) => {
            const data = stateRiskMap[stateKey];
            const risk = data ? riskLevel(data.maxScore) : "none";
            const cfg = RISK_COLORS[risk];
            const alertCount = data?.alertCount || 0;
            const batchCount = data?.batches?.length || 0;
            // Map lat/lng to SVG coords
            const x = ((centre.lng - 2.5) / 13) * 560 + 20;
            const y = ((14.5 - centre.lat) / 11) * 420 + 20;
            const baseR = data ? 10 + Math.min(batchCount * 3, 20) : 6;
            const pulseR = alertCount > 0 ? baseR + 6 : baseR;
            const isHovered = hoveredState === stateKey;
            const displayName = stateKey.replace(/_/g, " ");

            return (
              <g key={stateKey} style={{ cursor: data ? "pointer" : "default" }}
                onClick={() => data && handleStateClick(stateKey)}
                onMouseEnter={() => setHoveredState(stateKey)}
                onMouseLeave={() => setHoveredState(null)}>
                {/* Pulse ring for alerts */}
                {alertCount > 0 && (
                  <circle cx={x} cy={y} r={pulseR} fill="none"
                    stroke={cfg.fill} strokeWidth="1" opacity="0.3" />
                )}
                {/* Main bubble */}
                <circle cx={x} cy={y} r={isHovered ? baseR + 3 : baseR}
                  fill={cfg.fill} fillOpacity={data ? 0.85 : 0.2}
                  stroke={cfg.border} strokeWidth={isHovered ? 2 : 1}
                  style={{ transition: "r 0.15s, fill-opacity 0.15s" }} />
                {/* Alert badge */}
                {alertCount > 0 && (
                  <text x={x + baseR - 2} y={y - baseR + 4} fontSize="7"
                    fill="#fff" textAnchor="middle" fontWeight="bold">{alertCount}</text>
                )}
                {/* State label on hover */}
                {isHovered && (
                  <text x={x} y={y + baseR + 10} fontSize="8" fill="#e5e7eb"
                    textAnchor="middle" fontWeight="500">{displayName}</text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Tooltip overlay */}
        {hoveredState && stateRiskMap[hoveredState] && (
          <div className="absolute top-4 right-4 bg-[#111827]/90 backdrop-blur-sm border border-white/[0.10] rounded-2xl p-3 text-xs pointer-events-none min-w-[160px]">
            <p className="font-bold text-white mb-1">{hoveredState.replace(/_/g, " ")}</p>
            <p className="text-gray-400">Batches tracked: <span className="text-white">{stateRiskMap[hoveredState].batches.length}</span></p>
            <p className="text-gray-400">Max diversion score: <span className={RISK_COLORS[riskLevel(stateRiskMap[hoveredState].maxScore)].text}>{stateRiskMap[hoveredState].maxScore}</span></p>
            <p className="text-gray-400">Open alerts: <span className="text-red-400">{stateRiskMap[hoveredState].alertCount}</span></p>
            <p className="text-emerald-400/60 text-[10px] mt-1.5">Click to view batches</p>
          </div>
        )}
      </div>

      {/* Ranked state list */}
      <div className="bg-[#0A0F1C] border border-white/[0.08] rounded-3xl overflow-hidden">
        <div className="px-5 py-3 border-b border-white/[0.06]">
          <p className="text-xs font-semibold text-white flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-red-400" />
            States Ranked by Diversion Risk
          </p>
        </div>
        {rankedStates.length === 0 ? (
          <div className="px-5 py-10 text-center text-gray-500 text-sm">
            <MapPin className="w-6 h-6 mx-auto mb-2 opacity-30" />
            No batch location data available. Assign authorised zones to batches to populate the map.
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {rankedStates.slice(0, 15).map(({ key, state, batches: bs, maxScore, alertCount, risk }) => {
              const cfg = RISK_COLORS[risk];
              return (
                <button key={key} onClick={() => handleStateClick(key)}
                  className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.03] transition-colors text-left gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cfg.fill }} />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{(state || key).replace(/_/g, " ")}</p>
                      <p className="text-[10px] text-gray-500">{bs.length} batch{bs.length !== 1 ? "es" : ""} · {alertCount} alert{alertCount !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-20 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${maxScore}%`, backgroundColor: cfg.fill }} />
                    </div>
                    <span className={`text-xs font-bold w-8 text-right ${cfg.text}`}>{maxScore}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}