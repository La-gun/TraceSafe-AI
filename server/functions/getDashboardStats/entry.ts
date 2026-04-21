/**
 * getDashboardStats — aggregate KPIs for the enforcement dashboard
 *
 * Returns:
 *   total_scans, authentic_scans, suspicious_scans, counterfeit_scans,
 *   open_alerts, critical_alerts, active_batches, recalled_batches,
 *   scan_by_state (top 10), recent_alerts, recent_events
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const api = createClientFromRequest(req);
    const user = await api.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Fetch in parallel
    const [scanEvents, alerts, batches, transfers] = await Promise.all([
      api.asServiceRole.entities.ScanEvent.list('-created_date', 500),
      api.asServiceRole.entities.DiversionAlert.list('-created_date', 200),
      api.asServiceRole.entities.Batch.list('-created_date', 200),
      api.asServiceRole.entities.CustodyTransfer.list('-created_date', 100),
    ]);

    // Scan breakdowns + per-state counts in one pass
    let authentic_scans = 0, suspicious_scans = 0, counterfeit_scans = 0;
    const stateCount = {};
    const suspStateCount = {};
    for (const s of scanEvents) {
      if (s.status === 'authentic') authentic_scans++;
      else if (s.status === 'suspicious') suspicious_scans++;
      else if (s.status === 'counterfeit') counterfeit_scans++;
      if (s.state) {
        stateCount[s.state] = (stateCount[s.state] || 0) + 1;
        if (s.status === 'suspicious') {
          suspStateCount[s.state] = (suspStateCount[s.state] || 0) + 1;
        }
      }
    }
    const total_scans = scanEvents.length;

    // Alerts (single pass)
    let open_alerts = 0, critical_alerts = 0;
    const openAlertRows = [];
    for (const a of alerts) {
      if (a.status === 'open') {
        open_alerts++;
        if (a.severity === 'critical') critical_alerts++;
        if (openAlertRows.length < 10) openAlertRows.push(a);
      }
    }

    // Batches (single pass)
    let active_batches = 0, recalled_batches = 0, held_batches = 0;
    for (const b of batches) {
      const es = b.enforcement_status;
      if (es === 'active') active_batches++;
      else if (es === 'recalled') recalled_batches++;
      else if (es === 'hold' || es === 'quarantine') held_batches++;
    }

    const scan_by_state = Object.entries(stateCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([state, count]) => ({ state, count }));
    const suspicious_by_state = Object.entries(suspStateCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([state, count]) => ({ state, count }));

    // Scans per day (last 7 days) — single pass over scanEvents
    const now = Date.now();
    const dayMs = 86400000;
    const buckets = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now - i * dayMs);
      dayStart.setHours(0, 0, 0, 0);
      const t0 = dayStart.getTime();
      buckets.push({
        dayStart: t0,
        dayEnd: t0 + dayMs,
        label: dayStart.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
        authentic: 0,
        suspicious: 0,
      });
    }
    for (const s of scanEvents) {
      const t = new Date(s.created_date).getTime();
      for (const b of buckets) {
        if (t >= b.dayStart && t < b.dayEnd) {
          if (s.status === 'authentic') b.authentic++;
          else if (s.status === 'suspicious') b.suspicious++;
          break;
        }
      }
    }
    const scan_by_day = buckets.map(({ label, authentic, suspicious }) => ({
      date: label,
      authentic,
      suspicious,
    }));

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
      recent_alerts: openAlertRows,
      recent_events: scanEvents.slice(0, 20),
      recent_transfers: transfers.slice(0, 10),
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});