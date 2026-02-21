"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight,
  FileText,
  CheckCircle2,
  Landmark,
  Banknote,
  UserCheck,
  Clock,
} from "lucide-react";
import { HOW_IT_WORKS_STEPS } from "@/lib/constants";
import { useRef } from "react";

const stepIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  UserCheck,
  FileText,
  CheckCircle2,
  Landmark,
  Banknote,
};

const stepColors = [
  { bg: "from-blue-500 to-blue-700", ring: "border-blue-200", badge: "bg-blue-500" },
  { bg: "from-purple-500 to-purple-700", ring: "border-purple-200", badge: "bg-purple-500" },
  { bg: "from-primary-500 to-primary-700", ring: "border-primary-200", badge: "bg-primary-500" },
  { bg: "from-amber-500 to-amber-600", ring: "border-amber-200", badge: "bg-amber-500" },
  { bg: "from-accent-500 to-accent-700", ring: "border-accent-200", badge: "bg-accent-500" },
];

export default function HowItWorks() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-80px" });

  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-100 text-accent-700 text-xs font-semibold uppercase tracking-wider mb-4"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Simple 5-Step Process
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-900 mb-4"
          >
            From Bill to Bank —{" "}
            <span className="text-accent-500">in 5 Steps</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="text-lg text-gray-500 max-w-2xl mx-auto"
          >
            A transparent, fully digital journey from KYC to disbursement
          </motion.p>
        </div>

        {/* Steps */}
        <div ref={containerRef} className="relative">
          {/* Animated connector line — desktop */}
          <div className="hidden lg:block absolute top-16 left-[10%] right-[10%] h-0.5">
            <div className="h-full bg-gray-200 rounded-full" />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: isInView ? "100%" : 0 }}
              transition={{ duration: 1.8, delay: 0.4, ease: "easeOut" }}
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-accent-500 to-accent-600 rounded-full"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-4">
            {HOW_IT_WORKS_STEPS.map((step, index) => {
              const Icon = stepIconMap[step.icon] ?? FileText;
              const colors = stepColors[index];
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.12 }}
                  className="relative group"
                >
                  <div className="text-center px-2">
                    {/* Circle */}
                    <div className="relative z-10 mx-auto mb-6">
                      <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{
                          type: "spring",
                          stiffness: 200,
                          damping: 14,
                          delay: index * 0.12 + 0.2,
                        }}
                        className="relative"
                      >
                        <div
                          className={`w-24 h-24 mx-auto bg-white rounded-full shadow-md border-2 ${colors.ring} flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}
                        >
                          <div
                            className={`w-16 h-16 bg-gradient-to-br ${colors.bg} rounded-full flex items-center justify-center shadow-inner`}
                          >
                            <Icon className="w-7 h-7 text-white" />
                          </div>
                        </div>
                        {/* Step number badge */}
                        <motion.div
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.12 + 0.35 }}
                          className={`absolute -top-1 -right-1 w-7 h-7 ${colors.badge} rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md`}
                        >
                          {step.step}
                        </motion.div>
                      </motion.div>
                    </div>

                    {/* Mobile arrow */}
                    {index < HOW_IT_WORKS_STEPS.length - 1 && (
                      <div className="lg:hidden flex justify-center -mt-2 mb-4">
                        <ArrowRight className="w-5 h-5 text-gray-300 rotate-90" />
                      </div>
                    )}

                    {/* Time chip */}
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 rounded-full mb-3">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-[11px] font-semibold text-gray-500">
                        {step.time}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-primary-900 mb-2 group-hover:text-primary-700 transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Timeline bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-14 bg-primary-50 border border-primary-100 rounded-2xl p-6 md:p-8"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h4 className="text-xl font-bold text-primary-900 mb-1">
                Typical funding timeline
              </h4>
              <p className="text-gray-500 text-sm">
                From first bill submission to money in your account:{" "}
                <span className="font-bold text-accent-600">3–5 business days</span>
              </p>
            </div>
            <Link
              href={process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5173"}
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 whitespace-nowrap"
            >
              Register — It&apos;s Free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

