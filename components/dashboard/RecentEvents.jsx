import React from "react";
import { Factory, Ship, Warehouse, Store, User, ShieldCheck } from "lucide-react";

const eventTypeConfig = {
  commissioning: { icon: Factory, label: "Commissioned", color: "text-blue-400 bg-blue-500/10" },
  port_receipt: { icon: Ship, label: "Port Receipt", color: "text-purple-400 bg-purple-500/10" },
  wholesale_transfer: { icon: Warehouse, label: "Wholesale Transfer", color: "text-cyan-400 bg-cyan-500/10" },
  retail_receipt: { icon: Store, label: "Retail Receipt", color: "text-amber-400 bg-amber-500/10" },
  consumer_verification: { icon: User, label: "Consumer Verified", color: "text-emerald-400 bg-emerald-500/10" },
};

const events = [
  { type: "consumer_verification", product: "Amoxicillin 500mg", batch: "AMX-2026-0341", location: "Victoria Island, Lagos", time: "2 min ago" },
  { type: "retail_receipt", product: "Metformin 850mg", batch: "MET-2026-0112", location: "Pharmacy Plus, Abuja", time: "15 min ago" },
  { type: "wholesale_transfer", product: "Ciprofloxacin 250mg", batch: "CIP-2026-0089", location: "MedStock Distributors, Kano", time: "42 min ago" },
  { type: "port_receipt", product: "Artemether/Lumefantrine", batch: "ART-2026-0023", location: "Apapa Port, Lagos", time: "1 hr ago" },
  { type: "commissioning", product: "Paracetamol 500mg", batch: "PAR-2026-0567", location: "Swiss Pharma, Lagos", time: "2 hr ago" },
  { type: "consumer_verification", product: "Ibuprofen 400mg", batch: "IBU-2026-0190", location: "Garki, Abuja", time: "3 hr ago" },
];

export default function RecentEvents() {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-white">Recent Trace Events</h3>
          <p className="text-xs text-gray-500 mt-0.5">Supply chain touchpoints</p>
        </div>
      </div>
      <div className="space-y-2.5">
        {events.map((event, i) => {
          const config = eventTypeConfig[event.type];
          return (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.015] hover:bg-white/[0.03] transition-colors"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${config.color}`}>
                <config.icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-white">{event.product}</span>
                  <span className="text-[10px] text-gray-600">{event.batch}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[10px] font-medium ${config.color.split(" ")[0]}`}>
                    {config.label}
                  </span>
                  <span className="text-[10px] text-gray-600">•</span>
                  <span className="text-[10px] text-gray-600">{event.location}</span>
                </div>
              </div>
              <span className="text-[10px] text-gray-600 shrink-0">{event.time}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}