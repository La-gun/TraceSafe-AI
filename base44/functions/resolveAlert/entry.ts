/**
 * resolveAlert — update a DiversionAlert status and optionally link an InspectionReport
 *
 * Payload: {
 *   alert_id, status, resolution_notes, linked_report_id,
 *   assigned_inspector_name, assigned_inspector_id
 * }
 * status: assigned | under_investigation | resolved | false_positive
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { alert_id, status, resolution_notes, linked_report_id, assigned_inspector_name, assigned_inspector_id } = body;

    if (!alert_id || !status) {
      return Response.json({ error: 'alert_id and status are required' }, { status: 400 });
    }

    const updates = { status, resolution_notes };

    if (linked_report_id) updates.linked_report_id = linked_report_id;
    if (assigned_inspector_name) updates.assigned_inspector_name = assigned_inspector_name;
    if (assigned_inspector_id) updates.assigned_inspector_id = assigned_inspector_id;
    if (status === 'resolved' || status === 'false_positive') {
      updates.resolved_at = new Date().toISOString();
    }

    const updated = await base44.asServiceRole.entities.DiversionAlert.update(alert_id, updates);

    return Response.json({ success: true, alert: updated });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});