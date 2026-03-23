import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Camera,
  Hash,
  Upload,
  Loader2,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  ArrowLeft,
  Info,
  Phone,
} from "lucide-react";

// ── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  authentic: {
    icon: CheckCircle,
    label: "Authentic — Cleared",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/30",
    dot: "bg-emerald-400",
  },
  hold: {
    icon: AlertTriangle,
    label: "On Hold — Do Not Use",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/30",
    dot: "bg-amber-400",
  },
  recalled: {
    icon: XCircle,
    label: "Recalled — Dispose Immediately",
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/30",
    dot: "bg-red-400",
  },
  suspicious: {
    icon: AlertTriangle,
    label: "Suspicious — Use Caution",
    color: "text-orange-400",
    bg: "bg-orange-500/10 border-orange-500/30",
    dot: "bg-orange-400",
  },
  not_found: {
    icon: XCircle,
    label: "Not Found — Possible Counterfeit",
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/30",
    dot: "bg-red-400",
  },
};

// ── Demo serials ─────────────────────────────────────────────────────────────
const DEMO_SERIALS = [
  { serial: "NG-TG-00091234", label: "Authentic product", color: "text-emerald-400" },
  { serial: "NG-TG-00041872", label: "Hold order active", color: "text-amber-400" },
  { serial: "NG-TG-00055678", label: "Recalled batch", color: "text-red-400" },
];

// ── WhatsApp Message Bubble ──────────────────────────────────────────────────
function WhatsAppBubble({ message }) {
  return (
    <div className="bg-[#0A1A0E] border border-emerald-900/40 rounded-2xl p-4 font-mono text-xs text-emerald-200 leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto">
      {message}
    </div>
  );
}

