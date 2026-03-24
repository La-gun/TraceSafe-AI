const now = () => new Date().toISOString();
const daysAgo = (d) => new Date(Date.now() - d * 86400000).toISOString();

/** Risk map: batches + alerts for NigeriaHeatmap */
export const DEMO_RISK_MAP = {
  batches: [
    {
      id: 'demo-b1',
      batch_number: 'AMX-2026-0341',
      product_name: 'Amoxicillin 500mg',
      plant_location: 'Swiss Pharma — Lagos',
      diversion_score: 82,
      enforcement_status: 'hold',
      authorised_zones: ['Lagos', 'Ogun'],
      expiry_date: '2027-08-01',
    },
    {
      id: 'demo-b2',
      batch_number: 'MET-2026-0112',
      product_name: 'Metformin 850mg',
      plant_location: 'HealthCore — Kano',
      diversion_score: 45,
      enforcement_status: 'active',
      authorised_zones: ['Kano', 'Kaduna'],
      expiry_date: '2028-01-15',
    },
    {
      id: 'demo-b3',
      batch_number: 'CIP-2026-0089',
      product_name: 'Ciprofloxacin 250mg',
      plant_location: 'Port Harcourt — Rivers',
      diversion_score: 68,
      enforcement_status: 'active',
      authorised_zones: ['Rivers', 'Bayelsa'],
      expiry_date: '2027-11-20',
    },
    {
      id: 'demo-b4',
      batch_number: 'ART-2026-0023',
      product_name: 'Artemether/Lumefantrine',
      plant_location: 'Abuja FCT — Garki',
      diversion_score: 22,
      enforcement_status: 'active',
      authorised_zones: ['FCT', 'Nasarawa'],
      expiry_date: '2028-05-01',
    },
    {
      id: 'demo-b5',
      batch_number: 'PAR-2026-0567',
      product_name: 'Paracetamol 500mg',
      plant_location: 'Ibadan — Oyo',
      diversion_score: 15,
      enforcement_status: 'active',
      authorised_zones: ['Oyo', 'Osun'],
      expiry_date: '2029-02-28',
    },
    {
      id: 'demo-b6',
      batch_number: 'HS-2026-0045',
      product_name: 'Hand Sanitizer 500ml',
      plant_location: 'Kano — Sabon Gari',
      diversion_score: 91,
      enforcement_status: 'recalled',
      authorised_zones: ['Kano'],
      expiry_date: '2026-12-31',
    },
  ],
  alerts: [
    {
      id: 'demo-a1',
      alert_type: 'geo_mismatch',
      severity: 'high',
      status: 'open',
      product_name: 'Amoxicillin 500mg',
      batch_number: 'AMX-2026-0341',
      expected_zone: 'Lagos',
      detected_zone: 'Onitsha, Anambra',
      detected_location: 'Onitsha Wholesale',
      created_date: daysAgo(0.1),
    },
    {
      id: 'demo-a2',
      alert_type: 'repeat_scan',
      severity: 'high',
      status: 'open',
      product_name: 'Metformin 850mg',
      batch_number: 'MET-2026-0112',
      expected_zone: 'Kano',
      detected_zone: 'Kano, Kano State',
      created_date: daysAgo(0.3),
    },
    {
      id: 'demo-a3',
      alert_type: 'diversion_signal',
      severity: 'medium',
      status: 'open',
      product_name: 'Ciprofloxacin 250mg',
      batch_number: 'CIP-2026-0089',
      expected_zone: 'Rivers',
      detected_zone: 'Aba, Abia State',
      created_date: daysAgo(1),
    },
  ],
};

function buildScanByDay() {
  const out = [];
  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date(Date.now() - i * 86400000);
    dayStart.setHours(0, 0, 0, 0);
    const label = dayStart.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
    const base = 120 + (6 - i) * 15;
    out.push({
      date: label,
      authentic: base + (i % 5) * 4,
      suspicious: 8 + (i % 4) * 3,
    });
  }
  return out;
}

