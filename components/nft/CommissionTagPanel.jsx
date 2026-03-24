import React, { useState } from "react";
import { base44 } from "@/lib/base44Client";
import { Button } from "@/components/ui/button";
import { Loader2, Factory } from "lucide-react";

const initial = {
  tag_uid: "",
  batch_number: "",
  product_name: "",
  product_id: "",
  batch_id: "",
  serial_number: "",
  parent_tag_uid: "",
  commissioning_location: "",
  manufacturer_partner_id: "",
  tag_type: "item",
  sdm_key_version: "1",
};

export default function CommissionTagPanel() {
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const body = {
        tag_uid: form.tag_uid.trim(),
        batch_number: form.batch_number.trim(),
        product_name: form.product_name.trim(),
        tag_type: form.tag_type.trim() || "item",
        sdm_key_version: Number(form.sdm_key_version) || 1,
      };
      if (form.product_id.trim()) body.product_id = form.product_id.trim();
      if (form.batch_id.trim()) body.batch_id = form.batch_id.trim();
      if (form.serial_number.trim()) body.serial_number = form.serial_number.trim();
      if (form.parent_tag_uid.trim()) body.parent_tag_uid = form.parent_tag_uid.trim();
      if (form.commissioning_location.trim()) {
        body.commissioning_location = form.commissioning_location.trim();
      }
      if (form.manufacturer_partner_id.trim()) {
        body.manufacturer_partner_id = form.manufacturer_partner_id.trim();
      }

      const res = await base44.functions.invoke("commissionTag", body);
      const data = res?.data ?? res;
      if (data?.error) {
        setError(data.error);
        setResult(data);
        return;
      }
      setResult(data);
      setForm((f) => ({
        ...initial,
        batch_number: f.batch_number,
        product_name: f.product_name,
        product_id: f.product_id,
        batch_id: f.batch_id,
        commissioning_location: f.commissioning_location,
        manufacturer_partner_id: f.manufacturer_partner_id,
      }));
    } catch (err) {
      setError(err?.message || "Commission failed");
    } finally {
      setLoading(false);
    }
  };

  const sync = result?.nft_registry_sync;

  return (
    <div className="border border-emerald-500/20 rounded-2xl bg-emerald-500/5 p-5 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
          <Factory className="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">Commission NFC tag</h2>
          <p className="text-[11px] text-gray-500">
            Writes TagRegistry + scan event; syncs hierarchy to NFT registry when DB secrets are set.
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <label className="sm:col-span-2 flex flex-col gap-1">
          <span className="text-gray-500">Tag UID *</span>
          <input
            required
            className="rounded-lg bg-[#0D1424] border border-white/[0.1] px-3 py-2 text-white font-mono"
            value={form.tag_uid}
            onChange={(e) => set("tag_uid", e.target.value)}
            placeholder="NG-TG-…"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-gray-500">Batch number *</span>
          <input
            required
            className="rounded-lg bg-[#0D1424] border border-white/[0.1] px-3 py-2 text-white"
            value={form.batch_number}
            onChange={(e) => set("batch_number", e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-gray-500">Product name *</span>
          <input
            required
            className="rounded-lg bg-[#0D1424] border border-white/[0.1] px-3 py-2 text-white"
            value={form.product_name}
            onChange={(e) => set("product_name", e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-gray-500">Product / SKU id</span>
          <input
            className="rounded-lg bg-[#0D1424] border border-white/[0.1] px-3 py-2 text-white"
            value={form.product_id}
            onChange={(e) => set("product_id", e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-gray-500">Batch id (Base44)</span>
          <input
            className="rounded-lg bg-[#0D1424] border border-white/[0.1] px-3 py-2 text-white font-mono text-[11px]"
            value={form.batch_id}
            onChange={(e) => set("batch_id", e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-gray-500">Serial number</span>
          <input
            className="rounded-lg bg-[#0D1424] border border-white/[0.1] px-3 py-2 text-white font-mono"
            value={form.serial_number}
            onChange={(e) => set("serial_number", e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-gray-500">Parent tag UID (aggregation)</span>
          <input
            className="rounded-lg bg-[#0D1424] border border-white/[0.1] px-3 py-2 text-white font-mono"
            value={form.parent_tag_uid}
            onChange={(e) => set("parent_tag_uid", e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-gray-500">Commissioning location</span>
          <input
            className="rounded-lg bg-[#0D1424] border border-white/[0.1] px-3 py-2 text-white"
            value={form.commissioning_location}
            onChange={(e) => set("commissioning_location", e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-gray-500">Manufacturer partner id</span>
          <input
            className="rounded-lg bg-[#0D1424] border border-white/[0.1] px-3 py-2 text-white font-mono text-[11px]"
            value={form.manufacturer_partner_id}
            onChange={(e) => set("manufacturer_partner_id", e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-gray-500">Tag type</span>
          <input
            className="rounded-lg bg-[#0D1424] border border-white/[0.1] px-3 py-2 text-white"
            value={form.tag_type}
            onChange={(e) => set("tag_type", e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-gray-500">SDM key version</span>
          <input
            type="number"
            min={1}
            className="rounded-lg bg-[#0D1424] border border-white/[0.1] px-3 py-2 text-white"
            value={form.sdm_key_version}
            onChange={(e) => set("sdm_key_version", e.target.value)}
          />
        </label>

        <div className="sm:col-span-2 flex flex-wrap gap-2 pt-2">
          <Button
            type="submit"
            disabled={loading}
            className="rounded-full bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Commissioning…
              </>
            ) : (
              "Commission tag"
            )}
          </Button>
        </div>
      </form>

      {error && (
        <p className="mt-3 text-xs text-red-400 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2">
          {error}
        </p>
      )}

      {sync && (
        <div className="mt-3 text-[11px] rounded-lg border border-white/[0.08] bg-[#0D1424] px-3 py-2 text-gray-400 space-y-1">
          <p className="text-gray-300 font-medium">NFT registry sync</p>
          {"skipped" in sync && sync.skipped && (
            <p>No <code className="text-gray-500">DATABASE_URL</code> — sync skipped (Base44 data still saved).</p>
          )}
          {"ok" in sync && sync.ok === true && (
            <p className="text-emerald-400/90">
              Linked — SKU node <span className="font-mono text-[10px]">{sync.sku_node_id}</span>, tag instance{" "}
              <span className="font-mono text-[10px]">{sync.tag_instance_node_id}</span>
            </p>
          )}
          {"ok" in sync && sync.ok === false && (
            <p className="text-amber-300">Failed: {sync.error}</p>
          )}
        </div>
      )}
    </div>
  );
}
