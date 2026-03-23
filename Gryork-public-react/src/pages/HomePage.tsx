import { HeroDynamicRole } from "../components/HeroDynamicRole";
import { MetricsBanner } from "../components/MetricsBanner";
import { ProblemSolutionBento } from "../components/ProblemSolutionBento";
import { ProcessStickyScroll } from "../components/ProcessStickyScroll";
import { EligibilityChecklist } from "../components/EligibilityChecklist";
import { trackEvent } from "../lib/analytics";
import { AnimatedReveal } from "../components/AnimatedReveal";
import { SectionShell } from "../components/SectionShell";
import { SignatureCard } from "../components/SignatureCard";

export function HomePage() {
  return (
    <>
      <HeroDynamicRole />
      <MetricsBanner />
      <ProblemSolutionBento />
      <ProcessStickyScroll />
      <EligibilityChecklist />
      <SectionShell variant="accent" className="pb-20">
        <div className="container-page">
          <AnimatedReveal>
            <SignatureCard variant="story" className="flex flex-col items-start justify-between gap-4 border-blue-100 bg-gradient-to-r from-white to-blue-50 p-5 sm:p-8 md:flex-row md:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-cobalt">Conversion Ready</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl">Ready to accelerate your cash flow?</h2>
                <p className="text-muted mt-2 text-sm sm:text-base">Get started with role-specific onboarding and faster decision cycles.</p>
              </div>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
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
            </SignatureCard>
          </AnimatedReveal>
        </div>
      </SectionShell>
    </>
  );
}
