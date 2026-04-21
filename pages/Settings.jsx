import React, { useEffect, useState } from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import AccountDeletion from "@/components/AccountDeletion";
import { User, Bell, Lock } from "lucide-react";

const PLACEHOLDER_ROWS = [
  {
    icon: User,
    title: "Profile",
    subtitle: "Manage your name and contact details",
  },
  {
    icon: Bell,
    title: "Notifications",
    subtitle: "Configure alert and email preferences",
  },
  {
    icon: Lock,
    title: "Security",
    subtitle: "Password, 2FA, and session management",
  },
];

export default function Settings() {
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    document.title = "Settings | TraceGuard";
  }, []);

  return (
    <div className="min-h-screen bg-[#060B18]">
      <Navbar />
      <main id="main-content" tabIndex={-1} className="pt-28 pb-24 px-4 sm:px-6">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold text-white mb-2">Settings</h1>
          <p className="text-sm text-gray-500 mb-10">
            Manage your account and application preferences.
          </p>

          <div className="space-y-3 mb-10">
            {PLACEHOLDER_ROWS.map(({ icon: Icon, title, subtitle }) => (
              <button
                key={title}
                type="button"
                disabled
                className="w-full flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-4 text-left opacity-60 cursor-not-allowed"
              >
                <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
                </div>
              </button>
            ))}
          </div>

          <h2 className="text-sm font-semibold text-red-400/90 uppercase tracking-wider mb-4">
            Danger Zone
          </h2>
          {!showDelete ? (
            <button
              type="button"
              onClick={() => setShowDelete(true)}
              className="w-full rounded-2xl border border-red-500/30 bg-red-500/[0.06] px-4 py-3 text-sm font-medium text-red-300 hover:bg-red-500/10 transition-colors"
            >
              Request Account Deletion
            </button>
          ) : (
            <AccountDeletion />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
