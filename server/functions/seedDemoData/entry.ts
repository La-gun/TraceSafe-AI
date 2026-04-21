/**
 * seedDemoData — idempotent demo dataset for TraceGuard
 *
 * Creates Batch, TagRegistry (+ commissioning ScanEvent), DiversionAlerts,
 * ConsumerReport, extended lifecycle data (partners, custody transfers, batch status,
 * aggregation links, inspection reports with photo URLs, extra scan events for maps),
 * so Dashboard (via getDashboardStats), Risk Map heatmap, Inspector NFC demos,
 * and Incident Manager have rich data.
 *
 * Security: **Admin only.**
 *
 * Options (JSON body):
 *   dryRun?: boolean — plan only, no writes
 *   forceTags?: boolean — re-upsert the 3 canonical demo tags (default false)
 *   fullLifecycleDemo?: boolean — also seed 50+ demo batches, tags, scans, etc. (default true)
 */
import { createClientFromRequest } from "npm:@base44/sdk@0.8.21";
import { syncCommissionedTagToNftRegistry } from "../_shared/nftRegistrySync.ts";
import {
  buildExtendedBatches,
  demoTagUid,
  evidencePhotoUrls,
  EVENT_TYPES_LIFECYCLE,
  SCAN_OPERATOR_V2,
  DEMO_STATES,
} from "./demoDataset.ts";

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

const EXTENDED_BATCH_COUNT = 50;
const EXTENDED_TAG_COUNT = 55;
const LIFECYCLE_SCAN_TARGET = 130;
const DEMO_ALERT_PREFIX = "ALT-DEMO-V2-";
const DEMO_CONSUMER_PREFIX = "NG-DEMO-RPT-";
const DEMO_INSPECTION_PREFIX = "RPT-DEMO-V2-";
const CASE_TAG_UID = "NG-TG-D-CASE01";

function jitterCoord(lat: number, lng: number, salt: number) {
  const a = ((salt * 9301 + 49297) % 233280) / 233280 - 0.5;
  const b = ((salt * 7919 + 104729) % 233280) / 233280 - 0.5;
  return { latitude: lat + a * 0.35, longitude: lng + b * 0.35 };
}

