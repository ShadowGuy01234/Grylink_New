import { useState } from "react";

type Role = "subcontractor" | "epc" | "nbfc";

const roles: { id: Role; label: string; description: string }[] = [
  { id: "subcontractor", label: "Sub-Contractor", description: "Need working capital" },
  { id: "epc", label: "EPC Company", description: "Support your vendors" },
  { id: "nbfc", label: "NBFC Partner", description: "Access verified deal flow" },
];

const roleSteps: Record<Role, { title: string; description: string }[]> = {
  subcontractor: [
    { title: "Register on Gryork", description: "Complete basic KYC and business onboarding in one flow." },
    { title: "Submit Bills", description: "Upload validated RA bills and supporting documents digitally." },
    { title: "EPC Verification", description: "EPC confirms work completion and bill authenticity." },
    { title: "Receive Offers", description: "Multiple NBFCs compete with discounting offers." },
    { title: "Accept & Get Funded", description: "Choose the best offer and receive funds in your account." },
  ],
  epc: [
    { title: "Complete Onboarding", description: "Register company and compliance profile once." },
    { title: "Map Vendors", description: "Invite your trusted sub-contractors to the platform." },
    { title: "Review Requests", description: "Get bill validation requests from mapped subcontractors." },
    { title: "Validate Bills", description: "Approve verified bills with clear work milestones." },
    { title: "Continue Usual Cycle", description: "No financial burden, no change in your payment schedule." },
  ],
  nbfc: [
    { title: "Partner with Gryork", description: "Onboard with RBI/compliance documentation." },
    { title: "Set Deal Preferences", description: "Define sectors, tenure, ticket sizes, and risk limits." },
    { title: "Get Pre-verified Opportunities", description: "Access quality bill flow with contextual metadata." },
    { title: "Submit Offers", description: "Quote discount rates on opportunities that match your mandate." },
    { title: "Fund & Collect", description: "Disburse after acceptance and collect from EPC at maturity." },
  ],
};

const faqs = [
  {
    question: "How quickly does disbursement happen?",
    answer: "In most cases, once verification and offer acceptance are complete, funding is targeted within 48 hours.",
  },
  {
    question: "Does EPC need to provide funds?",
    answer: "No. EPC only validates completed work and invoices. NBFC partner funds the transaction.",
  },
  {
    question: "What is needed for onboarding?",
    answer: "Basic business KYC, GST, PAN, bank details, and role-specific operational details.",
  },
];

export function HowItWorksPage() {
  const [activeRole, setActiveRole] = useState<Role>("subcontractor");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <section className="page-section">
      <div className="mx-auto max-w-6xl px-4">
        <h1 className="heading-hero">How Gryork Works</h1>
        <p className="text-muted mt-4 max-w-3xl">
          A transparent, role-based workflow connecting subcontractors, EPCs, and NBFCs in one digital financing loop.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => setActiveRole(role.id)}
              className={`rounded-2xl border p-4 text-left transition ${
                activeRole === role.id ? "border-cobalt bg-cobalt text-white shadow-lg" : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <p className="font-semibold">{role.label}</p>
              <p className={`mt-1 text-sm ${activeRole === role.id ? "text-cyan-100" : "text-slate-500"}`}>{role.description}</p>
            </button>
          ))}
        </div>

        <div className="mt-8">
          <div className="glass-card p-3 sm:p-4">
            <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">Complete Flow</h2>
            <img
              src="/media/process-step-preview.png"
              alt="Gryork process primary visual"
              className="mt-3 h-[220px] w-full rounded-lg object-cover object-center sm:h-[400px] lg:h-[640px]"
            />
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">Step-by-Step Process</h2>
            <div className="mt-5 space-y-4">
              {roleSteps[activeRole].map((step, index) => (
                <div key={step.title} className="flex gap-3">
                  <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-cobalt text-xs font-semibold text-white">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900">{step.title}</p>
                    <p className="text-muted text-sm">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">Outcome Snapshot</h2>
            <img src="/media/RA-Bill.png" alt="Gryork process flow preview" className="mt-4 h-[200px] w-full rounded-lg object-cover sm:h-[320px]" />
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-semibold text-slate-900">Frequently Asked Questions</h2>
          <div className="mt-4 space-y-3">
            {faqs.map((faq, i) => (
              <div key={faq.question} className="glass-card overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left"
                >
                  <span className="font-medium text-slate-900">{faq.question}</span>
                  <span className="text-slate-400">{openFaq === i ? "−" : "+"}</span>
                </button>
                {openFaq === i && <p className="border-t border-slate-100 px-5 py-4 text-sm text-slate-600">{faq.answer}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
