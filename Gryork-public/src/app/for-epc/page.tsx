"use client";

import { Header, Footer } from "@/components/layout";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Users,
  Clock,
  HeartHandshake,
  FileCheck,
  TrendingUp,
} from "lucide-react";
import EPCForm from "./EPCForm";

const benefits = [
  {
    icon: Users,
    title: "Stronger Vendor Relationships",
    description:
      "Help your sub-contractors access quick working capital, building loyalty and trust",
  },
  {
    icon: Clock,
    title: "Better Project Timelines",
    description:
      "When vendors have cash flow, they deliver on time. Reduce project delays.",
  },
  {
    icon: HeartHandshake,
    title: "No Financial Burden",
    description:
      "You don't fund the bills - NBFCs do. Your payment cycle remains unchanged.",
  },
  {
    icon: FileCheck,
    title: "Simple Validation Only",
    description:
      "Just validate the bills your sub-contractors submit. That's your only role.",
  },
  {
    icon: TrendingUp,
    title: "Attract Better Vendors",
    description:
      "Sub-contractors prefer working with EPCs that offer payment flexibility.",
  },
  {
    icon: CheckCircle,
    title: "One-Time Onboarding",
    description:
      "Quick digital onboarding with minimal documentation required.",
  },
];

const comparison = [
  {
    issue: "Sub-contractors wait 90-180 days for payment",
    solution: "Quick access to working capital within 48 hours",
  },
  {
    issue: "Delayed project execution due to vendor cash flow",
    solution: "On-time execution with funded vendors",
  },
  {
    issue: "Vendor dissatisfaction and attrition",
    solution: "Strong vendor relationships and loyalty",
  },
  {
    issue: "Quality issues from cash-strapped vendors",
    solution: "Quality work from financially stable vendors",
  },
];

const steps = [
  {
    step: 1,
    title: "Onboard to Gryork",
    description: "One-time registration with simple KYC and document submission",
  },
  {
    step: 2,
    title: "Add Sub-Contractors",
    description: "Invite your trusted sub-contractors to the platform",
  },
  {
    step: 3,
    title: "Validate Bills",
    description: "When sub-contractors submit bills, simply validate them",
  },
  {
    step: 4,
    title: "Continue Your Cycle",
    description: "Your payment timeline remains unchanged - pay as usual",
  },
];

export default function ForEPCPage() {
  return (
    <>
      <Header />
      <main className="pt-20 bg-[var(--bg-base)]">
        {/* Hero Section */}
        <section className="relative py-20 md:py-28 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.18),transparent_35%)]" />
          <div className="container-custom">
            <div className="max-w-3xl relative z-10">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-display text-4xl md:text-5xl font-bold text-white mb-6"
              >
                Strengthen Your Supply Chain
                <span className="block text-cyan-300">
                  Support Your Sub-Contractors
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-xl text-gray-300 mb-8"
              >
                Help your vendors access quick working capital while maintaining
                project timelines. No financial commitment required.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <a href="#contact" className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400">
                  Contact Sales
                </a>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-white/30 text-white hover:bg-white/10"
                >
                  See How It Works
                </a>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Problem vs Solution Section */}
        <section className="section">
          <div className="container-custom">
            <div className="text-center mb-12">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-display text-3xl md:text-4xl font-bold text-white mb-4"
              >
                The Problem We Solve
              </motion.h2>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="glass-card bg-red-500/10 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-red-300 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                       
                    </span>
                    Without Gryork
                  </h3>
                  <ul className="space-y-3">
                    {comparison.map((item, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="text-red-200"
                      >
                        {item.issue}
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <div className="glass-card bg-emerald-500/10 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-emerald-300 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
                       
                    </span>
                    With Gryork
                  </h3>
                  <ul className="space-y-3">
                    {comparison.map((item, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="text-emerald-200"
                      >
                        {item.solution}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>
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
                Benefits for EPCs
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-lg text-gray-300 max-w-2xl mx-auto"
              >
                Why leading EPCs partner with Gryork
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
        <section id="how-it-works" className="section">
          <div className="container-custom">
            <div className="text-center mb-12">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-display text-3xl md:text-4xl font-bold text-white mb-4"
              >
                Your Role is Simple
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-lg text-gray-300 max-w-2xl mx-auto"
              >
                No additional financial commitment - just validate bills
              </motion.p>
            </div>

            <div className="max-w-3xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8">
                {steps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex gap-4"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center text-slate-950 font-bold">
                        {step.step}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {step.title}
                      </h3>
                      <p className="text-gray-300 text-sm">{step.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-12 glass-card rounded-2xl p-8 max-w-3xl mx-auto text-center bg-emerald-500/10"
            >
              <p className="text-emerald-200 text-lg font-medium">
                That&apos;s it! No additional financial commitment. Your payment
                cycle to sub-contractors remains exactly the same.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section id="contact" className="section">
          <div className="container-custom">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-display text-3xl md:text-4xl font-bold text-white mb-4"
                >
                  Get in Touch
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="text-gray-300"
                >
                  Our team will reach out to schedule a demo
                </motion.p>
              </div>

              <EPCForm />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

