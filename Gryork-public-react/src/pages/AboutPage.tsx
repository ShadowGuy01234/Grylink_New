import { WorkflowDiagramMock } from "../components/WorkflowDiagramMock";
import { SectionShell } from "../components/SectionShell";
import { SignatureCard } from "../components/SignatureCard";
import { AnimatedReveal } from "../components/AnimatedReveal";

export function AboutPage() {
  const stats = [
    { value: "50+", label: "NBFCs in network" },
    { value: "48 hrs", label: "Target funding time" },
    { value: "100%", label: "Digital process" },
    { value: "Zero", label: "Collateral required" },
  ];

  const values = [
    {
      title: "Trust & Transparency",
      description: "We build long-term relationships through clear process visibility and fair stakeholder outcomes.",
    },
    {
      title: "Security First",
      description: "Every transaction and document flow is designed with enterprise-grade controls and auditability.",
    },
    {
      title: "Execution-led Innovation",
      description: "We simplify infrastructure financing through practical digital products that work in the real world.",
    },
    {
      title: "Ecosystem Partnership",
      description: "Sub-contractors, EPCs, and NBFCs grow together when liquidity and trust move in sync.",
    },
  ];

  const journey = [
    { year: "2025", title: "Foundation", description: "Gryork started with one clear mission: reduce cash-flow stress in infra supply chains." },
    { year: "2026", title: "Platform Expansion", description: "Scaled onboarding for subcontractors, EPCs, and financing partners." },
    { year: "Now", title: "Institutional Growth", description: "Building a reliable, data-driven marketplace for validated receivable funding." },
  ];

  return (
    <SectionShell variant="light">
      <div className="mx-auto max-w-6xl px-4">
        <AnimatedReveal>
          <p className="badge-info mb-4">Company Overview</p>
          <h1 className="heading-hero">About Gryork</h1>
          <p className="text-muted mt-4 max-w-3xl">
            Gryork bridges infrastructure subcontractors, EPCs, and NBFCs through a trusted digital marketplace.
          </p>
        </AnimatedReveal>

        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((stat) => (
            <SignatureCard key={stat.label} variant="metric" className="text-center">
              <p className="text-2xl font-bold text-cobalt">{stat.value}</p>
              <p className="text-muted mt-1 text-sm">{stat.label}</p>
            </SignatureCard>
          ))}
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <SignatureCard variant="story" className="p-6">
            <h2 className="text-xl font-semibold text-slate-900">Our Mission</h2>
            <p className="text-muted mt-2">
              Empower infrastructure growth with transparent, secure, and predictable working capital rails.
            </p>
          </SignatureCard>
          <SignatureCard variant="story" className="p-6">
            <h2 className="text-xl font-semibold text-slate-900">Our Values</h2>
            <p className="text-muted mt-2">Trust, security, execution discipline, and stakeholder partnership.</p>
          </SignatureCard>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {values.map((value) => (
            <SignatureCard key={value.title} variant="proof" className="p-6">
              <h3 className="font-semibold text-slate-900">{value.title}</h3>
              <p className="text-muted mt-2">{value.description}</p>
            </SignatureCard>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <SignatureCard variant="workflow" className="p-6">
            <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">Our Journey</h2>
            <div className="mt-4 space-y-4">
              {journey.map((item) => (
                <div key={item.year} className="rounded-xl border border-slate-100 bg-white p-4">
                  <p className="text-sm font-semibold text-cobalt">{item.year}</p>
                  <p className="mt-1 font-semibold text-slate-900">{item.title}</p>
                  <p className="text-muted mt-1 text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </SignatureCard>
          <SignatureCard variant="proof" className="p-6">
            <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">Who We Serve</h2>
            <WorkflowDiagramMock variant="ecosystem-map" className="mt-4" />
            <p className="text-muted mt-4 text-sm">
              We align incentives across sub-contractors, EPCs, and NBFCs to keep projects running and payments predictable.
            </p>
          </SignatureCard>
        </div>
      </div>
    </SectionShell>
  );
}
