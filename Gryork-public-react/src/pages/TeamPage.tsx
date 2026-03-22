type TeamMember = {
  name: string;
  role: string;
  group: "Leadership" | "Core Team" | "Technology & Engineering" | "Product & Development";
  photo: string;
  photoPosition?: string;
  bio?: string;
  summary?: string;
  highlights?: string[];
  links?: { label: string; href: string }[];
};

const members: TeamMember[] = [
  {
    name: "Aditya Kumar",
    role: "Founder & CEO",
    group: "Leadership",
    photo: "/team/aditya-kumar.jpeg",
    photoPosition: "object-top",
    summary: "Founder of GRYORK, building a trusted financing layer for India’s subcontractors.",
    bio: "A 2nd-year B.Tech CSE (Data Science) student at AKGEC, Aditya founded GRYORK after seeing delayed-payment struggles in his father’s 15+ years as a subcontractor.",
    highlights: [
      "Built the vision around solving India’s infrastructure payment bottleneck.",
      "Selected in PW School of Startups Aarambh 7.0.",
      "Recognized with Best Founder Award.",
      "Motto: “Be your own hero.”",
    ],
  },
  {
    name: "Virat Trivedi",
    role: "Co-Founder & COO",
    group: "Leadership",
    photo: "/team/virat-trivedi.jpeg",
    photoPosition: "object-top",
    summary: "Co-founder leading operations, execution excellence, and stakeholder growth.",
    bio: "Virat is a B.Tech student at AKGEC with a marketing certification from IIM Mumbai and prior startup experience as Co-founder of PureWashr Solutions Pvt. Ltd.",
    highlights: [
      "Leads strategy and execution for multi-stakeholder marketplace growth.",
      "Finalist at Disrupt 2025, IIT Guwahati.",
      "Recognized with Best Founder award from Pw SOS.",
    ],
  },
  {
    name: "Anshuman Singh",
    role: "CHRO",
    group: "Core Team",
    photo: "/team/anshuman-singh.jpeg",
    photoPosition: "object-[50%_18%]",
  },
  {
    name: "Abbas Saghir",
    role: "Digital Media Executive",
    group: "Core Team",
    photo: "/team/abbas-saghir.jpeg",
    photoPosition: "object-[50%_16%]",
  },
  {
    name: "Aryan Rai",
    role: "Growth & Community Associate",
    group: "Core Team",
    photo: "/team/aryan-rai.jpeg",
    photoPosition: "object-[50%_20%]",
  },
  {
    name: "Priyanshu Chaurasia",
    role: "Chief Technology Officer",
    group: "Technology & Engineering",
    photo: "/team/priyanshu-chaurasia.jpeg",
    photoPosition: "object-top",
    summary: "CTO architecting GRYORK’s AI-enabled bill intelligence and funding workflows.",
    bio: "A B.Tech CSE student at MMMUT Gorakhpur (2024-2028), Priyanshu combines product engineering with hackathon-proven leadership to build scalable fintech infrastructure.",
    highlights: [
      "Winner at IIT Bombay Techfest national-level hackathon.",
      "3x IIT Bombay finalist and 7x hackathon finalist.",
      "Builds full-stack, cloud, AI/ML-integrated systems for high-scale reliability.",
    ],
    links: [
      { label: "LinkedIn", href: "https://www.linkedin.com/in/priyanshu-chaurasia-326979335/" },
      { label: "GitHub", href: "https://github.com/priyanshu-chaurasia" },
      { label: "Email", href: "mailto:priyanshuchaurasiadlw@gmail.com" },
    ],
  },
  {
    name: "Anurag Banerjee",
    role: "Lead Software Engineer",
    group: "Technology & Engineering",
    photo: "/team/anurag-banerjee.jpeg",
    photoPosition: "object-[50%_16%]",
  },
  {
    name: "Amitesh Vishwakarma",
    role: "Chief AI Officer",
    group: "Technology & Engineering",
    photo: "/team/amitesh-vishwakarma.jpeg",
    photoPosition: "object-[50%_20%]",
  },
  {
    name: "Ritesh Yadav",
    role: "Junior Software Engineer",
    group: "Product & Development",
    photo: "/team/ritesh-yadav.jpeg",
    photoPosition: "object-[50%_18%]",
  },
  {
    name: "Rakshita",
    role: "Product Engineer (UI/UX)",
    group: "Product & Development",
    photo: "/team/rakshita.jpeg",
    photoPosition: "object-[50%_18%]",
  },
  {
    name: "Suryansh Gautam",
    role: "Product Engineer (UI/UX)",
    group: "Product & Development",
    photo: "/team/suryansh-gautam.jpeg",
    photoPosition: "object-[50%_16%]",
  },
];

const groups: TeamMember["group"][] = [
  "Leadership",
  "Core Team",
  "Technology & Engineering",
  "Product & Development",
];

export function TeamPage() {
  const leadership = members.filter(
    (m) =>
      m.name === "Aditya Kumar" ||
      m.name === "Virat Trivedi" ||
      m.name === "Priyanshu Chaurasia",
  );

  const teamGroups = groups.filter((group) => group !== "Leadership");

  return (
    <section className="page-section">
      <div className="container-page">
        <h1 className="heading-hero">Gryork Consultants Pvt Ltd Team</h1>
        <p className="text-muted mt-4 max-w-3xl">
          The people building India&apos;s infrastructure financing platform.
        </p>

        <div className="mt-10">
          <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">Leadership</h2>
          <p className="text-muted mt-2 max-w-3xl">
            Meet the founding and technology leaders driving Gryork&apos;s execution, product vision, and long-term trust.
          </p>

          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {leadership.map((member) => (
              <article key={member.name} className="glass-card overflow-hidden">
                <div className="aspect-[4/5] bg-slate-100 sm:aspect-[3/4]">
                  <img
                    src={member.photo}
                    alt={member.name}
                    className={`h-full w-full object-cover ${member.photoPosition ?? "object-center"}`}
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-semibold text-slate-900">{member.name}</h3>
                  <p className="text-cobalt text-sm font-semibold">{member.role}</p>
                  {member.summary && <p className="mt-2 text-sm font-medium text-slate-700">{member.summary}</p>}
                  {member.bio && <p className="text-muted mt-3 text-sm leading-relaxed">{member.bio}</p>}
                  {member.highlights && (
                    <ul className="mt-4 space-y-2 text-sm text-slate-700">
                      {member.highlights.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {member.links && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {member.links.map((link) => (
                        <a
                          key={link.label}
                          href={link.href}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
                        >
                          {link.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-12 space-y-10">
          {teamGroups.map((group) => {
            const list = members.filter((m) => m.group === group);
            return (
              <div key={group}>
                <h2 className="text-2xl font-semibold text-slate-900">{group}</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {list.map((member) => (
                    <article key={member.name} className="glass-card overflow-hidden">
                      <div className="aspect-[4/3] bg-slate-100">
                        <img
                          src={member.photo}
                          alt={member.name}
                          className={`h-full w-full object-cover ${member.photoPosition ?? "object-center"}`}
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-slate-900">{member.name}</h3>
                        <p className="text-sm text-cobalt">{member.role}</p>
                        {member.bio && <p className="text-muted mt-2 text-sm">{member.bio}</p>}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
