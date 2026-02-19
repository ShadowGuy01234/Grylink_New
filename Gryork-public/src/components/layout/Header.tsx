"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";
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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="container-custom">
        <div className="flex items-center justify-between h-18 py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Logo className="h-10 w-auto" />
            <span className="text-xl font-bold text-primary-900">Gryork</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-600 font-medium hover:text-primary-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA - Login Dropdown */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsLoginDropdownOpen(!isLoginDropdownOpen)}
                className="btn-primary flex items-center gap-2"
              >
                Login <ChevronDown size={16} />
              </button>
              {isLoginDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50">
                  <Link
                    href={PORTALS.subcontractor}
                    className="block px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                    onClick={() => setIsLoginDropdownOpen(false)}
                  >
                    <span className="font-medium block">Sub-Contractor</span>
                    <span className="block text-xs text-gray-500">
                      Upload bills & get funded
                    </span>
                  </Link>
                  <Link
                    href={PORTALS.partner}
                    className="block px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                    onClick={() => setIsLoginDropdownOpen(false)}
                  >
                    <span className="font-medium block">
                      Partner (EPC/NBFC)
                    </span>
                    <span className="block text-xs text-gray-500">
                      Manage deals & financing
                    </span>
                  </Link>
                  <hr className="my-2 border-gray-100" />
                  <Link
                    href={PORTALS.admin}
                    className="block px-4 py-2 text-gray-500 hover:bg-gray-50 transition-colors text-sm"
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
            className="lg:hidden p-2 text-gray-600"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          className={cn(
            "lg:hidden overflow-hidden transition-all duration-300",
            isMenuOpen ? "max-h-[500px] pb-4" : "max-h-0",
          )}
        >
          <nav className="flex flex-col gap-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-gray-600 font-medium hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 mt-4 px-4 border-t border-gray-100 pt-4">
              <span className="text-sm font-medium text-gray-500 mb-2">
                Login as:
              </span>
              <a
                href={PORTALS.subcontractor}
                className="btn-primary text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Sub-Contractor
              </a>
              <a
                href={PORTALS.partner}
                className="btn-secondary text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Partner (EPC/NBFC)
              </a>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
