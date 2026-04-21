import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, Menu, X, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { role } = useAuth();

  const navGroups = useMemo(
    () => {
      const base = [
        {
          label: "Overview",
          items: [
            { label: "Platform", href: "/Home#platform" },
            { label: "Solutions", href: "/Solutions" },
            { label: "Sectors", href: "/Sectors" },
            { label: "Outcomes", href: "/Proof" },
            { label: "Enterprise", href: "/Enterprise" },
            { label: "Trust Center", href: "/Trust" },
          ],
        },
      ];

      const roleGroups =
        role === "regulator"
          ? [
              {
                label: "Operations",
                items: [
                  { label: "Dashboard", href: "/Dashboard" },
                  { label: "Risk Map", href: "/RiskDashboard" },
                  { label: "Incidents", href: "/IncidentManager" },
                ],
              },
              {
                label: "Field Tools",
                items: [
                  { label: "Enforcement", href: "/Enforcement" },
                  { label: "Inspector Portal", href: "/InspectorPortal" },
                ],
              },
            ]
          : [
              {
                label: "Consumer",
                items: [
                  { label: "Verify Product", href: "/Verify" },
                  { label: "Consumer Assist", href: "/ConsumerAssist" },
                ],
              },
            ];

      return [
        ...base,
        ...roleGroups,
        {
          label: "Contact",
          items: [{ label: "Contact", href: "/Contact" }],
        },
      ];
    },
    [role],
  );

  const splitPathAndHash = (href) => {
    const [path, hash] = href.split("#");
    return { path: path || "", hash: hash ? `#${hash}` : "" };
  };

  const isActive = (href) => {
    const { path, hash } = splitPathAndHash(href);
    const pathMatches = location.pathname === path;
    if (!hash) return pathMatches;
    return pathMatches && location.hash === hash;
  };

  const groupIsActive = (group) => group.items.some((i) => isActive(i.href));

  const linkClassName = (active) =>
    [
      "text-sm transition-colors whitespace-nowrap",
      active ? "text-white" : "text-gray-400 hover:text-white",
    ].join(" ");

  const handleNavigate = (href) => {
    setMobileOpen(false);
    navigate(href);
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#060B18]/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" aria-hidden="true" />
          </div>
          <span className="text-lg font-semibold text-white tracking-tight">
            Trace<span className="text-emerald-400">Guard</span>
          </span>
        </Link>

        <div className="hidden xl:flex items-center gap-6">
          {navGroups.map((group) => (
            <DropdownMenu key={group.label}>
              <DropdownMenuTrigger
                className={[
                  "inline-flex items-center gap-1.5 rounded-md px-2 py-1",
                  "focus:outline-none focus:ring-2 focus:ring-emerald-500/50",
                  linkClassName(groupIsActive(group)),
                ].join(" ")}
              >
                {group.label}
                <ChevronDown className="w-4 h-4 opacity-70" aria-hidden="true" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="min-w-56 bg-[#0B1224] border-white/10 text-white"
              >
                {group.items.map((item) => (
                  <DropdownMenuItem
                    key={item.href}
                    onSelect={(e) => {
                      e.preventDefault();
                      handleNavigate(item.href);
                    }}
                    className={[
                      "cursor-pointer focus:bg-white/10 focus:text-white",
                      isActive(item.href) ? "bg-white/5" : "",
                    ].join(" ")}
                  >
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ))}
          <div className="flex items-center gap-2">
            <Link to={role === "regulator" ? "/login/regulator" : "/login/consumer"}>
              <Button
                variant="outline"
                className="border-white/10 text-white hover:bg-white/5 text-sm h-9 px-4 rounded-full"
              >
                Sign in
              </Button>
            </Link>
            <Link to="/Contact">
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm h-9 px-5 rounded-full">
                Book a Demo
              </Button>
            </Link>
          </div>
        </div>

        <button
          className="xl:hidden text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="xl:hidden bg-[#060B18]/95 backdrop-blur-xl border-t border-white/5 px-6 py-4 space-y-3">
          {navGroups.map((group) => (
            <div key={group.label} className="pt-2">
              <div className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
                {group.label}
              </div>
              <div className="mt-1 space-y-1">
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={["block py-2", linkClassName(isActive(item.href))].join(" ")}
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
          <Link to={role === "regulator" ? "/login/regulator" : "/login/consumer"} onClick={() => setMobileOpen(false)}>
            <Button
              variant="outline"
              className="w-full border-white/10 text-white hover:bg-white/5 text-sm h-9 rounded-full mt-2"
            >
              Sign in
            </Button>
          </Link>
          <Link to="/Contact" onClick={() => setMobileOpen(false)}>
            <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-sm h-9 rounded-full mt-2">
              Book a Demo
            </Button>
          </Link>
        </div>
      )}
    </nav>
  );
}