const demoAlertsForDashboard = [
  {
    id: 'da1',
    alert_type: 'repeat_scan',
    severity: 'high',
    status: 'open',
    product_name: 'Amoxicillin 500mg',
    batch_number: 'AMX-2026-0341',
    detected_zone: 'Onitsha, Anambra',
    created_date: daysAgo(0.05),
  },
  {
    id: 'da2',
    alert_type: 'geo_mismatch',
    severity: 'high',
    status: 'open',
    product_name: 'Metformin 850mg',
    batch_number: 'MET-2026-0112',
    detected_zone: 'Kano',
    created_date: daysAgo(0.2),
  },
  {
    id: 'da3',
    alert_type: 'diversion_signal',
    severity: 'medium',
    status: 'open',
    product_name: 'Ciprofloxacin 250mg',
    batch_number: 'CIP-2026-0089',
    detected_zone: 'Aba, Abia',
    created_date: daysAgo(0.8),
  },
];

const demoEvents = [
  { id: 'e1', event_type: 'consumer_verification', product_name: 'Amoxicillin 500mg', batch_number: 'AMX-2026-0341', location: 'Victoria Island, Lagos', state: 'Lagos', status: 'authentic', created_date: daysAgo(0.01) },
  { id: 'e2', event_type: 'retail_receipt', product_name: 'Metformin 850mg', batch_number: 'MET-2026-0112', location: 'Wuse, Abuja', state: 'FCT', status: 'authentic', created_date: daysAgo(0.05) },
  { id: 'e3', event_type: 'wholesale_transfer', product_name: 'Ciprofloxacin 250mg', batch_number: 'CIP-2026-0089', location: 'MedStock, Kano', state: 'Kano', status: 'authentic', created_date: daysAgo(0.1) },
  { id: 'e4', event_type: 'port_receipt', product_name: 'Artemether/Lumefantrine', batch_number: 'ART-2026-0023', location: 'Apapa Port', state: 'Lagos', status: 'authentic', created_date: daysAgo(0.2) },
  { id: 'e5', event_type: 'commissioning', product_name: 'Paracetamol 500mg', batch_number: 'PAR-2026-0567', location: 'Ibadan', state: 'Oyo', status: 'authentic', created_date: daysAgo(0.4) },
  { id: 'e6', event_type: 'consumer_verification', product_name: 'Hand Sanitizer 500ml', batch_number: 'HS-2026-0045', location: 'Kano', state: 'Kano', status: 'suspicious', created_date: daysAgo(0.5) },
];

export const DEMO_DASHBOARD_STATS = {
  total_scans: 24891,
  authentic_scans: 23654,
  suspicious_scans: 187,
  counterfeit_scans: 42,
  open_alerts: 12,
  critical_alerts: 3,
  active_batches: 156,
  recalled_batches: 8,
  held_batches: 5,
  scan_by_state: [
    { state: 'Lagos', count: 4200 },
    { state: 'Kano', count: 3100 },
    { state: 'FCT', count: 2800 },
    { state: 'Rivers', count: 1900 },
    { state: 'Oyo', count: 1650 },
    { state: 'Kaduna', count: 1420 },
    { state: 'Anambra', count: 980 },
    { state: 'Delta', count: 890 },
    { state: 'Ogun', count: 760 },
    { state: 'Enugu', count: 620 },
  ],
  suspicious_by_state: [
    { state: 'Anambra', count: 28 },
    { state: 'Lagos', count: 22 },
    { state: 'Kano', count: 18 },
  ],
  scan_by_day: buildScanByDay(),
  recent_alerts: demoAlertsForDashboard,
  recent_events: demoEvents,
  recent_transfers: [],
};

export const DEMO_CONSUMER_REPORTS = [
  {
    id: 'cr1',
    serial_number: 'NG-TG-00055678',
    product_name: 'Hand Sanitizer 500ml',
    batch_number: 'HS-2026-0045',
    manufacturer: 'CleanGuard Nigeria',
    reported_status: 'recalled',
    incident_status: 'pending_review',
    priority: 'high',
    state: 'Kano',
    created_date: daysAgo(2),
  },
  {
    id: 'cr2',
    serial_number: 'NG-TG-99900001',
    product_name: null,
    batch_number: null,
    manufacturer: null,
    reported_status: 'not_found',
    incident_status: 'under_investigation',
    priority: 'high',
    state: 'Lagos',
    created_date: daysAgo(3),
  },
  {
    id: 'cr3',
    serial_number: 'NG-TG-00041872',
    product_name: 'Amoxicillin 500mg',
    batch_number: 'AMX-2026-0341',
    manufacturer: 'EmeraPharm Ltd',
    reported_status: 'hold',
    incident_status: 'pending_review',
    priority: 'medium',
    state: 'Anambra',
    created_date: daysAgo(1),
  },
];

