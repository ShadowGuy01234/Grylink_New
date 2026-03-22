"use client";

import { motion } from "framer-motion";
import { TrendingUp, Users, Zap, Percent } from "lucide-react";

const socialProofStats = [
  {
    value: "100% Digital",
    label: "End-to-End Process",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    value: "RBI-Registered",
    label: "NBFCs Only",
    icon: TrendingUp,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    value: "Zero",
    label: "Collateral Required",
    icon: Percent,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    value: "48 hrs",
    label: "Average Funding Time",
    icon: Zap,
    color: "text-accent-600",
    bgColor: "bg-accent-50",
  },
];

export default function SocialProof() {
  return (
    <section className="py-12 bg-white border-b border-gray-100">
      <div className="container-custom">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {socialProofStats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-all duration-300 ${stat.bgColor}`}
              >
                <div className={`${stat.color} mb-3`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xl md:text-2xl font-bold text-gray-900 tabular-nums mb-0.5">
                  {stat.value}
                </span>
                <span className="text-xs md:text-sm text-gray-600 font-medium text-center leading-tight">
                  {stat.label}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
