import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Home, LayoutDashboard, Shield, Smartphone, Map } from "lucide-react";

const NAV_ITEMS = [
  { label: "Home",        href: "/Home",            icon: Home },
  { label: "Dashboard",  href: "/Dashboard",        icon: LayoutDashboard },
  { label: "Enforce",    href: "/Enforcement",      icon: Shield },
  { label: "Inspector",  href: "/InspectorPortal",  icon: Smartphone },
  { label: "Risk Map",   href: "/RiskDashboard",     icon: Map },
];

// Only show bottom nav on main app pages, not on touchpoint sub-pages
const HIDDEN_PATHS = ["/touchpoints/"];

export default function BottomNavigation() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  if (HIDDEN_PATHS.some((p) => pathname.startsWith(p))) return null;

  return (
    <nav
      aria-label="Main navigation"
      role="navigation"
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#060B18]/95 backdrop-blur-xl border-t border-white/[0.06]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-stretch justify-around max-w-lg mx-auto">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <button
              key={href}
              onClick={() => navigate(href, { replace: true })}
              aria-label={label}
              aria-current={isActive ? "page" : undefined}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2.5 transition-colors min-h-[56px] ${
                isActive ? "text-emerald-400" : "text-gray-600 hover:text-gray-400"
              }`}
            >
              <span className="relative flex items-center justify-center w-6 h-6">
                <Icon className="w-5 h-5" aria-hidden="true" />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-400" aria-hidden="true" />
                )}
              </span>
              <span className="text-[9px] font-medium tracking-wide" aria-hidden="true">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}