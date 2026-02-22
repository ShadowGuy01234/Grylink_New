"use client";

import { useState } from "react";
import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import { motion, AnimatePresence } from "framer-motion";
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
  X,
  Send,
  CheckCircle2,
  Loader2,
  ChevronDown,
  AlertTriangle,
} from "lucide-react";
import { ROLES } from "@/lib/careers";
import type { RoleDetail } from "@/lib/careers";

type Position = RoleDetail;

// ── Data ────────────────────────────────────────────────────────────────────

const benefits = [
  { icon: TrendingUp, title: "Growth Opportunities", description: "Fast-growing startup with clear career progression paths" },
  { icon: Heart, title: "Health Insurance", description: "Comprehensive health coverage for you and your family" },
  { icon: Coffee, title: "Flexible Work", description: "Hybrid work model with flexible timings" },
  { icon: Users, title: "Great Team", description: "Work with passionate people solving real problems" },
  { icon: Zap, title: "Learning Budget", description: "Annual learning allowance for courses and conferences" },
  { icon: Briefcase, title: "Stock Options", description: "Be an owner with employee stock options" },
];

const values = [
  { title: "Customer First", description: "Every decision starts with how it impacts our customers — sub-contractors, EPCs, and NBFCs." },
  { title: "Move Fast", description: "We ship fast, learn faster. Quick iterations over perfect solutions." },
  { title: "Be Transparent", description: "Open communication, honest feedback, and transparent dealings." },
  { title: "Own It", description: "Take ownership of problems and see them through to resolution." },
];

// ── Application modal ────────────────────────────────────────────────────────

type ModalPosition = { title: string; department: string; location: string; type: string; experience: string; description: string; };

