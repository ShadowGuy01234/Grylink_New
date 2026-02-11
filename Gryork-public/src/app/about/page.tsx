"use client";

import { Header, Footer } from "@/components/layout";
import { motion } from "framer-motion";
import {
  Target,
  Heart,
  Shield,
  Lightbulb,
  Users,
  TrendingUp,
  Building2,
  Banknote,
} from "lucide-react";

const stats = [
  { value: "₹500+ Cr", label: "Transaction Volume" },
  { value: "200+", label: "Active Sub-Contractors" },
  { value: "50+", label: "Partner NBFCs" },
  { value: "99%", label: "On-Time Repayment" },
];

const values = [
  {
    icon: Heart,
    title: "Trust & Transparency",
    description:
      "We believe in building lasting relationships through honest, transparent dealings with all stakeholders.",
  },
  {
    icon: Shield,
    title: "Security First",
    description:
      "Every transaction, every document, every data point is protected with enterprise-grade security.",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description:
      "We continuously improve our platform to make bill discounting simpler, faster, and more accessible.",
  },
  {
    icon: Users,
    title: "Partnership",
    description:
      "We succeed when our partners succeed. Every feature is designed with our stakeholders in mind.",
  },
];

const milestones = [
  {
    year: "2023",
    title: "Platform Launch",
    description: "Gryork launched with initial NBFC partnerships",
  },
  {
    year: "2023",
    title: "100 Sub-Contractors",
    description: "Reached milestone of 100 active sub-contractors",
  },
  {
    year: "2024",
    title: "₹100 Cr Milestone",
    description: "Crossed ₹100 Crore in transaction volume",
  },
  {
    year: "2024",
    title: "Expansion",
    description: "Expanded to multiple infrastructure sectors",
  },
];

const stakeholders = [
  {
    icon: Users,
    title: "For Sub-Contractors",
    description:
      "Access working capital within 48 hours against validated bills from reputed EPCs",
    color: "bg-blue-500",
  },
  {
    icon: Building2,
    title: "For EPCs",
    description:
      "Support your vendor ecosystem with quick financing without any financial commitment",
    color: "bg-green-500",
  },
  {
    icon: Banknote,
    title: "For NBFCs",
    description:
      "Access pre-verified, low-risk infrastructure deals with transparent documentation",
    color: "bg-purple-500",
  },
];

export default function AboutPage() {
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
                Transforming Infrastructure Finance
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-xl text-blue-100"
              >
                Gryork bridges the gap between infrastructure sub-contractors
                seeking working capital and NBFCs looking for quality lending
                opportunities.
              </motion.p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-white border-b">
          <div className="container-custom">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="section bg-gray-50">
          <div className="container-custom">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 rounded-full text-primary-700 text-sm font-medium mb-6">
                  <Target className="w-4 h-4" />
                  Our Mission
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-primary-900 mb-6">
                  Empowering Infrastructure Growth Through Smart Financing
                </h2>
                <p className="text-gray-600 text-lg mb-6">
                  India&apos;s infrastructure sector is the backbone of economic
                  growth. Yet, the sub-contractors who build this infrastructure
                  often struggle with cash flow challenges due to extended
                  payment cycles.
                </p>
                <p className="text-gray-600 text-lg">
                  Gryork solves this by creating a secure platform where
                  sub-contractors can discount their validated bills against
                  reputed EPCs, while NBFCs gain access to quality, low-risk
                  lending opportunities in the infrastructure sector.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="grid gap-4"
              >
                {stakeholders.map((item, index) => (
                  <div
                    key={index}
                    className="flex gap-4 items-start bg-white p-6 rounded-xl shadow-sm"
                  >
                    <div
                      className={`w-12 h-12 ${item.color} rounded-lg flex items-center justify-center flex-shrink-0`}
                    >
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary-900 mb-1">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 text-sm">{item.description}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="section bg-white">
          <div className="container-custom">
            <div className="text-center mb-12">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold text-primary-900 mb-4"
              >
                Our Values
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-lg text-gray-600 max-w-2xl mx-auto"
              >
                The principles that guide everything we do
              </motion.p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-6"
                >
                  <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-primary-900 mb-2">
                    {value.title}
                  </h3>
                  <p className="text-gray-600">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="section bg-gray-50">
          <div className="container-custom">
            <div className="text-center mb-12">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold text-primary-900 mb-4"
              >
                Our Journey
              </motion.h2>
            </div>

            <div className="max-w-3xl mx-auto">
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-primary-200 hidden md:block" />

                <div className="space-y-8">
                  {milestones.map((milestone, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="flex gap-6"
                    >
                      <div className="flex-shrink-0 w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm relative z-10">
                        {milestone.year}
                      </div>
                      <div className="pt-4">
                        <h3 className="text-lg font-semibold text-primary-900 mb-1">
                          {milestone.title}
                        </h3>
                        <p className="text-gray-600">{milestone.description}</p>
                      </div>
                    </motion.div>
                  ))}

                  {/* Future milestone */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="flex gap-6"
                  >
                    <div className="flex-shrink-0 w-16 h-16 bg-accent-500 rounded-full flex items-center justify-center relative z-10">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div className="pt-4">
                      <h3 className="text-lg font-semibold text-primary-900 mb-1">
                        Growing Together
                      </h3>
                      <p className="text-gray-600">
                        Continuing to expand our platform and serve more
                        stakeholders across India&apos;s infrastructure sector
                      </p>
                    </div>
                  </motion.div>
                </div>
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
              Join the Gryork Ecosystem
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl text-green-100 mb-8 max-w-2xl mx-auto"
            >
              Whether you&apos;re a sub-contractor, EPC, or NBFC, there&apos;s a
              place for you in our ecosystem.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row justify-center gap-4"
            >
              <a href="/for-nbfc" className="btn-primary bg-white text-accent-700 hover:bg-gray-100">
                Partner as NBFC
              </a>
              <a href="/for-epc" className="btn-outline border-white text-white hover:bg-white hover:text-accent-700">
                Join as EPC
              </a>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
