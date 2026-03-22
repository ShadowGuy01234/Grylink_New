"use client";

import { Header, Footer } from "@/components/layout";
import { motion } from "framer-motion";
import { InfiniteSlider } from "@/components/ui/infinite-slider";
import {
  Clock,
  Shield,
  Banknote,
  FileText,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  Smartphone,
} from "lucide-react";

const benefits = [
  {
    icon: Clock,
    title: "Quick Funding",
    description:
      "Get working capital within 48 hours of bill validation. No more waiting 90-180 days.",
  },
  {
    icon: Shield,
    title: "Secure Process",
    description:
      "End-to-end encrypted platform with complete data security and compliance.",
  },
  {
    icon: Banknote,
    title: "Competitive Rates",
    description:
      "Access multiple NBFCs competing for your bills, ensuring best discount rates.",
  },
  {
    icon: FileText,
    title: "Minimal Documentation",
    description:
      "Simple KYC and one-time onboarding. Upload bills digitally without paperwork.",
  },
  {
    icon: Smartphone,
    title: "Digital Platform",
    description:
      "Track all your bills, offers, and payments from a single dashboard.",
  },
  {
    icon: TrendingUp,
    title: "Build Credit History",
    description:
      "Regular repayments help build your credit profile for better future rates.",
  },
];

const steps = [
  {
    step: 1,
    title: "Register on Gryork",
    description:
      "Complete simple KYC with GST, PAN, and bank details. One-time verification.",
  },
  {
    step: 2,
    title: "Submit Your Bills",
    description:
      "Upload work completion bills against your EPC with supporting documents.",
  },
  {
    step: 3,
    title: "EPC Validates",
    description:
      "Your EPC partner confirms work completion and bill authenticity.",
  },
  {
    step: 4,
    title: "Receive Offers",
    description:
      "Multiple NBFCs review and submit competitive discount offers.",
  },
  {
    step: 5,
    title: "Accept & Get Funded",
    description:
      "Choose the best offer and receive funds in your bank within 48 hours.",
  },
];

const eligibility = [
  "Registered business (GST registered preferred)",
  "Active work contract with a registered EPC",
  "Valid work completion bills/invoices",
  "KYC documents (PAN, Aadhaar, Bank account)",
  "Minimum 6 months of business operation",
];

const faqs = [
  {
    question: "What is the minimum bill amount?",
    answer:
      "The minimum bill amount for discounting is ₹5 lakhs. There's no maximum limit as long as the EPC validates the bill.",
  },
  {
    question: "What are the typical discount rates?",
    answer:
      "Discount rates typically range from 12-18% per annum depending on the EPC rating, bill tenure, and your credit profile. Multiple NBFCs compete, ensuring competitive rates.",
  },
  {
    question: "How long does the process take?",
    answer:
      "Once your EPC validates the bill, you can receive offers within 24 hours. Upon acceptance, funds are disbursed within 48 hours.",
  },
  {
    question: "What happens when the bill matures?",
    answer:
      "The EPC pays the full bill amount to the NBFC on the original due date. Your payment obligation is fulfilled through this collection.",
  },
];