function ApplyModal({ position, onClose }: { position: ModalPosition | null; onClose: () => void }) {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", experience: "",
    currentCompany: "", linkedinUrl: "", portfolioUrl: "",
    coverLetter: "", resumeUrl: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    try {
      const res = await fetch(`${API}/careers/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role: position?.title, department: position?.department }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");
      setStatus("success");
    } catch (err: unknown) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  if (!position) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-start justify-between z-10 rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-primary-900">Apply for {position.title}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{position.department} · {position.location} · {position.type}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 ml-4 flex-shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {status === "success" ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-primary-900 mb-2">Application Submitted!</h3>
              <p className="text-gray-600 mb-6">
                Thank you for applying for <strong>{position.title}</strong>. Our team will review your application
                and reach out within 5–7 business days.
              </p>
              <button onClick={onClose} className="btn-primary inline-flex items-center gap-2">
                Back to Openings <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                  <input name="name" value={form.name} onChange={handleChange} required placeholder="Rahul Sharma"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="rahul@example.com"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone *</label>
                  <input name="phone" type="tel" value={form.phone} onChange={handleChange} required placeholder="+91 98765 43210"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Years of Experience *</label>
                  <input name="experience" value={form.experience} onChange={handleChange} required placeholder={`e.g. ${position.experience}`}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Current / Last Company</label>
                <input name="currentCompany" value={form.currentCompany} onChange={handleChange} placeholder="Company name"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">LinkedIn Profile</label>
                  <input name="linkedinUrl" type="url" value={form.linkedinUrl} onChange={handleChange} placeholder="https://linkedin.com/in/..."
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Portfolio / GitHub</label>
                  <input name="portfolioUrl" type="url" value={form.portfolioUrl} onChange={handleChange} placeholder="https://github.com/..."
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Resume Link (Google Drive / Dropbox)</label>
                <input name="resumeUrl" type="url" value={form.resumeUrl} onChange={handleChange} placeholder="https://drive.google.com/..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" />
                <p className="text-xs text-gray-400 mt-1">Paste a shareable link to your resume PDF</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Cover Letter / Why Gryork?</label>
                <textarea name="coverLetter" value={form.coverLetter} onChange={handleChange} rows={5}
                  placeholder="Tell us why you want to join Gryork and what you'd bring to this role..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm resize-none" />
              </div>
              {status === "error" && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{errorMsg}</div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose}
                  className="flex-1 px-6 py-3 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors text-sm">
                  Cancel
                </button>
                <button type="submit" disabled={status === "loading"}
                  className="flex-1 btn-primary inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                  {status === "loading" ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
                  ) : (
                    <>Submit Application <Send className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function CareersPage() {
  const [selectedPosition, setSelectedPosition] = useState<ModalPosition | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const openPositions: Position[] = ROLES;

  return (
    <>
      <Header />
      <AnimatePresence>
        {selectedPosition && (
          <ApplyModal position={selectedPosition} onClose={() => setSelectedPosition(null)} />
        )}
      </AnimatePresence>
      <main className="pt-20">

        {/* Hero */}
        <section className="bg-gradient-hero py-20 md:py-28">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-sm font-medium px-4 py-2 rounded-full mb-6"
              >
                <Briefcase className="w-4 h-4 text-accent-300" />
                We&apos;re Hiring — Join Gryork
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl md:text-5xl font-bold text-white mb-6"
              >
                Build the Future of
                <span className="block text-accent-300">Infrastructure Finance</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl text-blue-100 mb-8"
              >
                Join our mission to transform how infrastructure businesses access working capital.
                We&apos;re looking for passionate people to build something meaningful.
              </motion.p>
              <motion.a
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
                href="#openings" className="btn-secondary inline-flex items-center gap-2"
              >
                View Open Positions <ArrowRight className="w-4 h-4" />
              </motion.a>
            </div>
          </div>
        </section>

        {/* Intern notice */}
        <section className="bg-amber-50 border-b border-amber-200 py-4">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-amber-800 text-sm leading-relaxed">
                <strong className="text-amber-900">We’re hiring interns!</strong> All roles listed below are open to
                interns and fresh graduates. Every selected candidate — intern or full-time — starts with a{" "}
                <strong className="text-amber-900">14-day paid assessment period</strong> before a full offer is extended.
              </p>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="section bg-white">
          <div className="container-custom">
            <div className="text-center mb-12">
              <motion.h2
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold text-primary-900 mb-4"
              >
                Why Join Gryork?
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                className="text-lg text-gray-600 max-w-2xl mx-auto"
              >
                We&apos;re building a company where talented people can do their best work.
              </motion.p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((b, i) => (
                <motion.div
                  key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="flex gap-4 p-6 bg-gray-50 rounded-xl"
                >
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <b.icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-900 mb-1">{b.title}</h3>
                    <p className="text-gray-600 text-sm">{b.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="section bg-gray-50">
          <div className="container-custom">
            <div className="text-center mb-12">
              <motion.h2
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold text-primary-900 mb-4"
              >
                Our Values
              </motion.h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((v, i) => (
                <motion.div
                  key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-xl p-6 text-center"
                >
                  <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl font-bold text-accent-600">{i + 1}</span>
                  </div>
                  <h3 className="font-semibold text-primary-900 mb-2">{v.title}</h3>
                  <p className="text-gray-600 text-sm">{v.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Open Positions */}
        <section id="openings" className="section bg-white">
          <div className="container-custom">
            <div className="text-center mb-12">
              <motion.h2
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold text-primary-900 mb-4"
              >
                Open Positions
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                className="text-lg text-gray-600 max-w-2xl mx-auto"
              >
                {openPositions.length} open roles across engineering, product, sales and more
              </motion.p>
            </div>
            <div className="max-w-4xl mx-auto space-y-4">
              {openPositions.map((pos, i) => (
                <motion.div
                  key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <button
                    className="w-full text-left px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
                  >
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-primary-900">{pos.title}</h3>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-500 mt-1.5">
                        <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{pos.department}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{pos.location}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{pos.type}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="px-3 py-1 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full">{pos.experience}</span>
                      <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expandedIndex === i ? "rotate-180" : ""}`} />
                    </div>
                  </button>
                  <AnimatePresence>
                    {expandedIndex === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden"
                      >
                        <div className="px-6 pb-5 pt-0 border-t border-gray-200">
                          <p className="text-gray-600 mt-4 mb-5">{pos.description}</p>
                          <div className="flex flex-wrap gap-3">
                            <Link
                              href={`/careers/${pos.slug}`}
                              className="btn-outline-dark inline-flex items-center gap-2 px-4 py-2 border border-primary-600 text-primary-700 rounded-xl text-sm font-semibold hover:bg-primary-50 transition-colors"
                            >
                              View Full Role <ArrowRight className="w-4 h-4" />
                            </Link>
                            <button onClick={() => setSelectedPosition(pos)} className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm">
                              Quick Apply <Send className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* General CTA */}
        <section className="section bg-gradient-cta">
          <div className="container-custom text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-white mb-4"
            >
              Don&apos;t See Your Role?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="text-xl text-green-100 mb-8 max-w-2xl mx-auto"
            >
              We&apos;re always looking for talented people. Submit a general application and we&apos;ll reach out for future opportunities.
            </motion.p>
            <motion.button
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
              onClick={() => setSelectedPosition({ title: "General Application", department: "Open", location: "India", type: "Full-time", experience: "Any", description: "Tell us who you are and what you do best." })}
              className="btn-primary bg-white text-accent-700 hover:bg-gray-100 inline-flex items-center gap-2"
            >
              Submit General Application <Send className="w-4 h-4" />
            </motion.button>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
