/**
 * recordCustodyTransfer — record a supply chain custody handoff
 *
 * Payload: {
 *   tag_uid, batch_number, product_name, transfer_type,
 *   from_partner_id, to_partner_id, to_partner_name,
 *   transfer_location, transfer_state, units_transferred,
 *   operator_name, latitude, longitude, notes
 * }
 *
 * transfer_type: port_receipt | wholesale_transfer | retail_receipt | returns | seizure
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const {
      tag_uid, batch_number, product_name, transfer_type,
      from_partner_id, to_partner_id, to_partner_name,
      transfer_location, transfer_state, units_transferred,
      operator_name, latitude, longitude, notes,
    } = body;

    if (!tag_uid || !batch_number || !transfer_type || !to_partner_name) {
      return Response.json({ error: 'tag_uid, batch_number, transfer_type, and to_partner_name are required' }, { status: 400 });
    }

    const transferNum = `TRF-${Date.now().toString().slice(-8)}`;

    // 1. Create the scan event for the transfer
    const scanEvent = await base44.asServiceRole.entities.ScanEvent.create({
      tag_uid,
      product_name,
      batch_number,
      event_type: transfer_type,
      location: transfer_location,
      state: transfer_state,
      operator: operator_name || user.email,
      status: 'authentic',
      anomaly_flags: [],
      latitude,
      longitude,
    });

    // 2. Create the custody transfer record
    const transfer = await base44.asServiceRole.entities.CustodyTransfer.create({
      transfer_number: transferNum,
      tag_uid,
      batch_number,
      product_name,
      transfer_type,
      from_partner_id,
      to_partner_id,
      to_partner_name,
      transfer_location,
      transfer_state,
      units_transferred,
      scan_event_id: scanEvent.id,
      status: 'confirmed',
      operator_name: operator_name || user.email,
      latitude,
      longitude,
      notes,
    });

    // 3. Update tag custody
    const tags = await base44.asServiceRole.entities.TagRegistry.filter({ tag_uid });
    if (tags[0]) {
      await base44.asServiceRole.entities.TagRegistry.update(tags[0].id, {
        current_custody_partner_id: to_partner_id || null,
        supply_chain_stage: transferTypeToStage(transfer_type),
        last_scan_date: new Date().toISOString(),
        last_scan_location: transfer_location,
        total_scans: (tags[0].total_scans || 0) + 1,
      });
    }

    // 4. Update batch stage and reconciliation
    const batches = await base44.asServiceRole.entities.Batch.filter({ batch_number });
    if (batches[0]) {
      await base44.asServiceRole.entities.Batch.update(batches[0].id, {
        supply_chain_stage: transferTypeToStage(transfer_type),
        current_custody: to_partner_id || to_partner_name,
        total_scan_count: (batches[0].total_scan_count || 0) + 1,
        units_reconciled: transfer_type === 'retail_receipt'
          ? (batches[0].units_reconciled || 0) + (units_transferred || 1)
          : batches[0].units_reconciled,
      });
    }

    // 5. Update sending partner flagged transfer count (for risk scoring)
    if (from_partner_id) {
      const partners = await base44.asServiceRole.entities.Partner.filter({ id: from_partner_id });
      if (partners[0]) {
        await base44.asServiceRole.entities.Partner.update(partners[0].id, {
          total_transfers: (partners[0].total_transfers || 0) + 1,
        });
      }
    }

    return Response.json({
      success: true,
      transfer_number: transferNum,
      transfer_id: transfer.id,
      scan_event_id: scanEvent.id,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function transferTypeToStage(transfer_type) {
  const map = {
    port_receipt: 'port_receipt',
    wholesale_transfer: 'wholesale',
    retail_receipt: 'retail',
    seizure: 'unknown',
    returns: 'wholesale',
  };
  return map[transfer_type] || 'unknown';
}