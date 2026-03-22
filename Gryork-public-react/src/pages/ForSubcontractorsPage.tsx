const benefits = [
  {
    title: "Quick Funding",
    description: "Get working capital within 48 hours of bill validation. No more waiting 90-180 days.",
  },
  {
    title: "Secure Process",
    description: "End-to-end encrypted platform with complete data security and compliance.",
  },
  {
    title: "Competitive Rates",
    description: "Access multiple NBFCs competing for your bills, ensuring best discount rates.",
  },
  {
    title: "Minimal Documentation",
    description: "Simple KYC and one-time onboarding. Upload bills digitally without paperwork.",
  },
  {
    title: "Digital Platform",
    description: "Track all your bills, offers, and payments from a single dashboard.",
  },
  {
    title: "Build Credit History",
    description: "Regular repayments help build your credit profile for better future rates.",
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

export function ForSubcontractorsPage() {
  return (
    <section className="page-section">
      <div className="container-page">
        <h1 className="heading-hero">For Sub-Contractors</h1>
        <p className="text-muted mt-4 max-w-3xl">
          Convert validated EPC bills into working capital in 48 hours.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b) => (
            <div key={b.title} className="glass-card p-5">
              <h3 className="text-lg font-semibold text-slate-900">{b.title}</h3>
              <p className="text-muted mt-2">{b.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="glass-card p-6">
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
          </div>
          <div className="glass-card p-2 sm:p-3">
            <img
              src="/media/RA-Bill.png"
              alt="Workflow snapshot"
              className="h-[220px] w-full rounded-lg object-cover object-center sm:h-[520px] lg:h-[360px]"
            />
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {faqs.map((item) => (
            <div key={item.q} className="glass-card p-5">
              <h3 className="font-semibold text-slate-900">{item.q}</h3>
              <p className="text-muted mt-2 text-sm">{item.a}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <a href="/early-access" className="btn-primary">Get Started</a>
          <a href="/contact" className="btn-secondary">Talk to Team</a>
        </div>
      </div>
    </section>
  );
}
