"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Building2, Landmark, ArrowRight, HardHat } from "lucide-react";
import { useActiveRole, type ActiveRole } from "@/context/ActiveRoleContext";
import { cn } from "@/lib/utils";
import { trackRoleToggle } from "@/lib/analytics";

const ROLE_CONTENT: Record<
  ActiveRole,
  { title: string; subtitle: string; cta: string; href: string; icon: React.ComponentType<{ className?: string }> }
> = {
  subcontractor: {
    title: "Stop Waiting 90 Days. Get Paid in 48 Hours.",
    subtitle:
      "Convert validated EPC bills into working capital through a fully digital and secure marketplace.",
    cta: "Get Your Bills Funded",
    href: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5173",
    icon: HardHat,
  },
  epc: {
    title: "Strengthen Your Supply Chain. Zero Financial Burden.",
    subtitle:
      "Support subcontractor liquidity with fast financing while preserving your existing payment cycle.",
    cta: "Partner as EPC",
    href: "/for-epc",
    icon: Building2,
  },
  nbfc: {
    title: "Access Pre-Verified Infrastructure Deals.",
    subtitle:
      "Evaluate structured, document-ready opportunities with risk context and faster decision throughput.",
    cta: "Apply for Partnership",
    href: "/for-nbfc",
    icon: Landmark,
  },
};

const roles: { key: ActiveRole; label: string }[] = [
  { key: "subcontractor", label: "Sub-Contractor" },
  { key: "epc", label: "EPC" },
  { key: "nbfc", label: "NBFC" },
];

export default function HeroDynamicRole() {
  const { activeRole, setActiveRole } = useActiveRole();
  const content = ROLE_CONTENT[activeRole];
  const RoleIcon = content.icon;

  return (
    <section className="relative min-h-screen bg-[var(--bg-base)] overflow-hidden pt-32 pb-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.20),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.16),transparent_40%)]" />
      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex p-1 rounded-full bg-white/5 border border-white/10 mb-6">
              {roles.map((r) => (
                <button
                  key={r.key}
                  onClick={() => {
                    setActiveRole(r.key);
                    trackRoleToggle(r.key);
                  }}
                  className={cn(
                    "px-4 py-2 text-sm rounded-full transition-all",
                    activeRole === r.key ? "bg-white text-slate-900 font-semibold" : "text-gray-300 hover:text-white"
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <motion.h1
              key={content.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="text-display text-4xl md:text-5xl font-bold text-white leading-tight"
            >
              {content.title}
            </motion.h1>

            <motion.p
              key={content.subtitle}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 }}
              className="mt-5 text-gray-300 max-w-2xl"
            >
              {content.subtitle}
            </motion.p>

            <Link
              href={content.href}
              className="inline-flex mt-8 items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold transition-colors"
            >
              <RoleIcon className="w-4 h-4" />
              {content.cta}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="glass-card p-6 bg-white/[0.03]">
            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-4">Live Workflow Preview</p>
              <div className="space-y-3">
                {["Bill Submitted", "EPC Verified", "NBFC Offer Accepted", "Funds Transferred"].map((s, i) => (
                  <motion.div
                    key={s}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2"
                  >
                    <span className="text-sm text-gray-200">{s}</span>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full", i < 3 ? "bg-amber-500/20 text-amber-300" : "bg-emerald-500/20 text-emerald-300")}>
                      {i < 3 ? "Processing" : "Completed"}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
