/**
 * SequenceDiagram — animated, interactive sequence diagram illustrating the
 * full TraceGuard message flow: Factory → CloudBackend ↔ AI_Agent → Consumer.
 */
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Factory, Cloud, Brain, User, Ship, ChevronDown, ChevronUp } from "lucide-react";

const PARTICIPANTS = [
  { id: "factory",  label: "Factory",       sub: "Commissioning",   icon: Factory,   color: "text-teal-400",    ring: "border-teal-500/30",  bg: "bg-teal-500/10" },
  { id: "cloud",    label: "Cloud Backend", sub: "TraceGuard API",  icon: Cloud,     color: "text-emerald-400", ring: "border-emerald-500/30",bg: "bg-emerald-500/10" },
  { id: "ai",       label: "AI Agent",      sub: "Verification",    icon: Brain,     color: "text-violet-400",  ring: "border-violet-500/30", bg: "bg-violet-500/10" },
  { id: "port",     label: "Port / Wholesale", sub: "Supply Chain", icon: Ship,      color: "text-blue-400",    ring: "border-blue-500/30",   bg: "bg-blue-500/10" },
  { id: "consumer", label: "Consumer",      sub: "NFC Tap",         icon: User,      color: "text-amber-400",   ring: "border-amber-500/30",  bg: "bg-amber-500/10" },
];

// col index for each participant (0-based)
const COL = { factory: 0, cloud: 1, ai: 2, port: 3, consumer: 4 };

const MESSAGES = [
  { from: "factory",  to: "cloud",    label: "CommissionTag(tagID, batchID)",        type: "call",   detail: "NTAG 424 DNA tag personalised at factory. Unique cryptographic identity bound to batch master record." },
  { from: "cloud",    to: "ai",       label: "RecordCommission(tagID)",              type: "call",   detail: "AI agent acknowledges the commissioning event and validates data completeness against batch schema." },
  { from: "ai",       to: "cloud",    label: "ACK",                                  type: "return", detail: "Commission event validated. Digital twin created and locked in registry." },
  { from: "factory",  to: "cloud",    label: "CreateAggregation(batchID, [tagIDs])", type: "call",   detail: "Factory binds unit tags to parent case/pallet hierarchy before goods leave the production line." },
  { from: "cloud",    to: "ai",       label: "VerifyAggregation(batchID)",           type: "call",   detail: "AI agent checks aggregation graph integrity — validates parent-child counts and flags anomalies." },
  { from: "ai",       to: "cloud",    label: "OK",                                   type: "return", detail: "Aggregation graph verified. Packing list locked." },
  { from: "cloud",    to: "factory",  label: "Confirm",                              type: "return", detail: "Factory receives confirmation. Goods cleared for dispatch." },
  { from: "port",     to: "cloud",    label: "ScanTag(tagID)",                       type: "call",   detail: "Port operator taps parent logistics tag. Backend propagates scan event to all linked child items." },
  { from: "cloud",    to: "ai",       label: "AnalyzeScan(tagID, location=Port)",    type: "call",   detail: "AI agent runs geo-fence check, chain-of-custody validation, and diversion risk scoring." },
  { from: "ai",       to: "cloud",    label: "Report OK",                            type: "return", detail: "Port scan clean. No anomalies. Custody transferred to distributor." },
  { from: "cloud",    to: "port",     label: "ForwardTagData(tagID)",                type: "call",   detail: "Tag provenance data pushed to wholesaler for receipt confirmation." },
  { from: "port",     to: "cloud",    label: "ScanTag(tagID)",                       type: "call",   detail: "Wholesaler confirms receipt by tapping tag. De-aggregation and re-aggregation may occur here." },
  { from: "cloud",    to: "ai",       label: "CheckChainOfCustody(tagID, Wholesaler)",type:"call",   detail: "AI agent validates the custody chain: expected zone, authorised partner, and elapsed transit time." },
  { from: "ai",       to: "cloud",    label: "Flag (all good)",                      type: "return", detail: "Chain of custody confirmed. No diversion flags raised. Diversion score remains low." },
  { from: "consumer", to: "cloud",    label: "AuthenticateTag(tagID, dynamicToken)", type: "call",   detail: "Consumer taps product. NTAG 424 DNA generates a unique per-tap cryptographic token — unrepeatable." },
  { from: "cloud",    to: "ai",       label: "ValidateTag(tagID)",                   type: "call",   detail: "AI agent performs final cross-check: token validity, clone detection, recall status, and geo-match." },
  { from: "ai",       to: "cloud",    label: "Genuine",                              type: "return", detail: "Tag authenticated. Product confirmed genuine. No recall flags. Route verified." },
  { from: "cloud",    to: "consumer", label: "\"Product is genuine and valid until MM/YYYY\"", type: "return", highlight: true, detail: "Consumer receives clear, trusted authentication result via web page — no app install required." },
];

const TOTAL_COLS = PARTICIPANTS.length;
const COL_W = 100 / TOTAL_COLS; // % width per column

