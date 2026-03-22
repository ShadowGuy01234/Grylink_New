import { Link } from "react-router-dom";
import { CAREER_ROLES } from "../lib/constants";

export function CareersPage() {
  const culture = [
    "Product-first, execution-focused team",
    "FinTech + Infrastructure domain exposure",
    "High ownership and rapid shipping cycles",
  ];

  return (
    <section className="page-section">
      <div className="mx-auto max-w-6xl px-4">
        <h1 className="heading-hero">Careers</h1>
        <p className="text-muted mt-4">Join us to build the future of infrastructure finance.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {culture.map((item) => (
            <div key={item} className="glass-card p-5 text-slate-700">
              {item}
            </div>
          ))}
        </div>
        <div className="mt-8 grid gap-4">
          {CAREER_ROLES.map((role) => (
            <div key={role.slug} className="glass-card p-6">
              <p className="text-xl font-semibold text-slate-900">{role.title}</p>
              <p className="mt-1 text-sm text-slate-500">
                {role.department} · {role.location} · {role.type}
              </p>
              <p className="text-muted mt-3">{role.description}</p>
              <Link to={`/careers/${role.slug}`} className="mt-4 inline-flex rounded-lg bg-cobalt px-4 py-2 text-sm font-semibold text-white">
                View Role
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