function chainDemo(uid) {
  return [
    { event_type: 'commissioning', location: 'Plant — Lagos', state: 'Lagos', created_date: daysAgo(30), status: 'authentic' },
    { event_type: 'wholesale_transfer', location: 'Apapa Hub', state: 'Lagos', created_date: daysAgo(14), status: 'authentic' },
    { event_type: 'consumer_verification', location: 'Field Inspection — Demo', state: 'Lagos', created_date: now(), status: 'authentic' },
  ];
}

const SCAN_DEMOS = {
  'NG-TG-00041872': {
    found: true,
    status: 'suspicious',
    anomaly_flags: ['recall_active'],
    tag: {
      tag_uid: 'NG-TG-00041872',
      product_name: 'Amoxicillin 500mg',
      batch_number: 'AMX-2026-0341',
      total_scans: 12,
    },
    batch: {
      enforcement_status: 'hold',
      diversion_score: 78,
      authorised_zones: ['Lagos', 'Ogun'],
      anomaly_flags: ['recall_active'],
    },
    chain_history: chainDemo('NG-TG-00041872'),
    advisory_risk: {
      level: 'elevated',
      summary: 'Demo: batch under hold — advisory text only.',
      disclaimer: 'Advisory only — does not replace rule-based scan status.',
    },
    nft_registry: null,
  },
  'NG-TG-00091234': {
    found: true,
    status: 'authentic',
    anomaly_flags: [],
    tag: {
      tag_uid: 'NG-TG-00091234',
      product_name: 'Metformin 850mg',
      batch_number: 'MET-2026-0112',
      total_scans: 44,
    },
    batch: {
      enforcement_status: 'active',
      diversion_score: 28,
      authorised_zones: ['Kano', 'Kaduna'],
    },
    chain_history: [
      { event_type: 'commissioning', location: 'HealthCore — Kano', state: 'Kano', created_date: daysAgo(60), status: 'authentic' },
      { event_type: 'consumer_verification', location: 'Field Inspection — Demo', state: 'Lagos', created_date: now(), status: 'authentic' },
    ],
    advisory_risk: { level: 'low', summary: 'Demo: within normal parameters.', disclaimer: 'Advisory only.' },
    nft_registry: null,
  },
  'NG-TG-00055678': {
    found: true,
    status: 'suspicious',
    anomaly_flags: ['recall_active'],
    tag: {
      tag_uid: 'NG-TG-00055678',
      product_name: 'Artemether/Lumefantrine 20/120mg',
      batch_number: 'ART-2026-0023',
      total_scans: 89,
    },
    batch: {
      enforcement_status: 'recalled',
      diversion_score: 95,
      authorised_zones: ['FCT', 'Nasarawa'],
    },
    chain_history: [
      { event_type: 'commissioning', location: 'Abuja DC', state: 'FCT', created_date: daysAgo(90), status: 'authentic' },
      { event_type: 'consumer_verification', location: 'Field Inspection — Demo', state: 'Lagos', created_date: now(), status: 'suspicious' },
    ],
    advisory_risk: { level: 'critical', summary: 'Demo: active recall — do not use.', disclaimer: 'Advisory only.' },
    nft_registry: null,
  },
};

export function demoScanTagResponse(body) {
  const uid = String(body?.tag_uid || '').trim();
  const base = SCAN_DEMOS[uid];
  if (!base) {
    return {
      found: false,
      status: 'suspicious',
      alert: 'Tag not in demo registry. Try a demo UID from the list.',
      anomaly_flags: ['unregistered_tag'],
      advisory_risk: { level: 'unknown', summary: 'Unregistered tag (demo).', disclaimer: 'Advisory only.' },
    };
  }
  return JSON.parse(JSON.stringify(base));
}

