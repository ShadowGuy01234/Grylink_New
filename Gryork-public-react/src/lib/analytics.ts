import { getSessionId } from "./session";
import { publicApi } from "./api";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

type EventPayload = {
  eventName: string;
  category: string;
  roleContext?: string;
  properties?: Record<string, unknown>;
};

const queue: Record<string, unknown>[] = [];
let flushTimer: number | undefined;

function getPageContext() {
  return {
    pagePath: window.location.pathname + window.location.search,
    pageTitle: document.title,
    sessionId: getSessionId(),
  };
}

function flush() {
  if (queue.length === 0) return;
  const events = queue.splice(0, queue.length);
  publicApi.trackEvents({ events }).catch(() => {
    // best-effort analytics; keep UX non-blocking
  });
}

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = window.setTimeout(() => {
    flushTimer = undefined;
    flush();
  }, 1200);
}

export function initAnalytics() {
  const id = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (!id) return;

  if (!window.dataLayer) window.dataLayer = [];
  window.gtag = window.gtag || function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };

  window.gtag("js", new Date());
  window.gtag("config", id, { send_page_view: false });
}

export function trackEvent({ eventName, category, roleContext, properties = {} }: EventPayload) {
  const basePayload = {
    eventName,
    category,
    roleContext: roleContext || "unknown",
    ...getPageContext(),
    properties,
  };

  queue.push(basePayload);
  scheduleFlush();

  if (window.gtag) {
    window.gtag("event", eventName, {
      event_category: category,
      role_context: roleContext || "unknown",
      page_path: basePayload.pagePath,
      ...properties,
    });
  }
}

export function trackPageView() {
  trackEvent({
    eventName: "page_view",
    category: "navigation",
    properties: {
      href: window.location.href,
    },
  });
}
