"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Building2, Landmark } from "lucide-react";

export default function ForStakeholders() {
  return (
    <section className="section bg-gradient-hero">
      <div className="container-custom">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-white mb-4"
          >
            Partner with Gryork
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-blue-100 max-w-2xl mx-auto"
          >
            Whether you&apos;re an NBFC looking to expand your portfolio or an
            EPC wanting to support your vendors
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* For NBFCs */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
          >
            <div className="w-14 h-14 bg-accent-500 rounded-xl flex items-center justify-center mb-6">
              <Landmark className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">For NBFCs</h3>
            <p className="text-blue-100 mb-6">
              Access pre-verified bill discounting deals with comprehensive risk
              assessment. Expand your infrastructure lending portfolio with
              confidence.
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2 text-blue-100">
                <span className="w-1.5 h-1.5 bg-accent-400 rounded-full" />
                Pre-verified deals with KYC
              </li>
              <li className="flex items-center gap-2 text-blue-100">
                <span className="w-1.5 h-1.5 bg-accent-400 rounded-full" />
                Comprehensive risk reports
              </li>
              <li className="flex items-center gap-2 text-blue-100">
                <span className="w-1.5 h-1.5 bg-accent-400 rounded-full" />
                Digital deal management
              </li>
            </ul>
            <Link
              href="/for-nbfc"
              className="inline-flex items-center gap-2 text-accent-300 font-semibold hover:text-accent-200 transition-colors"
            >
              Partner Now
              <ArrowRight size={20} />
            </Link>
          </motion.div>

          {/* For EPCs */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
          >
            <div className="w-14 h-14 bg-primary-500 rounded-xl flex items-center justify-center mb-6">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">For EPCs</h3>
            <p className="text-blue-100 mb-6">
              Strengthen your supply chain by helping sub-contractors access
              quick working capital. Maintain project timelines without
              financial burden.
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2 text-blue-100">
                <span className="w-1.5 h-1.5 bg-primary-400 rounded-full" />
                Stronger vendor relationships
              </li>
              <li className="flex items-center gap-2 text-blue-100">
                <span className="w-1.5 h-1.5 bg-primary-400 rounded-full" />
                No financial commitment
              </li>
              <li className="flex items-center gap-2 text-blue-100">
                <span className="w-1.5 h-1.5 bg-primary-400 rounded-full" />
                Simple bill validation
              </li>
            </ul>
            <Link
              href="/for-epc"
              className="inline-flex items-center gap-2 text-primary-300 font-semibold hover:text-primary-200 transition-colors"
            >
              Contact Us
              <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
