import { NavLink } from "react-router-dom";
import { FOOTER_LINKS } from "../../lib/constants";
import { trackEvent } from "../../lib/analytics";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white/70 py-10">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 md:grid-cols-4">
        <div>
          <p className="font-display text-lg font-semibold text-slate-900">Gryork</p>
          <p className="mt-2 text-sm text-slate-600">Infrastructure bill discounting platform.</p>
          <p className="mt-3 text-xs text-slate-500">© {new Date().getFullYear()} Gryork Consultants Pvt Ltd</p>
          <p className="mt-2 text-xs text-slate-500">
            Gryork Consultant Pvt Ltd · DPIIT Number DIPP241764 · Recognised by DPIIT Startup India
          </p>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold text-slate-900">Platform</p>
          <div className="space-y-1">
            {FOOTER_LINKS.platform.map((x) => (
              <div key={x.href}>
                <NavLink
                  to={x.href}
                  onClick={() =>
                    trackEvent({
                      eventName: "cta_click",
                      category: "navigation",
                      properties: { href: x.href, label: x.label, section: "footer_platform" },
                    })
                  }
                  className="text-sm text-slate-600 hover:text-slate-900"
                >
                  {x.label}
                </NavLink>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold text-slate-900">Company</p>
          <div className="space-y-1">
            {FOOTER_LINKS.company.map((x) => (
              <div key={x.href}>
                <NavLink
                  to={x.href}
                  onClick={() =>
                    trackEvent({
                      eventName: "cta_click",
                      category: "navigation",
                      properties: { href: x.href, label: x.label, section: "footer_company" },
                    })
                  }
                  className="text-sm text-slate-600 hover:text-slate-900"
                >
                  {x.label}
                </NavLink>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold text-slate-900">Legal</p>
          <div className="space-y-1">
            {FOOTER_LINKS.legal.map((x) => (
              <div key={x.href}>
                <NavLink
                  to={x.href}
                  onClick={() =>
                    trackEvent({
                      eventName: "cta_click",
                      category: "navigation",
                      properties: { href: x.href, label: x.label, section: "footer_legal" },
                    })
                  }
                  className="text-sm text-slate-600 hover:text-slate-900"
                >
                  {x.label}
                </NavLink>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
