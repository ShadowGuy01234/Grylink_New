import { useState } from "react";
import { publicApi } from "../lib/api";
import { getSessionId } from "../lib/session";
import { trackEvent } from "../lib/analytics";
import { WorkflowDiagramMock } from "../components/WorkflowDiagramMock";
import { SectionShell } from "../components/SectionShell";
import { SignatureCard } from "../components/SignatureCard";
import { AnimatedReveal } from "../components/AnimatedReveal";
import { Star, Rocket, Sparkles, MessageSquareHeart } from "lucide-react";

export function EarlyAccessPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [roleInterest, setRoleInterest] = useState("subcontractor");
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const perks = [
    { text: "Priority onboarding queue", icon: Star },
    { text: "Early access to funding workflow improvements", icon: Rocket },
    { text: "Dedicated support during onboarding setup", icon: Sparkles },
    { text: "Feedback channel for feature influence", icon: MessageSquareHeart },
  ];

  return (
    <SectionShell variant="accent">
      <div className="mx-auto max-w-2xl px-4 text-center">
        <AnimatedReveal>
          <p className="badge-info mb-4">Priority Onboarding</p>
          <h1 className="heading-hero">Join Early Access</h1>
          <p className="text-muted mt-4">Get exclusive onboarding benefits and priority support.</p>
        </AnimatedReveal>
        <div className="mt-8 grid gap-3 text-left">
          {perks.map((perk) => (
            <SignatureCard key={perk.text} variant="proof" className="p-4 text-slate-700">
              <div className="flex items-start gap-2">
                <perk.icon className="mt-0.5 h-4 w-4 text-cobalt" />
                <span>{perk.text}</span>
              </div>
            </SignatureCard>
          ))}
        </div>
        <SignatureCard variant="story" className="mt-8 p-6">
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
        </SignatureCard>
        <div className="mt-8">
          <WorkflowDiagramMock variant="early-access-funnel" />
        </div>
      </div>
    </SectionShell>
  );
}
