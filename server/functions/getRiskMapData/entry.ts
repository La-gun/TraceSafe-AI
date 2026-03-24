/**
 * getRiskMapData — batches + diversion alerts for the Risk Dashboard heatmap.
 * Uses service role so reads succeed under typical entity ACLs (client list() often returns [] for guests).
 * Any signed-in user may call; tighten to role === "admin" in your auth config if required.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const api = createClientFromRequest(req);
    const user = await api.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const [batches, alerts] = await Promise.all([
      api.asServiceRole.entities.Batch.list('-created_date', 250),
      api.asServiceRole.entities.DiversionAlert.list('-created_date', 250),
    ]);

    return Response.json({ batches, alerts });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
});