"use client";

import { Header, Footer } from "@/components/layout";
import { motion } from "framer-motion";
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
                Get Paid Faster
                <span className="block text-accent-300">
                  Grow Your Business
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-xl text-blue-100 mb-8"
              >
                Convert your validated EPC bills into working capital within 48
                hours. No more waiting months for payments.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <a href="/contact" className="btn-secondary">
                  Get Started Now
                </a>
                <a
                  href="#how-it-works"
                  className="btn-outline border-white text-white hover:bg-white hover:text-primary-900"
                >
                  See How It Works
                </a>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-white border-b">
          <div className="container-custom">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                  48 hrs
                </div>
                <div className="text-gray-600">Funding Time</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                  12-18%
                </div>
                <div className="text-gray-600">Annual Rates</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                  ₹5L+
                </div>
                <div className="text-gray-600">Min Bill Amount</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                  100%
                </div>
                <div className="text-gray-600">Digital Process</div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="section bg-gray-50">
          <div className="container-custom">
            <div className="text-center mb-12">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold text-primary-900 mb-4"
              >
                Why Sub-Contractors Choose Gryork
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-lg text-gray-600 max-w-2xl mx-auto"
              >
                Access working capital without traditional loan hassles
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
        <section id="how-it-works" className="section bg-white">
          <div className="container-custom">
            <div className="text-center mb-12">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold text-primary-900 mb-4"
              >
                How to Get Funded
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-lg text-gray-600 max-w-2xl mx-auto"
              >
                Simple 5-step process to convert your bills into cash
              </motion.p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-primary-200 hidden md:block" />

                <div className="space-y-8">
                  {steps.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="flex gap-6"
                    >
                      <div className="flex-shrink-0 relative z-10">
                        <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                          {step.step}
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-6 flex-1">
                        <h3 className="text-lg font-semibold text-primary-900 mb-2">
                          {step.title}
                        </h3>
                        <p className="text-gray-600">{step.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Eligibility Section */}
        <section className="section bg-gray-50">
          <div className="container-custom">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-4xl font-bold text-primary-900 mb-6">
                  Are You Eligible?
                </h2>
                <p className="text-lg text-gray-600 mb-8">
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
                      <CheckCircle className="w-5 h-5 text-accent-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-8 shadow-lg"
              >
                <h3 className="text-2xl font-bold text-primary-900 mb-6">
                  Ready to Get Started?
                </h3>
                <p className="text-gray-600 mb-6">
                  Contact our team to learn more about how Gryork can help your
                  business grow with quick working capital.
                </p>
                <a
                  href="/contact"
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  Contact Us <ArrowRight className="w-4 h-4" />
                </a>
                <p className="text-sm text-gray-500 text-center mt-4">
                  Our team will reach out within 24 hours
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="section bg-white">
          <div className="container-custom">
            <div className="text-center mb-12">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold text-primary-900 mb-4"
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
                  className="bg-gray-50 rounded-xl p-6"
                >
                  <h3 className="font-semibold text-primary-900 mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section bg-gradient-cta">
          <div className="container-custom text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-white mb-4"
            >
              Stop Waiting. Start Growing.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl text-green-100 mb-8 max-w-2xl mx-auto"
            >
              Join hundreds of sub-contractors already using Gryork for quick
              working capital.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <a
                href={process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5173"}
                className="btn-primary bg-white text-accent-700 hover:bg-gray-100"
              >
                Get Started Today
              </a>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
