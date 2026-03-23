import { AnimatedReveal } from "./AnimatedReveal";
import { SignatureCard } from "./SignatureCard";

type SnapshotShowcaseProps = {
  title: string;
  subtitle: string;
  role: "subcontractor" | "epc" | "nbfc";
};

const roleSnapshot: Record<
  "subcontractor" | "epc" | "nbfc",
  { headline: string; amount: string; status: string; extra: string; badge: string }
> = {
  subcontractor: {
    headline: "Payment Disbursed",
    amount: "₹75,00,000",
    status: "Offer accepted and credited",
    extra: "UTR shared instantly for reconciliation",
    badge: "Best offer selected",
  },
  epc: {
    headline: "Bill Verified",
    amount: "₹75,00,000",
    status: "Work and invoice validation complete",
    extra: "Vendor can proceed for NBFC bidding",
    badge: "Validation complete",
  },
  nbfc: {
    headline: "Bid Submitted",
    amount: "14.5% p.a.",
    status: "Competitive quote shared on verified case",
    extra: "Awaiting supplier acceptance",
    badge: "Live in marketplace",
  },
};

export function SnapshotShowcase({ title, subtitle, role }: SnapshotShowcaseProps) {
  const data = roleSnapshot[role];

  return (
    <AnimatedReveal>
      <SignatureCard variant="proof" className="p-4 sm:p-6">
        <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">{title}</h2>
        <p className="text-muted mt-1 text-sm">{subtitle}</p>

        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">{data.headline}</p>
              <p className="mt-1 text-3xl font-bold text-emerald-600">{data.amount}</p>
            </div>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              {data.badge}
            </span>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-start gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              <span className="mt-1 h-2 w-2 rounded-full bg-cobalt" />
              {data.status}
            </div>
            <div className="flex items-start gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
              {data.extra}
            </div>
          </div>

          <button className="mt-4 w-full rounded-lg bg-cobalt px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90">
            Continue Process
          </button>
        </div>
      </SignatureCard>
    </AnimatedReveal>
  );
}
