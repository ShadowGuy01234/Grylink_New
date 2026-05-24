import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ChevronDown, Trophy, AlertCircle } from "lucide-react";

const weeks = [
  {
    week: "Week 1",
    theme: "Foundation & Industry Orientation",
    items: [
      "Introduction to Industry Ecosystem",
      "AI & Technology Fundamentals",
      "Entrepreneurship Basics",
      "Team Formation & SPOC Assignment",
      "Industry Tools Introduction",
    ],
    daily: "10:00–11:00 Main Session → 11:15–12:30 Practical Workshop → 12:30–1:00 Startup Discussion → 2:00–4:00 Project Work",
  },
  {
    week: "Week 2",
    theme: "Skill Development",
    items: [
      "Technical Workshops (Track-wise)",
      "Startup Ideation Sessions",
      "Branding & Productivity Tools",
      "Practical Assignments",
      "Mini Challenges & Team Competitions",
    ],
    daily: "Deepening track skills with real assignments and mini-challenges across all three specializations.",
  },
  {
    week: "Week 3",
    theme: "Product Building",
    items: [
      "Full-Team Project Kickoff",
      "MVP Development",
      "AI Integration into Products",
      "Mentorship Review Sessions",
      "Deployment Basics",
    ],
    daily: "Teams build their final projects under mentorship — the most intensive week of the program.",
  },
  {
    week: "Week 4",
    theme: "Final Execution & Demo Day",
    items: [
      "Project Completion & Polish",
      "Pitching & Presentation Training",
      "Career Guidance Sessions",
      "DEMO DAY — Live Presentations & Jury",
      "Awards, Certificates & Networking",
    ],
    daily: "The grand finale: students present projects, compete for awards, and receive their industry certificates.",
  },
];

export default function WeeklyPlan() {
  const [expanded, setExpanded] = useState<number | null>(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section className="section-pad bg-slate-50 dark:bg-[#030612] transition-colors duration-300" ref={ref}>
      <div className="page-container max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="badge-blue mb-4 inline-block">Program Structure</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold mt-3 text-slate-900 dark:text-white">
            4-Week <span className="text-highlight">Journey</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-3 max-w-xl mx-auto">
            Each week builds on the last — from orientation to final demo day.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-gry-blue-main/50 via-gry-blue-light/30 to-gry-blue-main/10 hidden sm:block rounded-full" />

          <div className="space-y-4">
            {weeks.map((w, i) => {
              const isOpen = expanded === i;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="sm:pl-16 relative"
                >
                  {/* Dot */}
                  <div className="absolute top-5 w-4 h-4 rounded-full bg-gry-blue-main border-4 border-slate-50 dark:border-[#030612] hidden sm:block shadow-sm" style={{ left: "1.125rem" }} />

                  <button
                    onClick={() => setExpanded(isOpen ? null : i)}
                    className={`w-full text-left card rounded-2xl px-6 py-5 transition-all duration-300 ${
                      isOpen ? "border-gry-blue-main ring-1 ring-gry-blue-main/50" : "hover:border-gry-blue-light/50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <span className={`font-display text-xs font-bold uppercase tracking-widest min-w-[60px] ${isOpen ? "text-gry-blue-main dark:text-gry-blue-light" : "text-slate-500"}`}>
                          {w.week}
                        </span>
                        <span className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                          {w.theme}
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${
                          isOpen ? "rotate-180 text-gry-blue-main" : "text-slate-400"
                        }`}
                      />
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-2 card-blue p-6">
                          <div className="grid sm:grid-cols-2 gap-8">
                            <div>
                              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Key Activities</p>
                              <ul className="space-y-3">
                                {w.items.map((item) => (
                                  <li key={item} className="flex items-start gap-2.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-gry-blue-main flex-shrink-0 mt-2" />
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Session Flow</p>
                              <p className="text-sm text-gry-blue-main dark:text-gry-blue-light leading-relaxed font-medium">{w.daily}</p>
                              {i === 3 && (
                                <div className="mt-5 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl flex items-start gap-3">
                                  <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                                  <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">Awards for Best Project, Best Innovation, Best Startup Idea, and Best Team will be announced.</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Daily schedule preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm"
        >
          <p className="text-xs font-bold text-gry-blue-main dark:text-gry-blue-light uppercase tracking-wider mb-5 text-center">Standard Daily Schedule</p>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { time: "10:00–11:00", label: "Main Session" },
              { time: "11:15–12:30", label: "Practical Workshop" },
              { time: "12:30–1:00",  label: "Startup Discussion" },
              { time: "2:00–4:00",   label: "Project & Mentorship" },
            ].map((s) => (
              <div key={s.time} className="bg-slate-50 dark:bg-[#030612] border border-slate-100 dark:border-white/5 rounded-xl p-4 text-center">
                <p className="text-slate-900 dark:text-white font-display font-bold">{s.time}</p>
                <p className="text-xs text-slate-500 mt-1 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-xl">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
              Detailed session schedule will be provided after registration and will be shared via email.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
