export function TermsPage() {
  return (
    <section className="page-section">
      <div className="mx-auto max-w-4xl px-4">
        <h1 className="heading-hero">Terms of Service</h1>
        <div className="mt-8 space-y-4">
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-slate-900">Platform Role</h2>
            <p className="text-muted mt-2">Gryork facilitates digital coordination between subcontractors, EPCs, and NBFCs for bill-based financing workflows.</p>
          </div>
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-slate-900">User Responsibilities</h2>
            <p className="text-muted mt-2">Users must provide accurate data, maintain valid documents, and comply with operational and legal requirements.</p>
          </div>
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-slate-900">Eligibility & Compliance</h2>
            <p className="text-muted mt-2">Eligibility checks, KYC, and compliance verification are mandatory before participation in funding transactions.</p>
          </div>
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-slate-900">Liability Boundaries</h2>
            <p className="text-muted mt-2">Commercial terms are agreed between participating parties; platform obligations are limited to service facilitation.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
