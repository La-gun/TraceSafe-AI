import { backend } from '@/lib/backendClient';
import { isPublicDemoMode } from '@/lib/demo/publicDemo';

/**
 * Try `functions.invoke`; on failure in public demo mode, return `getDemo(body)` instead.
 */
export async function invokeWithDemo(name, body, getDemo) {
  try {
    const res = await backend.functions.invoke(name, body);
    const d = res?.data ?? res;
    if (d && typeof d.error === 'string' && d.error) throw new Error(d.error);
    return { ...d, _demo: false };
  } catch {
    if (!isPublicDemoMode()) throw new Error(`Backend function "${name}" failed and demo mode is off.`);
    const demo = typeof getDemo === 'function' ? getDemo(body ?? {}) : getDemo;
    return { ...demo, _demo: true };
  }
}
