import { getApiProvider, apiPath } from '@/lib/api/config';
import { isPublicDemoMode } from '@/lib/demo/publicDemo';

/**
 * Initial app/bootstrap call used by AuthProvider (registration gate, public settings).
 * - supabase: no remote call; returns a neutral payload.
 * - rest: GET /api/app/bootstrap by default, or VITE_APP_BOOTSTRAP_URL / legacy Base44-style URL.
 */
export async function fetchAppBootstrap({ appId, token }) {
  const provider = getApiProvider();
  if (provider === 'supabase') {
    return { id: 'supabase', public_settings: {} };
  }

  const relax = import.meta.env.DEV && import.meta.env.VITE_API_RELAX_BOOTSTRAP === 'true';
  const customUrl = import.meta.env.VITE_APP_BOOTSTRAP_URL;
  const legacyUrl = import.meta.env.VITE_LEGACY_PUBLIC_SETTINGS_URL;
  const defaultUrl = customUrl || legacyUrl || apiPath('/api/app/bootstrap');

  const headers = { Accept: 'application/json' };
  if (appId) headers['X-App-Id'] = appId;
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(defaultUrl, { headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data.message || `Bootstrap failed: ${res.status}`);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  } catch (e) {
    if (relax || isPublicDemoMode()) {
      return { id: appId || 'public-demo', public_settings: {} };
    }
    throw e;
  }
}

export function getBootstrapHint() {
  if (getApiProvider() === 'supabase') return '';
  if (!import.meta.env.VITE_API_BASE_URL && !import.meta.env.VITE_APP_API_BASE_URL && !import.meta.env.DEV) {
    return 'Set VITE_API_BASE_URL or VITE_APP_API_BASE_URL, or use VITE_API_PROVIDER=supabase.';
  }
  return '';
}
