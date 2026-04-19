type DiagramVariant =
  | "process-overview"
  | "subcontractor-bill"
  | "epc-approval"
  | "nbfc-offers"
  | "ecosystem-map"
  | "community-network"
  | "early-access-funnel";

type WorkflowDiagramMockProps = {
  variant: DiagramVariant;
  className?: string;
};

type DiagramConfig = {
  title: string;
  subtitle: string;
  kpis: { label: string; value: string; tone: string }[];
  stages: { title: string; status: string; detail: string }[];
  footer: string;
};

const variantConfig: Record<DiagramVariant, DiagramConfig> = {
  "process-overview": {
    title: "5-Stage Financing Rail",
    subtitle: "KYC -> Bill Upload -> EPC Verify -> NBFC Bid -> Disbursement",
    kpis: [
      { label: "Cycle Speed", value: "48 hrs target", tone: "text-emerald-700 bg-emerald-50 border-emerald-200" },
      { label: "Validation", value: "3-way match", tone: "text-cobalt bg-cobalt/10 border-cobalt/30" },
      { label: "Traceability", value: "Audit-ready", tone: "text-slate-700 bg-slate-50 border-slate-200" },
    ],
    stages: [
      { title: "KYC", status: "Completed", detail: "Business and identity checks verified" },
      { title: "Bill Upload", status: "Completed", detail: "RA bill and Requesting Form submitted" },
      { title: "EPC Verify", status: "In Review", detail: "PO/GRN work-match validation running" },
      { title: "NBFC Bid", status: "Queued", detail: "Offer window opens after EPC verify" },
      { title: "Disburse", status: "Pending", detail: "Triggered after acceptance" },
    ],
    footer: "Live status simulation for full-lifecycle visibility",
  },
  "subcontractor-bill": {
    title: "Bill Funding Control Board",
    subtitle: "Invoice value, lender competition, and payout readiness in one panel",
    kpis: [
      { label: "Invoice", value: "₹75,00,000", tone: "text-cobalt bg-cobalt/10 border-cobalt/30" },
      { label: "Best Bid", value: "14.5% p.a.", tone: "text-emerald-700 bg-emerald-50 border-emerald-200" },
      { label: "Confidence", value: "High", tone: "text-slate-700 bg-slate-50 border-slate-200" },
    ],
    stages: [
      { title: "Document Upload", status: "Completed", detail: "PAN, GST, invoice and project docs uploaded" },
      { title: "EPC Validation", status: "Completed", detail: "Milestone completion and quantity confirmed" },
      { title: "Offer Discovery", status: "Live", detail: "Multiple lender quotes received in dashboard" },
      { title: "Acceptance", status: "Action Needed", detail: "Choose offer and lock disbursement terms" },
      { title: "Payout", status: "Ready", detail: "Fund transfer initiated post acceptance" },
    ],
    footer: "Built for faster liquidity without collateral pressure",
  },
  "epc-approval": {
    title: "EPC Validation Desk",
    subtitle: "Operational queue for vendor-linked invoice verification",
    kpis: [
      { label: "Pending Cases", value: "12", tone: "text-amber-700 bg-amber-50 border-amber-200" },
      { label: "Avg Verify Time", value: "1.4 days", tone: "text-cobalt bg-cobalt/10 border-cobalt/30" },
      { label: "Impact", value: "High Vendor Retention", tone: "text-emerald-700 bg-emerald-50 border-emerald-200" },
    ],
    stages: [
      { title: "Request Intake", status: "Completed", detail: "Mapped vendor request routed automatically" },
      { title: "Work Match", status: "Completed", detail: "Execution progress matched with bill claim" },
      { title: "PO/GRN Check", status: "In Review", detail: "Contract artifacts and quantities validated" },
      { title: "Approve", status: "Ready", detail: "Authorize verified claim for lender bidding" },
      { title: "Release", status: "Queued", detail: "Vendor proceeds without changing EPC payment cycle" },
    ],
    footer: "Structured approval that protects timelines and trust",
  },
  "nbfc-offers": {
    title: "NBFC Offer Intelligence Board",
    subtitle: "Risk-aware pricing and tenure comparison on verified receivables",
    kpis: [
      { label: "Deal Quality", value: "Pre-verified", tone: "text-emerald-700 bg-emerald-50 border-emerald-200" },
      { label: "Win Rate", value: "Top 3 bids", tone: "text-cobalt bg-cobalt/10 border-cobalt/30" },
      { label: "Settlement Clarity", value: "EPC-backed", tone: "text-slate-700 bg-slate-50 border-slate-200" },
    ],
    stages: [
      { title: "Deal Feed", status: "Live", detail: "Context-rich opportunities in your mandate range" },
      { title: "Risk Lens", status: "Completed", detail: "RMT summary and execution metadata available" },
      { title: "Rate Quote", status: "Action Needed", detail: "Submit competitive discounting terms" },
      { title: "Tenure", status: "Configured", detail: "Align duration to project and repayment cycle" },
      { title: "Award", status: "Pending", detail: "Await acceptance to trigger disbursement" },
    ],
    footer: "Higher confidence lending with cleaner underwriting signals",
  },
  "ecosystem-map": {
    title: "Stakeholder Ecosystem",
    subtitle: "Sub-contractors, EPCs, and NBFCs operating through one trust layer",
    kpis: [
      { label: "Participants", value: "3-sided marketplace", tone: "text-cobalt bg-cobalt/10 border-cobalt/30" },
      { label: "Security", value: "End-to-end encrypted", tone: "text-emerald-700 bg-emerald-50 border-emerald-200" },
      { label: "Governance", value: "Role-scoped actions", tone: "text-slate-700 bg-slate-50 border-slate-200" },
    ],
    stages: [
      { title: "Sub-Contractor", status: "Demand", detail: "Needs working capital against executed work" },
      { title: "EPC", status: "Validation", detail: "Confirms completion and claim legitimacy" },
      { title: "NBFC", status: "Funding", detail: "Quotes and disburses on verified opportunity" },
      { title: "Audit Trail", status: "Continuous", detail: "Every decision point logged and traceable" },
      { title: "Settlement", status: "Controlled", detail: "Repayment aligned to EPC cycle" },
    ],
    footer: "Aligned incentives across the infrastructure finance loop",
  },
  "community-network": {
    title: "Community Network Grid",
    subtitle: "Knowledge, updates, and operator collaboration across channels",
    kpis: [
      { label: "Channels", value: "4 active platforms", tone: "text-cobalt bg-cobalt/10 border-cobalt/30" },
      { label: "Content", value: "Practical explainers", tone: "text-emerald-700 bg-emerald-50 border-emerald-200" },
      { label: "Audience", value: "Infra + Finance operators", tone: "text-slate-700 bg-slate-50 border-slate-200" },
    ],
    stages: [
      { title: "Awareness", status: "Live", detail: "Discover workflows and financing concepts" },
      { title: "Learning", status: "Live", detail: "Consume explainers and product walkthroughs" },
      { title: "Engagement", status: "Live", detail: "Discuss with ecosystem participants" },
      { title: "Feedback", status: "Open", detail: "Share field insights for roadmap refinement" },
      { title: "Adoption", status: "Growing", detail: "Convert interest into platform onboarding" },
    ],
    footer: "Community-led trust and product education",
  },
  "early-access-funnel": {
    title: "Early Access Journey",
    subtitle: "Register interest -> Priority onboarding -> Guided activation",
    kpis: [
      { label: "Queue Type", value: "Priority", tone: "text-emerald-700 bg-emerald-50 border-emerald-200" },
      { label: "Support", value: "Dedicated", tone: "text-cobalt bg-cobalt/10 border-cobalt/30" },
      { label: "Outcome", value: "Faster go-live", tone: "text-slate-700 bg-slate-50 border-slate-200" },
    ],
    stages: [
      { title: "Sign-up", status: "Completed", detail: "Role and interest captured" },
      { title: "Screening", status: "Completed", detail: "Use-case fit and readiness checked" },
      { title: "Priority Queue", status: "Active", detail: "Fast-track onboarding slot reserved" },
      { title: "Guided KYC", status: "Queued", detail: "Support team assists setup completion" },
      { title: "Go Live", status: "Pending", detail: "Role-based workspace unlocked" },
    ],
    footer: "Designed to reduce onboarding friction and time-to-value",
  },
};

