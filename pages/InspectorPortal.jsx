import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Smartphone, Sparkles, Loader2, CheckCircle, AlertTriangle,
  ShieldAlert, Package,
} from "lucide-react";
import { invokeWithDemo } from "@/lib/demo/invokeWithDemo";
import { demoScanTagResponse } from "@/lib/demo/fixtures";
import useOfflineSync, { setCachedProduct } from "@/hooks/useOfflineSync";
import OfflineBanner from "@/components/inspector/OfflineBanner";
import OfflineDraftForm from "@/components/inspector/OfflineDraftForm";
import InspectorAIChat from "@/components/inspector/InspectorAIChat";
import NftRegistryScanPanel from "@/components/nft/NftRegistryScanPanel";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const DEMO_SCANS = [
  { label: "Simulate NFC scan: Tap: Amoxicillin (Hold)", uid: "NG-TG-00041872" },
  { label: "Simulate NFC scan: Tap: Metformin (Active)", uid: "NG-TG-00091234" },
  { label: "Simulate NFC scan: Tap: Artemether (Recall)", uid: "NG-TG-00055678" },
];

function formatScanForCache(result) {
  if (!result?.found || !result.tag) return null;
  return {
    product: result.tag.product_name,
    batch: result.tag.batch_number,
    chain: (result.chain_history || []).map((e) => ({
      location: e.location || e.state || "—",
      stage: e.event_type || e.status,
    })),
  };
}