Deno.serve(async (req) => {
  try {
    const api = createClientFromRequest(req);
    const user = await api.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") {
      return Response.json({ error: "Forbidden: Admin only. Use an admin account to seed." }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const dryRun = Boolean(body.dryRun);
    const forceTags = Boolean(body.forceTags);
    const fullLifecycleDemo = body.fullLifecycleDemo !== false;

    const summary = {
      batches_created: 0,
      batches_existing: 0,
      tags_created: 0,
      tags_existing: 0,
      scan_events_created: 0,
      alerts_created: 0,
      consumer_reports_created: 0,
      nft_registry_synced: 0,
      nft_registry_skipped: 0,
      nft_registry_failed: 0,
      extended_batches_created: 0,
      extended_batches_existing: 0,
      extended_tags_created: 0,
      extended_tags_existing: 0,
      lifecycle_scans_created: 0,
      partners_created: 0,
      partners_existing: 0,
      custody_transfers_created: 0,
      batch_status_created: 0,
      batch_status_existing: 0,
      aggregation_links_created: 0,
      inspection_reports_created: 0,
      demo_consumer_reports_created: 0,
      demo_alerts_created: 0,
      errors: [] as string[],
    };

    const extendedBatches = buildExtendedBatches(EXTENDED_BATCH_COUNT);
    const plan = {
      legacy_batches: BATCHES.length,
      legacy_tags: TAGS.length,
      fullLifecycleDemo,
      extended_batches: fullLifecycleDemo ? extendedBatches.length : 0,
      extended_tags: fullLifecycleDemo ? EXTENDED_TAG_COUNT + 1 + 3 : 0,
      lifecycle_scans_target: fullLifecycleDemo ? LIFECYCLE_SCAN_TARGET : 0,
      partners: fullLifecycleDemo ? 10 : 0,
      custody_transfers: fullLifecycleDemo ? 18 : 0,
      batch_status_rows: fullLifecycleDemo ? 14 : 0,
      aggregation_links: fullLifecycleDemo ? 3 : 0,
      inspection_reports: fullLifecycleDemo ? 16 : 0,
      consumer_reports: fullLifecycleDemo ? 22 : 0,
      diversion_alerts: fullLifecycleDemo ? 24 : 0,
    };

    if (dryRun) {
      return Response.json({
        dryRun: true,
        plan,
        message: "No changes applied.",
        estimated_new_entities_min: fullLifecycleDemo ? 100 : BATCHES.length + TAGS.length,
      });
    }

    const batchIdByNumber: Record<string, string> = {};
    const partnerIds: string[] = [];

    for (const b of BATCHES) {
      try {
        const found = await api.asServiceRole.entities.Batch.filter({ batch_number: b.batch_number });
        if (found[0]) {
          batchIdByNumber[b.batch_number] = found[0].id;
          summary.batches_existing++;
          continue;
        }
        const created = await api.asServiceRole.entities.Batch.create({
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
        const existing = await api.asServiceRole.entities.TagRegistry.filter({ tag_uid: t.tag_uid });
        if (existing[0] && !forceTags) {
          summary.tags_existing++;
          continue;
        }
        if (existing[0] && forceTags) {
          await api.asServiceRole.entities.TagRegistry.delete(existing[0].id);
        }

        const batches = await api.asServiceRole.entities.Batch.filter({ batch_number: t.batch_number });
        const batchId = batches[0]?.id || batchIdByNumber[t.batch_number] || null;

        const today = new Date().toISOString().slice(0, 10);
        await api.asServiceRole.entities.TagRegistry.create({
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

        await api.asServiceRole.entities.ScanEvent.create({
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

        const nft = await syncCommissionedTagToNftRegistry({
          tag_uid: t.tag_uid,
          batch_number: t.batch_number,
          product_name: t.product_name,
          product_id: t.batch_number,
          batch_id: batchId,
          serial_number: t.tag_uid,
          commissioning_location: t.commissioning_location || "Factory",
        });
        if ("skipped" in nft && nft.skipped) summary.nft_registry_skipped++;
        else if ("ok" in nft && nft.ok) summary.nft_registry_synced++;
        else if ("ok" in nft && !nft.ok) {
          summary.nft_registry_failed++;
          summary.errors.push(`NFT sync ${t.tag_uid}: ${nft.error}`);
        }
      } catch (e) {
        summary.errors.push(`Tag ${t.tag_uid}: ${(e as Error).message}`);
      }
    }

    try {
      const alerts = await api.asServiceRole.entities.DiversionAlert.list("-created_date", 30);
      if (alerts.length < 3) {
        const samples = [
          {
            batch_number: "AMX-2026-0341",
            product_name: "Amoxicillin 500mg",
            alert_type: "geo_mismatch",
            severity: "high",
            expected_zone: "Lagos",
            detected_zone: "Lagos",
            details: "Demo seed: product detected outside authorised Lagos zone.",
          },
          {
            batch_number: "MET-2026-0112",
            product_name: "Metformin 850mg",
            alert_type: "repeat_scan",
            severity: "high",
            expected_zone: "Kano",
            detected_zone: "Kano",
            details: "Demo seed: repeat scan pattern detected.",
          },
          {
            batch_number: "CIP-2026-0089",
            product_name: "Ciprofloxacin 250mg",
            alert_type: "diversion_signal",
            severity: "medium",
            expected_zone: "Rivers",
            detected_zone: "Rivers",
            details: "Demo seed: route deviation vs registered distributor.",
          },
        ];
        for (const a of samples) {
          const bn = a.batch_number;
          const batches = await api.asServiceRole.entities.Batch.filter({ batch_number: bn });
          const batch = batches[0];
          const alertNum = `ALT-SEED-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
          await api.asServiceRole.entities.DiversionAlert.create({
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
      const reports = await api.asServiceRole.entities.ConsumerReport.list("-created_date", 20);
      if (reports.length < 2) {
        await api.asServiceRole.entities.ConsumerReport.create({
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
        await api.asServiceRole.entities.ConsumerReport.create({
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

    // ── Full lifecycle demo (100+ records) ─────────────────────────────────
    if (fullLifecycleDemo) {
      const alertTypes = ["geo_mismatch", "repeat_scan", "diversion_signal", "chain_break", "recall_active"] as const;
      const consumerStatuses = [
        "pending_review", "under_investigation", "quarantine", "verified_counterfeit", "cleared", "false_positive",
      ] as const;
      const reportedMix = ["not_found", "suspicious", "hold", "recalled", "authentic"] as const;
      const recommendations = ["clear", "hold", "quarantine", "seize", "refer_prosecution"] as const;

      for (const b of extendedBatches) {
        try {
          const found = await api.asServiceRole.entities.Batch.filter({ batch_number: b.batch_number });
          if (found[0]) {
            batchIdByNumber[b.batch_number] = found[0].id;
            summary.extended_batches_existing++;
            continue;
          }
          const created = await api.asServiceRole.entities.Batch.create({
            batch_number: b.batch_number,
            product_name: b.product_name,
            manufacturer_name: b.manufacturer_name,
            expiry_date: b.expiry_date,
            enforcement_status: b.enforcement_status,
            diversion_score: b.diversion_score,
            authorised_zones: b.authorised_zones,
            plant_location: b.plant_location,
            supply_chain_stage: b.supply_chain_stage,
            anomaly_flags: b.anomaly_flags,
            total_scan_count: b.total_scan_count,
            suspicious_scan_count: b.suspicious_scan_count,
          });
          batchIdByNumber[b.batch_number] = created.id;
          summary.extended_batches_created++;
        } catch (e) {
          summary.errors.push(`Extended batch ${b.batch_number}: ${(e as Error).message}`);
        }
      }

      for (let i = 0; i < 10; i++) {
        const name = `TraceGuard Demo Partner ${i + 1}`;
        try {
          const existing = await api.asServiceRole.entities.Partner.filter({ name });
          if (existing[0]) {
            partnerIds.push(existing[0].id);
            summary.partners_existing++;
            continue;
          }
          const st = DEMO_STATES[i % DEMO_STATES.length];
          try {
            const p = await api.asServiceRole.entities.Partner.create({
              name,
              partner_type: ["manufacturer", "wholesaler", "retailer"][i % 3],
              state: st.display,
              status: "active",
              total_transfers: i * 3,
            });
            partnerIds.push(p.id);
            summary.partners_created++;
          } catch {
            const p = await api.asServiceRole.entities.Partner.create({ name });
            partnerIds.push(p.id);
            summary.partners_created++;
          }
        } catch (e) {
          summary.errors.push(`Partner ${name}: ${(e as Error).message}`);
        }
      }

      for (let i = 1; i <= EXTENDED_TAG_COUNT; i++) {
        const uid = demoTagUid(i);
        const batchIdx = (i - 1) % EXTENDED_BATCH_COUNT;
        const bn = extendedBatches[batchIdx].batch_number;
        const product_name = extendedBatches[batchIdx].product_name;
        const loc = extendedBatches[batchIdx].plant_location;
        const st = DEMO_STATES[batchIdx % DEMO_STATES.length];
        try {
          const ex = await api.asServiceRole.entities.TagRegistry.filter({ tag_uid: uid });
          if (ex[0]) {
            summary.extended_tags_existing++;
            continue;
          }
          const bid = batchIdByNumber[bn] ||
            (await api.asServiceRole.entities.Batch.filter({ batch_number: bn }))[0]?.id;
          const today = new Date().toISOString().slice(0, 10);
          await api.asServiceRole.entities.TagRegistry.create({
            tag_uid: uid,
            tag_type: "item",
            batch_number: bn,
            batch_id: bid || null,
            product_name,
            product_id: bn,
            serial_number: uid,
            commissioning_date: today,
            commissioning_location: loc,
            status: "active",
            total_scans: 0,
            supply_chain_stage: "commissioned",
            sdm_key_version: 1,
            ndef_url_template: `https://verify.traceguard.ng/v/${uid}`,
          });
          summary.extended_tags_created++;
          const { latitude, longitude } = jitterCoord(st.lat, st.lng, i);
          await api.asServiceRole.entities.ScanEvent.create({
            tag_uid: uid,
            product_name,
            batch_number: bn,
            event_type: "commissioning",
            location: loc,
            state: st.display,
            operator: SCAN_OPERATOR_V2,
            status: "authentic",
            anomaly_flags: [],
            latitude,
            longitude,
          });
          summary.lifecycle_scans_created++;
        } catch (e) {
          summary.errors.push(`Extended tag ${uid}: ${(e as Error).message}`);
        }
      }

      const aggBatch = extendedBatches[0];
      const aggBn = aggBatch.batch_number;
      const aggProduct = aggBatch.product_name;
      const aggLoc = aggBatch.plant_location;
      const aggState = DEMO_STATES[0].display;
      const bidAgg = batchIdByNumber[aggBn];

      try {
        const exCase = await api.asServiceRole.entities.TagRegistry.filter({ tag_uid: CASE_TAG_UID });
        if (!exCase[0]) {
          const today = new Date().toISOString().slice(0, 10);
          await api.asServiceRole.entities.TagRegistry.create({
            tag_uid: CASE_TAG_UID,
            tag_type: "case",
            batch_number: aggBn,
            batch_id: bidAgg || null,
            product_name: aggProduct,
            product_id: aggBn,
            serial_number: CASE_TAG_UID,
            commissioning_date: today,
            commissioning_location: aggLoc,
            status: "active",
            total_scans: 0,
            supply_chain_stage: "commissioned",
            sdm_key_version: 1,
            ndef_url_template: `https://verify.traceguard.ng/v/${CASE_TAG_UID}`,
          });
          summary.extended_tags_created++;
          await api.asServiceRole.entities.ScanEvent.create({
            tag_uid: CASE_TAG_UID,
            product_name: aggProduct,
            batch_number: aggBn,
            event_type: "commissioning",
            location: aggLoc,
            state: aggState,
            operator: SCAN_OPERATOR_V2,
            status: "authentic",
            anomaly_flags: [],
          });
          summary.lifecycle_scans_created++;
        } else summary.extended_tags_existing++;

        for (let c = 1; c <= 3; c++) {
          const childUid = `NG-TG-D-A01-00${c}`;
          const ex = await api.asServiceRole.entities.TagRegistry.filter({ tag_uid: childUid });
          if (ex[0]) {
            summary.extended_tags_existing++;
            continue;
          }
          const today = new Date().toISOString().slice(0, 10);
          await api.asServiceRole.entities.TagRegistry.create({
            tag_uid: childUid,
            tag_type: "item",
            batch_number: aggBn,
            batch_id: bidAgg || null,
            product_name: aggProduct,
            product_id: aggBn,
            serial_number: childUid,
            parent_tag_uid: CASE_TAG_UID,
            commissioning_date: today,
            commissioning_location: aggLoc,
            status: "active",
            total_scans: 0,
            supply_chain_stage: "commissioned",
            sdm_key_version: 1,
            ndef_url_template: `https://verify.traceguard.ng/v/${childUid}`,
          });
          summary.extended_tags_created++;
          await api.asServiceRole.entities.ScanEvent.create({
            tag_uid: childUid,
            product_name: aggProduct,
            batch_number: aggBn,
            event_type: "commissioning",
            location: aggLoc,
            state: aggState,
            operator: SCAN_OPERATOR_V2,
            status: "authentic",
            anomaly_flags: [],
          });
          summary.lifecycle_scans_created++;

          const linkEx = await api.asServiceRole.entities.AggregationLink.filter({
            parent_tag_uid: CASE_TAG_UID,
            child_tag_uid: childUid,
          });
          if (!linkEx[0]) {
            await api.asServiceRole.entities.AggregationLink.create({
              parent_tag_uid: CASE_TAG_UID,
              child_tag_uid: childUid,
              parent_type: "case",
              child_type: "item",
              batch_number: aggBn,
              product_name: aggProduct,
              aggregated_at_location: aggLoc,
              status: "active",
            });
            summary.aggregation_links_created++;
          }
        }
      } catch (e) {
        summary.errors.push(`Aggregation demo: ${(e as Error).message}`);
      }

      try {
        const recent = await api.asServiceRole.entities.ScanEvent.list("-created_date", 800);
        const existingV2 = recent.filter((s) => s.operator === SCAN_OPERATOR_V2).length;
        const toAdd = Math.max(0, LIFECYCLE_SCAN_TARGET - existingV2);
        for (let n = 0; n < toAdd; n++) {
          const tagIdx = (n * 11) % EXTENDED_TAG_COUNT + 1;
          const uid = demoTagUid(tagIdx);
          const tags = await api.asServiceRole.entities.TagRegistry.filter({ tag_uid: uid });
          const tag = tags[0];
          if (!tag) continue;
          const batchIdx = (tagIdx - 1) % EXTENDED_BATCH_COUNT;
          const st = DEMO_STATES[batchIdx % DEMO_STATES.length];
          const ev =
            EVENT_TYPES_LIFECYCLE[(n % (EVENT_TYPES_LIFECYCLE.length - 1)) + 1];
          const suspicious = ev === "seizure" || (n % 17 === 0 && ev !== "commissioning");
          const { latitude, longitude } = jitterCoord(st.lat, st.lng, n + 999);
          await api.asServiceRole.entities.ScanEvent.create({
            tag_uid: uid,
            product_name: tag.product_name,
            batch_number: tag.batch_number,
            event_type: ev,
            location: `${st.display} — ${ev.replace(/_/g, " ")} node ${n % 8}`,
            state: st.display,
            operator: SCAN_OPERATOR_V2,
            status: suspicious ? "suspicious" : "authentic",
            anomaly_flags: suspicious ? ["geo_mismatch"] : [],
            latitude,
            longitude,
          });
          summary.lifecycle_scans_created++;
        }
      } catch (e) {
        summary.errors.push(`Lifecycle scans: ${(e as Error).message}`);
      }

      try {
        const allAlerts = await api.asServiceRole.entities.DiversionAlert.list("-created_date", 400);
        const have = new Set(
          allAlerts.map((a) => a.alert_number).filter((x) => x?.startsWith(DEMO_ALERT_PREFIX)),
        );
        for (let i = 1; i <= 24; i++) {
          const alertNum = `${DEMO_ALERT_PREFIX}${String(i).padStart(2, "0")}`;
          if (have.has(alertNum)) continue;
          const batchIdx = (i * 3) % EXTENDED_BATCH_COUNT;
          const b = extendedBatches[batchIdx];
          const st = DEMO_STATES[(i * 2) % DEMO_STATES.length];
          const batches = await api.asServiceRole.entities.Batch.filter({ batch_number: b.batch_number });
          const batch = batches[0];
          await api.asServiceRole.entities.DiversionAlert.create({
            alert_number: alertNum,
            alert_type: alertTypes[i % alertTypes.length],
            severity: i % 5 === 0 ? "critical" : i % 3 === 0 ? "high" : "medium",
            status: "open",
            product_name: b.product_name,
            batch_number: b.batch_number,
            batch_id: batch?.id,
            expected_zone: b.authorised_zones[0] || st.display,
            detected_zone: st.display,
            detected_location: `${st.display} — seeded outlet ${i}`,
            details: `Full-lifecycle demo alert ${i}: ${alertTypes[i % alertTypes.length]} for regulator training.`,
            latitude: st.lat,
            longitude: st.lng,
          });
          summary.demo_alerts_created++;
        }
      } catch (e) {
        summary.errors.push(`Demo alerts: ${(e as Error).message}`);
      }

      try {
        const crList = await api.asServiceRole.entities.ConsumerReport.list("-created_date", 200);
        const haveS = new Set(
          crList.map((r) => r.serial_number).filter((x) => x?.startsWith(DEMO_CONSUMER_PREFIX)),
        );
        for (let i = 1; i <= 22; i++) {
          const serial = `${DEMO_CONSUMER_PREFIX}${String(i).padStart(3, "0")}`;
          if (haveS.has(serial)) continue;
          const batchIdx = (i * 5) % EXTENDED_BATCH_COUNT;
          const b = extendedBatches[batchIdx];
          await api.asServiceRole.entities.ConsumerReport.create({
            serial_number: serial,
            product_name: b.product_name,
            batch_number: b.batch_number,
            manufacturer: b.manufacturer_name,
            reported_status: reportedMix[i % reportedMix.length],
            input_mode: i % 3 === 0 ? "photo" : "serial",
            incident_status: consumerStatuses[i % consumerStatuses.length],
            priority: i % 4 === 0 ? "critical" : i % 3 === 0 ? "high" : "medium",
            last_scan_location: `${DEMO_STATES[i % DEMO_STATES.length].display} — consumer demo`,
            reporter_phone: i % 2 === 0 ? "+2348000000000" : undefined,
          });
          summary.demo_consumer_reports_created++;
        }
      } catch (e) {
        summary.errors.push(`Demo consumer reports: ${(e as Error).message}`);
      }

      try {
        const irList = await api.asServiceRole.entities.InspectionReport.list("-created_date", 200);
        const haveR = new Set(
          irList.map((r) => r.report_number).filter((x) => x?.startsWith(DEMO_INSPECTION_PREFIX)),
        );
        for (let i = 1; i <= 16; i++) {
          const reportNum = `${DEMO_INSPECTION_PREFIX}${String(i).padStart(2, "0")}`;
          if (haveR.has(reportNum)) continue;
          const batchIdx = (i * 7) % EXTENDED_BATCH_COUNT;
          const b = extendedBatches[batchIdx];
          const st = DEMO_STATES[i % DEMO_STATES.length];
          await api.asServiceRole.entities.InspectionReport.create({
            report_number: reportNum,
            inspector_name: `Demo Inspector ${(i % 5) + 1}`,
            inspector_id: `NF-DEMO-${100 + i}`,
            location: `${st.display} — wholesale row ${i}`,
            state: st.display,
            outlet_name: `Demo Outlet ${i}`,
            batch_numbers: b.batch_number,
            product_names: b.product_name,
            findings: `Seeded inspection ${i}: packaging, batch label alignment, and cold-chain markers reviewed. Demo data for enforcement UI.`,
            recommendation: recommendations[i % recommendations.length],
            photo_urls: evidencePhotoUrls(`insp-${i}`, 2 + (i % 2)),
            status: "submitted",
          });
          summary.inspection_reports_created++;
        }
      } catch (e) {
        summary.errors.push(`Demo inspection reports: ${(e as Error).message}`);
      }

      for (let i = 0; i < 14; i++) {
        const b = extendedBatches[(i * 5) % EXTENDED_BATCH_COUNT];
        try {
          const ex = await api.asServiceRole.entities.BatchStatus.filter({ batch_number: b.batch_number });
          if (ex[0]) {
            summary.batch_status_existing++;
            continue;
          }
          const statuses = ["active", "hold", "quarantine", "recalled", "cleared"] as const;
          const st = statuses[i % statuses.length];
          await api.asServiceRole.entities.BatchStatus.create({
            batch_number: b.batch_number,
            product_name: b.product_name,
            manufacturer: b.manufacturer_name,
            status: st,
            reason: `Demo batch status ${i + 1} — training record`,
            updated_by: user.email,
            units_affected: 50 + i * 10,
            expiry_date: b.expiry_date,
          });
          summary.batch_status_created++;
        } catch (e) {
          summary.errors.push(`BatchStatus ${b.batch_number}: ${(e as Error).message}`);
        }
      }

      try {
        const transfers = await api.asServiceRole.entities.CustodyTransfer.list("-created_date", 200);
        const haveT = new Set(transfers.map((t) => t.transfer_number).filter((x) => x?.startsWith("TRF-DEMO-V2-")));
        for (let i = 1; i <= 18; i++) {
          const transferNum = `TRF-DEMO-V2-${String(i).padStart(2, "0")}`;
          if (haveT.has(transferNum)) continue;
          const tagIdx = (i * 4) % EXTENDED_TAG_COUNT + 1;
          const uid = demoTagUid(tagIdx);
          const tags = await api.asServiceRole.entities.TagRegistry.filter({ tag_uid: uid });
          const tag = tags[0];
          if (!tag) continue;
          const types = ["port_receipt", "wholesale_transfer", "retail_receipt", "returns", "seizure"] as const;
          const tt = types[i % types.length];
          const st = DEMO_STATES[(i * 3) % DEMO_STATES.length];
          const fromId = partnerIds[(i - 1) % Math.max(1, partnerIds.length)] || null;
          const toId = partnerIds[i % Math.max(1, partnerIds.length)] || null;
          const { latitude, longitude } = jitterCoord(st.lat, st.lng, i + 5000);
          const scanEvent = await api.asServiceRole.entities.ScanEvent.create({
            tag_uid: uid,
            product_name: tag.product_name,
            batch_number: tag.batch_number,
            event_type: tt,
            location: `${st.display} — custody demo ${i}`,
            state: st.display,
            operator: SCAN_OPERATOR_V2,
            status: tt === "seizure" ? "suspicious" : "authentic",
            anomaly_flags: tt === "seizure" ? ["chain_break"] : [],
            latitude,
            longitude,
          });
          await api.asServiceRole.entities.CustodyTransfer.create({
            transfer_number: transferNum,
            tag_uid: uid,
            batch_number: tag.batch_number,
            product_name: tag.product_name,
            transfer_type: tt,
            from_partner_id: fromId,
            to_partner_id: toId,
            to_partner_name: `TraceGuard Demo Partner ${(i % 10) + 1}`,
            transfer_location: `${st.display} — bonded facility`,
            transfer_state: st.display,
            units_transferred: 10 + (i % 20) * 5,
            scan_event_id: scanEvent.id,
            status: "confirmed",
            operator_name: user.email,
            latitude,
            longitude,
            notes: `Seeded custody transfer ${i} for chain-of-custody views.`,
          });
          summary.custody_transfers_created++;
        }
      } catch (e) {
        summary.errors.push(`Custody transfers: ${(e as Error).message}`);
      }
    }

    return Response.json({
      success: true,
      summary,
      plan,
      message:
        "Seed complete. Inspector demo UIDs: NG-TG-00041872 (hold), NG-TG-00091234 (active), NG-TG-00055678 (recalled). " +
        (fullLifecycleDemo
          ? `Extended: ${EXTENDED_BATCH_COUNT} DEMO-TS26 batches, tags ${demoTagUid(1)}…${demoTagUid(EXTENDED_TAG_COUNT)}, case ${CASE_TAG_UID} + 3 children.`
          : ""),
    });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
});