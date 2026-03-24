import React, { useState } from "react";
import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";
import { backend } from "@/lib/backendClient";
import { isPublicDemoMode } from "@/lib/demo/publicDemo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import MobileSelect from "@/components/ui/MobileSelect";
import { ArrowRight, CheckCircle, Mail, Phone, MapPin } from "lucide-react";
import { motion } from "framer-motion";

const ROLE_OPTIONS = [
  { value: "manufacturer", label: "Manufacturer" },
  { value: "importer",     label: "Importer" },
  { value: "distributor",  label: "Distributor" },
  { value: "retailer",     label: "Retailer" },
  { value: "regulator",    label: "Regulator" },
  { value: "other",        label: "Other" },
];

export default function Contact() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    organization: "",
    role: "",
    phone: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSubmitError(null);
    try {
      await backend.entities.ContactLead.create(form);
      setSubmitted(true);
    } catch (err) {
      if (isPublicDemoMode()) {
        setSubmitted(true);
      } else {
        setSubmitError(err?.message || "Could not send message. Check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060B18]">
      <Navbar />

      <section className="pt-32 pb-24 px-6 relative">
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px]" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <span className="text-xs font-medium text-emerald-400 tracking-widest uppercase">
              Get Started
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mt-3 mb-4">
              Book a Demo
            </h1>
            <p className="text-gray-400 max-w-xl mx-auto">
              Start with a supervised pilot in one high-risk category, with NAFDAC-defined
              success metrics and a limited ecosystem of participants.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Contact info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-5">
                <h3 className="text-sm font-semibold text-white">Contact Information</h3>
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-emerald-400 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="text-sm text-white">info@traceguard.ng</p>
                    <p className="text-xs text-gray-500">General inquiries</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-emerald-400 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="text-sm text-white">+234 (0) 812 345 6789</p>
                    <p className="text-xs text-gray-500">Mon-Fri, 9am-5pm WAT</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-emerald-400 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="text-sm text-white">Lagos, Nigeria</p>
                    <p className="text-xs text-gray-500">Victoria Island</p>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-500/[0.06] border border-emerald-500/10 rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-emerald-400 mb-2">Pilot Timeline</h3>
                <ul className="space-y-2">
                  {[
                    "Initial consultation & scope definition",
                    "Category & geography selection with NAFDAC",
                    "90-180 day controlled pilot deployment",
                    "12-18 month scale path to sector platform",
                  ].map((step, i) => (
                    <li key={i} className="text-xs text-gray-400 flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5">{String(i + 1).padStart(2, "0")}</span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-3">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white/[0.03] border border-emerald-500/20 rounded-2xl p-12 text-center"
                  role="status"
                  aria-live="polite"
                >
                  <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" aria-hidden="true" />
                  <h3 className="text-xl font-bold text-white mb-2">Request Received</h3>
                  <p className="text-gray-400 text-sm">
                    We'll be in touch within 24 hours to schedule your demo.
                  </p>
                </motion.div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8 space-y-5"
                  aria-label="Book a demo request form"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-full-name" className="text-xs text-gray-400 mb-1.5 block">Full Name *</label>
                      <Input
                        id="contact-full-name"
                        required
                        value={form.full_name}
                        onChange={set("full_name")}
                        className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-gray-600"
                        placeholder="Your name"
                        aria-required="true"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="text-xs text-gray-400 mb-1.5 block">Email *</label>
                      <Input
                        id="contact-email"
                        required
                        type="email"
                        value={form.email}
                        onChange={set("email")}
                        className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-gray-600"
                        placeholder="you@company.com"
                        aria-required="true"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-organization" className="text-xs text-gray-400 mb-1.5 block">Organization *</label>
                      <Input
                        id="contact-organization"
                        required
                        value={form.organization}
                        onChange={set("organization")}
                        className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-gray-600"
                        placeholder="Company name"
                        aria-required="true"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-phone" className="text-xs text-gray-400 mb-1.5 block">Phone</label>
                      <Input
                        id="contact-phone"
                        value={form.phone}
                        onChange={set("phone")}
                        className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-gray-600"
                        placeholder="+234 ..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 mb-1.5 block" id="contact-role-label">Your Role</label>
                    <MobileSelect
                      value={form.role}
                      onValueChange={(v) => setForm((f) => ({ ...f, role: v }))}
                      placeholder="Select your role"
                      options={ROLE_OPTIONS}
                      label="Select your role"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="text-xs text-gray-400 mb-1.5 block">Message</label>
                    <Textarea
                      id="contact-message"
                      value={form.message}
                      onChange={set("message")}
                      className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-gray-600 min-h-[100px]"
                      placeholder="Tell us about your traceability needs..."
                    />
                  </div>

                  {submitError ? (
                    <p className="text-sm text-red-400" role="alert">
                      {submitError}
                    </p>
                  ) : null}

                  <Button
                    type="submit"
                    disabled={loading}
                    aria-busy={loading}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-11 rounded-full font-medium gap-2"
                  >
                    {loading ? "Submitting..." : "Request Demo"}
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}