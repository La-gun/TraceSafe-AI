/**
 * Shown when a production build is deployed without `VITE_REQUIRE_AUTH=true`.
 * Prevents a misleading “demo auth” / client-only role UX from being mistaken for real security.
 */
export default function MisconfiguredProduction() {
  return (
    <div className="min-h-screen bg-[#060B18] text-slate-200 flex items-center justify-center p-6">
      <div className="max-w-lg rounded-2xl border border-amber-500/30 bg-white/[0.03] p-8 shadow-xl">
        <h1 className="text-xl font-semibold text-white mb-2">Production configuration required</h1>
        <p className="text-sm text-slate-300 leading-relaxed mb-4">
          This build was compiled in production mode without{' '}
          <code className="text-amber-300 bg-black/30 px-1.5 py-0.5 rounded">VITE_REQUIRE_AUTH=true</code>.
          Public demo mode (bundled sample data and client-side role preview) must not ship as a live deployment
          unless you intentionally accept that risk.
        </p>
        <p className="text-xs text-slate-500">
          Set <code className="text-slate-400">VITE_REQUIRE_AUTH=true</code> in your hosting env and redeploy.
          For local marketing builds only, use <code className="text-slate-400">npm run dev</code> or{' '}
          <code className="text-slate-400">npm run preview</code> with development env.
        </p>
      </div>
    </div>
  );
}
