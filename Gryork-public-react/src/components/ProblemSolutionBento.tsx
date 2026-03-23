import { AnimatedReveal } from "./AnimatedReveal";
import { SignatureCard } from "./SignatureCard";

export function ProblemSolutionBento() {
  const trustPoints = [
    { title: "100% Digital", hint: "No physical paperwork loops" },
    { title: "End-to-End Encrypted", hint: "Secure document and data handling" },
    { title: "RBI-Registered Only", hint: "NBFC participation with compliance controls" },
  ];

  return (
    <section className="bg-white page-section">
      <div className="container-page">
        <AnimatedReveal>
          <h2 className="heading-section">From Delays to Decisive Funding</h2>
          <p className="text-muted mt-3 max-w-3xl">
            Designed for trust-first infrastructure financing with faster payouts, transparent validation, and institutional-grade controls.
          </p>
        </AnimatedReveal>
        <div className="mt-8 grid gap-4 md:grid-cols-4 md:grid-rows-2">
          <AnimatedReveal className="md:col-span-2 md:row-span-2">
            <SignatureCard variant="story" className="bg-gradient-to-br from-blue-50 via-white to-emerald-50">
            <h3 className="text-xl font-semibold text-slate-900">Wait 60-90 Days vs. Funded in 48 Hours</h3>
            <p className="text-muted mt-2">Visual timeline and faster conversion path for working capital.</p>
            <div className="mt-5 rounded-xl border border-blue-100 bg-white p-4">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Traditional Cycle</span>
                <span className="font-semibold text-red-500">60-90 days</span>
              </div>
              <div className="my-3 h-2 rounded-full bg-slate-100">
                <div className="h-full w-[85%] rounded-full bg-red-300" />
              </div>
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Gryork-Enabled Cycle</span>
                <span className="font-semibold text-emerald-600">48 hours target</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-slate-100">
                <div className="h-full w-[22%] rounded-full bg-emerald-400" />
              </div>
            </div>
            </SignatureCard>
          </AnimatedReveal>
          <AnimatedReveal className="md:col-span-2" delay={0.08}>
            <SignatureCard variant="story">
            <h3 className="text-xl font-semibold text-slate-900">50+ NBFCs Competing</h3>
            <p className="text-muted mt-2">Competitive offers drive better outcomes for suppliers.</p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-slate-600">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-center">Offer A<br /><span className="font-semibold text-emerald-600">11.8%</span></div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-center">Offer B<br /><span className="font-semibold text-cobalt">12.1%</span></div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-center">Offer C<br /><span className="font-semibold text-slate-900">12.4%</span></div>
            </div>
            </SignatureCard>
          </AnimatedReveal>
          {trustPoints.map((point, index) => (
            <AnimatedReveal key={point.title} delay={0.1 + index * 0.06}>
              <SignatureCard variant="proof" className="text-sm text-slate-700">
              <p className="font-semibold text-slate-900">{point.title}</p>
              <p className="mt-1 text-xs text-slate-500">{point.hint}</p>
              </SignatureCard>
            </AnimatedReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
