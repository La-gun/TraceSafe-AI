/**
 * disaggregateTag — break a child tag out of its parent aggregation
 *
 * Payload: { child_tag_uid, reason, operator_name }
 *
 * Sets the AggregationLink to 'disaggregated' and clears parent_tag_uid on the TagRegistry.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const api = createClientFromRequest(req);
    const user = await api.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { child_tag_uid, reason, operator_name } = body;

    if (!child_tag_uid) {
      return Response.json({ error: 'child_tag_uid is required' }, { status: 400 });
    }

    // Find active aggregation link
    const links = await api.asServiceRole.entities.AggregationLink.filter({
      child_tag_uid,
      status: 'active',
    });

    if (!links.length) {
      return Response.json({ error: 'No active aggregation link found for this tag' }, { status: 404 });
    }

    const link = links[0];

    // Mark link as disaggregated
    await api.asServiceRole.entities.AggregationLink.update(link.id, {
      status: 'disaggregated',
      disaggregated_at: new Date().toISOString(),
    });

    // Clear parent on the tag registry
    const tags = await api.asServiceRole.entities.TagRegistry.filter({ tag_uid: child_tag_uid });
    if (tags[0]) {
      await api.asServiceRole.entities.TagRegistry.update(tags[0].id, {
        parent_tag_uid: null,
      });
    }

    // Write a scan event for audit
    await api.asServiceRole.entities.ScanEvent.create({
      tag_uid: child_tag_uid,
      product_name: link.product_name,
      batch_number: link.batch_number,
      event_type: 'aggregation',
      location: 'Disaggregation event',
      operator: operator_name || user.email,
      status: 'authentic',
      anomaly_flags: [],
    });

    return Response.json({
      success: true,
      disaggregated_from: link.parent_tag_uid,
      child_tag_uid,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});