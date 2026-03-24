import { describe, expect, it } from 'vitest';
import {
  INSPECTOR_QUESTION_MAX,
  sanitizeUntrustedInspectorText,
  wrapInspectorQuestion,
} from '../server/functions/inspectorAI/promptGuards.ts';
import attempts from './fixtures/injection-attempts.json';

describe('prompt guards', () => {
  it('truncates to max length', () => {
    const long = 'x'.repeat(INSPECTOR_QUESTION_MAX + 500);
    const s = sanitizeUntrustedInspectorText(long, INSPECTOR_QUESTION_MAX);
    expect(s.length).toBeLessThanOrEqual(INSPECTOR_QUESTION_MAX);
  });

  it('neutralizes delimiter injection attempts', () => {
    for (const a of attempts) {
      const s = sanitizeUntrustedInspectorText(a.raw, 8000);
      expect(s.toLowerCase()).not.toMatch(/<\/inspector_question>/i);
      expect(s.toLowerCase()).not.toMatch(/<inspector_question>/i);
      expect(s.toLowerCase()).not.toMatch(/<\/inspector_data>/i);
      expect(s.toLowerCase()).not.toMatch(/<inspector_data>/i);
    }
  });

  it('wrapInspectorQuestion ends with exactly one real closing delimiter', () => {
    const wrapped = wrapInspectorQuestion(attempts[0].raw, 8000);
    expect(wrapped.startsWith('<inspector_question>\n')).toBe(true);
    expect(wrapped.endsWith('\n</inspector_question>')).toBe(true);
    const inner = wrapped.slice(
      '<inspector_question>\n'.length,
      -'\n</inspector_question>'.length,
    );
    expect(inner).not.toContain('</inspector_question>');
  });
});
