"use client";

import { CheckCircle2 } from "lucide-react";

const ITEMS = [
  "GST-registered",
  "Active EPC contract",
  "Valid RA Bill",
  "PAN + Aadhaar",
  "6+ months in business",
];

export default function EligibilityChecklist() {
  return (
    <section className="bg-[var(--bg-base)] py-16">
      <div className="container-custom">
        <div className="glass-card p-6 md:p-8">
          <h2 className="text-display text-2xl md:text-3xl text-white font-bold mb-6">Eligibility Checklist</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {ITEMS.map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                <span className="text-gray-200">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