function arrowPath(fromCol, toCol, isReturn) {
  // Returns a simple left/right indicator
  return fromCol < toCol ? "→" : "←";
}

export default function SequenceDiagram() {
  const [expandedIdx, setExpandedIdx] = useState(null);

  return (
    <div className="bg-[#0A0F1C] border border-white/[0.08] rounded-3xl overflow-hidden">
      {/* Participant headers */}
      <div className="grid border-b border-white/[0.06]" style={{ gridTemplateColumns: `repeat(${TOTAL_COLS}, 1fr)` }}>
        {PARTICIPANTS.map((p) => {
          const Icon = p.icon;
          return (
            <div key={p.id} className="flex flex-col items-center gap-1.5 px-2 py-4 border-r last:border-r-0 border-white/[0.04]">
              <div className={`w-9 h-9 rounded-xl ${p.bg} border ${p.ring} flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${p.color}`} />
              </div>
              <p className={`text-[10px] font-bold ${p.color} text-center leading-tight`}>{p.label}</p>
              <p className="text-[9px] text-gray-600 text-center hidden sm:block">{p.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Lifeline + messages */}
      <div className="relative">
        {/* Vertical lifelines */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
          {PARTICIPANTS.map((_, i) => (
            <div key={i} className="absolute top-0 bottom-0 w-px bg-white/[0.04]"
              style={{ left: `calc(${(i / TOTAL_COLS) * 100}% + ${COL_W / 2}%)` }} />
          ))}
        </div>

        {/* Message rows */}
        <div className="relative" style={{ zIndex: 1 }}>
          {MESSAGES.map((msg, idx) => {
            const fromCol = COL[msg.from];
            const toCol   = COL[msg.to];
            const isReturn = msg.type === "return";
            const isExpanded = expandedIdx === idx;
            const goRight = toCol > fromCol;

            // Arrow spans from min to max col
            const leftCol  = Math.min(fromCol, toCol);
            const rightCol = Math.max(fromCol, toCol);
            const leftPct  = (leftCol / TOTAL_COLS) * 100 + COL_W / 2;
            const widthPct = ((rightCol - leftCol) / TOTAL_COLS) * 100;

            return (
              <motion.div key={idx}
                initial={{ opacity: 0, y: 6 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.3, delay: idx * 0.04 }}
                className="relative border-b border-white/[0.03] last:border-b-0"
              >
                <button
                  onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                  className="w-full relative py-3 px-0 text-left group hover:bg-white/[0.02] transition-colors"
                >
                  {/* Arrow line */}
                  <div className="absolute top-1/2 -translate-y-1/2 h-px pointer-events-none"
                    style={{
                      left: `${leftPct}%`,
                      width: `${widthPct}%`,
                      backgroundColor: msg.highlight ? "#10b981" : isReturn ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.20)",
                      borderTop: isReturn ? "1px dashed rgba(255,255,255,0.12)" : undefined,
                    }} />

                  {/* Arrowhead */}
                  <div className="absolute top-1/2 -translate-y-1/2 text-[10px] pointer-events-none"
                    style={{
                      left: goRight ? `calc(${leftPct + widthPct}% - 2px)` : `calc(${leftPct}% - 2px)`,
                      color: msg.highlight ? "#10b981" : isReturn ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.4)",
                    }}>
                    {goRight ? "▶" : "◀"}
                  </div>

                  {/* Label bubble */}
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none"
                    style={{ left: `calc(${leftPct + widthPct / 2}%)` }}>
                    <span className={`text-[9px] sm:text-[10px] font-mono px-2 py-0.5 rounded-full border whitespace-nowrap ${
                      msg.highlight
                        ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 font-semibold"
                        : isReturn
                          ? "bg-[#0A0F1C] border-white/[0.06] text-gray-500"
                          : "bg-[#0D1424] border-white/[0.10] text-gray-300"
                    }`}>
                      {msg.label}
                    </span>
                  </div>

                  {/* Expand icon */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isExpanded
                      ? <ChevronUp className="w-3 h-3 text-gray-500" />
                      : <ChevronDown className="w-3 h-3 text-gray-500" />
                    }
                  </div>
                </button>

                {/* Expanded detail */}
                <AnimatePresence>
                  {isExpanded && msg.detail && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mx-4 mb-3 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3">
                        <p className="text-xs text-gray-400 leading-relaxed">{msg.detail}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Footer hint */}
      <div className="px-5 py-3 border-t border-white/[0.06] flex items-center justify-between">
        <p className="text-[10px] text-gray-600">Click any message to see implementation details</p>
        <div className="flex items-center gap-4">
          {[
            { color: "bg-white/20", label: "API call" },
            { color: "bg-white/10 border border-dashed border-white/10", label: "Return" },
            { color: "bg-emerald-500/40", label: "Consumer result" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className={`w-6 h-px ${color}`} />
              <span className="text-[9px] text-gray-600">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}