import { HeroDynamicRole } from "../components/HeroDynamicRole";
import { MetricsBanner } from "../components/MetricsBanner";
import { ProblemSolutionBento } from "../components/ProblemSolutionBento";
import { ProcessStickyScroll } from "../components/ProcessStickyScroll";
import { EligibilityChecklist } from "../components/EligibilityChecklist";
import { trackEvent } from "../lib/analytics";

export function HomePage() {
  return (
    <>
      <HeroDynamicRole />
      <MetricsBanner />
      <ProblemSolutionBento />
      <ProcessStickyScroll />
      <EligibilityChecklist />
      <section className="bg-slate-50 pb-20">
        <div className="container-page">
          <div className="glass-card flex flex-col items-start justify-between gap-4 p-8 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Ready to accelerate your cash flow?</h2>
              <p className="text-muted mt-2">Get started with role-specific onboarding and faster decision cycles.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="/early-access"
                className="btn-primary"
                onClick={() =>
                  trackEvent({
                    eventName: "cta_click",
                    category: "conversion",
                    properties: { section: "homepage_bottom", cta: "Get Early Access", href: "/early-access" },
                  })
                }
              >
                Get Early Access
              </a>
              <a
                href="/contact"
                className="btn-secondary"
                onClick={() =>
                  trackEvent({
                    eventName: "cta_click",
                    category: "conversion",
                    properties: { section: "homepage_bottom", cta: "Talk to Sales", href: "/contact" },
                  })
                }
              >
                Talk to Sales
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
