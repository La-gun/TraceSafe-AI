/**
 * When `VITE_REQUIRE_AUTH` is not exactly `'true'`, the app runs in **public demo mode**:
 * bootstrap and API failures fall back to bundled demo data so the UI is explorable without sign-in.
 * Set `VITE_REQUIRE_AUTH=true` in production when you enforce login.
 */
export function isPublicDemoMode() {
  return import.meta.env.VITE_REQUIRE_AUTH !== 'true';
}
