import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, AlertCircle, CheckCircle2, ArrowRight, ArrowLeft, Download, CreditCard } from "lucide-react";
import { getCurrentPricing, submitRegistration, createRazorpayOrder, getInvoiceUrl } from "../lib/api";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Registration() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { phase: currentPhase } = getCurrentPricing();
  const [registrationId, setRegistrationId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    college: "",
    branch: "",
    year: "",
    trackPreference: "AI + Web Development",
  });
  const [error, setError] = useState<string | null>(null);

  // Price calculation based on phase
  let price = currentPhase?.amount || 799;
  let originalPrice = currentPhase?.originalAmount || 5999;

  const handleProceedToCheckout = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePayment = async (e: React.FormEvent<HTMLFormElement> | React.MouseEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. Create order
      const order = await createRazorpayOrder(price);

      // 2. Initialize Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "dummy", 
        amount: order.amount,
        currency: order.currency,
        name: "Gryork Consultants",
        description: "TechPreneur Industrial Training 2026",
        order_id: order.id,
        handler: async function (response: any) {
          try {
            setLoading(true);
            const regResponse = await submitRegistration({
              ...formData,
              feeAmount: price,
              registrationPhase: currentPhase.phase,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            setRegistrationId(regResponse.registrationId);
            setStep(3);
            window.scrollTo({ top: 0, behavior: "smooth" });
          } catch (err: any) {
            setError(err.message || "Registration failed after payment. Please contact support.");
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: "#2563eb",
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        setError(response.error.description);
      });
      rzp.open();
    } catch (err: any) {
      setError(err.message || "Failed to initialize payment. Please try again.");
      setLoading(false);
    }
  };

  if (step === 3) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm text-center">
        <div className="w-16 h-16 bg-gry-green/10 rounded-full flex items-center justify-center mx-auto mb-6 text-gry-green">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Registration Submitted Successfully!</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-6 text-lg">
          Your payment was successful and we have received your details.
        </p>

        {registrationId && (
          <div className="mb-6">
            <a 
              href={getInvoiceUrl(registrationId)} 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg font-medium transition-colors border border-slate-200 dark:border-white/10"
            >
              <Download className="w-4 h-4" /> Download Payment Invoice
            </a>
          </div>
        )}

        <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 inline-block mb-6 text-left text-sm text-slate-600 dark:text-slate-400">
          <p className="font-medium text-slate-800 dark:text-slate-200 mb-1">What happens next?</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>You will receive a confirmation email shortly.</li>
            <li>The session schedule and joining links will be shared via email.</li>
            <li>Our onboarding team will reach out with track details.</li>
          </ul>
        </div>
        <br />
        <button onClick={() => { setStep(1); setRegistrationId(null); }} className="btn-primary">
          Register Another Student
        </button>
      </div>
    );
  }

  return (
    <div className="page-container max-w-3xl">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center gap-3">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm transition-colors ${step >= 1 ? "bg-gry-blue-main text-white" : "bg-slate-200 dark:bg-white/10 text-slate-500"}`}>1</div>
          <span className={`text-sm font-medium ${step >= 1 ? "text-slate-900 dark:text-white" : "text-slate-500"}`}>Details</span>
        </div>
        <div className={`w-12 h-1 mx-3 rounded-full transition-colors ${step >= 2 ? "bg-gry-blue-main" : "bg-slate-200 dark:bg-white/10"}`} />
        <div className="flex items-center gap-3">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm transition-colors ${step >= 2 ? "bg-gry-blue-main text-white" : "bg-slate-200 dark:bg-white/10 text-slate-500"}`}>2</div>
          <span className={`text-sm font-medium ${step >= 2 ? "text-slate-900 dark:text-white" : "text-slate-500"}`}>Checkout</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <form onSubmit={handleProceedToCheckout} className="bg-white dark:bg-[#0A0A0A] rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-white/10 shadow-sm">
              <h3 className="font-display font-bold text-2xl text-slate-900 dark:text-white mb-6">Student Details</h3>
              
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

              <div className="mb-8">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Track Preference *</label>
                <select required className="tp-input" value={formData.trackPreference} onChange={e => setFormData({...formData, trackPreference: e.target.value})}>
                  <option value="AI + Web Development">AI + Web Development</option>
                  <option value="Startup & Entrepreneurship">Startup & Entrepreneurship</option>
                  <option value="Industry Productivity Tools">Industry Productivity Tools</option>
                </select>
              </div>

              <button type="submit" className="btn-primary w-full justify-center py-4 text-base relative overflow-hidden group">
                <div className="flex items-center gap-2">
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </form>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <form onSubmit={handlePayment} className="bg-white dark:bg-[#0A0A0A] rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-white/10 shadow-sm">
              <button type="button" onClick={() => setStep(1)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mb-6 font-medium">
                <ArrowLeft className="w-4 h-4" /> Back to Details
              </button>

              <h3 className="font-display font-bold text-2xl text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                Checkout & Payment
              </h3>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6 text-sm flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}

              {/* Bill View */}
              <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-5 mb-8">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Program Fee</span>
                  <span className="text-slate-500 line-through">₹{originalPrice}</span>
                </div>
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200 dark:border-white/10">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Discount</span>
                  <span className="text-gry-green font-medium">- ₹{originalPrice - price}</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-slate-900 dark:text-white font-bold text-lg">Total Amount to Pay</span>
                  <span className="font-display font-bold text-3xl text-gry-blue-main dark:text-gry-blue-light">₹{price}</span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
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
                    <CreditCard className="w-5 h-5" />
                    <span>Pay with Razorpay</span>
                  </div>
                )}
              </motion.button>
              
              <div className="flex items-center justify-center gap-2 mt-6">
                <img src="https://razorpay.com/assets/razorpay-glyph.svg" alt="Razorpay" className="h-4 opacity-50 dark:invert" />
                <p className="text-xs text-center text-slate-500 font-medium">
                  Secured by Razorpay. By paying, you agree to our Terms of Service.
                </p>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
