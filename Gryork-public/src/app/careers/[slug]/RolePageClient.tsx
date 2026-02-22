"use client";

import { useState } from "react";
import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase, MapPin, Clock, ArrowRight, ArrowLeft, Send,
  CheckCircle2, Loader2, X, AlertTriangle,
} from "lucide-react";
import type { RoleDetail } from "@/lib/careers";

// ── Apply modal ───────────────────────────────────────────────────────────────

function ApplyModal({ role, onClose }: { role: RoleDetail; onClose: () => void }) {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", experience: "",
    currentCompany: "", linkedinUrl: "", portfolioUrl: "",
    coverLetter: "", resumeUrl: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/careers/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role: role.title, department: role.department }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");
      setStatus("success");
    } catch (err: unknown) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

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
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-start justify-between z-10 rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-primary-900">Apply — {role.title}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{role.department} · {role.location} · {role.type}</p>
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
                Thank you for applying for <strong>{role.title}</strong>. Our team will review your application
                and reach out within 5–7 business days.
              </p>
              <button onClick={onClose} className="btn-primary inline-flex items-center gap-2">
                Back to Role <ArrowRight className="w-4 h-4" />
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
                  <input name="experience" value={form.experience} onChange={handleChange} required placeholder={`e.g. ${role.experience}`}
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
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Why Gryork? / Cover Letter</label>
                <textarea name="coverLetter" value={form.coverLetter} onChange={handleChange} rows={4}
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

// ── Page ──────────────────────────────────────────────────────────────────────

export default function RolePageClient({ role }: { role: RoleDetail }) {
  const [applyOpen, setApplyOpen] = useState(false);

  return (
    <>
      <Header />
      <AnimatePresence>
        {applyOpen && <ApplyModal role={role} onClose={() => setApplyOpen(false)} />}
      </AnimatePresence>

      <main className="pt-20">
        {/* ── Hero ── */}
        <section className="bg-gradient-hero py-16 md:py-24">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Link
                  href="/careers"
                  className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-6 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> All Open Positions
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05 }}
                className="inline-flex items-center gap-2 bg-accent-500/20 border border-accent-400/30 text-accent-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-4"
              >
                <Briefcase className="w-3.5 h-3.5" /> {role.department}
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.1 }}
                className="text-3xl md:text-5xl font-bold text-white mb-5 leading-tight"
              >
                {role.title}
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.18 }}
                className="flex flex-wrap gap-4 text-sm text-blue-100 mb-8"
              >
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-accent-300" />{role.location}</span>
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-accent-300" />{role.type}</span>
                <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-accent-300" />{role.experience} experience</span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="flex flex-wrap gap-3"
              >
                <button
                  onClick={() => setApplyOpen(true)}
                  className="btn-secondary inline-flex items-center gap-2"
                >
                  Apply Now <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Intern + Assessment Notice ── */}
        <section className="bg-amber-50 border-y border-amber-200 py-5">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertTriangle className="w-4.5 h-4.5 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-amber-900 text-sm">Internship opportunity — we&apos;re actively hiring interns for this role</p>
                <p className="text-amber-800 text-sm mt-0.5">
                  All selected candidates — interns and full-time alike — will undergo a{" "}
                  <strong>14-day paid assessment period</strong> before a full offer is extended.
                  This helps both sides ensure the right fit before committing long-term.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Main Content ── */}
        <section className="section bg-white">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto grid lg:grid-cols-3 gap-10">

              {/* Left — JD detail */}
              <div className="lg:col-span-2 space-y-10">

                {/* About the role */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-xl font-bold text-primary-900 mb-3">About the Role</h2>
                  <p className="text-gray-600 leading-relaxed">{role.description}</p>
                </motion.div>

                {/* Responsibilities */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.05 }}
                >
                  <h2 className="text-xl font-bold text-primary-900 mb-4">What You&apos;ll Do</h2>
                  <ul className="space-y-3">
                    {role.responsibilities.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                        <span className="text-gray-600 text-sm leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>

                {/* Requirements */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.08 }}
                >
                  <h2 className="text-xl font-bold text-primary-900 mb-4">What We&apos;re Looking For</h2>
                  <ul className="space-y-2.5">
                    {role.requirements.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="w-4.5 h-4.5 text-accent-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600 text-sm leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>

                {/* Nice to have */}
                {role.niceToHave && role.niceToHave.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                  >
                    <h2 className="text-xl font-bold text-primary-900 mb-4">Nice to Have</h2>
                    <ul className="space-y-2.5">
                      {role.niceToHave.map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-500 text-sm leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </div>

              {/* Right — sticky apply card */}
              <div className="lg:col-span-1">
                <div className="sticky top-28">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="bg-gray-50 rounded-2xl border border-gray-200 p-6 space-y-4"
                  >
                    <h3 className="font-bold text-primary-900">Role Summary</h3>
                    <div className="space-y-3 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-primary-400 flex-shrink-0" />
                        <span>{role.department}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary-400 flex-shrink-0" />
                        <span>{role.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary-400 flex-shrink-0" />
                        <span>{role.type}</span>
                      </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 leading-relaxed">
                      <strong className="text-amber-900">Intern-friendly role.</strong>{" "}
                      Selected candidates begin with a <strong>14-day assessment period</strong> before a full offer.
                    </div>

                    <button
                      onClick={() => setApplyOpen(true)}
                      className="w-full btn-primary inline-flex items-center justify-center gap-2"
                    >
                      Apply for this Role <ArrowRight className="w-4 h-4" />
                    </button>
                    <Link
                      href="/careers"
                      className="block text-center text-sm text-gray-400 hover:text-primary-600 transition-colors"
                    >
                      ← View all openings
                    </Link>
                  </motion.div>
                </div>
              </div>

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
              Ready to join Gryork?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl text-green-100 mb-8 max-w-xl mx-auto"
            >
              Apply now — start with a 14-day assessment and grow with us from day one.
            </motion.p>
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              onClick={() => setApplyOpen(true)}
              className="btn-primary bg-white text-accent-700 hover:bg-gray-100 inline-flex items-center gap-2"
            >
              Apply Now <Send className="w-4 h-4" />
            </motion.button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
