"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote, Star, HardHat, Building2, Landmark } from "lucide-react";
import { TESTIMONIALS } from "@/lib/constants";

const roleConfig: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; colors: string }> = {
  subcontractor: {
    label: "Sub-Contractor",
    icon: HardHat,
    colors: "bg-accent-100 text-accent-700 border-accent-200",
  },
  epc: {
    label: "EPC Company",
    icon: Building2,
    colors: "bg-blue-100 text-blue-700 border-blue-200",
  },
  nbfc: {
    label: "NBFC Partner",
    icon: Landmark,
    colors: "bg-purple-100 text-purple-700 border-purple-200",
  },
};

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [direction, setDirection] = useState(1);

  const next = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  }, []);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(next, 5500);
    return () => clearInterval(interval);
  }, [isAutoPlaying, next]);

  const current = TESTIMONIALS[currentIndex];
  const role = roleConfig[current.role] ?? roleConfig.subcontractor;
  const RoleIcon = role.icon;

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
  };

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      <div className="container-custom">
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-100 text-primary-700 text-xs font-semibold uppercase tracking-wider mb-4"
          >
            <Star className="w-3.5 h-3.5 fill-current" />
            Success Stories
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-900 mb-3"
          >
            Real results from real{" "}
            <span className="text-accent-500">contractors</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="text-gray-500 max-w-xl mx-auto text-base"
          >
            Trusted by sub-contractors, EPC companies, and NBFCs across India
          </motion.p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="relative">
            {/* Quote accent */}
            <div className="absolute -top-5 -left-5 w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center z-0 hidden md:flex">
              <Quote className="w-8 h-8 text-primary-300" />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
            >
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentIndex}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className="px-8 md:px-12 pt-10 pb-8"
                >
                  {/* Stars */}
                  <div className="flex gap-1 mb-5">
                    {Array.from({ length: current.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-8 font-medium">
                    &ldquo;{current.quote}&rdquo;
                  </p>

                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {current.author.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-primary-900 text-sm">{current.author}</p>
                      <p className="text-xs text-gray-400">{current.company}</p>
                    </div>
                    {/* Role badge */}
                    <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${role.colors}`}>
                      <RoleIcon className="w-3.5 h-3.5" />
                      {role.label}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Progress bar */}
              <div className="h-1 bg-gray-100">
                <motion.div
                  key={currentIndex}
                  initial={{ width: 0 }}
                  animate={{ width: isAutoPlaying ? "100%" : "0%" }}
                  transition={{ duration: 5.5, ease: "linear" }}
                  className="h-full bg-gradient-to-r from-primary-500 to-accent-500"
                />
              </div>
            </motion.div>

            {/* Controls */}
            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center gap-2">
                {TESTIMONIALS.map((t, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setDirection(index > currentIndex ? 1 : -1);
                      setCurrentIndex(index);
                    }}
                    className={`rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? "bg-primary-600 w-8 h-2.5"
                        : "bg-gray-300 hover:bg-gray-400 w-2.5 h-2.5"
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={prev}
                  className="p-2.5 rounded-xl bg-white border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={next}
                  className="p-2.5 rounded-xl bg-white border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all shadow-sm"
                >
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

