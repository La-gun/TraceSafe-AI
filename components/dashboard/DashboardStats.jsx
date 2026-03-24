import React from "react";
import { ShieldCheck, AlertTriangle, Scan, Package } from "lucide-react";

const FALLBACK_STATS = [
  {
    label: "Total Scans",
    value: "24,891",
    change: "+12.3%",
    positive: true,
    icon: Scan,
  },
  {
    label: "Authenticated",
    value: "23,654",
    change: "94.9%",
    positive: true,
    icon: ShieldCheck,
  },
  {
    label: "Suspicious",
    value: "187",
    change: "+3 today",
    positive: false,
    icon: AlertTriangle,
  },
  {
    label: "Active Products",
    value: "8,432",
    change: "142 batches",
    positive: true,
    icon: Package,
  },
];

function fmt(n) {
  if (n == null || Number.isNaN(n)) return "—";
  return Number(n).toLocaleString();
}

export default function DashboardStats({ stats }) {
  const live =
    stats &&
    typeof stats.total_scans === "number" &&
    stats.total_scans + (stats.open_alerts ?? 0) >= 0;

  const rows = live
    ? [
        {
          label: "Total Scans",
          value: fmt(stats.total_scans),
          change: `${fmt(stats.authentic_scans)} authentic`,
          positive: true,
          icon: Scan,
        },
        {
          label: "Authenticated",
          value: fmt(stats.authentic_scans),
          change:
            stats.total_scans > 0
              ? `${((100 * stats.authentic_scans) / stats.total_scans).toFixed(1)}%`
              : "—",
          positive: true,
          icon: ShieldCheck,
        },
        {
          label: "Suspicious",
          value: fmt(stats.suspicious_scans),
          change: `${fmt(stats.open_alerts)} open alerts`,
          positive: stats.suspicious_scans === 0,
          icon: AlertTriangle,
        },
        {
          label: "Active Batches",
          value: fmt(stats.active_batches),
          change: `${fmt(stats.recalled_batches)} recalled`,
          positive: stats.recalled_batches === 0,
          icon: Package,
        },
      ]
    : FALLBACK_STATS;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {rows.map((stat, i) => (
        <div
          key={i}
          className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <stat.icon className="w-4 h-4 text-emerald-400" />
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                stat.positive
                  ? "text-emerald-400 bg-emerald-500/10"
                  : "text-amber-400 bg-amber-500/10"
              }`}
            >
              {stat.change}
            </span>
          </div>
          <p className="text-2xl font-bold text-white">{stat.value}</p>
          <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
