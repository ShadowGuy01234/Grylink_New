const steps = [
  "Register & KYC (30 min)",
  "Submit Bill + CWCRF (10 min)",
  "EPC Verifies Work (1-2 days)",
  "NBFCs Submit Offers (24-48 hrs)",
  "Accept & Get Funded (48 hrs)",
];

export function ProcessStickyScroll() {
  return (
    <section className="bg-slate-50 page-section">
      <div className="container-page grid gap-8 lg:grid-cols-2">
        <div className="space-y-3 lg:sticky lg:top-24 lg:self-start">
          <h2 className="heading-section">Process in 5 steps</h2>
          {steps.map((step) => (
            <div key={step} className="glass-card p-4 text-slate-700">
              {step}
            </div>
          ))}
        </div>
        <div className="glass-card min-h-[240px] p-3 sm:min-h-[340px] sm:p-4">
          <h3 className="text-lg font-semibold text-slate-900 sm:text-xl">Process Overview</h3>
          
            <img
              src="/media/process-step-preview.png"
              alt="Process step UI preview"
              className="h-[220px] w-full rounded-lg object-cover object-center sm:h-[420px] lg:h-[300px]"
            />
          
        </div>
      </div>
    </section>
  );
}
