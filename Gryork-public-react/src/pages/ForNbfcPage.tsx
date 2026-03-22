const points = [
  "Pre-verified infrastructure deals",
  "RMT risk report on each case",
  "EPC-backed repayment structure",
  "Real-time status tracking",
];

const nbfcFlow = [
  "Register and onboard with compliance details",
  "Set deal size, sector, and risk preferences",
  "Receive pre-verified CWCRF opportunities",
  "Submit offers and manage disbursement cycle",
];

export function ForNbfcPage() {
  return (
    <section className="page-section">
      <div className="container-page">
        <h1 className="heading-hero">For NBFCs</h1>
        <p className="text-muted mt-4 max-w-3xl">
          Access structured opportunities with complete verification context.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {points.map((p) => (
            <div key={p} className="glass-card p-6 text-slate-700">
              {p}
            </div>
          ))}
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">NBFC Journey</h2>
            <ul className="mt-4 space-y-3">
              {nbfcFlow.map((step) => (
                <li key={step} className="text-slate-700">• {step}</li>
              ))}
            </ul>
          </div>
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">Offer Table Preview</h2>
            <img src="/media/for-NBFC.png" alt="NBFC offers preview" className="mt-4 h-[220px] w-full rounded-lg object-cover object-center sm:h-[360px]" />
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <a href="/contact" className="btn-primary">Apply for Partnership</a>
          <a href="/how-it-works" className="btn-secondary">See Workflow</a>
        </div>
      </div>
    </section>
  );
}
