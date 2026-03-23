/**
 * seedDemoData — idempotent demo dataset for TraceSafe / TraceGuard
 *
 * Creates Batch, TagRegistry (+ commissioning ScanEvent), sample DiversionAlerts,
 * and ConsumerReport rows so Dashboard, Risk Map, Inspector NFC demos, and
 * Incident Manager have data without manual Base44 Builder entry.
 *
 * Security: **Admin only.** Call from Base44 Functions or an authenticated admin session:
 *   await base44.functions.invoke('seedDemoData', { dryRun: false })
 *
 * Options (JSON body):
 *   dryRun?: boolean  — if true, only returns the plan, no writes
 *   forceTags?: boolean — re-upsert demo tags even if batch exists (default false)
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

type BatchSeed = {
  batch_number: string;
  product_name: string;
  manufacturer_name: string;
  expiry_date: string;
  enforcement_status: string;
  diversion_score: number;
  authorised_zones: string[];
  plant_location: string;
  supply_chain_stage?: string;
  anomaly_flags?: string[];
  total_scan_count?: number;
  suspicious_scan_count?: number;
};

type TagSeed = {
  tag_uid: string;
  batch_number: string;
  product_name: string;
  enforcement_key: "hold" | "active" | "recalled";
  commissioning_location?: string;
};

const BATCHES: BatchSeed[] = [
  {
    batch_number: "AMX-2026-0341",
    product_name: "Amoxicillin 500mg",
    manufacturer_name: "EmeraPharm Ltd",
    expiry_date: "2027-08-01",
    enforcement_status: "hold",
    diversion_score: 88,
    authorised_zones: ["Lagos"],
    plant_location: "Lagos — PharmaNig Plant A",
    supply_chain_stage: "wholesale",
    anomaly_flags: ["geo_mismatch"],
    total_scan_count: 120,
    suspicious_scan_count: 14,
  },
  {
    batch_number: "PCT-2026-0812",
    product_name: "Paracetamol 1000mg",
    manufacturer_name: "HealthCore Industries",
    expiry_date: "2028-03-15",
    enforcement_status: "active",
    diversion_score: 22,
    authorised_zones: ["Abuja", "FCT"],
    plant_location: "Abuja — Central Fill",
    supply_chain_stage: "retail",
    total_scan_count: 540,
    suspicious_scan_count: 2,
  },
  {
    batch_number: "HS-2026-0045",
    product_name: "Hand Sanitizer 500ml",
    manufacturer_name: "CleanGuard Nigeria",
    expiry_date: "2026-12-31",
    enforcement_status: "recalled",
    diversion_score: 95,
    authorised_zones: ["Kano"],
    plant_location: "Kano — Sabon Gari Distribution",
    supply_chain_stage: "retail",
    anomaly_flags: ["recall_active"],
    total_scan_count: 89,
    suspicious_scan_count: 20,
  },
  {
    batch_number: "MET-2026-0112",
    product_name: "Metformin 850mg",
    manufacturer_name: "MediNorth Labs",
    expiry_date: "2027-11-20",
    enforcement_status: "active",
    diversion_score: 76,
    authorised_zones: ["Kano"],
    plant_location: "Kano",
    supply_chain_stage: "wholesale",
    total_scan_count: 210,
    suspicious_scan_count: 9,
  },
  {
    batch_number: "CIP-2026-0089",
    product_name: "Ciprofloxacin 250mg",
    manufacturer_name: "RiverPharm Co.",
    expiry_date: "2028-01-10",
    enforcement_status: "active",
    diversion_score: 52,
    authorised_zones: ["Rivers", "Port Harcourt"],
    plant_location: "Port Harcourt",
    supply_chain_stage: "wholesale",
    total_scan_count: 95,
    suspicious_scan_count: 4,
  },
  {
    batch_number: "OGU-2026-0150",
    product_name: "Vitamin C 1000mg",
    manufacturer_name: "OgunWell Pharma",
    expiry_date: "2027-06-01",
    enforcement_status: "active",
    diversion_score: 95,
    authorised_zones: ["Ogun"],
    plant_location: "Abeokuta — Ogun",
    supply_chain_stage: "retail",
    total_scan_count: 400,
    suspicious_scan_count: 12,
  },
  {
    batch_number: "OYO-2026-0201",
    product_name: "ORS Sachets",
    manufacturer_name: "HydrateNG",
    expiry_date: "2027-09-15",
    enforcement_status: "active",
    diversion_score: 44,
    authorised_zones: ["Oyo"],
    plant_location: "Ibadan",
    supply_chain_stage: "retail",
    total_scan_count: 220,
    suspicious_scan_count: 1,
  },
  {
    batch_number: "ANM-2026-0077",
    product_name: "Artemether/Lumefantrine",
    manufacturer_name: "Onitsha Pharma",
    expiry_date: "2028-02-28",
    enforcement_status: "active",
    diversion_score: 29,
    authorised_zones: ["Anambra"],
    plant_location: "Onitsha",
    supply_chain_stage: "retail",
    total_scan_count: 150,
    suspicious_scan_count: 3,
  },
];

const TAGS: TagSeed[] = [
  {
    tag_uid: "NG-TG-00041872",
    batch_number: "AMX-2026-0341",
    product_name: "Amoxicillin 500mg",
    enforcement_key: "hold",
    commissioning_location: "Lagos — PharmaNig Plant A",
  },
  {
    tag_uid: "NG-TG-00091234",
    batch_number: "PCT-2026-0812",
    product_name: "Paracetamol 1000mg",
    enforcement_key: "active",
    commissioning_location: "Abuja — Central Fill",
  },
  {
    tag_uid: "NG-TG-00055678",
    batch_number: "HS-2026-0045",
    product_name: "Hand Sanitizer 500ml",
    enforcement_key: "recalled",
    commissioning_location: "Kano — CleanGuard Plant",
  },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") {
      return Response.json({ error: "Forbidden: Admin only. Use an admin account to seed." }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const dryRun = Boolean(body.dryRun);
    const forceTags = Boolean(body.forceTags);

    const summary = {
      batches_created: 0,
      batches_existing: 0,
      tags_created: 0,
      tags_existing: 0,
      scan_events_created: 0,
      alerts_created: 0,
      consumer_reports_created: 0,
      errors: [] as string[],
    };

    const plan = { batches: BATCHES.length, tags: TAGS.length };

    if (dryRun) {
      return Response.json({ dryRun: true, plan, message: "No changes applied." });
    }

    const batchIdByNumber: Record<string, string> = {};

    for (const b of BATCHES) {
      try {
        const found = await base44.asServiceRole.entities.Batch.filter({ batch_number: b.batch_number });
        if (found[0]) {
          batchIdByNumber[b.batch_number] = found[0].id;
          summary.batches_existing++;
          continue;
        }
        const created = await base44.asServiceRole.entities.Batch.create({
          batch_number: b.batch_number,
          product_name: b.product_name,
          manufacturer_name: b.manufacturer_name,
          expiry_date: b.expiry_date,
          enforcement_status: b.enforcement_status,
          diversion_score: b.diversion_score,
          authorised_zones: b.authorised_zones,
          plant_location: b.plant_location,
          supply_chain_stage: b.supply_chain_stage || "commissioned",
          anomaly_flags: b.anomaly_flags || [],
          total_scan_count: b.total_scan_count ?? 0,
          suspicious_scan_count: b.suspicious_scan_count ?? 0,
        });
        batchIdByNumber[b.batch_number] = created.id;
        summary.batches_created++;
      } catch (e) {
        summary.errors.push(`Batch ${b.batch_number}: ${(e as Error).message}`);
      }
    }

    for (const t of TAGS) {
      try {
        const existing = await base44.asServiceRole.entities.TagRegistry.filter({ tag_uid: t.tag_uid });
        if (existing[0] && !forceTags) {
          summary.tags_existing++;
          continue;
        }
        if (existing[0] && forceTags) {
          await base44.asServiceRole.entities.TagRegistry.delete(existing[0].id);
        }

        const batches = await base44.asServiceRole.entities.Batch.filter({ batch_number: t.batch_number });
        const batchId = batches[0]?.id || batchIdByNumber[t.batch_number] || null;

        const today = new Date().toISOString().slice(0, 10);
        await base44.asServiceRole.entities.TagRegistry.create({
          tag_uid: t.tag_uid,
          tag_type: "item",
          batch_number: t.batch_number,
          batch_id: batchId,
          product_name: t.product_name,
          product_id: t.batch_number,
          serial_number: t.tag_uid,
          commissioning_date: today,
          commissioning_location: t.commissioning_location || "Factory",
          status: "active",
          total_scans: 0,
          supply_chain_stage: "commissioned",
          sdm_key_version: 1,
          ndef_url_template: `https://verify.traceguard.ng/v/${t.tag_uid}`,
        });
        summary.tags_created++;

        await base44.asServiceRole.entities.ScanEvent.create({
          tag_uid: t.tag_uid,
          product_name: t.product_name,
          batch_number: t.batch_number,
          event_type: "commissioning",
          location: t.commissioning_location || "Factory",
          operator: user.email,
          status: "authentic",
          anomaly_flags: [],
        });
        summary.scan_events_created++;
      } catch (e) {
        summary.errors.push(`Tag ${t.tag_uid}: ${(e as Error).message}`);
      }
    }

    try {
      const alerts = await base44.asServiceRole.entities.DiversionAlert.list("-created_date", 30);
      if (alerts.length < 3) {
        const samples = [
          {
            batch_number: "AMX-2026-0341",
            product_name: "Amoxicillin 500mg",
            alert_type: "geo_mismatch",
            severity: "high",
            expected_zone: "Lagos",
            detected_zone: "Onitsha, Anambra",
            details: "Demo seed: product detected outside authorised Lagos zone.",
          },
          {
            batch_number: "MET-2026-0112",
            product_name: "Metformin 850mg",
            alert_type: "repeat_scan",
            severity: "high",
            expected_zone: "Kano",
            detected_zone: "Kano, Kano State",
            details: "Demo seed: repeat scan pattern detected.",
          },
          {
            batch_number: "CIP-2026-0089",
            product_name: "Ciprofloxacin 250mg",
            alert_type: "diversion_signal",
            severity: "medium",
            expected_zone: "Port Harcourt",
            detected_zone: "Aba, Abia State",
            details: "Demo seed: route deviation vs registered distributor.",
          },
        ];
        for (const a of samples) {
          const bn = a.batch_number;
          const batches = await base44.asServiceRole.entities.Batch.filter({ batch_number: bn });
          const batch = batches[0];
          const alertNum = `ALT-SEED-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
          await base44.asServiceRole.entities.DiversionAlert.create({
            alert_number: alertNum,
            alert_type: a.alert_type,
            severity: a.severity,
            status: "open",
            product_name: a.product_name,
            batch_number: bn,
            batch_id: batch?.id,
            expected_zone: a.expected_zone,
            detected_zone: a.detected_zone,
            detected_location: a.detected_zone,
            details: a.details,
          });
          summary.alerts_created++;
        }
      }
    } catch (e) {
      summary.errors.push(`Alerts: ${(e as Error).message}`);
    }

    try {
      const reports = await base44.asServiceRole.entities.ConsumerReport.list("-created_date", 20);
      if (reports.length < 2) {
        await base44.asServiceRole.entities.ConsumerReport.create({
          serial_number: "NG-TG-00099901",
          product_name: "Unknown Syrup",
          batch_number: "UNK-2026-0001",
          manufacturer: "Unregistered",
          reported_status: "not_found",
          input_mode: "serial",
          incident_status: "pending_review",
          priority: "high",
        });
        summary.consumer_reports_created++;
        await base44.asServiceRole.entities.ConsumerReport.create({
          serial_number: "NG-TG-00041872",
          product_name: "Amoxicillin 500mg",
          batch_number: "AMX-2026-0341",
          manufacturer: "EmeraPharm Ltd",
          reported_status: "suspicious",
          input_mode: "serial",
          incident_status: "pending_review",
          priority: "medium",
        });
        summary.consumer_reports_created++;
      }
    } catch (e) {
      summary.errors.push(`ConsumerReport: ${(e as Error).message}`);
    }

    return Response.json({
      success: true,
      summary,
      message:
        "Seed complete. Inspector demo UIDs: NG-TG-00041872 (hold), NG-TG-00091234 (active), NG-TG-00055678 (recalled).",
    });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
});
