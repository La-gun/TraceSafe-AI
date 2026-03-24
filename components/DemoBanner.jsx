import { Link } from 'react-router-dom';
import { Info } from 'lucide-react';

/**
 * Shown when the app is in public demo mode (`VITE_REQUIRE_AUTH` is not `true`).
 * API failures use bundled demo data so flows stay demonstrable without sign-in.
 */
export default function DemoBanner() {
  const loginUrl = import.meta.env.VITE_AUTH_LOGIN_URL;

  return (
    <div className="shrink-0 z-[60] border-b border-amber-500/25 bg-amber-500/10 px-3 py-2">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-2 text-center sm:text-left sm:justify-between">
        <p className="text-[11px] sm:text-xs text-amber-100/95 flex items-center gap-2 justify-center sm:justify-start">
          <Info className="w-3.5 h-3.5 shrink-0 text-amber-400" aria-hidden />
          <span>
            <strong className="font-semibold text-amber-50">Public demo</strong>
            {' — '}
            Live API optional. Charts, scans, and assist use bundled sample data when endpoints are missing.
          </span>
        </p>
        <div className="flex items-center gap-3 text-[11px]">
          {loginUrl ? (
            loginUrl.startsWith('http') ? (
              <a
                href={loginUrl}
                target="_blank"
                rel="noreferrer"
                className="text-amber-200 hover:text-white underline underline-offset-2"
              >
                Sign in
              </a>
            ) : (
              <Link to={loginUrl} className="text-amber-200 hover:text-white underline underline-offset-2">
                Sign in
              </Link>
            )
          ) : (
            <Link to="/Settings" className="text-amber-200 hover:text-white underline underline-offset-2">
              Connection settings
            </Link>
          )}
          <span className="text-amber-500/50 hidden sm:inline">|</span>
          <span className="text-amber-200/80 hidden sm:inline">
            Production: set <code className="text-amber-100/90">VITE_REQUIRE_AUTH=true</code>
          </span>
        </div>
      </div>
    </div>
  );
}
