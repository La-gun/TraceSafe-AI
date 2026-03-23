import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ArrowRight } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

/**
 * Shared layout for supply-chain stage pages (mirrors verify-track-guard.base44.app touchpoints).
 */
export default function TouchpointStageLayout({
  title,
  intro,
  highlights = [],
  sections = [],
  capabilities = [],
  prev,
  next,
  nextLinkLabel = "Next Stage",
  finalCta,
  children,
}) {
  return (
    <div className="min-h-screen bg-[#060B18] flex flex-col">
      <Navbar />
      <main id="main-content" tabIndex={-1} className="flex-1 pt-24 pb-8 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <Link
            to="/Home"
            className="inline-flex items-center gap-1 text-xs text-emerald-400/90 hover:text-emerald-300 mb-6 transition-colors"
          >
            ← Back to Platform Overview
          </Link>

          <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
            {prev ? (
              <Link
                to={prev.to}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                ← {prev.label}
              </Link>
            ) : (
              <span />
            )}
            {next && !finalCta && (
              <Link
                to={next.to}
                className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                {nextLinkLabel} →
              </Link>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">{title}</h1>
          <p className="text-gray-400 text-sm leading-relaxed mb-8">{intro}</p>

          {highlights.length > 0 && (
            <div className="grid sm:grid-cols-2 gap-3 mb-12">
              {highlights.map((h, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] px-4 py-3"
                >
                  <p className="text-sm font-semibold text-emerald-300">{h.line1}</p>
                  <p className="text-xs text-gray-500 mt-1">{h.line2}</p>
                </div>
              ))}
            </div>
          )}

          <h2 className="text-lg font-bold text-white mb-6">How It Works</h2>
          <div className="space-y-8 mb-12">
            {sections.map((s, i) => (
              <div key={i}>
                <h3 className="text-base font-semibold text-white mb-2">{s.heading}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>

          {capabilities.length > 0 && (
            <>
              <h2 className="text-lg font-bold text-white mb-4">Key Capabilities at This Stage</h2>
              <div className="grid sm:grid-cols-2 gap-4 mb-10">
                {capabilities.map((c, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4"
                  >
                    <p className="text-sm font-semibold text-emerald-400">{c.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{c.subtitle}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {children}

          {next && !finalCta && (
            <Link
              to={next.to}
              className="block rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 hover:bg-emerald-500/15 transition-colors group"
            >
              <p className="text-xs font-medium text-emerald-400/80 mb-1">{nextLinkLabel}</p>
              <p className="text-base font-semibold text-white flex items-center gap-2">
                {next.title}
                <ArrowRight className="w-4 h-4 opacity-60 group-hover:translate-x-0.5 transition-transform" />
              </p>
              <p className="text-xs text-gray-500 mt-2">{next.subtitle}</p>
            </Link>
          )}

          {finalCta && (
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 text-center">
              <p className="text-sm font-semibold text-white mb-1">{finalCta.title}</p>
              <p className="text-xs text-gray-500 mb-4">{finalCta.subtitle}</p>
              {finalCta.href && (
                <Link
                  to={finalCta.href}
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-6 py-2.5 transition-colors"
                >
                  {finalCta.buttonLabel}
                  <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
