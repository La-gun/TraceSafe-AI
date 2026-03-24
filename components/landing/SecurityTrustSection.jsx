import React from "react";
import { motion } from "framer-motion";
import {
  ShieldAlert,
  Server,
  MapPin,
  Radar,
  Lock,
  ClipboardCheck,
} from "lucide-react";

const LIMITS = [
  {
    icon: ShieldAlert,
    title: "Tag copying and replay",
    honest:
      "Standard NFC can be copied; even secure tags raise the bar but are not a magic “unclonable” guarantee against determined attackers.",
  },
  {
    icon: MapPin,
    title: "Client-reported location",
    honest:
      "Latitude, longitude, or “state” from a phone or browser can be spoofed. They are useful signals for analytics—not standalone proof of physical presence.",
  },
];

const TODAY = [
  {
    icon: Server,
    title: "Authoritative registry & ledger",
    text: "Scans are evaluated against the live tag and batch record on the server. Unregistered tags, recalls, expiry, and policy state drive outcomes—not the sticker alone.",
  },
  {
    icon: ClipboardCheck,
    title: "Authenticated operators",
    text: "Inspector and partner flows require signed-in users so scan and inspection events tie to an account for audit and case work.",
  },
  {
    icon: Radar,
    title: "Behavioural and policy signals",
    text: "Repeat scans, suspicious patterns, and zone rules (where geography is supplied) feed diversion intelligence. We treat these as triage signals, not court-grade geolocation proof.",
  },
];

const ROADMAP = [
  {
    icon: Lock,
    title: "Cryptographic tap verification",
    text: "Server-side validation of secure-tag responses (e.g. SDM / challenge–response) so taps must prove fresh, key-backed answers—not just replay static NDEF.",
  },
  {
    icon: MapPin,
    title: "Corroborated location trust",
    text: "Fuse coarse network hints, trusted time, and—where appropriate—device integrity (Play Integrity / App Attest) and supervised inspector hardware to raise confidence in geo signals.",
  },
  {
    icon: ShieldAlert,
    title: "Multi-source agreement",
    text: "Optional alignment between commissioning data, optional NFT-registry binding, and independent scanner corroboration to flag cloned or inconsistent tags.",
  },
];

export default function SecurityTrustSection() {
  return (
    <section
      className="bg-[#060B18] py-24 border-t border-white/[0.06]"
      aria-labelledby="security-trust-heading"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <span className="text-xs font-medium text-amber-400/90 tracking-widest uppercase">
            Security &amp; trust
          </span>
          <h2
            id="security-trust-heading"
            className="scroll-mt-24 text-3xl sm:text-4xl font-bold text-white mt-3 mb-4"
          >
            Honest limits, layered defence
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            TraceSafe is stronger than static QR-only labelling, but no field system should
            overclaim. Below is what we acknowledge, what the stack already uses for
            decisions today, and how we plan to harden trust over time.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-6"
          >
            <h3 className="text-sm font-semibold text-amber-200/90 uppercase tracking-wider mb-4">
              What we do not claim
            </h3>
            <ul className="space-y-5">
              {LIMITS.map((item) => (
                <li key={item.title} className="flex gap-3">
                  <item.icon
                    className="w-5 h-5 text-amber-400/80 shrink-0 mt-0.5"
                    aria-hidden
                  />
                  <div>
                    <p className="text-white text-sm font-medium">{item.title}</p>
                    <p className="text-gray-500 text-xs leading-relaxed mt-1">
                      {item.honest}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 lg:col-span-2"
          >
            <h3 className="text-sm font-semibold text-emerald-400/90 uppercase tracking-wider mb-4">
              What the platform already enforces
            </h3>
            <ul className="grid sm:grid-cols-3 gap-6">
              {TODAY.map((item) => (
                <li key={item.title} className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <item.icon className="w-5 h-5 text-emerald-400/80 shrink-0" aria-hidden />
                    <p className="text-white text-sm font-medium leading-snug">{item.title}</p>
                  </div>
                  <p className="text-gray-500 text-xs leading-relaxed">{item.text}</p>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="rounded-2xl border border-white/[0.06] bg-[#0A0F1C] p-6 sm:p-8"
        >
          <h3 className="text-sm font-semibold text-cyan-400/90 uppercase tracking-wider mb-2">
            Mitigation roadmap
          </h3>
          <p className="text-gray-500 text-xs sm:text-sm mb-6 max-w-3xl">
            These items are how we close the gap between “better than QR” and
            regulator-grade assurance. Priorities can be tuned per deployment and threat model.
          </p>
          <ul className="grid md:grid-cols-3 gap-6">
            {ROADMAP.map((item) => (
              <li key={item.title} className="flex gap-3">
                <item.icon
                  className="w-5 h-5 text-cyan-400/70 shrink-0 mt-0.5"
                  aria-hidden
                />
                <div>
                  <p className="text-white text-sm font-medium">{item.title}</p>
                  <p className="text-gray-500 text-xs leading-relaxed mt-1">{item.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.12 }}
          className="rounded-2xl border border-violet-500/15 bg-violet-500/[0.04] p-6 sm:p-8 mt-10"
        >
          <h3 className="text-sm font-semibold text-violet-300/90 uppercase tracking-wider mb-2">
            AI-assisted features (Inspector &amp; consumer flows)
          </h3>
          <p className="text-gray-500 text-xs sm:text-sm mb-5 max-w-3xl">
            For security questionnaires: models assist with retrieval and wording; they do
            not replace your enforcement decisions. Technical detail for procurement lives
            in <code className="text-gray-400 text-[11px]">docs/AI_COMPLIANCE_AND_TRUST.md</code>.
          </p>
          <ul className="grid sm:grid-cols-2 gap-5 text-xs sm:text-sm">
            <li className="text-gray-500 leading-relaxed">
              <span className="text-white font-medium block mb-1">Grounding</span>
              Inspector answers use server-queried records only; citations are checked
              against retrieved data.
            </li>
            <li className="text-gray-500 leading-relaxed">
              <span className="text-white font-medium block mb-1">Human-in-the-loop</span>
              Holds, recalls, and case resolution stay with signed-in people and workflows —
              the assistant does not auto-execute enforcement.
            </li>
            <li className="text-gray-500 leading-relaxed">
              <span className="text-white font-medium block mb-1">Subprocessors &amp; retention</span>
              Inference runs via your hosted backend&apos;s LLM integration; align prompts,
              logs, and regions with Base44 and your DPA.
            </li>
            <li className="text-gray-500 leading-relaxed">
              <span className="text-white font-medium block mb-1">PII in prompts</span>
              Chat and slim row payloads may include fields from your data model; treat
              questions like any sensitive channel and define org policy.
            </li>
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
