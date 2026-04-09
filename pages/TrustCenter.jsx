import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Server,
  MapPin,
  Radar,
  Lock,
  ClipboardCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  TRUST_LIMITS,
  TRUST_TODAY,
  TRUST_ROADMAP,
  AI_GOVERNANCE_ITEMS,
} from "@/data/securityTrustContent";

const LIMIT_ICONS = [ShieldAlert, MapPin];
const TODAY_ICONS = [Server, ClipboardCheck, Radar];
const ROADMAP_ICONS = [Lock, MapPin, ShieldAlert];

export default function TrustCenter() {
  useEffect(() => {
    document.title = "Trust center | TraceSafe AI";
  }, []);

  return (
    <div className="min-h-screen bg-[#060B18]">
      <Navbar />

      <section className="pt-28 pb-20 px-6 relative">
        <div className="absolute top-1/4 right-1/4 w-[420px] h-[420px] bg-emerald-500/6 rounded-full blur-[100px]" />

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
            className="flex items-center gap-2 text-emerald-400/90 mb-4"
          >
            <ShieldCheck className="w-4 h-4" aria-hidden />
            <span className="text-xs font-medium tracking-widest uppercase">Trust center</span>
          </motion.div>

          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            Security, limits, and AI governance
          </h1>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-6">
            Procurement-friendly summary of what we claim today, what we do not, planned hardening,
            and how AI features stay subordinate to human enforcement. The same themes appear on the{" "}
            <Link
              to="/Home#security-trust-heading"
              className="text-emerald-400/90 hover:text-emerald-300 underline underline-offset-2"
            >
              home page Security &amp; trust
            </Link>{" "}
            section.
          </p>

          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 mb-12">
            <p className="text-xs text-gray-500 leading-relaxed">
              Repository references for legal and security review:{" "}
              <code className="text-gray-400">docs/ENTERPRISE_AND_PORTABILITY.md</code>,{" "}
              <code className="text-gray-400">docs/AI_COMPLIANCE_AND_TRUST.md</code>,{" "}
              <code className="text-gray-400">docs/DATABASE.md</code>.
            </p>
          </div>

          <h2 className="text-lg font-semibold text-amber-200/90 uppercase tracking-wider mb-4">
            What we do not claim
          </h2>
          <ul className="space-y-4 mb-12">
            {TRUST_LIMITS.map((item, i) => {
              const Icon = LIMIT_ICONS[i];
              return (
                <li key={item.title} className="flex gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-4">
                  <Icon className="w-5 h-5 text-amber-400/80 shrink-0 mt-0.5" aria-hidden />
                  <div>
                    <p className="text-white text-sm font-medium">{item.title}</p>
                    <p className="text-gray-500 text-xs leading-relaxed mt-1">{item.honest}</p>
                  </div>
                </li>
              );
            })}
          </ul>

          <h2 className="text-lg font-semibold text-emerald-400/90 uppercase tracking-wider mb-4">
            What the platform already enforces
          </h2>
          <ul className="grid sm:grid-cols-1 gap-4 mb-12">
            {TRUST_TODAY.map((item, i) => {
              const Icon = TODAY_ICONS[i];
              return (
                <li
                  key={item.title}
                  className="flex gap-3 rounded-xl border border-white/[0.08] bg-[#0A0F1C] p-4"
                >
                  <Icon className="w-5 h-5 text-emerald-400/80 shrink-0 mt-0.5" aria-hidden />
                  <div>
                    <p className="text-white text-sm font-medium">{item.title}</p>
                    <p className="text-gray-500 text-xs leading-relaxed mt-1">{item.text}</p>
                  </div>
                </li>
              );
            })}
          </ul>

          <h2 className="text-lg font-semibold text-cyan-400/90 uppercase tracking-wider mb-4">
            Mitigation roadmap
          </h2>
          <ul className="space-y-4 mb-12">
            {TRUST_ROADMAP.map((item, i) => {
              const Icon = ROADMAP_ICONS[i];
              return (
                <li key={item.title} className="flex gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <Icon className="w-5 h-5 text-cyan-400/70 shrink-0 mt-0.5" aria-hidden />
                  <div>
                    <p className="text-white text-sm font-medium">{item.title}</p>
                    <p className="text-gray-500 text-xs leading-relaxed mt-1">{item.text}</p>
                  </div>
                </li>
              );
            })}
          </ul>

          <h2 className="text-lg font-semibold text-violet-300/90 uppercase tracking-wider mb-4">
            AI governance
          </h2>
          <ul className="grid sm:grid-cols-2 gap-4 mb-14">
            {AI_GOVERNANCE_ITEMS.map((item) => (
              <li
                key={item.title}
                className="rounded-xl border border-violet-500/15 bg-violet-500/[0.04] p-4 text-xs sm:text-sm text-gray-500 leading-relaxed"
              >
                <span className="text-white font-medium block mb-1">{item.title}</span>
                {item.body}
              </li>
            ))}
          </ul>

          <div className="pt-10 border-t border-white/[0.06] text-center">
            <p className="text-sm text-gray-500 mb-5">
              Need a portability or dual-store walkthrough for enterprise?
            </p>
            <Link to="/Enterprise">
              <Button
                variant="outline"
                className="border-white/15 text-gray-200 hover:bg-white/[0.06] h-11 px-6 rounded-full mr-3 mb-3 sm:mb-0"
              >
                Enterprise brief
              </Button>
            </Link>
            <Link to="/Contact">
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white h-11 px-8 rounded-full gap-2">
                Contact
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
