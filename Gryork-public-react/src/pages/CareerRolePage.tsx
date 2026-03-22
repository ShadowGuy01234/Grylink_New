import { useParams } from "react-router-dom";
import { useState } from "react";
import { CAREER_ROLES } from "../lib/constants";
import { publicApi } from "../lib/api";
import { trackEvent } from "../lib/analytics";

export function CareerRolePage() {
  const { slug } = useParams();
  const role = CAREER_ROLES.find((x) => x.slug === slug);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    experience: "",
    currentCompany: "",
    linkedinUrl: "",
    portfolioUrl: "",
    coverLetter: "",
    resumeUrl: "",
  });

  if (!role) {
    return (
      <section className="page-section">
        <div className="mx-auto max-w-4xl px-4">
          <h1 className="text-3xl font-bold text-slate-900">Role not found</h1>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section">
      <div className="mx-auto max-w-5xl px-4">
        <h1 className="heading-hero">{role.title}</h1>
        <p className="mt-2 text-slate-500">
          {role.department} · {role.location} · {role.type}
        </p>
        <div className="mt-8 glass-card p-6">
          <p className="text-muted">{role.description}</p>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">What You&apos;ll Work On</p>
              <p className="text-muted mt-2 text-sm">Core product workflows, stakeholder-facing modules, and performance-oriented UX improvements.</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">How to Apply</p>
              <p className="text-muted mt-2 text-sm">Share your updated resume and a short note on why this role fits your experience.</p>
            </div>
          </div>
          {done ? (
            <p className="mt-6 text-sm font-semibold text-emerald-700">
              Application submitted. Our team will review and contact you.
            </p>
          ) : (
            <form
              className="mt-6 space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.experience.trim()) {
                  setError("Please fill name, email, phone, and experience.");
                  return;
                }

                try {
                  setLoading(true);
                  setError("");

                  await publicApi.submitCareerApplication({
                    name: form.name.trim(),
                    email: form.email.trim(),
                    phone: form.phone.trim(),
                    role: role.title,
                    department: role.department,
                    experience: form.experience.trim(),
                    currentCompany: form.currentCompany.trim(),
                    linkedinUrl: form.linkedinUrl.trim(),
                    portfolioUrl: form.portfolioUrl.trim(),
                    coverLetter: form.coverLetter.trim(),
                    resumeUrl: form.resumeUrl.trim(),
                  });

                  trackEvent({
                    eventName: "career_apply_started",
                    category: "conversion",
                    roleContext: "general",
                    properties: { roleSlug: role.slug, roleTitle: role.title },
                  });

                  setDone(true);
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Unable to submit application.");
                } finally {
                  setLoading(false);
                }
              }}
            >
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  className="field"
                  placeholder="Full name"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                />
                <input
                  className="field"
                  placeholder="Email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                />
                <input
                  className="field"
                  placeholder="Phone"
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                />
                <input
                  className="field"
                  placeholder="Experience (e.g., 2 years)"
                  value={form.experience}
                  onChange={(e) => setForm((p) => ({ ...p, experience: e.target.value }))}
                />
                <input
                  className="field"
                  placeholder="Current company"
                  value={form.currentCompany}
                  onChange={(e) => setForm((p) => ({ ...p, currentCompany: e.target.value }))}
                />
                <input
                  className="field"
                  placeholder="LinkedIn URL"
                  value={form.linkedinUrl}
                  onChange={(e) => setForm((p) => ({ ...p, linkedinUrl: e.target.value }))}
                />
                <input
                  className="field"
                  placeholder="Portfolio URL"
                  value={form.portfolioUrl}
                  onChange={(e) => setForm((p) => ({ ...p, portfolioUrl: e.target.value }))}
                />
                <input
                  className="field"
                  placeholder="Resume URL"
                  value={form.resumeUrl}
                  onChange={(e) => setForm((p) => ({ ...p, resumeUrl: e.target.value }))}
                />
              </div>
              <textarea
                className="field"
                rows={4}
                placeholder="Cover letter"
                value={form.coverLetter}
                onChange={(e) => setForm((p) => ({ ...p, coverLetter: e.target.value }))}
              />
              {error && (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              )}
              <button className="btn-primary" disabled={loading}>
                {loading ? "Submitting..." : "Apply Now"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
