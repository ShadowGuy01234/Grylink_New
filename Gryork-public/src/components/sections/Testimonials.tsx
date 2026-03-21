"use client";

import { motion } from "framer-motion";
import { HardHat, Building2, Landmark, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

const earlyAccessCards = [
  {
    icon: HardHat,
    role: "Sub-Contractor",
    pitch: "Be among the first sub-contractors to get your bills discounted on Gryork. Fast KYC, multiple NBFC offers, and 48-hour target funding.",
    cta: "Register as Sub-Contractor",
    href: "/for-subcontractors",
    color: "bg-accent-50 border-accent-200",
    iconBg: "bg-accent-100",
    iconColor: "text-accent-700",
    ctaColor: "bg-accent-600 hover:bg-accent-700",
  },
  {
    icon: Building2,
    role: "EPC Company",
    pitch: "Support your vendor ecosystem with quick working capital access. Your payment cycle stays unchanged — only your vendor relationships improve.",
    cta: "Partner as EPC",
    href: "/for-epc",
    color: "bg-blue-50 border-blue-200",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-700",
    ctaColor: "bg-blue-600 hover:bg-blue-700",
  },
  {
    icon: Landmark,
    role: "NBFC Partner",
    pitch: "Access pre-verified infrastructure receivables with complete RMT risk assessments already done. Define your criteria and receive matched deals.",
    cta: "Apply for Partnership",
    href: "/for-nbfc",
    color: "bg-purple-50 border-purple-200",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-700",
    ctaColor: "bg-purple-600 hover:bg-purple-700",
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-100 text-primary-700 text-xs font-semibold uppercase tracking-wider mb-4"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Active Launch
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-900 mb-3"
          >
            Be part of the{" "}
            <span className="text-accent-500">first wave</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="text-gray-500 max-w-xl mx-auto text-base"
          >
            Gryork is actively onboarding its first partners. Early sub-contractors,
            EPCs, and NBFCs get dedicated onboarding support and priority access.
          </motion.p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {earlyAccessCards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-2xl border p-7 flex flex-col gap-5 ${card.color}`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.iconBg}`}>
                <card.icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>
              <div>
                <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${card.iconColor}`}>
                  {card.role}
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {card.pitch}
                </p>
              </div>
              <Link
                href={card.href}
                className={`mt-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors ${card.ctaColor}`}
              >
                {card.cta}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}


