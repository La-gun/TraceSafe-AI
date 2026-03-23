import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete all entity records created by this user
    const entitiesToClean = ['InspectionReport', 'ContactLead', 'BatchStatus'];
    for (const entityName of entitiesToClean) {
      try {
        const records = await base44.entities[entityName].filter({ created_by: user.email });
        for (const record of records) {
          await base44.entities[entityName].delete(record.id);
        }
      } catch (_) {
        // Entity may not exist for this user — continue
      }
    }

    return Response.json({ success: true, message: 'Account data deleted successfully.' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});