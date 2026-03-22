const items = [
  "GST-registered entity",
  "Active EPC contract",
  "Valid RA Bill",
  "PAN + Aadhaar",
  "6+ months in business",
];

export function EligibilityChecklist() {
  return (
    <section className="bg-white page-section">
      <div className="mx-auto max-w-5xl px-4">
        <div className="glass-card p-8">
          <h2 className="heading-section">Eligibility Checklist</h2>
          <ul className="mt-6 space-y-3">
            {items.map((item) => (
              <li key={item} className="flex items-center gap-3 text-slate-700">
                <span className="h-2 w-2 rounded-full bg-emerald" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
