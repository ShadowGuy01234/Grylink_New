"use client";

import { motion } from "framer-motion";
import {
  Crown,
  Zap,
  Users,
  TrendingUp,
  Gift,
  ArrowRight,
  Check,
} from "lucide-react";
import Link from "next/link";
import { trackCTAClick } from "@/lib/analytics";

const benefits = [
  {
    icon: Zap,
    title: "Lifetime 0% Platform Fee",
    description: "Lock in zero transaction fees forever. Founding members enjoy permanent pricing advantages.",
  },
  {
    icon: TrendingUp,
    title: "Priority NBFC Access",
    description: "First access to new NBFCs joining the platform with competitive rates.",
  },
  {
    icon: Users,
    title: "Dedicated Support",
    description: "Priority customer success team. Direct access to our founding member hotline.",
  },
  {
    icon: Gift,
    title: "Exclusive Perks",
    description: "Early access to new features, special discounts, and referral bonuses.",
  },
];

export default function FoundingMemberOffer() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-accent-900 via-primary-900 to-accent-800 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-accent-500 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary-500 rounded-full blur-3xl" />
      </div>

      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 md:p-12 max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", delay: 0.2 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 mb-6 mx-auto"
            >
              <Crown className="w-8 h-8 text-white" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight"
            >
              Become a Founding Member
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="text-lg text-blue-100 max-w-2xl mx-auto"
            >
              Join the first 100 contractors to unlock exclusive lifetime benefits. Limited slots available.
            </motion.p>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {benefits.map((benefit, idx) => {
              const IconComponent = benefit.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08 }}
                  className="flex gap-4"
                >
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-accent-500/20 text-accent-300">
                      <IconComponent className="w-6 h-6" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {benefit.title}
                    </h3>
                    <p className="text-blue-100 text-sm">
                      {benefit.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Slot Counter & CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-between gap-6 mt-10 pt-10 border-t border-white/10"
          >
            <div>
              <p className="text-blue-100 text-sm mb-2">Only for the first 100 contractors</p>
              <div className="flex items-center gap-2">
                <div className="h-2 bg-white/20 rounded-full flex-1 w-32">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "75%" }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="h-full bg-gradient-to-r from-amber-300 to-accent-500 rounded-full"
                  />
                </div>
                <span className="text-white font-bold text-sm">75/100</span>
              </div>
            </div>

            <Link
              href="/early-access"
              onClick={() => trackCTAClick("founding-member-offer", "Claim Your Spot")}
              className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-accent-400 to-accent-500 text-white font-bold rounded-xl hover:from-accent-500 hover:to-accent-600 transition-all duration-300 shadow-lg shadow-accent-500/30 hover:shadow-accent-500/50 hover:-translate-y-1 whitespace-nowrap"
            >
              Claim Your Spot
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap justify-center gap-4 mt-10 pt-6 border-t border-white/10"
          >
            {[
              "No Long-Term Commitment",
              "Cancel Anytime",
              "100% Secure",
              "RBI-Compliant",
            ].map((badge, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-blue-100">
                <Check className="w-4 h-4 text-accent-300 flex-shrink-0" />
                {badge}
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* FAQ Snippet */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7 }}
          className="text-center mt-12"
        >
          <p className="text-blue-100 text-sm">
            Have questions? Email us at{" "}
            <a
              href="mailto:founding@gryork.com"
              className="underline text-white hover:text-accent-300 transition-colors"
            >
              founding@gryork.com
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
