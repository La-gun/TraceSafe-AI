import React from "react";
import { motion } from "framer-motion";
import { X, AlertTriangle, ShieldCheck, ShieldX, MapPin } from "lucide-react";

const STATUS_CFG = {
  recalled:   { icon: ShieldX,     color: "text-red-400",     bg: "bg-red-500/10 border-red-500/30",     label: "Recalled" },
  hold:       { icon: AlertTriangle,color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/30", label: "Hold" },
  quarantine: { icon: AlertTriangle,color: "text-orange-400",  bg: "bg-orange-500/10 border-orange-500/30",label: "Quarantine" },
  active:     { icon: ShieldCheck,  color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30",label: "Active" },
  cleared:    { icon: ShieldCheck,  color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30",label: "Cleared" },
};

function riskColor(score) {
  if (score >= 75) return { text: "text-red-400",    bar: "bg-red-500",    label: "High" };
  if (score >= 40) return { text: "text-amber-400",  bar: "bg-amber-500",  label: "Med" };
  return               { text: "text-emerald-400", bar: "bg-emerald-500", label: "Low" };
}

export default function BatchDetailModal({ locationData, onClose }) {
  const { state, batches, alertCount, maxScore } = locationData;
  const risk = riskColor(maxScore || 0);

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
      />

      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 60 }}
        transition={{ type: "spring", damping: 26, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-[#0D1424] border-t border-white/[0.08] rounded-t-3xl max-h-[80vh] overflow-hidden flex flex-col"
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-white/[0.10]" />
        </div>

        {/* Header */}
        <div className="px-5 py-3 flex items-center justify-between border-b border-white/[0.06] shrink-0">
          <div className="flex items-center gap-2.5">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <div>
              <p className="text-sm font-bold text-white">{state}</p>
              <p className="text-[10px] text-gray-500">
                {batches.length} batch{batches.length !== 1 ? "es" : ""} · {alertCount} open alert{alertCount !== 1 ? "s" : ""} · Max risk score <span className={risk.text}>{maxScore}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-gray-500 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Batch list */}
        <div className="overflow-y-auto flex-1">
          {batches.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm">No batch details available.</div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {batches.map((batch) => {
                const sc = STATUS_CFG[batch.enforcement_status] || STATUS_CFG.active;
                const StatusIcon = sc.icon;
                const r = riskColor(batch.diversion_score || 0);

                return (
                  <div key={batch.id} className="px-5 py-4 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white truncate">{batch.product_name}</p>
                        <p className="text-[11px] text-gray-500 font-mono">{batch.batch_number}</p>
                        <p className="text-[10px] text-gray-600 mt-0.5">{batch.manufacturer_name}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border shrink-0 ${sc.bg} ${sc.color}`}>
                        <StatusIcon className="w-2.5 h-2.5" />
                        {sc.label}
                      </span>
                    </div>

                    {/* Diversion score bar */}
                    <div className="flex items-center gap-3 mb-3">
                      <p className="text-[10px] text-gray-600 uppercase tracking-wider shrink-0">Risk</p>
                      <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${r.bar}`} style={{ width: `${batch.diversion_score || 0}%` }} />
                      </div>
                      <span className={`text-xs font-bold w-6 text-right ${r.text}`}>{batch.diversion_score || 0}</span>
                      <span className={`text-[10px] font-medium ${r.text}`}>{r.label}</span>
                    </div>

                    {/* Anomaly flags */}
                    {batch.anomaly_flags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {batch.anomaly_flags.map((flag) => (
                          <span key={flag} className="text-[9px] font-medium bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded-full">
                            {flag.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Meta */}
                    <div className="grid grid-cols-3 gap-x-3 gap-y-1">
                      {[
                        ["Stage",   batch.supply_chain_stage?.replace(/_/g, " ") || "—"],
                        ["Scans",   batch.total_scan_count ?? "—"],
                        ["Expiry",  batch.expiry_date || "—"],
                      ].map(([k, v]) => (
                        <div key={k}>
                          <p className="text-[9px] text-gray-600 uppercase">{k}</p>
                          <p className="text-[11px] text-gray-300 capitalize">{v}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}