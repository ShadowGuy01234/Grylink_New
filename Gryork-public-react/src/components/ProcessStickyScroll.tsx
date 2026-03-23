import { AnimatedReveal } from "./AnimatedReveal";
import { WorkflowDiagramMock } from "./WorkflowDiagramMock";

const steps = [
  { title: "Register & KYC", time: "30 min", detail: "Digital onboarding for business and identity checks." },
  { title: "Submit Bill + CWCRF", time: "10 min", detail: "Upload validated RA bill and required project documents." },
  { title: "EPC Verifies Work", time: "1-2 days", detail: "EPC confirms completion and invoice authenticity." },
  { title: "NBFCs Submit Offers", time: "24-48 hrs", detail: "Competing lenders share offer terms for selection." },
  { title: "Accept & Get Funded", time: "48 hrs target", detail: "Select best offer and receive disbursement in account." },
];

export function ProcessStickyScroll() {
  return (
    <section className="bg-gradient-to-b from-slate-50 to-white page-section">
      <div className="container-page grid gap-8 lg:grid-cols-2">
        <div className="space-y-3 lg:sticky lg:top-24 lg:self-start">
          <AnimatedReveal>
            <h2 className="heading-section">Process in 5 steps</h2>
            <p className="text-muted mt-2 max-w-xl">
              A tightly controlled flow where each stakeholder action is auditable, role-specific, and time-bound for faster financing outcomes.
            </p>
          </AnimatedReveal>
          {steps.map((step, index) => (
            <AnimatedReveal key={step.title} delay={index * 0.06}>
              <div className="glass-card border-slate-200/80 p-3 text-slate-700 sm:p-4">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-cobalt text-[11px] font-semibold text-white sm:h-7 sm:w-7 sm:text-xs">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 sm:text-base">{step.title}</p>
                    <p className="mt-0.5 text-xs font-semibold text-cobalt">{step.time}</p>
                    <p className="mt-1 text-xs text-slate-600 sm:text-sm">{step.detail}</p>
                  </div>
                </div>
              </div>
            </AnimatedReveal>
          ))}
        </div>
        <AnimatedReveal>
          <div className="glass-card border-blue-100 p-3 sm:min-h-[340px] sm:p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-lg font-semibold text-slate-900 sm:text-xl">Process Overview</h3>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                Pre-Verified Flow
              </span>
            </div>
            <WorkflowDiagramMock variant="process-overview" className="mt-4" />
          </div>
        </AnimatedReveal>
      </div>
    </section>
  );
}
