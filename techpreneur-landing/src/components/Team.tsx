import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const team = [
  {
    initials: "AD",
    name: "Aditya",
    role: "Founder",
    track: "Startup Track Lead",
    gradient: "from-violet-600 to-indigo-600",
    color: "text-violet-400",
    border: "border-violet-500/30",
  },
  {
    initials: "VR",
    name: "Virat",
    role: "Co-Founder",
    track: "Program Operations & Startup Track",
    gradient: "from-indigo-600 to-cyan-600",
    color: "text-cyan-400",
    border: "border-cyan-500/30",
  },
  {
    initials: "PC",
    name: "Priyanshu Chaurasia",
    role: "CTO",
    track: "AI + Web Track Lead",
    gradient: "from-violet-500 to-purple-600",
    color: "text-purple-400",
    border: "border-purple-500/30",
  },
  {
    initials: "AV",
    name: "Amitesh Vishwakarma",
    role: "Chief AI Officer",
    track: "AI Sessions & Curriculum",
    gradient: "from-blue-600 to-indigo-600",
    color: "text-blue-400",
    border: "border-blue-500/30",
  },
  {
    initials: "RY",
    name: "Ritesh Yadav",
    role: "Junior Software Engineer",
    track: "Frontend Development",
    gradient: "from-emerald-600 to-cyan-600",
    color: "text-emerald-400",
    border: "border-emerald-500/30",
  },
  {
    initials: "SY",
    name: "Suryansh",
    role: "Product Engineer",
    track: "Productivity Track Lead & UI/UX",
    gradient: "from-amber-500 to-orange-600",
    color: "text-amber-400",
    border: "border-amber-500/30",
  },
  {
    initials: "AS",
    name: "Abbas Sahghir",
    role: "Digital Media Executive",
    track: "Media, Reels & Promotions",
    gradient: "from-pink-600 to-rose-600",
    color: "text-pink-400",
    border: "border-pink-500/30",
  },
];

export default function Team() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section id="team" className="section-padding bg-gradient-to-b from-transparent via-violet-950/10 to-transparent" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="badge-violet mb-4 inline-block">Your Mentors</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold mt-3">
            Meet the <span className="gradient-text">Team</span>
          </h2>
          <p className="text-slate-400 mt-3 max-w-xl mx-auto">
            Practitioners, builders, and industry professionals who'll guide you every step of the way.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {team.map((member, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.09 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className={`glass-card rounded-2xl p-5 border ${member.border} cursor-default group text-center`}
            >
              {/* Avatar */}
              <div className={`mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br ${member.gradient} flex items-center justify-center text-white font-display font-bold text-xl mb-3 shadow-lg group-hover:scale-105 transition-transform`}>
                {member.initials}
              </div>
              <h3 className="font-display font-semibold text-white text-sm leading-tight">{member.name}</h3>
              <p className={`text-xs font-semibold ${member.color} mt-1`}>{member.role}</p>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">{member.track}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
