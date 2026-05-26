import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { getCurrentPricing } from "../lib/api";

const features = [
  "Live Industry Training",
  "Practical Learning",
  "Certification Included",
  "Networking Opportunities",
  "Real Project Exposure",
];

const bonuses = [
  "Resume Review",
  "LinkedIn Optimization",
  "Startup Networking Group and guidance",
  "Internship Guidance",
];

export default function Pricing({ showHeader = true }: { showHeader?: boolean }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const { phase: currentPhase } = getCurrentPricing();

  const plans = [
    {
      name: currentPhase?.label || "Founding Batch Registrations Now Live",
      price: currentPhase?.amount ? `₹${currentPhase.amount}` : "₹1299",
      originalPrice: currentPhase?.originalAmount ? `₹${currentPhase.originalAmount}` : "₹5200",
      date: currentPhase?.deadlineLabel || "EARLY BIRD SOLD OUT",
      active: true,
      past: false,
    }
  ];

  return (
    <section className="section-pad relative z-10" ref={ref}>
      <div className="page-container">
        {showHeader && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <span className="badge-blue mb-4 inline-block">Pricing</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold mt-3 text-slate-900 dark:text-white">
              Simple, Transparent <span className="text-highlight">Pricing</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-3 max-w-xl mx-auto">
              One fee for the entire 4-week program. No hidden charges.
            </p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 gap-6 max-w-lg mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative rounded-2xl p-6 sm:p-8 transition-all duration-300 ${
                plan.active
                  ? "bg-gradient-to-b from-gry-blue-main to-gry-blue-dark text-white shadow-blue-lg scale-100 md:scale-105 z-10 border-none"
                  : plan.past
                  ? "bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 opacity-60"
                  : "bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 shadow-sm"
              }`}
            >
              {plan.active && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <span className="bg-gry-green text-white text-xs font-bold uppercase tracking-wider py-1 px-4 rounded-full shadow-sm">
                    Current Phase
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className={`font-display text-lg font-bold mb-1 ${plan.active ? "text-white" : "text-slate-900 dark:text-white"}`}>
                  {plan.name}
                </h3>
                <p className={`text-xs font-semibold uppercase tracking-wider ${plan.active ? "text-blue-200" : "text-slate-500"}`}>
                  {plan.date}
                </p>
              </div>

              <div className="mb-8">
                <div className="flex items-end gap-2 justify-start mb-1">
                  <span className="text-xl line-through font-semibold text-blue-300/70">{plan.originalPrice}</span>
                  <span className="text-xs bg-red-500/20 text-red-100 px-2 py-0.5 rounded-full font-bold uppercase">86% Off</span>
                </div>
                <div className="flex items-baseline">
                  <span className="font-display text-4xl sm:text-5xl font-bold">{plan.price}</span>
                  <span className={`ml-2 text-sm ${plan.active ? "text-blue-200" : "text-slate-500"}`}>/ student</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {features.map((f, j) => (
                  <li key={j} className="flex items-start gap-3">
                    <CheckCircle2 className={`w-5 h-5 flex-shrink-0 ${plan.active ? "text-blue-300" : "text-gry-blue-main dark:text-gry-blue-light"}`} />
                    <span className={`text-sm ${plan.active ? "text-blue-50" : "text-slate-700 dark:text-slate-300"}`}>{f}</span>
                  </li>
                ))}
              </ul>

              <div className="mb-8 p-4 rounded-xl bg-white/10 border border-white/20">
                <h4 className="text-sm font-bold text-white mb-3 uppercase tracking-wider flex items-center gap-2">
                  <span className="text-xl">🎁</span> Bonuses Worth ₹3,000 Included FREE
                </h4>
                <ul className="space-y-2">
                  {bonuses.map((b, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <span className="text-blue-300 text-sm">✦</span>
                      <span className="text-sm text-blue-50">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-6 text-center">
                <p className="text-amber-300 font-bold text-sm bg-amber-900/40 inline-block px-3 py-1 rounded-full border border-amber-500/30">
                  {currentPhase?.urgencyText || "⏳ Limited Seats Available"}
                </p>
                <p className="text-xs text-blue-200 mt-2">
                  ⚠ Next Price Increase: ₹1,999
                </p>
              </div>

              {plan.active ? (
                <Link to="/register" className="btn-green w-full justify-center">
                  Register Now
                </Link>
              ) : plan.past ? (
                <button disabled className="btn-secondary w-full justify-center opacity-50 cursor-not-allowed">
                  Ended
                </button>
              ) : (
                <Link to="/register" className="btn-secondary w-full justify-center">
                  Upcoming
                </Link>
              )}
            </motion.div>
          ))}
        </div>

        <div className="mt-8 max-w-xl mx-auto flex items-start gap-3 p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 text-sm text-slate-600 dark:text-slate-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-500" />
          <p>Registration closes entirely on 31 May 2026. No entries will be accepted after this date under any circumstances.</p>
        </div>
      </div>
    </section>
  );
}
