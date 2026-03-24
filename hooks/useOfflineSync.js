/**
 * useOfflineSync — offline-first caching for Inspector Portal
 *
 * Stores:
 *   traceguard_scan_cache   → Map<uid, productData>  (product lookup cache)
 *   traceguard_drafts       → Array<draftReport>     (offline inspection drafts)
 *
 * Auto-syncs pending drafts when connectivity is restored.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { base44 } from "@/lib/base44Client";

const SCAN_CACHE_KEY  = "traceguard_scan_cache";
const DRAFTS_KEY      = "traceguard_drafts";
const MAX_CACHE_AGE   = 7 * 24 * 60 * 60 * 1000; // 7 days

// ── localStorage helpers ─────────────────────────────────────────────────────
function readLS(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeLS(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota exceeded – silently ignore */ }
}

// ── Scan cache ───────────────────────────────────────────────────────────────
export function getCachedProduct(uid) {
  const cache = readLS(SCAN_CACHE_KEY, {});
  const entry = cache[uid];
  if (!entry) return null;
  if (Date.now() - entry.cachedAt > MAX_CACHE_AGE) return null; // stale
  return entry.data;
}

export function setCachedProduct(uid, data) {
  const cache = readLS(SCAN_CACHE_KEY, {});
  cache[uid] = { data, cachedAt: Date.now() };
  writeLS(SCAN_CACHE_KEY, cache);
}

// ── Drafts ───────────────────────────────────────────────────────────────────
export function saveDraft(formData, photos = []) {
  const drafts = readLS(DRAFTS_KEY, []);
  const draft = {
    id: `draft_${Date.now()}`,
    savedAt: Date.now(),
    synced: false,
    formData: {
      ...formData,
      report_number: `RPT-${Date.now().toString().slice(-6)}`,
      photo_urls: photos,
      status: "submitted",
    },
  };
  drafts.push(draft);
  writeLS(DRAFTS_KEY, drafts);
  return draft.id;
}

export function getPendingDrafts() {
  return readLS(DRAFTS_KEY, []).filter((d) => !d.synced);
}

function markDraftSynced(id) {
  const drafts = readLS(DRAFTS_KEY, []);
  const updated = drafts.map((d) => d.id === id ? { ...d, synced: true } : d);
  writeLS(DRAFTS_KEY, updated);
}

/** Convert base64 data URL to File for Base44 UploadFile (Base44 requires file_urls, not raw data URLs) */
function dataURLtoFile(dataUrl, filename = "photo.jpg") {
  const arr = dataUrl.split(",");
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
  const bstr = atob(arr[1]);
  const u8arr = new Uint8Array(bstr.length);
  for (let i = 0; i < bstr.length; i++) u8arr[i] = bstr.charCodeAt(i);
  return new File([u8arr], filename, { type: mime });
}

/** Upload draft photos (data URLs) to Base44 and return file_urls. Skips items already URLs. */
async function uploadDraftPhotos(base44Client, photoUrls) {
  if (!photoUrls?.length) return [];
  const uploads = photoUrls.map((item, i) => {
    if (typeof item === "string" && item.startsWith("data:")) {
      const file = dataURLtoFile(item, `evidence-${i}.jpg`);
      return base44Client.integrations.Core.UploadFile({ file }).then((r) => r.file_url);
    }
    return Promise.resolve(typeof item === "string" ? item : null);
  });
  return (await Promise.all(uploads)).filter(Boolean);
}

// ── Hook ─────────────────────────────────────────────────────────────────────
export default function useOfflineSync() {
  const [isOnline, setIsOnline]         = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(getPendingDrafts().length);
  const [syncing, setSyncing]           = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const syncLock = useRef(false);

  const refreshPendingCount = useCallback(() => {
    setPendingCount(getPendingDrafts().length);
  }, []);

  const syncPendingDrafts = useCallback(async () => {
    if (syncLock.current) return;
    const pending = getPendingDrafts();
    if (!pending.length) return;

    syncLock.current = true;
    setSyncing(true);
    let syncedAny = false;

    for (const draft of pending) {
      try {
        // Base44 expects photo_urls from UploadFile, not base64 data URLs. Upload offline photos first.
        const photoUrls = draft.formData?.photo_urls || [];
        const uploadedPhotoUrls = await uploadDraftPhotos(base44, photoUrls);
        const payload = { ...draft.formData, photo_urls: uploadedPhotoUrls };
        await base44.entities.InspectionReport.create(payload);
        markDraftSynced(draft.id);
        syncedAny = true;
      } catch {
        // Leave this draft for next retry — don't break the loop
      }
    }

    setSyncing(false);
    syncLock.current = false;
    if (syncedAny) {
      setLastSyncedAt(new Date());
      refreshPendingCount();
    }
  }, [refreshPendingCount]);

  // Listen to browser online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncPendingDrafts();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online",  handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online",  handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [syncPendingDrafts]);

  // Sync when online (including initial mount if already connected)
  useEffect(() => {
    if (isOnline && getPendingDrafts().length > 0) {
      syncPendingDrafts();
    }
  }, [isOnline, syncPendingDrafts]);

  return {
    isOnline,
    pendingCount,
    syncing,
    lastSyncedAt,
    syncPendingDrafts,
    refreshPendingCount,
  };
}