const statusTone: Record<string, string> = {
  Completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Live: "border-cobalt/30 bg-cobalt/10 text-cobalt",
  "In Review": "border-amber-200 bg-amber-50 text-amber-700",
  Queued: "border-slate-200 bg-slate-50 text-slate-700",
  Pending: "border-slate-200 bg-slate-50 text-slate-700",
  "Action Needed": "border-orange-200 bg-orange-50 text-orange-700",
  Ready: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Configured: "border-cyan-200 bg-cyan-50 text-cyan-700",
  Demand: "border-slate-200 bg-slate-50 text-slate-700",
  Validation: "border-cobalt/30 bg-cobalt/10 text-cobalt",
  Funding: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Continuous: "border-slate-200 bg-slate-50 text-slate-700",
  Controlled: "border-slate-200 bg-slate-50 text-slate-700",
  Open: "border-cobalt/30 bg-cobalt/10 text-cobalt",
  Growing: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Active: "border-cobalt/30 bg-cobalt/10 text-cobalt",
};

export function WorkflowDiagramMock({ variant, className = "" }: WorkflowDiagramMockProps) {
  const config = variantConfig[variant];

  return (
    <div className={`rounded-xl border border-slate-100 bg-white p-3 shadow-sm sm:p-4 ${className}`}>
      <p className="text-sm font-semibold text-slate-900 sm:text-base">{config.title}</p>
      <p className="mt-1 text-xs text-slate-500 sm:text-sm">{config.subtitle}</p>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {config.kpis.map((kpi) => (
          <div key={kpi.label} className={`rounded-lg border px-3 py-2 ${kpi.tone}`}>
            <p className="text-[11px] font-medium">{kpi.label}</p>
            <p className="mt-0.5 text-sm font-semibold sm:text-base">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto pb-1">
        <div className="space-y-2 sm:hidden">
          {config.stages.map((stage, index) => (
            <article key={stage.title} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] font-semibold text-cobalt">STEP {index + 1}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{stage.title}</p>
                </div>
                <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusTone[stage.status] ?? "border-slate-200 bg-slate-50 text-slate-700"}`}>
                  {stage.status}
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">{stage.detail}</p>
            </article>
          ))}
        </div>
        <div className="hidden min-w-[920px] gap-2 sm:grid sm:min-w-0 sm:grid-cols-2 lg:grid-cols-5">
          {config.stages.map((stage, index) => (
            <article key={stage.title} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
              <p className="text-[10px] font-semibold text-cobalt">STEP {index + 1}</p>
              <p className="mt-1 text-xs font-semibold text-slate-900 sm:text-sm">{stage.title}</p>
              <span className={`mt-2 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusTone[stage.status] ?? "border-slate-200 bg-slate-50 text-slate-700"}`}>
                {stage.status}
              </span>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-600">{stage.detail}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-3 h-2 rounded-full bg-slate-100">
        <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-cobalt to-emerald-500" />
      </div>
      <p className="mt-1 text-[11px] text-emerald-700">{config.footer}</p>
    </div>
  );
}
