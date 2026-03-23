import { AnimatedReveal } from "../components/AnimatedReveal";
import { SectionShell } from "../components/SectionShell";
import { SignatureCard } from "../components/SignatureCard";
import { WorkflowDiagramMock } from "../components/WorkflowDiagramMock";
import { LineChart, ShieldCheck, Banknote, Clock3, SlidersHorizontal } from "lucide-react";

const points = [
  { title: "Pre-verified infrastructure deals", detail: "Curated deal feed with operational and document context.", tone: "from-emerald-100/70 to-cyan-100/40", icon: ShieldCheck },
  { title: "RMT risk report on each case", detail: "Improved underwriting confidence before pricing.", tone: "from-cobalt/20 to-blue-100/40", icon: LineChart },
  { title: "EPC-backed repayment structure", detail: "Recovery logic aligned with validated EPC cycles.", tone: "from-violet-100/70 to-cobalt/10", icon: Banknote },
  { title: "Real-time status tracking", detail: "Bid, acceptance, and settlement visibility in one lane.", tone: "from-slate-100/80 to-slate-200/50", icon: Clock3 },
];

const nbfcFlow = [
  "Register and onboard with compliance details",
  "Set deal size, sector, and risk preferences",
  "Receive pre-verified CWCRF opportunities",
  "Submit offers and manage disbursement cycle",
];

const metrics = [
  { label: "Deal Quality", value: "Pre-Verified", note: "execution and bill context attached", icon: ShieldCheck },
  { label: "Offer Cycle", value: "24-48 hrs", note: "target window for competitive bidding", icon: Clock3 },
  { label: "Portfolio Fit", value: "Configurable", note: "ticket size, tenure, sector filters", icon: SlidersHorizontal },
];

export function ForNbfcPage() {
  return (
    <SectionShell variant="light">
      <div className="container-page">
        <AnimatedReveal>
          <p className="badge-info mb-4">NBFC Underwriting Track</p>
          <h1 className="heading-hero">For NBFCs</h1>
          <p className="text-muted mt-4 max-w-3xl">
            Access structured opportunities with complete verification context.
          </p>
          <p className="mt-3 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            Better underwriting inputs with verified infrastructure receivables
          </p>
        </AnimatedReveal>
        <div className="mt-6 grid gap-3 lg:grid-cols-4">
          <AnimatedReveal className="lg:col-span-2">
            <SignatureCard variant="story" className="relative overflow-hidden border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-cobalt/10 p-5">
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-200/30 blur-2xl" />
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Lender Intelligence Hub</p>
              <h3 className="mt-1 text-xl font-semibold text-slate-900">Risk-aware bidding with cleaner signal quality</h3>
              <p className="mt-1 text-sm text-slate-600">Evaluate verified infrastructure receivables and compete with precision on pricing and tenure.</p>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {metrics.map((metric) => (
                  <div key={metric.label} className="rounded-lg border border-white/80 bg-white/80 p-2">
                    <metric.icon className="h-3.5 w-3.5 text-cobalt" />
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{metric.label}</p>
                    <p className="mt-1 text-base font-bold text-slate-900">{metric.value}</p>
                  </div>
                ))}
              </div>
            </SignatureCard>
          </AnimatedReveal>
          {metrics.map((metric, index) => (
            <AnimatedReveal key={metric.label} delay={index * 0.06}>
              <SignatureCard variant="metric" className="h-full border-slate-200/80 bg-gradient-to-b from-white to-slate-50">
                <metric.icon className="h-4 w-4 text-cobalt" />
                <p className="text-xs font-semibold uppercase tracking-wide text-cobalt">{metric.label}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{metric.value}</p>
                <p className="mt-1 text-xs text-slate-500">{metric.note}</p>
                <div className="mt-3 h-1.5 rounded-full bg-slate-100">
                  <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-cobalt to-emerald-400" />
                </div>
              </SignatureCard>
            </AnimatedReveal>
          ))}
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {points.map((p, index) => (
            <AnimatedReveal key={p.title} delay={index * 0.06}>
              <SignatureCard variant="story" className={`group relative overflow-hidden border-slate-200/80 bg-gradient-to-b ${p.tone} p-6 text-slate-700 transition duration-300 hover:-translate-y-1 hover:shadow-xl`}>
                <div className="absolute -right-6 -top-6 h-16 w-16 rounded-full bg-white/60 blur-xl" />
                <div className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-cobalt">
                  <p.icon className="h-3.5 w-3.5" />
                  Lender Advantage
                </div>
                <p className="mt-1 text-base font-semibold text-slate-900">{p.title}</p>
                <p className="mt-2 text-sm text-slate-600">{p.detail}</p>
                <div className="mt-4 flex items-center gap-2 text-xs text-slate-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Built for institutional underwriting discipline
                </div>
              </SignatureCard>
            </AnimatedReveal>
          ))}
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <SignatureCard variant="workflow" className="h-full p-6">
            <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">NBFC Journey</h2>
            <ul className="mt-4 space-y-3">
              {nbfcFlow.map((step) => (
                <li key={step} className="text-slate-700">• {step}</li>
              ))}
            </ul>
          </SignatureCard>
          <SignatureCard variant="proof" className="h-full border-blue-100 p-6">
            <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">Offer Table Preview</h2>
            <p className="text-muted mt-1 text-sm">Comparative bid board for verified receivables and risk-aligned pricing.</p>
            <WorkflowDiagramMock variant="nbfc-offers" className="mt-4" />
          </SignatureCard>
        </div>
        <AnimatedReveal>
          <SignatureCard variant="story" className="mt-10 flex flex-col items-start justify-between gap-4 border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-cobalt/10 p-5 sm:flex-row sm:items-center sm:p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Lender Onboarding</p>
              <h3 className="mt-1 text-xl font-semibold text-slate-900">Compete on high-quality infra receivable deals</h3>
              <p className="mt-1 text-sm text-slate-600">Apply as partner and access structured, verified opportunities.</p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <a href="/contact" className="btn-primary">Apply for Partnership</a>
              <a href="/how-it-works" className="btn-secondary">See Workflow</a>
            </div>
          </SignatureCard>
        </AnimatedReveal>
      </div>
    </SectionShell>
  );
}
