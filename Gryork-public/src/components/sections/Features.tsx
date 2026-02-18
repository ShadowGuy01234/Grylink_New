"use client";

import { motion } from "framer-motion";
import {
  Shield,
  Zap,
  BarChart3,
  Building2,
  Smartphone,
  Users,
  ArrowRight,
} from "lucide-react";
import { FEATURES } from "@/lib/constants";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Shield,
  Zap,
  BarChart3,
  Building2,
  Smartphone,
  Users,
};

const iconColors = [
  { bg: "bg-blue-50", icon: "text-blue-600", gradient: "from-blue-500 to-blue-600" },
  { bg: "bg-green-50", icon: "text-green-600", gradient: "from-green-500 to-green-600" },
  { bg: "bg-purple-50", icon: "text-purple-600", gradient: "from-purple-500 to-purple-600" },
  { bg: "bg-orange-50", icon: "text-orange-600", gradient: "from-orange-500 to-orange-600" },
  { bg: "bg-pink-50", icon: "text-pink-600", gradient: "from-pink-500 to-pink-600" },
  { bg: "bg-cyan-50", icon: "text-cyan-600", gradient: "from-cyan-500 to-cyan-600" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export default function Features() {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-100/30 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-100/30 rounded-full blur-[100px]" />
      </div>

      <div className="container-custom relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-4"
          >
            <Zap className="w-4 h-4" />
            Platform Features
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-900 mb-4"
          >
            Why Choose <span className="text-accent-500">Gryork</span>?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            Purpose-built for India&apos;s infrastructure sector with features 
            that accelerate growth and simplify operations
          </motion.p>
        </div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {FEATURES.map((feature, index) => {
            const Icon = iconMap[feature.icon];
            const colors = iconColors[index % iconColors.length];
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group"
              >
                <div className="relative h-full bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:border-gray-200 transition-all duration-300 hover:-translate-y-1">
                  {/* Hover gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-[0.03] rounded-2xl transition-opacity duration-300`} />
                  
                  {/* Icon */}
                  <div className="relative mb-6">
                    <div className={`w-14 h-14 ${colors.bg} rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
                      {Icon && <Icon className={`w-7 h-7 ${colors.icon}`} />}
                    </div>
                    {/* Decorative dot */}
                    <div className={`absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r ${colors.gradient} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-bold text-primary-900 mb-3 group-hover:text-primary-700 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    {feature.description}
                  </p>
                  
                  {/* Learn more link */}
                  <div className="flex items-center gap-2 text-sm font-medium text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span>Learn more</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex justify-center mt-12"
        >
          <a 
            href="/how-it-works"
            className="inline-flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700 transition-colors"
          >
            Explore all features
            <ArrowRight className="w-5 h-5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
