import { AnimatedReveal } from "../components/AnimatedReveal";
import { SectionShell } from "../components/SectionShell";
import { SignatureCard } from "../components/SignatureCard";
import { WorkflowDiagramMock } from "../components/WorkflowDiagramMock";
import { Bolt, ShieldCheck, BadgePercent, FileCheck2, LayoutDashboard, TrendingUp, TimerReset } from "../shims/lucide-react";

const benefits = [
  {
    title: "Quick Funding",
    description: "Get working capital within 48 hours of bill validation. No more waiting 90-180 days.",
    badge: "Speed",
    tone: "from-cobalt/20 to-cyan-100/40",
    icon: Bolt,
  },
  {
    title: "Secure Process",
    description: "End-to-end encrypted platform with complete data security and compliance.",
    badge: "Trust",
    tone: "from-emerald-100/70 to-teal-100/40",
    icon: ShieldCheck,
  },
  {
    title: "Competitive Rates",
    description: "Access multiple NBFCs competing for your bills, ensuring best discount rates.",
    badge: "Yield",
    tone: "from-violet-100/70 to-cobalt/10",
    icon: BadgePercent,
  },
  {
    title: "Minimal Documentation",
    description: "Simple KYC and one-time onboarding. Upload bills digitally without paperwork.",
    badge: "Ops",
    tone: "from-slate-100/80 to-slate-200/50",
    icon: FileCheck2,
  },
  {
    title: "Digital Platform",
    description: "Track all your bills, offers, and payments from a single dashboard.",
    badge: "Control",
    tone: "from-cyan-100/60 to-blue-100/30",
    icon: LayoutDashboard,
  },
  {
    title: "Build Credit History",
    description: "Regular repayments help build your credit profile for better future rates.",
    badge: "Growth",
    tone: "from-emerald-100/70 to-lime-100/40",
    icon: TrendingUp,
  },
];

const steps = [
  "Register on Gryork with KYC and business details",
  "Submit your validated EPC bills with supporting documents",
  "EPC verifies work completion and bill authenticity",
  "NBFCs submit competitive discounting offers",
  "Accept best offer and get funded in your bank account",
];

const faqs = [
  {
    q: "What is the minimum bill amount?",
    a: "The minimum bill amount for discounting is typically ₹5 lakhs, subject to EPC validation.",
  },
  {
    q: "How long does funding take?",
    a: "Once your EPC validates and you accept an offer, disbursement usually happens within 48 hours.",
  },
];

const highlights = [
  { label: "Funding speed", value: "48 hrs target", note: "post validation", icon: TimerReset },
  { label: "Lender competition", value: "50+ NBFCs", note: "better quote discovery" },
  { label: "Collateral", value: "Zero", note: "receivable-backed model" },
];

