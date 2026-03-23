/**
 * updateBatchEnforcement — apply enforcement action to a batch
 *
 * Payload: {
 *   batch_number, status, reason, report_reference, units_affected
 * }
 * status: hold | quarantine | recalled | cleared | active
 *
 * Updates Batch + BatchStatus entities and opens a DiversionAlert if applicable.
 * Admin-only.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden: Admin only' }, { status: 403 });

    const body = await req.json();
    const { batch_number, status, reason, report_reference, units_affected } = body;

    if (!batch_number || !status) {
      return Response.json({ error: 'batch_number and status are required' }, { status: 400 });
    }

    const validStatuses = ['active', 'hold', 'quarantine', 'recalled', 'cleared'];
    if (!validStatuses.includes(status)) {
      return Response.json({ error: `status must be one of: ${validStatuses.join(', ')}` }, { status: 400 });
    }

    // 1. Update or create BatchStatus record
    const existing = await base44.asServiceRole.entities.BatchStatus.filter({ batch_number });
    let batchStatusRecord;
    if (existing.length > 0) {
      batchStatusRecord = await base44.asServiceRole.entities.BatchStatus.update(existing[0].id, {
        status,
        reason,
        updated_by: user.email,
        report_reference,
        units_affected,
      });
    } else {
      // Look up product info from Batch
      const batches = await base44.asServiceRole.entities.Batch.filter({ batch_number });
      const batch = batches[0];
      batchStatusRecord = await base44.asServiceRole.entities.BatchStatus.create({
        batch_number,
        product_name: batch?.product_name || 'Unknown',
        manufacturer: batch?.manufacturer_name || 'Unknown',
        status,
        reason,
        updated_by: user.email,
        report_reference,
        units_affected,
        expiry_date: batch?.expiry_date,
      });
    }

    // 2. Update the Batch entity enforcement status
    const batches = await base44.asServiceRole.entities.Batch.filter({ batch_number });
    if (batches.length > 0) {
      await base44.asServiceRole.entities.Batch.update(batches[0].id, {
        enforcement_status: status,
        enforcement_reason: reason,
        enforcement_updated_by: user.email,
      });
    }

    // 3. If recalled or quarantine — create a DiversionAlert
    if (['recalled', 'quarantine'].includes(status)) {
      const alertNum = `ALT-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(Math.random()*1000).toString().padStart(3,'0')}`;
      const batch = batches[0];
      await base44.asServiceRole.entities.DiversionAlert.create({
        alert_number: alertNum,
        alert_type: status === 'recalled' ? 'recall_active' : 'chain_break',
        severity: status === 'recalled' ? 'critical' : 'high',
        status: 'open',
        product_name: batch?.product_name || 'Unknown',
        batch_number,
        batch_id: batch?.id,
        details: reason || `Batch ${batch_number} set to ${status} by ${user.email}.`,
        linked_report_id: report_reference,
        units_at_risk: units_affected,
      });
    }

    return Response.json({
      success: true,
      batch_number,
      new_status: status,
      batch_status_id: batchStatusRecord.id,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});