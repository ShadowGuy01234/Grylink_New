"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

type Metric = {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
};

const METRICS: Metric[] = [
  { label: "Flat Platform Fee", value: 1000, prefix: "₹" },
  { label: "Target Funding", value: 48, suffix: " hrs" },
  { label: "Digital Process", value: 100, suffix: "%" },
  { label: "Collateral Required", value: 0 },
];

function useCountUp(target: number, start: boolean) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf = 0;
    const started = performance.now();
    const duration = 1000;
    const tick = (now: number) => {
      const progress = Math.min((now - started) / duration, 1);
      setValue(Math.floor(target * progress));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, start]);
  return value;
}

function MetricCard({ metric, start }: { metric: Metric; start: boolean }) {
  const num = useCountUp(metric.value, start);
  const display = useMemo(() => `${metric.prefix || ""}${num.toLocaleString()}${metric.suffix || ""}`, [metric, num]);
  return (
    <div className="glass-card p-5 text-center">
      <p className="text-display text-2xl font-bold text-white">{display}</p>
      <p className="text-sm text-gray-400 mt-1">{metric.label}</p>
    </div>
  );
}

export default function MetricsBanner() {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-10 bg-[var(--bg-base)] border-y border-white/10">
      <div className="container-custom" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {METRICS.map((m) => (
            <MetricCard key={m.label} metric={m} start={inView} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
