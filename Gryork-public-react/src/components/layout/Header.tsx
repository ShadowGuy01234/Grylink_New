import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { NAV_LINKS } from "../../lib/constants";
import { trackEvent } from "../../lib/analytics";
import { ArrowUpRight, Menu, Sparkles, X } from "../../shims/lucide-react";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.search]);

  return (
    <header
      className={`sticky top-0 z-50 border-b backdrop-blur-md transition ${
        scrolled
          ? "border-slate-200/90 bg-white/95 shadow-[0_8px_24px_rgba(15,23,42,0.08)]"
          : "border-slate-200/60 bg-white/90"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-[74px]">
        <NavLink to="/" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
          <img src="/logo.png" alt="Gryork logo" className="h-10 w-auto sm:h-12" />
          <div>
            <span className="font-display text-xl font-semibold text-slate-900 sm:text-2xl">Gryork</span>
            <p className="hidden text-[10px] font-medium uppercase tracking-wide text-slate-500 sm:block">Grow Your Work</p>
          </div>
        </NavLink>
        <button
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-700 lg:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.href}
              to={link.href}
              onClick={() =>
                trackEvent({
                  eventName: "cta_click",
                  category: "navigation",
                  properties: { href: link.href, label: link.label, section: "header_nav" },
                })
              }
              className={({ isActive }) =>
                `rounded-full px-3 py-2 text-sm transition ${
                  isActive
                    ? "bg-cobalt/10 font-semibold text-cobalt"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <a
            href="/early-access"
            className="ml-2 inline-flex items-center gap-1 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            onClick={() =>
              trackEvent({
                eventName: "cta_click",
                category: "conversion",
                properties: { href: "/early-access", label: "Get Started", section: "header_cta" },
              })
            }
          >
            <Sparkles className="h-4 w-4" />
            Get Started
          </a>
        </nav>
      </div>
      {menuOpen && (
        <nav className="border-t border-slate-200 bg-white px-4 py-4 lg:hidden">
          <div className="mb-3 rounded-xl border border-cobalt/20 bg-cobalt/5 px-3 py-2">
            <p className="text-xs font-semibold text-cobalt">Navigate by role and workflow</p>
          </div>
          <div className="grid gap-2">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.href}
                to={link.href}
                onClick={() => {
                  trackEvent({
                    eventName: "cta_click",
                    category: "navigation",
                    properties: { href: link.href, label: link.label, section: "mobile_nav" },
                  });
                }}
                className={({ isActive }) =>
                  `rounded-xl px-3 py-2.5 text-sm ${
                    isActive
                      ? "bg-cobalt/10 font-semibold text-cobalt"
                      : "text-slate-700 hover:bg-slate-50"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
          <a
            href="/early-access"
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
            onClick={() =>
              trackEvent({
                eventName: "cta_click",
                category: "conversion",
                properties: { href: "/early-access", label: "Get Started Mobile", section: "mobile_nav_cta" },
              })
            }
          >
            Get Started
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </nav>
      )}
    </header>
  );
}
