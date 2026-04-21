import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { SECTORS } from "@/data/sectors";
import { Pill, Wine, Wheat, Cpu, Package, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const ICON_MAP = { Pill, Wine, Wheat, Cpu, Package };

export default function Sectors() {
  useEffect(() => {
    document.title = "Sectors | TraceGuard";
  }, []);

  useEffect(() => {
    const id = window.location.hash.replace(/^#/, "");
    if (!id) return;
    const run = () =>
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    requestAnimationFrame(() => requestAnimationFrame(run));
  }, []);

  return (
    <div className="min-h-screen bg-[#060B18]">
      <Navbar />

      <section className="pt-28 pb-20 px-6">
        <div className="max-w-3xl mx-auto mb-14">
          <Link
            to="/Home"
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-emerald-400 mb-8 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to home
          </Link>
          <p className="text-xs font-medium text-emerald-400 tracking-widest uppercase mb-3">
            Sectors
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            Regulated supply chains
          </h1>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
            Global categories with local regulatory depth — Nigeria and NAFDAC-aligned workflows are our
            reference template, not a hard ceiling on deployment geography.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-12">
          {SECTORS.map((sector, i) => {
            const Icon = ICON_MAP[sector.icon] || Package;
            return (
              <motion.article
                key={sector.id}
                id={sector.id}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
                className="scroll-mt-28 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 sm:p-8"
              >
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <Icon className="w-6 h-6 text-emerald-400 shrink-0" aria-hidden />
                    <h2 className="text-xl font-semibold text-white">{sector.name}</h2>
                  </div>
                  <span className="text-[10px] font-medium text-emerald-400/70 bg-emerald-500/10 px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0">
                    {sector.tag}
                  </span>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed mb-5">{sector.desc}</p>
                <div className="mb-5">
                  <h3 className="text-[10px] font-semibold uppercase tracking-wider text-gray-600 mb-2">
                    Typical journey
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{sector.journey}</p>
                </div>
                <div>
                  <h3 className="text-[10px] font-semibold uppercase tracking-wider text-gray-600 mb-2">
                    Platform fit
                  </h3>
                  <ul className="list-disc list-inside text-sm text-gray-500 space-y-1.5">
                    {sector.differentiators.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                </div>
              </motion.article>
            );
          })}
        </div>

        <p className="text-center mt-14 text-sm text-gray-500">
          <Link to="/Solutions" className="text-emerald-400/90 hover:text-emerald-300 underline underline-offset-2">
            Full solutions narrative
          </Link>
        </p>
      </section>

      <Footer />
    </div>
  );
}
