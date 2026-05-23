import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Highlights from "../components/Highlights";
import Tracks from "../components/Tracks";
import WeeklyPlan from "../components/WeeklyPlan";
import WhatYouGet from "../components/WhatYouGet";
import Experts from "../components/Experts";

export function ProgramPage() {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [hash]);

  return (
    <div className="flex flex-col min-h-screen pt-20">
      <div className="bg-slate-50 dark:bg-black border-b border-slate-200 dark:border-white/10 py-12 md:py-20 transition-colors duration-300">
        <div className="page-container text-center">
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
            Program <span className="text-highlight">Details</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Everything you need to know about the 4-week intensive industrial training program.
          </p>
        </div>
      </div>
      
      <Highlights />
      <Tracks />
      <WeeklyPlan />
      <Experts />
      <WhatYouGet />
    </div>
  );
}
