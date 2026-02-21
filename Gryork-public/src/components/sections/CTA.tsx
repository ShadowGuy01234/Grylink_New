"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, HardHat, Building2, IndianRupee } from "lucide-react";

const SC_PORTAL_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5173";

export default function CTA() {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900" />

      {/* Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-24 -left-24 w-96 h-96 bg-accent-500/15 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ x: [0, -30, 0], y: [0, -50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary-400/15 rounded-full blur-[100px]"
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />
        {/* vertical lines */}
        <div className="absolute inset-0 mx-auto max-w-5xl hidden lg:block">
          <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
          <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
        </div>
      </div>

      <div className="container-custom relative z-10">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-accent-300 text-xs font-semibold uppercase tracking-wider mb-5"
          >
            <IndianRupee className="w-3.5 h-3.5" />
            Stop Waiting. Start Getting Paid.
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5 leading-tight"
          >
            Your completed work deserves
            <br />
            <span className="text-accent-300">immediate payment</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="text-blue-100 text-base mb-10 max-w-md mx-auto leading-relaxed"
          >
            Join hundreds of sub-contractors already using Gryork to discount their
            bills and keep their businesses moving.
          </motion.p>

          {/* Two-card CTA grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="grid sm:grid-cols-2 gap-5 max-w-2xl mx-auto"
          >
            {/* SC Card — Primary */}
            <div className="bg-white rounded-2xl p-6 text-left shadow-xl shadow-black/20">
              <div className="w-10 h-10 bg-accent-100 rounded-xl flex items-center justify-center mb-4">
                <HardHat className="w-5 h-5 text-accent-600" />
              </div>
              <h3 className="text-base font-bold text-primary-900 mb-1">
                I&apos;m a Sub-Contractor
              </h3>
              <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                I have completed work and a bill. I want to get funded faster.
              </p>
              <Link
                href={SC_PORTAL_URL}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-accent-500 text-white font-semibold rounded-xl hover:bg-accent-600 transition-all duration-200 hover:-translate-y-0.5 text-sm shadow-md shadow-accent-500/25"
              >
                Register Free &amp; Get Funded
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* EPC/NBFC Card — Secondary */}
            <div className="bg-white/10 border border-white/20 backdrop-blur-sm rounded-2xl p-6 text-left hover:bg-white/15 transition-all duration-200">
              <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center mb-4">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">
                I&apos;m an EPC or NBFC
              </h3>
              <p className="text-xs text-blue-200 mb-4 leading-relaxed">
                I want to support my vendors or expand my lending portfolio.
              </p>
              <Link
                href="/contact"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-white/10 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-200 text-sm"
              >
                Contact Our Team
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Trust footnote */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center text-xs text-white/30 mt-8"
        >
          No commitment required to register. KYC verification is free and one-time.
        </motion.p>
      </div>
    </section>
  );
}
