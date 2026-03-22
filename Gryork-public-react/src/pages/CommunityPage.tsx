export function CommunityPage() {
  const platforms = [
    {
      name: "WhatsApp",
      handle: "Join our group",
      description: "Get fast updates on bill discounting opportunities and ecosystem announcements.",
      href: "https://chat.whatsapp.com/JcL4X7RH2h821iNu3kotv0",
      tone: "bg-emerald-50 text-emerald-700",
    },
    {
      name: "Instagram",
      handle: "@gryork.official",
      description: "Follow educational infographics and short explainers on financing workflows.",
      href: "https://www.instagram.com/gryork.official/",
      tone: "bg-pink-50 text-pink-700",
    },
    {
      name: "Facebook",
      handle: "Gryork Community",
      description: "Participate in discussions with infrastructure and finance professionals.",
      href: "https://www.facebook.com/share/g/18QSWPWFHB/",
      tone: "bg-blue-50 text-blue-700",
    },
    {
      name: "LinkedIn",
      handle: "Gryork",
      description: "Track product updates, partnerships, and institutional market insights.",
      href: "https://www.linkedin.com/company/gryork",
      tone: "bg-cyan-50 text-cyan-700",
    },
  ];

  const whyJoin = [
    "Learn bill discounting and CWC concepts from practitioner-backed content",
    "Track policy and market updates relevant to infrastructure finance",
    "Connect with EPCs, NBFCs, and subcontractor operators in one network",
    "Get early access to platform updates and rollout announcements",
  ];

  return (
    <section className="page-section">
      <div className="mx-auto max-w-6xl px-4">
        <h1 className="heading-hero">Community</h1>
        <p className="text-muted mt-4">
          Learn, connect, and stay updated on infrastructure finance and bill discounting.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {platforms.map((platform) => (
            <div key={platform.name} className="glass-card p-6">
              <p className="font-semibold text-slate-900">{platform.name}</p>
              <p className={`mt-1 inline-flex rounded-full px-2 py-1 text-xs font-medium ${platform.tone}`}>{platform.handle}</p>
              <p className="mt-3 text-sm text-slate-600">{platform.description}</p>
              <a href={platform.href} target="_blank" rel="noreferrer" className="mt-4 inline-flex text-sm font-semibold text-cobalt hover:underline">
                Join channel →
              </a>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">Why Follow Gryork</h2>
            <ul className="mt-4 space-y-3">
              {whyJoin.map((item) => (
                <li key={item} className="text-slate-700">• {item}</li>
              ))}
            </ul>
          </div>
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">Community Preview</h2>
            <img src="/media/Community.png" alt="Gryork community visual" className="mt-4 h-[200px] w-full rounded-lg object-cover sm:h-[320px]" />
          </div>
        </div>
      </div>
    </section>
  );
}
