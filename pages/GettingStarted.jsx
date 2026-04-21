import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    title: "Configure backend",
    detail:
      "Set `VITE_API_PROVIDER` and either REST or Supabase env vars (see repository README). Run `seedDemoData` as admin if you need demo tags.",
    links: [{ label: "Enterprise brief", to: "/Enterprise" }],
  },
  {
    title: "Commission or simulate manufacture",
    detail: "Create a batch and link tag UIDs so the registry recognises your first unit.",
    links: [{ label: "Manufacture touchpoint", to: "/touchpoints/manufacture" }],
  },
  {
    title: "Record a custody or scan event",
    detail: "Add a port, wholesale, or retail event so the ledger has a second hop.",
    links: [
      { label: "Port of entry", to: "/touchpoints/port-of-entry" },
      { label: "Wholesale transfer", to: "/touchpoints/wholesale-transfer" },
      { label: "Retail receipt", to: "/touchpoints/retail-receipt" },
    ],
  },
  {
    title: "Verify as consumer or inspector",
    detail: "Tap a demo UID in Inspector or run end-user verify to see server-driven outcomes.",
    links: [
      { label: "Inspector portal", to: "/InspectorPortal" },
      { label: "End-user verify", to: "/touchpoints/end-user-verify" },
    ],
  },
  {
    title: "Triage risk",
    detail: "Open Risk dashboard and Enforcement to connect signals to holds and cases.",
    links: [
      { label: "Risk dashboard", to: "/RiskDashboard" },
      { label: "Enforcement", to: "/Enforcement" },
    ],
  },
];

export default function GettingStarted() {
  useEffect(() => {
    document.title = "Getting started | TraceGuard";
  }, []);

  return (
    <div className="min-h-screen bg-[#060B18]">
      <Navbar />

      <section className="pt-28 pb-20 px-6">
        <div className="max-w-2xl mx-auto">
          <Link
            to="/Home"
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-emerald-400 mb-8 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to home
          </Link>

          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            First successful path
          </h1>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-10">
            Checklist to go from empty tenant to a defensible demo story: commissioned tag, ledger event,
            verification, and enforcement visibility.
          </p>

          <ol className="space-y-8">
            {steps.map((step, i) => (
              <motion.li
                key={step.title}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                className="flex gap-4"
              >
                <div className="flex flex-col items-center shrink-0">
                  <span className="w-9 h-9 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-sm font-bold text-emerald-400">
                    {i + 1}
                  </span>
                  {i < steps.length - 1 && (
                    <span className="w-px flex-1 min-h-[2rem] bg-white/[0.08] mt-2" aria-hidden />
                  )}
                </div>
                <div className="pb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500/70 shrink-0" aria-hidden />
                    <h2 className="text-lg font-semibold text-white">{step.title}</h2>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed mb-3">{step.detail}</p>
                  <div className="flex flex-wrap gap-2">
                    {step.links.map((l) => (
                      <Link
                        key={l.to + l.label}
                        to={l.to}
                        className="text-xs font-medium text-emerald-400/90 hover:text-emerald-300 px-3 py-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/5"
                      >
                        {l.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </motion.li>
            ))}
          </ol>

          <p className="mt-12 text-xs text-gray-600 leading-relaxed border-t border-white/[0.06] pt-8">
            For schema and function contracts, keep <code className="text-gray-500">docs/BACKEND_API.md</code>{" "}
            and <code className="text-gray-500">docs/DATABASE.md</code> open alongside this checklist.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
