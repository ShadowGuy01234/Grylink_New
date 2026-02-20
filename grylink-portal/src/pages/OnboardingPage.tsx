import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { grylinkApi } from '../api';
import toast from 'react-hot-toast';

const ONBOARDING_STEPS = [
  { label: 'Activate Account', desc: 'Set your password', icon: '🔐' },
  { label: 'Upload Documents', desc: 'KYC & company docs', icon: '📄' },
  { label: 'Add Sub-Contractors', desc: 'Register your team', icon: '👥' },
  { label: 'Go Live', desc: 'Start financing', icon: '🚀' },
];

const OnboardingPage = () => {
  const { token } = useParams<{ token: string }>();
  const partnerPortalUrl = import.meta.env.VITE_PARTNER_PORTAL_URL || 'http://localhost:5175';
  const publicSiteUrl = import.meta.env.VITE_PUBLIC_SITE_URL || 'http://localhost:5176';

  const [linkData, setLinkData] = useState<any>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const validate = async () => {
      try {
        if (!token) throw new Error('No token provided');
        const res = await grylinkApi.validate(token);
        setLinkData(res.data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Invalid or expired link');
      } finally {
        setLoading(false);
      }
    };
    validate();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setSubmitting(true);
    try {
      const res = await grylinkApi.setPassword(token!, password);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setDone(true);
      toast.success('Account activated! Redirecting to your dashboard…');
      setTimeout(() => { window.location.href = partnerPortalUrl; }, 2000);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to set password');
      setSubmitting(false);
    }
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-sky-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Validating your invitation link…</p>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-red-100 max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Link Invalid or Expired</h2>
          <p className="text-gray-500 text-sm mb-6">{error}</p>
          <p className="text-xs text-gray-400 mb-6">If you believe this is an error, please contact your Gryork sales representative.</p>
          <a
            href={publicSiteUrl}
            className="inline-flex items-center justify-center w-full px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
          >
            Go to Gryork.com
          </a>
        </div>
      </div>
    );
  }

  // ── Success ──
  if (done) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-emerald-100 max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Account Activated!</h2>
          <p className="text-gray-500 text-sm">Redirecting to your partner dashboard…</p>
          <div className="mt-4 w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full animate-pulse" style={{ width: '80%' }} />
          </div>
        </div>
      </div>
    );
  }

  // ── Main Onboarding Form ──
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-sky-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">G</div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-sky-600">Gryork</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {linkData?.ownerName}! 👋</h1>
          <p className="text-gray-500 text-sm mt-1">
            You've been invited to join <span className="font-semibold text-indigo-600">{linkData?.companyName}</span> on Gryork
          </p>
        </div>

        {/* Onboarding Steps */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-6 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">What happens next</p>
          <div className="space-y-3">
            {ONBOARDING_STEPS.map((step, i) => (
              <div key={step.label} className={`flex items-center gap-3 ${i === 0 ? 'opacity-100' : 'opacity-50'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${
                  i === 0 ? 'bg-indigo-100 ring-2 ring-indigo-500 ring-offset-1' : 'bg-gray-100'
                }`}>
                  {step.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${i === 0 ? 'text-indigo-700' : 'text-gray-500'}`}>{step.label}</p>
                  <p className="text-xs text-gray-400">{step.desc}</p>
                </div>
                {i === 0 && (
                  <span className="shrink-0 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">Current</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Set your password</h2>
          <p className="text-sm text-gray-500 mb-5">Create a secure password to activate your account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input
                type="email"
                value={linkData?.email || ''}
                disabled
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 text-sm cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  required
                  minLength={8}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {password.length > 0 && password.length < 8 && (
                <p className="text-xs text-red-500 mt-1">Password must be at least 8 characters</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
                required
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              {confirmPassword.length > 0 && password !== confirmPassword && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting || password !== confirmPassword || password.length < 8}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-sky-500 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-sky-600 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Activating account…
                </span>
              ) : 'Activate Account & Continue →'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-4">
            By continuing, you agree to our{' '}
            <a href={publicSiteUrl} className="text-indigo-500 hover:underline">Terms of Service</a>
            {' '}and Privacy Policy
          </p>
        </div>

      </div>
    </div>
  );
};

export default OnboardingPage;
