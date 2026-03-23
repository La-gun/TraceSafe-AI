import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";
import { useTabHistory } from "@/lib/TabHistoryContext";

// Routes that are considered "root" and should NOT show the TopBar
const ROOT_ROUTES = ["/Home", "/Dashboard", "/Enforcement", "/InspectorPortal", "/Contact", "/Settings", "/Solutions", "/"];

export default function TopBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { stackDepth, tabRoot } = useTabHistory();

  // Hide on root routes
  const isRoot = ROOT_ROUTES.some((r) => pathname === r);
  if (isRoot) return null;

  const title = deriveTitleFromPath(pathname);

  // If we have real in-tab history, go back; otherwise replace to tab root.
  // Using `replace` at root keeps the browser history stack clean for TWA/Play.
  const handleBack = () => {
    if (stackDepth > 1) {
      navigate(-1);
    } else {
      navigate(tabRoot, { replace: true });
    }
  };

  return (
    <header
      className="sticky top-0 z-40 bg-[#060B18]/90 backdrop-blur-xl border-b border-white/[0.05]"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
      role="banner"
    >
      <div className="flex items-center gap-3 h-14 px-4 max-w-7xl mx-auto">
        <button
          onClick={handleBack}
          aria-label="Go back"
          className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <Shield className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
          <span className="text-sm font-semibold text-white truncate">{title}</span>
        </div>
      </div>
    </header>
  );
}

function deriveTitleFromPath(pathname) {
  const map = {
    "/touchpoints/manufacture":        "Manufacture",
    "/touchpoints/port-of-entry":      "Port of Entry",
    "/touchpoints/wholesale-transfer": "Wholesale Transfer",
    "/touchpoints/retail-receipt":     "Retail Receipt",
    "/touchpoints/end-user-verify":    "End-User Verify",
  };
  if (map[pathname]) return map[pathname];
  const seg = pathname.split("/").filter(Boolean).pop() || "";
  return seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}