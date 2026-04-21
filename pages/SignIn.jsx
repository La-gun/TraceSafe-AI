import React, { useMemo, useState } from "react";
import { useLocation, useNavigate, Link, useSearchParams } from "react-router-dom";
import { Shield, KeyRound, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { backend } from "@/lib/backendClient";
import { useAuth } from "@/lib/AuthContext";
import { isPublicDemoMode } from "@/lib/demo/publicDemo";

function normalizeReturnTo(raw) {
  if (!raw || typeof raw !== "string") return "/Dashboard";
  // Only allow internal navigation targets.
  if (raw.startsWith("http://") || raw.startsWith("https://")) return "/Dashboard";
  return raw.startsWith("/") ? raw : `/${raw}`;
}

// Strong local-only defaults (weak passwords like "consumer123" trigger browser breach warnings).
// Override with VITE_DEMO_CONSUMER_EMAIL / VITE_DEMO_CONSUMER_PASSWORD / VITE_DEMO_REGULATOR_*.
const DEMO_USERS = {
  consumer: {
    email: import.meta.env.VITE_DEMO_CONSUMER_EMAIL || "consumer@demo.local",
    password: import.meta.env.VITE_DEMO_CONSUMER_PASSWORD || "Ts-demo-a7QmK9xP2vL4nR8wN6jH",
    role: "consumer",
    returnTo: "/touchpoints/end-user-verify",
  },
  regulator: {
    email: import.meta.env.VITE_DEMO_REGULATOR_EMAIL || "regulator@demo.local",
    password: import.meta.env.VITE_DEMO_REGULATOR_PASSWORD || "Ts-demo-c3BfT5yR1sZ8gM4vK2qW",
    role: "regulator",
    returnTo: "/Dashboard",
  },
};

export default function SignIn({ mode = "consumer" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { checkAppState, isLoadingAuth, isLoadingPublicSettings, setRole } = useAuth();

  const loginUrl = import.meta.env.VITE_AUTH_LOGIN_URL;
  const requireAuth = import.meta.env.VITE_REQUIRE_AUTH === "true";
  /** Inline email/password hints are for local dev; set `true` for prod if you accept the risk. */
  const showInlineDemoSecrets =
    import.meta.env.DEV || import.meta.env.VITE_SHOW_DEMO_CREDENTIALS_IN_UI === "true";

  const returnTo = useMemo(() => {
    const fromState = typeof location.state?.from === "string" ? location.state.from : null;
    const fromQuery = searchParams.get("return");
    const raw = fromState || fromQuery || "/Dashboard";
    return normalizeReturnTo(raw);
  }, [location.state, searchParams]);

  const [token, setToken] = useState("");
  const [email, setEmail] = useState(mode === "regulator" ? DEMO_USERS.regulator.email : DEMO_USERS.consumer.email);
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const canSubmit = token.trim().length > 10 && !isSubmitting;

  const canDemoLogin = !isSubmitting && email.trim().length > 3 && password.trim().length > 3;

  const handleDemoLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const expected = mode === "regulator" ? DEMO_USERS.regulator : DEMO_USERS.consumer;
      if (email.trim().toLowerCase() !== expected.email || password !== expected.password) {
        throw new Error("Invalid demo credentials.");
      }
      setRole(expected.role);
      // In demo mode we don't require a backend token; if auth is required, prompt for token flow instead.
      if (requireAuth) {
        throw new Error("This deployment requires a backend token. Use the Access token sign-in below.");
      }
      await checkAppState();
      navigate(expected.returnTo, { replace: true });
    } catch (err) {
      setError(err?.message || "Sign in failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveToken = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      window.localStorage.setItem("tracesafe_access_token", token.trim());
      // Re-bootstrap and re-check auth.
      await checkAppState();
      navigate(returnTo, { replace: true });
    } catch (err) {
      setError(err?.message || "Sign in failed. Check your token and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearToken = async () => {
    window.localStorage.removeItem("tracesafe_access_token");
    window.localStorage.removeItem("base44_access_token");
    window.localStorage.removeItem("token");
    try {
      backend.auth.logout(false);
      await checkAppState();
    } catch {
      // ignore
    }
    setToken("");
  };

  const isBusy = isLoadingAuth || isLoadingPublicSettings || isSubmitting;

  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#060B18] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" aria-hidden="true" />
          </div>
          <div className="text-white font-semibold tracking-tight">
            Trace<span className="text-emerald-400">Guard</span>
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 backdrop-blur">
          <div className="flex items-start justify-between gap-3 mb-5">
            <div>
              <h1 className="text-xl font-semibold text-white">
                {mode === "regulator" ? "Regulator sign in" : "Consumer sign in"}
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                {requireAuth
                  ? "This deployment requires authentication."
                  : "Optional sign-in (public demo is enabled)."}
              </p>
            </div>
            <KeyRound className="w-5 h-5 text-emerald-400 shrink-0" aria-hidden="true" />
          </div>

          <div className="flex items-center gap-2 mb-4">
            <Link to="/login/consumer" className="flex-1">
              <Button
                variant="outline"
                className={`w-full rounded-xl ${mode === "consumer" ? "border-emerald-500/40 text-emerald-300" : "border-white/10 text-gray-300"}`}
              >
                Consumer
              </Button>
            </Link>
            <Link to="/login/regulator" className="flex-1">
              <Button
                variant="outline"
                className={`w-full rounded-xl ${mode === "regulator" ? "border-emerald-500/40 text-emerald-300" : "border-white/10 text-gray-300"}`}
              >
                Regulator
              </Button>
            </Link>
          </div>

          {loginUrl && loginUrl.startsWith("http") && (
            <a
              href={loginUrl}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.10] bg-white/[0.02] hover:bg-white/[0.05] text-white py-2.5 mb-4 transition-colors"
            >
              Continue to sign-in provider <ExternalLink className="w-4 h-4" aria-hidden="true" />
            </a>
          )}

          {isPublicDemoMode() && !requireAuth && (
            <form onSubmit={handleDemoLogin} className="space-y-3 mb-5">
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 py-2">
                {showInlineDemoSecrets ? (
                  <p className="text-[11px] text-gray-400">
                    Demo credentials (dev / explicit flag):
                    <span className="text-gray-300 font-mono ml-2 break-all">
                      {mode === "regulator"
                        ? `${DEMO_USERS.regulator.email} / ${DEMO_USERS.regulator.password}`
                        : `${DEMO_USERS.consumer.email} / ${DEMO_USERS.consumer.password}`}
                    </span>
                  </p>
                ) : (
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Demo sign-in uses accounts from your deployment environment (
                    <code className="text-gray-500">VITE_DEMO_CONSUMER_*</code>,{" "}
                    <code className="text-gray-500">VITE_DEMO_REGULATOR_*</code>). See the{" "}
                    <strong className="text-gray-300">Environment variables</strong> section in{" "}
                    <code className="text-gray-500">README.md</code>. To show credentials on this screen in a production
                    build, set <code className="text-gray-500">VITE_SHOW_DEMO_CREDENTIALS_IN_UI=true</code> (not
                    recommended for shared URLs).
                  </p>
                )}
              </div>

              <label className="block">
                <span className="text-xs text-gray-400">Email</span>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="username"
                  className="mt-1 w-full rounded-xl bg-[#060B18] border border-white/[0.08] px-3 py-2 text-sm text-white placeholder:text-gray-600 outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/30"
                />
              </label>

              <label className="block">
                <span className="text-xs text-gray-400">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="mt-1 w-full rounded-xl bg-[#060B18] border border-white/[0.08] px-3 py-2 text-sm text-white placeholder:text-gray-600 outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/30"
                />
              </label>

              <Button
                type="submit"
                disabled={!canDemoLogin || isBusy}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-10 rounded-full"
              >
                {isSubmitting ? "Signing in…" : "Sign in (demo)"}
              </Button>
            </form>
          )}

          <form onSubmit={handleSaveToken} className="space-y-3">
            <label className="block">
              <span className="text-xs text-gray-400">Access token</span>
              <input
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste a bearer token"
                autoComplete="off"
                spellCheck={false}
                className="mt-1 w-full rounded-xl bg-[#060B18] border border-white/[0.08] px-3 py-2 text-sm text-white placeholder:text-gray-600 outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/30"
              />
            </label>

            {error && <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</div>}

            <Button
              type="submit"
              disabled={!canSubmit || isBusy}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-10 rounded-full"
            >
              {isSubmitting ? "Signing in…" : "Sign in"}
            </Button>

            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={handleClearToken}
                className="text-xs text-gray-400 hover:text-white underline underline-offset-2"
                disabled={isBusy}
              >
                Clear saved token
              </button>
              <Link to="/Home" className="text-xs text-gray-400 hover:text-white underline underline-offset-2">
                Back to Home
              </Link>
            </div>
          </form>
        </div>

        <p className="text-[11px] text-gray-500 mt-4 text-center">
          If you don’t have a token, use <Link to="/Settings" className="text-gray-400 hover:text-white underline underline-offset-2">Connection settings</Link>.
        </p>
      </div>
    </div>
  );
}

