import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Route, Gavel } from "lucide-react";
import { motion } from "framer-motion";
import OutcomeMetricsStrip from "@/components/landing/OutcomeMetricsStrip";

const THREE_LAYERS = [
  {
    icon: ShieldCheck,
    step: "01",
    label: "Authenticate",
    desc: "NTAG 424 DNA — cryptographic per-tap identity from factory to consumer; layered with server registry and anomaly signals (not “unclonable” magic).",
    color: "text-emerald-400",
    border: "border-emerald-500/20",
    bg: "bg-emerald-500/8",
  },
  {
    icon: Route,
    step: "02",
    label: "Trace",
    desc: "GS1 EPCIS 2.0 aggregation — item → case → pallet → shipment, with full custody transfer ledger across any regulated goods category.",
    color: "text-teal-400",
    border: "border-teal-500/20",
    bg: "bg-teal-500/8",
  },
  {
    icon: Gavel,
    step: "03",
    label: "Enforce",
    desc: "Regulator-grade incident response — anomaly scoring, batch holds, field inspection, and recall activation for any product category.",
    color: "text-red-400",
    border: "border-red-500/20",
    bg: "bg-red-500/8",
  },
];

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#060B18]">
      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-emerald-500/8 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-teal-500/6 rounded-full blur-[100px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-900/5 rounded-full blur-[150px]" />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
            <span className="text-xs font-medium text-emerald-400 tracking-wide uppercase">
              Operating System for Trusted Physical Goods
            </span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-6"
        >
          Authenticate.{" "}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-300 bg-clip-text text-transparent">
            Trace.
          </span>{" "}
          Enforce.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed"
        >
          Serialisation, GS1-style aggregation, scan intelligence, and enforcement
          workflows designed to improve measurable outcomes — partner adoption,
          alert-to-action traceability, and recall readiness — not just deeper dashboards.
          <span className="text-gray-500 block mt-3 text-base sm:text-lg">
            Deep regulatory fit where programmes like NAFDAC set the bar; the same stack
            extends to multi-region rollouts when you need global reach with local proof.
          </span>
        </motion.p>

        <OutcomeMetricsStrip />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Link to="/Contact">
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white h-12 px-8 rounded-full text-base font-medium gap-2">
              Book a Demo
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/Solutions">
            <Button
              variant="outline"
              className="bg-emerald-500 hover:bg-emerald-600 text-white h-12 px-8 rounded-full text-base font-medium gap-2">
            
              Explore Solutions
            </Button>
          </Link>
        </motion.div>

        {/* Three-layer story */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto"
        >
          {THREE_LAYERS.map((layer, i) => (
            <div
              key={i}
              className={`${layer.bg} border ${layer.border} rounded-2xl p-5 text-left backdrop-blur-sm`}
            >
              <div className="flex items-center justify-between mb-3">
                <layer.icon className={`w-5 h-5 ${layer.color}`} aria-hidden="true" />
                <span className={`text-[10px] font-mono font-bold ${layer.color} opacity-50`}>{layer.step}</span>
              </div>
              <p className={`text-sm font-bold ${layer.color} mb-1`}>{layer.label}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{layer.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}