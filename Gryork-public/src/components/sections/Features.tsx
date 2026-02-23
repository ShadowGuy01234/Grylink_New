"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Zap,
  BarChart3,
  Building2,
  Smartphone,
  Banknote,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import { FEATURES } from "@/lib/constants";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Shield,
  Zap,
  BarChart3,
  Building2,
  Smartphone,
  Banknote,
};

const iconColors = [
  { bg: "bg-green-50", icon: "text-green-600", border: "border-green-200", glow: "shadow-green-100" },
  { bg: "bg-blue-50", icon: "text-blue-600", border: "border-blue-200", glow: "shadow-blue-100" },
  { bg: "bg-purple-50", icon: "text-purple-600", border: "border-purple-200", glow: "shadow-purple-100" },
  { bg: "bg-amber-50", icon: "text-amber-600", border: "border-amber-200", glow: "shadow-amber-100" },
  { bg: "bg-primary-50", icon: "text-primary-600", border: "border-primary-200", glow: "shadow-primary-100" },
  { bg: "bg-cyan-50", icon: "text-cyan-600", border: "border-cyan-200", glow: "shadow-cyan-100" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

export default function Features() {
  const [expanded, setExpanded] = useState<number | null>(null);

  const toggle = (i: number) => setExpanded((prev) => (prev === i ? null : i));

  return (
    <section className="py-20 md:py-28 bg-white relative overflow-hidden">
      {/* Subtle BG */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-72 h-72 bg-primary-100/20 rounded-full blur-[80px]" />
        <div className="absolute bottom-0 right-1/3 w-72 h-72 bg-accent-100/20 rounded-full blur-[80px]" />
      </div>

      <div className="container-custom relative z-10">
        {/* Header */}
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-100 text-accent-700 text-xs font-semibold uppercase tracking-wider mb-4"
          >
            <Zap className="w-3.5 h-3.5" />
            Built for Sub-Contractors
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-900 mb-4"
          >
            Why Sub-Contractors{" "}
            <span className="text-accent-500">Choose Gryork</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="text-lg text-gray-500 max-w-2xl mx-auto"
          >
            Every feature is designed around one goal — getting working capital into
            your hands faster, cheaper, and with zero hassle.
          </motion.p>
        </div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {FEATURES.map((feature, index) => {
            const Icon = iconMap[feature.icon];
            const colors = iconColors[index % iconColors.length];
            const isOpen = expanded === index;
            return (
              <motion.div key={index} variants={itemVariants} className="group">
                <div
                  className={`relative h-full bg-white rounded-2xl border ${
                    colors.border
                  } transition-all duration-300 overflow-hidden ${
                    isOpen ? "shadow-xl shadow-gray-100" : "hover:shadow-lg hover:shadow-gray-100"
                  }`}
                >
                  {/* Hover / open glow */}
                  <div
                    className={`absolute inset-0 ${
                      colors.bg
                    } rounded-2xl transition-opacity duration-300 ${
                      isOpen ? "opacity-30" : "opacity-0 group-hover:opacity-30"
                    }`}
                  />

                  {/* Always-visible header row */}
                  <button
                    onClick={() => toggle(index)}
                    className="relative w-full flex items-center gap-4 p-6 text-left"
                  >
                    {/* Icon */}
                    <div
                      className={`w-11 h-11 flex-shrink-0 ${
                        colors.bg
                      } rounded-xl flex items-center justify-center border ${
                        colors.border
                      } transition-transform duration-300 ${
                        isOpen ? "scale-105" : "group-hover:scale-105"
                      }`}
                    >
                      {Icon && <Icon className={`w-5 h-5 ${colors.icon}`} />}
                    </div>

                    {/* Title */}
                    <h3 className="flex-1 text-base font-bold text-primary-900 leading-snug">
                      {feature.title}
                    </h3>

                    {/* Chevron */}
                    <ChevronDown
                      className={`w-4 h-4 flex-shrink-0 text-gray-400 transition-transform duration-300 ${
                        isOpen ? "rotate-180 text-primary-500" : ""
                      }`}
                    />
                  </button>

                  {/* Expandable description */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="body"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <p className="relative px-6 pb-6 text-sm text-gray-500 leading-relaxed">
                          {feature.description}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="flex justify-center mt-10"
        >
          <a
            href="/for-subcontractors"
            className="inline-flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700 transition-colors text-sm"
          >
            See everything built for sub-contractors
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
