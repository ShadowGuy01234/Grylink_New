"use client";

import { useState } from "react";
import { Header, Footer } from "@/components/layout";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Building2,
  Banknote,
  FileText,
  CheckCircle,
  Clock,
  ArrowRight,
  HelpCircle,
  ChevronDown,
} from "lucide-react";

type Role = "subcontractor" | "epc" | "nbfc";

const roles = [
  {
    id: "subcontractor" as Role,
    icon: Users,
    label: "Sub-Contractor",
    description: "Need working capital",
  },
  {
    id: "epc" as Role,
    icon: Building2,
    label: "EPC Company",
    description: "Support your vendors",
  },
  {
    id: "nbfc" as Role,
    icon: Banknote,
    label: "NBFC Partner",
    description: "Access quality deals",
  },
];

const roleSteps: Record<Role, { title: string; description: string; icon: typeof FileText }[]> = {
  subcontractor: [
    {
      title: "Register on Gryork",
      description:
        "Complete simple KYC and provide basic business documents. One-time verification process.",
      icon: FileText,
    },
    {
      title: "Submit Bills",
      description:
        "Upload your work completion bills against an EPC on the platform with supporting documents.",
      icon: FileText,
    },
    {
      title: "EPC Validates Bill",
      description:
        "Your EPC partner validates the bill authenticity and work completion status.",
      icon: CheckCircle,
    },
    {
      title: "NBFC Reviews & Offers",
      description:
        "Partner NBFCs review the validated bill and provide discount offers.",
      icon: Banknote,
    },
    {
      title: "Receive Funds",
      description:
        "Accept an offer and receive discounted amount directly in your bank account within 48 hours.",
      icon: Clock,
    },
  ],
  epc: [
    {
      title: "Onboard to Gryork",
      description:
        "Complete one-time registration with company documents and KYC verification.",
      icon: FileText,
    },
    {
      title: "Invite Sub-Contractors",
      description:
        "Invite your trusted sub-contractors to join the Gryork platform.",
      icon: Users,
    },
    {
      title: "Receive Validation Requests",
      description:
        "When sub-contractors submit bills against you, you receive validation requests.",
      icon: FileText,
    },
    {
      title: "Validate Bills",
      description:
        "Review and validate bills with accurate work details and confirmation.",
      icon: CheckCircle,
    },
    {
      title: "Continue Your Cycle",
      description:
        "Your payment timeline remains unchanged. Pay as per your usual cycle.",
      icon: Clock,
    },
  ],
  nbfc: [
    {
      title: "Partner with Gryork",
      description:
        "Complete onboarding with RBI registration and compliance documentation.",
      icon: FileText,
    },
    {
      title: "Configure Preferences",
      description:
        "Set your investment criteria: sectors, deal sizes, risk parameters, and pricing.",
      icon: CheckCircle,
    },
    {
      title: "Receive Deal Flow",
      description:
        "Get matched with pre-verified bills from infrastructure sub-contractors.",
      icon: Banknote,
    },
    {
      title: "Review & Offer",
      description:
        "Access comprehensive risk reports and documentation. Submit discount offers.",
      icon: FileText,
    },
    {
      title: "Fund & Collect",
      description:
        "Upon acceptance, fund the deal. Collect payment from EPC on maturity.",
      icon: Clock,
    },
  ],
};

const faqs = [
  {
    question: "What is bill discounting?",
    answer:
      "Bill discounting is a financing method where a business sells its outstanding invoices to a financial institution at a discount in exchange for immediate cash. This helps businesses maintain cash flow without waiting for payment from their customers.",
  },
  {
    question: "How quickly can I get funds as a sub-contractor?",
    answer:
      "Once your bill is validated by the EPC and an NBFC makes an offer you accept, funds are typically disbursed within 48 hours directly to your registered bank account.",
  },
  {
    question: "What documents do I need to register?",
    answer:
      "For sub-contractors: GST registration, PAN card, bank account details, and basic KYC documents. For EPCs and NBFCs: Company registration, GST, PAN, and compliance certificates.",
  },
  {
    question: "Is there any cost for EPCs to join?",
    answer:
      "No, there is no cost for EPCs to join Gryork. EPCs only need to validate bills submitted by their sub-contractors. Their payment cycle remains completely unchanged.",
  },
  {
    question: "What happens if the EPC doesn't pay on time?",
    answer:
      "EPCs on our platform are pre-verified for creditworthiness. Our risk assessment team continuously monitors EPC payment patterns. The NBFC has recourse to the EPC based on the validated bill.",
  },
  {
    question: "What sectors does Gryork focus on?",
    answer:
      "Gryork primarily focuses on infrastructure sectors including construction, roads & highways, energy, power transmission, water infrastructure, and related sub-sectors.",
  },
];

