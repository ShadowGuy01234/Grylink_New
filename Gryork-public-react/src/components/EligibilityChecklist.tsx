import { AnimatedReveal } from "./AnimatedReveal";

const items = [
  { label: "GST-registered entity", detail: "Compliance-ready legal and tax profile." },
  { label: "Active EPC contract", detail: "Live project relationship with billable scope." },
  { label: "Valid RA Bill", detail: "Documented work completion basis for discounting." },
  { label: "PAN + Aadhaar", detail: "Identity/KYC verification for onboarding." },
  { label: "6+ months in business", detail: "Basic operating track record for eligibility checks." },
];

export function EligibilityChecklist() {
  return (
    <section className="bg-white page-section">
      <div className="mx-auto max-w-5xl px-4">
        <AnimatedReveal>
          <div className="glass-card border-slate-200/80 p-8">
            <h2 className="heading-section">Eligibility Checklist</h2>
            <p className="text-muted mt-2">
              Keep onboarding smooth by preparing the following essentials before registration.
            </p>
            <ul className="mt-6 space-y-3">
              {items.map((item) => (
                <li key={item.label} className="flex items-start gap-3 text-slate-700">
                  <span className="mt-2 h-2 w-2 rounded-full bg-emerald" />
                  <div>
                    <p className="font-semibold text-slate-900">{item.label}</p>
                    <p className="text-sm text-slate-600">{item.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </AnimatedReveal>
      </div>
    </section>
  );
}
