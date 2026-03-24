import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Route, Brain, Gavel } from "lucide-react";

const layers = [
  {
    icon: ShieldCheck,
    title: "Authentication",
    what: "Per-product authenticity check",
    why: "Raises the bar versus static labels and QR-only links; strongest when combined with server checks and secure-tag crypto (see Security & trust).",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: Route,
    title: "Traceability",
    what: "Touchpoint ledger from production to end user",
    why: "Improves route visibility, recall readiness, and accountability",
    color: "from-teal-500 to-cyan-500",
  },
  {
    icon: Brain,
    title: "Intelligence",
    what: "Suspicious-scan heat maps, repeat-scan alerts, diversion signals",
    why: "Target inspections instead of relying only on broad sweeps",
    color: "from-cyan-500 to-blue-500",
  },
  {
    icon: Gavel,
    title: "Enforcement",
    what: "Case management, hold/quarantine triggers, evidentiary trail",
    why: "Turn alerts into operational action with better auditability",
    color: "from-blue-500 to-indigo-500",
  },
];

export default function ValueLayers() {
  return (
    <section className="bg-[#0A0F1C] py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-xs font-medium text-emerald-400 tracking-widest uppercase">
            Core Value Proposition
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3 mb-4">
            Four Layers of Protection
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Not just tags — a complete enforcement infrastructure that moves NAFDAC
            from reactive mop-up to targeted, evidence-led field action.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {layers.map((layer, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative group overflow-hidden"
            >
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8 h-full hover:border-white/[0.12] transition-all duration-500">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${layer.color} bg-opacity-10 flex items-center justify-center mb-6`}
                  style={{ background: `linear-gradient(135deg, rgba(16,185,129,0.15), rgba(20,184,166,0.15))` }}
                >
                  <layer.icon className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{layer.title}</h3>
                <p className="text-emerald-400/80 text-sm font-medium mb-2">{layer.what}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{layer.why}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}