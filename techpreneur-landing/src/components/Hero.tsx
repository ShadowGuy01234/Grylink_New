import { motion, type Variants } from "framer-motion";
import { ArrowRight, Download, Calendar, MapPin, GraduationCap, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCurrentPricing } from "../lib/api";

export function Hero() {
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });
  const [deadline, setDeadline] = useState<Date | null>(null);

  useEffect(() => {
    const { deadline: d } = getCurrentPricing();
    if (d) setDeadline(d);

    const timer = setInterval(() => {
      if (!d) return;
      const now = new Date().getTime();
      const distance = d.getTime() - now;

      if (distance < 0) {
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        d: Math.floor(distance / (1000 * 60 * 60 * 24)),
        h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center pt-28 pb-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 hero-bg transition-colors duration-300" />
      <div className="absolute inset-0 hero-dot-grid opacity-30 dark:opacity-100" />
      
      {/* Top subtle fade */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white dark:from-black to-transparent z-10" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="page-container relative z-20 flex flex-col items-center text-center"
      >
        <motion.div variants={itemVariants} className="mb-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-gry-blue-main/30 bg-gry-blue-main/5 dark:bg-gry-blue-main/10 px-4 py-1.5 text-sm font-semibold text-gry-blue-main dark:text-gry-blue-light shadow-sm">
            <Calendar className="h-4 w-4" />
            4-Week Industrial Training · 2026
          </span>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="mb-6 text-5xl sm:text-6xl md:text-7xl lg:text-[5rem] font-bold tracking-tight text-slate-900 dark:text-white font-display leading-[1.1]"
        >
          TechPreneur
          <br />
          <span className="text-gradient-blue">
            Industrial Training
          </span>
        </motion.h1>

        <motion.div variants={itemVariants} className="mb-10 max-w-3xl text-left sm:text-center text-slate-600 dark:text-slate-400 leading-relaxed font-medium space-y-4">
          <p className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-200">
            The journey has already begun.
          </p>
          <p className="text-base sm:text-lg">
            Over the past few days, participants of TechPreneur 2026 have attended technical sessions, interacted with industry professionals, and gained valuable insights into modern technology, startups, AI, and career development.
          </p>
          <p className="text-base sm:text-lg font-semibold text-gry-blue-main dark:text-blue-400">
            Due to continued requests from students across multiple colleges, we are opening a Limited Late Registration Window for those who could not register earlier.
          </p>
        </motion.div>

        {/* Feature Pills */}
        <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mb-12 text-sm sm:text-base font-medium text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-2 bg-white dark:bg-white/5 px-4 py-2 rounded-xl shadow-sm border border-slate-200 dark:border-white/10">
            <Calendar className="w-4 h-4 text-gry-blue-main dark:text-gry-blue-light" />
            June 1 – 28
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-white/5 px-4 py-2 rounded-xl shadow-sm border border-slate-200 dark:border-white/10">
            <MapPin className="w-4 h-4 text-gry-blue-main dark:text-gry-blue-light" />
            Offline / Hybrid
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-white/5 px-4 py-2 rounded-xl shadow-sm border border-slate-200 dark:border-white/10">
            <GraduationCap className="w-4 h-4 text-gry-blue-main dark:text-gry-blue-light" />
            B.Tech Students
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link to="/register" className="btn-primary w-full sm:w-auto justify-center text-lg py-3 px-8">
            Register Now
            <ArrowRight className="h-5 w-5 ml-1" />
          </Link>
          <a href="/brochure.pdf" target="_blank" rel="noopener noreferrer" className="btn-secondary w-full sm:w-auto justify-center text-lg py-3 px-8 bg-white dark:bg-transparent">
            <Download className="h-5 w-5 mr-1" />
            Download Brochure
          </a>
        </motion.div>

        {/* Countdown */}
        {deadline && (
          <motion.div variants={itemVariants} className="mt-16 pt-8 border-t border-slate-200 dark:border-white/10 w-full max-w-2xl">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
                <Clock className="w-4 h-4" />
                <span>Next Price Increase In</span>
              </div>
              <div className="flex gap-3 sm:gap-4 justify-center">
                <div className="countdown-digit bg-white dark:bg-white/5 shadow-sm border-slate-200 dark:border-gry-blue-main/30 text-slate-900 dark:text-white">
                  <div className="font-display text-2xl sm:text-3xl font-bold">{timeLeft.d.toString().padStart(2, "0")}</div>
                  <div className="text-[10px] sm:text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Days</div>
                </div>
                <div className="text-2xl font-bold text-slate-300 dark:text-slate-600 self-start mt-2">:</div>
                <div className="countdown-digit bg-white dark:bg-white/5 shadow-sm border-slate-200 dark:border-gry-blue-main/30 text-slate-900 dark:text-white">
                  <div className="font-display text-2xl sm:text-3xl font-bold">{timeLeft.h.toString().padStart(2, "0")}</div>
                  <div className="text-[10px] sm:text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Hrs</div>
                </div>
                <div className="text-2xl font-bold text-slate-300 dark:text-slate-600 self-start mt-2">:</div>
                <div className="countdown-digit bg-white dark:bg-white/5 shadow-sm border-slate-200 dark:border-gry-blue-main/30 text-slate-900 dark:text-white">
                  <div className="font-display text-2xl sm:text-3xl font-bold">{timeLeft.m.toString().padStart(2, "0")}</div>
                  <div className="text-[10px] sm:text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Min</div>
                </div>
                <div className="text-2xl font-bold text-slate-300 dark:text-slate-600 self-start mt-2 hidden sm:block">:</div>
                <div className="countdown-digit bg-white dark:bg-white/5 shadow-sm border-slate-200 dark:border-gry-blue-main/30 text-slate-900 dark:text-white hidden sm:block">
                  <div className="font-display text-2xl sm:text-3xl font-bold">{timeLeft.s.toString().padStart(2, "0")}</div>
                  <div className="text-[10px] sm:text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Sec</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
