import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, BookOpen, Database, GitBranch, Server } from "lucide-react";
import { motion } from "framer-motion";

const ownAssets = [
  { what: "Client app (routes, UI, state)", where: "This repository" },
  { what: "Server behaviour (scan, commission, AI, seeds)", where: "`server/functions/`" },
  { what: "Domain entities and fields", where: "`docs/DATABASE.md` (export / ETL / reimplementation)" },
  {
    what: "NFT registry data (when enabled)",
    where: "PostgreSQL you provision (connection string in server secrets — not in the Vite bundle)",
  },
];

const differentiation = [
  "Adoption — sites, SKUs, scans, partners onboarded (anonymised roll-ups where allowed).",
  "Enforcement linkage — alerts and scans connected to seizures, holds, recalls, or case IDs.",
  "Time-to-recall — detect → contain → notify (targets and post-incident review).",
];

export default function Enterprise() {
  useEffect(() => {
    document.title = "Enterprise & portability | TraceSafe AI";
  }, []);

  return (
    <div className="min-h-screen bg-[#060B18]">
      <Navbar />

      <section className="pt-28 pb-20 px-6 relative">
        <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-[100px]" />

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
            className="flex items-center gap-2 text-teal-400/90 mb-4"
          >
            <BookOpen className="w-4 h-4" aria-hidden />
            <span className="text-xs font-medium tracking-widest uppercase">Procurement</span>
          </motion.div>

          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            Enterprise, portability, and proof
          </h1>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-8">
            Hosted backend dependency is real — comparable to other BaaS — but your application code,
            functions, and documented entities live in git. Optional Postgres for the NFT registry runs
            under <strong className="text-gray-300 font-semibold">your</strong> cloud account. Full
            technical depth: <code className="text-gray-500 text-xs">docs/ENTERPRISE_AND_PORTABILITY.md</code>.
          </p>

          <div className="rounded-2xl border border-white/[0.08] bg-[#0A0F1C] p-6 mb-10">
            <div className="flex items-center gap-2 text-emerald-400/90 mb-4">
              <GitBranch className="w-4 h-4" aria-hidden />
              <h2 className="text-sm font-semibold uppercase tracking-wider">What you own and can migrate</h2>
            </div>
            <ul className="space-y-3">
              {ownAssets.map((row) => (
                <li
                  key={row.what}
                  className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 text-sm border-b border-white/[0.06] last:border-0 pb-3 last:pb-0"
                >
                  <span className="text-gray-300">{row.what}</span>
                  <code className="text-xs text-gray-500 shrink-0">{row.where}</code>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 mb-10">
            <div className="flex items-center gap-2 text-cyan-400/90 mb-3">
              <Database className="w-4 h-4" aria-hidden />
              <h2 className="text-sm font-semibold uppercase tracking-wider">Ops store + NFT registry</h2>
            </div>
            <p className="text-gray-500 text-xs sm:text-sm leading-relaxed mb-4">
              Dual-store is <strong className="text-gray-400 font-medium">opt-in</strong>. Without Postgres
              URLs, NFT helpers return skipped/null and the product runs on ops entities only. When Postgres
              is configured, commission uses idempotent upserts; scan and enforcement remain driven by the
              primary entity store. See <code className="text-gray-500">docs/DATABASE.md</code> for{" "}
              <code className="text-gray-500">NFT_REGISTRY_SYNC_STRICT</code> and reconciliation patterns.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 mb-10">
            <div className="flex items-center gap-2 text-violet-300/90 mb-3">
              <Server className="w-4 h-4" aria-hidden />
              <h2 className="text-sm font-semibold uppercase tracking-wider">Differentiation: proof over depth</h2>
            </div>
            <p className="text-gray-500 text-xs sm:text-sm leading-relaxed mb-4">
              Lead sales conversations with evidence buyers can verify:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-400 space-y-2">
              {differentiation.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] p-5 mb-12">
            <p className="text-xs text-amber-100/90 leading-relaxed">
              <strong className="font-medium text-amber-200/95">Geographic depth:</strong> NAFDAC-aligned
              workflows are reference deployment language; the same authenticate → trace → enforce stack is
              framed for multi-region rollouts in the source doc.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-4 border-t border-white/[0.06]">
            <Link to="/Trust">
              <Button
                variant="outline"
                className="border-white/15 text-gray-200 hover:bg-white/[0.06] h-11 px-6 rounded-full w-full sm:w-auto"
              >
                Trust center
              </Button>
            </Link>
            <Link to="/Proof">
              <Button
                variant="outline"
                className="border-white/15 text-gray-200 hover:bg-white/[0.06] h-11 px-6 rounded-full w-full sm:w-auto"
              >
                Outcomes template
              </Button>
            </Link>
            <Link to="/Contact">
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white h-11 px-8 rounded-full gap-2 w-full sm:w-auto">
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