// ── Result Card ──────────────────────────────────────────────────────────────
function ResultCard({ result, onReset }) {
  const cfg = STATUS_CONFIG[result.status] || STATUS_CONFIG.not_found;
  const Icon = cfg.icon;
  const [showRaw, setShowRaw] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      {/* Status badge */}
      <div className={`flex items-center gap-3 border rounded-2xl px-5 py-4 ${cfg.bg}`}>
        <Icon className={`w-6 h-6 shrink-0 ${cfg.color}`} aria-hidden="true" />
        <div>
          <p className={`font-bold text-sm ${cfg.color}`}>{cfg.label}</p>
          {result.resolved_serial && (
            <p className="text-xs text-gray-400 font-mono mt-0.5">{result.resolved_serial}</p>
          )}
        </div>
      </div>

      {/* Product details */}
      {result.product_name && (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 space-y-3">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Product Details</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            {[
              ["Product",      result.product_name],
              ["Batch",        result.batch],
              ["Manufacturer", result.manufacturer],
              ["Expiry",       result.expiry],
              ["Stage",        result.supply_chain_stage?.replace(/_/g, " ")],
              ["Last seen",    result.last_scan_location],
            ].map(([k, v]) =>
              v ? (
                <div key={k}>
                  <p className="text-[10px] text-gray-600 uppercase">{k}</p>
                  <p className="text-xs text-gray-300 capitalize">{v}</p>
                </div>
              ) : null
            )}
          </div>
        </div>
      )}

      {/* Safety instructions */}
      {result.instructions?.length > 0 && (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Safety Instructions</p>
          <ul className="space-y-2">
            {result.instructions.map((instr, i) => (
              <li key={i} className="text-xs text-gray-300 leading-relaxed flex items-start gap-2">
                <span className="text-emerald-500 shrink-0 mt-0.5">•</span>
                {instr}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* WhatsApp preview */}
      <div>
        <button
          onClick={() => setShowRaw(!showRaw)}
          className="flex items-center gap-2 text-xs text-emerald-400/60 hover:text-emerald-400 transition-colors mb-2"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          {showRaw ? "Hide" : "Preview"} WhatsApp message
        </button>
        <AnimatePresence>
          {showRaw && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <WhatsAppBubble message={result.whatsapp_message} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* OCR note */}
      {result.ocr_result && (
        <div className="flex items-start gap-2 bg-white/[0.02] border border-white/[0.04] rounded-xl px-4 py-3">
          <Info className="w-3.5 h-3.5 text-gray-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-gray-500">
            Serial extracted from label image
            {result.ocr_result.confidence ? ` (confidence: ${result.ocr_result.confidence})` : ""}.
            {result.ocr_result.notes ? ` ${result.ocr_result.notes}` : ""}
          </p>
        </div>
      )}

      {/* Reset */}
      <button
        onClick={onReset}
        className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Verify another product
      </button>
    </motion.div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function ConsumerAssist() {
  const [mode, setMode] = useState(null); // null | "serial" | "photo"
  const [serial, setSerial] = useState("");
  const [phone, setPhone] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    let imageUrl = null;

    // Upload image first if in photo mode
    if (mode === "photo" && imageFile) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: imageFile });
      imageUrl = file_url;
    }

    const response = await base44.functions.invoke("consumerAssist", {
      mode,
      serial_number: mode === "serial" ? serial : undefined,
      image_url: imageUrl,
      phone_number: phone || undefined,
    });

    if (response.data.success) {
      setResult(response.data);
      // Save a ConsumerReport record for regulator visibility (all non-authentic results)
      const d = response.data;
      if (d.status !== "authentic") {
        base44.entities.ConsumerReport.create({
          serial_number: d.resolved_serial,
          product_name: d.product_name || null,
          batch_number: d.batch || null,
          manufacturer: d.manufacturer || null,
          reported_status: d.status,
          input_mode: mode,
          reporter_phone: phone || null,
          last_scan_location: d.last_scan_location || null,
          supply_chain_stage: d.supply_chain_stage || null,
          incident_status: "pending_review",
          priority: ["recalled", "not_found"].includes(d.status) ? "high" : "medium",
        });
      }
    } else {
      setError(response.data.error || "Verification failed. Please try again.");
    }
    setLoading(false);
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setSerial("");
    setPhone("");
    setImageFile(null);
    setImagePreview(null);
    setMode(null);
  };

  return (
    <div className="min-h-screen bg-[#060B18]">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-10 px-6 relative overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[300px] bg-emerald-500/5 rounded-full blur-[120px]" />
        <div className="max-w-2xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-6">
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
            <span className="text-xs font-medium text-emerald-400 tracking-wide">Consumer Assistance</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Verify any product,<br />
            <span className="text-emerald-400">even without NFC.</span>
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed max-w-lg mx-auto">
            No smartphone NFC? No problem. Upload a photo of the product label or type the serial number to receive instant authenticity status and safety instructions — delivered via WhatsApp or on screen.
          </p>
        </div>
      </section>

      {/* Main card */}
      <section className="px-6 pb-24">
        <div className="max-w-xl mx-auto">
          <div className="bg-[#0A0F1C] border border-white/[0.08] rounded-3xl p-6 sm:p-8">

            <AnimatePresence mode="wait">
              {result ? (
                <ResultCard key="result" result={result} onReset={reset} />
              ) : (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

                  {/* Mode selector */}
                  {!mode && (
                    <div className="space-y-4">
                      <p className="text-sm font-semibold text-white mb-5">How would you like to verify?</p>
                      <button
                        onClick={() => setMode("photo")}
                        className="w-full flex items-center gap-4 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-emerald-500/30 rounded-2xl p-5 text-left transition-all group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 group-hover:bg-emerald-500/20 flex items-center justify-center shrink-0 transition-colors">
                          <Camera className="w-5 h-5 text-emerald-400" aria-hidden="true" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">Upload Label Photo</p>
                          <p className="text-xs text-gray-500 mt-0.5">AI reads the serial number from your image</p>
                        </div>
                      </button>

                      <button
                        onClick={() => setMode("serial")}
                        className="w-full flex items-center gap-4 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-teal-500/30 rounded-2xl p-5 text-left transition-all group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-teal-500/10 group-hover:bg-teal-500/20 flex items-center justify-center shrink-0 transition-colors">
                          <Hash className="w-5 h-5 text-teal-400" aria-hidden="true" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">Enter Serial Number</p>
                          <p className="text-xs text-gray-500 mt-0.5">Type the NG-TG-XXXXXXXX code from the label</p>
                        </div>
                      </button>

                      {/* Demo serials */}
                      <div className="mt-6 bg-white/[0.02] border border-white/[0.04] rounded-xl p-4">
                        <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-3">Try a demo serial</p>
                        <div className="flex flex-wrap gap-2">
                          {DEMO_SERIALS.map(({ serial: s, label, color }) => (
                            <button
                              key={s}
                              onClick={() => { setSerial(s); setMode("serial"); }}
                              className="text-[11px] border border-white/[0.06] rounded-full px-3 py-1 text-gray-400 hover:text-white hover:border-white/[0.15] transition-colors"
                            >
                              <span className={`${color} font-mono`}>{s}</span>
                              <span className="ml-1.5 text-gray-600">· {label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Photo mode */}
                  {mode === "photo" && (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <button type="button" onClick={() => { setMode(null); setImageFile(null); setImagePreview(null); }}
                        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors mb-2">
                        <ArrowLeft className="w-3.5 h-3.5" /> Back
                      </button>
                      <p className="text-sm font-semibold text-white">Upload Label Photo</p>

                      <label className={`flex flex-col items-center justify-center gap-3 cursor-pointer border-2 border-dashed rounded-2xl transition-all min-h-[160px] ${imagePreview ? "border-emerald-500/30 bg-emerald-500/5" : "border-white/[0.10] hover:border-emerald-500/20 bg-white/[0.02]"}`}>
                        {imagePreview ? (
                          <img src={imagePreview} alt="Label preview" className="max-h-48 rounded-xl object-contain" />
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-gray-600" aria-hidden="true" />
                            <div className="text-center">
                              <p className="text-sm text-gray-400">Tap to upload label photo</p>
                              <p className="text-xs text-gray-600 mt-1">JPG, PNG — clear photo of the full label</p>
                            </div>
                          </>
                        )}
                        <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageSelect} />
                      </label>

                      {imagePreview && (
                        <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }}
                          className="text-xs text-gray-500 hover:text-red-400 transition-colors">
                          Remove image
                        </button>
                      )}

                      <PhoneField phone={phone} setPhone={setPhone} />

                      {error && <ErrorBanner message={error} />}

                      <Button type="submit" disabled={!imageFile || loading}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-11 rounded-full font-medium gap-2">
                        {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Analysing label...</> : <><ShieldCheck className="w-4 h-4" />Verify Product</>}
                      </Button>
                    </form>
                  )}

                  {/* Serial mode */}
                  {mode === "serial" && (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <button type="button" onClick={() => setMode(null)}
                        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors mb-2">
                        <ArrowLeft className="w-3.5 h-3.5" /> Back
                      </button>
                      <p className="text-sm font-semibold text-white">Enter Serial Number</p>

                      <div>
                        <label htmlFor="ca-serial" className="text-xs text-gray-400 mb-1.5 block">Serial Number *</label>
                        <Input
                          id="ca-serial"
                          required
                          value={serial}
                          onChange={(e) => setSerial(e.target.value.toUpperCase())}
                          className="bg-white/[0.03] border-white/[0.08] text-white font-mono uppercase"
                          placeholder="NG-TG-00000000"
                          aria-required="true"
                        />
                        <p className="text-[11px] text-gray-600 mt-1.5">Found on the product label or packaging insert.</p>
                      </div>

                      <PhoneField phone={phone} setPhone={setPhone} />

                      {error && <ErrorBanner message={error} />}

                      <Button type="submit" disabled={!serial.trim() || loading}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-11 rounded-full font-medium gap-2">
                        {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Verifying...</> : <><ShieldCheck className="w-4 h-4" />Verify Product</>}
                      </Button>
                    </form>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* WhatsApp info strip */}
          <div className="flex items-start gap-3 mt-4 bg-green-900/10 border border-green-700/20 rounded-2xl px-5 py-4">
            <Phone className="w-4 h-4 text-green-400 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-xs text-gray-400 leading-relaxed">
              Optionally enter your WhatsApp number to receive the verification result as a message. Results are also displayed instantly on screen.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────
function PhoneField({ phone, setPhone }) {
  return (
    <div>
      <label htmlFor="ca-phone" className="text-xs text-gray-400 mb-1.5 block">
        WhatsApp Number <span className="text-gray-600">(optional)</span>
      </label>
      <Input
        id="ca-phone"
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="bg-white/[0.03] border-white/[0.08] text-white"
        placeholder="+234 812 345 6789"
      />
    </div>
  );
}

function ErrorBanner({ message }) {
  return (
    <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
      <p className="text-xs text-red-300">{message}</p>
    </div>
  );
}