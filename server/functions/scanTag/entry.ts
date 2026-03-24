/**
 * scanTag — core verification endpoint
 *
 * Called when an NFC tag is tapped (or simulated).
 * Payload: { tag_uid, event_type, location, state, latitude, longitude, operator, partner_id }
 *
 * Returns the full product + batch record, diversion risk score,
 * chain history, and any active alerts.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';
import { fetchNftRegistryByTagUid } from '../_shared/nftRegistrySync.ts';

const ADVISORY_DISCLAIMER =
  'Advisory only — does not replace rule-based scan status. Use for triage and investigation priority.';

Deno.serve(async (req) => {
  try {
    const api = createClientFromRequest(req);
    const user = await api.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { tag_uid, event_type, location, state, latitude, longitude, operator, partner_id } = body;

    if (!tag_uid || !event_type) {
      return Response.json({ error: 'tag_uid and event_type are required' }, { status: 400 });
    }

    // 1. Look up tag in registry
    const tags = await api.asServiceRole.entities.TagRegistry.filter({ tag_uid });
    const tag = tags[0] || null;

    if (!tag) {
      // Unknown tag — log suspicious scan and return alert
      await api.asServiceRole.entities.ScanEvent.create({
        tag_uid,
        event_type: 'suspicious_scan',
        location: location || 'Unknown',
        state,
        operator: operator || user.email,
        status: 'suspicious',
        anomaly_flags: ['unregistered_tag'],
        latitude,
        longitude,
      });
      return Response.json({
        found: false,
        status: 'suspicious',
        alert: 'Tag not found in registry. This product may be counterfeit.',
        anomaly_flags: ['unregistered_tag'],
        advisory_risk: advisoryRiskUnregistered(),
      });
    }

    // 2. Look up batch
    const batches = await api.asServiceRole.entities.Batch.filter({ batch_number: tag.batch_number });
    const batch = batches[0] || null;

    // 3. Detect anomalies
    const anomaly_flags = [];
    let scan_status = 'authentic';
    /** Scans for this tag in the last hour, including the event we are about to record */
    let scans_in_hour_including_this = 0;

    if (batch) {
      // Expired product
      if (batch.expiry_date && new Date(batch.expiry_date) < new Date()) {
        anomaly_flags.push('expired_product');
        scan_status = 'suspicious';
      }

      // Recalled / held batch
      if (['recalled', 'hold', 'quarantine'].includes(batch.enforcement_status)) {
        anomaly_flags.push('recall_active');
        scan_status = 'suspicious';
      }

      // Zone mismatch — if state provided and batch has authorised zones
      if (state && batch.authorised_zones && batch.authorised_zones.length > 0) {
        const normalised = state.toLowerCase().trim();
        const authorised = batch.authorised_zones.map(z => z.toLowerCase().trim());
        if (!authorised.includes(normalised)) {
          anomaly_flags.push('geo_mismatch');
          anomaly_flags.push('out_of_zone');
          scan_status = 'suspicious';
        }
      }

      // Repeat scan — check if this tag was scanned >3 times in the last hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const recentScans = await api.asServiceRole.entities.ScanEvent.filter({ tag_uid });
      const veryRecentScans = recentScans.filter(s => s.created_date > oneHourAgo);
      scans_in_hour_including_this = veryRecentScans.length + 1;
      if (veryRecentScans.length >= 3) {
        anomaly_flags.push('repeat_scan');
        scan_status = 'suspicious';
      }
    }

    // 4. Write the scan event
    const scanEvent = await api.asServiceRole.entities.ScanEvent.create({
      tag_uid,
      product_name: tag.product_name,
      batch_number: tag.batch_number,
      event_type,
      location: location || tag.last_scan_location || 'Unknown',
      state,
      operator: operator || user.email,
      status: scan_status,
      anomaly_flags,
      latitude,
      longitude,
    });

    // 5. Update tag registry
    const tagUpdate = {
      last_scan_date: new Date().toISOString(),
      last_scan_location: location,
      total_scans: (tag.total_scans || 0) + 1,
      supply_chain_stage: eventTypeToStage(event_type),
    };
    if (!tag.first_scan_date) tagUpdate.first_scan_date = new Date().toISOString();
    await api.asServiceRole.entities.TagRegistry.update(tag.id, tagUpdate);

    // 6. Update batch counters
    if (batch) {
      const batchUpdate = {
        total_scan_count: (batch.total_scan_count || 0) + 1,
        supply_chain_stage: eventTypeToStage(event_type),
      };
      if (anomaly_flags.length > 0) {
        batchUpdate.suspicious_scan_count = (batch.suspicious_scan_count || 0) + 1;
        // Simple diversion score bump
        batchUpdate.diversion_score = Math.min(100, (batch.diversion_score || 0) + 15);
        // Merge anomaly flags without duplicates
        const existingFlags = batch.anomaly_flags || [];
        batchUpdate.anomaly_flags = [...new Set([...existingFlags, ...anomaly_flags])];
      }
      await api.asServiceRole.entities.Batch.update(batch.id, batchUpdate);
    }

    // 7. Raise diversion alert if suspicious
    if (anomaly_flags.length > 0) {
      const alertNum = `ALT-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(Math.random()*1000).toString().padStart(3,'0')}`;
      await api.asServiceRole.entities.DiversionAlert.create({
        alert_number: alertNum,
        alert_type: anomaly_flags[0],
        severity: anomaly_flags.includes('recall_active') || anomaly_flags.includes('expired_product') ? 'critical' : anomaly_flags.includes('geo_mismatch') ? 'high' : 'medium',
        status: 'open',
        product_name: tag.product_name,
        batch_number: tag.batch_number,
        batch_id: batch?.id,
        tag_uid,
        scan_event_id: scanEvent.id,
        expected_zone: batch?.authorised_zones?.[0] || 'Not specified',
        detected_zone: state || location || 'Unknown',
        detected_location: location,
        latitude,
        longitude,
        details: buildAlertDetails(anomaly_flags, tag.product_name, state, location),
      });
    }

    // 8. Get full scan history for this batch
    const chainHistory = await api.asServiceRole.entities.ScanEvent.filter({ batch_number: tag.batch_number });
    chainHistory.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));

    const batchForResponse = mergeBatchAfterScan(batch, anomaly_flags, event_type);

    const advisory_risk = computeAdvisoryRisk({
      batch: batchForResponse,
      anomaly_flags,
      chainHistory,
      scansInHourIncludingThis: scans_in_hour_including_this,
      rule_scan_status: scan_status,
    });

    let nft_registry = null;
    try {
      nft_registry = await fetchNftRegistryByTagUid(tag_uid);
    } catch {
      nft_registry = null;
    }

    return Response.json({
      found: true,
      status: scan_status,
      anomaly_flags,
      tag,
      batch: batchForResponse || batch,
      scan_event_id: scanEvent.id,
      chain_history: chainHistory,
      advisory_risk,
      nft_registry,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function eventTypeToStage(event_type) {
  const map = {
    commissioning: 'commissioned',
    port_receipt: 'port_receipt',
    wholesale_transfer: 'wholesale',
    retail_receipt: 'retail',
    consumer_verification: 'consumer',
  };
  return map[event_type] || 'unknown';
}

function buildAlertDetails(flags, product, state, location) {
  const msgs = [];
  if (flags.includes('geo_mismatch')) msgs.push(`Product detected outside authorised distribution zone (${state || location}).`);
  if (flags.includes('recall_active')) msgs.push('Batch is subject to an active recall order.');
  if (flags.includes('repeat_scan')) msgs.push('Tag scanned repeatedly in a short window — possible duplication.');
  if (flags.includes('expired_product')) msgs.push('Product has passed its expiry date.');
  if (flags.includes('unregistered_tag')) msgs.push('Tag UID not found in NAFDAC registry — possible counterfeit.');
  return msgs.join(' ');
}

function mergeBatchAfterScan(batch, anomaly_flags, event_type) {
  if (!batch) return null;
  const merged = {
    ...batch,
    total_scan_count: (batch.total_scan_count || 0) + 1,
    supply_chain_stage: eventTypeToStage(event_type),
  };
  if (anomaly_flags.length > 0) {
    merged.suspicious_scan_count = (batch.suspicious_scan_count || 0) + 1;
    merged.diversion_score = Math.min(100, (batch.diversion_score || 0) + 15);
    merged.anomaly_flags = [...new Set([...(batch.anomaly_flags || []), ...anomaly_flags])];
  }
  return merged;
}

function normState(s) {
  return String(s ?? '')
    .toLowerCase()
    .trim();
}

/**
 * Heuristic advisory layer on top of rule outputs — never changes `status` / `anomaly_flags`.
 */
function computeAdvisoryRisk(opts) {
  const factors = [];
  let score = 0;
  const { batch, anomaly_flags, chainHistory, scansInHourIncludingThis, rule_scan_status } = opts;

  if (batch) {
    const div = Number(batch.diversion_score ?? 0);
    if (!Number.isNaN(div) && div > 0) {
      score += Math.min(38, div * 0.38);
      if (div >= 75) factors.push('batch_diversion_score_high');
      else if (div >= 50) factors.push('batch_diversion_score_elevated');
    }

    const es = String(batch.enforcement_status || '');
    if (es === 'active' && !Number.isNaN(Number(batch.diversion_score)) && Number(batch.diversion_score) >= 60) {
      score += 6;
      factors.push('active_batch_elevated_diversion');
    }
  }

  score += Math.min(34, anomaly_flags.length * 11);
  for (const f of anomaly_flags) {
    factors.push(`anomaly:${f}`);
  }

  const recent = (chainHistory || []).slice(-15);
  const states = new Set();
  for (const ev of recent) {
    const st = normState(ev.state);
    if (st) states.add(st);
  }
  if (states.size >= 4) {
    score += 18;
    factors.push('chain_multi_state_spread');
  } else if (states.size === 3) {
    score += 10;
    factors.push('chain_several_states');
  }

  if (scansInHourIncludingThis === 2) {
    score += 12;
    factors.push('rapid_rescan_subthreshold');
  } else if (scansInHourIncludingThis >= 4) {
    score += 8;
    factors.push('high_scan_velocity');
  }

  if (rule_scan_status === 'authentic' && score >= 55 && anomaly_flags.length === 0) {
    factors.push('elevated_context_rule_clean');
  }

  score = Math.round(Math.min(100, Math.max(0, score)));
  const band = score >= 72 ? 'high' : score >= 42 ? 'elevated' : 'low';

  return {
    advisory_risk_score: score,
    advisory_risk_band: band,
    advisory_factors: [...new Set(factors)],
    advisory_disclaimer: ADVISORY_DISCLAIMER,
  };
}

function advisoryRiskUnregistered() {
  return {
    advisory_risk_score: 94,
    advisory_risk_band: 'high',
    advisory_factors: ['unregistered_tag'],
    advisory_disclaimer: ADVISORY_DISCLAIMER,
  };
}