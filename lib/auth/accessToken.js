/**
 * Central access-token read/write for REST auth.
 * Tokens from `?access_token=` are stored in sessionStorage only (not persisted across tabs / disk like localStorage).
 * Legacy localStorage keys remain readable for migration.
 */

const KEY = 'tracesafe_access_token';
const LEGACY_KEYS = ['base44_access_token', 'token'];

function replaceUrlSearch(nextParams) {
  if (typeof window === 'undefined') return;
  const qs = nextParams.toString();
  const newUrl = `${window.location.pathname}${qs ? `?${qs}` : ''}${window.location.hash}`;
  window.history.replaceState({}, document.title, newUrl);
}

/** @returns {string|null} */
export function getAccessToken() {
  if (typeof window === 'undefined') return null;
  const fromSession = window.sessionStorage.getItem(KEY);
  if (fromSession) return fromSession;
  const fromLocal = window.localStorage.getItem(KEY);
  if (fromLocal) return fromLocal;
  for (const k of LEGACY_KEYS) {
    const v = window.localStorage.getItem(k);
    if (v) return v;
  }
  return null;
}

export function clearAccessTokens() {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(KEY);
  window.localStorage.removeItem(KEY);
  for (const k of LEGACY_KEYS) {
    window.localStorage.removeItem(k);
  }
}

/**
 * If URL contains `access_token`, persist to sessionStorage and strip from address bar.
 * @returns {string|null} token if ingested or already present from this call chain
 */
export function ingestAccessTokenFromUrl() {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const tok = params.get('access_token');
  if (!tok) return null;
  window.sessionStorage.setItem(KEY, tok);
  params.delete('access_token');
  replaceUrlSearch(params);
  return tok;
}

/**
 * `clear_access_token=true` clears stored tokens. Gated to dev or explicit opt-in in production.
 */
export function maybeClearAccessTokenFromUrl() {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams(window.location.search);
  if (params.get('clear_access_token') !== 'true') return;
  const allow =
    import.meta.env.DEV === true || import.meta.env.VITE_ALLOW_CLEAR_ACCESS_TOKEN === 'true';
  if (!allow) return;
  clearAccessTokens();
  params.delete('clear_access_token');
  replaceUrlSearch(params);
}
