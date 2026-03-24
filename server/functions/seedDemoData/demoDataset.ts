/**
 * Deterministic demo data for full-lifecycle demo seeding.
 * State names match NigeriaHeatmap STATE_CENTRES keys after normaliseState (spaces → underscores).
 */

export const SCAN_OPERATOR_V2 = "seed_demo_v2";

/** Display prefix for plant_location (before —); must normalise to heatmap keys */
export const DEMO_STATES: { display: string; lat: number; lng: number }[] = [
  { display: "Lagos", lat: 6.52, lng: 3.38 },
  { display: "Kano", lat: 12.0, lng: 8.52 },
  { display: "FCT", lat: 9.07, lng: 7.4 },
  { display: "Rivers", lat: 4.84, lng: 6.91 },
  { display: "Oyo", lat: 8.0, lng: 3.9 },
  { display: "Kaduna", lat: 10.52, lng: 7.44 },
  { display: "Anambra", lat: 6.21, lng: 7.07 },
  { display: "Delta", lat: 5.5, lng: 5.9 },
  { display: "Katsina", lat: 12.99, lng: 7.61 },
  { display: "Ogun", lat: 7.16, lng: 3.35 },
  { display: "Imo", lat: 5.49, lng: 7.03 },
  { display: "Enugu", lat: 6.44, lng: 7.51 },
  { display: "Borno", lat: 11.83, lng: 13.15 },
  { display: "Edo", lat: 6.34, lng: 5.63 },
  { display: "Plateau", lat: 9.22, lng: 9.52 },
  { display: "Sokoto", lat: 13.06, lng: 5.24 },
  { display: "Akwa Ibom", lat: 5.0, lng: 7.85 },
  { display: "Osun", lat: 7.56, lng: 4.56 },
  { display: "Kwara", lat: 8.5, lng: 4.55 },
  { display: "Niger", lat: 9.93, lng: 5.6 },
  { display: "Bauchi", lat: 10.31, lng: 9.84 },
  { display: "Adamawa", lat: 9.33, lng: 12.39 },
  { display: "Benue", lat: 7.19, lng: 8.13 },
  { display: "Nasarawa", lat: 8.54, lng: 8.31 },
  { display: "Kebbi", lat: 11.49, lng: 4.19 },
  { display: "Taraba", lat: 7.87, lng: 11.37 },
  { display: "Kogi", lat: 7.8, lng: 6.74 },
  { display: "Cross River", lat: 5.87, lng: 8.6 },
  { display: "Jigawa", lat: 12.18, lng: 9.34 },
  { display: "Zamfara", lat: 12.17, lng: 6.66 },
  { display: "Gombe", lat: 10.29, lng: 11.17 },
  { display: "Yobe", lat: 12.29, lng: 11.44 },
  { display: "Abia", lat: 5.45, lng: 7.52 },
  { display: "Ebonyi", lat: 6.26, lng: 8.01 },
  { display: "Ekiti", lat: 7.72, lng: 5.31 },
  { display: "Ondo", lat: 7.25, lng: 5.19 },
  { display: "Bayelsa", lat: 4.77, lng: 6.06 },
];

export const DEMO_PRODUCTS: { product_name: string; manufacturer_name: string }[] = [
  { product_name: "Amoxicillin 500mg", manufacturer_name: "EmeraPharm Ltd" },
  { product_name: "Paracetamol 1000mg", manufacturer_name: "HealthCore Industries" },
  { product_name: "Metformin 850mg", manufacturer_name: "MediNorth Labs" },
  { product_name: "Ciprofloxacin 250mg", manufacturer_name: "RiverPharm Co." },
  { product_name: "Artemether/Lumefantrine 20/120mg", manufacturer_name: "Onitsha Pharma" },
  { product_name: "ORS Zinc Sachets", manufacturer_name: "HydrateNG" },
  { product_name: "Vitamin C 1000mg", manufacturer_name: "OgunWell Pharma" },
  { product_name: "Hand Sanitizer 500ml", manufacturer_name: "CleanGuard Nigeria" },
  { product_name: "Ibuprofen 400mg", manufacturer_name: "Swiss Pharma NG" },
  { product_name: "Ceftriaxone 1g injection", manufacturer_name: "InjectaCare Ltd" },
  { product_name: "Insulin Glargine pen", manufacturer_name: "DiabetEase West Africa" },
  { product_name: "Antiseptic Solution 200ml", manufacturer_name: "SteriMed Nigeria" },
];

const ENFORCEMENT_CYCLE = ["active", "active", "hold", "active", "recalled", "active", "quarantine", "cleared"] as const;
const STAGE_CYCLE = ["commissioned", "port_receipt", "wholesale", "retail", "consumer"] as const;

export type ExtendedBatchSeed = {
  batch_number: string;
  product_name: string;
  manufacturer_name: string;
  expiry_date: string;
  enforcement_status: string;
  diversion_score: number;
  authorised_zones: string[];
  plant_location: string;
  supply_chain_stage: string;
  anomaly_flags: string[];
  total_scan_count: number;
  suspicious_scan_count: number;
};

export function buildExtendedBatches(count: number): ExtendedBatchSeed[] {
  const out: ExtendedBatchSeed[] = [];
  const nowY = new Date().getFullYear();
  for (let i = 0; i < count; i++) {
    const st = DEMO_STATES[i % DEMO_STATES.length];
    const p = DEMO_PRODUCTS[i % DEMO_PRODUCTS.length];
    const en = ENFORCEMENT_CYCLE[i % ENFORCEMENT_CYCLE.length];
    const div = 15 + ((i * 17) % 86);
    const flags: string[] = [];
    if (en === "recalled") flags.push("recall_active");
    if (div >= 75) flags.push("geo_mismatch");
    if (i % 11 === 0) flags.push("repeat_scan");
    out.push({
      batch_number: `DEMO-TS26-${String(i + 1).padStart(4, "0")}`,
      product_name: p.product_name,
      manufacturer_name: p.manufacturer_name,
      expiry_date: `${nowY + 1 + (i % 3)}-${String((i % 12) + 1).padStart(2, "0")}-15`,
      enforcement_status: en,
      diversion_score: div,
      authorised_zones: [st.display],
      plant_location: `${st.display} — Demo Line ${(i % 5) + 1} / Hub ${String.fromCharCode(65 + (i % 4))}`,
      supply_chain_stage: STAGE_CYCLE[i % STAGE_CYCLE.length],
      anomaly_flags: flags,
      total_scan_count: 30 + (i % 120),
      suspicious_scan_count: Math.min(25, Math.floor(div / 12)),
    });
  }
  return out;
}

export function demoTagUid(index: number): string {
  return `NG-TG-D${String(index).padStart(6, "0")}`;
}

/** Picsum URLs — stable seeds for repeatable thumbnails in InspectionReport.photo_urls */
export function evidencePhotoUrls(seedBase: string, n: number): string[] {
  const urls: string[] = [];
  for (let k = 0; k < n; k++) {
    const seed = `${seedBase}-${k}`.replace(/[^a-zA-Z0-9-]/g, "");
    urls.push(`https://picsum.photos/seed/${seed}/640/480`);
  }
  return urls;
}

export const EVENT_TYPES_LIFECYCLE = [
  "commissioning",
  "port_receipt",
  "wholesale_transfer",
  "retail_receipt",
  "consumer_verification",
  "returns",
  "seizure",
] as const;