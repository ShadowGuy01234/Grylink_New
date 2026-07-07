import { motion, type Variants } from "framer-motion";
import { ArrowRight, Calendar, GraduationCap, ShieldCheck, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";

export function Hero() {
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
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10 px-4 py-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400 shadow-sm">
            <ShieldCheck className="h-4 w-4" />
            Batch Concluded · TechPreneur 2026
          </span>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="mb-6 text-5xl sm:text-6xl md:text-7xl lg:text-[5rem] font-bold tracking-tight text-slate-900 dark:text-white font-display leading-[1.1]"
        >
          TechPreneur
          <br />
          <span className="text-gradient-blue">
            Accelerator Program
          </span>
        </motion.h1>

        <motion.div variants={itemVariants} className="mb-10 max-w-3xl text-left sm:text-center text-slate-600 dark:text-slate-400 leading-relaxed font-medium space-y-4">
          <p className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-200">
            TechPreneur Cohort 2026 is officially complete!
          </p>
          <p className="text-base sm:text-lg">
            100+ graduates successfully completed their intensive startup incubation training, gained hands-on engineering experience, built live MVP prototypes, and presented investor pitch decks.
          </p>
          <p className="text-base sm:text-lg font-semibold text-gry-blue-main dark:text-blue-400">
            All completion certificates, detailed performance reports, and onboarding letters have been issued. Verify credentials instantly using the certificate ID or QR code.
          </p>
        </motion.div>

        {/* Feature Pills */}
        <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mb-12 text-sm sm:text-base font-medium text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-2 bg-white dark:bg-white/5 px-4 py-2 rounded-xl shadow-sm border border-slate-200 dark:border-white/10">
            <Calendar className="w-4 h-4 text-gry-blue-main dark:text-gry-blue-light" />
            June 2026 Cohort
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-white/5 px-4 py-2 rounded-xl shadow-sm border border-slate-200 dark:border-white/10">
            <GraduationCap className="w-4 h-4 text-gry-blue-main dark:text-gry-blue-light" />
            100+ Certified Graduates
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-white/5 px-4 py-2 rounded-xl shadow-sm border border-slate-200 dark:border-white/10">
            <UserCheck className="w-4 h-4 text-gry-blue-main dark:text-gry-blue-light" />
            100% Verifiable Credentials
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link to="/verify" className="btn-primary w-full sm:w-auto justify-center text-lg py-3 px-8 bg-blue-600 hover:bg-blue-500 text-white shadow-lg">
            Verify Certificate ↗
            <ArrowRight className="h-5 w-5 ml-1" />
          </Link>
          <Link to="/login" className="btn-secondary w-full sm:w-auto justify-center text-lg py-3 px-8 bg-white dark:bg-transparent border border-slate-300 dark:border-white/10">
            Student Login
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
