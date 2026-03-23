import { AnimatedReveal } from "./AnimatedReveal";
import { SectionShell } from "./SectionShell";
import { SignatureCard } from "./SignatureCard";

const metrics = [
  { label: "Target Funding", value: "48 hrs", note: "post verification and offer acceptance" },
  { label: "Digital Process", value: "100%", note: "paperless onboarding and workflow tracking" },
  { label: "Collateral", value: "Zero", note: "EPC-validated receivable-backed structure" },
];

export function MetricsBanner() {
  return (
    <SectionShell variant="accent" className="border-y border-slate-200 py-10">
      <div className="container-page grid grid-cols-1 gap-4 sm:grid-cols-3">
        {metrics.map((metric, index) => (
          <AnimatedReveal key={metric.label} delay={index * 0.07}>
            <SignatureCard variant="metric" className="text-center">
              <p className="text-3xl font-bold text-slate-900">{metric.value}</p>
              <p className="mt-1 text-sm font-semibold text-cobalt">{metric.label}</p>
              <p className="mt-2 text-xs text-slate-500">{metric.note}</p>
            </SignatureCard>
          </AnimatedReveal>
        ))}
      </div>
    </SectionShell>
  );
}
