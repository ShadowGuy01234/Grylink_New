import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Code2, Lightbulb, BarChart3, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const tracks = [
  {
    id: "ai-web",
    icon: <Code2 className="w-6 h-6" />,
    title: "AI + Web Development",
    desc: "Build practical web-based projects using modern AI-assisted development workflows.",
  },
  {
    id: "startup",
    icon: <Lightbulb className="w-6 h-6" />,
    title: "Startup & Entrepreneurship",
    desc: "Understand how startups operate, convert ideas into products, and navigate innovation.",
  },
  {
    id: "productivity",
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Industry Productivity",
    desc: "Improve productivity, communication, professional branding, and workplace readiness.",
  },
];

export function TrackCards() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section className="section-pad bg-slate-50 dark:bg-transparent transition-colors duration-300" ref={ref}>
      <div className="page-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="badge-blue mb-4 inline-block">3 Specialization Tracks</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold mt-3 text-slate-900 dark:text-white">
            What You Will <span className="text-highlight">Learn</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {tracks.map((track, i) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="card p-6 sm:p-8 flex flex-col h-full bg-white dark:bg-[#060C1A] group"
            >
              <div className="w-14 h-14 rounded-2xl bg-gry-blue-main/10 dark:bg-gry-blue-main/20 flex items-center justify-center text-gry-blue-main dark:text-gry-blue-light mb-6 group-hover:scale-110 transition-transform">
                {track.icon}
              </div>
              <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-3">{track.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6 flex-grow">{track.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center"
        >
          <Link to="/program#tracks" className="inline-flex items-center text-gry-blue-main dark:text-gry-blue-light font-bold hover:underline underline-offset-4">
            View full curriculum for each track
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
