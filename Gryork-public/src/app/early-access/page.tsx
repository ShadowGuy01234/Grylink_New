'use client';

import { useState, useEffect } from 'react';
import { Header, Footer } from '@/components/layout';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { trackEmailSignup, trackFormError, trackPageView } from '@/lib/analytics';

export default function EarlyAccessPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Track page view on mount
  useEffect(() => {
    trackPageView('/early-access', 'Early Access Page');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Track email signup attempt
      trackEmailSignup('early-access-form', email);

      // TODO: Replace with your actual API endpoint
      // const response = await fetch('/api/email/subscribe', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email }),
      // });
      // if (!response.ok) throw new Error('Failed to subscribe');
      
      // For now, just simulate success
      setSubmitted(true);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Something went wrong';
      setError(errorMsg);
      // Track error
      trackFormError('early-access-form', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <>
        <Header />
        <main className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center py-20">
            {/* Success Icon */}
            <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent-100">
              <svg
                className="w-8 h-8 text-accent-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            {/* Heading */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              You're In!
            </h1>

            {/* Status message */}
            <p className="text-lg text-gray-600 mb-2">
              Check your email for next steps
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Welcome to the Gryork Exclusive Member program. We've sent confirmation details to{' '}
              <span className="font-semibold text-gray-700">{email}</span>.
            </p>

            {/* Benefits */}
            <div className="bg-accent-50 rounded-xl p-6 mb-6 text-left border border-accent-100">
              <h3 className="font-semibold text-gray-900 mb-4">Your Exclusive Member Benefits:</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-accent-600 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-gray-700">Guaranteed 48-hour funding</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-accent-600 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-gray-700">0% commission on first 3 bills</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-accent-600 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-gray-700">Priority NBFC matching</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-accent-600 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-gray-700">Lifetime "Founder" badge</span>
                </li>
              </ul>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3">
              <Link
                href={process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5173'}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent-500 text-white font-semibold rounded-xl hover:bg-accent-600 transition-colors"
              >
                Complete Your Profile
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4 pt-20">
        <div className="w-full max-w-md">
          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
              Join Our Exclusive Members
            </h1>
            <p className="text-lg text-gray-600">
              Get exclusive benefits and lock in foundational rates.
            </p>
          </div>

          {/* Benefits Preview */}
          <div className="bg-gradient-to-br from-accent-50 to-blue-50 rounded-2xl p-6 mb-8 border border-accent-100">
            <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">
              Limited Time Offer
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-accent-600 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm text-gray-700">Guaranteed 48-hour funding</span>
              </div>
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-accent-600 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm text-gray-700">0% commission on first 3 bills</span>
              </div>
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-accent-600 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm text-gray-700">Priority NBFC matching</span>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-4 pt-4 border-t border-accent-200">
              Limited exclusive member slots available
            </p>
          </div>

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/30 outline-none transition-all text-gray-900 placeholder-gray-500"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent-500 text-white font-semibold rounded-lg hover:bg-accent-600 disabled:bg-accent-400 transition-colors"
            >
              {loading ? 'Joining...' : 'Join Exclusive Members'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Footer Text */}
          <p className="text-xs text-gray-500 text-center mt-6">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
