import React from "react";
import { Link } from "react-router-dom";
import { Info } from "lucide-react";

export default function AiGovernanceStrip() {
  return (
    <div className="px-4 py-3 border-b border-violet-500/15 bg-violet-500/[0.06]">
      <div className="max-w-lg mx-auto flex gap-3">
        <Info className="w-4 h-4 text-violet-300/90 shrink-0 mt-0.5" aria-hidden />
        <p className="text-[11px] text-gray-400 leading-relaxed">
          <span className="text-violet-200/95 font-medium">AI assist — not enforcement.</span> Answers are
          grounded on retrieved records; holds and cases require human action.{" "}
          <Link
            to="/Trust"
            className="text-violet-300 hover:text-violet-200 underline underline-offset-2"
          >
            Trust center
          </Link>
        </p>
      </div>
    </div>
  );
}
