"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  Landmark,
  HardHat,
  CheckCircle2,
  IndianRupee,
  Clock,
  FileCheck,
  Users,
  ChevronRight,
} from "lucide-react";

const SC_PORTAL_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5173";
const PARTNER_PORTAL_URL = process.env.NEXT_PUBLIC_PARTNER_URL || "http://localhost:5175";

export default function ForStakeholders() {
  return (
    <section className="py-20 md:py-28 bg-gradient-hero relative overflow-hidden">
      {/* BG decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent-500/15 rounded-full blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="container-custom relative z-10">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 border border-white/25 text-white text-xs font-semibold uppercase tracking-wider mb-4"
          >
            <Users className="w-3.5 h-3.5" />
            Who Gryork Is For
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold text-white mb-3"
          >
            Built for Everyone in the{" "}
            <span className="text-accent-300">Supply Chain</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="text-blue-100 max-w-xl mx-auto text-base"
          >
            Whether you perform the work, finance the project, or enable the vendor — Gryork has a role for you.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* For Sub-Contractors — FEATURED (largest, first) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="md:col-span-1 relative"
          >
            {/* "Most Popular" badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
              <div className="px-4 py-1.5 bg-accent-500 rounded-full text-xs font-bold text-white shadow-lg shadow-accent-500/30 whitespace-nowrap">
                🏆 Primary User
              </div>
            </div>
            <div className="relative h-full bg-white rounded-2xl p-7 border-2 border-accent-400 shadow-2xl shadow-accent-500/20 overflow-hidden">
              {/* Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent-50/50 to-white rounded-2xl" />

              <div className="relative">
                <div className="w-12 h-12 bg-accent-500 rounded-xl flex items-center justify-center mb-5 shadow-md shadow-accent-500/30">
                  <HardHat className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-primary-900 mb-2">
                  For Sub-Contractors
                </h3>
                <p className="text-gray-500 text-sm mb-5 leading-relaxed">
                  You complete the work. Get paid for it now — not after 90 days. Discount your invoices and keep your projects moving.
                </p>
                <ul className="space-y-2.5 mb-6">
                  {[
                    { icon: Clock, text: "Funded in 48 hours" },
                    { icon: IndianRupee, text: "50+ NBFCs competing for your bill" },
                    { icon: FileCheck, text: "One-time KYC, reuse forever" },
                    { icon: CheckCircle2, text: "₹1,000 flat platform fee only" },
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm text-gray-700">
                      <item.icon className="w-4 h-4 text-accent-500 flex-shrink-0" />
                      {item.text}
                    </li>
                  ))}
                </ul>
                <Link
                  href={SC_PORTAL_URL}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-accent-500 text-white font-semibold rounded-xl hover:bg-accent-600 transition-all duration-200 shadow-md shadow-accent-500/25 hover:-translate-y-0.5"
                >
                  Register Now — It&apos;s Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.div>

          {/* For EPCs */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="h-full bg-white/10 backdrop-blur-sm rounded-2xl p-7 border border-white/20 hover:border-white/35 hover:bg-white/15 transition-all duration-200">
              <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center mb-5">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">For EPCs</h3>
              <p className="text-blue-100 text-sm mb-5 leading-relaxed">
                Strengthen your supply chain by helping sub-contractors access quick working capital. Keep project timelines on track without financial burden on you.
              </p>
              <ul className="space-y-2 mb-6">
                {[
                  "Stronger vendor relationships",
                  "Zero financial commitment from EPC",
                  "Simple online bill validation",
                  "Re-KYC-free SC onboarding",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-blue-100 text-sm">
                    <span className="w-1.5 h-1.5 bg-primary-400 rounded-full flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/for-epc"
                className="inline-flex items-center gap-1.5 text-primary-200 font-semibold hover:text-white transition-colors text-sm"
              >
                Learn more for EPCs
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>

          {/* For NBFCs */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="h-full bg-white/10 backdrop-blur-sm rounded-2xl p-7 border border-white/20 hover:border-white/35 hover:bg-white/15 transition-all duration-200">
              <div className="w-12 h-12 bg-accent-500 rounded-xl flex items-center justify-center mb-5">
                <Landmark className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">For NBFCs</h3>
              <p className="text-blue-100 text-sm mb-5 leading-relaxed">
                Access pre-verified, Gryork-assessed bill discounting deals. Expand your infrastructure lending portfolio with full risk transparency.
              </p>
              <ul className="space-y-2 mb-6">
                {[
                  "Pre-KYC verified borrowers",
                  "Full RMT risk reports included",
                  "EPC-confirmed invoices only",
                  "Digital deal management",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-blue-100 text-sm">
                    <span className="w-1.5 h-1.5 bg-accent-400 rounded-full flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href={PARTNER_PORTAL_URL}
                className="inline-flex items-center gap-1.5 text-accent-300 font-semibold hover:text-white transition-colors text-sm"
              >
                Partner as NBFC
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
