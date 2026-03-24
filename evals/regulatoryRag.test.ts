import { describe, expect, it } from 'vitest';
import {
  REGULATORY_CORPUS_IDS,
  retrieveRegulatoryChunks,
  slimRegulatoryRows,
} from '../server/functions/inspectorAI/regulatoryRag.ts';
import golden from './fixtures/retrieval-golden.json';

describe('regulatory RAG retrieval', () => {
  it('returns stable corpus ids for eval drift checks', () => {
    expect(REGULATORY_CORPUS_IDS).toContain('reg-nafd-placeholder-000');
    expect(new Set(REGULATORY_CORPUS_IDS).size).toBe(REGULATORY_CORPUS_IDS.length);
  });

  it('slim rows are valid citation targets', () => {
    const rows = slimRegulatoryRows(retrieveRegulatoryChunks('recall', 3));
    for (const r of rows) {
      expect(r._entity).toBe('regulatory_doc');
      expect(r.id).toMatch(/^reg-nafd-/);
      expect(r.text_excerpt.length).toBeLessThanOrEqual(1400);
    }
  });

  it('golden queries surface expected chunk ids', () => {
    for (const c of golden.cases) {
      const got = retrieveRegulatoryChunks(c.query, 8).map((x) => x.id);
      for (const id of c.must_include_chunk_ids) {
        expect(got, `case ${c.id}`).toContain(id);
      }
    }
  });
});
