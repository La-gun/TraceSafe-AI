import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, MapPin, Repeat2, Clock, TrendingUp, Zap } from "lucide-react";

const SIGNALS = [
  {
    icon: MapPin,
    title: "Geographic Diversion",
    desc: "Product scanned 480 km outside its authorised Lagos zone — flagged within the same scan event.",
    score: 87,
    color: "text-red-400",
    bg: "bg-red-500/8",
    border: "border-red-500/20",
    bar: "bg-red-500",
  },
  {
    icon: Repeat2,
    title: "Repeat Scan Pattern",
    desc: "Same UID tapped 14 times across 3 states in 6 hours — statistically impossible for a legitimate product.",
    score: 94,
    color: "text-red-400",
    bg: "bg-red-500/8",
    border: "border-red-500/20",
    bar: "bg-red-500",
  },
  {
    icon: Clock,
    title: "Pre-Commission Scan",
    desc: "Consumer scan recorded before the official commissioning event — suggests clone or label re-use.",
    score: 99,
    color: "text-red-400",
    bg: "bg-red-500/8",
    border: "border-red-500/20",
    bar: "bg-red-500",
  },
  {
    icon: AlertTriangle,
    title: "Route Chain Break",
    desc: "Retail receipt event received before a wholesaler custody transfer was ever recorded.",
    score: 71,
    color: "text-amber-400",
    bg: "bg-amber-500/8",
    border: "border-amber-500/20",
    bar: "bg-amber-500",
  },
];

const STATS = [
  { label: "Anomalies Detected",   value: "1,284",  sub: "last 30 days" },
  { label: "Diversion Signals",    value: "47",     sub: "active" },
  { label: "Scans Analysed",       value: "312K",   sub: "this month" },
  { label: "Avg. Response Time",   value: "< 2s",   sub: "per scan" },
];

export default function AnomalyIntelPreview() {
  return (
    <section className="py-24 px-6 bg-[#060B18] relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-red-500/4 rounded-full blur-[100px]" />
      <div className="max-w-6xl mx-auto relative z-10">

        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-1.5 mb-4">
            <Zap className="w-3.5 h-3.5 text-red-400" aria-hidden="true" />
            <span className="text-xs font-medium text-red-400 tracking-wide uppercase">Anomaly Intelligence</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            A logbook tells you what happened.<br />
            <span className="text-red-400">An intelligence system tells you what's wrong.</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Every scan is scored in real time. Risk signals surface automatically — so NAFDAC field teams target inspections instead of running broad sweeps.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {STATS.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.07 }}
              className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 text-center"
            >
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-gray-400 font-medium mt-0.5">{stat.label}</p>
              <p className="text-[10px] text-gray-600 mt-0.5">{stat.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Signal cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SIGNALS.map((sig, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className={`${sig.bg} border ${sig.border} rounded-2xl p-5`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${sig.bg} border ${sig.border}`}>
                  <sig.icon className={`w-4 h-4 ${sig.color}`} aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className={`text-sm font-bold ${sig.color}`}>{sig.title}</p>
                    <div className="flex items-center gap-1">
                      <TrendingUp className={`w-3 h-3 ${sig.color}`} aria-hidden="true" />
                      <span className={`text-xs font-bold ${sig.color}`}>{sig.score}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">{sig.desc}</p>
                  <div className="mt-3 w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${sig.score}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.3 + i * 0.08 }}
                      className={`h-full rounded-full ${sig.bar}`}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}