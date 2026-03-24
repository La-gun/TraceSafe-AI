import React, { useState } from "react";
import { backend } from "@/lib/backendClient";
import { invokeWithDemo } from "@/lib/demo/invokeWithDemo";
import { Trash2, AlertTriangle, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

export default function AccountDeletion() {
  const [step, setStep] = useState("idle"); // idle | confirm | deleting | done | error
  const [confirmText, setConfirmText] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleDelete = async () => {
    if (confirmText !== "DELETE") return;
    setStep("deleting");
    try {
      await invokeWithDemo("deleteAccount", {}, () => ({ ok: true, demo: true }));
      setStep("done");
      setTimeout(() => backend.auth.logout("/"), 2500);
    } catch (err) {
      setErrorMsg(err?.message || "Deletion failed. Please contact support.");
      setStep("error");
    }
  };

  return (
    <div className="bg-red-500/[0.04] border border-red-500/20 rounded-2xl p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0 mt-0.5">
          <Trash2 className="w-4 h-4 text-red-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-red-300">Delete Account</p>
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
            Permanently deletes your account and all associated data. This action cannot be undone.
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === "idle" && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Button
              onClick={() => setStep("confirm")}
              variant="outline"
              className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 text-xs h-9 rounded-full px-4"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Request Account Deletion
            </Button>
          </motion.div>
        )}

        {step === "confirm" && (
          <motion.div key="confirm" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-3">
            <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
              <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-300 leading-relaxed">
                All your data, inspection reports, and batch records will be permanently erased. Type <strong>DELETE</strong> to confirm.
              </p>
            </div>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
              placeholder="Type DELETE to confirm"
              className="bg-white/[0.03] border-red-500/20 text-white placeholder:text-gray-600 text-sm font-mono"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleDelete}
                disabled={confirmText !== "DELETE"}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-30 text-white text-xs h-9 rounded-full px-4"
              >
                Confirm Deletion
              </Button>
              <Button
                onClick={() => { setStep("idle"); setConfirmText(""); }}
                variant="outline"
                className="border-white/[0.08] text-gray-400 hover:text-white text-xs h-9 rounded-full px-4"
              >
                <X className="w-3.5 h-3.5 mr-1" />
                Cancel
              </Button>
            </div>
          </motion.div>
        )}

        {step === "deleting" && (
          <motion.div key="deleting" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-xs text-gray-400 py-2">
            <Loader2 className="w-4 h-4 animate-spin text-red-400" />
            Deleting your account…
          </motion.div>
        )}

        {step === "done" && (
          <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-xs text-emerald-400 py-2">
            Account deleted. Redirecting…
          </motion.div>
        )}

        {step === "error" && (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-xs text-red-400 py-2 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            {errorMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}