export function ForSubcontractorsPage() {
  return (
    <SectionShell variant="light">
      <div className="container-page">
        <AnimatedReveal>
          <p className="badge-info mb-4">Sub-Contractor Track</p>
          <h1 className="heading-hero">For Sub-Contractors</h1>
          <p className="text-muted mt-4 max-w-3xl">
            Convert validated EPC bills into working capital in 48 hours.
          </p>
          <p className="mt-3 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            Faster liquidity without collateral burden
          </p>
        </AnimatedReveal>
        <div className="mt-6 grid gap-3 lg:grid-cols-4">
          <AnimatedReveal className="lg:col-span-2">
            <SignatureCard variant="story" className="relative overflow-hidden border-cobalt/20 bg-gradient-to-br from-cobalt/10 via-white to-emerald-50 p-5">
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-cobalt/10 blur-2xl" />
              <p className="text-xs font-semibold uppercase tracking-wide text-cobalt">Funding Command Center</p>
                <h3 className="mt-1 text-xl font-semibold text-slate-900">Faster conversion from bill to liquidity</h3>
                <p className="mt-1 text-sm text-slate-600">Designed for subcontractors who need predictable cash movement without collateral.</p>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {highlights.map((item) => (
                  <div key={item.label} className="rounded-lg border border-white/80 bg-white/80 p-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{item.label}</p>
                    <p className="mt-1 text-base font-bold text-slate-900">{item.value}</p>
                  </div>
                ))}
              </div>
            </SignatureCard>
          </AnimatedReveal>
          {highlights.map((item, index) => (
            <AnimatedReveal key={item.label} delay={index * 0.06}>
              <SignatureCard variant="metric" className="h-full border-slate-200/80 bg-gradient-to-b from-white to-slate-50">
                {item.icon && <item.icon className="h-4 w-4 text-cobalt" />}
                <p className="text-xs font-semibold uppercase tracking-wide text-cobalt">{item.label}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{item.value}</p>
                <p className="mt-1 text-xs text-slate-500">{item.note}</p>
                <div className="mt-3 h-1.5 rounded-full bg-slate-100">
                  <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-cobalt to-emerald-400" />
                </div>
              </SignatureCard>
            </AnimatedReveal>
          ))}
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b, index) => (
            <AnimatedReveal key={b.title} delay={index * 0.05}>
              <SignatureCard variant="story" className={`group relative h-full overflow-hidden border-slate-200/80 bg-gradient-to-b ${b.tone} p-5 transition duration-300 hover:-translate-y-1 hover:shadow-xl`}>
                <div className="absolute -right-6 -top-6 h-16 w-16 rounded-full bg-white/60 blur-xl" />
                <div className="inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-cobalt">
                  <b.icon className="h-3.5 w-3.5" />
                  {b.badge}
                </div>
                <h3 className="mt-1 text-lg font-semibold text-slate-900">{b.title}</h3>
                <p className="text-muted mt-2">{b.description}</p>
                <div className="mt-4 flex items-center gap-2 text-xs text-slate-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Workflow aligned with EPC validation cycle
                </div>
              </SignatureCard>
            </AnimatedReveal>
          ))}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <SignatureCard variant="workflow" className="h-full p-6">
            <h2 className="text-2xl font-semibold text-slate-900">How to Get Funded</h2>
            <ol className="mt-4 space-y-3">
              {steps.map((step, i) => (
                <li key={step} className="flex gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-cobalt text-xs font-semibold text-white">
                    {i + 1}
                  </span>
                  <span className="text-slate-700">{step}</span>
                </li>
              ))}
            </ol>
          </SignatureCard>
          <SignatureCard variant="proof" className="h-full border-blue-100 p-4 sm:p-5">
            <h3 className="text-lg font-semibold text-slate-900">Live Funding Snapshot</h3>
            <p className="text-muted mt-1 text-sm">Track invoice status, offer quality, and disbursement readiness.</p>
            <WorkflowDiagramMock variant="subcontractor-bill" className="mt-3" />
          </SignatureCard>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {faqs.map((item) => (
            <SignatureCard key={item.q} variant="proof" className="p-5">
              <h3 className="font-semibold text-slate-900">{item.q}</h3>
              <p className="text-muted mt-2 text-sm">{item.a}</p>
            </SignatureCard>
          ))}
        </div>

        <AnimatedReveal>
          <SignatureCard variant="story" className="mt-10 flex flex-col items-start justify-between gap-4 border-cobalt/20 bg-gradient-to-r from-cobalt/10 via-white to-emerald-50 p-5 sm:flex-row sm:items-center sm:p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-cobalt">Conversion Path</p>
              <h3 className="mt-1 text-xl font-semibold text-slate-900">Ready to fund your next invoice cycle?</h3>
              <p className="mt-1 text-sm text-slate-600">Start early onboarding and move to verified funding flow.</p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <a href="/early-access" className="btn-primary">Get Started</a>
              <a href="/contact" className="btn-secondary">Talk to Team</a>
            </div>
          </SignatureCard>
        </AnimatedReveal>
      </div>
    </SectionShell>
  );
}
