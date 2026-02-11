"use client";

import { Header, Footer } from "@/components/layout";
import { motion } from "framer-motion";
import {
  Briefcase,
  MapPin,
  Clock,
  Users,
  Heart,
  Zap,
  TrendingUp,
  Coffee,
  ArrowRight,
} from "lucide-react";

const benefits = [
  {
    icon: TrendingUp,
    title: "Growth Opportunities",
    description: "Fast-growing startup with clear career progression paths",
  },
  {
    icon: Heart,
    title: "Health Insurance",
    description: "Comprehensive health coverage for you and your family",
  },
  {
    icon: Coffee,
    title: "Flexible Work",
    description: "Hybrid work model with flexible timings",
  },
  {
    icon: Users,
    title: "Great Team",
    description: "Work with passionate people solving real problems",
  },
  {
    icon: Zap,
    title: "Learning Budget",
    description: "Annual learning allowance for courses and conferences",
  },
  {
    icon: Briefcase,
    title: "Stock Options",
    description: "Be an owner with employee stock options",
  },
];

const openPositions = [
  {
    title: "Senior Full Stack Developer",
    department: "Engineering",
    location: "Bangalore (Hybrid)",
    type: "Full-time",
    experience: "4-7 years",
    description:
      "Build and scale our core platform using React, Node.js, and cloud technologies.",
  },
  {
    title: "Product Manager",
    department: "Product",
    location: "Bangalore (Hybrid)",
    type: "Full-time",
    experience: "3-5 years",
    description:
      "Drive product strategy and roadmap for our bill discounting platform.",
  },
  {
    title: "Business Development Manager",
    department: "Sales",
    location: "Mumbai / Bangalore",
    type: "Full-time",
    experience: "3-6 years",
    description:
      "Acquire and manage NBFC partnerships across India.",
  },
  {
    title: "Risk Analyst",
    department: "Risk & Compliance",
    location: "Bangalore",
    type: "Full-time",
    experience: "2-4 years",
    description:
      "Analyze credit risk and develop risk assessment models for infrastructure deals.",
  },
  {
    title: "UI/UX Designer",
    department: "Design",
    location: "Bangalore (Hybrid)",
    type: "Full-time",
    experience: "2-4 years",
    description:
      "Design intuitive experiences for our web and mobile platforms.",
  },
];

const values = [
  {
    title: "Customer First",
    description:
      "Every decision starts with how it impacts our customers - sub-contractors, EPCs, and NBFCs.",
  },
  {
    title: "Move Fast",
    description:
      "We ship fast, learn faster. Quick iterations over perfect solutions.",
  },
  {
    title: "Be Transparent",
    description:
      "Open communication, honest feedback, and transparent dealings.",
  },
  {
    title: "Own It",
    description:
      "Take ownership of problems and see them through to resolution.",
  },
];

export default function CareersPage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-hero py-20 md:py-28">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto text-center">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl md:text-5xl font-bold text-white mb-6"
              >
                Build the Future of
                <span className="block text-accent-300">
                  Infrastructure Finance
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-xl text-blue-100 mb-8"
              >
                Join our mission to transform how infrastructure businesses
                access working capital. We&apos;re looking for passionate people
                to build something meaningful.
              </motion.p>
              <motion.a
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                href="#openings"
                className="btn-secondary inline-flex items-center gap-2"
              >
                View Open Positions <ArrowRight className="w-4 h-4" />
              </motion.a>
            </div>
          </div>
        </section>

        {/* Why Join Us Section */}
        <section className="section bg-white">
          <div className="container-custom">
            <div className="text-center mb-12">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold text-primary-900 mb-4"
              >
                Why Join Gryork?
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-lg text-gray-600 max-w-2xl mx-auto"
              >
                We&apos;re building a company where talented people can do their
                best work.
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
                  className="flex gap-4 p-6 bg-gray-50 rounded-xl"
                >
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-900 mb-1">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600 text-sm">{benefit.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Values Section */}
        <section className="section bg-gray-50">
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
                The principles that guide how we work together
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
                  className="bg-white rounded-xl p-6 text-center"
                >
                  <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-accent-600">
                      {index + 1}
                    </span>
                  </div>
                  <h3 className="font-semibold text-primary-900 mb-2">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Open Positions Section */}
        <section id="openings" className="section bg-white">
          <div className="container-custom">
            <div className="text-center mb-12">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold text-primary-900 mb-4"
              >
                Open Positions
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-lg text-gray-600 max-w-2xl mx-auto"
              >
                Find your next role at Gryork
              </motion.p>
            </div>

            <div className="max-w-4xl mx-auto space-y-4">
              {openPositions.map((position, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold text-primary-900 mb-2">
                        {position.title}
                      </h3>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {position.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {position.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {position.type}
                        </span>
                      </div>
                      <p className="text-gray-600 mt-2">{position.description}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Experience: {position.experience}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <a
                        href={`mailto:careers@gryork.com?subject=Application for ${position.title}`}
                        className="btn-primary inline-flex items-center gap-2"
                      >
                        Apply <ArrowRight className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Don't See Your Role Section */}
        <section className="section bg-gradient-cta">
          <div className="container-custom text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-white mb-4"
            >
              Don&apos;t See Your Role?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl text-green-100 mb-8 max-w-2xl mx-auto"
            >
              We&apos;re always looking for talented people. Send us your resume
              and we&apos;ll keep you in mind for future opportunities.
            </motion.p>
            <motion.a
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              href="mailto:careers@gryork.com?subject=General Application"
              className="btn-primary bg-white text-accent-700 hover:bg-gray-100"
            >
              Send Your Resume
            </motion.a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
