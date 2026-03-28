const express = require("express");
const rateLimit = require("express-rate-limit");
const crypto = require("crypto");
const router = express.Router();

const { authenticate, authorize } = require("../middleware/auth");
const chatbotRagService = require("../services/chatbotRagService");
const chatbotIngestionService = require("../services/chatbotIngestionService");
const ChatbotFeedback = require("../models/ChatbotFeedback");
const ChatbotEvent = require("../models/ChatbotEvent");
const ChatbotSecurityEvent = require("../models/ChatbotSecurityEvent");
const {
  appendConversationMessages,
  getRecentConversationMessages,
} = require("../services/chatbotConversationService");
const {
  buildRoleInstruction,
  detectLanguage,
  detectPIIEntities,
  getSupportedLanguages,
  maskPII,
  sanitizeAttachment,
  sanitizeInput,
  summarizeAttachmentsForContext,
  validateChatMessage,
} = require("../services/chatbotSecurityService");
const {
  trackChatbotEvent,
  trackSecurityEvent,
} = require("../services/chatbotEventService");
const {
  getCachedChatResponse,
  setCachedChatResponse,
} = require("../services/chatbotCacheService");
const { buildProactiveResponse } = require("../services/chatbotProactiveService");

const CHATBOT_ALLOWED_ROLES = [
  "subcontractor",
  "epc",
  "nbfc",
  "ops",
  "admin",
  "founder",
  "sales",
  "rmt",
];

const CHATBOT_INGEST_ALLOWED_ROLES = ["ops", "admin", "founder"];
const CHATBOT_ANALYTICS_ALLOWED_ROLES = ["ops", "admin", "founder"];
const CHATBOT_ADMIN_BYPASS_ROLES = ["admin", "founder"];
const MAX_QUERY_LENGTH = 2000;
const CACHE_TTL_SECONDS = 3600;
const LOCALHOST_URL_REGEX =
  /\bhttps?:\/\/(?:localhost|127(?:\.\d{1,3}){3}|0\.0\.0\.0)(?::\d+)?(?:\/[^\s)]*)?/gi;
const LOCALHOST_HOST_REGEX =
  /\b(?:localhost|127(?:\.\d{1,3}){3}|0\.0\.0\.0)(?::\d+)?\b/gi;
const ANSWER_CACHE_POLICY_VERSION = "no-localhost-v1";

function isAdminBypass(req) {
  return CHATBOT_ADMIN_BYPASS_ROLES.includes(String(req.user?.role || ""));
}

function getRequestIdentity(req) {
  if (req.user?._id) {
    return `user:${String(req.user._id)}`;
  }

  const ip = req.ip || req.headers?.["x-forwarded-for"]?.split(",")?.[0]?.trim() || "unknown";
  const ua = req.headers?.["user-agent"] || "";
  const hash = crypto
    .createHash("sha1")
    .update(`${ip}::${ua}`)
    .digest("hex")
    .slice(0, 16);

  return `anon:${hash}`;
}

function createLimiter({ maxPerMinute, channel, bypassAdmins = false }) {
  return rateLimit({
    windowMs: 60 * 1000,
    max: (req) => (bypassAdmins && isAdminBypass(req) ? 600 : maxPerMinute),
    standardHeaders: "draft-7",
    legacyHeaders: false,
    keyGenerator: (req) => `${channel}:${getRequestIdentity(req)}`,
    handler: async (req, res) => {
      await trackSecurityEvent(
        "rate_limit",
        {
          severity: "medium",
          sessionId: resolveSessionId(req),
          userRole: resolveUserRole(req),
          prompt: String(req.body?.message || "").slice(0, 800),
          blocked: true,
          reason: `rate_limit_exceeded_${channel}`,
          issues: ["rate_limit"],
          metadata: {
            path: req.originalUrl,
            method: req.method,
          },
        },
        req,
      );

      res.status(429).json({ error: `Rate limit exceeded for ${channel}. Please retry in 1 minute.` });
    },
  });
}

const standardQueryLimiter = createLimiter({
  maxPerMinute: 10,
  channel: "chat-query",
  bypassAdmins: true,
});

const feedbackLimiter = createLimiter({
  maxPerMinute: 5,
  channel: "chat-feedback",
  bypassAdmins: true,
});

