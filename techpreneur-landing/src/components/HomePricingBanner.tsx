import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck } from "lucide-react";

export function HomePricingBanner() {
  return (
    <div className="bg-gradient-to-r from-gry-blue-dark via-gry-blue-main to-gry-blue-dark text-white py-10 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 right-12 w-32 h-32 bg-gry-green/20 rounded-full blur-xl"></div>
      </div>

      <div className="page-container relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white/10 backdrop-blur-md border border-white/20 p-6 md:p-8 rounded-2xl shadow-xl">
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <span className="bg-emerald-600 text-white text-xs font-bold uppercase px-3 py-1 rounded-full shadow-sm">
                Concluded Cohort
              </span>
              <span className="text-blue-200 font-medium text-sm">TechPreneur Accelerator 2026</span>
            </div>
            <h3 className="font-display text-2xl sm:text-3xl font-bold mb-2">
              100+ Startup Graduations Certified
            </h3>
            <p className="text-blue-100 max-w-xl text-sm sm:text-base">
              Every participant of the TechPreneur 2026 cohort has been issued a verifiable certificate and detailed evaluation scorecard. Employers, institutions, and team leads can verify onboarding credentials instantly.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 flex-shrink-0">
            <Link 
              to="/verify" 
              className="group relative inline-flex items-center gap-2 bg-white text-[#0A2463] hover:text-white px-6 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:shadow-lg hover:scale-105 overflow-hidden"
            >
              <span className="absolute inset-0 bg-emerald-600 w-0 group-hover:w-full transition-all duration-300 ease-out z-0"></span>
              <ShieldCheck className="w-5 h-5 relative z-10 transition-colors" />
              <span className="relative z-10 transition-colors">Verify Credentials</span>
              <ArrowRight className="w-5 h-5 relative z-10 transition-colors group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
