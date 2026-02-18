"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ArrowRight, FileText, Search, CreditCard, CheckCircle2 } from "lucide-react";
import { HOW_IT_WORKS_STEPS } from "@/lib/constants";
import { useRef } from "react";

const stepIcons = [FileText, Search, CreditCard, CheckCircle2];

export default function HowItWorks() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-100 text-accent-700 text-sm font-medium mb-4"
          >
            <CheckCircle2 className="w-4 h-4" />
            Simple Process
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-900 mb-4"
          >
            How <span className="text-accent-500">Gryork</span> Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            A simple, transparent 4-step process to unlock your working capital in 48 hours
          </motion.p>
        </div>

        {/* Steps */}
        <div ref={containerRef} className="relative">
          {/* Connection Line (Desktop) - Animated */}
          <div className="hidden lg:block absolute top-20 left-[12.5%] right-[12.5%] h-1">
            <div className="h-full bg-gray-200 rounded-full" />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: isInView ? "100%" : 0 }}
              transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary-500 via-accent-500 to-primary-500 rounded-full"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
            {HOW_IT_WORKS_STEPS.map((step, index) => {
              const Icon = stepIcons[index];
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  className="relative group"
                >
                  {/* Step Card */}
                  <div className="text-center px-4">
                    {/* Step Circle with Icon */}
                    <div className="relative z-10 mx-auto mb-8">
                      <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ 
                          type: "spring", 
                          stiffness: 200, 
                          damping: 15,
                          delay: index * 0.15 + 0.2 
                        }}
                        className="relative"
                      >
                        {/* Outer ring */}
                        <div className="w-28 h-28 mx-auto bg-white rounded-full shadow-lg border-4 border-primary-100 flex items-center justify-center group-hover:border-primary-300 transition-all duration-300">
                          {/* Inner circle */}
                          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300">
                            <Icon className="w-8 h-8 text-white" />
                          </div>
                        </div>
                        
                        {/* Step number badge */}
                        <motion.div
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.15 + 0.4 }}
                          className="absolute -top-2 -right-2 w-10 h-10 bg-accent-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg"
                        >
                          {step.step}
                        </motion.div>
                      </motion.div>
                    </div>

                    {/* Arrow (Mobile/Tablet) */}
                    {index < HOW_IT_WORKS_STEPS.length - 1 && (
                      <div className="lg:hidden flex justify-center -mt-4 mb-4">
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.15 + 0.3 }}
                        >
                          <ArrowRight className="w-6 h-6 text-primary-400 rotate-90" />
                        </motion.div>
                      </div>
                    )}

                    {/* Content */}
                    <h3 className="text-xl font-bold text-primary-900 mb-3 group-hover:text-primary-700 transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">{step.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Timeline bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-16 bg-primary-50 rounded-2xl p-6 md:p-8"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h4 className="text-xl font-bold text-primary-900 mb-2">
                Ready to get started?
              </h4>
              <p className="text-gray-600">
                Average funding time: <span className="font-semibold text-accent-600">48 hours</span> from bill submission
              </p>
            </div>
            <Link 
              href="/how-it-works" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Learn More
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
