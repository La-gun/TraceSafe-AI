import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Factory, Ship, Warehouse, Store, User, ArrowRight } from "lucide-react";
import SequenceDiagram from "./SequenceDiagram";

const steps = [
  {
    icon: Factory,
    stage: "01",
    title: "Manufacture",
    desc: "Commission NTAG 424 DNA tags with unique item identities. Create batch, serial, and production records.",
    href: "/touchpoints/manufacture",
  },
  {
    icon: Ship,
    stage: "02",
    title: "Port of Entry",
    desc: "Operator taps parent logistics tag. Backend verifies and records port receipt, customs status for all linked items.",
    href: "/touchpoints/port-of-entry",
  },
  {
    icon: Warehouse,
    stage: "03",
    title: "Wholesale Transfer",
    desc: "De-aggregate and re-aggregate inventory. Track custody changes across distributors with full audit trail.",
    href: "/touchpoints/wholesale-transfer",
  },
  {
    icon: Store,
    stage: "04",
    title: "Retail Receipt",
    desc: "Point-of-sale events complete the authorised chain. Retail operators confirm receipt and shelving.",
    href: "/touchpoints/retail-receipt",
  },
  {
    icon: User,
    stage: "05",
    title: "End-User Verify",
    desc: "Final end user taps product to see a redacted audit trail confirming authenticity and authorised route.",
    href: "/touchpoints/end-user-verify",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-[#060B18] py-24 relative overflow-hidden" id="platform">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-xs font-medium text-emerald-400 tracking-widest uppercase">
            Operational Flow
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3 mb-4">
            From Production to End User
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Every touchpoint writes an immutable traceability event — from factory
            commissioning to end-user verification, across any regulated consumer goods category.
          </p>
        </div>

        <div className="relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-16 left-[10%] right-[10%] h-px bg-gradient-to-r from-emerald-500/30 via-emerald-500/10 to-emerald-500/30" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative group"
              >
                <Link to={step.href} className="block h-full">
                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 h-full hover:border-emerald-500/30 hover:bg-white/[0.04] transition-all duration-300 cursor-pointer">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                        <step.icon className="w-5 h-5 text-emerald-400" />
                      </div>
                      <span className="text-xs font-mono text-emerald-500/50">{step.stage}</span>
                    </div>
                    <h3 className="text-white font-semibold text-sm mb-2">{step.title}</h3>
                    <p className="text-gray-500 text-xs leading-relaxed mb-3">{step.desc}</p>
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-400/60 group-hover:text-emerald-400 transition-colors">
                      Explore <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Sequence diagram */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-16"
        >
          <div className="text-center mb-8">
            <span className="text-xs font-medium text-violet-400 tracking-widest uppercase">
              Message Flow
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mt-2 mb-3">
              System Sequence Diagram
            </h3>
            <p className="text-gray-500 max-w-2xl mx-auto text-sm">
              Every interaction between field actors, the TraceGuard backend, and the AI verification agent — from factory commissioning to consumer authentication.
            </p>
          </div>
          <SequenceDiagram />
        </motion.div>
      </div>
    </section>
  );
}