"use client";

import { motion } from "framer-motion";
import {
  Shield,
  Zap,
  BarChart3,
  Building2,
  Smartphone,
  Users,
} from "lucide-react";
import { FEATURES } from "@/lib/constants";
import { Card } from "@/components/ui";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Shield,
  Zap,
  BarChart3,
  Building2,
  Smartphone,
  Users,
};

export default function Features() {
  return (
    <section className="section bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-primary-900 mb-4"
          >
            Why Choose Gryork?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            Built for the infrastructure sector with features that matter
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, index) => {
            const Icon = iconMap[feature.icon];
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center mb-4">
                    {Icon && <Icon className="w-6 h-6 text-primary-600" />}
                  </div>
                  <h3 className="text-xl font-semibold text-primary-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
