import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Zap, Mail, ShieldCheck } from "lucide-react";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Program details", href: "/program" },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => {
    if (path === "/" && location.pathname !== "/") return false;
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/70 backdrop-blur-xl border-b border-white/10 shadow-sm transition-colors duration-300">
        <div className="page-container">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="flex-shrink-0 bg-black p-1.5 rounded-lg border border-white/10">
                <img src="/logo.png" alt="Gryork" className="h-8 w-auto object-contain" />
              </div>
              <div className="block">
                <span className="font-display font-bold text-lg text-white group-hover:text-gry-blue-light transition-colors">
                  Gryork <span className="hidden sm:inline font-light opacity-80">TechPreneur 2026</span>
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`text-sm font-medium transition-colors hover:text-gry-blue-light relative ${
                    isActive(link.href) ? "text-gry-blue-light" : "text-slate-300"
                  }`}
                >
                  {link.name}
                  {isActive(link.href) && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gry-blue-light rounded-full"
                    />
                  )}
                </Link>
              ))}
              <Link
                to="/login"
                className={`text-sm font-medium transition-colors hover:text-gry-blue-light relative ${
                  isActive('/login') ? "text-gry-blue-light" : "text-slate-300"
                }`}
              >
                Student Login
                {isActive('/login') && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gry-blue-light rounded-full"
                  />
                )}
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <a 
                href="mailto:contact@gryork.com"
                className="hidden md:flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span>contact@gryork.com</span>
              </a>

              <div className="hidden md:block">
                <Link to="/verify" className="btn-green py-2 px-5 text-sm bg-emerald-600 hover:bg-emerald-500 border-none">
                  <ShieldCheck className="w-4 h-4" />
                  Verify Credentials
                </Link>
              </div>

              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 -mr-2 text-slate-300 hover:bg-white/10 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-4/5 max-w-sm bg-[#0A0A0A] shadow-2xl z-[70] md:hidden flex flex-col border-l border-white/10"
            >
              <div className="p-5 flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-2 bg-black p-1.5 rounded-lg border border-white/10">
                  <img src="/logo.png" alt="Gryork" className="h-6 w-auto" />
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 -mr-2 text-slate-400 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-6 px-5 flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    className={`block px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                      isActive(link.href)
                        ? "bg-white/10 text-white"
                        : "text-slate-300 hover:bg-white/5"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
                
                <a 
                  href="mailto:contact@gryork.com"
                  className="mt-4 flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-slate-300 hover:bg-white/5 transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  contact@gryork.com
                </a>
              </div>

              <div className="p-5 border-t border-white/10">
                <Link
                  to="/verify"
                  className="btn-green w-full justify-center bg-emerald-600 hover:bg-emerald-500 border-none"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Verify Credentials
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
