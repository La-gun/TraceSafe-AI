import React from "react";
import { Wifi, WifiOff, RefreshCw, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function OfflineBanner({ isOnline, pendingCount, syncing, lastSyncedAt, onManualSync }) {
  return (
    <AnimatePresence>
      {(!isOnline || pendingCount > 0 || syncing) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className={`border-b px-4 py-2 flex items-center justify-between gap-3 text-xs overflow-hidden
            ${isOnline
              ? "bg-amber-500/10 border-amber-500/20 text-amber-300"
              : "bg-red-500/10  border-red-500/20  text-red-300"
            }`}
        >
          <div className="flex items-center gap-2">
            {isOnline
              ? <Wifi className="w-3.5 h-3.5 shrink-0" />
              : <WifiOff className="w-3.5 h-3.5 shrink-0" />
            }
            <span>
              {!isOnline
                ? "Offline — drafts saved locally"
                : syncing
                  ? `Syncing ${pendingCount} draft${pendingCount !== 1 ? "s" : ""}…`
                  : `${pendingCount} draft${pendingCount !== 1 ? "s" : ""} pending sync`
              }
            </span>
          </div>

          {isOnline && !syncing && pendingCount > 0 && (
            <button
              onClick={onManualSync}
              aria-label={`Sync ${pendingCount} pending draft${pendingCount !== 1 ? "s" : ""} now`}
              className="flex items-center gap-1 text-amber-300 hover:text-white transition-colors shrink-0"
            >
              <RefreshCw className="w-3 h-3" aria-hidden="true" />
              Sync now
            </button>
          )}
          {syncing && <RefreshCw className="w-3 h-3 animate-spin shrink-0" aria-label="Syncing" />}
        </motion.div>
      )}

      {/* "Just synced" flash */}
      {isOnline && !syncing && pendingCount === 0 && lastSyncedAt && (
        <motion.div
          key="synced"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-400 px-4 py-1.5 flex items-center gap-2 text-xs overflow-hidden"
        >
          <CheckCircle className="w-3 h-3" />
          All drafts synced
        </motion.div>
      )}
    </AnimatePresence>
  );
}