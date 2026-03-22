import { useState } from "react";
import { publicApi } from "../lib/api";
import { getSessionId } from "../lib/session";
import { trackEvent } from "../lib/analytics";

export function EarlyAccessPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [roleInterest, setRoleInterest] = useState("subcontractor");
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const perks = [
    "Priority onboarding queue",
    "Early access to funding workflow improvements",
    "Dedicated support during onboarding setup",
    "Feedback channel for feature influence",
  ];

  return (
    <section className="page-section">
      <div className="mx-auto max-w-2xl px-4 text-center">
        <h1 className="heading-hero">Join Early Access</h1>
        <p className="text-muted mt-4">Get exclusive onboarding benefits and priority support.</p>
        <div className="mt-8 grid gap-3 text-left">
          {perks.map((perk) => (
            <div key={perk} className="glass-card p-4 text-slate-700">
              • {perk}
            </div>
          ))}
        </div>
        <div className="mt-8 glass-card p-6">
          {done ? (
            <p className="text-emerald">You&apos;re in! Check your inbox.</p>
          ) : (
            <form
              className="grid gap-3 sm:grid-cols-2"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!email.trim()) {
                  setError("Please enter your email.");
                  return;
                }
                try {
                  setSubmitting(true);
                  setError("");
                  await publicApi.submitLead({
                    source: "early_access",
                    roleInterest,
                    name: name.trim(),
                    email: email.trim(),
                    pagePath: window.location.pathname + window.location.search,
                    pageTitle: document.title,
                    sessionId: getSessionId(),
                  });
                  trackEvent({
                    eventName: "early_access_submitted",
                    category: "conversion",
                    roleContext: roleInterest,
                  });
                  setDone(true);
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Unable to submit now.");
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="field"
                placeholder="Your name (optional)"
                aria-label="Your name"
              />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field"
                placeholder="you@company.com"
                type="email"
                aria-label="Email"
              />
              <select
                className="field"
                value={roleInterest}
                onChange={(e) => setRoleInterest(e.target.value)}
                aria-label="Role interest"
              >
                <option value="subcontractor">Sub-Contractor</option>
                <option value="epc">EPC</option>
                <option value="nbfc">NBFC</option>
                <option value="general">General</option>
              </select>
              <button
                className="inline-flex items-center justify-center rounded-xl bg-cobalt px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70 sm:col-span-2"
                disabled={submitting}
              >
                {submitting ? "Joining..." : "Join"}
              </button>
            </form>
          )}
          {error && (
            <p className="mt-3 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
        </div>
        <img src="/media/Early-Access.png" alt="Early access preview" className="mt-8 h-[200px] w-full rounded-xl object-cover sm:h-[320px]" />
      </div>
    </section>
  );
}