const sessionActionLimiter = createLimiter({
  maxPerMinute: 5,
  channel: "chat-session",
  bypassAdmins: true,
});

const analyticsLimiter = createLimiter({
  maxPerMinute: 60,
  channel: "chat-analytics",
  bypassAdmins: true,
});

function parseOptionalPositiveInt(value) {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function parseBoolean(value, fallback) {
  if (value === undefined || value === null) return fallback;
  if (typeof value === "boolean") return value;

  const normalized = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "y", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "n", "off"].includes(normalized)) return false;
  return fallback;
}

function normalizeConversation(conversation, maxItems = 10) {
  if (!Array.isArray(conversation)) return [];

  return conversation
    .filter((item) => item && item.role && item.content)
    .slice(-maxItems)
    .map((item) => ({
      role: String(item.role || "user").slice(0, 20),
      content: String(item.content || "").slice(0, 2000),
    }));
}

function sanitizeAttachments(attachments) {
  if (!Array.isArray(attachments)) return [];
  return attachments.map(sanitizeAttachment).filter(Boolean).slice(0, 5);
}

function resolvePortal(value, fallbackRole) {
  if (typeof value === "string" && value.trim()) {
    return value.trim().toLowerCase();
  }
  if (typeof fallbackRole === "string" && fallbackRole.trim()) {
    return fallbackRole.trim().toLowerCase();
  }
  return "public";
}

function resolveUserRole(req, fallback = "public") {
  const explicitRole = req.body?.userRole;
  if (typeof explicitRole === "string" && explicitRole.trim()) {
    return explicitRole.trim().toLowerCase();
  }
  if (req.user?.role) {
    return String(req.user.role).toLowerCase();
  }
  return fallback;
}

function resolveSessionId(req) {
  const fromBody = req.body?.sessionId;
  if (typeof fromBody === "string" && fromBody.trim()) return fromBody.trim().slice(0, 120);

  const fromHeader = req.headers?.["x-chat-session-id"];
  if (typeof fromHeader === "string" && fromHeader.trim()) {
    return fromHeader.trim().slice(0, 120);
  }

  if (req.user?._id) {
    return `auth_${String(req.user._id).slice(0, 80)}`;
  }

  const identity = getRequestIdentity(req);
  return `pub_${identity.slice(-16)}`;
}

function sanitizeUserFacingAnswer(value) {
  return String(value || "")
    .replace(
      LOCALHOST_URL_REGEX,
      "the GryLink portal link provided in your invitation email",
    )
    .replace(LOCALHOST_HOST_REGEX, "your invitation portal link");
}

