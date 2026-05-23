import { Link } from "react-router-dom";
import { Zap, Instagram, Linkedin, MessageCircle, Facebook } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#030612] transition-colors duration-300">
      {/* CTA banner */}
      <div className="bg-gry-blue-main/5 dark:bg-gry-blue-main/10 border-b border-gry-blue-main/10 dark:border-gry-blue-main/20 py-12 px-4 transition-colors duration-300">
        <div className="max-w-3xl mx-auto text-center">
          <p className="badge-blue mb-4 inline-block">Limited Seats Available</p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Ready to Level Up? <span className="text-highlight">Register Now.</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-lg mx-auto text-sm sm:text-base">
            Join a cohort of ambitious students who are choosing real learning over regular training programs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary justify-center">
              <Zap className="w-5 h-5" />
              Register Today
            </Link>
            <Link to="/program" className="btn-secondary justify-center">
              View Program Details
            </Link>
          </div>
        </div>
      </div>

      {/* Footer content */}
      <div className="max-w-6xl mx-auto px-4 py-10 grid sm:grid-cols-3 gap-8">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <img src="/logo.png" alt="Gryork" className="h-8 w-auto object-contain" />
            <div>
              <span className="font-display font-bold text-slate-900 dark:text-white">TechPreneur</span>
              <span className="block text-[9px] text-gry-blue-main dark:text-gry-blue-light uppercase tracking-widest font-semibold">by Gryork</span>
            </div>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-500 leading-relaxed">
            A Startup-Driven Industry Readiness Program for B.Tech Students.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-600 mt-3">
            Organized by Gryork Consultants Pvt Ltd<br />
            DPIIT Number: DIPP241764
          </p>
        </div>

        {/* Program info */}
        <div>
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-400 uppercase tracking-widest mb-3">Program</p>
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-500">
            <p>TechPreneur Industrial Training 2026</p>
            <p>June 1 – June 28, 2026</p>
            <p>Mode: Offline / Hybrid</p>
            <p>For B.Tech Students</p>
            <p>3 Specialization Tracks</p>
          </div>
        </div>

        {/* Connect */}
        <div>
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-400 uppercase tracking-widest mb-3">Connect</p>
          <div className="flex flex-wrap gap-3 mb-4">
            <a
              href="https://www.linkedin.com/company/gryork"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-[#0077b5] dark:hover:text-[#0a66c2] hover:border-[#0077b5]/30 transition shadow-sm"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a
              href="https://www.instagram.com/gryork.official/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-[#E1306C] dark:hover:text-[#E1306C] hover:border-[#E1306C]/30 transition shadow-sm"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href="https://www.facebook.com/share/g/18QSWPWFHB/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-[#1877F2] dark:hover:text-[#1877F2] hover:border-[#1877F2]/30 transition shadow-sm"
              aria-label="Facebook"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a
              href="https://chat.whatsapp.com/JcL4X7RH2h821iNu3kotv0"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-[#25D366] dark:hover:text-[#25D366] hover:border-[#25D366]/30 transition shadow-sm"
              aria-label="WhatsApp Community"
            >
              <MessageCircle className="w-5 h-5" />
            </a>
          </div>
          <a
            href="mailto:contact@gryork.com"
            className="text-sm text-gry-blue-main dark:text-gry-blue-light hover:underline font-medium"
          >
            contact@gryork.com
          </a>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-200 dark:border-white/10 py-5 px-4 bg-white dark:bg-transparent transition-colors duration-300">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-600">
          <p>© {new Date().getFullYear()} Gryork Consultants Pvt Ltd. All rights reserved.</p>
          <p className="font-display font-medium text-slate-700 dark:text-slate-500">Grow Your Work</p>
        </div>
      </div>
    </footer>
  );
}
