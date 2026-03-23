import React, { useState } from "react";
import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";
import DiversionAlerts from "../components/enforcement/DiversionAlerts";
import InspectionReportForm from "../components/enforcement/InspectionReportForm";
import BatchStatusPanel from "../components/enforcement/BatchStatusPanel";
import { Shield, AlertTriangle, FileText, Package, Smartphone } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import usePullToRefresh from "@/hooks/usePullToRefresh.jsx";
import { useQueryClient } from "@tanstack/react-query";

const TABS = [
  { id: "alerts",     label: "Diversion Alerts",    icon: AlertTriangle },
  { id: "report",     label: "Inspection Report",   icon: FileText },
  { id: "batch",      label: "Batch Status",        icon: Package },
];

export default function Enforcement() {
  const [activeTab, setActiveTab] = useState("alerts");
  const [prefillAlert, setPrefillAlert] = useState(null);
  const queryClient = useQueryClient();
  const { containerRef, PullIndicator } = usePullToRefresh(
    () => queryClient.invalidateQueries()
  );

  const handleStartInspection = (alert) => {
    setPrefillAlert(alert);
    setActiveTab("report");
  };

  const handleReportSubmitted = () => {
    setPrefillAlert(null);
    setActiveTab("alerts");
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#060B18] overflow-y-auto">
      <PullIndicator />
      <Navbar />

      {/* Header */}
      <section className="pt-32 pb-10 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[500px] h-[300px] bg-red-500/4 rounded-full blur-[120px]" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-red-400 tracking-widest uppercase">Restricted Module</span>
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Enforcement Console</h1>
            </div>
          </div>
          <p className="text-gray-400 max-w-2xl text-sm leading-relaxed mb-5">
            Authorised NAFDAC inspectors only. Use this module to act on diversion alerts, submit field inspection reports with photographic evidence, and manage the quarantine or hold status of suspect product batches.
          </p>
          <Link to="/InspectorPortal"
            className="inline-flex items-center gap-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 text-sm font-medium px-5 py-2.5 rounded-full transition-all">
            <Smartphone className="w-4 h-4" />
            Open Mobile Inspector Portal
          </Link>
        </div>
      </section>

      {/* Tabs */}
      <div className="px-6 mb-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-2 flex-wrap">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                aria-label={`Switch to ${tab.label} tab`}
                aria-pressed={activeTab === tab.id}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400"
                    : "border border-white/[0.06] text-gray-500 hover:text-gray-300 hover:border-white/[0.12]"
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" aria-hidden="true" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {activeTab === "alerts" && (
              <DiversionAlerts onStartInspection={handleStartInspection} />
            )}
            {activeTab === "report" && (
              <InspectionReportForm
                prefillAlert={prefillAlert}
                onClose={() => { setPrefillAlert(null); }}
                onSubmitted={handleReportSubmitted}
              />
            )}
            {activeTab === "batch" && (
              <BatchStatusPanel />
            )}
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}