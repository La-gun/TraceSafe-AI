/**
 * API provider: "supabase" | "rest"
 * - supabase: @supabase/supabase-js (Auth, PostgREST, Storage, Edge Functions)
 * - rest: fetch() against TraceGuard REST contract (see docs/BACKEND_API.md)
 */
export function getApiProvider() {
  const p = (import.meta.env.VITE_API_PROVIDER || 'rest').toLowerCase();
  return p === 'supabase' ? 'supabase' : 'rest';
}

export function getSupabaseConfig() {
  return {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  };
}

/** API origin for REST adapter (no trailing slash). Empty = same origin (Vite /api proxy). */
export function getRestApiBase() {
  const u = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_APP_API_BASE_URL || '';
  return String(u).replace(/\/$/, '');
}

export function apiPath(path) {
  const p = path.startsWith('/') ? path : `/${path}`;
  const base = getRestApiBase();
  return base ? `${base}${p}` : p;
}
