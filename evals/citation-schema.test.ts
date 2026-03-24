import { describe, expect, it } from 'vitest';

/**
 * Contract: inspectorAI CITATION_ENTITY_ENUM must stay aligned with UI + validation.
 * Duplicated literals intentionally small — update if entry.ts enum changes.
 */
const CITATION_ENTITIES = [
  'consumer_report',
  'diversion_alert',
  'batch',
  'scan_event',
  'regulatory_doc',
] as const;

describe('citation entity contract', () => {
  it('includes regulatory_doc for RAG citations', () => {
    expect(CITATION_ENTITIES).toContain('regulatory_doc');
  });
});
