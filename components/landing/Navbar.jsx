import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { label: "Platform", href: "#platform" },
    { label: "Trust", href: "/Home#security-trust-heading" },
    { label: "Outcomes", href: "/Proof" },
    { label: "Solutions", href: "/Solutions" },
    { label: "Dashboard", href: "/Dashboard" },
    { label: "Enforcement", href: "/Enforcement" },
    { label: "Risk Map", href: "/RiskDashboard" },
    { label: "Incidents", href: "/IncidentManager" },
    { label: "Consumer Assist", href: "/ConsumerAssist" },
    { label: "Contact", href: "/Contact" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#060B18]/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
            <Shield className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-lg font-semibold text-white tracking-tight">
            Trace<span className="text-emerald-400">Guard</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            link.href.startsWith("#") ? (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                to={link.href}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            )
          ))}
          <Link to="/Contact">
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm h-9 px-5 rounded-full">
              Book a Demo
            </Button>
          </Link>
        </div>

        <button
          className="md:hidden text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-[#060B18]/95 backdrop-blur-xl border-t border-white/5 px-6 py-4 space-y-3">
          {links.map((link) => (
            link.href.startsWith("#") ? (
              <a
                key={link.label}
                href={link.href}
                className="block text-sm text-gray-400 hover:text-white py-2"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                to={link.href}
                className="block text-sm text-gray-400 hover:text-white py-2"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            )
          ))}
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