async function processChatQuery({ req, res, user, portalOverride = null }) {
  const startedAt = Date.now();

  const messageInput = req.body?.message;
  const validation = validateChatMessage(messageInput, { maxLength: MAX_QUERY_LENGTH });
  const userRole = resolveUserRole(req, user?.role || "public");
  const portal = resolvePortal(portalOverride || req.body?.portal, userRole);
  const sessionId = resolveSessionId(req);

  if (!validation.ok) {
    await trackSecurityEvent(
      validation.rejectedReason === "injection_detected" ? "injection_detected" : "content_blocked",
      {
        severity: validation.severity || "medium",
        sessionId,
        userRole,
        prompt: String(messageInput || "").slice(0, 1200),
        blocked: true,
        reason: validation.rejectedReason,
        issues: validation.issues || [],
        metadata: { portal },
      },
      req,
    );

    const statusCode = validation.rejectedReason === "message_too_long" ? 413 : 400;
    return res.status(statusCode).json({
      error:
        validation.rejectedReason === "message_too_long"
          ? "Message is too long. Keep it within 2000 characters."
          : "Message blocked due to security/content policy.",
      reason: validation.rejectedReason,
      issues: validation.issues || [],
    });
  }

  const sanitizedMessage = validation.sanitized;
  const language = detectLanguage(sanitizedMessage);
  const piiEntities = detectPIIEntities(sanitizedMessage);
  const piiCount = piiEntities.reduce((sum, item) => sum + Number(item.count || 0), 0);
  const attachments = sanitizeAttachments(req.body?.attachments);
  const attachmentContext = summarizeAttachmentsForContext(attachments);
  const roleInstruction = buildRoleInstruction(userRole);

  const storedConversation = await getRecentConversationMessages({ sessionId, limit: 10 });
  const clientConversation = normalizeConversation(req.body?.conversation, 10);
  const effectiveConversation = storedConversation.length ? storedConversation : clientConversation;

  const cacheInput = {
    prompt: sanitizedMessage,
    role: userRole,
    language: language.code,
    namespace: portal,
    policyVersion: ANSWER_CACHE_POLICY_VERSION,
  };

  const cached = getCachedChatResponse(cacheInput);
  if (cached) {
    const maskedUserMessage = maskPII(sanitizedMessage);
    const maskedAnswer = maskPII(sanitizeUserFacingAnswer(String(cached.answer || "")));

    await appendConversationMessages({
      sessionId,
      userRole,
      portal,
      userId: user?._id || null,
      userMessage: maskedUserMessage,
      assistantMessage: maskedAnswer,
      language: language.code,
      metadata: {
        source: "cache",
      },
    });

    await trackChatbotEvent(
      "cache_hit",
      {
        userRole,
        sessionId,
        usedCache: true,
        responseTimeMs: Date.now() - startedAt,
        retrievalCount: Number(cached?.retrieval?.returned || 0),
        fallbackTriggered: Boolean(cached?.fallbackTriggered),
        language: language.code,
        attachmentCount: attachments.length,
        containsPII: piiCount > 0,
        piiCount,
        messageId: req.body?.messageId,
        llmModel: cached?.modelInfo?.chat,
        embeddingModel: cached?.modelInfo?.embedding,
        metadata: {
          portal,
          endpoint: req.originalUrl,
          source: "cache",
        },
      },
      req,
    );

    const proactive = buildProactiveResponse(userRole, sanitizedMessage);

    return res.json({
      ...cached,
      answer: maskedAnswer,
      usedCache: true,
      cacheHit: true,
      sessionId,
      language: language.code,
      proactive,
      security: {
        piiDetected: piiCount > 0,
        piiCount,
      },
    });
  }

  const ragResult = await chatbotRagService.askRag({
    message: sanitizedMessage,
    user,
    portal,
    conversation: effectiveConversation,
    namespace: req.body?.namespace,
    roleInstruction,
    languageCode: language.code,
    attachmentContext,
  });

  const maskedUserMessage = maskPII(sanitizedMessage);
  const maskedAnswer = maskPII(sanitizeUserFacingAnswer(String(ragResult.answer || "")));

  await appendConversationMessages({
    sessionId,
    userRole,
    portal,
    userId: user?._id || null,
    userMessage: maskedUserMessage,
    assistantMessage: maskedAnswer,
    language: language.code,
    metadata: {
      source: "rag",
      portal,
    },
  });

  const resultForCache = {
    ...ragResult,
    answer: maskedAnswer,
  };

  setCachedChatResponse(cacheInput, resultForCache, CACHE_TTL_SECONDS);

  if (piiCount > 0) {
    await trackSecurityEvent(
      "pii_detected",
      {
        severity: "low",
        sessionId,
        userRole,
        prompt: maskedUserMessage,
        blocked: false,
        reason: "pii_entities_detected",
        issues: piiEntities.map((item) => item.type),
        metadata: {
          piiCount,
          entityBreakdown: piiEntities,
        },
      },
      req,
    );
  }

  await trackChatbotEvent(
    "query_response",
    {
      userRole,
      sessionId,
      messageId: req.body?.messageId,
      responseType: ragResult.fallbackTriggered ? "fallback" : "grounded",
      confidenceScore: ragResult.fallbackTriggered ? 0.35 : 0.82,
      fallbackTriggered: Boolean(ragResult.fallbackTriggered),
      retrievalCount: Number(ragResult?.retrieval?.returned || 0),
      usedCache: false,
      responseTimeMs: Date.now() - startedAt,
      language: language.code,
      attachmentCount: attachments.length,
      containsPII: piiCount > 0,
      piiCount,
      promptTokens: Number(ragResult?.usage?.promptTokens || 0),
      completionTokens: Number(ragResult?.usage?.completionTokens || 0),
      totalTokens: Number(ragResult?.usage?.totalTokens || 0),
      llmModel: ragResult?.modelInfo?.chat,
      embeddingModel: ragResult?.modelInfo?.embedding,
      proactivePromptId: req.body?.proactivePromptId,
      metadata: {
        portal,
        endpoint: req.originalUrl,
        citationCount: Array.isArray(ragResult.citations) ? ragResult.citations.length : 0,
      },
    },
    req,
  );

  const proactive = buildProactiveResponse(userRole, sanitizedMessage);

  return res.json({
    ...ragResult,
    answer: maskedAnswer,
    usedCache: false,
    cacheHit: false,
    sessionId,
    language: language.code,
    proactive,
    supportedLanguages: getSupportedLanguages(),
    security: {
      piiDetected: piiCount > 0,
      piiCount,
      piiTypes: piiEntities.map((item) => item.type),
    },
  });
}

