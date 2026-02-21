"use client";

import { motion } from "framer-motion";
import {
  Clock,
  Zap,
  X,
  TrendingUp,
  FolderX,
  Smartphone,
  EyeOff,
  BarChart3,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { PAIN_POINTS } from "@/lib/constants";

const beforeIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Clock,
  X,
  FileX: FolderX,
  EyeOff,
};

const afterIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Zap,
  TrendingUp,
  Smartphone,
  BarChart3,
};

export default function PainPoints() {
  return (
    <section className="py-16 md:py-24 bg-white overflow-hidden">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 text-red-600 text-xs font-semibold uppercase tracking-wider mb-4"
          >
            <Clock className="w-3.5 h-3.5" />
            The Problem We Solve
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-900 mb-4 leading-tight"
          >
            Sub-contractors deserve to get paid{" "}
            <span className="text-accent-500">on time</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="text-lg text-gray-500 max-w-xl mx-auto"
          >
            We built Gryork to fix the most painful problems in construction finance — one by one.
          </motion.p>
        </div>

        {/* Pain Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {PAIN_POINTS.map((point, i) => {
            const BeforeIcon = beforeIconMap[point.beforeIcon] ?? Clock;
            const AfterIcon = afterIconMap[point.afterIcon] ?? Zap;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="relative group"
              >
                <div className="flex items-stretch gap-0 rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                  {/* Before */}
                  <div className="flex-1 bg-red-50/60 px-5 py-5 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <BeforeIcon className="w-4 h-4 text-red-500" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-red-400 mb-1">
                        Before
                      </p>
                      <p className="text-sm font-medium text-gray-700 leading-snug">
                        {point.before}
                      </p>
                    </div>
                  </div>

                  {/* Arrow divider */}
                  <div className="flex items-center justify-center bg-white px-2 border-x border-gray-200 z-10">
                    <div className="w-7 h-7 rounded-full bg-accent-100 flex items-center justify-center">
                      <ArrowRight className="w-3.5 h-3.5 text-accent-600" />
                    </div>
                  </div>

                  {/* After */}
                  <div className="flex-1 bg-accent-50/60 px-5 py-5 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <AfterIcon className="w-4 h-4 text-accent-600" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-accent-500 mb-1">
                        With Gryork
                      </p>
                      <p className="text-sm font-semibold text-primary-800 leading-snug">
                        {point.after}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Eligibility pill row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.35 }}
          className="mt-12 bg-primary-50 rounded-2xl px-8 py-6 max-w-4xl mx-auto"
        >
          <p className="text-sm font-bold text-primary-700 uppercase tracking-wider mb-4 text-center">
            You are eligible if you have:
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {[
              "GST-registered business",
              "Active EPC work contract",
              "Valid RA Bill / Work Invoice",
              "PAN + Aadhaar + Bank account",
              "6+ months in business",
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-primary-200 text-sm text-primary-800 font-medium"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-accent-500 flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
