import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Code2, Lightbulb, BarChart3, CheckCircle2 } from "lucide-react";

const tracks = [
  {
    id: "ai-web",
    icon: <Code2 className="w-5 h-5" />,
    label: "Track 01",
    title: "AI + Web Development",
    tagline: "Build the future with AI-powered tools",
    topics: [
      "Web Development Fundamentals",
      "Frontend Development & React.js",
      "APIs & AI Integration",
      "Prompt Engineering",
      "AI Productivity Tools",
      "Git & GitHub",
      "Deployment & Hosting",
      "Real Project Development",
    ],
    outcome: "Build practical web-based projects using modern AI-assisted development workflows",
  },
  {
    id: "startup",
    icon: <Lightbulb className="w-5 h-5" />,
    label: "Track 02",
    title: "Startup & Entrepreneurship",
    tagline: "Think like a founder, build like a team",
    topics: [
      "Startup Fundamentals",
      "Idea Validation",
      "Business Models & MVP",
      "Branding & Positioning",
      "Social Media Growth",
      "Pitch Deck Creation",
      "Startup Team Building",
      "Product Thinking",
    ],
    outcome: "Understand how startups operate, convert ideas into products, and navigate innovation ecosystems",
  },
  {
    id: "productivity",
    icon: <BarChart3 className="w-5 h-5" />,
    label: "Track 03",
    title: "Industry Productivity Tools",
    tagline: "Level up your professional presence",
    topics: [
      "LinkedIn Optimization",
      "Resume Building",
      "AI Productivity Systems",
      "Team Collaboration Tools",
      "Documentation & Workflow",
      "Professional Communication",
      "Time Management",
      "Digital Organization",
    ],
    outcome: "Improve productivity, communication, professional branding, and workplace readiness",
  },
];

export default function Tracks() {
  const [active, setActive] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const t = tracks[active];

  return (
    <section id="tracks" className="section-pad" ref={ref}>
      <div className="page-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="badge-blue mb-4 inline-block">Training Tracks</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold mt-3 text-slate-900 dark:text-white">
            Choose Your <span className="text-highlight">Specialization</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-3 max-w-xl mx-auto">
            Three industry-aligned tracks. Each with expert mentors, real projects, and tangible outcomes.
          </p>
        </motion.div>

        {/* Tab selectors */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          {tracks.map((track, i) => (
            <motion.button
              key={track.id}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              onClick={() => setActive(i)}
              className={`flex-1 p-5 rounded-2xl border text-left transition-all duration-300 ${
                active === i
                  ? "bg-gry-blue-main text-white shadow-blue-glow border-transparent"
                  : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-gry-blue-light/50 text-slate-700 dark:text-slate-300"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${active === i ? "bg-white/20 text-white" : "bg-gry-blue-main/10 text-gry-blue-main dark:text-gry-blue-light"}`}>
                  {track.icon}
                </div>
                <p className={`text-xs font-bold uppercase tracking-widest ${active === i ? "text-white/80" : "text-slate-500"}`}>
                  {track.label}
                </p>
              </div>
              <p className="font-display font-bold text-base leading-tight mt-1">{track.title}</p>
            </motion.button>
          ))}
        </div>

        {/* Active track detail */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="card p-8"
          >
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Left */}
              <div>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">{t.title}</h3>
                <p className="text-gry-blue-main dark:text-gry-blue-light font-medium mb-8">{t.tagline}</p>

                <div className="bg-slate-50 dark:bg-white/5 p-5 rounded-xl border border-slate-200 dark:border-white/10">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Track Outcome</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{t.outcome}</p>
                </div>
              </div>

              {/* Right — topics */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Topics Covered</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {t.topics.map((topic, i) => (
                    <motion.div
                      key={topic}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-2.5"
                    >
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-gry-blue-main mt-0.5" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-snug">{topic}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
