import React from "react";
import { Shield } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-[#040811] border-t border-white/5 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-white tracking-tight">
              Trace<span className="text-emerald-400">Guard</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <Link to="/Trust" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
              Trust
            </Link>
            <Link to="/Enterprise" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
              Enterprise
            </Link>
            <Link to="/Sectors" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
              Sectors
            </Link>
            <Link to="/GettingStarted" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
              Getting started
            </Link>
            <Link to="/Proof" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
              Outcomes
            </Link>
            <Link to="/Solutions" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
              Solutions
            </Link>
            <Link to="/Dashboard" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
              Dashboard
            </Link>
            <Link to="/Contact" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
              Contact
            </Link>
          </div>

          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} TraceGuard. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}