export default function ForSubcontractorsPage() {
  return (
    <>
      <Header />
      <main className="pt-20 bg-[var(--bg-base)]">
        {/* Hero Section */}
        <section className="relative py-20 md:py-28 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.25),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.18),transparent_40%)]" />
          <div className="container-custom">
            <div className="max-w-3xl relative z-10">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 80, damping: 20 }}
                className="text-display text-4xl md:text-5xl font-bold text-white mb-6"
              >
                Get Paid Faster
                <span className="block text-emerald-300">
                  Grow Your Business
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 80, damping: 20, delay: 0.1 }}
                className="text-xl text-gray-300 mb-8"
              >
                Convert your validated EPC bills into working capital within 48
                hours. No more waiting months for payments.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 80, damping: 20, delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <motion.a href="/contact" className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-emerald-500 text-slate-950 font-semibold hover:bg-emerald-400" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  Get Started Now
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="#how-it-works"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-white/30 text-white hover:bg-white/10"
                >
                  See How It Works
                </motion.a>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 border-y border-white/10">
          <div className="container-custom">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center glass-card p-4"
              >
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  48 hrs
                </div>
                <div className="text-gray-400">Funding Time</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-center glass-card p-4"
              >
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  Multi-NBFC
                </div>
                <div className="text-gray-400">Competitive Bidding</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-center glass-card p-4"
              >
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  ₹5L+
                </div>
                <div className="text-gray-400">Min Bill Amount</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="text-center glass-card p-4"
              >
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  100%
                </div>
                <div className="text-gray-400">Digital Process</div>
              </motion.div>
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
                Why Sub-Contractors Choose Gryork
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-lg text-gray-300 max-w-2xl mx-auto"
              >
                Access working capital without traditional loan hassles
              </motion.p>
            </div>

            <div className="mt-8 overflow-hidden w-full relative">
              <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#0B0F19] to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#0B0F19] to-transparent z-10 pointer-events-none" />
              <InfiniteSlider gap={24} duration={40} speedOnHover={80}>
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ y: -5, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="glass-card w-[320px] shrink-0 h-full flex flex-col items-start p-6 bg-white/[0.03] cursor-pointer"
                  >
                    <div className="w-12 h-12 bg-emerald-500/15 rounded-lg flex items-center justify-center mb-4">
                      <benefit.icon className="w-6 h-6 text-emerald-300" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-300 flex-1">{benefit.description}</p>
                  </motion.div>
                ))}
              </InfiniteSlider>
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
                How to Get Funded
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-lg text-gray-300 max-w-2xl mx-auto"
              >
                Simple 5-step process to convert your bills into cash
              </motion.p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-white/15 hidden md:block" />

                <div className="space-y-8">
                  {steps.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -30, scale: 0.95 }}
                      whileInView={{ opacity: 1, x: 0, scale: 1 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ type: "spring", stiffness: 90, damping: 15, delay: index * 0.15 }}
                      className="flex gap-6 relative"
                    >
                      <div className="flex-shrink-0 relative z-10">
                        <motion.div 
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center text-slate-950 font-bold cursor-default shadow-lg"
                        >
                          {step.step}
                        </motion.div>
                      </div>
                      <motion.div 
                        whileHover={{ x: 5 }}
                        className="glass-card rounded-xl p-6 flex-1 bg-white/[0.03]"
                      >
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {step.title}
                        </h3>
                        <p className="text-gray-300">{step.description}</p>
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Eligibility Section */}
        <section className="section">
          <div className="container-custom">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-display text-3xl md:text-4xl font-bold text-white mb-6">
                  Are You Eligible?
                </h2>
                <p className="text-lg text-gray-300 mb-8">
                  If you&apos;re a sub-contractor working with EPCs in the
                  infrastructure sector, you likely qualify. Here&apos;s what
                  you need:
                </p>
                <ul className="space-y-4">
                  {eligibility.map((item, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <CheckCircle className="w-5 h-5 text-emerald-300 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-200">{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 80, damping: 20 }}
                className="glass-card rounded-2xl p-8 bg-white/[0.03]"
              >
                <h3 className="text-2xl font-bold text-white mb-6">
                  Ready to Get Started?
                </h3>
                <p className="text-gray-300 mb-6">
                  Contact our team to learn more about how Gryork can help your
                  business grow with quick working capital.
                </p>
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href="/contact"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400"
                >
                  Contact Us <ArrowRight className="w-4 h-4" />
                </motion.a>
                <p className="text-sm text-gray-400 text-center mt-4">
                  Our team will reach out within 24 hours
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="section">
          <div className="container-custom">
            <div className="text-center mb-12">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-display text-3xl md:text-4xl font-bold text-white mb-4"
              >
                Frequently Asked Questions
              </motion.h2>
            </div>

            <div className="max-w-3xl mx-auto grid gap-6">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card bg-white/[0.03] rounded-xl p-6"
                >
                  <h3 className="font-semibold text-white mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-gray-300">{faq.answer}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section">
          <div className="container-custom text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-display text-3xl md:text-4xl font-bold text-white mb-4"
            >
              Stop Waiting. Start Growing.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto"
            >
              Get your working capital faster, stay financially healthy, and
              take on bigger projects with confidence.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href={process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5173"}
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-emerald-500 text-slate-950 font-semibold hover:bg-emerald-400"
                >
                  Get Started Today
                </motion.a>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

