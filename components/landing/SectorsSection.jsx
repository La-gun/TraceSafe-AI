import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Pill, Wine, Wheat, Cpu, Package } from "lucide-react";
import { SECTORS } from "@/data/sectors";

const ICON_MAP = { Pill, Wine, Wheat, Cpu, Package };

export default function SectorsSection() {
  return (
    <section className="bg-[#0A0F1C] py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-xs font-medium text-emerald-400 tracking-widest uppercase">
            Sectors · Global categories, local regulatory depth
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3 mb-4">
            Built for Regulated Supply Chains
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            These categories matter everywhere counterfeits and diversion hurt safety
            and margin. Nigeria and NAFDAC-aligned workflows are our{" "}
            <strong className="text-gray-400 font-semibold">reference depth</strong> — not a
            ceiling on where the same architecture can deploy.
          </p>
          <p className="mt-4">
            <Link
              to="/Sectors"
              className="text-sm text-emerald-400/90 hover:text-emerald-300 underline underline-offset-2"
            >
              Sector deep dive →
            </Link>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SECTORS.map((sector, i) => {
            const Icon = ICON_MAP[sector.icon] || Package;
            return (
              <motion.div
                key={sector.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className={`bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 hover:border-emerald-500/20 transition-all duration-300 ${
                  i === 0 ? "sm:col-span-2 lg:col-span-1" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <Icon className="w-5 h-5 text-emerald-400" />
                  <span className="text-[10px] font-medium text-emerald-400/60 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {sector.tag}
                  </span>
                </div>
                <h3 className="text-white font-semibold mb-2">{sector.name}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">{sector.desc}</p>
                <Link
                  to={`/Sectors#${sector.id}`}
                  className="text-xs font-medium text-emerald-400/80 hover:text-emerald-300"
                >
                  Read journey →
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
