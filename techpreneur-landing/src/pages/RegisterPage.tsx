import { useEffect } from "react";
import Pricing from "../components/Pricing";
import Registration from "../components/Registration";
import FAQ from "../components/FAQ";

export function RegisterPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex flex-col min-h-screen pt-20">
      <div className="bg-slate-50 dark:bg-black border-b border-slate-200 dark:border-white/10 py-12 md:py-20 transition-colors duration-300">
        <div className="page-container text-center">
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
            Secure Your <span className="text-highlight">Seat</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Choose your plan, complete the payment, and submit the registration form. Seats are strictly limited to ensure quality mentorship.
          </p>
        </div>
      </div>
      
      <div className="py-12">
        <Pricing showHeader={false} />
      </div>
      
      <div className="py-12 bg-slate-50 dark:bg-transparent transition-colors duration-300">
        <Registration />
      </div>

      <div className="py-12 border-t border-slate-200 dark:border-white/10">
        <FAQ />
      </div>
    </div>
  );
}
