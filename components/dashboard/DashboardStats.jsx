import React from "react";
import { ShieldCheck, AlertTriangle, Scan, Package } from "lucide-react";

const stats = [
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

export default function DashboardStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
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