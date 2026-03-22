const points = [
  "Strengthen vendor relationships",
  "Improve project timelines",
  "No financial burden on EPC",
  "Simple bill validation workflow",
];

const process = [
  "Complete one-time EPC onboarding and KYC",
  "Invite and map sub-contractors to your account",
  "Validate submitted bills from your vendors",
  "Continue your existing payment cycle unchanged",
];

function ForEpcPage() {
  return (
    <section className="page-section">
      <div className="container-page">
        <h1 className="heading-hero">For EPCs</h1>
        <p className="text-muted mt-4 max-w-3xl">
          Support subcontractor liquidity while keeping your payment cycle unchanged.
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
            <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">Your Role is Simple</h2>
            <ul className="mt-4 space-y-3">
              {process.map((step) => (
                <li key={step} className="text-slate-700">• {step}</li>
              ))}
            </ul>
          </div>
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">Approval Flow Preview</h2>
            <img src="/media/for-EPC.png" alt="EPC workflow preview" className="mt-4 h-[200px] w-full rounded-lg object-cover sm:h-[320px]" />
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <a href="/contact" className="btn-primary">Partner as EPC</a>
          <a href="/how-it-works" className="btn-secondary">View Process</a>
        </div>
      </div>
    </section>
  );
}

export { ForEpcPage };
export default ForEpcPage;
