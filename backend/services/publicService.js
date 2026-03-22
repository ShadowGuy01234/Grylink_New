const PublicFeedback = require("../models/PublicFeedback");
const PublicLead = require("../models/PublicLead");
const PublicAnalyticsEvent = require("../models/PublicAnalyticsEvent");

const ALLOWED_EVENT_NAMES = new Set([
  "page_view",
  "cta_click",
  "role_switch",
  "feedback_opened",
  "feedback_submitted",
  "lead_submitted",
  "contact_submitted",
  "early_access_submitted",
  "career_apply_started",
]);

function normalizeRole(role) {
  const value = String(role || "")
    .trim()
    .toLowerCase();
  if (value === "subcontractor" || value === "epc" || value === "nbfc") return value;
  if (value === "general") return value;
  return "unknown";
}

function getRequestMetadata(req) {
  return {
    referrer: req.get("referer") || "",
    userAgent: req.get("user-agent") || "",
    ipAddress:
      req.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() || req.ip || "",
  };
}

function sanitizeString(value, fallback = "") {
  if (typeof value !== "string") return fallback;
  return value.trim();
}

async function submitFeedback(req) {
  const { type, roleContext, message, pagePath, pageTitle, name, email, company, sessionId } =
    req.body || {};

  const cleanedMessage = sanitizeString(message);
  if (!cleanedMessage) {
    throw new Error("Feedback message is required.");
  }

  const feedback = await PublicFeedback.create({
    type: ["bug", "idea", "question"].includes(type) ? type : "idea",
    roleContext: normalizeRole(roleContext),
    message: cleanedMessage,
    pagePath: sanitizeString(pagePath),
    pageTitle: sanitizeString(pageTitle),
    name: sanitizeString(name),
    email: sanitizeString(email).toLowerCase(),
    company: sanitizeString(company),
    metadata: {
      sessionId: sanitizeString(sessionId),
      ...getRequestMetadata(req),
    },
  });

  return feedback;
}

async function submitLead(req) {
  const {
    source,
    roleInterest,
    name,
    email,
    phone,
    company,
    subject,
    message,
    pagePath,
    pageTitle,
    sessionId,
  } = req.body || {};

  const cleanedEmail = sanitizeString(email).toLowerCase();
  if (!cleanedEmail) {
    throw new Error("Email is required.");
  }

  const cleanSource = ["contact_form", "early_access", "career_apply", "other"].includes(source)
    ? source
    : "other";

  const lead = await PublicLead.create({
    source: cleanSource,
    roleInterest: normalizeRole(roleInterest),
    name: sanitizeString(name),
    email: cleanedEmail,
    phone: sanitizeString(phone),
    company: sanitizeString(company),
    subject: sanitizeString(subject),
    message: sanitizeString(message),
    pagePath: sanitizeString(pagePath),
    pageTitle: sanitizeString(pageTitle),
    metadata: {
      sessionId: sanitizeString(sessionId),
      ...getRequestMetadata(req),
    },
  });

  return lead;
}

async function trackEvents(req) {
  const events = Array.isArray(req.body?.events) ? req.body.events : [];
  if (events.length === 0) {
    throw new Error("At least one event is required.");
  }

  const docs = events
    .map((event) => {
      const eventName = sanitizeString(event?.eventName);
      if (!eventName || !ALLOWED_EVENT_NAMES.has(eventName)) {
        return null;
      }

      return {
        eventName,
        category: sanitizeString(event?.category),
        roleContext: normalizeRole(event?.roleContext),
        pagePath: sanitizeString(event?.pagePath),
        pageTitle: sanitizeString(event?.pageTitle),
        sessionId: sanitizeString(event?.sessionId),
        properties:
          event?.properties && typeof event.properties === "object" ? event.properties : {},
        metadata: getRequestMetadata(req),
      };
    })
    .filter(Boolean);

  if (docs.length === 0) {
    throw new Error("No valid analytics events to process.");
  }

  const inserted = await PublicAnalyticsEvent.insertMany(docs, { ordered: false });
  return inserted.length;
}

async function getPublicInsights() {
  const [feedbackByStatus, feedbackByType, leadBySource, recentFeedback, recentLeads, analyticsTop] =
    await Promise.all([
      PublicFeedback.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      PublicFeedback.aggregate([
        { $group: { _id: "$type", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      PublicLead.aggregate([
        { $group: { _id: "$source", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      PublicFeedback.find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .select("type roleContext message status createdAt pagePath")
        .lean(),
      PublicLead.find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .select("source roleInterest name email company status createdAt")
        .lean(),
      PublicAnalyticsEvent.aggregate([
        { $match: { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
        { $group: { _id: "$eventName", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

  const [feedbackTotal, leadsTotal, analyticsTotal] = await Promise.all([
    PublicFeedback.countDocuments(),
    PublicLead.countDocuments(),
    PublicAnalyticsEvent.countDocuments(),
  ]);

  return {
    totals: {
      feedback: feedbackTotal,
      leads: leadsTotal,
      analyticsEvents: analyticsTotal,
    },
    feedbackByStatus,
    feedbackByType,
    leadBySource,
    analyticsTop,
    recentFeedback,
    recentLeads,
  };
}

module.exports = {
  submitFeedback,
  submitLead,
  trackEvents,
  getPublicInsights,
};
