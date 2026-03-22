"use client";

import { Lock, ShieldCheck, Smartphone, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export default function ProblemSolutionBento() {
  return (
    <section className="py-20 bg-[var(--bg-base)]">
      <div className="container-custom">
        <h2 className="text-display text-3xl md:text-4xl text-white font-bold mb-8">
          From Delayed Payments to Structured Liquidity
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-fr">
          <motion.div className="md:col-span-2 glass-card p-6" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <p className="text-sm text-gray-400 mb-3">Timeline Shift</p>
            <p className="text-white text-xl font-semibold">Wait 60-90 Days vs. Funded in 48 Hours</p>
            <div className="mt-5 h-2 w-full rounded bg-white/10 overflow-hidden">
              <div className="h-full w-1/3 bg-emerald-500" />
            </div>
          </motion.div>

          <motion.div className="glass-card p-6" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <p className="text-sm text-gray-400 mb-3">Competitive Marketplace</p>
            <p className="text-white text-lg font-semibold">50+ NBFCs Competing</p>
            <TrendingUp className="w-6 h-6 text-cyan-300 mt-4" />
          </motion.div>

          <div className="glass-card p-5 flex items-center gap-3">
            <Smartphone className="w-5 h-5 text-emerald-300" />
            <span className="text-gray-200">100% Digital</span>
          </div>

          <div className="glass-card p-5 flex items-center gap-3">
            <Lock className="w-5 h-5 text-cobalt-300" />
            <span className="text-gray-200">End-to-End Encrypted</span>
          </div>

          <div className="glass-card p-5 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-300" />
            <span className="text-gray-200">RBI-Registered Only</span>
          </div>
        </div>
      </div>
    </section>
  );
}
