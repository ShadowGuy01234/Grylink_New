const ChatbotEvent = require("../models/ChatbotEvent");
const ChatbotSecurityEvent = require("../models/ChatbotSecurityEvent");

function safeString(value, limit = 300) {
  return String(value || "").slice(0, limit);
}

function deriveCountry(req) {
  const value = req?.headers?.["cf-ipcountry"] || req?.headers?.["x-vercel-ip-country"] || "IN";
  return safeString(value, 8).toUpperCase();
}

function deriveDeviceType(userAgent) {
  const ua = String(userAgent || "").toLowerCase();
  if (!ua) return "unknown";
  if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) return "mobile";
  if (ua.includes("ipad") || ua.includes("tablet")) return "tablet";
  return "desktop";
}

function deriveBrowser(userAgent) {
  const ua = String(userAgent || "").toLowerCase();
  if (ua.includes("edg/")) return "Edge";
  if (ua.includes("chrome/")) return "Chrome";
  if (ua.includes("safari/") && !ua.includes("chrome/")) return "Safari";
  if (ua.includes("firefox/")) return "Firefox";
  if (ua.includes("opr/") || ua.includes("opera")) return "Opera";
  return "Unknown";
}

function buildRequestContext(req = {}) {
  const userAgent = req.headers?.["user-agent"] || "";
  return {
    ipAddress:
      req.ip ||
      req.headers?.["x-forwarded-for"]?.split(",")?.[0]?.trim() ||
      req.socket?.remoteAddress ||
      "unknown",
    userAgent,
    country: deriveCountry(req),
    deviceType: deriveDeviceType(userAgent),
    browser: deriveBrowser(userAgent),
    path: req.originalUrl || req.url || "",
    method: req.method || "",
  };
}

async function trackChatbotEvent(eventType, payload = {}, req = null) {
  try {
    const ctx = buildRequestContext(req || {});
    const record = {
      eventType: safeString(eventType, 80),
      userRole: safeString(payload.userRole, 40) || "public",
      sessionId: safeString(payload.sessionId, 120) || "anonymous",
      messageId: payload.messageId,
      conversationId: payload.conversationId,
      responseType: safeString(payload.responseType || "general", 40),
      confidenceScore: Number.isFinite(payload.confidenceScore) ? Number(payload.confidenceScore) : 0,
      fallbackTriggered: Boolean(payload.fallbackTriggered),
      retrievalCount: Number.isFinite(payload.retrievalCount) ? Number(payload.retrievalCount) : 0,
      usedCache: Boolean(payload.usedCache),
      responseTimeMs: Number.isFinite(payload.responseTimeMs) ? Number(payload.responseTimeMs) : 0,
      language: safeString(payload.language || "en", 12),
      proactivePromptId: safeString(payload.proactivePromptId || "", 120),
      attachmentCount: Number.isFinite(payload.attachmentCount) ? Number(payload.attachmentCount) : 0,
      containsPII: Boolean(payload.containsPII),
      piiCount: Number.isFinite(payload.piiCount) ? Number(payload.piiCount) : 0,
      promptTokens: Number.isFinite(payload.promptTokens) ? Number(payload.promptTokens) : 0,
      completionTokens: Number.isFinite(payload.completionTokens) ? Number(payload.completionTokens) : 0,
      totalTokens: Number.isFinite(payload.totalTokens) ? Number(payload.totalTokens) : 0,
      llmModel: safeString(payload.llmModel || "", 120),
      embeddingModel: safeString(payload.embeddingModel || "", 120),
      ...ctx,
      metadata: payload.metadata || {},
    };

    await ChatbotEvent.create(record);
  } catch (error) {
    console.error("[chatbotEventService] trackChatbotEvent failed:", error.message || error);
  }
}

async function trackSecurityEvent(eventType, payload = {}, req = null) {
  try {
    const ctx = buildRequestContext(req || {});
    await ChatbotSecurityEvent.create({
      eventType: safeString(eventType, 80),
      severity: safeString(payload.severity || "medium", 20),
      sessionId: safeString(payload.sessionId, 120) || "anonymous",
      userRole: safeString(payload.userRole, 40) || "public",
      prompt: safeString(payload.prompt, 1500),
      issues: Array.isArray(payload.issues) ? payload.issues.map((v) => safeString(v, 80)) : [],
      blocked: Boolean(payload.blocked),
      reason: safeString(payload.reason, 200),
      ...ctx,
      metadata: payload.metadata || {},
    });
  } catch (error) {
    console.error("[chatbotEventService] trackSecurityEvent failed:", error.message || error);
  }
}

module.exports = {
  buildRequestContext,
  trackChatbotEvent,
  trackSecurityEvent,
};
