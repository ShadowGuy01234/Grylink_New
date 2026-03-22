"use client";

import { motion } from "framer-motion";
import { Star, Quote, TrendingUp, Users, ArrowUpRight } from "lucide-react";

// Type definition for testimonials
type TestimonialType = Array<{
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  metric: string;
}>;

const impacts = [
  {
    metric: "100% Digital",
    label: "Process",
    icon: TrendingUp,
    color: "from-green-400 to-emerald-600",
  },
  {
    metric: "RBI-Registered",
    label: "NBFCs",
    icon: Users,
    color: "from-blue-400 to-blue-600",
  },
  {
    metric: "48 hrs",
    label: "Avg Fund Time",
    icon: ArrowUpRight,
    color: "from-amber-400 to-orange-600",
  },
];

// Testimonials intentionally empty — no mock/fabricated reviews
export const testimonials: TestimonialType = [
  // To add real testimonials: Collect from actual customers, get permission, and add here
];

export default function RealImpact() {
  return (
    <section className="py-16 md:py-24 bg-white overflow-hidden">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-50 text-green-600 text-xs font-semibold uppercase tracking-wider mb-4"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Real Impact
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-900 mb-4 leading-tight"
          >
            Contractors are already{" "}
            <span className="text-accent-500">winning</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="text-lg text-gray-500 max-w-xl mx-auto"
          >
            See how Gryork is transforming construction finance, one contractor at a time.
          </motion.p>
        </div>

        {/* Impact Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-4 md:gap-6 mb-16 max-w-2xl mx-auto"
        >
          {impacts.map((impact, idx) => {
            const IconComponent = impact.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 text-center"
              >
                <div
                  className={`w-12 h-12 rounded-lg bg-gradient-to-br ${impact.color} flex items-center justify-center mx-auto mb-3`}
                >
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-primary-900 mb-1">
                  {impact.metric}
                </div>
                <div className="text-xs text-gray-600 font-medium">
                  {impact.label}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Testimonials Grid */}
        {testimonials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-6 relative"
              >
                {/* Quote Icon */}
                <Quote className="w-6 h-6 text-accent-300 opacity-40 absolute top-4 right-4" />

                {/* Rating */}
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-gray-700 mb-4 leading-relaxed italic">
                  "{testimonial.content}"
                </p>

                {/* Author Info */}
                <div className="flex items-start justify-between pt-4 border-t border-blue-200">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {testimonial.role}
                    </p>
                    <p className="text-xs text-accent-600 font-medium mt-1">
                      {testimonial.company}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-accent-600">
                      {testimonial.metric}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="max-w-2xl mx-auto text-center py-12"
          >
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-8">
              <p className="text-gray-600 mb-2">
                Real customer testimonials coming soon
              </p>
              <p className="text-sm text-gray-500">
                We're collecting verified reviews from our contractors and partners. Check back soon to see how Gryork is transforming construction finance.
              </p>
            </div>
          </motion.div>
        )}

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-14"
        >
          <p className="text-gray-600 mb-6">
            Get instant funding from multiple RBI-registered NBFCs competing for your invoice
          </p>
          <a
            href="/early-access"
            className="inline-flex items-center gap-2 px-8 py-4 bg-accent-500 text-white font-semibold rounded-xl hover:bg-accent-600 transition-all duration-300 shadow-lg shadow-accent-500/30 hover:shadow-accent-500/50 hover:-translate-y-1"
          >
            Get Early Access Now
            <ArrowUpRight className="w-5 h-5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
