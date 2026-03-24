/**
 * Outcome metrics for marketing UI (hero strip + /Proof one-pager).
 *
 * Replace heroValue, labels, and copy when you have customer-approved or audited figures.
 * Current entries use illustrative RANGES and DESIGN TARGETS only.
 */

export const OUTCOME_METRICS_DISCLAIMER =
  "Figures are illustrative design targets and ranges — not verified customer benchmarks unless you update this file and your legal review.";

/** @typedef {{ id: string; heroValue: string; label: string; blurb: string; detail: string }} OutcomeMetric */

/** @type {OutcomeMetric[]} */
export const OUTCOME_METRICS = [
  {
    id: "adoption",
    heroValue: "50–500+",
    label: "Partners & scan points",
    blurb: "Illustrative active footprint at programme maturity (partners, outlets, or depots — define “active” in your methodology).",
    detail:
      "Swap in anonymised roll-ups: e.g. distinct partners with ≥1 scan in 30 days, SKUs under serialisation, or states with live coverage. Keep numerator/denominator stable quarter to quarter for credibility.",
  },
  {
    id: "alert_to_action",
    heroValue: "≤ 24–72 h",
    label: "Alert → enforcement touch",
    blurb: "Design-time band from high-confidence diversion signal to first documented inspector action, hold, or seizure linkage.",
    detail:
      "Measure from alert creation timestamp to first linked InspectionReport, batch enforcement status change, or external case reference. Tune the hour range to your jurisdiction and staffing model.",
  },
  {
    id: "recall_clock",
    heroValue: "≤ 48 h – 7 d",
    label: "Detect → stakeholder visibility",
    blurb: "Recall-readiness window from confirmed risk to regulator / partner / public notification — product class and law dependent.",
    detail:
      "Define “detect” (lab confirm, policy trigger, or mass scan pattern) and “visibility” (formal filing, partner broadcast, consumer channel). Align wording with counsel before publishing customer claims.",
  },
  {
    id: "case_linkage",
    heroValue: "≥ 70–90%",
    label: "Severe alerts with case trace",
    blurb: "Target share of critical alerts carrying inspection id, seizure reference, or formal case metadata.",
    detail:
      "Numerator: alerts above your severity threshold with at least one enforcement artefact. Denominator: same threshold population. Replace ranges with audited percentages when programmes allow disclosure.",
  },
];

/** Subset shown in the hero (keep 3–4; edit IDs if you reorder). */
export const HERO_METRIC_IDS = ["adoption", "alert_to_action", "recall_clock", "case_linkage"];
