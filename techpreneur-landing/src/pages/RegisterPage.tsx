import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, ArrowRight } from "lucide-react";
import FAQ from "../components/FAQ";

export function RegisterPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex flex-col min-h-screen pt-20">
      <div className="bg-slate-50 dark:bg-black border-b border-slate-200 dark:border-white/10 py-16 md:py-24 transition-colors duration-300">
        <div className="page-container text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/5 dark:bg-rose-500/10 px-4 py-1.5 text-sm font-semibold text-rose-600 dark:text-rose-400 mb-6 shadow-sm">
            Registrations Closed
          </div>
          
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
            TechPreneur Cohort 2026
          </h1>
          
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 leading-relaxed mb-10">
            Incubation training has successfully concluded for all participants. We congratulate our **100+ graduates** who built live startup MVPs, finalized investor pitch decks, and earned their certifications.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/verify" 
              className="btn-primary w-full sm:w-auto justify-center text-lg py-3 px-8 bg-blue-600 hover:bg-blue-500 text-white shadow-lg"
            >
              <ShieldCheck className="w-5 h-5 mr-1" />
              Verify Certificate ↗
            </Link>
            <Link 
              to="/login" 
              className="btn-secondary w-full sm:w-auto justify-center text-lg py-3 px-8 bg-white dark:bg-transparent border border-slate-300 dark:border-white/10"
            >
              Student Login
            </Link>
          </div>
        </div>
      </div>

      <div className="py-12 border-t border-slate-200 dark:border-white/10">
        <FAQ />
      </div>
    </div>
  );
}
