import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  OUTCOME_METRICS,
  OUTCOME_METRICS_DISCLAIMER,
  HERO_METRIC_IDS,
} from "@/data/outcomeMetrics";

const heroMetrics = HERO_METRIC_IDS.map((id) => OUTCOME_METRICS.find((m) => m.id === id)).filter(
  Boolean,
);

export default function OutcomeMetricsStrip() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, delay: 0.25 }}
      className="max-w-4xl mx-auto mb-10"
    >
      <p className="text-[10px] sm:text-xs font-medium text-emerald-400/80 tracking-widest uppercase mb-4">
        Design targets — plug in real numbers here
      </p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-left">
        {heroMetrics.map((m) => (
          <div
            key={m.id}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.02] px-3 py-3 sm:px-4 sm:py-4 backdrop-blur-sm"
          >
            <p className="text-lg sm:text-xl font-bold text-white tabular-nums tracking-tight">
              {m.heroValue}
            </p>
            <p className="text-[11px] sm:text-xs font-semibold text-gray-300 mt-1 leading-snug">
              {m.label}
            </p>
            <p className="text-[10px] text-gray-600 mt-1.5 leading-relaxed line-clamp-3 sm:line-clamp-none">
              {m.blurb}
            </p>
          </div>
        ))}
      </div>
      <p className="text-[10px] sm:text-[11px] text-gray-600 mt-4 leading-relaxed max-w-2xl mx-auto text-center px-2">
        {OUTCOME_METRICS_DISCLAIMER}{" "}
        <Link
          to="/Proof"
          className="text-emerald-500/90 hover:text-emerald-400 underline underline-offset-2"
        >
          Definitions &amp; methodology
        </Link>
      </p>
    </motion.div>
  );
}
