import { getApiProvider, apiPath } from '@/lib/api/config';
import { isPublicDemoMode } from '@/lib/demo/publicDemo';

function isHttpLoggingEnabled() {
  return import.meta.env.DEV && String(import.meta.env.VITE_HTTP_LOGGING || '').toLowerCase() === 'true';
}

function createRequestId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `req_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }
}

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

  const requestId = createRequestId();
  const headers = { Accept: 'application/json', 'X-Request-Id': requestId };
  if (appId) headers['X-App-Id'] = appId;
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    if (isHttpLoggingEnabled()) {
      // eslint-disable-next-line no-console
      console.log('[http]', { requestId, method: 'GET', url: defaultUrl });
    }
    const res = await fetch(defaultUrl, { headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (isHttpLoggingEnabled()) {
        // eslint-disable-next-line no-console
        console.warn('[http:error]', { requestId, method: 'GET', url: defaultUrl, status: res.status, response: data });
      }
      const err = new Error(data.message || `Bootstrap failed: ${res.status}`);
      err.status = res.status;
      err.data = data;
      err.requestId = requestId;
      throw err;
    }
    if (isHttpLoggingEnabled()) {
      // eslint-disable-next-line no-console
      console.log('[http:ok]', { requestId, method: 'GET', url: defaultUrl, status: res.status, response: data });
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
