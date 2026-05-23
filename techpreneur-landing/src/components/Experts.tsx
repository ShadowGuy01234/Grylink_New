import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Code2, Rocket, Briefcase } from "lucide-react";

const categories = [
  {
    icon: <Code2 className="w-6 h-6" />,
    title: "Technology & AI Experts",
    desc: "Senior engineers, AI builders, and developers who write production code every day.",
  },
  {
    icon: <Rocket className="w-6 h-6" />,
    title: "Startup Founders",
    desc: "Entrepreneurs who have built real products, raised funds, and navigated the startup ecosystem.",
  },
  {
    icon: <Briefcase className="w-6 h-6" />,
    title: "Industry Professionals",
    desc: "Productivity, design, and management experts from top tech companies.",
  },
];

export default function Experts() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section className="section-pad bg-slate-50 dark:bg-[#030612] transition-colors duration-300" ref={ref}>
      <div className="page-container text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <span className="badge-blue mb-4 inline-block">Mentorship</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold mt-3 text-slate-900 dark:text-white">
            Sessions Led By <span className="text-highlight">Industry Professionals</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-4 max-w-2xl mx-auto">
            You won't be taught by regular trainers. Your sessions will be conducted by people who actually work in the industry.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {categories.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="card bg-white dark:bg-[#060C1A] p-8 group"
            >
              <div className="mx-auto w-16 h-16 rounded-2xl bg-gry-blue-main/10 dark:bg-gry-blue-main/20 flex items-center justify-center text-gry-blue-main dark:text-gry-blue-light mb-6 group-hover:scale-110 transition-transform">
                {c.icon}
              </div>
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white mb-3">{c.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{c.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
