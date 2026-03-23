import React from "react";
import { Loader2, Inbox, AlertTriangle, ShieldX, Search, Clock, CheckCircle, Ban } from "lucide-react";
import { format } from "date-fns";

const STATUS_CFG = {
  pending_review:       { label: "Pending",          color: "text-amber-400 bg-amber-500/10 border-amber-500/20",     icon: Clock },
  under_investigation:  { label: "Investigating",    color: "text-blue-400 bg-blue-500/10 border-blue-500/20",        icon: Search },
  quarantine:           { label: "Quarantine",        color: "text-orange-400 bg-orange-500/10 border-orange-500/20", icon: AlertTriangle },
  verified_counterfeit: { label: "Counterfeit",       color: "text-red-400 bg-red-500/10 border-red-500/20",          icon: ShieldX },
  cleared:              { label: "Cleared",           color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle },
  false_positive:       { label: "False Positive",    color: "text-gray-400 bg-gray-500/10 border-gray-500/20",       icon: Ban },
};

const REPORTED_CFG = {
  not_found:  { label: "Not Found",   color: "text-red-400" },
  suspicious: { label: "Suspicious",  color: "text-orange-400" },
  hold:       { label: "Hold",        color: "text-amber-400" },
  recalled:   { label: "Recalled",    color: "text-red-400" },
  authentic:  { label: "Authentic",   color: "text-emerald-400" },
};

const FILTER_OPTIONS = [
  { value: "all",                label: "All" },
  { value: "pending_review",     label: "Pending" },
  { value: "under_investigation",label: "Investigating" },
  { value: "quarantine",         label: "Quarantine" },
  { value: "verified_counterfeit",label: "Counterfeit" },
  { value: "cleared",            label: "Cleared" },
];

export default function IncidentTable({ reports, isLoading, filterStatus, onFilterChange, selectedId, onSelect }) {
  return (
    <div className="bg-[#0A0F1C] border border-white/[0.08] rounded-3xl overflow-hidden">
      {/* Filter bar */}
      <div className="flex gap-2 flex-wrap px-5 py-4 border-b border-white/[0.06]">
        {FILTER_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onFilterChange(value)}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              filterStatus === value
                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                : "border-white/[0.08] text-gray-500 hover:text-gray-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
        </div>
      ) : reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-gray-500">
          <Inbox className="w-8 h-8 mb-3 opacity-30" />
          <p className="text-sm">No incidents found.</p>
          <p className="text-xs text-gray-600 mt-1">Consumer reports will appear here automatically.</p>
        </div>
      ) : (
        <div className="divide-y divide-white/[0.04]">
          {reports.map((report) => {
            const sc = STATUS_CFG[report.incident_status] || STATUS_CFG.pending_review;
            const rc = REPORTED_CFG[report.reported_status] || { label: report.reported_status, color: "text-gray-400" };
            const StatusIcon = sc.icon;
            const isSelected = selectedId === report.id;

            return (
              <button
                key={report.id}
                onClick={() => onSelect(isSelected ? null : report.id)}
                className={`w-full text-left px-5 py-4 transition-colors hover:bg-white/[0.03] ${isSelected ? "bg-white/[0.04] border-l-2 border-emerald-500" : ""}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-white font-semibold truncate">{report.serial_number}</span>
                      <span className={`text-[10px] font-medium shrink-0 ${rc.color}`}>{rc.label}</span>
                    </div>
                    <p className="text-xs text-gray-400 truncate">
                      {report.product_name || "Unknown product"}
                      {report.batch_number ? ` · ${report.batch_number}` : ""}
                    </p>
                    <p className="text-[10px] text-gray-600 mt-1">
                      {report.created_date ? format(new Date(report.created_date), "dd MMM yyyy, HH:mm") : ""}
                      {report.input_mode ? ` · via ${report.input_mode}` : ""}
                    </p>
                  </div>
                  <div className="shrink-0">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${sc.color}`}>
                      <StatusIcon className="w-2.5 h-2.5" aria-hidden="true" />
                      {sc.label}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}