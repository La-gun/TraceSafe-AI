import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ShieldCheck, ArrowLeft, AlertTriangle, CheckCircle, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { invokeWithDemo } from "@/lib/demo/invokeWithDemo";
import { demoScanTagResponse } from "@/lib/demo/fixtures";

const DEMO_UIDS = ["NG-TG-00091234", "NG-TG-00041872", "NG-TG-00055678"];

function extractTagUid(raw) {
  const s = String(raw ?? "").trim();
  if (!s) return null;

  // If user pasted JSON.
  if (s.startsWith("{") && s.endsWith("}")) {
    try {
      const obj = JSON.parse(s);
      const v = obj?.tag_uid ?? obj?.tagUid ?? obj?.uid ?? obj?.serial ?? null;
      if (v) return String(v).trim();
    } catch {
      // fall through
    }
  }

  // If user pasted an URL (NDEF / QR) try common query params.
  try {
    const u = new URL(s);
    const qp =
      u.searchParams.get("tag_uid") ||
      u.searchParams.get("tagUid") ||
      u.searchParams.get("uid") ||
      u.searchParams.get("serial") ||
      u.searchParams.get("ref");
    if (qp) return String(qp).trim();
    const last = u.pathname.split("/").filter(Boolean).pop();
    if (last && /[A-Za-z0-9-_]{6,}/.test(last)) return last;
  } catch {
    // not a URL
  }

  // If user pasted a "key=value" blob.
  const m = s.match(/(?:tag_uid|tagUid|uid|serial|ref)\s*=\s*([A-Za-z0-9-_]+)/);
  if (m?.[1]) return m[1].trim();

  // Fallback: treat as UID / reference directly.
  return s;
}

function statusUi(status) {
  switch (status) {
    case "authentic":
      return { label: "Authentic", icon: CheckCircle, tone: "emerald" };
    case "suspicious":
      return { label: "Suspicious", icon: AlertTriangle, tone: "amber" };
    default:
      return { label: status || "Unknown", icon: AlertTriangle, tone: "gray" };
  }
}

