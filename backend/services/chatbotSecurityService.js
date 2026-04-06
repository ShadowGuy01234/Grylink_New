const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi" },
  { code: "bn", name: "Bengali" },
  { code: "ta", name: "Tamil" },
  { code: "te", name: "Telugu" },
  { code: "mr", name: "Marathi" },
  { code: "gu", name: "Gujarati" },
  { code: "kn", name: "Kannada" },
  { code: "ml", name: "Malayalam" },
];

const PII_PATTERNS = [
  {
    key: "aadhaar",
    regex: /\b\d{4}[ -]?\d{4}[ -]?\d{4}\b/g,
    mask: (value) => value.replace(/\d(?=\d{4})/g, "*"),
  },
  {
    key: "pan",
    regex: /\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/g,
    mask: (value) => `${value.slice(0, 2)}******${value.slice(-2)}`,
  },
  {
    key: "gst",
    regex: /\b\d{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{3}\b/g,
    mask: (value) => `${value.slice(0, 4)}**********${value.slice(-2)}`,
  },
  {
    key: "phone",
    regex: /\b[6-9]\d{9}\b/g,
    mask: (value) => `******${value.slice(-4)}`,
  },
  {
    key: "bank_account",
    regex: /\b\d{9,18}\b/g,
    mask: (value) => `****${value.slice(-4)}`,
  },
  {
    key: "ifsc",
    regex: /\b[A-Z]{4}0[A-Z0-9]{6}\b/g,
    mask: (value) => `${value.slice(0, 4)}*******`,
  },
];

const DANGEROUS_PATTERNS = [
  /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
  /javascript\s*:/gi,
  /onerror\s*=|onload\s*=|onclick\s*=/gi,
  /\b(select\s+.+\s+from|union\s+select|drop\s+table|insert\s+into)\b/gi,
  /\b(eval\s*\(|new\s+Function\s*\(|process\.env|require\s*\()\b/gi,
  /```[\s\S]*?```/g,
];

let cachedEmojiRegex = null;

function getEmojiRegex() {
  if (cachedEmojiRegex) return cachedEmojiRegex;

  try {
    cachedEmojiRegex = new RegExp("\\p{Extended_Pictographic}", "gu");
  } catch {
    cachedEmojiRegex = /[\u{1F300}-\u{1FAFF}\u2600-\u27BF]/gu;
  }

  return cachedEmojiRegex;
}

function normalizeWhitespace(text) {
  return String(text || "")
    .replace(/\r/g, "")
    .replace(/\t+/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function stripHtmlTags(text) {
  return String(text || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ");
}

function sanitizeInput(text) {
  return normalizeWhitespace(stripHtmlTags(text));
}

function detectExcessiveRepeat(text) {
  return /(.)\1{7,}/.test(text);
}

function detectCapsSpam(text) {
  const letters = text.replace(/[^a-zA-Z]/g, "");
  if (letters.length < 12) return false;
  const upper = letters.replace(/[^A-Z]/g, "").length;
  return upper / letters.length > 0.85;
}

function detectExcessiveUrls(text) {
  const urls = text.match(/https?:\/\//gi) || [];
  return urls.length > 5;
}

function detectExcessiveEmojis(text) {
  const emojiRegex = getEmojiRegex();
  emojiRegex.lastIndex = 0;

  const matches = String(text || "").match(emojiRegex) || [];
  return matches.length > 20;
}

function detectInjectionAttempt(text) {
  return DANGEROUS_PATTERNS.some((pattern) => {
    pattern.lastIndex = 0;
    return pattern.test(text);
  });
}

function detectSpamSignals(text) {
  const issues = [];
  if (detectExcessiveRepeat(text)) issues.push("repeated_characters");
  if (detectCapsSpam(text)) issues.push("all_caps_pattern");
  if (detectExcessiveUrls(text)) issues.push("excessive_urls");
  if (detectExcessiveEmojis(text)) issues.push("excessive_emojis");
  return issues;
}

function isLikelyMarathiText(text) {
  const value = String(text || "");
  if (!/[\u0900-\u097F]/.test(value)) return false;

  const markers = [
    "आहे",
    "नाही",
    "मध्ये",
    "तुमच्या",
    "माझ्या",
    "कृपया",
    "कशी",
    "कसे",
    "मराठी",
  ];

  return markers.some((token) => value.includes(token));
}

function validateChatMessage(rawInput, options = {}) {
  const maxLength = Number.isFinite(options.maxLength) ? options.maxLength : 2000;
  const sanitized = sanitizeInput(rawInput);
  const lower = sanitized.toLowerCase();
  const spamSignals = detectSpamSignals(sanitized);

  if (!sanitized) {
    return {
      ok: false,
      sanitized,
      rejectedReason: "empty_message",
      severity: "low",
      issues: ["empty_message"],
    };
  }

  if (sanitized.length > maxLength) {
    return {
      ok: false,
      sanitized,
      rejectedReason: "message_too_long",
      severity: "medium",
      issues: ["message_too_long"],
    };
  }

  if (detectInjectionAttempt(sanitized) || lower.includes("<script")) {
    return {
      ok: false,
      sanitized,
      rejectedReason: "injection_detected",
      severity: "high",
      issues: ["injection_detected"],
    };
  }

  if (spamSignals.length) {
    return {
      ok: false,
      sanitized,
      rejectedReason: "spam_pattern",
      severity: "medium",
      issues: spamSignals,
    };
  }

  return {
    ok: true,
    sanitized,
    rejectedReason: null,
    severity: "low",
    issues: [],
  };
}

function detectLanguage(text) {
  const value = String(text || "");

  if (/[\u0980-\u09FF]/.test(value)) return { code: "bn", name: "Bengali" };
  if (/[\u0B80-\u0BFF]/.test(value)) return { code: "ta", name: "Tamil" };
  if (/[\u0C00-\u0C7F]/.test(value)) return { code: "te", name: "Telugu" };
  if (/[\u0A80-\u0AFF]/.test(value)) return { code: "gu", name: "Gujarati" };
  if (/[\u0C80-\u0CFF]/.test(value)) return { code: "kn", name: "Kannada" };
  if (/[\u0D00-\u0D7F]/.test(value)) return { code: "ml", name: "Malayalam" };

  // Hindi/Marathi share Devanagari script; use lexical markers for Marathi.
  if (isLikelyMarathiText(value)) return { code: "mr", name: "Marathi" };
  if (/[\u0900-\u097F]/.test(value)) return { code: "hi", name: "Hindi" };

  return { code: "en", name: "English" };
}

function detectPIIEntities(text) {
  const entities = [];
  const value = String(text || "");

  for (const item of PII_PATTERNS) {
    const matches = value.match(item.regex);
    if (matches && matches.length) {
      entities.push({ type: item.key, count: matches.length });
    }
  }

  return entities;
}

function maskPII(text) {
  let value = String(text || "");

  for (const item of PII_PATTERNS) {
    value = value.replace(item.regex, (match) => item.mask(match));
  }

  return value;
}

function buildRoleInstruction(role) {
  const normalizedRole = String(role || "public").toLowerCase();

  const map = {
    subcontractor:
      "Prioritize simple operational instructions for subcontractors, especially invoices, CWC requests, and status tracking.",
    epc: "Prioritize EPC company workflows, invoice approvals, and Letter of Guarantee guidance.",
    nbfc: "Prioritize lender view with risk, repayment timelines, and verification-focused responses.",
    admin:
      "Prioritize administrative workflows, controls, approvals, and escalation procedures.",
    ops: "Prioritize support and operations troubleshooting with clear action steps.",
    sales: "Prioritize onboarding, product explainers, and conversion-oriented guidance.",
    public: "Use beginner-friendly explanations and include next-step guidance for new users.",
  };

  return map[normalizedRole] || map.public;
}

function sanitizeAttachment(attachment) {
  if (!attachment || typeof attachment !== "object") return null;

  const name = normalizeWhitespace(attachment.name || attachment.fileName || "attachment").slice(0, 200);
  const type = normalizeWhitespace(attachment.type || attachment.fileType || "unknown").slice(0, 120);
  const size = Number.isFinite(attachment.size) ? Number(attachment.size) : 0;
  const textPreview = normalizeWhitespace(attachment.textPreview || "").slice(0, 1200);

  return {
    name,
    type,
    size,
    textPreview,
  };
}

function summarizeAttachmentsForContext(attachments) {
  if (!Array.isArray(attachments) || !attachments.length) return "";

  const safe = attachments.map(sanitizeAttachment).filter(Boolean).slice(0, 5);
  if (!safe.length) return "";

  const lines = safe.map((item, index) => {
    const sizeLabel = item.size > 0 ? `, ${item.size} bytes` : "";
    const preview = item.textPreview ? ` | preview: ${item.textPreview}` : "";
    return `${index + 1}. ${item.name} (${item.type}${sizeLabel})${preview}`;
  });

  return `User attached files:\n${lines.join("\n")}`;
}

function getSupportedLanguages() {
  return SUPPORTED_LANGUAGES;
}

module.exports = {
  buildRoleInstruction,
  detectLanguage,
  detectPIIEntities,
  getSupportedLanguages,
  maskPII,
  sanitizeAttachment,
  sanitizeInput,
  summarizeAttachmentsForContext,
  validateChatMessage,
};