async function saveFeedback(req, res, { fallbackRole = "public", requireReasonForNegative = true }) {
  const rating = String(req.body?.rating || "").trim().toLowerCase();
  if (!["helpful", "not_helpful"].includes(rating)) {
    return res.status(400).json({ error: "rating must be helpful or not_helpful" });
  }

  const reason = sanitizeInput(req.body?.reason || "").slice(0, 1200);
  if (requireReasonForNegative && rating === "not_helpful" && reason.length < 3) {
    return res
      .status(400)
      .json({ error: "Please share a short reason when marking a response as not helpful." });
  }

  const sessionId = resolveSessionId(req);
  const role = resolveUserRole(req, fallbackRole);
  const portal = resolvePortal(req.body?.portal, role);
  const language = String(req.body?.language || "en").toLowerCase();

  const payload = {
    sessionId,
    userId: req.user?._id || null,
    role,
    portal,
    messageId: sanitizeInput(req.body?.messageId || "").slice(0, 120),
    rating,
    reason,
    question: sanitizeInput(maskPII(req.body?.question || "")).slice(0, 4000),
    answerExcerpt: sanitizeInput(maskPII(req.body?.answerExcerpt || "")).slice(0, 4000),
    language,
    metadata: {
      source: sanitizeInput(req.body?.source || "widget").slice(0, 120),
      ipAddress: req.ip,
      userAgent: req.headers?.["user-agent"] || "",
    },
  };

  const created = await ChatbotFeedback.create(payload);

  await trackChatbotEvent(
    "feedback",
    {
      userRole: role,
      sessionId,
      messageId: payload.messageId,
      responseType: rating,
      usedCache: false,
      responseTimeMs: 0,
      language,
      metadata: {
        portal,
        reasonProvided: Boolean(reason),
      },
    },
    req,
  );

  return res.status(201).json({
    success: true,
    feedbackId: created._id,
  });
}

