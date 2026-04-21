import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const PILLARS = [
  {
    title: "NTAG 424 DNA Secure Identity",
    body: "Every consumer unit gets a unique digital twin tied to secure-tag capabilities. This materially raises the cost of forgery versus static labels or plain QR, especially when SDM responses are verified on the server. We still assume determined attackers—see Security & trust on the home page for limits and our mitigation roadmap.",
    caps: [
      "Secure Dynamic Messaging (SDM) validation (roadmap: server-verified taps)",
      "Per-tap cryptographic authentication where enabled",
      "Replay and anomaly signals via scan ledger and policy rules",
      "Key versioning and rotation management",
    ],
  },
  {
    title: "GS1 EPCIS-Style Event Capture",
    body: "Each touchpoint writes an immutable business event — from factory commissioning through port receipt, wholesale transfer, retail receipt to end-user verification. Full parent-child aggregation for cases and pallets.",
    caps: [
      "Event-driven traceability ledger",
      "Aggregation and de-aggregation engine",
      "Ownership history and custody tracking",
      "Recall and quarantine state management",
    ],
  },
  {
    title: "Anomaly Detection & Diversion Signals",
    body: "Transform scan data into actionable intelligence. Suspicious-scan heat maps, repeat-scan alerts, and zone or route signals (where geography is supplied) support triage. Client-reported location can be spoofed—we treat geo as one signal among many, not proof of physical presence without corroboration.",
    caps: [
      "Real-time scan anomaly scoring",
      "Geographic diversion views (signal-based; corroboration on roadmap)",
      "Repeat-scan pattern detection",
      "Batch-level risk watchlists",
    ],
  },
  {
    title: "Case Management & Evidence Trail",
    body: "Turn intelligence alerts into operational action. Inspector workflows for verification, evidence capture, hold/quarantine recommendations, and escalation. Every action recorded in a tamper-evident audit trail.",
    caps: [
      "Inspector verification workflow",
      "Hold and quarantine triggers",
      "Evidentiary trail for prosecution",
      "Escalation and case management",
    ],
  },
];

const ADDITIONAL = [
  { title: "End-User Verification", body: "Lightweight web page from NDEF URL tap showing redacted provenance" },
  { title: "Parent-Child Aggregation", body: "One parent tap updates all linked items without storing history on tag" },
  { title: "Geo-Fence Monitoring", body: "Track products across authorised zones and flag route deviations" },
  { title: "Recall Management", body: "Instant recall propagation to all affected units in the chain" },
  { title: "Regulator Reporting", body: "Regulator-ready dashboards and export-ready compliance reports for any governed category" },
  { title: "Partner Onboarding", body: "Outlet registration, access control, and partner master data management" },
  { title: "Analytics & KPIs", body: "Operational scan analytics, throughput metrics, and SLA monitoring" },
  { title: "ERP / WMS Integration", body: "APIs for enterprise system integration at manufacturer and distributor level" },
];

export default function Solutions() {
  useEffect(() => {
    document.title = "Solutions | TraceGuard";
  }, []);

  return (
    <div className="min-h-screen bg-[#060B18]">
      <Navbar />
      <main id="main-content" tabIndex={-1} className="pt-28 pb-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Enforcement Infrastructure, Not Stickers
          </h1>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-14 max-w-3xl">
            A complete platform that helps regulators and enterprises move from reactive mop-up to targeted, evidence-led action across Nigeria&apos;s regulated consumer goods and supply chains.
          </p>

          <div className="space-y-14">
            {PILLARS.map((p) => (
              <section key={p.title}>
                <h3 className="text-xl font-bold text-white mb-3">{p.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed mb-5">{p.body}</p>
                <p className="text-xs font-semibold text-emerald-400/90 uppercase tracking-wider mb-3">
                  Key Capabilities
                </p>
                <ul className="space-y-2">
                  {p.caps.map((c) => (
                    <li key={c} className="text-sm text-gray-300 flex gap-2">
                      <span className="text-emerald-500 shrink-0">•</span>
                      {c}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <h2 className="text-xl font-bold text-white mt-16 mb-6">Additional Capabilities</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {ADDITIONAL.map((a) => (
              <div
                key={a.title}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4"
              >
                <h4 className="text-sm font-semibold text-white">{a.title}</h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{a.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 flex flex-wrap gap-4">
            <Link
              to="/Contact"
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-6 py-2.5 transition-colors"
            >
              Book a Demo
            </Link>
            <Link
              to="/Dashboard"
              className="inline-flex items-center justify-center rounded-full border border-emerald-500/40 text-emerald-400 text-sm font-medium px-6 py-2.5 hover:bg-emerald-500/10 transition-colors"
            >
              View Live Dashboard
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
