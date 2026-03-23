import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Building2, Shield, ArrowRight, MessageCircle } from "lucide-react";

const DOORS = [
  {
    icon: User,
    audience: "Consumers",
    title: "Verify Your Product",
    desc: "Tap your product's NFC tag to instantly confirm authenticity, check batch provenance, and see if a safety notice or recall is active — in under 3 seconds.",
    cta: "Consumer Verify",
    href: "/touchpoints/end-user-verify",
    assistHref: "/ConsumerAssist",
    color: "text-teal-400",
    border: "border-teal-500/20",
    bg: "bg-teal-500/6",
    hoverBorder: "hover:border-teal-500/30",
    pill: "bg-teal-500/10 border-teal-500/20 text-teal-400",
  },
  {
    icon: Building2,
    audience: "Manufacturers & Distributors",
    title: "Enterprise Console",
    desc: "Serialise consumer goods, manage batch records, track aggregation across cases and pallets, and monitor custody transfers across your supply chain in real time.",
    cta: "Explore Platform",
    href: "/Solutions",
    color: "text-emerald-400",
    border: "border-emerald-500/20",
    bg: "bg-emerald-500/6",
    hoverBorder: "hover:border-emerald-500/30",
    pill: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    featured: true,
  },
  {
    icon: Shield,
    audience: "NAFDAC & Inspectors",
    title: "Regulator Workspace",
    desc: "Act on diversion alerts, manage batch holds and quarantine, conduct field inspections, and build evidence trails for any regulated product category.",
    cta: "Open Console",
    href: "/Enforcement",
    color: "text-red-400",
    border: "border-red-500/20",
    bg: "bg-red-500/6",
    hoverBorder: "hover:border-red-500/30",
    pill: "bg-red-500/10 border-red-500/20 text-red-400",
  },
];

export default function ThreeFrontDoors() {
  return (
    <section className="py-24 px-6 bg-[#060B18]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-xs font-medium text-emerald-400 tracking-widest uppercase">Three Separate Experiences</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3 mb-4">
            One Platform. Three Front Doors.
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Each actor in the supply chain sees only what they need — from the consumer verifying a single product to the regulator or inspector closing an enforcement case.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {DOORS.map((door, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className={`relative ${door.bg} border ${door.border} ${door.hoverBorder} rounded-3xl p-7 flex flex-col transition-all ${door.featured ? "ring-1 ring-emerald-500/15" : ""}`}
            >
              {door.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="text-[10px] font-bold bg-emerald-500 text-white px-3 py-1 rounded-full tracking-wide uppercase">
                    Core Platform
                  </span>
                </div>
              )}

              <div className={`inline-flex items-center gap-2 self-start text-[10px] font-semibold px-3 py-1 rounded-full border mb-5 ${door.pill}`}>
                <door.icon className="w-3 h-3" aria-hidden="true" />
                {door.audience}
              </div>

              <h3 className="text-xl font-bold text-white mb-3">{door.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed flex-1">{door.desc}</p>

              <Link
                to={door.href}
                className={`mt-6 inline-flex items-center gap-2 text-sm font-semibold ${door.color} hover:opacity-80 transition-opacity`}
              >
                {door.cta}
                <ArrowRight className="w-4 h-4" />
              </Link>
              {door.assistHref && (
                <Link
                  to={door.assistHref}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
                >
                  <MessageCircle className="w-3 h-3" />
                  No NFC? Use Consumer Assist
                </Link>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}