async function getAnalyticsSummary(req, res) {
  const days = Math.max(1, Math.min(90, parseOptionalPositiveInt(req.query.days) || 7));
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [
    totalEvents,
    queryEvents,
    cacheHitEvents,
    feedbackTotal,
    feedbackHelpful,
    feedbackNotHelpful,
    securityEvents,
    avgLatencyResult,
    activeSessionsResult,
    feedbackReasons,
  ] = await Promise.all([
    ChatbotEvent.countDocuments({ createdAt: { $gte: since } }),
    ChatbotEvent.countDocuments({
      createdAt: { $gte: since },
      eventType: { $in: ["query_response", "cache_hit"] },
    }),
    ChatbotEvent.countDocuments({ createdAt: { $gte: since }, eventType: "cache_hit" }),
    ChatbotFeedback.countDocuments({ createdAt: { $gte: since } }),
    ChatbotFeedback.countDocuments({ createdAt: { $gte: since }, rating: "helpful" }),
    ChatbotFeedback.countDocuments({ createdAt: { $gte: since }, rating: "not_helpful" }),
    ChatbotSecurityEvent.countDocuments({ createdAt: { $gte: since } }),
    ChatbotEvent.aggregate([
      { $match: { createdAt: { $gte: since }, responseTimeMs: { $gt: 0 } } },
      {
        $group: {
          _id: null,
          avgResponseTimeMs: { $avg: "$responseTimeMs" },
        },
      },
    ]),
    ChatbotEvent.aggregate([
      { $match: { createdAt: { $gte: since }, sessionId: { $exists: true, $ne: "" } } },
      { $group: { _id: "$sessionId" } },
      { $count: "count" },
    ]),
    ChatbotFeedback.aggregate([
      {
        $match: {
          createdAt: { $gte: since },
          rating: "not_helpful",
        },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $gt: [{ $strLenCP: { $ifNull: ["$reason", ""] } }, 0] },
              "$reason",
              "$question",
            ],
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
  ]);

  const avgResponseTimeMs = Number(avgLatencyResult?.[0]?.avgResponseTimeMs || 0);
  const activeSessions = Number(activeSessionsResult?.[0]?.count || 0);
  const cacheHitRate = queryEvents > 0 ? cacheHitEvents / queryEvents : 0;
  const helpfulRate = feedbackTotal > 0 ? feedbackHelpful / feedbackTotal : 0;

  return res.json({
    window: {
      days,
      since,
    },
    metrics: {
      totalEvents,
      queryEvents,
      cacheHitEvents,
      cacheHitRate: Number(cacheHitRate.toFixed(4)),
      avgResponseTimeMs: Number(avgResponseTimeMs.toFixed(2)),
      activeSessions,
      feedback: {
        total: feedbackTotal,
        helpful: feedbackHelpful,
        notHelpful: feedbackNotHelpful,
        helpfulRate: Number(helpfulRate.toFixed(4)),
      },
      securityEvents,
    },
    knowledgeGaps: feedbackReasons.map((item) => ({
      topic: String(item._id || "unknown").slice(0, 300),
      count: Number(item.count || 0),
    })),
  });
}

// Health endpoint for environment readiness and model/index config checks.
router.get("/health", (req, res) => {
  const health = chatbotRagService.getHealth();
  const statusCode = health.configured ? 200 : 503;
  res.status(statusCode).json(health);
});

// Main RAG query endpoint.
router.post(
  "/query",
  authenticate,
  authorize(...CHATBOT_ALLOWED_ROLES),
  standardQueryLimiter,
  async (req, res) => {
    try {
      return await processChatQuery({ req, res, user: req.user });
    } catch (error) {
      await trackChatbotEvent(
        "query_error",
        {
          userRole: resolveUserRole(req),
          sessionId: resolveSessionId(req),
          responseType: "error",
          metadata: {
            endpoint: req.originalUrl,
            error: String(error.message || "RAG query failed").slice(0, 300),
          },
        },
        req,
      );

      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ error: error.message || "RAG query failed" });
    }
  },
);

// Public RAG endpoint for unauthenticated website surfaces (public site and onboarding pages).
router.post("/public-query", standardQueryLimiter, async (req, res) => {
  try {
    return await processChatQuery({
      req,
      res,
      user: { role: "public" },
      portalOverride: "public",
    });
  } catch (error) {
    await trackChatbotEvent(
      "query_error",
      {
        userRole: "public",
        sessionId: resolveSessionId(req),
        responseType: "error",
        metadata: {
          endpoint: req.originalUrl,
          error: String(error.message || "Public RAG query failed").slice(0, 300),
        },
      },
      req,
    );

    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message || "Public RAG query failed" });
  }
});

router.post(
  "/feedback",
  authenticate,
  authorize(...CHATBOT_ALLOWED_ROLES),
  feedbackLimiter,
  async (req, res) => {
    try {
      return await saveFeedback(req, res, { fallbackRole: req.user?.role || "public" });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      return res.status(statusCode).json({ error: error.message || "Unable to save feedback" });
    }
  },
);

router.post("/public-feedback", feedbackLimiter, async (req, res) => {
  try {
    return await saveFeedback(req, res, { fallbackRole: "public" });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ error: error.message || "Unable to save feedback" });
  }
});

