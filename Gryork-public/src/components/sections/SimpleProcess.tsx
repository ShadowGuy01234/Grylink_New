"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  CheckCircle2,
  Clock,
  FileText,
  User,
  Zap,
} from "lucide-react";

export default function SimpleProcess() {
  const [expandedStep, setExpandedStep] = useState<number | null>(0);

  const steps = [
    {
      num: 1,
      title: "Sign Up & KYC",
      time: "30 mins",
      icon: User,
      expanded: "Complete your profile in one go. Provide PAN, GST, Aadhaar, and your bank details. This one-time submission unlocks funding for all future bills.",
      points: [
        "Digital PAN/Aadhaar verification",
        "Instant GST validation",
        "Zero repeated paperwork",
      ],
    },
    {
      num: 2,
      title: "Submit & Verify",
      time: "24-48 hrs",
      icon: FileText,
      expanded: "Upload your RA Bill, Work Completion Certificate, and Measurement Sheet. Your registered EPC partner confirms work completion instantly.",
      points: [
        "Upload bills from anywhere",
        "EPC verifies in real-time",
        "Instant compliance checks",
      ],
    },
    {
      num: 3,
      title: "Get Funded",
      time: "48 hrs",
      icon: Zap,
      expanded: "Multiple RBI-registered NBFCs review your verified bill and compete for your business. Choose the best rate and get funds transferred directly to your account.",
      points: [
        "50+ NBFCs bidding automatically",
        "Direct bank transfer",
        "No hidden charges or delays",
      ],
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-white overflow-hidden">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold uppercase tracking-wider mb-4"
          >
            <Clock className="w-3.5 h-3.5" />
            In 3 Simple Steps
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-900 mb-4 leading-tight"
          >
            From KYC to Funded,{" "}
            <span className="text-accent-500">100% Digital</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="text-lg text-gray-500 max-w-xl mx-auto"
          >
            No branches. No couriers. No 90-day waits. Just you, your bills, and instant capital.
          </motion.p>
        </div>

        {/* Steps Container */}
        <div className="max-w-2xl mx-auto space-y-4">
          {steps.map((step, idx) => {
            const StepIcon = step.icon;
            const isExpanded = expandedStep === idx;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <button
                  onClick={() =>
                    setExpandedStep(isExpanded ? null : idx)
                  }
                  aria-expanded={isExpanded}
                  aria-label={`${step.title} - ${step.time} - Click to view details`}
                  className="w-full bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6 text-left hover:border-accent-300 hover:from-gray-100 hover:to-gray-150 transition-all duration-300 relative group"
                >
                  {/* Top bar */}
                  <div className="flex items-center justify-between gap-4">
                    {/* Step number & icon */}
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent-500 text-white flex items-center justify-center font-bold text-lg" aria-hidden="true">
                        {step.num}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg md:text-xl font-bold text-primary-900">
                          {step.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-2" aria-hidden="true">
                          <Clock className="w-4 h-4" />
                          {step.time}
                        </p>
                      </div>
                    </div>

                    {/* Chevron */}
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex-shrink-0"
                      aria-hidden="true"
                    >
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    </motion.div>
                  </div>

                  {/* Expanded content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
                          <p className="text-gray-700 leading-relaxed">
                            {step.expanded}
                          </p>
                          <ul className="space-y-2">
                            {step.points.map((point, pidx) => (
                              <motion.li
                                key={pidx}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: pidx * 0.05 }}
                                className="flex items-start gap-3 text-sm text-gray-600"
                              >
                                <CheckCircle2 className="w-4 h-4 text-accent-500 flex-shrink-0 mt-0.5" />
                                <span>{point}</span>
                              </motion.li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-gray-600 mb-4">
            Ready to skip the waiting? Get started in under 5 minutes.
          </p>
          <a
            href="/early-access"
            aria-label="Get Early Access to Gryork funding platform"
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent-500 text-white font-semibold rounded-lg hover:bg-accent-600 transition-all duration-300"
          >
            Get Early Access
          </a>
        </motion.div>
      </div>
    </section>
  );
}
