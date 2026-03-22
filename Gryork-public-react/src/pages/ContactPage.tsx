import { useState } from "react";
import { publicApi } from "../lib/api";
import { getSessionId } from "../lib/session";
import { trackEvent } from "../lib/analytics";

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    roleInterest: "general",
    subject: "",
    message: "",
  });
  const contactCards = [
    { title: "Email Us", detail: "contact@gryork.com", sub: "Best for detailed queries" },
    { title: "Call Support", detail: "+91 80 4567 8900", sub: "Mon-Fri, 9 AM - 6 PM IST" },
    { title: "Location", detail: "New Delhi", sub: "India" },
    { title: "Partnership Desk", detail: "NBFC / EPC onboarding", sub: "Dedicated response flow" },
  ];

  return (
    <section className="page-section">
      <div className="mx-auto max-w-4xl px-4">
        <h1 className="heading-hero">Contact</h1>
        <p className="text-muted mt-4">Have questions? Reach out to the Gryork team.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {contactCards.map((card) => (
            <div key={card.title} className="glass-card p-5">
              <p className="font-semibold text-slate-900">{card.title}</p>
              <p className="mt-2 text-slate-700">{card.detail}</p>
              <p className="text-muted mt-1 text-sm">{card.sub}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 glass-card p-6">
          {submitted ? (
            <p className="text-emerald">Message sent. We will get back to you.</p>
          ) : (
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
                  setError("Name, email, and message are required.");
                  return;
                }

                try {
                  setSubmitting(true);
                  setError("");
                  await publicApi.submitLead({
                    source: "contact_form",
                    roleInterest: form.roleInterest,
                    name: form.name.trim(),
                    email: form.email.trim(),
                    phone: form.phone.trim(),
                    company: form.company.trim(),
                    subject: form.subject.trim(),
                    message: form.message.trim(),
                    pagePath: window.location.pathname + window.location.search,
                    pageTitle: document.title,
                    sessionId: getSessionId(),
                  });
                  trackEvent({
                    eventName: "contact_submitted",
                    category: "conversion",
                    roleContext: form.roleInterest,
                    properties: { source: "contact_form" },
                  });
                  setSubmitted(true);
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Unable to send your message.");
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              <input
                className="field"
                placeholder="Name"
                aria-label="Name"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              />
              <input
                className="field"
                placeholder="Email"
                aria-label="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              />
              <input
                className="field"
                placeholder="Phone"
                aria-label="Phone"
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              />
              <input
                className="field"
                placeholder="Company"
                aria-label="Company"
                value={form.company}
                onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))}
              />
              <select
                className="field"
                aria-label="Role interest"
                value={form.roleInterest}
                onChange={(e) => setForm((p) => ({ ...p, roleInterest: e.target.value }))}
              >
                <option value="general">General Inquiry</option>
                <option value="subcontractor">Sub-Contractor</option>
                <option value="epc">EPC</option>
                <option value="nbfc">NBFC</option>
              </select>
              <input
                className="field"
                placeholder="Subject"
                aria-label="Subject"
                value={form.subject}
                onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
              />
              <textarea
                className="field"
                rows={5}
                placeholder="Message"
                aria-label="Message"
                value={form.message}
                onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
              />
              {error && (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              )}
              <button className="btn-primary" disabled={submitting}>
                {submitting ? "Sending..." : "Send"}
              </button>
            </form>
          )}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <a href="/how-it-works" className="glass-card p-5 transition hover:-translate-y-0.5">
            <p className="font-semibold text-slate-900">How does Gryork work?</p>
            <p className="text-muted mt-1 text-sm">See role-wise process and timelines.</p>
          </a>
          <a href="/for-nbfc" className="glass-card p-5 transition hover:-translate-y-0.5">
            <p className="font-semibold text-slate-900">NBFC partnership query</p>
            <p className="text-muted mt-1 text-sm">Explore criteria and onboarding process.</p>
          </a>
        </div>
      </div>
    </section>
  );
}
