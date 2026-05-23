import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Award, Cpu, Lightbulb, Briefcase, Code2, Users, LinkedinIcon, FileText, Star, Network } from "lucide-react";

const highlights = [
  { icon: <Briefcase className="w-5 h-5" />, title: "Industry-Oriented Training" },
  { icon: <Cpu className="w-5 h-5" />, title: "AI & Modern Technology Exposure" },
  { icon: <Lightbulb className="w-5 h-5" />, title: "Startup & Entrepreneurship Learning" },
  { icon: <Code2 className="w-5 h-5" />, title: "Real-World Projects & Team Collaboration" },
  { icon: <Star className="w-5 h-5" />, title: "Practical Hands-On Sessions" },
  { icon: <LinkedinIcon className="w-5 h-5" />, title: "Portfolio & LinkedIn Building" },
  { icon: <Users className="w-5 h-5" />, title: "Industry Productivity Tools" },
  { icon: <Network className="w-5 h-5" />, title: "Mentorship & Career Guidance" },
  { icon: <Award className="w-5 h-5" />, title: "Professional Certification" },
  { icon: <FileText className="w-5 h-5" />, title: "Networking Opportunities" },
];

export default function Highlights() {
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
          <span className="badge-blue mb-4 inline-block">Program Highlights</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold mt-3 text-slate-900 dark:text-white">
            Why <span className="text-highlight">TechPreneur?</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-3 max-w-xl mx-auto text-sm sm:text-base">
            Everything you need to go from college student to industry-ready professional.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {highlights.map((h, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.05, ease: "easeOut" }}
              className="card p-5 flex flex-col items-center text-center gap-3 group"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gry-blue-main/10 dark:bg-gry-blue-main/20 flex items-center justify-center text-gry-blue-main dark:text-gry-blue-light group-hover:scale-110 transition-transform">
                {h.icon}
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-snug">{h.title}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
