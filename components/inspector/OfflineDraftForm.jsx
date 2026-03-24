/**
 * OfflineDraftForm — inspection report form that works offline.
 * Saves to localStorage as a draft when offline, submits directly when online.
 */
import React, { useState } from "react";
import { base44 } from "@/lib/base44Client";
import { saveDraft } from "@/hooks/useOfflineSync";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import MobileSelect from "@/components/ui/MobileSelect";
import { X, CheckCircle, Loader2, Camera, WifiOff, CloudOff } from "lucide-react";
import { motion } from "framer-motion";

const NIGERIAN_STATES = ["Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno","Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT","Gombe","Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba","Yobe","Zamfara"];

const STATE_OPTIONS = NIGERIAN_STATES.map((s) => ({ value: s, label: s }));

const RECOMMENDATION_OPTIONS = [
  { value: "clear",             label: "Clear — No action required" },
  { value: "hold",              label: "Hold — Pending investigation" },
  { value: "quarantine",        label: "Quarantine — Remove from sale" },
  { value: "seize",             label: "Seize — NAFDAC custody" },
  { value: "refer_prosecution", label: "Refer for Prosecution" },
];

export default function OfflineDraftForm({ prefillProduct, isOnline, onClose, onSaved, onRefreshPending }) {
  const [form, setForm] = useState({
    inspector_name:  "",
    inspector_id:    "",
    location:        prefillProduct?.chain?.at(-1)?.location || "",
    state:           "",
    outlet_name:     "",
    batch_numbers:   prefillProduct?.batch  || "",
    product_names:   prefillProduct?.product || "",
    findings:        "",
    recommendation:  "",
  });
  const [photos, setPhotos]       = useState([]);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus]       = useState("idle"); // idle | saving | saved_online | saved_offline | error

  const field = (key) => ({
    value: form[key],
    onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })),
    className: "bg-white/[0.03] border-white/[0.08] text-white placeholder:text-gray-600 text-sm",
  });

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    const dataUrls = await Promise.all(
      files.map(
        (f) => new Promise((res) => {
          const reader = new FileReader();
          reader.onload = (ev) => res(ev.target.result);
          reader.readAsDataURL(f);
        })
      )
    );
    setPhotos((prev) => [...prev, ...dataUrls]);
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("saving");

    const reportNum = `RPT-${Date.now().toString().slice(-6)}`;
    const payload = {
      ...form,
      report_number: reportNum,
      photo_urls: photos,
      status: "submitted",
    };

    if (isOnline) {
      try {
        await base44.entities.InspectionReport.create(payload);
        setStatus("saved_online");
        setTimeout(() => { onSaved?.(); onClose?.(); }, 1800);
      } catch {
        saveDraft(form, photos);
        onRefreshPending?.();
        setStatus("saved_offline");
        setTimeout(() => { onSaved?.(); onClose?.(); }, 2200);
      }
    } else {
      saveDraft(form, photos);
      onRefreshPending?.();
      setStatus("saved_offline");
      setTimeout(() => { onSaved?.(); onClose?.(); }, 2200);
    }
  };

  if (status === "saved_online" || status === "saved_offline") {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="text-center py-10 px-4">
        {status === "saved_online"
          ? <CheckCircle className="w-11 h-11 text-emerald-400 mx-auto mb-3" />
          : <CloudOff   className="w-11 h-11 text-amber-400  mx-auto mb-3" />
        }
        <p className="text-white font-semibold">
          {status === "saved_online" ? "Report Submitted" : "Draft Saved Offline"}
        </p>
        <p className="text-gray-500 text-xs mt-1">
          {status === "saved_online"
            ? "Successfully saved to the server."
            : "Will auto-sync when connectivity is restored."}
        </p>
      </motion.div>
    );
  }

  return (
    <div className="px-4 pb-8">
      {!isOnline && (
        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2.5 mb-4 text-xs text-amber-300">
          <WifiOff className="w-3.5 h-3.5 shrink-0" />
          Offline mode — report will be saved as a draft and synced automatically.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="od-inspector-name" className="text-[10px] text-gray-500 mb-1 block">Inspector Name *</label>
            <Input id="od-inspector-name" required {...field("inspector_name")} placeholder="Full name" aria-required="true" />
          </div>
          <div>
            <label htmlFor="od-inspector-id" className="text-[10px] text-gray-500 mb-1 block">Badge / ID</label>
            <Input id="od-inspector-id" {...field("inspector_id")} placeholder="NF-2024-0042" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="od-location" className="text-[10px] text-gray-500 mb-1 block">Location *</label>
            <Input id="od-location" required {...field("location")} placeholder="Street / area" aria-required="true" />
          </div>
          <div>
            <label className="text-[10px] text-gray-500 mb-1 block">State</label>
            <MobileSelect
              value={form.state}
              onValueChange={(v) => setForm((f) => ({ ...f, state: v }))}
              placeholder="State"
              options={STATE_OPTIONS}
              label="Select State"
            />
          </div>
        </div>

        <div>
          <label htmlFor="od-outlet" className="text-[10px] text-gray-500 mb-1 block">Outlet / Premises</label>
          <Input id="od-outlet" {...field("outlet_name")} placeholder="Pharmacy / distributor name" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="od-batch" className="text-[10px] text-gray-500 mb-1 block">Batch No(s)</label>
            <Input id="od-batch" {...field("batch_numbers")} placeholder="AMX-2026-0341" />
          </div>
          <div>
            <label htmlFor="od-product" className="text-[10px] text-gray-500 mb-1 block">Product(s)</label>
            <Input id="od-product" {...field("product_names")} placeholder="Product name" />
          </div>
        </div>

        <div>
          <label htmlFor="od-findings" className="text-[10px] text-gray-500 mb-1 block">Findings *</label>
          <Textarea id="od-findings" required {...field("findings")}
            className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-gray-600 text-sm min-h-[90px]"
            placeholder="Describe observations, quantities, suspected violations…"
            aria-required="true" />
        </div>

        <div>
          <label className="text-[10px] text-gray-500 mb-1 block">Recommendation *</label>
          <MobileSelect
            value={form.recommendation}
            onValueChange={(v) => setForm((f) => ({ ...f, recommendation: v }))}
            placeholder="Select recommendation"
            options={RECOMMENDATION_OPTIONS}
            label="Select Recommendation"
          />
        </div>

        {/* Photo evidence */}
        <div>
          <label className="text-[10px] text-gray-500 mb-1 block">Photo Evidence</label>
          <label className="flex items-center gap-3 cursor-pointer bg-white/[0.02] border border-dashed border-white/[0.10] hover:border-emerald-500/30 rounded-xl p-3 transition-colors">
            <Camera className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <p className="text-xs text-white">Add Photos</p>
              <p className="text-[10px] text-gray-500">Stored locally until synced</p>
            </div>
            <input type="file" accept="image/*" multiple capture="environment" className="hidden" onChange={handlePhotoUpload} />
          </label>
          {uploading && (
            <div className="flex items-center gap-2 mt-2 text-[10px] text-emerald-400">
              <Loader2 className="w-3 h-3 animate-spin" />Reading photos…
            </div>
          )}
          {photos.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {photos.map((url, i) => (
                <div key={i} className="relative group">
                  <img src={url} alt="" className="w-14 h-14 rounded-lg object-cover border border-white/[0.08]" />
                  <button type="button"
                    onClick={() => setPhotos((p) => p.filter((_, j) => j !== i))}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-2.5 h-2.5 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-1">
          {onClose && (
            <Button type="button" onClick={onClose} variant="outline"
              className="flex-1 border-white/[0.08] text-gray-400 hover:text-white h-11 rounded-full text-sm">
              Cancel
            </Button>
          )}
          <Button type="submit"
            disabled={status === "saving" || !form.recommendation}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-30 text-white h-11 rounded-full font-medium text-sm gap-2">
            {status === "saving"
              ? <><Loader2 className="w-4 h-4 animate-spin" />{isOnline ? "Submitting…" : "Saving…"}</>
              : isOnline ? "Submit Report" : "Save Draft"
            }
          </Button>
        </div>
      </form>
    </div>
  );
}