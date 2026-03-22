export function PrivacyPage() {
  return (
    <section className="page-section">
      <div className="mx-auto max-w-4xl px-4">
        <h1 className="heading-hero">Privacy Policy</h1>
        <div className="mt-8 space-y-4">
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-slate-900">Information We Collect</h2>
            <p className="text-muted mt-2">Identity, contact, transaction, KYC/compliance, and technical usage data for service delivery and risk checks.</p>
          </div>
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-slate-900">How We Use Information</h2>
            <p className="text-muted mt-2">To process onboarding, facilitate financing workflows, improve product reliability, and meet regulatory obligations.</p>
          </div>
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-slate-900">Data Sharing</h2>
            <p className="text-muted mt-2">Shared only with relevant ecosystem parties such as EPCs, NBFCs, service providers, and authorities where legally required.</p>
          </div>
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-slate-900">Security Controls</h2>
            <p className="text-muted mt-2">Encryption, controlled access, and operational safeguards are applied to protect platform and customer data.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
