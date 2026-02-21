"use client";

import { motion } from "framer-motion";
import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { NBFC_NAMES, STATS } from "@/lib/constants";
import { Shield } from "lucide-react";

export default function TrustStrip() {
  return (
    <section className="border-y border-gray-100 bg-gray-50/60 py-0">
      {/* Stat Strip */}
      <div className="container-custom">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-gray-200">
          {STATS.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex flex-col items-center justify-center py-6 px-4 text-center"
            >
              <span className="text-2xl md:text-3xl font-bold text-primary-900 tabular-nums leading-none mb-1">
                {stat.value}
              </span>
              <span className="text-xs text-gray-500 font-medium leading-tight max-w-[110px]">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* NBFC Logos Infinite Slider */}
      <div className="border-t border-gray-200 bg-white py-5">
        <div className="container-custom mb-3">
          <div className="flex items-center gap-2 justify-center">
            <Shield className="w-3.5 h-3.5 text-accent-600" />
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
              Backed by 50+ RBI-Registered NBFCs
            </p>
          </div>
        </div>
        <div className="relative [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
          <InfiniteSlider gap={32} speed={60} speedOnHover={120}>
            {NBFC_NAMES.map((name, i) => (
              <div
                key={i}
                className="flex items-center justify-center px-6 py-2 rounded-lg border border-gray-200 bg-gray-50 min-w-[140px] h-10"
              >
                <span className="text-sm font-semibold text-gray-600 whitespace-nowrap">
                  {name}
                </span>
              </div>
            ))}
          </InfiniteSlider>
        </div>
      </div>
    </section>
  );
}
