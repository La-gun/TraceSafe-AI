/**
 * Lightweight RAG corpus: official-style recall / regulatory excerpts.
 * Replace or extend REGULATORY_CORPUS with your NAFDAC-sourced documents.
 * IDs are stable for golden evals.
 */
export type RegulatoryChunk = {
  id: string;
  title: string;
  issuing_body: string;
  effective_or_issued: string;
  source_url: string;
  kind: 'recall' | 'guidance' | 'registration_rule';
  text: string;
  tags: string[];
};

export const REGULATORY_CORPUS: RegulatoryChunk[] = [
  {
    id: 'reg-nafd-placeholder-000',
    title: 'Corpus notice (read first)',
    issuing_body: 'TraceSafe / demo corpus',
    effective_or_issued: '2026-01-01',
    source_url: 'https://www.nafdac.gov.ng/',
    kind: 'guidance',
    tags: ['meta', 'disclaimer'],
    text:
      'This bundle contains illustrative excerpts for product demo and RAG testing only. ' +
      'It is not an official NAFDAC publication. For enforcement, always use current bulletins ' +
      'and directives from NAFDAC and the Federal Ministry of Health.',
  },
  {
    id: 'reg-nafd-recall-procedure-001',
    title: 'Field recall verification — standard steps',
    issuing_body: 'NAFDAC (illustrative procedure text)',
    effective_or_issued: '2024-06-01',
    source_url: 'https://www.nafdac.gov.ng/',
    kind: 'guidance',
    tags: ['recall', 'field', 'inspector', 'procedure'],
    text:
      'When a batch is under recall or hold: (1) seize or quarantine affected stock per port/state protocol; ' +
      '(2) photograph labels, batch numbers, and serialised tags; (3) log chain-of-custody in the enforcement system; ' +
      '(4) notify the zonal director within 24 hours for Class I health-risk recalls; ' +
      '(5) do not re-release until written clearance.',
  },
  {
    id: 'reg-nafd-counterfeit-signals-002',
    title: 'Suspected falsified medicines — triage signals',
    issuing_body: 'NAFDAC (illustrative guidance)',
    effective_or_issued: '2025-03-15',
    source_url: 'https://www.nafdac.gov.ng/',
    kind: 'guidance',
    tags: ['counterfeit', 'suspicious', 'packaging', 'serial'],
    text:
      'Elevate priority when: unregistered tag UID, mismatch between label batch and scan registry, ' +
      'abnormal price vs authorised channel, damaged anti-tamper features, or consumer reports of adverse events ' +
      'clustered on one batch. Cross-check with recent diversion alerts before disposition.',
  },
  {
    id: 'reg-nafd-amox-recall-sample-003',
    title: 'Illustrative recall: amoxicillin batch hold (sample)',
    issuing_body: 'NAFDAC (fictional sample for demo)',
    effective_or_issued: '2026-02-10',
    source_url: 'https://www.nafdac.gov.ng/',
    kind: 'recall',
    tags: ['recall', 'amoxicillin', 'antibiotic', 'hold'],
    text:
      'Sample bulletin: certain amoxicillin 500mg batches may be placed on regulatory hold pending stability review. ' +
      'Inspectors shall verify batch numbers against the live enforcement register; if on hold, instruct holders not to dispense ' +
      'and escalate to pharmacovigilance if adverse events are reported.',
  },
  {
    id: 'reg-nafd-hand-sanitizer-recall-sample-004',
    title: 'Illustrative recall: hand sanitiser formulation (sample)',
    issuing_body: 'NAFDAC (fictional sample for demo)',
    effective_or_issued: '2026-01-20',
    source_url: 'https://www.nafdac.gov.ng/',
    kind: 'recall',
    tags: ['recall', 'sanitizer', 'formulation', 'dispose'],
    text:
      'Sample recall pattern: alcohol-based hand sanitiser batches with non-conforming ethanol sourcing may be recalled. ' +
      'Field teams should confirm disposal instructions on the official notice and document quantities destroyed or returned.',
  },
  {
    id: 'reg-nafd-traceability-005',
    title: 'Serialization and traceability expectations (illustrative)',
    issuing_body: 'NAFDAC (illustrative)',
    effective_or_issued: '2025-11-01',
    source_url: 'https://www.nafdac.gov.ng/',
    kind: 'registration_rule',
    tags: ['serialization', 'nfc', 'batch', 'wholesale'],
    text:
      'Regulated products in the traceability pilot should maintain batch-to-tag linkage from commissioning through wholesale. ' +
      'Scans outside authorised zones or repeated consumer verifications may indicate diversion and should be correlated with batch risk scores.',
  },
  {
    id: 'reg-nafd-lagos-zone-006',
    title: 'Zonal operations — Lagos / Apapa corridor (illustrative)',
    issuing_body: 'NAFDAC (illustrative)',
    effective_or_issued: '2025-09-01',
    source_url: 'https://www.nafdac.gov.ng/',
    kind: 'guidance',
    tags: ['lagos', 'apapa', 'wholesale', 'port', 'zone'],
    text:
      'Wholesale hubs in Lagos and Apapa often require enhanced spot checks on imported batches. ' +
      'Coordinate with port health and customs where cold-chain claims are made; verify batch release paperwork against the national register.',
  },
];

export const REGULATORY_CORPUS_IDS = REGULATORY_CORPUS.map((c) => c.id);

function tokenize(s: string): string[] {
  const m = s.toLowerCase().match(/[a-z0-9]+/g);
  return m || [];
}

/** Token-overlap retrieval (no embeddings) — deterministic for evals. */
export function retrieveRegulatoryChunks(query: string, topK = 6): RegulatoryChunk[] {
  const qTokens = new Set(tokenize(query).filter((t) => t.length > 1));
  if (qTokens.size === 0) {
    return REGULATORY_CORPUS.slice(0, topK);
  }

  const scored = REGULATORY_CORPUS.map((chunk) => {
    const hay = tokenize(`${chunk.title} ${chunk.text} ${chunk.tags.join(' ')}`);
    let score = 0;
    for (const t of hay) {
      if (t.length > 2 && qTokens.has(t)) score += 2;
    }
    for (const tag of chunk.tags) {
      const tg = tag.toLowerCase();
      if (qTokens.has(tg)) score += 6;
    }
    return { chunk, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const positive = scored.filter((s) => s.score > 0);
  const pick = positive.length ? positive : scored;
  return pick.slice(0, topK).map((p) => p.chunk);
}

export type SlimRegulatoryRow = {
  _entity: 'regulatory_doc';
  id: string;
  title: string;
  issuing_body: string;
  kind: RegulatoryChunk['kind'];
  source_url: string;
  effective_or_issued: string;
  text_excerpt: string;
};

export function slimRegulatoryRows(chunks: RegulatoryChunk[]): SlimRegulatoryRow[] {
  return chunks.map((c) => ({
    _entity: 'regulatory_doc' as const,
    id: c.id,
    title: c.title,
    issuing_body: c.issuing_body,
    kind: c.kind,
    source_url: c.source_url,
    effective_or_issued: c.effective_or_issued,
    text_excerpt: c.text.slice(0, 1400),
  }));
}
