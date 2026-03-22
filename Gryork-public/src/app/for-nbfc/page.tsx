"use client";

import { Header, Footer } from "@/components/layout";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Shield,
  BarChart3,
  FileCheck,
  Clock,
  Building2,
} from "lucide-react";
import NBFCForm from "./NBFCForm";

const benefits = [
  {
    icon: FileCheck,
    title: "Pre-Verified Deals",
    description:
      "All deals come with complete KYC and document verification already done",
  },
  {
    icon: BarChart3,
    title: "Risk Assessment Reports",
    description:
      "Comprehensive RMT reports with risk scoring for informed decisions",
  },
  {
    icon: Building2,
    title: "Infrastructure Focus",
    description:
      "Specialized in construction and infrastructure sector receivables",
  },
  {
    icon: Shield,
    title: "Secure Platform",
    description:
      "Enterprise-grade security with complete audit trails",
  },
  {
    icon: Clock,
    title: "Quick Turnaround",
    description:
      "Streamlined process from deal submission to disbursement",
  },
  {
    icon: CheckCircle,
    title: "Strong Repayment Structure",
    description:
      "EPC-backed receivables with buyer confirmation at every step",
  },
];

const steps = [
  {
    step: 1,
    title: "Register & Onboard",
    description: "Complete simple KYC and integration with our platform",
  },
  {
    step: 2,
    title: "Set Your Criteria",
    description: "Define deal size, sectors, and risk appetite",
  },
  {
    step: 3,
    title: "Receive Deal Requests",
    description: "Get pre-verified CWC requests matching your criteria",
  },
  {
    step: 4,
    title: "Bid & Fund",
    description: "Competitive bidding with secure fund disbursement",
  },
  {
    step: 5,
    title: "Track & Manage",
    description: "Complete portfolio visibility with real-time updates",
  },
];

const stats = [
  { value: "Pre-Verified", label: "KYC & Docs Completed Before You See the Deal" },
  { value: "RMT Report", label: "Risk Assessment Included with Every Case" },
  { value: "EPC Backed", label: "Buyer Confirmation on Every Invoice" },
  { value: "Real-Time", label: "Track Status from Submission to Disbursement" },
];

export default function ForNBFCPage() {
  return (
    <>
      <Header />
      <main className="pt-20 bg-[var(--bg-base)]">
        {/* Hero Section */}
        <section className="relative py-20 md:py-28 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.22),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.14),transparent_40%)]" />
          <div className="container-custom">
            <div className="max-w-3xl relative z-10">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-display text-4xl md:text-5xl font-bold text-white mb-6"
              >
                Partner with Gryork
                <span className="block text-cyan-300">
                  Access Pre-Verified Bill Discounting Deals
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-xl text-gray-300 mb-8"
              >
                Expand your lending portfolio with verified infrastructure
                receivables. Complete risk assessment included with every deal.
              </motion.p>
              <motion.a
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                href="#apply"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400"
              >
                Apply for Partnership
              </motion.a>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 border-y border-white/10">
          <div className="container-custom">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center px-6 py-4 glass-card"
                >
                  <div className="text-xl md:text-2xl font-bold text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-gray-400 text-xs leading-snug max-w-[120px] mx-auto">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="section">
          <div className="container-custom">
            <div className="text-center mb-12">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-display text-3xl md:text-4xl font-bold text-white mb-4"
              >
                Why NBFCs Choose Gryork
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-lg text-gray-300 max-w-2xl mx-auto"
              >
                Everything you need to manage your infrastructure lending
                portfolio
              </motion.p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card p-6 bg-white/[0.03]"
                >
                  <div className="w-12 h-12 bg-cyan-500/15 rounded-lg flex items-center justify-center mb-4">
                    <benefit.icon className="w-6 h-6 text-cyan-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-300">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="section">
          <div className="container-custom">
            <div className="text-center mb-12">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-display text-3xl md:text-4xl font-bold text-white mb-4"
              >
                Your Journey with Gryork
              </motion.h2>
            </div>

            <div className="max-w-4xl mx-auto">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-6 mb-8 last:mb-0"
                >
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {step.step}
                    </div>
                    {index < steps.length - 1 && (
                      <div className="w-0.5 h-16 bg-white/20 mx-auto mt-2" />
                    )}
                  </div>
                  <div className="pt-2">
                    <h3 className="text-xl font-semibold text-white mb-1">
                      {step.title}
                    </h3>
                    <p className="text-gray-300">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Application Form Section */}
        <section id="apply" className="section">
          <div className="container-custom">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-display text-3xl md:text-4xl font-bold text-white mb-4"
                >
                  Apply for NBFC Partnership
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="text-gray-300"
                >
                  Fill out the form below and our team will get in touch within
                  24 hours
                </motion.p>
              </div>

              <NBFCForm />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