export default function QrScan() {
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    document.title = "Verify | TraceGuard";
  }, []);

  const uid = useMemo(() => extractTagUid(token), [token]);
  const canVerify = Boolean(uid && uid.trim().length >= 6 && !loading);

  const onVerify = async (e) => {
    e?.preventDefault?.();
    setError(null);
    setResult(null);

    const tag_uid = extractTagUid(token);
    if (!tag_uid) {
      setError("Paste a tag reference / UID first.");
      return;
    }

    setLoading(true);
    try {
      const data = await invokeWithDemo(
        "scanTag",
        {
          tag_uid,
          event_type: "consumer_verification",
          location: "QR Scan — Client",
          operator: "consumer",
        },
        (body) => demoScanTagResponse(body),
      );
      setResult(data);
    } catch (err) {
      setError(err?.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onBack = () => {
    navigate(-1);
  };

  const reset = () => {
    setResult(null);
    setError(null);
  };

  const ui = statusUi(result?.status);
  const StatusIcon = ui.icon;
  const tone =
    ui.tone === "emerald"
      ? {
          badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-800",
          icon: "text-emerald-700",
        }
      : ui.tone === "amber"
        ? {
            badge: "border-amber-500/30 bg-amber-500/10 text-amber-900",
            icon: "text-amber-800",
          }
        : {
            badge: "border-black/10 bg-black/5 text-gray-800",
            icon: "text-gray-700",
          };

  return (
    <div className="min-h-screen bg-[#F3F5F4] text-gray-900 flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-2xl">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">QR scan</h1>
            <p className="text-sm text-gray-600 mt-1 max-w-xl">
              Camera-based scanning is a placeholder in this MVP. The production app would decode an opaque token and
              send it to the official verifier — never opening arbitrary URLs in a browser.
            </p>
          </div>
          <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-2xl bg-white border border-black/5">
            <QrCode className="w-6 h-6 text-gray-700" aria-hidden="true" />
          </div>
        </div>

        <div className="rounded-3xl border border-black/10 bg-white/70 backdrop-blur p-6 sm:p-7">
          <div className="grid sm:grid-cols-[1fr_280px] gap-6 items-start">
            <div className="space-y-4">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">Paste token (demo)</p>
              <form onSubmit={onVerify} className="space-y-3">
                <Input
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Reference or NV1 payload"
                  className="h-12 rounded-2xl bg-white border-black/10"
                />

                {error && (
                  <div className="rounded-2xl border border-red-500/25 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={!canVerify}
                  className="w-full h-12 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Verifying…
                    </span>
                  ) : (
                    "Verify"
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  className="w-full h-12 rounded-2xl border-black/15 bg-transparent text-gray-900 hover:bg-black/5"
                >
                  Back
                </Button>
              </form>

              <div className="flex flex-wrap gap-2 pt-2">
                {DEMO_UIDS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      setToken(d);
                      reset();
                    }}
                    className="text-xs font-mono px-3 py-1.5 rounded-full border border-black/10 bg-white hover:bg-black/5 text-gray-800 transition-colors"
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-black/10 bg-[#F7F8F7] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 text-center">
                Scanner preview
              </p>
              <div className="mt-3 flex items-center justify-center">
                <div className="w-40 h-40 rounded-3xl border border-black/10 bg-white flex items-center justify-center">
                  <div className="w-10 h-10 rounded-xl border border-black/10 bg-black/5" />
                </div>
              </div>
              <p className="text-[11px] text-gray-500 mt-3 text-center">
                For production: camera/NFC would supply the token automatically.
              </p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {result && !loading && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="mt-6 pt-6 border-t border-black/10"
              >
                <div className={`rounded-2xl border px-4 py-3 flex items-start gap-3 ${tone.badge}`}>
                  <StatusIcon className={`w-5 h-5 mt-0.5 ${tone.icon}`} aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="font-semibold">
                      {ui.label}
                      {result?._demo ? <span className="ml-2 text-xs font-medium opacity-70">(demo)</span> : null}
                    </p>
                    <p className="text-sm opacity-80 mt-0.5">
                      {result?.found === false ? result?.alert : result?.tag?.product_name || "Verification complete."}
                    </p>
                    {result?.tag?.tag_uid && (
                      <p className="mt-1 text-xs font-mono opacity-70 break-all">{result.tag.tag_uid}</p>
                    )}
                  </div>
                </div>

                {result?.batch && (
                  <div className="mt-4 rounded-2xl border border-black/10 bg-white/70 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 mb-3">
                      Batch signals
                    </p>
                    <div className="grid sm:grid-cols-3 gap-3 text-sm">
                      <div className="rounded-xl border border-black/10 bg-white p-3">
                        <p className="text-[11px] text-gray-500">Enforcement</p>
                        <p className="font-semibold text-gray-900">{String(result.batch.enforcement_status || "—")}</p>
                      </div>
                      <div className="rounded-xl border border-black/10 bg-white p-3">
                        <p className="text-[11px] text-gray-500">Diversion score</p>
                        <p className="font-semibold text-gray-900 tabular-nums">
                          {typeof result.batch.diversion_score === "number"
                            ? result.batch.diversion_score
                            : String(result.batch.diversion_score || "—")}
                        </p>
                      </div>
                      <div className="rounded-xl border border-black/10 bg-white p-3">
                        <p className="text-[11px] text-gray-500">Authorised zones</p>
                        <p className="font-semibold text-gray-900">
                          {Array.isArray(result.batch.authorised_zones) && result.batch.authorised_zones.length > 0
                            ? result.batch.authorised_zones.join(", ")
                            : "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {Array.isArray(result?.anomaly_flags) && result.anomaly_flags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {result.anomaly_flags.map((f) => (
                      <span
                        key={f}
                        className="text-xs px-3 py-1 rounded-full border border-black/10 bg-white text-gray-800"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-5">
                  <Button
                    type="button"
                    onClick={reset}
                    className="rounded-2xl bg-gray-900 hover:bg-black text-white h-11 px-6 gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Verify another
                  </Button>
                </div>

                <div className="mt-4 text-xs text-gray-500 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 mt-0.5" aria-hidden="true" />
                  <p className="leading-relaxed">
                    Verification uses the same backend function as the inspector portal (
                    <span className="font-mono">scanTag</span>) and records a consumer verification event when connected.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

