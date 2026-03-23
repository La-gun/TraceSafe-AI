import React from "react";
import Navbar from "../components/landing/Navbar";
import DashboardStats from "../components/dashboard/DashboardStats";
import ScanChart from "../components/dashboard/ScanChart";
import AlertsFeed from "../components/dashboard/AlertsFeed";
import RecentEvents from "../components/dashboard/RecentEvents";
import RegionMap from "../components/dashboard/RegionMap";
import usePullToRefresh from "@/hooks/usePullToRefresh.jsx";
import { useQueryClient } from "@tanstack/react-query";

export default function Dashboard() {
  const queryClient = useQueryClient();
  const { containerRef, PullIndicator } = usePullToRefresh(
    () => queryClient.invalidateQueries()
  );

  return (
    <div className="min-h-screen bg-[#060B18]">
      <Navbar />
      <div ref={containerRef} className="pt-24 pb-16 px-4 sm:px-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <PullIndicator />
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
              <span className="text-xs font-medium text-emerald-400 tracking-wide uppercase">
                Live Demo
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Regulator Intelligence Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              NAFDAC regulator view — anomaly signals, diversion alerts, and field intelligence across all active batches
            </p>
          </div>

          {/* Actor entry strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            {[
              { label: "NAFDAC Regulator", sub: "Alerts, recalls & enforcement", color: "text-red-400", bg: "bg-red-500/8 border-red-500/20", dot: "bg-red-400" },
              { label: "Inspector (Field)", sub: "Open mobile portal for NFC scans", color: "text-amber-400", bg: "bg-amber-500/8 border-amber-500/20", dot: "bg-amber-400" },
              { label: "Manufacturer / Distributor", sub: "Batch status & custody tracking", color: "text-emerald-400", bg: "bg-emerald-500/8 border-emerald-500/20", dot: "bg-emerald-400" },
            ].map((actor, i) => (
              <div key={i} className={`flex items-center gap-3 border rounded-xl px-4 py-3 ${actor.bg}`}>
                <div className={`w-2 h-2 rounded-full shrink-0 ${actor.dot}`} aria-hidden="true" />
                <div>
                  <p className={`text-xs font-semibold ${actor.color}`}>{actor.label}</p>
                  <p className="text-[10px] text-gray-500">{actor.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <DashboardStats />

          {/* Main grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
            <div className="lg:col-span-2">
              <ScanChart />
            </div>
            <div>
              <RegionMap />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            <AlertsFeed />
            <RecentEvents />
          </div>
        </div>
      </div>
    </div>
  );
}