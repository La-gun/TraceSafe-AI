/**
 * getDashboardStats — aggregate KPIs for the enforcement dashboard
 *
 * Returns:
 *   total_scans, authentic_scans, suspicious_scans, counterfeit_scans,
 *   open_alerts, critical_alerts, active_batches, recalled_batches,
 *   scan_by_state (top 10), recent_alerts, recent_events
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Fetch in parallel
    const [scanEvents, alerts, batches, transfers] = await Promise.all([
      base44.asServiceRole.entities.ScanEvent.list('-created_date', 500),
      base44.asServiceRole.entities.DiversionAlert.list('-created_date', 200),
      base44.asServiceRole.entities.Batch.list('-created_date', 200),
      base44.asServiceRole.entities.CustodyTransfer.list('-created_date', 100),
    ]);

    // Scan breakdowns
    const total_scans      = scanEvents.length;
    const authentic_scans  = scanEvents.filter(s => s.status === 'authentic').length;
    const suspicious_scans = scanEvents.filter(s => s.status === 'suspicious').length;
    const counterfeit_scans = scanEvents.filter(s => s.status === 'counterfeit').length;

    // Alerts
    const open_alerts     = alerts.filter(a => a.status === 'open').length;
    const critical_alerts = alerts.filter(a => a.severity === 'critical' && a.status === 'open').length;

    // Batches
    const active_batches   = batches.filter(b => b.enforcement_status === 'active').length;
    const recalled_batches = batches.filter(b => b.enforcement_status === 'recalled').length;
    const held_batches     = batches.filter(b => ['hold', 'quarantine'].includes(b.enforcement_status)).length;

    // Scans by state (top 10)
    const stateCount = {};
    for (const s of scanEvents) {
      if (s.state) stateCount[s.state] = (stateCount[s.state] || 0) + 1;
    }
    const scan_by_state = Object.entries(stateCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([state, count]) => ({ state, count }));

    // Suspicious scans by state
    const suspStateCount = {};
    for (const s of scanEvents.filter(e => e.status === 'suspicious')) {
      if (s.state) suspStateCount[s.state] = (suspStateCount[s.state] || 0) + 1;
    }
    const suspicious_by_state = Object.entries(suspStateCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([state, count]) => ({ state, count }));

    // Scans per day (last 7 days)
    const now = Date.now();
    const scan_by_day = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now - i * 86400000);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart.getTime() + 86400000);
      const dayLabel = dayStart.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
      const dayScans = scanEvents.filter(s => {
        const t = new Date(s.created_date).getTime();
        return t >= dayStart.getTime() && t < dayEnd.getTime();
      });
      scan_by_day.push({
        date: dayLabel,
        authentic: dayScans.filter(s => s.status === 'authentic').length,
        suspicious: dayScans.filter(s => s.status === 'suspicious').length,
      });
    }

    return Response.json({
      total_scans,
      authentic_scans,
      suspicious_scans,
      counterfeit_scans,
      open_alerts,
      critical_alerts,
      active_batches,
      recalled_batches,
      held_batches,
      scan_by_state,
      suspicious_by_state,
      scan_by_day,
      recent_alerts: alerts.filter(a => a.status === 'open').slice(0, 10),
      recent_events: scanEvents.slice(0, 20),
      recent_transfers: transfers.slice(0, 10),
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});