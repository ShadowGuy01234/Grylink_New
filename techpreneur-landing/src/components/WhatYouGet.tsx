import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { CheckCircle2, Award } from "lucide-react";

const deliverables = [
  "Certificate of Completion (Industry Recognized)",
  "Real-World Project Portfolio",
  "Letter of Recommendation (For top performers)",
  "Access to Gryork Startup Community",
  "Industry Productivity Toolkit Access",
  "1-on-1 Career Mentoring Session",
  "Resume & LinkedIn Review",
  "Interview Preparation Guide",
];

export default function WhatYouGet() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section className="section-pad bg-white dark:bg-transparent transition-colors duration-300" ref={ref}>
      <div className="page-container max-w-5xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Certificate Graphic */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-gry-blue-main/20 to-gry-blue-light/20 blur-3xl rounded-full" />
            
            <div className="relative card p-8 sm:p-10 bg-white dark:bg-[#060C1A] border-2 border-slate-100 dark:border-white/10 shadow-2xl">
              <div className="flex justify-between items-start mb-12">
                <img src="/logo.png" alt="Gryork" className="h-8 w-auto grayscale opacity-80 dark:opacity-60" />
                <Award className="w-12 h-12 text-gry-blue-main opacity-20" />
              </div>
              
              <div className="text-center space-y-4 mb-12">
                <p className="font-display text-sm font-bold text-slate-500 uppercase tracking-widest">Certificate of Completion</p>
                <div className="w-3/4 h-8 bg-slate-100 dark:bg-white/5 mx-auto rounded animate-pulse" />
                <p className="text-sm text-slate-500">has successfully completed the 4-week</p>
                <p className="font-display text-xl font-bold text-slate-800 dark:text-slate-200">TechPreneur Industrial Training</p>
              </div>

              <div className="flex justify-between items-end border-t border-slate-200 dark:border-white/10 pt-6">
                <div>
                  <div className="w-24 h-4 bg-slate-100 dark:bg-white/5 rounded mb-2" />
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Authorized Signatory</p>
                </div>
                <div className="w-16 h-16 rounded-full border-2 border-gry-blue-main/30 flex items-center justify-center">
                  <Award className="w-8 h-8 text-gry-blue-main" />
                </div>
              </div>
            </div>
            
            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="absolute -bottom-6 -right-6 card-blue bg-white dark:bg-[#0D1526] p-4 flex items-center gap-3 shadow-xl border border-gry-blue-main/20"
            >
              <div className="w-10 h-10 rounded-full bg-gry-green/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-gry-green" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">Industry Verified</p>
                <p className="text-xs text-slate-500">DPIIT Recognized Startup</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right: Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="badge-blue mb-4 inline-block">Outcomes</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold mt-3 text-slate-900 dark:text-white mb-6">
              What You <span className="text-highlight">Take Home</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
              We focus on deliverables that actually matter to recruiters and startup founders. 
              You don't just get a paper; you get a portfolio and proof of work.
            </p>

            <div className="grid gap-4">
              {deliverables.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="flex items-center gap-3 bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-100 dark:border-white/5"
                >
                  <CheckCircle2 className="w-5 h-5 text-gry-blue-main flex-shrink-0" />
                  <span className="font-medium text-slate-700 dark:text-slate-300 text-sm sm:text-base">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
