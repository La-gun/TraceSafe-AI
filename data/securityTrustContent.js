/**
 * Shared copy for Security & trust (home section) and /Trust full trust center.
 * Keep marketing and procurement language aligned with docs/ENTERPRISE_AND_PORTABILITY.md.
 */

export const TRUST_LIMITS = [
  {
    title: "Tag copying and replay",
    honest:
      "Standard NFC can be copied; even secure tags raise the bar but are not a magic “unclonable” guarantee against determined attackers.",
  },
  {
    title: "Client-reported location",
    honest:
      "Latitude, longitude, or “state” from a phone or browser can be spoofed. They are useful signals for analytics—not standalone proof of physical presence.",
  },
];

export const TRUST_TODAY = [
  {
    title: "Authoritative registry & ledger",
    text: "Scans are evaluated against the live tag and batch record on the server. Unregistered tags, recalls, expiry, and policy state drive outcomes—not the sticker alone.",
  },
  {
    title: "Authenticated operators",
    text: "Inspector and partner flows require signed-in users so scan and inspection events tie to an account for audit and case work.",
  },
  {
    title: "Behavioural and policy signals",
    text: "Repeat scans, suspicious patterns, and zone rules (where geography is supplied) feed diversion intelligence. We treat these as triage signals, not court-grade geolocation proof.",
  },
];

export const TRUST_ROADMAP = [
  {
    title: "Cryptographic tap verification",
    text: "Server-side validation of secure-tag responses (e.g. SDM / challenge–response) so taps must prove fresh, key-backed answers—not just replay static NDEF.",
  },
  {
    title: "Corroborated location trust",
    text: "Fuse coarse network hints, trusted time, and—where appropriate—device integrity (Play Integrity / App Attest) and supervised inspector hardware to raise confidence in geo signals.",
  },
  {
    title: "Multi-source agreement",
    text: "Optional alignment between commissioning data, optional NFT-registry binding, and independent scanner corroboration to flag cloned or inconsistent tags.",
  },
];

/** AI governance bullets (Inspector & consumer flows). */
export const AI_GOVERNANCE_ITEMS = [
  {
    title: "Grounding",
    body:
      "Inspector answers use server-queried records only; citations are checked against retrieved data.",
  },
  {
    title: "Human-in-the-loop",
    body:
      "Holds, recalls, and case resolution stay with signed-in people and workflows — the assistant does not auto-execute enforcement.",
  },
  {
    title: "Subprocessors & retention",
    body:
      "Inference runs via your hosted backend's LLM integration; align prompts, logs, and regions with your infrastructure providers and DPA.",
  },
  {
    title: "PII in prompts",
    body:
      "Chat and slim row payloads may include fields from your data model; treat questions like any sensitive channel and define org policy.",
  },
];
