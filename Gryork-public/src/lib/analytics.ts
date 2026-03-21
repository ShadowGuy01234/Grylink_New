// GA4 Event Tracking Helper
// Pure code implementation - ready to integrate with GA4 later

export const GA4_EVENTS = {
  // Hero & Homepage CTAs
  HERO_CTA_CLICK: 'hero_cta_click',
  EARLY_ACCESS_CLICK: 'early_access_click',
  
  // Early Access Page
  EARLY_ACCESS_FORM_VIEW: 'early_access_form_view',
  EARLY_ACCESS_SIGNUP: 'early_access_signup',
  EARLY_ACCESS_SIGNUP_ERROR: 'early_access_signup_error',
  EARLY_ACCESS_SUCCESS: 'early_access_success',
  
  // Popup Modal
  POPUP_IMPRESSION: 'popup_impression',
  POPUP_CLAIM_SPOT_CLICK: 'popup_claim_spot_click',
  POPUP_DISMISS: 'popup_dismiss',
  
  // Email & Newsletter
  EMAIL_CAPTURE: 'email_capture',
  NEWSLETTER_SIGNUP: 'newsletter_signup',
  
  // Quote & Conversion
  FREE_QUOTE_REQUEST: 'free_quote_request',
  FREE_QUOTE_COMPLETED: 'free_quote_completed',
  FULL_SIGNUP_START: 'full_signup_start',
  FULL_SIGNUP_COMPLETE: 'full_signup_complete',
  KYC_COMPLETE: 'kyc_complete',
  
  // Bills & Funding
  FIRST_BILL_UPLOAD: 'first_bill_upload',
  FIRST_FUNDING: 'first_funding',
  
  // Navigation & Pages
  PAGE_VIEW: 'page_view',
  NAVIGATION_CLICK: 'navigation_click',
  LINK_CLICK: 'link_click',
  SCROLL_DEPTH: 'scroll_depth',
  TIME_ON_PAGE: 'time_on_page',
} as const;

export type GA4EventName = (typeof GA4_EVENTS)[keyof typeof GA4_EVENTS];

export interface GA4EventProperties {
  [key: string]: string | number | boolean | undefined;
}

/**
 * Track GA4 events
 * Usage: trackEvent(GA4_EVENTS.HERO_CTA_CLICK, { source: 'hero', cta_text: 'Get Early Access' })
 */
export function trackEvent(eventName: GA4EventName, properties?: GA4EventProperties) {
  if (typeof window === 'undefined') return;

  try {
    // GA4 implementation via gtag
    if (window.gtag) {
      window.gtag('event', eventName, properties);
    }
    
    // Fallback: Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[GA4 Event] ${eventName}`, properties);
    }
  } catch (error) {
    console.error('Error tracking event:', error);
  }
}

/**
 * Track pageview
 * Usage: trackPageView('/early-access', 'Early Access Page')
 */
export function trackPageView(path: string, title?: string) {
  trackEvent(GA4_EVENTS.PAGE_VIEW, {
    page_path: path,
    page_title: title,
  });
}

/**
 * Track CTA clicks with source
 * Usage: trackCTAClick('hero', 'Get Early Access')
 */
export function trackCTAClick(source: string, ctaText: string) {
  trackEvent(GA4_EVENTS.EARLY_ACCESS_CLICK, {
    source,
    cta_text: ctaText,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track email form submission
 * Usage: trackEmailSignup('early-access', 'user@example.com')
 */
export function trackEmailSignup(formSource: string, email?: string) {
  trackEvent(GA4_EVENTS.EARLY_ACCESS_SIGNUP, {
    form_source: formSource,
    email_domain: email ? email.split('@')[1] : 'unknown',
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track form errors
 * Usage: trackFormError('early-access', 'Invalid email format')
 */
export function trackFormError(formSource: string, errorMessage: string) {
  trackEvent(GA4_EVENTS.EARLY_ACCESS_SIGNUP_ERROR, {
    form_source: formSource,
    error_message: errorMessage,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track scroll depth for engagement
 * Usage: trackScrollDepth(75) - when user scrolls to 75%
 */
export function trackScrollDepth(percentage: number) {
  // Only track at major milestones to reduce events
  const milestone = Math.floor(percentage / 25) * 25;
  if (milestone > 0 && milestone % 25 === 0) {
    trackEvent(GA4_EVENTS.SCROLL_DEPTH, {
      depth_percentage: milestone,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Track button/link clicks with metadata
 * Usage: trackLinkClick('early-access', 'Claim Your Spot')
 */
export function trackLinkClick(elementText: string, elementId?: string) {
  trackEvent(GA4_EVENTS.LINK_CLICK, {
    link_text: elementText,
    link_id: elementId,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track time spent on page
 * Usage: trackTimeOnPage('/', 45000) - 45 seconds
 */
export function trackTimeOnPage(path: string, timeInMs: number) {
  trackEvent(GA4_EVENTS.TIME_ON_PAGE, {
    page_path: path,
    time_seconds: Math.round(timeInMs / 1000),
  });
}

// TypeScript augmentation for window.gtag
declare global {
  interface Window {
    gtag: (command: string, eventName: string, eventData?: GA4EventProperties) => void;
  }
}

export default {
  trackEvent,
  trackPageView,
  trackCTAClick,
  trackEmailSignup,
  trackFormError,
  trackScrollDepth,
  trackLinkClick,
  trackTimeOnPage,
  GA4_EVENTS,
};
