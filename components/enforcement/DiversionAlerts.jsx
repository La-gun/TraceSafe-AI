import React, { useState } from "react";
import { AlertTriangle, MapPin, Repeat, ArrowRightLeft, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const ALERTS = [
  {
    id: "ALT-001",
    type: "Geo Mismatch",
    icon: MapPin,
    severity: "high",
    product: "Amoxicillin 500mg",
    batch: "AMX-2026-0341",
    expected_zone: "Lagos",
    detected_zone: "Onitsha, Anambra",
    time: "18 Mar 2026, 09:14",
    details: "Product commissioned for Lagos distribution network detected 480km out of authorised zone. Possible diversion via Asaba corridor. 340 units affected.",
    coordinates: "6.1408° N, 6.7962° E",
  },
  {
    id: "ALT-002",
    type: "Repeat Scan",
    icon: Repeat,
    severity: "high",
    product: "Metformin 850mg",
    batch: "MET-2026-0112",
    expected_zone: "Kano",
    detected_zone: "Kano, Kano State",
    time: "18 Mar 2026, 07:55",
    details: "Same unit tag scanned 14 times in 6 hours across 3 different outlets. Anti-cloning flags raised. Possible counterfeit duplication of tag UID.",
    coordinates: "12.0022° N, 8.5920° E",
  },
  {
    id: "ALT-003",
    type: "Diversion Signal",
    icon: ArrowRightLeft,
    severity: "medium",
    product: "Ciprofloxacin 250mg",
    batch: "CIP-2026-0089",
    expected_zone: "Port Harcourt",
    detected_zone: "Aba, Abia State",
    time: "17 Mar 2026, 22:30",
    details: "Shipment destined for authorised wholesale partner in Rivers State appeared in retail scan in Aba — bypassing registered distributor. 120 units tracked.",
    coordinates: "5.1066° N, 7.3673° E",
  },
  {
    id: "ALT-004",
    type: "Unregistered Outlet",
    icon: AlertTriangle,
    severity: "medium",
    product: "Artemether/Lumefantrine",
    batch: "ART-2026-0023",
    expected_zone: "Abuja FCT",
    detected_zone: "Mararaba, Nassarawa",
    time: "17 Mar 2026, 16:10",
    details: "End-user verification scan logged from outlet with no registered partner record in master data. Location just outside FCT boundary near Keffi road.",
    coordinates: "8.9036° N, 7.1983° E",
  },
  {
    id: "ALT-005",
    type: "Geo Mismatch",
    icon: MapPin,
    severity: "low",
    product: "Paracetamol 500mg",
    batch: "PAR-2026-0567",
    expected_zone: "Ibadan",
    detected_zone: "Ikeja, Lagos",
    time: "17 Mar 2026, 11:45",
    details: "Minor zone deviation — product commissioned for Ibadan distribution detected in Lagos retail network. Within same macro-region; lower risk but warrants monitoring.",
    coordinates: "6.6018° N, 3.3515° E",
  },
];

const severityStyle = {
  high: { badge: "text-red-400 bg-red-500/10 border border-red-500/20", dot: "bg-red-400" },
  medium: { badge: "text-amber-400 bg-amber-500/10 border border-amber-500/20", dot: "bg-amber-400" },
  low: { badge: "text-yellow-400 bg-yellow-500/10 border border-yellow-500/20", dot: "bg-yellow-400" },
};

export default function DiversionAlerts({ onStartInspection }) {
  const [expanded, setExpanded] = useState(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-white">Active Diversion Alerts</h2>
          <p className="text-xs text-gray-500 mt-0.5">{ALERTS.length} unresolved alerts requiring inspector action</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
          <span className="text-xs text-red-400 font-medium">Live</span>
        </div>
      </div>

      <div className="space-y-3">
        {ALERTS.map((alert) => {
          const style = severityStyle[alert.severity];
          const isOpen = expanded === alert.id;
          return (
            <div key={alert.id} className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-white/[0.10] transition-all">
              <button
                className="w-full text-left p-4 flex items-start gap-3"
                onClick={() => setExpanded(isOpen ? null : alert.id)}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${style.badge}`}>
                  <alert.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-semibold text-white">{alert.type}</span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${style.badge}`}>{alert.severity}</span>
                    <span className="text-[10px] text-gray-600 font-mono">{alert.id}</span>
                  </div>
                  <p className="text-xs text-gray-300 font-medium truncate">{alert.product} — {alert.batch}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-gray-500 flex items-center gap-1"><MapPin className="w-2.5 h-2.5" />{alert.detected_zone}</span>
                    <span className="text-[10px] text-gray-600">•</span>
                    <span className="text-[10px] text-gray-500 flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{alert.time}</span>
                  </div>
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-gray-500 shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-gray-500 shrink-0 mt-1" />}
              </button>

              {isOpen && (
                <div className="px-4 pb-4 border-t border-white/[0.04] pt-3">
                  <p className="text-sm text-gray-400 leading-relaxed mb-3">{alert.details}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4 text-xs">
                    <div className="bg-white/[0.03] rounded-lg p-2.5">
                      <p className="text-gray-600 mb-0.5">Expected Zone</p>
                      <p className="text-white font-medium">{alert.expected_zone}</p>
                    </div>
                    <div className="bg-white/[0.03] rounded-lg p-2.5">
                      <p className="text-gray-600 mb-0.5">Detected Zone</p>
                      <p className="text-white font-medium">{alert.detected_zone}</p>
                    </div>
                    <div className="bg-white/[0.03] rounded-lg p-2.5">
                      <p className="text-gray-600 mb-0.5">Coordinates</p>
                      <p className="text-white font-medium font-mono text-[10px]">{alert.coordinates}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => onStartInspection(alert)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs h-8 px-4 rounded-full"
                  >
                    Start Inspection Report
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}