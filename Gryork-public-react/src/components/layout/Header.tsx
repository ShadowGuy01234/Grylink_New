import { useState } from "react";
import { NavLink } from "react-router-dom";
import { NAV_LINKS } from "../../lib/constants";
import { trackEvent } from "../../lib/analytics";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-20">
        <NavLink to="/" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
          <img src="/logo.png" alt="Gryork logo" className="h-10 w-auto sm:h-14" />
          <span className="font-display text-xl font-semibold text-slate-900 sm:text-2xl">Gryork</span>
        </NavLink>
        <button
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-700 lg:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
            {menuOpen ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
        <nav className="hidden gap-3 lg:flex">
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
                `text-sm ${isActive ? "text-slate-900 font-semibold" : "text-slate-600 hover:text-slate-900"}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
      {menuOpen && (
        <nav className="border-t border-slate-200 bg-white px-4 py-3 lg:hidden">
          <div className="grid gap-2">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.href}
                to={link.href}
                onClick={() => {
                  setMenuOpen(false);
                  trackEvent({
                    eventName: "cta_click",
                    category: "navigation",
                    properties: { href: link.href, label: link.label, section: "mobile_nav" },
                  });
                }}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm ${isActive ? "bg-slate-100 font-semibold text-slate-900" : "text-slate-700 hover:bg-slate-50"}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
