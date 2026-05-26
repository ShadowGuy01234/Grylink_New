import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ShieldCheck, ArrowRight, RotateCcw, AlertCircle } from "lucide-react";
import { useStudentAuth } from "../context/StudentAuthContext";

export function LoginPage() {
  const { student, loading, sendOTP, verifyOTP } = useStudentAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);

  // Already logged in
  if (!loading && student) return <Navigate to="/dashboard" replace />;

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await sendOTP(email.trim().toLowerCase());
      setOtpSent(true);
      setStep("otp");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await verifyOTP(email.trim().toLowerCase(), otp.trim());
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await sendOTP(email.trim().toLowerCase());
      setOtp("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0B1120] to-[#0A0F24] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-br from-blue-600/10 to-transparent blur-[120px]" 
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 200, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-tl from-indigo-600/10 to-transparent blur-[120px]" 
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 shadow-[0_0_40px_rgba(79,70,229,0.3)] mb-6 relative group"
          >
            <div className="absolute inset-0 bg-white/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <ShieldCheck className="w-10 h-10 text-white relative z-10" />
          </motion.div>
          <motion.h1 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 mb-2"
          >
            Student Portal
          </motion.h1>
          <motion.p 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-sm font-medium"
          >
            Secure access to your TechPreneur dashboard
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="relative group"
        >
          {/* Glass Card Glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-3xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative bg-[#0F172A]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden">
            {/* Subtle Inner Highlight */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <AnimatePresence mode="wait">
              {step === "email" ? (
                <motion.div
                  key="email"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-8">
                    <h2 className="text-white font-semibold text-xl mb-2">Welcome back</h2>
                    <p className="text-slate-400 text-sm">
                      Enter your registered email to receive a secure login code.
                    </p>
                  </div>

                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl p-4 text-sm mb-6"
                    >
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      {error}
                    </motion.div>
                  )}

                  <form onSubmit={handleSendOTP} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                      <div className="relative group/input">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-xl blur opacity-0 group-focus-within/input:opacity-100 transition-opacity" />
                        <div className="relative flex items-center">
                          <Mail className="absolute left-4 w-5 h-5 text-slate-400 group-focus-within/input:text-blue-400 transition-colors" />
                          <input
                            type="email"
                            required
                            placeholder="student@college.edu"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-[#1E293B]/50 border border-white/5 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-[#1E293B] transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="relative w-full group overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-xl font-medium text-sm transition-all disabled:opacity-70"
                    >
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                      <div className="relative flex items-center justify-center gap-2">
                        {submitting ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <><span>Send Magic Code</span><ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                        )}
                      </div>
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="otp"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-8">
                    <h2 className="text-white font-semibold text-xl mb-2">Check your email</h2>
                    <p className="text-slate-400 text-sm">
                      We sent a 6-digit code to <span className="text-white font-medium">{email}</span>
                    </p>
                  </div>

                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl p-4 text-sm mb-6"
                    >
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      {error}
                    </motion.div>
                  )}

                  <form onSubmit={handleVerifyOTP} className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-slate-300">Authentication Code</label>
                      </div>
                      <div className="relative group/input">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-focus-within/input:opacity-100 transition-opacity" />
                        <input
                          type="text"
                          required
                          maxLength={6}
                          inputMode="numeric"
                          pattern="[0-9]{6}"
                          placeholder="••••••"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                          className="relative w-full bg-[#1E293B]/50 border border-white/5 rounded-xl px-4 py-4 text-white placeholder-slate-600 text-3xl font-mono tracking-[0.5em] text-center focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 focus:bg-[#1E293B] transition-all"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || otp.length !== 6}
                      className="relative w-full group overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 rounded-xl font-medium text-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                      <div className="relative flex items-center justify-center gap-2">
                        {submitting ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <><ShieldCheck className="w-4 h-4" /><span>Verify &amp; Access Dashboard</span></>
                        )}
                      </div>
                    </button>
                  </form>

                  <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => { setStep("email"); setError(null); setOtp(""); }}
                      className="text-slate-400 hover:text-white text-sm transition-colors flex items-center gap-1.5"
                    >
                      <ArrowRight className="w-3 h-3 rotate-180" /> Change Email
                    </button>
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={submitting}
                      className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 text-sm transition-colors disabled:opacity-50"
                    >
                      <RotateCcw className="w-3 h-3" /> Resend Code
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-slate-500 text-sm mt-8"
        >
          Secure access for enrolled students only. <br className="sm:hidden" />
          Need help? <a href="mailto:support@gryork.com" className="text-slate-300 hover:text-white transition-colors underline decoration-slate-600 underline-offset-4">Contact Support</a>
        </motion.p>
      </div>
    </div>
  );
}
