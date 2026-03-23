import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import MobileSelect from "@/components/ui/MobileSelect";
import { X, CheckCircle, Loader2, Camera } from "lucide-react";
import { motion } from "framer-motion";

const NIGERIAN_STATES = ["Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno","Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT","Gombe","Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba","Yobe","Zamfara"];

const STATE_OPTIONS = NIGERIAN_STATES.map((s) => ({ value: s, label: s }));

const RECOMMENDATION_OPTIONS = [
  { value: "clear",              label: "Clear — No action required" },
  { value: "hold",               label: "Hold — Pending further investigation" },
  { value: "quarantine",         label: "Quarantine — Remove from sale" },
  { value: "seize",              label: "Seize — Take into NAFDAC custody" },
  { value: "refer_prosecution",  label: "Refer for Prosecution" },
];

const REPORTS_QUERY_KEY = ["inspection-reports"];

export default function InspectionReportForm({ prefillAlert, onClose, onSubmitted }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    inspector_name: "",
    inspector_id: "",
    alert_id: prefillAlert?.id || "",
    location: prefillAlert?.detected_zone || "",
    state: "",
    outlet_name: "",
    batch_numbers: prefillAlert?.batch || "",
    product_names: prefillAlert?.product || "",
    findings: "",
    recommendation: "",
  });
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submitMutation = useMutation({
    mutationFn: (payload) => base44.entities.InspectionReport.create(payload),
    onMutate: async (payload) => {
      await qc.cancelQueries({ queryKey: REPORTS_QUERY_KEY });
      const previous = qc.getQueryData(REPORTS_QUERY_KEY);
      const optimistic = { ...payload, id: `optimistic-${Date.now()}`, created_date: new Date().toISOString() };
      qc.setQueryData(REPORTS_QUERY_KEY, (old = []) => [optimistic, ...old]);
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      qc.setQueryData(REPORTS_QUERY_KEY, ctx?.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: REPORTS_QUERY_KEY }),
    onSuccess: () => {
      setSubmitted(true);
      setTimeout(() => { onSubmitted?.(); onClose?.(); }, 2000);
    },
  });

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    const urls = [];
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      urls.push(file_url);
    }
    setPhotos((prev) => [...prev, ...urls]);
    setUploading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const reportNum = `RPT-${Date.now().toString().slice(-6)}`;
    submitMutation.mutate({ ...form, report_number: reportNum, photo_urls: photos, status: "submitted" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0A0F1C] border border-white/[0.08] rounded-3xl p-6 sm:p-8"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-white">New Inspection Report</h2>
          {prefillAlert && (
            <p className="text-xs text-emerald-400 mt-0.5">Pre-filled from Alert {prefillAlert.id}</p>
          )}
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {submitted ? (
        <div className="text-center py-12">
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
          <h3 className="text-white font-semibold text-lg">Report Submitted</h3>
          <p className="text-gray-400 text-sm mt-1">Your inspection report has been recorded.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="ir-inspector-name" className="text-xs text-gray-400 mb-1.5 block">Inspector Name *</label>
              <Input id="ir-inspector-name" required value={form.inspector_name} onChange={set("inspector_name")}
                className="bg-white/[0.03] border-white/[0.08] text-white" placeholder="Full name" aria-required="true" />
            </div>
            <div>
              <label htmlFor="ir-inspector-id" className="text-xs text-gray-400 mb-1.5 block">NAFDAC Badge / ID</label>
              <Input id="ir-inspector-id" value={form.inspector_id} onChange={set("inspector_id")}
                className="bg-white/[0.03] border-white/[0.08] text-white" placeholder="e.g. NF-2024-0042" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="ir-location" className="text-xs text-gray-400 mb-1.5 block">Location / Premises *</label>
              <Input id="ir-location" required value={form.location} onChange={set("location")}
                className="bg-white/[0.03] border-white/[0.08] text-white" placeholder="Street / area" aria-required="true" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">State</label>
              <MobileSelect
                value={form.state}
                onValueChange={(v) => setForm((f) => ({ ...f, state: v }))}
                placeholder="Select state"
                options={STATE_OPTIONS}
                label="Select State"
              />
            </div>
          </div>

          <div>
            <label htmlFor="ir-outlet" className="text-xs text-gray-400 mb-1.5 block">Outlet / Premises Name</label>
            <Input id="ir-outlet" value={form.outlet_name} onChange={set("outlet_name")}
              className="bg-white/[0.03] border-white/[0.08] text-white" placeholder="Pharmacy / distributor name" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="ir-batch" className="text-xs text-gray-400 mb-1.5 block">Batch Number(s)</label>
              <Input id="ir-batch" value={form.batch_numbers} onChange={set("batch_numbers")}
                className="bg-white/[0.03] border-white/[0.08] text-white" placeholder="e.g. AMX-2026-0341" />
            </div>
            <div>
              <label htmlFor="ir-product" className="text-xs text-gray-400 mb-1.5 block">Product(s)</label>
              <Input id="ir-product" value={form.product_names} onChange={set("product_names")}
                className="bg-white/[0.03] border-white/[0.08] text-white" placeholder="Product name(s)" />
            </div>
          </div>

          <div>
            <label htmlFor="ir-findings" className="text-xs text-gray-400 mb-1.5 block">Findings *</label>
            <Textarea id="ir-findings" required value={form.findings} onChange={set("findings")}
              className="bg-white/[0.03] border-white/[0.08] text-white min-h-[100px]"
              placeholder="Describe observations, quantities found, condition of goods, suspected violations..."
              aria-required="true" />
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Recommendation *</label>
            <MobileSelect
              value={form.recommendation}
              onValueChange={(v) => setForm((f) => ({ ...f, recommendation: v }))}
              placeholder="Select recommendation"
              options={RECOMMENDATION_OPTIONS}
              label="Select Recommendation"
            />
          </div>

          {/* Photo upload */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Photo Evidence</label>
            <label className="flex items-center gap-3 cursor-pointer bg-white/[0.02] border border-dashed border-white/[0.12] hover:border-emerald-500/30 rounded-xl p-4 transition-colors">
              <Camera className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="text-sm text-white">Upload Photos</p>
                <p className="text-xs text-gray-500">JPG, PNG — multiple files allowed</p>
              </div>
              <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
            </label>
            {uploading && (
              <div className="flex items-center gap-2 mt-2 text-xs text-emerald-400">
                <Loader2 className="w-3 h-3 animate-spin" />Uploading...
              </div>
            )}
            {photos.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {photos.map((url, i) => (
                  <div key={i} className="relative group">
                    <img src={url} alt={`evidence-${i}`} className="w-16 h-16 rounded-lg object-cover border border-white/[0.08]" />
                    <button type="button" onClick={() => setPhotos((p) => p.filter((_, j) => j !== i))}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-2.5 h-2.5 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" disabled={submitMutation.isPending || !form.recommendation}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-11 rounded-full font-medium gap-2">
            {submitMutation.isPending
              ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting...</>
              : "Submit Inspection Report"}
          </Button>
        </form>
      )}
    </motion.div>
  );
}