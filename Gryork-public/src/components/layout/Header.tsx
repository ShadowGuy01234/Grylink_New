"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown, IndianRupee } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useScroll } from "@/components/ui/use-scroll";
import Logo from "./Logo";

// Portal URLs from environment
const PORTALS = {
  subcontractor: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5173",
  partner: process.env.NEXT_PUBLIC_PARTNER_URL || "http://localhost:5175",
  admin: process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:5177",
};

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginDropdownOpen, setIsLoginDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const scrolled = useScroll(10);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsLoginDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-18 py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Logo className="h-14 w-auto" />
            <span
              className={cn(
                "text-xl font-bold transition-colors",
                scrolled ? "text-primary-900" : "text-white"
              )}
            >
              Gryork
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors",
                  scrolled
                    ? "text-gray-600 hover:text-primary-600"
                    : "text-white/80 hover:text-white"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Get Funded — primary SC CTA */}
            <Link
              href={PORTALS.subcontractor}
              className={cn(
                "inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200",
                scrolled
                  ? "bg-accent-500 text-white hover:bg-accent-600 shadow-md shadow-accent-500/25 hover:-translate-y-0.5"
                  : "bg-accent-500 text-white hover:bg-accent-600 shadow-lg shadow-accent-500/30"
              )}
            >
              <IndianRupee className="w-3.5 h-3.5" />
              Get Funded
            </Link>

            {/* Login Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsLoginDropdownOpen(!isLoginDropdownOpen)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border transition-all duration-200",
                  scrolled
                    ? "border-gray-200 text-gray-700 hover:border-primary-300 hover:bg-primary-50"
                    : "border-white/30 text-white hover:bg-white/10 bg-white/10 backdrop-blur-sm"
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
                <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                  <Link
                    href={PORTALS.subcontractor}
                    className="block px-4 py-3 text-gray-700 hover:bg-accent-50 hover:text-accent-700 transition-colors rounded-lg mx-1"
                    onClick={() => setIsLoginDropdownOpen(false)}
                  >
                    <span className="font-semibold block text-sm">Sub-Contractor</span>
                    <span className="block text-xs text-gray-400">Upload bills &amp; get funded</span>
                  </Link>
                  <Link
                    href={PORTALS.partner}
                    className="block px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors rounded-lg mx-1"
                    onClick={() => setIsLoginDropdownOpen(false)}
                  >
                    <span className="font-semibold block text-sm">Partner (EPC / NBFC)</span>
                    <span className="block text-xs text-gray-400">Manage deals &amp; financing</span>
                  </Link>
                  <hr className="my-1 border-gray-100 mx-2" />
                  <Link
                    href={PORTALS.admin}
                    className="block px-4 py-2 text-gray-400 hover:bg-gray-50 text-xs rounded-lg mx-1"
                    onClick={() => setIsLoginDropdownOpen(false)}
                  >
                    Internal Login
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={cn(
              "lg:hidden p-2 rounded-lg transition-colors",
              scrolled
                ? "text-gray-600 hover:bg-gray-100"
                : "text-white hover:bg-white/10"
            )}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          className={cn(
            "lg:hidden overflow-hidden transition-all duration-300",
            isMenuOpen ? "max-h-[600px] pb-4" : "max-h-0"
          )}
        >
          <nav className="flex flex-col gap-1 bg-white rounded-2xl p-4 shadow-lg border border-gray-100 mt-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-3 text-gray-700 font-medium hover:text-primary-600 hover:bg-gray-50 rounded-xl transition-colors text-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-gray-100">
              <Link
                href={PORTALS.subcontractor}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-accent-500 text-white font-semibold rounded-xl text-sm hover:bg-accent-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <IndianRupee className="w-4 h-4" />
                Get Funded — Sub-Contractor
              </Link>
              <Link
                href={PORTALS.partner}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl text-sm hover:bg-gray-50 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Partner Login (EPC / NBFC)
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
