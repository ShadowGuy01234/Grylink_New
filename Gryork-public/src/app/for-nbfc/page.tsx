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
    title: "High Repayment Rate",
    description:
      "99% repayment rate with EPC-backed receivables",
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
  { value: "₹500+ Cr", label: "Monthly Deal Volume" },
  { value: "200+", label: "Active Deals/Month" },
  { value: "99%", label: "Repayment Rate" },
  { value: "48h", label: "Average Cycle Time" },
];

export default function ForNBFCPage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-hero py-20 md:py-28">
          <div className="container-custom">
            <div className="max-w-3xl">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl md:text-5xl font-bold text-white mb-6"
              >
                Partner with Gryork
                <span className="block text-accent-300">
                  Access Pre-Verified Bill Discounting Deals
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-xl text-blue-100 mb-8"
              >
                Expand your lending portfolio with verified infrastructure
                receivables. Complete risk assessment included with every deal.
              </motion.p>
              <motion.a
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                href="#apply"
                className="btn-secondary inline-flex"
              >
                Apply for Partnership
              </motion.a>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-primary-900">
          <div className="container-custom">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-blue-200 text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="section bg-white">
          <div className="container-custom">
            <div className="text-center mb-12">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold text-primary-900 mb-4"
              >
                Why NBFCs Choose Gryork
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-lg text-gray-600 max-w-2xl mx-auto"
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
                  className="card"
                >
                  <div className="w-12 h-12 bg-accent-50 rounded-lg flex items-center justify-center mb-4">
                    <benefit.icon className="w-6 h-6 text-accent-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-primary-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="section bg-gray-50">
          <div className="container-custom">
            <div className="text-center mb-12">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold text-primary-900 mb-4"
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
                      <div className="w-0.5 h-16 bg-primary-200 mx-auto mt-2" />
                    )}
                  </div>
                  <div className="pt-2">
                    <h3 className="text-xl font-semibold text-primary-900 mb-1">
                      {step.title}
                    </h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Application Form Section */}
        <section id="apply" className="section bg-white">
          <div className="container-custom">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-3xl md:text-4xl font-bold text-primary-900 mb-4"
                >
                  Apply for NBFC Partnership
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="text-gray-600"
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
