const metrics = [
  { label: "Target Funding", value: "48 hrs" },
  { label: "Digital Process", value: "100%" },
  { label: "Collateral", value: "Zero" },
];

export function MetricsBanner() {
  return (
    <section className="border-y border-slate-200 bg-slate-50 py-10">
      <div className="container-page grid grid-cols-1 gap-4 sm:grid-cols-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="glass-card p-4 text-center">
            <p className="text-2xl font-bold text-slate-900">{metric.value}</p>
            <p className="text-sm text-slate-500">{metric.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
