import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import MobileSelect from "@/components/ui/MobileSelect";
import { X, Loader2, ShieldX, AlertTriangle, Search, CheckCircle, Ban, Clock } from "lucide-react";
import { format } from "date-fns";

const INCIDENT_STATUS_OPTIONS = [
  { value: "pending_review",        label: "Pending Review" },
  { value: "under_investigation",   label: "Under Investigation" },
  { value: "quarantine",            label: "Quarantine" },
  { value: "verified_counterfeit",  label: "Verified Counterfeit" },
  { value: "cleared",               label: "Cleared" },
  { value: "false_positive",        label: "False Positive" },
];

const PRIORITY_OPTIONS = [
  { value: "low",      label: "Low" },
  { value: "medium",   label: "Medium" },
  { value: "high",     label: "High" },
  { value: "critical", label: "Critical" },
];

const PRIORITY_COLOR = {
  low:      "text-gray-400",
  medium:   "text-amber-400",
  high:     "text-orange-400",
  critical: "text-red-400",
};

const REPORTED_LABEL = {
  not_found:  "Not Found",
  suspicious: "Suspicious",
  hold:       "On Hold",
  recalled:   "Recalled",
  authentic:  "Authentic",
};

export default function IncidentDetailPanel({ report, onUpdate, onClose, isPending }) {
  const [incidentStatus, setIncidentStatus] = useState(report.incident_status || "pending_review");
  const [priority, setPriority] = useState(report.priority || "medium");
  const [assignedInspector, setAssignedInspector] = useState(report.assigned_inspector || "");
  const [notes, setNotes] = useState(report.inspector_notes || "");
  const [saved, setSaved] = useState(false);

  // Sync state when a different report is selected
  useEffect(() => {
    setIncidentStatus(report.incident_status || "pending_review");
    setPriority(report.priority || "medium");
    setAssignedInspector(report.assigned_inspector || "");
    setNotes(report.inspector_notes || "");
    setSaved(false);
  }, [report.id]);

  const handleSave = () => {
    const resolved = ["verified_counterfeit", "cleared", "false_positive"].includes(incidentStatus);
    onUpdate(report.id, {
      incident_status: incidentStatus,
      priority,
      assigned_inspector: assignedInspector,
      inspector_notes: notes,
      resolved_at: resolved ? new Date().toISOString() : undefined,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const priorityColor = PRIORITY_COLOR[priority] || "text-gray-400";

  return (
    <div className="bg-[#0A0F1C] border border-white/[0.08] rounded-3xl p-6 sticky top-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Incident Detail</p>
          <p className="text-sm font-bold text-white font-mono">{report.serial_number}</p>
        </div>
        <button onClick={onClose} aria-label="Close detail panel"
          className="text-gray-500 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Read-only info */}
      <div className="bg-white/[0.02] border border-white/[0.04] rounded-2xl p-4 space-y-2 mb-5">
        {[
          ["Product",       report.product_name || "Unknown"],
          ["Batch",         report.batch_number || "—"],
          ["Manufacturer",  report.manufacturer || "—"],
          ["Reported As",   REPORTED_LABEL[report.reported_status] || report.reported_status],
          ["Input Mode",    report.input_mode || "—"],
          ["Last Location", report.last_scan_location || "—"],
          ["Reported",      report.created_date ? format(new Date(report.created_date), "dd MMM yyyy HH:mm") : "—"],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3">
            <span className="text-[10px] text-gray-600 uppercase shrink-0">{k}</span>
            <span className="text-[11px] text-gray-300 text-right truncate">{v}</span>
          </div>
        ))}
      </div>

      {/* Editable fields */}
      <div className="space-y-4">
        <div>
          <label className="text-xs text-gray-400 mb-1.5 block">Incident Status</label>
          <MobileSelect
            value={incidentStatus}
            onValueChange={setIncidentStatus}
            options={INCIDENT_STATUS_OPTIONS}
            label="Set Incident Status"
          />
        </div>

        <div>
          <label className="text-xs text-gray-400 mb-1.5 block">
            Priority — <span className={`font-semibold ${priorityColor}`}>{priority}</span>
          </label>
          <MobileSelect
            value={priority}
            onValueChange={setPriority}
            options={PRIORITY_OPTIONS}
            label="Set Priority"
          />
        </div>

        <div>
          <label htmlFor="im-inspector" className="text-xs text-gray-400 mb-1.5 block">Assign Inspector</label>
          <Input
            id="im-inspector"
            value={assignedInspector}
            onChange={(e) => setAssignedInspector(e.target.value)}
            className="bg-white/[0.03] border-white/[0.08] text-white text-sm"
            placeholder="Inspector name / badge"
          />
        </div>

        <div>
          <label htmlFor="im-notes" className="text-xs text-gray-400 mb-1.5 block">Inspector Notes</label>
          <Textarea
            id="im-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="bg-white/[0.03] border-white/[0.08] text-white text-sm min-h-[80px]"
            placeholder="Findings, actions taken, next steps..."
          />
        </div>

        {/* Quick-action buttons */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { status: "verified_counterfeit", label: "Counterfeit", icon: ShieldX, cls: "border-red-500/30 text-red-400 hover:bg-red-500/10" },
            { status: "quarantine",           label: "Quarantine",  icon: AlertTriangle, cls: "border-orange-500/30 text-orange-400 hover:bg-orange-500/10" },
            { status: "under_investigation",  label: "Investigate", icon: Search, cls: "border-blue-500/30 text-blue-400 hover:bg-blue-500/10" },
            { status: "cleared",              label: "Clear",       icon: CheckCircle, cls: "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10" },
          ].map(({ status, label, icon: Icon, cls }) => (
            <button
              key={status}
              type="button"
              onClick={() => setIncidentStatus(status)}
              className={`flex items-center justify-center gap-1.5 border rounded-xl py-2 text-xs font-medium transition-colors ${
                incidentStatus === status ? cls.replace("hover:", "") : `border-white/[0.08] text-gray-500 hover:${cls.split(" ").pop()}`
              } ${cls}`}
            >
              <Icon className="w-3.5 h-3.5" aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>

        <Button
          onClick={handleSave}
          disabled={isPending}
          className={`w-full h-10 rounded-full font-medium text-sm gap-2 transition-colors ${
            saved ? "bg-emerald-600 text-white" : "bg-emerald-500 hover:bg-emerald-600 text-white"
          }`}
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? "✓ Saved" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}