import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Factory, Truck, Shield, UserRound } from "lucide-react";

const journeys = [
  {
    icon: Factory,
    title: "Manufacturer & line operator",
    problem: "Need every unit commissioned with a trusted identity and clean handoff to logistics.",
    flow: "Manufacture touchpoint → tag registry → batch live in dashboard.",
    outcome: "Auditable commissioning events and parent/child aggregation ready for downstream scans.",
    cta: { label: "Open Manufacture", to: "/touchpoints/manufacture" },
    color: "from-emerald-500/20 to-teal-500/10",
    border: "border-emerald-500/20",
  },
  {
    icon: Truck,
    title: "Warehouse & partner",
    problem: "Custody changes must be visible when goods move between importers, wholesalers, and retail.",
    flow: "Port → wholesale transfer → retail receipt with signed-in operators.",
    outcome: "EPCIS-style ledger rows you can explain to auditors and regulators.",
    cta: { label: "Wholesale transfer", to: "/touchpoints/wholesale-transfer" },
    color: "from-teal-500/20 to-cyan-500/10",
    border: "border-teal-500/20",
  },
  {
    icon: Shield,
    title: "Regulator & inspector",
    problem: "Turn suspicious scans into documented field action, not another dashboard-only alert.",
    flow: "Risk signals → Inspector NFC scan → inspection report and enforcement linkage.",
    outcome: "Severe alerts carry inspection metadata and case trace where your policy requires it.",
    cta: { label: "Inspector portal", to: "/InspectorPortal" },
    color: "from-cyan-500/20 to-blue-500/10",
    border: "border-cyan-500/20",
  },
  {
    icon: UserRound,
    title: "Consumer & public verify",
    problem: "End users need a fast authenticity answer without exposing sensitive supply-chain detail.",
    flow: "Consumer tap or demo verify → server registry outcome → optional incident report.",
    outcome: "Authentic / suspicious / unknown states driven by policy, not the label alone.",
    cta: { label: "End-user verify", to: "/touchpoints/end-user-verify" },
    color: "from-violet-500/20 to-indigo-500/10",
    border: "border-violet-500/20",
  },
];

export default function PersonaJourneys() {
  return (
    <section className="bg-[#060B18] py-24 border-t border-white/[0.06]" aria-labelledby="persona-journeys-heading">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <span className="text-xs font-medium text-cyan-400/90 tracking-widest uppercase">
            End-to-end stories
          </span>
          <h2
            id="persona-journeys-heading"
            className="text-3xl sm:text-4xl font-bold text-white mt-3 mb-4"
          >
            From first scan to enforcement touch
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Short journeys by role — each links into the live touchpoints in this demo app. Replace demo
            UIDs with your production tags when your backend is wired.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {journeys.map((j, i) => (
            <motion.article
              key={j.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className={`rounded-2xl border ${j.border} bg-gradient-to-br ${j.color} p-6 sm:p-7`}
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center shrink-0">
                  <j.icon className="w-5 h-5 text-white/90" aria-hidden />
                </div>
                <h3 className="text-lg font-semibold text-white leading-snug pt-1">{j.title}</h3>
              </div>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-0.5">
                    Problem
                  </dt>
                  <dd className="text-gray-400 leading-relaxed">{j.problem}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-0.5">
                    Flow
                  </dt>
                  <dd className="text-gray-300 leading-relaxed">{j.flow}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-0.5">
                    Outcome
                  </dt>
                  <dd className="text-gray-400 leading-relaxed">{j.outcome}</dd>
                </div>
              </dl>
              <Link
                to={j.cta.to}
                className="inline-flex mt-5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                {j.cta.label} →
              </Link>
            </motion.article>
          ))}
        </div>

        <p className="text-center mt-10">
          <Link
            to="/GettingStarted"
            className="text-sm text-gray-500 hover:text-emerald-400/90 underline underline-offset-2"
          >
            First successful scan checklist
          </Link>
        </p>
      </div>
    </section>
  );
}
