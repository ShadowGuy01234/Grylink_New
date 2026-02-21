"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, IndianRupee } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useScroll } from "@/components/ui/use-scroll";
import Logo from "./Logo";

const PORTALS = {
  subcontractor: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5173",
  partner: process.env.NEXT_PUBLIC_PARTNER_URL || "http://localhost:5175",
  admin: process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:5177",
};

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginDropdownOpen, setIsLoginDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const scrolled = useScroll(20);
  const pathname = usePathname();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsLoginDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMenuOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pt-3 pb-2 px-4">
      {/* ── Floating pill container ── */}
      <div
        className={cn(
          "mx-auto max-w-7xl rounded-2xl transition-all duration-300 ease-in-out",
          scrolled
            ? "bg-white shadow-[0_8px_32px_rgba(10,36,99,0.12)] border border-gray-100/80"
            : "bg-white/10 border border-white/20 backdrop-blur-md shadow-[0_4px_24px_rgba(0,0,0,0.18)]"
        )}
      >
        <div className="flex items-center justify-between px-4 py-2.5">

          {/* ── Logo ── */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <Logo className="h-12 w-auto" />
            <span
              className={cn(
                "text-lg font-bold tracking-tight transition-colors",
                scrolled ? "text-primary-900" : "text-white"
              )}
            >
              Gryork
            </span>
          </Link>

          {/* ── Desktop nav ── */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200",
                    scrolled
                      ? isActive
                        ? "text-primary-700 bg-primary-50"
                        : "text-gray-600 hover:text-primary-700 hover:bg-gray-50"
                      : isActive
                        ? "text-white bg-white/15"
                        : "text-white/75 hover:text-white hover:bg-white/10"
                  )}
                >
                  {link.label}
                  {isActive && (
                    <span
                      className={cn(
                        "absolute bottom-0.5 left-1/2 -translate-x-1/2 w-3/5 h-0.5 rounded-full",
                        scrolled ? "bg-primary-500" : "bg-white/60"
                      )}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ── Desktop CTAs ── */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Divider */}
            <div
              className={cn(
                "w-px h-6 mx-1 rounded-full",
                scrolled ? "bg-gray-200" : "bg-white/20"
              )}
            />

            {/* Get Funded */}
            <Link
              href={PORTALS.subcontractor}
              className={cn(
                "inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 active:scale-95",
                "bg-accent-500 text-white hover:bg-accent-600",
                scrolled
                  ? "shadow-md shadow-accent-500/30 hover:shadow-accent-500/40 hover:-translate-y-0.5"
                  : "shadow-lg shadow-accent-900/30"
              )}
            >
              <IndianRupee className="w-3.5 h-3.5" />
              Get Funded
            </Link>

            {/* Login dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsLoginDropdownOpen(!isLoginDropdownOpen)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200 active:scale-95",
                  scrolled
                    ? "border-gray-200 text-gray-700 hover:border-primary-200 hover:bg-primary-50"
                    : "border-white/30 text-white hover:bg-white/15 bg-white/8"
                )}
              >
                Login
                <ChevronDown
                  size={14}
                  className={cn(
                    "transition-transform duration-200",
                    isLoginDropdownOpen && "rotate-180"
                  )}
                />
              </button>

              {isLoginDropdownOpen && (
                <div className="absolute right-0 top-full mt-2.5 w-64 bg-white rounded-2xl shadow-2xl shadow-gray-900/15 border border-gray-100 py-2 z-50 overflow-hidden">
                  {/* SC option */}
                  <Link
                    href={PORTALS.subcontractor}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-accent-50 transition-colors group mx-1 rounded-xl"
                    onClick={() => setIsLoginDropdownOpen(false)}
                  >
                    <span className="mt-0.5 w-8 h-8 rounded-lg bg-accent-100 text-accent-700 flex items-center justify-center text-sm shrink-0 group-hover:bg-accent-200 transition-colors">
                      🏗️
                    </span>
                    <span>
                      <span className="font-semibold block text-sm text-gray-800">Sub-Contractor</span>
                      <span className="block text-xs text-gray-400 mt-0.5">Upload bills &amp; get funded</span>
                    </span>
                  </Link>
                  {/* Partner option */}
                  <Link
                    href={PORTALS.partner}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-primary-50 transition-colors group mx-1 rounded-xl"
                    onClick={() => setIsLoginDropdownOpen(false)}
                  >
                    <span className="mt-0.5 w-8 h-8 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center text-sm shrink-0 group-hover:bg-primary-200 transition-colors">
                      🏦
                    </span>
                    <span>
                      <span className="font-semibold block text-sm text-gray-800">Partner (EPC / NBFC)</span>
                      <span className="block text-xs text-gray-400 mt-0.5">Manage deals &amp; financing</span>
                    </span>
                  </Link>
                  <div className="my-1.5 mx-4 border-t border-gray-100" />
                  <Link
                    href={PORTALS.admin}
                    className="block px-4 py-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 text-xs rounded-xl mx-1 transition-colors"
                    onClick={() => setIsLoginDropdownOpen(false)}
                  >
                    Internal / Admin Login
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* ── Mobile hamburger ── */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={cn(
              "lg:hidden p-2 rounded-xl transition-colors",
              scrolled ? "text-gray-600 hover:bg-gray-100" : "text-white hover:bg-white/15"
            )}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* ── Mobile drawer (slides inside pill) ── */}
        <div
          className={cn(
            "lg:hidden overflow-hidden transition-all duration-300",
            isMenuOpen ? "max-h-[500px]" : "max-h-0"
          )}
        >
          <div className="px-3 pb-3 border-t border-white/10">
            <nav className="flex flex-col mt-2">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                      scrolled
                        ? isActive
                          ? "text-primary-700 bg-primary-50"
                          : "text-gray-700 hover:bg-gray-50"
                        : isActive
                          ? "text-white bg-white/15"
                          : "text-white/80 hover:bg-white/10 hover:text-white"
                    )}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
            <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-white/10">
              <Link
                href={PORTALS.subcontractor}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-accent-500 text-white font-semibold rounded-full text-sm hover:bg-accent-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <IndianRupee className="w-3.5 h-3.5" />
                Get Funded
              </Link>
              <Link
                href={PORTALS.partner}
                className={cn(
                  "inline-flex items-center justify-center px-4 py-2.5 rounded-full text-sm font-medium transition-colors border",
                  scrolled
                    ? "border-gray-200 text-gray-700 hover:bg-gray-50"
                    : "border-white/30 text-white hover:bg-white/10"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                Partner Login (EPC / NBFC)
              </Link>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
}

