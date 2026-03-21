'use client';

import { useState, useEffect } from 'react';
import { X, Zap } from 'lucide-react';
import Link from 'next/link';
import { trackEvent, GA4_EVENTS } from '@/lib/analytics';

export default function FoundingMemberPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasSeenPopup, setHasSeenPopup] = useState(true);

  useEffect(() => {
    // Check if user has dismissed this popup before
    const dismissed = localStorage.getItem('founding-member-popup-dismissed');
    if (!dismissed) {
      // Show popup after 3 seconds on first visit
      const timer = setTimeout(() => {
        setIsOpen(true);
        setHasSeenPopup(false);
        // Track popup impression
        trackEvent(GA4_EVENTS.POPUP_IMPRESSION, { delay_ms: 3000 });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    // Track dismissal
    trackEvent(GA4_EVENTS.POPUP_DISMISS);
    // Don't show again for 30 days
    localStorage.setItem('founding-member-popup-dismissed', 'true');
  };

  const handleClaimSpot = () => {
    // Track CTA click
    trackEvent(GA4_EVENTS.POPUP_CLAIM_SPOT_CLICK);
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors z-10"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          {/* Gradient Header */}
          <div className="bg-gradient-to-r from-accent-600 to-accent-500 px-6 pt-8 pb-6">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  Founding Member Program
                </h2>
                <p className="text-white/90 text-sm">
                  Only 15/20 slots remaining
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pt-6 pb-4">
            {/* Headline */}
            <p className="text-gray-600 mb-6 leading-relaxed">
              Get exclusive funding perks and join 500+ contractors already using Gryork.
            </p>

            {/* Benefits List */}
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-accent-600 mt-0.5"
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
                <span className="text-sm text-gray-700">Guaranteed 48-hour funding</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-accent-600 mt-0.5"
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
                <span className="text-sm text-gray-700">0% commission on first 3 bills</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-accent-600 mt-0.5"
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
                <span className="text-sm text-gray-700">Priority NBFC matching</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-accent-600 mt-0.5"
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
                <span className="text-sm text-gray-700">Lifetime founder badge</span>
              </div>
            </div>

            {/* CTA */}
            <Link
              href="/early-access"
              onClick={handleClaimSpot}
              className="block w-full px-6 py-3 bg-accent-600 text-white font-semibold rounded-lg hover:bg-accent-700 transition-colors text-center mb-3"
            >
              Claim Your Spot
            </Link>

            <button
              onClick={handleClose}
              className="block w-full px-6 py-2 text-gray-600 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
