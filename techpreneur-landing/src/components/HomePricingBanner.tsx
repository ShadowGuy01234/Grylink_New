import { Link } from "react-router-dom";
import { ArrowRight, Zap } from "lucide-react";
import { getCurrentPricing } from "../lib/api";

export function HomePricingBanner() {
  const { phase: currentPhase } = getCurrentPricing();
  
  let price = currentPhase?.amount ? `₹${currentPhase.amount}` : "₹1299";
  let originalPrice = currentPhase?.originalAmount ? `₹${currentPhase.originalAmount}` : "₹5200";
  let label = currentPhase?.label || "Founding Batch Registrations Now Live";

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
              <span className="bg-gry-green text-white text-xs font-bold uppercase px-3 py-1 rounded-full shadow-sm">
                Current Phase
              </span>
              <span className="text-blue-200 font-medium text-sm">{label}</span>
            </div>
            <h3 className="font-display text-2xl sm:text-3xl font-bold mb-2">
              Don't miss the ultimate TechPreneur experience
            </h3>
            <p className="text-blue-100 max-w-xl text-sm sm:text-base">
              Seats are strictly limited. Register today to lock in your spot for the 4-week industrial training program.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 flex-shrink-0">
            <div className="text-center md:text-right">
              <div className="text-sm text-blue-200 mb-1">One-time fee</div>
              <div className="flex items-end gap-2 justify-center md:justify-end">
                <span className="text-xl text-blue-300/70 line-through font-semibold mb-1">{originalPrice}</span>
                <div className="font-display text-4xl font-bold">{price}</div>
              </div>
            </div>
            
            <Link 
              to="/register" 
              className="group relative inline-flex items-center gap-2 bg-white text-[#0A2463] hover:text-white px-6 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:shadow-lg hover:scale-105 overflow-hidden"
            >
              <span className="absolute inset-0 bg-gry-green w-0 group-hover:w-full transition-all duration-300 ease-out z-0"></span>
              <Zap className="w-5 h-5 relative z-10 transition-colors" />
              <span className="relative z-10 transition-colors">Register Now</span>
              <ArrowRight className="w-5 h-5 relative z-10 transition-colors group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
