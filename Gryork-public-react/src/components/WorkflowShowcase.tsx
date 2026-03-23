import { AnimatedReveal } from "./AnimatedReveal";
import { SignatureCard } from "./SignatureCard";

type WorkflowShowcaseProps = {
  title: string;
  subtitle: string;
  role: "subcontractor" | "epc" | "nbfc";
};

const flowStepsByRole: Record<
  "subcontractor" | "epc" | "nbfc",
  { no: string; title: string; hint: string; status: string }[]
> = {
  subcontractor: [
    { no: "1", title: "KYC Verification", hint: "Upload business documents", status: "Completed" },
    { no: "2", title: "Bill Submission", hint: "Submit invoice & project details", status: "Completed" },
    { no: "3", title: "EPC Verification", hint: "Work and quantity validation", status: "In Review" },
    { no: "4", title: "NBFC Bidding", hint: "Competing lender offers", status: "Live" },
    { no: "5", title: "Disbursement", hint: "Funds credited to account", status: "Queued" },
  ],
  epc: [
    { no: "1", title: "EPC Onboarding", hint: "Compliance and organization setup", status: "Completed" },
    { no: "2", title: "Vendor Mapping", hint: "Map subcontractors to contracts", status: "Completed" },
    { no: "3", title: "Work Validation", hint: "Cross-check milestones and claims", status: "In Review" },
    { no: "4", title: "Approval Release", hint: "Approve verified bill to market", status: "Action Needed" },
    { no: "5", title: "Cycle Continuity", hint: "Keep your payment cycle unchanged", status: "Ready" },
  ],
  nbfc: [
    { no: "1", title: "Partner Onboarding", hint: "RBI/compliance documentation", status: "Completed" },
    { no: "2", title: "Mandate Setup", hint: "Set sector, tenure, and ticket filters", status: "Configured" },
    { no: "3", title: "Deal Feed", hint: "Review pre-verified opportunities", status: "Live" },
    { no: "4", title: "Quote Bids", hint: "Submit competitive pricing", status: "Action Needed" },
    { no: "5", title: "Award & Disburse", hint: "Disburse on accepted offers", status: "Pending" },
  ],
};

const roleContext: Record<"subcontractor" | "epc" | "nbfc", { label: string; value: string }> = {
  subcontractor: { label: "Primary user", value: "Submit and accept best funding offer" },
  epc: { label: "Primary user", value: "Validate work and unlock vendor liquidity" },
  nbfc: { label: "Primary user", value: "Bid on verified invoices and disburse" },
};

const roleHeader: Record<"subcontractor" | "epc" | "nbfc", { metric: string; note: string }> = {
  subcontractor: { metric: "48 hrs target", note: "funding speed post verification" },
  epc: { metric: "1-2 days", note: "validation window for claim checks" },
  nbfc: { metric: "24-48 hrs", note: "competitive quote submission cycle" },
};

const statusTone: Record<string, string> = {
  Completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  "In Review": "border-amber-200 bg-amber-50 text-amber-700",
  Live: "border-cobalt/30 bg-cobalt/10 text-cobalt",
  Queued: "border-slate-200 bg-slate-50 text-slate-700",
  Ready: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Configured: "border-cyan-200 bg-cyan-50 text-cyan-700",
  Pending: "border-slate-200 bg-slate-50 text-slate-700",
  "Action Needed": "border-orange-200 bg-orange-50 text-orange-700",
};

export function WorkflowShowcase({ title, subtitle, role }: WorkflowShowcaseProps) {
  const context = roleContext[role];
  const header = roleHeader[role];
  const flowSteps = flowStepsByRole[role];

  return (
    <AnimatedReveal>
      <SignatureCard variant="story" className="border-blue-100 p-3 sm:p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">{title}</h2>
            <p className="text-muted mt-1 text-sm">{subtitle}</p>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
            <p className="text-xs font-semibold text-emerald-700">{header.metric}</p>
            <p className="text-[11px] text-emerald-700/80">{header.note}</p>
          </div>
        </div>
        <div className="mt-3 rounded-lg border border-cobalt/20 bg-cobalt/5 px-3 py-2 text-xs text-cobalt">
          <span className="font-semibold">{context.label}: </span>
          {context.value}
        </div>
        <p className="mt-2 text-xs text-slate-500 sm:hidden">Swipe to view all 5 workflow stages</p>

        <div className="mt-4 overflow-x-auto pb-2">
          <div className="flex min-w-[980px] gap-3 sm:min-w-0 sm:grid sm:grid-cols-2 lg:grid-cols-5">
            {flowSteps.map((step) => (
              <article key={step.no} className="card-workflow-step w-[185px] sm:w-auto">
                <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-cobalt text-xs font-semibold text-white">
                  {step.no}
                </div>
                <p className="mt-2 text-sm font-semibold text-slate-900">{step.title}</p>
                <p className="mt-1 text-xs text-slate-500">{step.hint}</p>
                <span className={`mt-3 inline-flex rounded-lg border px-2 py-1 text-[11px] font-medium ${statusTone[step.status]}`}>
                  {step.status}
                </span>
              </article>
            ))}
          </div>
        </div>
      </SignatureCard>
    </AnimatedReveal>
  );
}
