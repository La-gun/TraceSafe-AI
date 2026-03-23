import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { day: "Mon", authentic: 3200, suspicious: 12 },
  { day: "Tue", authentic: 3800, suspicious: 18 },
  { day: "Wed", authentic: 3100, suspicious: 8 },
  { day: "Thu", authentic: 4200, suspicious: 24 },
  { day: "Fri", authentic: 3600, suspicious: 15 },
  { day: "Sat", authentic: 2100, suspicious: 32 },
  { day: "Sun", authentic: 1800, suspicious: 9 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0A0F1C] border border-white/10 rounded-lg p-3 text-xs">
        <p className="text-gray-400 mb-1">{label}</p>
        <p className="text-emerald-400">Authentic: {payload[0].value}</p>
        <p className="text-amber-400">Suspicious: {payload[1].value}</p>
      </div>
    );
  }
  return null;
};

export default function ScanChart() {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold text-white">Scan Activity</h3>
          <p className="text-xs text-gray-500 mt-0.5">Last 7 days</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs text-gray-500">Authentic</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-xs text-gray-500">Suspicious</span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorAuth" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorSus" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#6B7280", fontSize: 11 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#6B7280", fontSize: 11 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="authentic"
            stroke="#10B981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorAuth)"
          />
          <Area
            type="monotone"
            dataKey="suspicious"
            stroke="#F59E0B"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorSus)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}