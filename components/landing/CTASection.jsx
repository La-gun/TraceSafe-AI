import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function CTASection() {
  return (
    <section className="bg-[#060B18] py-24 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="bg-gradient-to-b from-emerald-500/[0.06] to-transparent border border-emerald-500/10 rounded-3xl p-12 sm:p-16 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-emerald-500/10 rounded-full blur-[80px]" />

          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Operationalise Traceability?
            </h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              We are not proposing stickers — we are proposing enforcement infrastructure.
              Start with a controlled pilot in one high-risk category.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/Contact">
                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white h-12 px-8 rounded-full text-base font-medium gap-2">
                  Book a Demo
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/Dashboard">
                <Button
                  variant="outline"
                  className="border-white/10 text-white hover:bg-white/5 h-12 px-8 rounded-full text-base font-medium"
                >
                  View Live Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}