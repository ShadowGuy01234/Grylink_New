import { motion } from "framer-motion";
import { useStudentAuth } from "../../context/StudentAuthContext";
import { Calendar, Video, Bell, Gift, BookOpen, Clock, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4 } }),
};

export function DashboardHome() {
  const { student } = useStudentAuth();
  if (!student) return null;

  const quickLinks = [
    { to: "/dashboard/schedule", icon: Calendar, label: "View Schedule", color: "from-blue-500 to-blue-700", desc: "Weekly session timetable" },
    { to: "/dashboard/meetings", icon: Video, label: "Meeting Links", color: "from-indigo-500 to-indigo-700", desc: "Today's Google Meet links" },
    { to: "/dashboard/announcements", icon: Bell, label: "Announcements", color: "from-amber-500 to-orange-600", desc: "Latest updates from admin" },
    { to: "/dashboard/projects", icon: BookOpen, label: "Submit Project", color: "from-emerald-500 to-green-700", desc: "GitHub & Drive link upload" },
    { to: "/dashboard/referrals", icon: Gift, label: "Referral Rewards", color: "from-purple-500 to-violet-700", desc: "Earn ₹100 per referral" },
  ];

  const sessionTiming = [
    { day: "Mon–Fri", time: "10:00 AM – 11:00 AM", type: "Daily Session" },
    { day: "Opening Day", time: "10:00 AM – 12:00 PM", type: "Special" },
    { day: "Saturday", time: "6:00 PM – 7:00 PM", type: "Guest Session" },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Hero greeting */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-6 sm:p-8 text-white"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-blue-200" />
            <span className="text-blue-200 text-sm font-medium">TechPreneur 2026</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold mb-2">
            Welcome back, {student.name.split(" ")[0]}! 👋
          </h1>
          <p className="text-blue-100 text-sm sm:text-base">
            You're enrolled in <span className="font-semibold text-white">{student.track}</span>
          </p>
          <div className="flex flex-wrap gap-3 mt-4 text-xs">
            <span className="bg-white/15 border border-white/20 rounded-full px-3 py-1">{student.college}</span>
            <span className="bg-white/15 border border-white/20 rounded-full px-3 py-1">{student.branch} · {student.year}</span>
            <span className="bg-green-400/20 border border-green-400/30 text-green-200 rounded-full px-3 py-1">✓ Payment Verified</span>
          </div>
        </div>
      </motion.div>

      {/* Quick links grid */}
      <div>
        <h2 className="text-white font-semibold text-sm uppercase tracking-wider mb-3 opacity-60">Quick Access</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map(({ to, icon: Icon, label, color, desc }, i) => (
            <motion.div key={to} custom={i} variants={cardVariants} initial="hidden" animate="visible">
              <Link
                to={to}
                className="flex items-start gap-4 p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all group"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{label}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Session schedule info */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/5 border border-white/10 rounded-xl p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-blue-400" />
          <h2 className="text-white font-semibold text-sm">Session Timings</h2>
        </div>
        <div className="space-y-2">
          {sessionTiming.map((s, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
              <div>
                <p className="text-white text-sm font-medium">{s.day}</p>
                <p className="text-slate-400 text-xs">{s.type}</p>
              </div>
              <span className="text-blue-300 text-sm font-mono">{s.time}</span>
            </div>
          ))}
        </div>
        <Link
          to="/dashboard/schedule"
          className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs mt-3 transition-colors"
        >
          View full schedule →
        </Link>
      </motion.div>

      {/* Referral code callout */}
      {student.referralCode && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-purple-900/40 to-violet-900/40 border border-purple-500/20 rounded-xl p-5"
        >
          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-4 h-4 text-purple-400" />
            <h3 className="text-white font-semibold text-sm">Your Referral Code</h3>
          </div>
          <p className="text-slate-400 text-xs mb-3">Share this code with friends. They get ₹200 off, you earn ₹100 cashback after 2 successful referrals!</p>
          <div className="flex items-center gap-3">
            <code className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-purple-300 font-mono font-bold text-lg tracking-widest">
              {student.referralCode}
            </code>
            <button
              onClick={() => { navigator.clipboard.writeText(student.referralCode!); }}
              className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
            >
              Copy
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
