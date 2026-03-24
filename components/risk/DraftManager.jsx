/**
 * DraftManager — displays offline draft reports, shows sync status,
 * and allows manual retry or deletion of individual drafts.
 */
import React, { useState, useEffect, useCallback } from "react";
import { backend } from "@/lib/backendClient";
import { isPublicDemoMode } from "@/lib/demo/publicDemo";
import { motion, AnimatePresence } from "framer-motion";
import {
  CloudOff, Cloud, CheckCircle, RotateCcw, Trash2,
  Loader2, Wifi, WifiOff, FileText, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

function readLS(key, fallback) {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; } catch { return fallback; }
}
function writeLS(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

const DRAFTS_KEY = "traceguard_drafts";

function getAllDrafts() { return readLS(DRAFTS_KEY, []); }

function deleteDraftById(id) {
  const drafts = getAllDrafts().filter((d) => d.id !== id);
  writeLS(DRAFTS_KEY, drafts);
}

function markSynced(id) {
  const drafts = getAllDrafts().map((d) => d.id === id ? { ...d, synced: true, syncedAt: Date.now() } : d);
  writeLS(DRAFTS_KEY, drafts);
}

export default function DraftManager() {
  const [drafts, setDrafts]         = useState(getAllDrafts());
  const [syncingId, setSyncingId]   = useState(null);
  const [syncedIds, setSyncedIds]   = useState([]);
  const [isOnline, setIsOnline]     = useState(navigator.onLine);
  const [syncingAll, setSyncingAll] = useState(false);

  const refresh = useCallback(() => setDrafts(getAllDrafts()), []);

  useEffect(() => {
    const up   = () => { setIsOnline(true);  refresh(); };
    const down = () => setIsOnline(false);
    window.addEventListener("online",  up);
    window.addEventListener("offline", down);
    return () => { window.removeEventListener("online", up); window.removeEventListener("offline", down); };
  }, [refresh]);

  const syncOne = async (draft) => {
    if (!isOnline || syncingId) return;
    setSyncingId(draft.id);
    try {
      try {
        await backend.entities.InspectionReport.create(draft.formData);
      } catch (e) {
        if (!isPublicDemoMode()) throw e;
      }
      markSynced(draft.id);
      setSyncedIds((p) => [...p, draft.id]);
      refresh();
    } finally {
      setSyncingId(null);
    }
  };

  const syncAll = async () => {
    const pending = getAllDrafts().filter((d) => !d.synced);
    if (!pending.length || !isOnline) return;
    setSyncingAll(true);
    for (const draft of pending) {
      try {
        try {
          await backend.entities.InspectionReport.create(draft.formData);
        } catch (e) {
          if (!isPublicDemoMode()) throw e;
        }
        markSynced(draft.id);
        setSyncedIds((p) => [...p, draft.id]);
      } catch {}
    }
    refresh();
    setSyncingAll(false);
  };

  const remove = (id) => { deleteDraftById(id); refresh(); };

  const pending = drafts.filter((d) => !d.synced);
  const synced  = drafts.filter((d) => d.synced);

  return (
    <div className="space-y-5">
      {/* Status bar */}
      <div className={`flex items-center justify-between gap-4 border rounded-2xl px-5 py-3.5 ${
        isOnline ? "bg-emerald-500/8 border-emerald-500/20" : "bg-amber-500/8 border-amber-500/20"
      }`}>
        <div className="flex items-center gap-2.5">
          {isOnline
            ? <Wifi className="w-4 h-4 text-emerald-400" />
            : <WifiOff className="w-4 h-4 text-amber-400" />
          }
          <div>
            <p className={`text-xs font-semibold ${isOnline ? "text-emerald-400" : "text-amber-400"}`}>
              {isOnline ? "Online — ready to sync" : "Offline — drafts saved locally"}
            </p>
            <p className="text-[10px] text-gray-500">
              {pending.length} pending · {synced.length} synced
            </p>
          </div>
        </div>
        {isOnline && pending.length > 0 && (
          <Button
            onClick={syncAll}
            disabled={syncingAll}
            className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs h-8 px-4 rounded-full gap-1.5"
          >
            {syncingAll
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Syncing…</>
              : <><Cloud className="w-3.5 h-3.5" />Sync All ({pending.length})</>
            }
          </Button>
        )}
      </div>

      {/* Pending drafts */}
      {pending.length > 0 && (
        <div className="bg-[#0A0F1C] border border-white/[0.08] rounded-3xl overflow-hidden">
          <div className="px-5 py-3 border-b border-white/[0.06] flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <p className="text-xs font-semibold text-amber-400">Pending Upload ({pending.length})</p>
          </div>
          <div className="divide-y divide-white/[0.04]">
            <AnimatePresence>
              {pending.map((draft) => (
                <motion.div key={draft.id}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, height: 0 }}
                  className="px-5 py-4 flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                    <CloudOff className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">
                      {draft.formData.product_names || "Inspection Report"}
                    </p>
                    <p className="text-[10px] text-gray-500 truncate">
                      {draft.formData.location || "—"} · {draft.formData.inspector_name || "—"}
                    </p>
                    <p className="text-[10px] text-gray-600 mt-0.5">
                      Saved {format(new Date(draft.savedAt), "dd MMM yyyy, HH:mm")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isOnline && (
                      <button onClick={() => syncOne(draft)} disabled={!!syncingId}
                        aria-label="Sync this draft"
                        className="w-8 h-8 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center transition-colors disabled:opacity-40">
                        {syncingId === draft.id
                          ? <Loader2 className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                          : <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                        }
                      </button>
                    )}
                    <button onClick={() => remove(draft.id)} aria-label="Delete draft"
                      className="w-8 h-8 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 flex items-center justify-center transition-colors">
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Synced reports */}
      {synced.length > 0 && (
        <div className="bg-[#0A0F1C] border border-white/[0.08] rounded-3xl overflow-hidden">
          <div className="px-5 py-3 border-b border-white/[0.06] flex items-center gap-2">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <p className="text-xs font-semibold text-emerald-400">Synced Reports ({synced.length})</p>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {synced.slice().reverse().map((draft) => (
              <div key={draft.id} className="px-5 py-3.5 flex items-center gap-4 opacity-60">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">
                    {draft.formData.product_names || "Inspection Report"}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    {draft.formData.location || "—"} · Synced {draft.syncedAt ? format(new Date(draft.syncedAt), "dd MMM HH:mm") : ""}
                  </p>
                </div>
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {drafts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <FileText className="w-10 h-10 mb-3 opacity-20" />
          <p className="text-sm font-medium">No draft reports</p>
          <p className="text-xs text-gray-600 mt-1">Reports saved offline in the Inspector Portal will appear here.</p>
        </div>
      )}
    </div>
  );
}