import React from "react";
import { motion } from "framer-motion";
import {
  Fingerprint,
  Smartphone,
  ScanSearch,
  Database,
  Server,
  Lock,
} from "lucide-react";

const archLayers = [
  {
    icon: Fingerprint,
    title: "Tag & Identity Layer",
    items: [
      "NTAG 424 DNA at item level",
      "Optional logistics tags for case/pallet",
      "Digital twin registry",
      "Key versioning & rotation",
    ],
  },
  {
    icon: Smartphone,
    title: "Edge Channels",
    items: [
      "Operator mobile app",
      "Warehouse & retail portal",
      "Regulator dashboard",
      "Consumer verification page",
    ],
  },
  {
    icon: ScanSearch,
    title: "Verification Services",
    items: [
      "SDM validation service",
      "Anti-cloning checks",
      "Event capture API",
      "Anomaly scoring engine",
    ],
  },
  {
    icon: Database,
    title: "Traceability Core",
    items: [
      "EPCIS-style event ledger",
      "Aggregation / de-aggregation",
      "Ownership history",
      "Recall & quarantine states",
    ],
  },
  {
    icon: Server,
    title: "Master Data",
    items: [
      "Manufacturers & factories",
      "Products & batches",
      "Partners & locations",
      "Regulatory references",
    ],
  },
  {
    icon: Lock,
    title: "Security & Governance",
    items: [
      "KMS/HSM-backed keys",
      "RBAC & device trust",
      "Immutable audit logs",
      "Privacy & retention controls",
    ],
  },
];

export default function ArchitectureLayers() {
  return (
    <section className="bg-[#060B18] py-24 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-xs font-medium text-emerald-400 tracking-widest uppercase">
            Enterprise Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3 mb-4">
            Six-Layer Reference Stack
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            A production-grade architecture designed for regulated supply chains
            in Nigeria and beyond.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {archLayers.map((layer, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 hover:border-emerald-500/15 transition-all duration-300"
            >
              <layer.icon className="w-5 h-5 text-emerald-400 mb-4" />
              <h3 className="text-white font-semibold text-sm mb-3">{layer.title}</h3>
              <ul className="space-y-2">
                {layer.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-emerald-500/40 mt-1.5 shrink-0" />
                    <span className="text-xs text-gray-500">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}