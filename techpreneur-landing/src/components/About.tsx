import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Rocket, Target, Users } from "lucide-react";

const differentiators = [
  {
    icon: <Rocket className="w-6 h-6" />,
    title: "Not Theory — Real Execution",
    desc: "You won't sit through lectures. You'll build real products, work in teams, and face actual industry challenges — just like a startup.",
  },
  {
    icon: <Target className="w-6 h-6" />,
    title: "Startup Culture, Not Classroom",
    desc: "The environment is modeled on how actual startups function. SPOCs, team leads, daily standups, demo days — the full experience.",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Industry Mentors, Not Just Trainers",
    desc: "Learn from people who build products, run startups, and solve real engineering problems — not just educators reciting slides.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.15, ease: "easeOut" },
  }),
};

export default function About() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="about" className="section-pad relative bg-white dark:bg-transparent transition-colors duration-300" ref={ref}>
      <div className="page-container relative z-10">
        {/* Label */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-4"
        >
          <span className="badge-blue">About the Program</span>
        </motion.div>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-6 text-slate-900 dark:text-white"
        >
          This Is <span className="text-highlight">Not Your Regular</span>
          <br />
          Summer Training
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-slate-600 dark:text-slate-400 text-base sm:text-lg text-center max-w-3xl mx-auto mb-16 leading-relaxed"
        >
          TechPreneur Industrial Training 2026 is a 4-week industry-oriented program that bridges the gap between
          academics and the real world. We combine AI, technology, entrepreneurship, and practical projects
          to help you become genuinely industry-ready — not just certificate-ready.
        </motion.p>

        {/* Differentiators grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {differentiators.map((d, i) => (
            <motion.div
              key={i}
              custom={i}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              variants={fadeUp}
              className="card-blue p-6 cursor-default group"
            >
              <div className="mb-4 w-12 h-12 rounded-xl bg-gry-blue-main/10 dark:bg-gry-blue-main/20 flex items-center justify-center text-gry-blue-main dark:text-gry-blue-light group-hover:scale-110 transition-transform">
                {d.icon}
              </div>
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white mb-2">{d.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{d.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          {[
            { value: "4", unit: "Weeks", label: "Intensive Program" },
            { value: "3", unit: "Tracks", label: "Specialization Areas" },
            { value: "7+", unit: "Mentors", label: "Industry Experts" },
            { value: "1", unit: "Certificate", label: "Industry Recognized" },
          ].map((stat, i) => (
            <div key={i} className="card p-5 text-center">
              <div className="font-display text-3xl font-bold text-gry-blue-main dark:text-gry-blue-light">{stat.value}</div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">{stat.unit}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
