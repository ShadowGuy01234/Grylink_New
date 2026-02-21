"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Play,
  Zap,
  CheckCircle2,
  IndianRupee,
  Clock,
} from "lucide-react";

const SC_PORTAL_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5173";

const pipeline = [
  { label: "Submit Bill", icon: "📄", color: "bg-blue-100 text-blue-700" },
  { label: "EPC Verifies", icon: "✅", color: "bg-purple-100 text-purple-700" },
  { label: "50+ NBFCs Bid", icon: "🏦", color: "bg-amber-100 text-amber-700" },
  { label: "Funds in 48hrs", icon: "⚡", color: "bg-green-100 text-green-700" },
];

export default function Hero() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-hero" />

      {/* Radial top glow */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -top-14 -z-0 opacity-40"
        style={{
          background:
            "radial-gradient(35% 60% at 50% 0%, rgba(255,255,255,0.05), transparent)",
        }}
      />

      {/* Animated Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "60px 60px",
          }}
        />
        {/* Vertical border lines (reference design) */}
        <div
          aria-hidden="true"
          className="absolute inset-0 mx-auto hidden max-w-5xl lg:block pointer-events-none"
        >
          <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
          <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
          <div className="absolute inset-y-0 left-8 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
          <div className="absolute inset-y-0 right-8 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
        </div>

        {/* Gradient Orbs */}
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent-500/15 rounded-full blur-[100px]"
        />
      </div>

      <div className="container-custom relative z-10 pt-28 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            {mounted && (
              <motion.a
                href="#how-it-works"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/15 border border-white/25 backdrop-blur-sm mb-6 hover:bg-white/20 transition-colors cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-accent-300" />
                <span className="text-sm font-medium text-white">
                  50+ RBI-Registered NBFCs. Funds in 48 hours.
                </span>
                <ArrowRight className="w-3 h-3 text-white/60" />
              </motion.a>
            )}

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-5"
            >
              Stop Waiting{" "}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-red-300 to-red-400 bg-clip-text text-transparent">
                  90 Days
                </span>
              </span>
              .{" "}
              <span className="block mt-1">
                Get Paid in{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 bg-gradient-to-r from-accent-300 via-accent-400 to-accent-300 bg-clip-text text-transparent">
                    48 Hours
                  </span>
                  <motion.span
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 0.9, duration: 0.5 }}
                    className="absolute bottom-1 left-0 h-3 bg-accent-500/25 -z-0 rounded"
                  />
                </span>
                .
              </span>
            </motion.h1>

            {/* Sub-copy */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-blue-100 mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed"
            >
              Sub-contractors across India discount their bills on Gryork. One-time
              KYC, 100% digital, and 50+ NBFCs competing for your invoice.
            </motion.p>

            {/* Trust bullets */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-8"
            >
              {[
                "No collateral required",
                "₹1,000 flat platform fee",
                "Fully digital & paperless",
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-sm text-blue-100"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent-300 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link
                href={SC_PORTAL_URL}
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-accent-500 text-white font-semibold rounded-xl hover:bg-accent-600 transition-all duration-300 shadow-lg shadow-accent-500/30 hover:shadow-accent-500/50 hover:-translate-y-0.5"
              >
                <IndianRupee className="w-5 h-5" />
                Get Your Bills Funded
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/how-it-works"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/30 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300"
              >
                <Play className="w-4 h-4" />
                See How It Works
              </Link>
            </motion.div>
          </div>

          {/* Right — Mini Pipeline Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="hidden lg:block"
          >
            <div className="relative">
              {/* Card */}
              <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-400/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                  <div className="w-3 h-3 rounded-full bg-green-400/80" />
                  <span className="ml-2 text-xs text-white/50 font-mono">
                    gryork.com — your dashboard
                  </span>
                </div>

                {/* Pipeline steps */}
                <div className="space-y-3 mb-6">
                  {pipeline.map((step, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + i * 0.15 }}
                      className="flex items-center gap-4 bg-white/10 rounded-xl px-4 py-3.5 border border-white/10"
                    >
                      <span className="text-xl">{step.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white">
                          {step.label}
                        </p>
                      </div>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.8 + i * 0.15, type: "spring" }}
                      >
                        <CheckCircle2 className="w-5 h-5 text-accent-400" />
                      </motion.div>
                    </motion.div>
                  ))}
                </div>

                {/* Result pill */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.4, type: "spring" }}
                  className="bg-accent-500/20 border border-accent-400/40 rounded-xl p-4 text-center"
                >
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-accent-300" />
                    <span className="text-xs font-bold uppercase tracking-wider text-accent-200">
                      Disbursement Confirmed
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    ₹12,40,000
                  </p>
                  <p className="text-xs text-accent-300 mt-0.5">
                    Transferred to HDFC Bank •••• 8821
                  </p>
                </motion.div>

                {/* Timer badge */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.6 }}
                  className="absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-xl border border-gray-100 px-4 py-3 flex items-center gap-2"
                >
                  <Clock className="w-4 h-4 text-accent-600" />
                  <div>
                    <p className="text-xs font-bold text-primary-900 leading-none">
                      48 Hours
                    </p>
                    <p className="text-[10px] text-gray-500">avg. funding time</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2"
      >
        <span className="text-[10px] text-white/40 uppercase tracking-widest">
          Scroll to explore
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-5 h-9 rounded-full border-2 border-white/25 flex justify-center pt-1.5"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1 h-1 bg-white rounded-full"
          />
        </motion.div>
      </motion.div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
        >
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
}

// Animated Counter Component
function AnimatedCounter({ value, suffix = "", prefix = "" }: { value: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
}

// Parse stat value for animation
function parseStatValue(value: string): { num: number; prefix: string; suffix: string } {
  const match = value.match(/^([₹]?)(\d+)(.*)$/);
  if (match) {
    return { prefix: match[1], num: parseInt(match[2]), suffix: match[3] };
  }
  return { prefix: "", num: 0, suffix: value };
}

