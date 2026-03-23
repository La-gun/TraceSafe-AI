import React, { useEffect } from "react";
import TouchpointStageLayout from "@/components/touchpoints/TouchpointStageLayout";

const RESULTS = [
  { title: "Authentic", subtitle: "Tag verified, authorised chain confirmed, no recall" },
  { title: "Suspicious", subtitle: "Chain incomplete, geo mismatch, or repeat scan detected" },
  { title: "Counterfeit Alert", subtitle: "Cryptographic validation failed or tag cloning detected" },
  { title: "Recalled", subtitle: "Batch subject to active recall — do not use" },
];

export default function EndUserVerify() {
  useEffect(() => {
    document.title = "touchpoints | TraceSafe AI";
  }, []);

  return (
    <TouchpointStageLayout
      title="End-User Verify"
      intro="The final moment of truth. A single tap by the end user — patient, healthcare worker, or consumer — confirms authenticity and shows whether the product followed an authorised route from manufacturer to retail."
      highlights={[
        { line1: "One tap confirms authenticity", line2: "No app download — works on any NFC phone" },
      ]}
      prev={{ to: "/touchpoints/retail-receipt", label: "Retail Receipt" }}
      sections={[
        {
          heading: "NFC Tap Verification",
          body: "The end user taps the product tag with any standard NFC-enabled smartphone — no app download required. The NDEF URL opens a secure, lightweight web page that is loaded from the backend in real time.",
        },
        {
          heading: "Cryptographic Authentication",
          body: "The Secure Dynamic Messaging (SDM) payload is validated server-side against the registered tag identity. Anti-cloning and replay detection checks run automatically — confirming the tag has not been duplicated or replayed.",
        },
        {
          heading: "Redacted Audit Trail",
          body: "The end user sees a clean, redacted provenance summary: manufacturer, batch, authorised import status, and supply chain stage confirmations. Sensitive commercial route details are hidden — only trust-relevant signals are shown.",
        },
        {
          heading: "Anomaly Check Before Display",
          body: "Before rendering the result, the system checks for recall status, suspicious scan patterns, first-scan state, and authorised chain continuity. If any check fails, the user receives a clear warning and guidance.",
        },
      ]}
      children={
        <div className="mb-12">
          <h2 className="text-lg font-bold text-white mb-4">Possible Verification Results</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {RESULTS.map((r) => (
              <div
                key={r.title}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4"
              >
                <p className="text-sm font-semibold text-white">{r.title}</p>
                <p className="text-xs text-gray-500 mt-1">{r.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      }
      capabilities={[
        { title: "NFC Tap Result", subtitle: "Instant authentication in the field" },
        { title: "Healthcare Verification", subtitle: "Nurses and pharmacists verify at point of care" },
      ]}
      finalCta={{
        title: "Ready to see the full platform in action?",
        subtitle: "Book a demo to see a live end-to-end traceability walkthrough.",
        href: "/Contact",
        buttonLabel: "Book a Demo",
      }}
    />
  );
}
