"use client";

import { motion } from "framer-motion";
import {
  Banknote,
  TrendingUp,
  BarChart3,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { QUICK_WINS } from "@/lib/constants";
import { trackCTAClick } from "@/lib/analytics";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Banknote,
  TrendingUp,
  BarChart3,
};

export default function QuickWins() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-50 text-accent-600 text-xs font-semibold uppercase tracking-wider mb-4"
          >
            <Zap className="w-3.5 h-3.5" />
            Quick Wins for Every Role
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-900 mb-4 leading-tight"
          >
            Built for sub-contractors,{" "}
            <span className="text-accent-500">NBFCs & EPCs</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="text-lg text-gray-500 max-w-xl mx-auto"
          >
            Whether you're seeking working capital, high-quality assets, or operational efficiency, Gryork delivers measurable value.
          </motion.p>
        </div>

        {/* Role Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {QUICK_WINS.map((roleWins, roleIdx) => {
            const IconComponent = iconMap[roleWins.icon] || Banknote;
            return (
              <motion.div
                key={roleIdx}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: roleIdx * 0.1 }}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                {/* Role Header */}
                <div className="bg-gradient-to-r from-primary-900 to-primary-800 px-6 py-5 flex items-center gap-3">
                  <div className="p-2.5 bg-white/15 rounded-lg">
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white">{roleWins.role}</h3>
                </div>

                {/* Wins List */}
                <div className="p-6 space-y-4">
                  {roleWins.wins.map((win, winIdx) => (
                    <motion.div
                      key={winIdx}
                      initial={{ opacity: 0, x: -12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: roleIdx * 0.1 + winIdx * 0.05 }}
                      className="flex gap-3"
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="w-5 h-5 text-accent-500 flex-shrink-0" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {win.title}
                        </h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {win.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* CTA Button */}
                <div className="px-6 pb-6">
                  <button
                    onClick={() => trackCTAClick("quick-wins", `Get Started - ${roleWins.role}`)}
                    className="w-full px-4 py-2.5 bg-gray-100 hover:bg-accent-500 hover:text-white text-gray-900 font-semibold rounded-lg transition-all duration-300"
                  >
                    Learn More
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
