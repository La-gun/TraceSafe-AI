import React from "react";
import { AlertTriangle, Search, ShieldX, CheckCircle, Clock } from "lucide-react";

const STAT_DEFS = [
  {
    key: "pending_review",
    label: "Pending Review",
    icon: Clock,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  {
    key: "under_investigation",
    label: "Under Investigation",
    icon: Search,
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
  },
  {
    key: "quarantine",
    label: "Quarantine",
    icon: AlertTriangle,
    color: "text-orange-400",
    bg: "bg-orange-500/10 border-orange-500/20",
  },
  {
    key: "verified_counterfeit",
    label: "Verified Counterfeit",
    icon: ShieldX,
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/20",
  },
  {
    key: "cleared",
    label: "Cleared",
    icon: CheckCircle,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
];

export default function IncidentStats({ reports }) {
  const total = reports.length;
  const counts = Object.fromEntries(
    STAT_DEFS.map((s) => [s.key, reports.filter((r) => r.incident_status === s.key).length])
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-2">
      {/* Total */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl px-4 py-3">
        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Total Reports</p>
        <p className="text-2xl font-bold text-white">{total}</p>
      </div>
      {STAT_DEFS.map(({ key, label, icon: Icon, color, bg }) => (
        <div key={key} className={`border rounded-2xl px-4 py-3 ${bg}`}>
          <div className="flex items-center gap-1.5 mb-1">
            <Icon className={`w-3 h-3 ${color}`} aria-hidden="true" />
            <p className={`text-[10px] uppercase tracking-wider font-medium ${color}`}>{label}</p>
          </div>
          <p className={`text-2xl font-bold ${color}`}>{counts[key] ?? 0}</p>
        </div>
      ))}
    </div>
  );
}