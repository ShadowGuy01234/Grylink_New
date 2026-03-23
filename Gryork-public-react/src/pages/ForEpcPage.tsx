import { AnimatedReveal } from "../components/AnimatedReveal";
import { SectionShell } from "../components/SectionShell";
import { SignatureCard } from "../components/SignatureCard";
import { WorkflowDiagramMock } from "../components/WorkflowDiagramMock";
import { Handshake, Gauge, WalletCards, ClipboardCheck, Building2 } from "../shims/lucide-react";

const points = [
  { title: "Strengthen vendor relationships", detail: "Liquidity support improves vendor trust and retention.", tone: "from-cobalt/20 to-blue-100/40", icon: Handshake },
  { title: "Improve project timelines", detail: "Reduce supplier-side cash stress that slows execution.", tone: "from-emerald-100/70 to-cyan-100/40", icon: Gauge },
  { title: "No financial burden on EPC", detail: "NBFC partners handle disbursement; EPC validates only.", tone: "from-violet-100/70 to-cobalt/10", icon: WalletCards },
  { title: "Simple bill validation workflow", detail: "Role-based queue with milestone-first checks.", tone: "from-slate-100/80 to-slate-200/50", icon: ClipboardCheck },
];

const process = [
  "Complete one-time EPC onboarding and KYC",
  "Invite and map sub-contractors to your account",
  "Validate submitted bills from your vendors",
  "Continue your existing payment cycle unchanged",
];

const metrics = [
  { label: "Vendor Continuity", value: "High", note: "liquidity support without schedule shifts", icon: Handshake },
  { label: "Approval Effort", value: "Low", note: "structured digital validation queue", icon: ClipboardCheck },
  { label: "Balance Sheet Impact", value: "Zero", note: "NBFC-funded settlement model", icon: WalletCards },
];

function ForEpcPage() {
  return (
    <SectionShell variant="light">
      <div className="container-page">
        <AnimatedReveal>
          <p className="badge-info mb-4">EPC Validation Track</p>
          <h1 className="heading-hero">For EPCs</h1>
          <p className="text-muted mt-4 max-w-3xl">
            Support subcontractor liquidity while keeping your payment cycle unchanged.
          </p>
          <p className="mt-3 inline-flex rounded-full border border-cobalt/30 bg-cobalt/10 px-3 py-1 text-xs font-semibold text-cobalt">
            Strengthen vendor continuity with zero balance-sheet burden
          </p>
        </AnimatedReveal>
        <div className="mt-6 grid gap-3 lg:grid-cols-4">
          <AnimatedReveal className="lg:col-span-2">
            <SignatureCard variant="story" className="relative overflow-hidden border-cobalt/20 bg-gradient-to-br from-cobalt/10 via-white to-blue-50 p-5">
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-cobalt/10 blur-2xl" />
              <p className="text-xs font-semibold uppercase tracking-wide text-cobalt">EPC Operations Cockpit</p>
              <h3 className="mt-1 text-xl font-semibold text-slate-900">Validation-first financing enablement</h3>
              <p className="mt-1 text-sm text-slate-600">Protect project timelines while supporting subcontractor liquidity through a controlled approval lane.</p>
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
                  EPC Edge
                </div>
                <p className="mt-1 text-base font-semibold text-slate-900">{p.title}</p>
                <p className="mt-2 text-sm text-slate-600">{p.detail}</p>
                <div className="mt-4 flex items-center gap-2 text-xs text-slate-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Operationally aligned with current payment cycle
                </div>
              </SignatureCard>
            </AnimatedReveal>
          ))}
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <SignatureCard variant="workflow" className="h-full p-6">
            <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">Your Role is Simple</h2>
            <ul className="mt-4 space-y-3">
              {process.map((step) => (
                <li key={step} className="text-slate-700">• {step}</li>
              ))}
            </ul>
          </SignatureCard>
          <SignatureCard variant="proof" className="h-full border-blue-100 p-6">
            <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">Approval Flow Preview</h2>
            <p className="text-muted mt-1 text-sm">Role-specific validation queue and controlled approval checkpoints.</p>
            <WorkflowDiagramMock variant="epc-approval" className="mt-4" />
          </SignatureCard>
        </div>
        <AnimatedReveal>
          <SignatureCard variant="story" className="mt-10 flex flex-col items-start justify-between gap-4 border-cobalt/20 bg-gradient-to-r from-cobalt/10 via-white to-blue-50 p-5 sm:flex-row sm:items-center sm:p-6">
            <div>
              <Building2 className="mb-2 h-5 w-5 text-cobalt" />
              <p className="text-xs font-semibold uppercase tracking-wide text-cobalt">EPC Action</p>
              <h3 className="mt-1 text-xl font-semibold text-slate-900">Enable financing without disrupting operations</h3>
              <p className="mt-1 text-sm text-slate-600">Join as EPC and streamline supplier-side liquidity verification.</p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <a href="/contact" className="btn-primary">Partner as EPC</a>
              <a href="/how-it-works" className="btn-secondary">View Process</a>
            </div>
          </SignatureCard>
        </AnimatedReveal>
      </div>
    </SectionShell>
  );
}

export { ForEpcPage };
export default ForEpcPage;
