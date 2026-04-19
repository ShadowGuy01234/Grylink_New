"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { trackProcessStep } from "@/lib/analytics";

const STEPS = [
  { title: "Register & KYC", time: "30 min", visual: "PAN/Aadhaar upload completed" },
  { title: "Submit Bill + Requesting Form", time: "10 min", visual: "RA Bill + WCC + Measurement Sheet attached" },
  { title: "EPC Verifies Work", time: "1-2 days", visual: "Status moved from Pending to Verified" },
  { title: "NBFCs Submit Offers", time: "24-48 hrs", visual: "Competing bids table received" },
  { title: "Accept & Get Funded", time: "48 hrs", visual: "Bank balance updated with disbursement" },
];

export default function ProcessStickyScroll() {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const idxValue = useTransform(scrollYProgress, [0, 1], [0, STEPS.length - 1]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const unsubscribe = idxValue.on("change", (v) => {
      const next = Math.max(0, Math.min(STEPS.length - 1, Math.round(v)));
      setActive(next);
    });
    return () => unsubscribe();
  }, [idxValue]);

  useEffect(() => {
    const step = STEPS[active];
    trackProcessStep(active + 1, step.title);
  }, [active]);

  return (
    <section className="bg-[var(--bg-base)] py-20">
      <div className="container-custom">
        <div ref={ref} className="grid lg:grid-cols-2 gap-8 min-h-[180vh]">
          <div className="lg:sticky lg:top-24 self-start space-y-4">
            <h2 className="text-display text-white text-3xl font-bold">How funding moves in 5 steps</h2>
            {STEPS.map((step, i) => (
              <div key={step.title} className={cn("glass-card p-4 transition-all", i === active ? "border-emerald-400/50 bg-white/10" : "bg-white/[0.03]")}>
                <p className="text-sm text-gray-400">{step.time}</p>
                <p className="text-white font-semibold">{step.title}</p>
              </div>
            ))}
          </div>

          <div className="lg:sticky lg:top-24 self-start">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 min-h-[320px]"
            >
              <p className="text-sm text-gray-400 mb-2">Step {active + 1}</p>
              <h3 className="text-white text-xl font-semibold">{STEPS[active].title}</h3>
              <p className="text-gray-300 mt-4">{STEPS[active].visual}</p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
