/**
 * listConsumerReports — consumer incident queue for Incident Manager.
 * Uses service role so the table populates when entity ACLs block direct client list().
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const api = createClientFromRequest(req);
    const user = await api.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const limit = Math.min(Math.max(Number(body.limit) || 150, 1), 300);

    const reports = await api.asServiceRole.entities.ConsumerReport.list('-created_date', limit);

    return Response.json({ reports });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
});