export default function InspectorPortal() {
  const [mode, setMode] = useState("scan");
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [draftOpen, setDraftOpen] = useState(false);
  const {
    isOnline,
    pendingCount,
    syncing,
    lastSyncedAt,
    syncPendingDrafts,
    refreshPendingCount,
  } = useOfflineSync();

  useEffect(() => {
    document.title = "InspectorPortal | TraceSafe AI";
  }, []);

  const runDemoScan = async (uid) => {
    setScanning(true);
    setScanError(null);
    setScanResult(null);
    try {
      const data = await invokeWithDemo(
        "scanTag",
        {
          tag_uid: uid,
          event_type: "consumer_verification",
          location: "Field Inspection — Demo",
          state: "Lagos",
          operator: "inspector_demo",
        },
        (body) => demoScanTagResponse(body),
      );
      setScanResult(data);
      const cachePayload = formatScanForCache(data);
      if (cachePayload) setCachedProduct(uid, cachePayload);
    } catch (e) {
      setScanError(e?.message || "Scan failed. Check connectivity and try again.");
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060B18] flex flex-col">
      <OfflineBanner
        isOnline={isOnline}
        pendingCount={pendingCount}
        syncing={syncing}
        lastSyncedAt={lastSyncedAt}
        onManualSync={syncPendingDrafts}
      />

      <header className="sticky top-0 z-30 bg-[#060B18]/95 backdrop-blur-xl border-b border-white/[0.06] px-4 py-3">
        <Link
          to="/Enforcement"
          className="inline-flex items-center gap-2 text-xs text-emerald-400/90 hover:text-emerald-300 transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Enforcement Console
        </Link>
        <div className="flex rounded-2xl bg-white/[0.04] border border-white/[0.08] p-1">
          <button
            type="button"
            onClick={() => setMode("scan")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              mode === "scan"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            NFC Scan
          </button>
          <button
            type="button"
            onClick={() => setMode("ai")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              mode === "ai"
                ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Inspector AI
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col min-h-0 pb-4">
        {mode === "scan" ? (
          <div className="flex-1 px-4 pt-6 pb-8 overflow-y-auto">
            <div className="max-w-md mx-auto text-center mb-8">
              <p className="text-[10px] font-semibold text-emerald-400/80 uppercase tracking-widest mb-2">
                NAFDAC Field Verification System
              </p>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/25 px-3 py-1 text-[11px] text-emerald-400 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Ready
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Hold your phone near an NFC product tag, or select a demo:
              </p>
            </div>

            <div className="max-w-md mx-auto space-y-2 mb-8">
              {DEMO_SCANS.map((d) => (
                <button
                  key={d.uid}
                  type="button"
                  disabled={scanning}
                  onClick={() => runDemoScan(d.uid)}
                  className="w-full text-left rounded-2xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] px-4 py-3.5 text-xs text-gray-200 transition-colors disabled:opacity-50"
                >
                  {d.label}
                </button>
              ))}
            </div>

            {scanning && (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
              </div>
            )}

            {scanError && (
              <div className="max-w-md mx-auto rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-300 mb-4">
                {scanError}
              </div>
            )}

            <AnimatePresence mode="wait">
              {scanResult && !scanning && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="max-w-md mx-auto rounded-2xl border border-white/[0.1] bg-[#0D1424] overflow-hidden mb-6"
                >
                  <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
                    <span className="text-xs font-semibold text-white flex items-center gap-2">
                      {scanResult.status === "authentic" ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                      )}
                      Scan result
                    </span>
                    <span className="text-[10px] uppercase text-gray-500">{scanResult.status}</span>
                  </div>
                  <div className="p-4 space-y-3 text-xs">
                    {scanResult.tag && (
                      <>
                        <div className="flex items-start gap-2">
                          <Package className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-white font-medium">{scanResult.tag.product_name}</p>
                            <p className="text-gray-500">Batch {scanResult.tag.batch_number}</p>
                            <p className="text-gray-600 font-mono mt-1">{scanResult.tag.tag_uid}</p>
                          </div>
                        </div>
                        {scanResult.batch && (
                          <div className="flex items-start gap-2">
                            <ShieldAlert className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-gray-400">
                                Enforcement:{" "}
                                <span className="text-white">{scanResult.batch.enforcement_status}</span>
                              </p>
                              {typeof scanResult.batch.diversion_score === "number" && (
                                <p className="text-gray-500 mt-0.5">
                                  Diversion score: {scanResult.batch.diversion_score}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                        <NftRegistryScanPanel nft={scanResult.nft_registry} />

                        {scanResult.advisory_risk && (
                          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 px-3 py-2.5 space-y-1.5">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-300/90">
                              Advisory risk (triage)
                            </p>
                            <div className="flex items-baseline gap-2">
                              <span className="text-lg font-bold text-white tabular-nums">
                                {scanResult.advisory_risk.advisory_risk_score}
                              </span>
                              <span className="text-[10px] text-gray-500">
                                / 100 · {scanResult.advisory_risk.advisory_risk_band}
                              </span>
                            </div>
                            {scanResult.advisory_risk.advisory_factors?.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {scanResult.advisory_risk.advisory_factors.map((f) => (
                                  <span
                                    key={f}
                                    className="text-[9px] px-1.5 py-0.5 rounded-md bg-white/[0.06] text-gray-400 font-mono"
                                  >
                                    {f}
                                  </span>
                                ))}
                              </div>
                            )}
                            <p className="text-[9px] text-gray-600 leading-snug">
                              {scanResult.advisory_risk.advisory_disclaimer}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                    {!scanResult.found && (
                      <p className="text-amber-300">{scanResult.alert || "Unknown tag."}</p>
                    )}
                    {scanResult.anomaly_flags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {scanResult.anomaly_flags.map((f) => (
                          <span
                            key={f}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/25"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="px-4 pb-4">
                    <Button
                      type="button"
                      onClick={() => setDraftOpen(true)}
                      className="w-full rounded-full bg-emerald-500 hover:bg-emerald-600 text-white h-11"
                    >
                      New inspection report
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex-1 min-h-[70vh] flex flex-col border-t border-white/[0.06]">
            <InspectorAIChat />
          </div>
        )}
      </div>

      <Sheet open={draftOpen} onOpenChange={setDraftOpen}>
        <SheetContent
          side="bottom"
          className="bg-[#0A0F1C] border-white/[0.1] max-h-[92vh] overflow-y-auto rounded-t-3xl text-white"
        >
          <SheetHeader className="text-left mb-2">
            <SheetTitle className="text-white">Inspection report</SheetTitle>
          </SheetHeader>
          <OfflineDraftForm
            prefillProduct={
              scanResult?.tag
                ? formatScanForCache(scanResult)
                : null
            }
            isOnline={isOnline}
            onClose={() => setDraftOpen(false)}
            onSaved={() => refreshPendingCount()}
            onRefreshPending={() => refreshPendingCount()}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
