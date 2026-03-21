import Link from "next/link";
import { Linkedin, Twitter, Mail } from "lucide-react";
import { FOOTER_LINKS } from "@/lib/constants";
import Logo from "./Logo";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary-900 text-white">
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Logo className="h-10 w-auto" />
              <span className="text-xl font-bold text-white">Gryork</span>
            </Link>
            <p className="text-gray-300 mb-6 max-w-sm">
              India&apos;s trusted bill discounting platform connecting
              sub-contractors with NBFCs for quick working capital.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a
                href="mailto:contact@gryork.com"
                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Platform</h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.platform.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Founding Member CTA Section */}
        <div className="bg-gradient-to-r from-accent-600 to-accent-500 text-white py-8 px-6 rounded-2xl my-12 text-center">
          <h3 className="text-2xl font-bold mb-2">Be a Founding Member</h3>
          <p className="text-white/90 mb-6">Join 500+ contractors. Get exclusive funding perks.</p>
          <Link
            href="/early-access"
            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white text-accent-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Claim Your Spot (15/20 Left)
          </Link>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-sm">
            © {currentYear} Gryork Technologies Pvt Ltd. All rights reserved.
          </p>
          <p className="text-gray-400 text-sm">
            Made with love in India
          </p>
        </div>
      </div>
    </footer>
  );
}

