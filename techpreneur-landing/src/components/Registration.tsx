import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2, ArrowRight, ArrowLeft, Download, CreditCard, Phone } from "lucide-react";
import { getCurrentPricing, submitRegistration, createRazorpayOrder, getInvoiceUrl } from "../lib/api";

declare global {
  interface Window {
    Razorpay: any;
  }
}

// Sanitize phone — strip +91, spaces, dashes
const sanitizePhone = (phone: string) =>
  phone.trim().replace(/^\+91/, "").replace(/\D/g, "");

// Validate 10-digit Indian mobile
const isValidPhone = (phone: string) => /^[6-9]\d{9}$/.test(sanitizePhone(phone));

export default function Registration() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { phase: currentPhase } = getCurrentPricing();
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [paymentFallback, setPaymentFallback] = useState<{
    paymentId: string;
    orderId: string;
    signature: string;
  } | null>(null);



  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    college: "",
    branch: "",
    year: "",
    trackPreference: "AI + Web Development",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const price = currentPhase?.amount || 1299;
  const originalPrice = currentPhase?.originalAmount || 5200;

  const validateStep1 = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = "Full name is required";
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errors.email = "Please enter a valid email address";
    if (!isValidPhone(formData.phone))
      errors.phone = "Enter a valid 10-digit Indian mobile number (e.g. 9876543210)";
    if (!formData.college.trim()) errors.college = "College name is required";
    if (!formData.branch.trim()) errors.branch = "Branch is required";
    if (!formData.year) errors.year = "Please select your year of study";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProceedToCheckout = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateStep1()) return;
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Retry registration after payment succeeded
  const retryRegistration = async (paymentResponse: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const regResponse = await submitRegistration({
        ...formData,
        phone: sanitizePhone(formData.phone),
        feeAmount: price,
        registrationPhase: currentPhase?.phase || "early",
        razorpay_order_id: paymentResponse.razorpay_order_id,
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_signature: paymentResponse.razorpay_signature,
      });
      setRegistrationId(regResponse.registrationId);
      setPaymentFallback(null);
      setStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      // If already registered (duplicate) — still show success
      if (err.message?.toLowerCase().includes("already registered")) {
        setStep(3);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setError(err.message || "Could not complete registration. Please use the Retry button or contact support.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e: React.FormEvent<HTMLFormElement> | React.MouseEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const order = await createRazorpayOrder(price);

      const options = {
        // key_id comes from backend create-order response — safest approach
        key: order.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Gryork Consultants",
        description: "TechPreneur Industrial Training 2026",
        order_id: order.id,
        handler: async function (response: any) {
          // Payment is DONE — now save registration
          // Store in state first so user can retry if save fails
          setPaymentFallback({
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            signature: response.razorpay_signature,
          });
          await retryRegistration({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          // Always pass clean 10-digit number to Razorpay
          contact: sanitizePhone(formData.phone),
        },
        theme: { color: "#2563eb" },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        setLoading(false);
        setError("Payment failed: " + (response.error?.description || "Please try again."));
      });
      rzp.open();
    } catch (err: any) {
      setError(err.message || "Failed to initialize payment. Please try again.");
      setLoading(false);
    }
  };

  // ── Success Screen ──
  if (step === 3) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm text-center">
        <div className="w-16 h-16 bg-gry-green/10 rounded-full flex items-center justify-center mx-auto mb-6 text-gry-green">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          You're Registered! 🎉
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-6 text-lg">
          Payment confirmed. Your seat is secured for TechPreneur Industrial Training 2026!
        </p>

        {registrationId && (
          <div className="mb-6">
            <a
              href={getInvoiceUrl(registrationId)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 px-5 py-3 rounded-lg font-medium transition-colors border border-slate-200 dark:border-white/10"
            >
              <Download className="w-4 h-4" /> Download Payment Invoice
            </a>
          </div>
        )}

        <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-left text-sm text-slate-600 dark:text-slate-400 mb-6">
          <p className="font-medium text-slate-800 dark:text-slate-200 mb-2">What happens next?</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>A confirmation email will be sent to <strong>{formData.email}</strong>.</li>
            <li>Session schedule & joining links will be shared on your email & WhatsApp.</li>
            <li>Our team will reach out within 24 hours with onboarding details.</li>
          </ul>
        </div>

        <button
          onClick={() => {
            setStep(1);
            setRegistrationId(null);
            setPaymentFallback(null);
            setFormData({ name: "", email: "", phone: "", college: "", branch: "", year: "", trackPreference: "AI + Web Development" });
          }}
          className="btn-primary"
        >
          Register Another Student
        </button>
      </div>
    );
  }

  // ── Critical Fallback: Payment done but registration failed ──
  if (paymentFallback && error) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-white dark:bg-[#0A0A0A] rounded-2xl border border-orange-200 dark:border-orange-500/30 shadow-sm text-center">
        <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-orange-500">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Payment Successful, Registration Pending
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Your payment of <strong>₹{price}</strong> was received but we hit a snag saving your registration. Please click Retry below.
        </p>

        <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-500/20 rounded-xl p-4 mb-6 text-left text-sm">
          <p className="font-mono text-orange-800 dark:text-orange-300 font-medium">
            Payment ID: {paymentFallback.paymentId}
          </p>
          <p className="text-slate-500 text-xs mt-1">Save this ID for reference if you need support.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => retryRegistration({
              razorpay_order_id: paymentFallback.orderId,
              razorpay_payment_id: paymentFallback.paymentId,
              razorpay_signature: paymentFallback.signature,
            })}
            disabled={loading}
            className="btn-primary flex items-center justify-center gap-2"
          >
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Retrying...</>
            ) : "Retry Registration"}
          </button>
          <a
            href={`mailto:contact@gryork.com?subject=Registration Issue&body=Payment ID: ${paymentFallback.paymentId}%0AName: ${formData.name}%0AEmail: ${formData.email}`}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 dark:border-white/20 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 font-medium text-sm transition-colors"
          >
            Contact Support
          </a>
        </div>
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
        {/* ── Step 1: Student Details ── */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <form onSubmit={handleProceedToCheckout} className="bg-white dark:bg-[#0A0A0A] rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-white/10 shadow-sm" noValidate>
              <h3 className="font-display font-bold text-2xl text-slate-900 dark:text-white mb-6">Student Details</h3>

              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                  <input
                    type="text" className={`tp-input ${fieldErrors.name ? "border-red-400" : ""}`}
                    placeholder="John Doe" value={formData.name}
                    onChange={e => { setFormData({ ...formData, name: e.target.value }); setFieldErrors(p => ({ ...p, name: "" })); }}
                  />
                  {fieldErrors.name && <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
                  <input
                    type="email" className={`tp-input ${fieldErrors.email ? "border-red-400" : ""}`}
                    placeholder="john@example.com" value={formData.email}
                    onChange={e => { setFormData({ ...formData, email: e.target.value }); setFieldErrors(p => ({ ...p, email: "" })); }}
                  />
                  {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> WhatsApp Number *</span>
                  </label>
                  <input
                    type="tel" className={`tp-input ${fieldErrors.phone ? "border-red-400" : ""}`}
                    placeholder="9876543210" value={formData.phone}
                    onChange={e => { setFormData({ ...formData, phone: e.target.value }); setFieldErrors(p => ({ ...p, phone: "" })); }}
                  />
                  {fieldErrors.phone
                    ? <p className="text-red-500 text-xs mt-1">{fieldErrors.phone}</p>
                    : <p className="text-slate-400 text-xs mt-1">10 digits only, no +91 needed</p>
                  }
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">College/University *</label>
                  <input
                    type="text" className={`tp-input ${fieldErrors.college ? "border-red-400" : ""}`}
                    placeholder="Your College Name" value={formData.college}
                    onChange={e => { setFormData({ ...formData, college: e.target.value }); setFieldErrors(p => ({ ...p, college: "" })); }}
                  />
                  {fieldErrors.college && <p className="text-red-500 text-xs mt-1">{fieldErrors.college}</p>}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Branch/Department *</label>
                  <input
                    type="text" className={`tp-input ${fieldErrors.branch ? "border-red-400" : ""}`}
                    placeholder="Computer Science" value={formData.branch}
                    onChange={e => { setFormData({ ...formData, branch: e.target.value }); setFieldErrors(p => ({ ...p, branch: "" })); }}
                  />
                  {fieldErrors.branch && <p className="text-red-500 text-xs mt-1">{fieldErrors.branch}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Year of Study *</label>
                  <select
                    className={`tp-input ${fieldErrors.year ? "border-red-400" : ""}`}
                    value={formData.year}
                    onChange={e => { setFormData({ ...formData, year: e.target.value }); setFieldErrors(p => ({ ...p, year: "" })); }}
                  >
                    <option value="">Select Year</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                  {fieldErrors.year && <p className="text-red-500 text-xs mt-1">{fieldErrors.year}</p>}
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Track Preference *</label>
                <select className="tp-input" value={formData.trackPreference} onChange={e => setFormData({ ...formData, trackPreference: e.target.value })}>
                  <option value="AI + Web Development">AI + Web Development</option>
                  <option value="Startup & Entrepreneurship">Startup &amp; Entrepreneurship</option>
                  <option value="Industry Productivity Tools">Industry Productivity Tools</option>
                </select>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-4 text-base relative overflow-hidden group flex items-center gap-2 rounded-xl font-bold transition-all">
                {loading ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Reserving...</span></>
                ) : (
                  <><span>Proceed to Checkout</span><ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                )}
              </button>
            </form>
          </motion.div>
        )}

        {/* ── Step 2: Checkout ── */}
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

              <h3 className="font-display font-bold text-2xl text-slate-900 dark:text-white mb-2">Checkout & Payment</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Registering as <strong className="text-slate-700 dark:text-slate-300">{formData.name}</strong> · {formData.email}
              </p>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6 text-sm flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}

              {/* Bill Summary */}
              <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-5 mb-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">TechPreneur Industrial Training 2026</span>
                  <span className="text-slate-400 line-through text-sm">₹{originalPrice}</span>
                </div>
                
                {currentPhase?.phase === "early" ? (
                  <div className="flex justify-between items-center mb-3 pb-3 border-b border-slate-200 dark:border-white/10">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">🎉 Early Bird Discount</span>
                    <span className="text-green-600 dark:text-green-400 font-medium">- ₹{originalPrice - price}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-500 dark:text-slate-400 text-sm">Base Price</span>
                      <span className="text-slate-600 dark:text-slate-300 text-sm font-medium">₹{(price / 1.18).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-3 pb-3 border-b border-slate-200 dark:border-white/10">
                      <span className="text-slate-500 dark:text-slate-400 text-sm">GST (18%)</span>
                      <span className="text-slate-600 dark:text-slate-300 text-sm font-medium">₹{(price - (price / 1.18)).toFixed(2)}</span>
                    </div>
                  </>
                )}

                <div className="flex justify-between items-end">
                  <span className="text-slate-900 dark:text-white font-bold text-lg">Total to Pay</span>
                  <span className="font-display font-bold text-3xl text-gry-blue-main dark:text-gry-blue-light">₹{price}</span>
                </div>
              </div>

              {/* Details Preview */}
              <div className="grid grid-cols-2 gap-2 text-xs mb-6 text-slate-500 dark:text-slate-400">
                <div><span className="font-medium text-slate-700 dark:text-slate-300">Track: </span>{formData.trackPreference}</div>
                <div><span className="font-medium text-slate-700 dark:text-slate-300">Year: </span>{formData.year}</div>
                <div><span className="font-medium text-slate-700 dark:text-slate-300">College: </span>{formData.college}</div>
                <div><span className="font-medium text-slate-700 dark:text-slate-300">Phone: </span>{sanitizePhone(formData.phone)}</div>
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
                    <span>Processing payment...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    <span>Pay ₹{price} with Razorpay</span>
                  </div>
                )}
              </motion.button>

              <div className="flex items-center justify-center gap-2 mt-4">
                <img src="https://razorpay.com/assets/razorpay-glyph.svg" alt="Razorpay" className="h-4 opacity-50 dark:invert" />
                <p className="text-xs text-center text-slate-500">
                  100% secure payments via Razorpay. UPI, Cards, Net Banking accepted.
                </p>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
