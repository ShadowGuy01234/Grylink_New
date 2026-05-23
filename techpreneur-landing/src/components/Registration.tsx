import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Upload, QrCode, AlertCircle, Copy, CheckCircle2 } from "lucide-react";
import { getCurrentPricing, submitRegistration } from "../lib/api";

export default function Registration() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const { phase: currentPhase } = getCurrentPricing();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    college: "",
    branch: "",
    year: "",
    trackPreference: "AI + Web Development",
    transactionId: "",
  });
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Price calculation based on phase
  let price = currentPhase?.amount || 799;
  let originalPrice = currentPhase?.originalAmount || 5999;

  const handleCopy = () => {
    navigator.clipboard.writeText("gryork@paytm");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!screenshot) {
      setError("Please upload your payment screenshot.");
      return;
    }

    setLoading(true);
    try {
      await submitRegistration({
        ...formData,
        feeAmount: price,
        registrationPhase: currentPhase,
        screenshot,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm text-center">
        <div className="w-16 h-16 bg-gry-green/10 rounded-full flex items-center justify-center mx-auto mb-6 text-gry-green">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Registration Submitted!</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          We've received your details. Our team will verify the payment and send a confirmation email within 24 hours.
        </p>
        <button onClick={() => setSuccess(false)} className="btn-primary">
          Submit Another
        </button>
      </div>
    );
  }

  return (
    <div className="page-container max-w-5xl">
      <div className="grid md:grid-cols-5 gap-8">
        {/* Left Column: Payment Info */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl p-6 border border-slate-200 dark:border-white/10 shadow-sm">
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-gry-blue-main" />
              Scan to Pay
            </h3>

            <div className="aspect-square bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 flex flex-col items-center justify-center p-6 mb-6">
              {/* Replace src below with actual QR code when provided */}
              <div className="w-full h-full bg-slate-200 dark:bg-white/10 rounded-lg flex items-center justify-center overflow-hidden border border-slate-300 dark:border-white/10">
                <img src="/placeholder-qr.png" alt="Payment QR" className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal opacity-50" />
              </div>
              <p className="text-xs text-slate-500 mt-4 font-medium uppercase tracking-widest">
                Gryork Consultants
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">UPI ID</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3 py-2 rounded-lg text-sm text-slate-900 dark:text-white font-mono">
                    gryork@paytm
                  </code>
                  <button
                    onClick={handleCopy}
                    className="p-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-gry-blue-main rounded-lg text-slate-600 dark:text-slate-400 transition-colors group relative"
                    aria-label="Copy UPI ID"
                  >
                    {copied ? (
                      <CheckCircle2 className="w-5 h-5 text-gry-green" />
                    ) : (
                      <Copy className="w-5 h-5 group-hover:text-gry-blue-main" />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-gry-blue-main flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-slate-900 dark:text-white">
                    Amount to pay: <span className="line-through text-slate-400 mr-2">₹{originalPrice}</span>
                    <span className="text-gry-green font-bold">₹{price}</span>
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">Please take a screenshot of the successful transaction. You will need to upload it below.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Registration Form */}
        <div className="md:col-span-3">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-[#0A0A0A] rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-white/10 shadow-sm">
            <h3 className="font-display font-bold text-2xl text-slate-900 dark:text-white mb-6">Student Details</h3>
            
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6 text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}
            
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                <input required type="text" className="tp-input" placeholder="John Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
                <input required type="email" className="tp-input" placeholder="john@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone Number (WhatsApp) *</label>
                <input required type="tel" className="tp-input" placeholder="+91 98765 43210" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">College/University *</label>
                <input required type="text" className="tp-input" placeholder="Your College Name" value={formData.college} onChange={e => setFormData({...formData, college: e.target.value})} />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Branch/Department *</label>
                <input required type="text" className="tp-input" placeholder="Computer Science" value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Year of Study *</label>
                <select required className="tp-input" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})}>
                  <option value="">Select Year</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Track Preference *</label>
              <select required className="tp-input" value={formData.trackPreference} onChange={e => setFormData({...formData, trackPreference: e.target.value})}>
                <option value="AI + Web Development">AI + Web Development</option>
                <option value="Startup & Entrepreneurship">Startup & Entrepreneurship</option>
                <option value="Industry Productivity Tools">Industry Productivity Tools</option>
              </select>
            </div>

            <hr className="border-slate-200 dark:border-white/10 mb-6" />

            <h4 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-4">Payment Verification</h4>

            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Transaction ID / UTR Number *</label>
                <input required type="text" className="tp-input" placeholder="e.g. 123456789012" value={formData.transactionId} onChange={e => setFormData({...formData, transactionId: e.target.value})} />
              </div>
              <div className="sm:col-span-2 relative">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Upload Payment Screenshot *</label>
                <div className="border-2 border-dashed border-slate-300 dark:border-white/20 rounded-xl p-6 text-center hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer group relative overflow-hidden">
                  <Upload className="w-8 h-8 mx-auto text-slate-400 group-hover:text-gry-blue-main mb-2 transition-colors" />
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {screenshot ? screenshot.name : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 5MB</p>
                  <input type="file" accept="image/*" required onChange={e => setScreenshot(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" id="payment-screenshot" />
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary w-full justify-center py-4 text-base relative overflow-hidden group"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Submit Registration</span>
                  <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </motion.button>
            <p className="text-xs text-center text-slate-500 mt-4">
              By submitting, you agree to our Terms of Service and Privacy Policy.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
