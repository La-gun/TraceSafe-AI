import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/lib/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Package, AlertTriangle, ShieldCheck, Clock, X, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import MobileSelect from "@/components/ui/MobileSelect";

const QUERY_KEY = ["batch-statuses"];

const statusConfig = {
  active:      { label: "Active",     color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  hold:        { label: "Hold",       color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  quarantine:  { label: "Quarantine", color: "text-orange-400 bg-orange-500/10 border-orange-500/20" },
  recalled:    { label: "Recalled",   color: "text-red-400 bg-red-500/10 border-red-500/20" },
  cleared:     { label: "Cleared",    color: "text-teal-400 bg-teal-500/10 border-teal-500/20" },
};

const statusIcons = {
  active: ShieldCheck,
  hold: Clock,
  quarantine: AlertTriangle,
  recalled: AlertTriangle,
  cleared: ShieldCheck,
};

// ── Add Batch Modal ──────────────────────────────────────────────────────────
function AddBatchModal({ onClose }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    batch_number: "", product_name: "", manufacturer: "",
    status: "hold", reason: "", updated_by: "", units_affected: "",
  });

  const addMutation = useMutation({
    mutationFn: (data) => base44.entities.BatchStatus.create(data),
    // Optimistic: insert a temporary record immediately
    onMutate: async (newRecord) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY });
      const previous = qc.getQueryData(QUERY_KEY);
      const optimistic = { ...newRecord, id: `optimistic-${Date.now()}`, updated_date: new Date().toISOString() };
      qc.setQueryData(QUERY_KEY, (old = []) => [optimistic, ...old]);
      return { previous };
    },
    onSettled: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
    onError: (_err, _vars, ctx) => qc.setQueryData(QUERY_KEY, ctx.previous),
    onSuccess: () => onClose(),
  });

  const handleSave = (e) => {
    e.preventDefault();
    addMutation.mutate({ ...form, units_affected: Number(form.units_affected) || 0 });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-[#0D1424] border border-white/[0.08] rounded-3xl p-6 w-full max-w-lg">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-bold" id="add-batch-title">Add Batch Status Record</h3>
          <button onClick={onClose} aria-label="Close dialog" className="text-gray-500 hover:text-white"><X className="w-5 h-5" aria-hidden="true" /></button>
        </div>
        <form onSubmit={handleSave} className="space-y-4" aria-labelledby="add-batch-title">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="bs-batch-number" className="text-xs text-gray-400 mb-1 block">Batch Number *</label>
              <Input id="bs-batch-number" required value={form.batch_number} onChange={(e) => setForm({ ...form, batch_number: e.target.value })}
                className="bg-white/[0.03] border-white/[0.08] text-white text-sm" placeholder="e.g. AMX-2026-0341" aria-required="true" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Status *</label>
              <MobileSelect
                value={form.status}
                onValueChange={(v) => setForm({ ...form, status: v })}
                options={Object.entries(statusConfig).map(([v, c]) => ({ value: v, label: c.label }))}
                label="Select Status"
              />
            </div>
          </div>
          <div>
            <label htmlFor="bs-product-name" className="text-xs text-gray-400 mb-1 block">Product Name *</label>
            <Input id="bs-product-name" required value={form.product_name} onChange={(e) => setForm({ ...form, product_name: e.target.value })}
              className="bg-white/[0.03] border-white/[0.08] text-white text-sm" placeholder="e.g. Amoxicillin 500mg" aria-required="true" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="bs-manufacturer" className="text-xs text-gray-400 mb-1 block">Manufacturer</label>
              <Input id="bs-manufacturer" value={form.manufacturer} onChange={(e) => setForm({ ...form, manufacturer: e.target.value })}
                className="bg-white/[0.03] border-white/[0.08] text-white text-sm" />
            </div>
            <div>
              <label htmlFor="bs-units" className="text-xs text-gray-400 mb-1 block">Units Affected</label>
              <Input id="bs-units" type="number" value={form.units_affected} onChange={(e) => setForm({ ...form, units_affected: e.target.value })}
                className="bg-white/[0.03] border-white/[0.08] text-white text-sm" placeholder="0" />
            </div>
          </div>
          <div>
            <label htmlFor="bs-reason" className="text-xs text-gray-400 mb-1 block">Reason for Status</label>
            <Input id="bs-reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}
              className="bg-white/[0.03] border-white/[0.08] text-white text-sm" placeholder="Brief reason..." />
          </div>
          <div>
            <label htmlFor="bs-updated-by" className="text-xs text-gray-400 mb-1 block">Updated By</label>
            <Input id="bs-updated-by" value={form.updated_by} onChange={(e) => setForm({ ...form, updated_by: e.target.value })}
              className="bg-white/[0.03] border-white/[0.08] text-white text-sm" placeholder="Inspector name" />
          </div>
          <Button type="submit" disabled={addMutation.isPending}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-10 rounded-full text-sm">
            {addMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Record"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}

// ── Batch Card ───────────────────────────────────────────────────────────────
function BatchCard({ batch }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [newStatus, setNewStatus] = useState(batch.status);
  const [reason, setReason] = useState("");

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.BatchStatus.update(id, data),
    // Optimistic: update the card in the list immediately
    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY });
      const previous = qc.getQueryData(QUERY_KEY);
      qc.setQueryData(QUERY_KEY, (old = []) =>
        old.map((b) => b.id === id ? { ...b, ...data } : b)
      );
      return { previous };
    },
    onSettled: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
    onError: (_err, _vars, ctx) => qc.setQueryData(QUERY_KEY, ctx.previous),
    onSuccess: () => setEditing(false),
  });

  const handleUpdate = () => {
    updateMutation.mutate({
      id: batch.id,
      data: { status: newStatus, reason: reason || batch.reason },
    });
  };

  const cfg = statusConfig[batch.status] || statusConfig.active;
  const Icon = statusIcons[batch.status] || ShieldCheck;

  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 hover:border-white/[0.10] transition-all">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${cfg.color} border`}>
            <Icon className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{batch.product_name}</p>
            <p className="text-xs text-gray-500 font-mono">{batch.batch_number}</p>
          </div>
        </div>
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${cfg.color}`}>{cfg.label}</span>
      </div>

      {batch.manufacturer && <p className="text-xs text-gray-500 mb-1">Manufacturer: <span className="text-gray-400">{batch.manufacturer}</span></p>}
      {batch.units_affected > 0 && <p className="text-xs text-gray-500 mb-1">Units affected: <span className="text-gray-400">{batch.units_affected.toLocaleString()}</span></p>}
      {batch.reason && <p className="text-xs text-gray-500 mb-1">Reason: <span className="text-gray-400">{batch.reason}</span></p>}
      {batch.updated_by && <p className="text-xs text-gray-600 mt-2">Updated by: {batch.updated_by}</p>}

      {editing ? (
        <div className="mt-3 space-y-2">
          <MobileSelect
            value={newStatus}
            onValueChange={setNewStatus}
            options={Object.entries(statusConfig).map(([v, c]) => ({ value: v, label: c.label }))}
            label="Update Status"
          />
          <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Update reason..."
            className="bg-white/[0.03] border-white/[0.08] text-white text-xs h-8" />
          <div className="flex gap-2">
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs h-7 rounded-full">
              {updateMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Update"}
            </Button>
            <Button onClick={() => setEditing(false)} variant="outline"
              className="flex-1 border-white/[0.08] text-gray-400 text-xs h-7 rounded-full">
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <button onClick={() => setEditing(true)}
          aria-label={`Update status for ${batch.product_name}`}
          className="mt-3 text-xs text-emerald-400/60 hover:text-emerald-400 transition-colors">
          Update Status →
        </button>
      )}
    </div>
  );
}

// ── Panel ────────────────────────────────────────────────────────────────────
export default function BatchStatusPanel() {
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState("all");

  const { data: batches = [], isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => base44.entities.BatchStatus.list("-updated_date", 50),
  });

  const filtered = filter === "all" ? batches : batches.filter((b) => b.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-white">Batch Status Management</h2>
          <p className="text-xs text-gray-500 mt-0.5">Hold, quarantine, and recall tracking</p>
        </div>
        <Button onClick={() => setShowAdd(true)} aria-label="Add new batch status record"
          className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs h-8 px-4 rounded-full gap-1.5">
          <Plus className="w-3.5 h-3.5" aria-hidden="true" />Add Record
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap mb-5">
        {["all", "hold", "quarantine", "recalled", "active", "cleared"].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`text-xs px-3 py-1 rounded-full border transition-colors capitalize ${
              filter === s
                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                : "border-white/[0.08] text-gray-500 hover:text-gray-300"
            }`}>
            {s === "all" ? "All" : statusConfig[s]?.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-sm">
          <Package className="w-8 h-8 mx-auto mb-3 opacity-30" />
          No batch records found. Add one to begin tracking.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((batch) => (
            <BatchCard key={batch.id} batch={batch} />
          ))}
        </div>
      )}

      {showAdd && <AddBatchModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}