const CONSUMER_DEMO = {
  'NG-TG-00091234': {
    success: true,
    status: 'authentic',
    resolved_serial: 'NG-TG-00091234',
    product_name: 'Paracetamol 1000mg',
    batch: 'PCT-2026-0812',
    manufacturer: 'HealthCore Industries',
    last_scan_location: 'Abuja — Wuse Market Pharmacy',
    supply_chain_stage: 'retail',
    whatsapp_message: 'Demo: product authentic.',
    instructions: ['Store below 30°C.', 'Consult a pharmacist if unsure.'],
  },
  'NG-TG-00041872': {
    success: true,
    status: 'hold',
    resolved_serial: 'NG-TG-00041872',
    product_name: 'Amoxicillin 500mg',
    batch: 'AMX-2026-0341',
    manufacturer: 'EmeraPharm Ltd',
    last_scan_location: 'Lagos — Apapa Wholesale Hub',
    supply_chain_stage: 'wholesale',
    whatsapp_message: 'Demo: batch on HOLD.',
    instructions: ['Do not use until cleared.', 'Report to NAFDAC 0800-162-3232.'],
  },
  'NG-TG-00055678': {
    success: true,
    status: 'recalled',
    resolved_serial: 'NG-TG-00055678',
    product_name: 'Hand Sanitizer 500ml',
    batch: 'HS-2026-0045',
    manufacturer: 'CleanGuard Nigeria',
    last_scan_location: 'Kano — Sabon Gari Distribution',
    supply_chain_stage: 'retail',
    whatsapp_message: 'Demo: RECALL active.',
    instructions: ['Do not use.', 'Dispose safely.', 'Contact NAFDAC.'],
  },
};

export function demoConsumerAssistResponse(body) {
  const serial = String(body?.serial_number || '').trim().toUpperCase();
  if (body?.mode === 'serial' && CONSUMER_DEMO[serial]) {
    return CONSUMER_DEMO[serial];
  }
  if (body?.mode === 'photo') {
    return {
      success: true,
      status: 'authentic',
      resolved_serial: 'NG-TG-00091234',
      product_name: 'Paracetamol 1000mg (photo demo)',
      batch: 'PCT-2026-0812',
      manufacturer: 'HealthCore Industries',
      last_scan_location: 'Demo',
      supply_chain_stage: 'retail',
      whatsapp_message: 'Demo photo mode — treated as authentic sample.',
      instructions: ['This is illustrative demo data.'],
    };
  }
  return { success: false, error: 'Enter a demo serial: NG-TG-00091234, NG-TG-00041872, or NG-TG-00055678' };
}

export function demoInspectorAIResponse(body) {
  const q = String(body?.question || '').toLowerCase();
  let answer = `### Demo inspector assistant\n\nYou're viewing **bundled demo data** — connect your API and deploy \`inspectorAI\` for live answers.\n\n`;
  if (q.includes('recall') || q.includes('hold')) {
    answer += '- **Recalls / holds:** Demo batch \`AMX-2026-0341\` (Amoxicillin) is on **hold**; \`HS-2026-0045\` is **recalled**.\n';
  }
  if (q.includes('kano') || q.includes('lagos')) {
    answer += '- **Geography:** Demo scans cluster in **Lagos**, **Kano**, and **FCT**.\n';
  }
  answer += '\nTry asking about *recalls*, *diversion*, or *batches*.';
  return {
    answer,
    citations: [],
  };
}

export function demoCommissionTagResponse(body) {
  return {
    ok: true,
    tag_uid: body?.tag_uid || 'demo-tag',
    message: 'Demo mode: commission accepted locally (no API).',
    nft_registry_sync: 'skipped',
  };
}

export const DEMO_BATCH_STATUS_ROWS = [
  { id: 'bs1', batch_number: 'AMX-2026-0341', status: 'hold', product_name: 'Amoxicillin 500mg', updated_date: daysAgo(0.2) },
  { id: 'bs2', batch_number: 'MET-2026-0112', status: 'active', product_name: 'Metformin 850mg', updated_date: daysAgo(1) },
  { id: 'bs3', batch_number: 'CIP-2026-0089', status: 'quarantine', product_name: 'Ciprofloxacin 250mg', updated_date: daysAgo(2) },
  { id: 'bs4', batch_number: 'ART-2026-0023', status: 'cleared', product_name: 'Artemether/Lumefantrine', updated_date: daysAgo(3) },
];
