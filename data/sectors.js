/**
 * Sector cards for home + /Sectors deep page. icon matches keys in SECTORS_ICON_KEYS.
 */

/** @typedef {{ id: string; icon: string; name: string; desc: string; tag: string; journey: string; differentiators: string[] }} Sector */

/** @type {Sector[]} */
export const SECTORS = [
  {
    id: "pharmaceuticals",
    icon: "Pill",
    name: "Pharmaceuticals",
    desc: "Anchor sector — traceability aligns with NAFDAC's regulatory direction for end-to-end supply chain visibility.",
    tag: "Primary",
    journey:
      "Line commissioning through item-level tags, custody across import and wholesale, retail receipt, and consumer verification — with diversion signals feeding inspector queues and enforcement status.",
    differentiators: [
      "Recall and quarantine state on the batch record",
      "Inspection reports with photo evidence",
      "Alert-to-case linkage for severe diversion signals",
    ],
  },
  {
    id: "premium-fmcg",
    icon: "Package",
    name: "Premium FMCG",
    desc: "Anti-counterfeit control for premium consumer goods where brand trust is commercially critical.",
    tag: "High Value",
    journey:
      "Protect high-margin SKUs with authenticated taps and a visible chain of custody; repeat-scan and zone rules support grey-market investigations without overclaiming client-reported geo.",
    differentiators: [
      "Consumer-facing authenticity narrative",
      "Partner onboarding at scale",
      "Batch-level risk watchlists",
    ],
  },
  {
    id: "alcohol-beverages",
    icon: "Wine",
    name: "Alcohol & Beverages",
    desc: "Channel assurance for spirits and regulated beverages with import verification.",
    tag: "Regulated",
    journey:
      "Port-of-entry and wholesale transfer events anchor legitimate supply; suspicious patterns help target field checks and seizures where regulations allow.",
    differentiators: [
      "Import and distributor custody events",
      "Enforcement console for holds and cases",
      "Optional registry binding for high-assurance pilots",
    ],
  },
  {
    id: "agro-inputs",
    icon: "Wheat",
    name: "Agro-Inputs",
    desc: "Fertilizers, pesticides, and seeds where product authenticity protects farmer livelihoods.",
    tag: "Essential",
    journey:
      "Trace sacks and bottles from factory or packager through regional depots; consumer and cooperative verification reduces counterfeit inputs in rural channels.",
    differentiators: [
      "Simple verify flows for low-connectivity areas",
      "Aggregation for case and pallet logistics",
      "Incident queue for reported fakes",
    ],
  },
  {
    id: "electronics",
    icon: "Cpu",
    name: "High-Value Electronics",
    desc: "Serialised authentication for electronics where counterfeits pose safety and quality risks.",
    tag: "Technical",
    journey:
      "Item-level secure tags plus digital twin registry support warranty, grey-market analysis, and regulator collaboration where serialisation is already mandated or voluntary.",
    differentiators: [
      "Tag registry and scan ledger correlation",
      "NFT registry optional under your Postgres",
      "Risk dashboard for anomaly triage",
    ],
  },
];
