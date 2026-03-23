import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Factory, Ship, Warehouse, Store, User, ShieldCheck, AlertTriangle, TrendingUp, Package } from "lucide-react";

const CHAIN = [
  { icon: Factory,   stage: "Commissioned",       date: "14 Jan 2026", location: "Lagos — PharmaNig Plant A",  status: "ok",   detail: "Serial NG-PH-00041872 personalised. Batch AMX-2026-0341. Aggregated into Case C-0041." },
  { icon: Ship,      stage: "Port of Entry",       date: "28 Jan 2026", location: "Apapa Port, Lagos",          status: "ok",   detail: "Parent pallet PAL-0012 tapped by port operator. Customs cleared. Import event recorded." },
  { icon: Warehouse, stage: "Wholesale Transfer",  date: "03 Feb 2026", location: "Lagos — MedDist Wholesale", status: "ok",   detail: "De-aggregated from PAL-0012. Re-aggregated into distributor case C-D-0089 for onward transfer." },
  { icon: Store,     stage: "Retail Receipt",      date: "18 Mar 2026", location: "Onitsha, Anambra",           status: "warn", detail: "⚠ Product detected 480 km outside authorised Lagos distribution zone. Hold applied." },
  { icon: User,      stage: "Consumer Verify",     date: "—",           location: "Pending",                    status: "pending", detail: "Awaiting end-user tap. Recall notice will be shown if consumer scans this item." },
];

const STATUS_STYLE = {
  ok:      { dot: "bg-emerald-400", connector: "bg-emerald-500/20", icon: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" },
  warn:    { dot: "bg-amber-400 animate-pulse",   connector: "bg-amber-500/20",   icon: "bg-amber-500/10 border-amber-500/30 text-amber-400" },
  pending: { dot: "bg-gray-600",   connector: "bg-white/[0.04]",   icon: "bg-white/[0.04] border-white/[0.08] text-gray-600" },
};

export default function DigitalTwinPreview() {
  const [openIdx, setOpenIdx] = useState(null);

  return (
    <section className="py-24 px-6 bg-[#060B18] relative overflow-hidden">
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-teal-500/4 rounded-full blur-[120px]" />
      <div className="max-w-6xl mx-auto relative z-10">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          {/* Left: narrative */}
          <div>
            <span className="text-xs font-medium text-emerald-400 tracking-widest uppercase">Digital Twin</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3 mb-5">
              Every item has a complete story.
            </h2>
            <p className="text-gray-400 leading-relaxed mb-6">
              From the moment a consumer good is commissioned at the factory, every custody transfer, port receipt, wholesale handoff, and retail scan is written to an immutable chain-of-custody ledger. Not just "verified" — fully traced.
            </p>

            <div className="space-y-3">
              {[
                { icon: Package,      label: "Item → Case → Pallet → Shipment aggregation" },
                { icon: TrendingUp,   label: "Risk score computed at every scan event" },
                { icon: AlertTriangle,label: "Anomaly flags surfaced in real time" },
                { icon: ShieldCheck,  label: "Consumer sees authentic provenance, not raw IDs" },
              ].map(({ icon: Icon, label }, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-gray-400">
                  <Icon className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Right: chain-of-custody timeline */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-xs text-gray-500 font-mono">NG-TG-00041872</p>
                <p className="text-sm font-bold text-white">Premium Consumer Good · Batch TG-2026-0341</p>
              </div>
              <span className="text-[10px] font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2.5 py-1 rounded-full">
                HOLD
              </span>
            </div>

            <div className="space-y-0">
              {CHAIN.map((event, i) => {
                const styles = STATUS_STYLE[event.status];
                const Icon = event.icon;
                const isLast = i === CHAIN.length - 1;
                const isOpen = openIdx === i;

                return (
                  <div key={i} className="flex gap-3">
                    {/* Spine */}
                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border ${styles.icon}`}>
                        <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                      </div>
                      {!isLast && <div className={`w-px flex-1 my-1 ${styles.connector}`} />}
                    </div>

                    {/* Content */}
                    <div className={`pb-4 flex-1 min-w-0 ${isLast ? "pb-0" : ""}`}>
                      <button
                        onClick={() => setOpenIdx(isOpen ? null : i)}
                        aria-expanded={isOpen}
                        aria-label={`${event.stage} — ${isOpen ? "collapse" : "expand"} detail`}
                        className="w-full text-left group"
                      >
                        <div className="flex items-center justify-between">
                          <p className={`text-xs font-semibold ${event.status === "warn" ? "text-amber-400" : event.status === "pending" ? "text-gray-600" : "text-white"}`}>
                            {event.stage}
                          </p>
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ml-2 ${styles.dot}`} aria-hidden="true" />
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5 truncate">{event.location}</p>
                        <p className="text-[10px] text-gray-700 mt-0.5">{event.date}</p>
                      </button>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.p
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden text-[11px] text-gray-400 mt-2 leading-relaxed bg-white/[0.02] border border-white/[0.04] rounded-lg px-3 py-2"
                          >
                            {event.detail}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}