/**
 * commissionTag — register a new NFC tag at manufacture
 *
 * Payload: {
 *   tag_uid, tag_type, batch_number, product_name, product_id,
 *   batch_id, serial_number, parent_tag_uid,
 *   commissioning_location, manufacturer_partner_id, sdm_key_version
 * }
 *
 * Creates TagRegistry record + initial ScanEvent + AggregationLink (if parent provided).
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
    const {
      tag_uid, tag_type = 'item', batch_number, product_name, product_id, batch_id,
      serial_number, parent_tag_uid, commissioning_location, manufacturer_partner_id,
      sdm_key_version = 1,
    } = body;

    if (!tag_uid || !batch_number || !product_name) {
      return Response.json({ error: 'tag_uid, batch_number, product_name required' }, { status: 400 });
    }

    // Prevent duplicate commissioning
    const existing = await base44.asServiceRole.entities.TagRegistry.filter({ tag_uid });
    if (existing.length > 0) {
      return Response.json({ error: 'Tag already registered', tag: existing[0] }, { status: 409 });
    }

    const today = new Date().toISOString().slice(0, 10);

    // 1. Create tag registry entry
    const tag = await base44.asServiceRole.entities.TagRegistry.create({
      tag_uid,
      tag_type,
      product_id,
      batch_id,
      batch_number,
      product_name,
      serial_number,
      parent_tag_uid: parent_tag_uid || null,
      commissioning_date: today,
      commissioning_location,
      status: 'active',
      total_scans: 0,
      supply_chain_stage: 'commissioned',
      current_custody_partner_id: manufacturer_partner_id || null,
      sdm_key_version,
      ndef_url_template: `https://verify.traceguard.ng/v/${tag_uid}`,
    });

    // 2. Write commissioning scan event
    await base44.asServiceRole.entities.ScanEvent.create({
      tag_uid,
      product_name,
      batch_number,
      event_type: 'commissioning',
      location: commissioning_location || 'Factory',
      operator: user.email,
      status: 'authentic',
      anomaly_flags: [],
    });

    // 3. Create aggregation link if parent tag provided
    if (parent_tag_uid) {
      const parentTags = await base44.asServiceRole.entities.TagRegistry.filter({ tag_uid: parent_tag_uid });
      const parentTag = parentTags[0];
      await base44.asServiceRole.entities.AggregationLink.create({
        parent_tag_uid,
        child_tag_uid: tag_uid,
        parent_type: parentTag?.tag_type || 'case',
        child_type: tag_type,
        batch_number,
        product_name,
        aggregated_by_partner_id: manufacturer_partner_id,
        aggregated_at_location: commissioning_location,
        status: 'active',
      });
    }

    // 4. Update batch commissioned count
    if (batch_id) {
      const batches = await base44.asServiceRole.entities.Batch.filter({ id: batch_id });
      if (batches[0]) {
        await base44.asServiceRole.entities.Batch.update(batch_id, {
          units_commissioned: (batches[0].units_commissioned || 0) + 1,
        });
      }
    }

    return Response.json({ success: true, tag_id: tag.id, tag_uid, serial_number });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});