router.get(
  "/proactive",
  authenticate,
  authorize(...CHATBOT_ALLOWED_ROLES),
  sessionActionLimiter,
  async (req, res) => {
    try {
      const userRole = String(req.user?.role || "public").toLowerCase();
      const currentPrompt = sanitizeInput(req.query.currentPrompt || "");
      const proactive = buildProactiveResponse(userRole, currentPrompt);

      await trackChatbotEvent(
        "proactive_prompt_served",
        {
          userRole,
          sessionId: resolveSessionId(req),
          responseType: proactive.reason,
          metadata: {
            endpoint: req.originalUrl,
            promptCount: proactive.prompts.length,
          },
        },
        req,
      );

      return res.json(proactive);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      return res.status(statusCode).json({ error: error.message || "Unable to fetch proactive prompts" });
    }
  },
);

router.get("/public-proactive", sessionActionLimiter, async (req, res) => {
  try {
    const currentPrompt = sanitizeInput(req.query.currentPrompt || "");
    const proactive = buildProactiveResponse("public", currentPrompt);
    return res.json(proactive);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ error: error.message || "Unable to fetch public proactive prompts" });
  }
});

router.get(
  "/session/:sessionId",
  authenticate,
  authorize(...CHATBOT_ALLOWED_ROLES),
  sessionActionLimiter,
  async (req, res) => {
    try {
      const sessionId = sanitizeInput(req.params.sessionId || "").slice(0, 120);
      if (!sessionId) {
        return res.status(400).json({ error: "sessionId is required" });
      }

      const messages = await getRecentConversationMessages({ sessionId, limit: 10 });
      return res.json({ sessionId, messages });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      return res.status(statusCode).json({ error: error.message || "Unable to load session" });
    }
  },
);

router.get("/languages", (req, res) => {
  return res.json({
    supported: getSupportedLanguages(),
    autoDetection: true,
  });
});

router.get(
  "/analytics/summary",
  authenticate,
  authorize(...CHATBOT_ANALYTICS_ALLOWED_ROLES),
  analyticsLimiter,
  async (req, res) => {
    try {
      return await getAnalyticsSummary(req, res);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      return res.status(statusCode).json({ error: error.message || "Unable to fetch analytics summary" });
    }
  },
);

router.get(
  "/analytics/security",
  authenticate,
  authorize(...CHATBOT_ANALYTICS_ALLOWED_ROLES),
  analyticsLimiter,
  async (req, res) => {
    try {
      const limit = Math.max(1, Math.min(200, parseOptionalPositiveInt(req.query.limit) || 50));
      const records = await ChatbotSecurityEvent.find({})
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      return res.json({
        count: records.length,
        records,
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      return res.status(statusCode).json({ error: error.message || "Unable to fetch security analytics" });
    }
  },
);

// Read the latest ingestion status and manifest summary.
router.get(
  "/reindex/status",
  authenticate,
  authorize(...CHATBOT_INGEST_ALLOWED_ROLES),
  (req, res) => {
    try {
      const status = chatbotIngestionService.getIngestionStatus();
      res.json(status);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ error: error.message || "Unable to read ingestion status" });
    }
  },
);

// Read indexed source coverage summary grouped by source path and source type.
router.get(
  "/reindex/coverage",
  authenticate,
  authorize(...CHATBOT_INGEST_ALLOWED_ROLES),
  (req, res) => {
    try {
      const coverage = chatbotIngestionService.getIndexedSourceCoverageSummary();
      res.json(coverage);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res
        .status(statusCode)
        .json({ error: error.message || "Unable to read source coverage summary" });
    }
  },
);

// Trigger ingestion/indexing from chatbot-data and project docs into Pinecone.
router.post(
  "/reindex",
  authenticate,
  authorize(...CHATBOT_INGEST_ALLOWED_ROLES),
  async (req, res) => {
    try {
      const options = {
        dryRun: parseBoolean(req.body?.dryRun, false),
        force: parseBoolean(req.body?.force, false),
        includeDocs: parseBoolean(req.body?.includeDocs, true),
        maxChunks: parseOptionalPositiveInt(req.body?.maxChunks),
        namespace:
          typeof req.body?.namespace === "string" && req.body.namespace.trim()
            ? req.body.namespace.trim()
            : undefined,
      };

      const result = await chatbotIngestionService.ingestKnowledgeBase(options);
      res.json(result);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ error: error.message || "Reindex failed" });
    }
  },
);

module.exports = router;
