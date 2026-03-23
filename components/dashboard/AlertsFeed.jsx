import React from "react";
import { AlertTriangle, MapPin, Repeat, ArrowRightLeft } from "lucide-react";

const alerts = [
  {
    icon: Repeat,
    type: "Repeat Scan",
    product: "Amoxicillin 500mg — Batch AMX-2026-0341",
    location: "Onitsha, Anambra",
    time: "12 min ago",
    severity: "high",
  },
  {
    icon: MapPin,
    type: "Geo Mismatch",
    product: "Metformin 850mg — Batch MET-2026-0112",
    location: "Kano (expected: Lagos)",
    time: "34 min ago",
    severity: "high",
  },
  {
    icon: ArrowRightLeft,
    type: "Diversion Signal",
    product: "Ciprofloxacin 250mg — Batch CIP-2026-0089",
    location: "Port Harcourt, Rivers",
    time: "1 hr ago",
    severity: "medium",
  },
  {
    icon: Repeat,
    type: "Repeat Scan",
    product: "Paracetamol 500mg — Batch PAR-2026-0567",
    location: "Ikeja, Lagos",
    time: "2 hr ago",
    severity: "low",
  },
  {
    icon: AlertTriangle,
    type: "Unregistered Outlet",
    product: "Artemether/Lumefantrine — Batch ART-2026-0023",
    location: "Aba, Abia",
    time: "3 hr ago",
    severity: "medium",
  },
];

const severityColors = {
  high: "text-red-400 bg-red-500/10",
  medium: "text-amber-400 bg-amber-500/10",
  low: "text-yellow-400 bg-yellow-500/10",
};

export default function AlertsFeed() {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-white">Live Alerts</h3>
          <p className="text-xs text-gray-500 mt-0.5">Suspicious activity feed</p>
        </div>
        <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full font-medium">
          {alerts.length} active
        </span>
      </div>
      <div className="space-y-3">
        {alerts.map((alert, i) => (
          <div
            key={i}
            className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-colors"
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${severityColors[alert.severity]}`}>
              <alert.icon className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-semibold text-white">{alert.type}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${severityColors[alert.severity]}`}>
                  {alert.severity}
                </span>
              </div>
              <p className="text-xs text-gray-400 truncate">{alert.product}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-gray-600">{alert.location}</span>
                <span className="text-[10px] text-gray-600">•</span>
                <span className="text-[10px] text-gray-600">{alert.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}