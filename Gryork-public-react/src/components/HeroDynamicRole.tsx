import { motion } from "framer-motion";
import { useRoleStore, type ActiveRole } from "../store/roleStore";
import { trackEvent } from "../lib/analytics";
import { AnimatedReveal } from "./AnimatedReveal";
import { SectionShell } from "./SectionShell";
import { SignatureCard } from "./SignatureCard";

const roleContent: Record<ActiveRole, { title: string; subtitle: string; cta: string }> = {
  subcontractor: {
    title: "Stop Waiting 90 Days. Get Paid in 48 Hours.",
    subtitle: "Convert validated EPC bills into working capital with a secure digital process.",
    cta: "Get Your Bills Funded",
  },
  epc: {
    title: "Strengthen Your Supply Chain. Zero Financial Burden.",
    subtitle: "Enable vendor liquidity while keeping your existing payment cycle unchanged.",
    cta: "Partner as EPC",
  },
  nbfc: {
    title: "Access Pre-Verified Infrastructure Deals.",
    subtitle: "Evaluate curated opportunities with complete risk context and clean data.",
    cta: "Apply for Partnership",
  },
};

const roles: { key: ActiveRole; label: string }[] = [
  { key: "subcontractor", label: "Sub-Contractor" },
  { key: "epc", label: "EPC" },
  { key: "nbfc", label: "NBFC" },
];

export function HeroDynamicRole() {
  const { activeRole, setActiveRole } = useRoleStore();
  const content = roleContent[activeRole];

  return (
    <SectionShell variant="light" className="relative overflow-hidden">
      <div className="container-page grid gap-8 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="badge-info mb-4">Built for infrastructure finance trust</p>
          <div className="mb-6 grid grid-cols-3 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm sm:inline-flex sm:rounded-full">
            {roles.map((role) => (
              <button
                key={role.key}
                onClick={() => {
                  setActiveRole(role.key);
                  trackEvent({
                    eventName: "role_switch",
                    category: "engagement",
                    roleContext: role.key,
                    properties: { selectedRole: role.key },
                  });
                }}
                aria-pressed={activeRole === role.key}
                className={`rounded-xl px-3 py-2 text-xs transition sm:rounded-full sm:px-4 sm:text-sm ${
                  activeRole === role.key ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {role.label}
              </button>
            ))}
          </div>

          <motion.div key={content.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="heading-hero">{content.title}</h1>
            <p className="mt-4 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Trusted by infrastructure teams for faster validated payouts
            </p>
          </motion.div>

          <motion.p key={content.subtitle} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-muted mt-5 max-w-2xl text-base leading-relaxed">
            {content.subtitle}
          </motion.p>

          <div className="mt-5 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 font-medium text-slate-700">100% Digital Workflow</span>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 font-medium text-slate-700">EPC-Verified Process</span>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 font-medium text-slate-700">NBFC Competition</span>
          </div>

          <a
            href={activeRole === "subcontractor" ? "https://app.gryork.com" : "/contact"}
            onClick={() =>
              trackEvent({
                eventName: "cta_click",
                category: "conversion",
                roleContext: activeRole,
                properties: {
                  cta: content.cta,
                  section: "hero",
                  href: activeRole === "subcontractor" ? "https://app.gryork.com" : "/contact",
                },
              })
            }
            className="btn-primary mt-8"
          >
            {content.cta}
          </a>
        </div>

        <AnimatedReveal>
          <SignatureCard variant="story" className="bg-gradient-to-br from-white via-blue-50/60 to-emerald-50/70 p-2">
            <img src="/media/hero-workflow-poster.png" alt="Workflow Preview" className="h-[240px] w-full rounded-lg object-cover object-center sm:h-[360px] lg:h-[360px]" />
          </SignatureCard>
        </AnimatedReveal>
      </div>
    </SectionShell>
  );
}
