import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { RefreshCw, Map, FileText } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import NigeriaHeatmap from "@/components/risk/NigeriaHeatmap";
import DraftManager from "@/components/risk/DraftManager";
import BatchDetailModal from "@/components/risk/BatchDetailModal";
import usePullToRefresh from "@/hooks/usePullToRefresh.jsx";
import { base44 } from "@/api/base44Client";

export default function RiskDashboard() {
  const [tab, setTab] = useState("heatmap");
  const [selectedLocation, setSelectedLocation] = useState(null);
  useEffect(() => {
    document.title = "RiskDashboard | TraceSafe AI";
  }, []);

  const { data: batches = [], isLoading: loadingBatches, refetch: refetchBatches } = useQuery({
    queryKey: ["risk-batches"],
    queryFn: () => base44.entities.Batch.list("-created_date", 200),
  });

  const { data: alerts = [], isLoading: loadingAlerts, refetch: refetchAlerts } = useQuery({
    queryKey: ["risk-alerts"],
    queryFn: () => base44.entities.DiversionAlert.list("-created_date", 200),
  });

  const isLoading = loadingBatches || loadingAlerts;

  const stats = useMemo(() => {
    const openAlerts = alerts.filter((a) => a.status === "open");
    const highRisk = batches.filter((b) => (b.diversion_score || 0) >= 75).length;
    const mediumRisk = batches.filter((b) => {
      const s = b.diversion_score || 0;
      return s >= 40 && s < 75;
    }).length;
    const activeRecalls = batches.filter((b) => b.enforcement_status === "recalled").length;
    return {
      highRisk,
      mediumRisk,
      activeRecalls,
      openAlerts: openAlerts.length,
    };
  }, [batches, alerts]);

  const onPullRefresh = useCallback(async () => {
    await Promise.all([refetchBatches(), refetchAlerts()]);
  }, [refetchBatches, refetchAlerts]);

  const { containerRef, PullIndicator } = usePullToRefresh(onPullRefresh);

  const handleRefresh = () => {
    refetchBatches();
    refetchAlerts();
  };

  return (
    <div className="min-h-screen bg-[#060B18] flex flex-col">
      <Navbar />
      <div ref={containerRef} className="flex-1 pt-24 pb-8 px-4 sm:px-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <PullIndicator />
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Risk Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">
                Geospatial risk intelligence across Nigeria. Colour-coded by diversion score and alert frequency.
              </p>
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.04] px-4 py-2 text-xs font-medium text-gray-300 hover:text-white transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: "High Risk Batches", value: stats.highRisk },
              { label: "Medium Risk", value: stats.mediumRisk },
              { label: "Active Recalls", value: stats.activeRecalls },
              { label: "Open Alerts", value: stats.openAlerts },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4"
              >
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wide">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setTab("heatmap")}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-colors ${
                tab === "heatmap"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                  : "border border-white/[0.08] text-gray-500 hover:text-gray-300"
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              Risk Heatmap
            </button>
            <button
              type="button"
              onClick={() => setTab("drafts")}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-colors ${
                tab === "drafts"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                  : "border border-white/[0.08] text-gray-500 hover:text-gray-300"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Draft Reports
            </button>
          </div>

          {tab === "heatmap" ? (
            <NigeriaHeatmap
              batches={batches}
              alerts={alerts}
              isLoading={isLoading}
              onLocationSelect={setSelectedLocation}
            />
          ) : (
            <DraftManager />
          )}
        </div>
      </div>
      <Footer />

      <AnimatePresence>
        {selectedLocation && (
          <BatchDetailModal
            locationData={selectedLocation}
            onClose={() => setSelectedLocation(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
