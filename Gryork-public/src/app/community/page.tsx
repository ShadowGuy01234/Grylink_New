"use client";

import { Header, Footer } from "@/components/layout";
import { motion } from "framer-motion";
import { Users, BookOpen, TrendingUp, Globe, ArrowRight, CheckCircle, Lightbulb, ShieldCheck, IndianRupee, Clock } from "lucide-react";

// ── Social platform data ─────────────────────────────────────────────────────

const socials = [
  {
    name: "WhatsApp",
    handle: "Join our Group",
    description:
      "Get updates on bill discounting, CWC opportunities, and NBFC interest rates directly on WhatsApp.",
    color: "from-green-400 to-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
    textColor: "text-green-700",
    btnColor: "bg-green-600 hover:bg-green-700",
    href: "https://wa.me/919999999999",
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    handle: "@gryork_official",
    description:
      "Follow us for infographics on infrastructure finance, explainers on bill discounting, and behind-the-scenes of how invoices get funded.",
    color: "from-pink-500 via-red-500 to-yellow-500",
    bg: "bg-pink-50",
    border: "border-pink-200",
    textColor: "text-pink-700",
    btnColor: "bg-gradient-to-r from-pink-500 to-yellow-500 hover:from-pink-600 hover:to-yellow-600",
    href: "https://instagram.com/gryork_official",
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current" aria-hidden="true">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    handle: "Gryork Community",
    description:
      "A public group for bill discounting, CWC financing, and infrastructure supply-chain professionals across India.",
    color: "from-blue-600 to-blue-800",
    bg: "bg-blue-50",
    border: "border-blue-200",
    textColor: "text-blue-700",
    btnColor: "bg-blue-700 hover:bg-blue-800",
    href: "https://facebook.com/groups/gryork",
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current" aria-hidden="true">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    name: "X (Twitter)",
    handle: "@Gryork",
    description:
      "Follow for RBI policy updates, MSME bill discounting news, and Gryork platform announcements in real time.",
    color: "from-gray-800 to-black",
    bg: "bg-gray-50",
    border: "border-gray-200",
    textColor: "text-gray-800",
    btnColor: "bg-black hover:bg-gray-900",
    href: "https://x.com/gryork",
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    handle: "Gryork",
    description:
      "Connect with NBFCs, EPC companies, and finance professionals building India's infrastructure supply chain.",
    color: "from-blue-500 to-blue-700",
    bg: "bg-sky-50",
    border: "border-sky-200",
    textColor: "text-sky-700",
    btnColor: "bg-blue-600 hover:bg-blue-700",
    href: "https://linkedin.com/company/gryork",
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    name: "YouTube",
    handle: "Gryork",
    description:
      "Watch explainer videos on how bill discounting works, CWC basics, and MSME invoice finance tutorials.",
    color: "from-red-500 to-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
    textColor: "text-red-700",
    btnColor: "bg-red-600 hover:bg-red-700",
    href: "https://youtube.com/@gryork",
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current" aria-hidden="true">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
];

// ── Educational bill discounting explainer cards ──────────────────────────
const educationCards = [
  {
    icon: IndianRupee,
    title: "What is Bill Discounting?",
    body:
      "Bill discounting is a short-term financing method where a business sells its unpaid invoices to a lender at a discount, receiving immediate working capital instead of waiting 30–90 days for payment.",
  },
  {
    icon: ShieldCheck,
    title: "How CWC Financing Works",
    body:
      "A Custody & Warehouse Certificate (CWC) acts as collateral evidence for goods stored in a certified warehouse. Businesses can raise finance against this certificate without selling their inventory.",
  },
  {
    icon: TrendingUp,
    title: "Why It Matters for Infrastructure",
    body:
      "Sub-contractors in government infrastructure projects often wait months for EPC payments. Bill discounting converts verified work-completion invoices into immediate cash, keeping projects on schedule.",
  },
  {
    icon: Clock,
    title: "Faster Liquidity Cycle",
    body:
      "Traditional bank loans take weeks and require collateral. With invoice discounting, approval is tied to the invoice itself — enabling turnaround in days, not months.",
  },
  {
    icon: Lightbulb,
    title: "Who Can Benefit?",
    body:
      "Sub-contractors, MSMEs, commodity traders, and warehouse-linked businesses with verified receivables can use bill or CWC discounting to improve their working capital cycle.",
  },
  {
    icon: Globe,
    title: "A Growing Ecosystem",
    body:
      "India's bill discounting market is expanding rapidly as RBI-registered NBFCs adopt digital platforms to fund verified invoices — bringing institutional credit to India's vast informal infrastructure supply chain.",
  },
];

const whyJoin = [
  "Learn bill discounting and CWC concepts from industry practitioners",
  "Stay updated on RBI policy changes affecting MSME invoice finance",
  "Connect with EPC companies and NBFC funding partners",
  "Get early access to Gryork platform features and announcements",
  "Share and discover CWC opportunities across verified platforms",
  "Part of a growing network building India's digital supply-chain finance",
];

export default function CommunityPage() {
  return (
    <>
      <Header />
      <main className="pt-20">

        {/* ── Hero ── */}
        <section className="bg-gradient-hero py-20 md:py-28 overflow-hidden relative">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-16 left-1/4 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
          </div>
          <div className="container-custom relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-sm font-medium px-4 py-2 rounded-full mb-6"
              >
                <Users className="w-4 h-4 text-accent-300" />
                India&apos;s Home for Infrastructure Finance
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight"
              >
                Learn. Connect. Grow.
                <span className="block text-accent-300 mt-1">
                  Bill Discounting &amp; CWC Finance
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto"
              >
                A dedicated space for sub-contractors, EPC companies, and financiers to stay informed on{" "}
                <strong className="text-white">Bill Discounting</strong> and{" "}
                <strong className="text-white">CWC (Custody &amp; Warehouse Certificate)</strong> financing in India.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-wrap justify-center gap-3"
              >
                <a href="#join" className="btn-secondary inline-flex items-center gap-2">
                  Explore Platforms <ArrowRight className="w-4 h-4" />
                </a>
                <a href="#why" className="btn-outline-white inline-flex items-center gap-2">
                  Why Join? <CheckCircle className="w-4 h-4" />
                </a>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── What is Bill Discounting ── */}
        <section className="bg-white py-16 border-b border-gray-100">
          <div className="container-custom">
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4"
              >
                <BookOpen className="w-4 h-4" />
                Quick Explainer
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.05 }}
                className="text-3xl md:text-4xl font-bold text-primary-900 mb-3"
              >
                Understand the Basics
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-gray-500 max-w-xl mx-auto"
              >
                Bill discounting and CWC financing are powerful tools for India’s infrastructure supply chain.
                Here’s what you need to know.
              </motion.p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {educationCards.map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                    <card.icon className="w-5 h-5 text-primary-600" />
                  </div>
                  <h3 className="font-bold text-primary-900 mb-2 text-base">{card.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{card.body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Why Join ── */}
        <section id="why" className="section bg-gray-50">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-3xl md:text-4xl font-bold text-primary-900 mb-4"
                >
                  Why Follow Gryork?
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="text-lg text-gray-600"
                >
                  Free access to India’s most focused infrastructure finance knowledge network
                </motion.p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {whyJoin.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-start gap-3 bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                  >
                    <CheckCircle className="w-5 h-5 text-accent-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700 text-sm">{item}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Social platforms ── */}
        <section id="join" className="section bg-white">
          <div className="container-custom">
            <div className="text-center mb-14">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold text-primary-900 mb-4"
              >
                Choose Your Platform
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-lg text-gray-600 max-w-2xl mx-auto"
              >
                We&apos;re active on every major platform — join us wherever you spend your time
              </motion.p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {socials.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`rounded-2xl border ${s.border} ${s.bg} p-6 flex flex-col gap-4 hover:shadow-lg transition-shadow`}
                >
                  {/* Platform header */}
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} text-white flex items-center justify-center shadow-md`}>
                      {s.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{s.name}</h3>
                      <p className={`text-sm font-medium ${s.textColor}`}>{s.handle}</p>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm flex-1">{s.description}</p>

                  <div className="flex items-center justify-between mt-auto pt-2">
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-white transition-colors ${s.btnColor}`}
                    >
                      Follow / Join <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="section bg-gradient-cta">
          <div className="container-custom text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-white mb-4"
            >
              Stay Ahead in Infrastructure Finance
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl text-green-100 mb-8 max-w-2xl mx-auto"
            >
              Stay informed, connected, and ahead in India’s infrastructure finance ecosystem.
              Follow Gryork on your preferred platform.
            </motion.p>
            <motion.a
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              href="#join"
              className="btn-primary bg-white text-accent-700 hover:bg-gray-100 inline-flex items-center gap-2"
            >
              Follow Gryork <ArrowRight className="w-4 h-4" />
            </motion.a>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
