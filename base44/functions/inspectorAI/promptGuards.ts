/** Delimiter hardening + length limits for untrusted inspector chat text. */

export const INSPECTOR_QUESTION_MAX = 8000;
export const INSPECTOR_HISTORY_MSG_MAX = 4000;

/**
 * Strips nested delimiter patterns so user/assistant content cannot spoof
 * `<inspector_question>` boundaries injected into planner/answer prompts.
 */
export function sanitizeUntrustedInspectorText(raw: string, maxLen: number): string {
  return String(raw)
    .slice(0, maxLen)
    .replace(/<\/?inspector_question\b[^>]*>/gi, '⟦q⟧')
    .replace(/<\/?inspector_data\b[^>]*>/gi, '⟦d⟧');
}

export function wrapInspectorQuestion(raw: string, maxLen: number = INSPECTOR_QUESTION_MAX): string {
  const inner = sanitizeUntrustedInspectorText(raw, maxLen);
  return `<inspector_question>\n${inner}\n</inspector_question>`;
}
