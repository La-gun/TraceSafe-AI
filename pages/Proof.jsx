import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, ClipboardList } from "lucide-react";
import { motion } from "framer-motion";
import {
  OUTCOME_METRICS,
  OUTCOME_METRICS_DISCLAIMER,
} from "@/data/outcomeMetrics";

export default function Proof() {
  return (
    <div className="min-h-screen bg-[#060B18]">
      <Navbar />

      <section className="pt-28 pb-20 px-6 relative">
        <div className="absolute top-1/4 left-1/4 w-[480px] h-[480px] bg-emerald-500/6 rounded-full blur-[100px]" />

        <div className="max-w-3xl mx-auto relative z-10">
          <Link
            to="/Home"
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-emerald-400 mb-8 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to home
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <div className="flex items-center gap-2 text-emerald-400/90 mb-4">
              <ClipboardList className="w-4 h-4" aria-hidden />
              <span className="text-xs font-medium tracking-widest uppercase">
                Outcomes one-pager
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
              Metrics we design programmes around
            </h1>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-6">
              Enterprise buyers should see <strong className="text-gray-300 font-semibold">evidence</strong>, not
              only feature depth. The table below is a <strong className="text-gray-300 font-semibold">template</strong>:
              replace placeholders with numbers your counsel and customers allow you to publish.
            </p>
            <div className="rounded-2xl border border-amber-500/25 bg-amber-500/[0.06] px-4 py-3 mb-12">
              <p className="text-xs text-amber-100/90 leading-relaxed">{OUTCOME_METRICS_DISCLAIMER}</p>
            </div>
          </motion.div>

          <ul className="space-y-6">
            {OUTCOME_METRICS.map((m, i) => (
              <motion.li
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.08 * i }}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 mb-3">
                  <h2 className="text-lg font-semibold text-white">{m.label}</h2>
                  <p className="text-2xl font-bold text-emerald-400 tabular-nums shrink-0">
                    {m.heroValue}
                  </p>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed mb-3">{m.blurb}</p>
                <p className="text-xs text-gray-500 leading-relaxed border-t border-white/[0.06] pt-3">
                  <span className="text-gray-600 font-medium uppercase tracking-wider text-[10px]">
                    Methodology note —{" "}
                  </span>
                  {m.detail}
                </p>
              </motion.li>
            ))}
          </ul>

          <div className="mt-14 pt-10 border-t border-white/[0.06] text-center">
            <p className="text-sm text-gray-500 mb-5">
              Ready to map these to your deployment or pilot?
            </p>
            <Link to="/Contact">
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white h-11 px-8 rounded-full gap-2">
                Book a demo
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