export default function HowItWorksPage() {
  const [activeRole, setActiveRole] = useState<Role>("subcontractor");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-hero py-20 md:py-24">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto text-center">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl md:text-5xl font-bold text-white mb-6"
              >
                How Gryork Works
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-xl text-blue-100"
              >
                A simple, transparent process tailored for each stakeholder
              </motion.p>
            </div>
          </div>
        </section>

        {/* Role Selector Section */}
        <section className="section bg-white">
          <div className="container-custom">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-primary-900 mb-4">
                Select Your Role
              </h2>
              <p className="text-gray-600">
                Click on your role to see the step-by-step process
              </p>
            </div>

            {/* Role Tabs */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setActiveRole(role.id)}
                  className={`flex items-center gap-3 px-6 py-4 rounded-xl transition-all ${
                    activeRole === role.id
                      ? "bg-primary-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <role.icon className="w-6 h-6" />
                  <div className="text-left">
                    <div className="font-semibold">{role.label}</div>
                    <div
                      className={`text-sm ${
                        activeRole === role.id ? "text-blue-100" : "text-gray-500"
                      }`}
                    >
                      {role.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Steps */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeRole}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="max-w-4xl mx-auto"
              >
                <div className="relative">
                  {/* Connecting line */}
                  <div className="absolute left-6 top-10 bottom-10 w-0.5 bg-primary-200 hidden md:block" />

                  <div className="space-y-6">
                    {roleSteps[activeRole].map((step, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex gap-6"
                      >
                        <div className="flex-shrink-0 relative z-10">
                          <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                            {index + 1}
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-6 flex-1">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <step.icon className="w-5 h-5 text-primary-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-primary-900 mb-2">
                                {step.title}
                              </h3>
                              <p className="text-gray-600">{step.description}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* CTA for Role */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mt-10 text-center"
                >
                  {activeRole === "subcontractor" && (
                    <a href="/for-epc" className="btn-primary inline-flex items-center gap-2">
                      Get Started <ArrowRight className="w-4 h-4" />
                    </a>
                  )}
                  {activeRole === "epc" && (
                    <a href="/for-epc" className="btn-primary inline-flex items-center gap-2">
                      Partner as EPC <ArrowRight className="w-4 h-4" />
                    </a>
                  )}
                  {activeRole === "nbfc" && (
                    <a href="/for-nbfc" className="btn-primary inline-flex items-center gap-2">
                      Apply as NBFC Partner <ArrowRight className="w-4 h-4" />
                    </a>
                  )}
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* Visual Flow Section */}
        <section className="section bg-gray-50">
          <div className="container-custom">
            <div className="text-center mb-12">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold text-primary-900 mb-4"
              >
                The Gryork Ecosystem
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-lg text-gray-600 max-w-2xl mx-auto"
              >
                How all three parties work together
              </motion.p>
            </div>

            <div className="max-w-5xl mx-auto">
              <div className="grid md:grid-cols-3 gap-6">
                {/* Sub-Contractor */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-2xl p-6 shadow-sm"
                >
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-center text-primary-900 mb-4">
                    Sub-Contractor
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      Submits validated bills
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      Receives quick funding
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      Maintains cash flow
                    </li>
                  </ul>
                </motion.div>

                {/* EPC */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-sm md:mt-8"
                >
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building2 className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-center text-primary-900 mb-4">
                    EPC Company
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      Validates bills only
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      No financial commitment
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      Pays on usual schedule
                    </li>
                  </ul>
                </motion.div>

                {/* NBFC */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-2xl p-6 shadow-sm"
                >
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Banknote className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-center text-primary-900 mb-4">
                    NBFC Partner
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      Funds validated bills
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      Access pre-verified deals
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      Collects from EPC
                    </li>
                  </ul>
                </motion.div>
              </div>

              {/* Flow arrows */}
              <div className="mt-10 hidden md:flex justify-center items-center gap-8">
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-600 mb-2">
                    Bill Submission
                  </div>
                  <ArrowRight className="w-6 h-6 text-primary-400 mx-auto" />
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-600 mb-2">
                    Validation
                  </div>
                  <ArrowRight className="w-6 h-6 text-primary-400 mx-auto" />
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-600 mb-2">
                    Funding
                  </div>
                  <ArrowRight className="w-6 h-6 text-primary-400 mx-auto" />
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-600 mb-2">
                    Repayment
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="section bg-white">
          <div className="container-custom">
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 rounded-full text-primary-700 text-sm font-medium mb-4"
              >
                <HelpCircle className="w-4 h-4" />
                FAQs
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold text-primary-900 mb-4"
              >
                Frequently Asked Questions
              </motion.h2>
            </div>

            <div className="max-w-3xl mx-auto">
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="border rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-medium text-primary-900">
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          openFaq === index ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <AnimatePresence>
                      {openFaq === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 text-gray-600">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
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
              Ready to Get Started?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl text-green-100 mb-8 max-w-2xl mx-auto"
            >
              Join Gryork today and transform how you manage working capital
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row justify-center gap-4"
            >
              <a
                href="/for-nbfc"
                className="btn-primary bg-white text-accent-700 hover:bg-gray-100"
              >
                Apply as NBFC
              </a>
              <a
                href="/for-epc"
                className="btn-outline border-white text-white hover:bg-white hover:text-accent-700"
              >
                Partner as EPC
              </a>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
