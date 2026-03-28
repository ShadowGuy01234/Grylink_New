const crypto = require("crypto");
const ChatConversation = require("../models/ChatConversation");

const MAX_HISTORY = 10;
const DEFAULT_KEY_SEED = "gryork-chatbot-default-key-change-me";

function normalizeRole(role) {
  return String(role || "public").toLowerCase();
}

function normalizePortal(portal) {
  return String(portal || "public").toLowerCase();
}

function normalizeSessionId(sessionId) {
  const value = String(sessionId || "anonymous").trim();
  return value || "anonymous";
}

function normalizeMessage(role, content, timestamp = new Date()) {
  return {
    role: String(role || "user"),
    content: String(content || "").trim(),
    timestamp: new Date(timestamp).toISOString(),
  };
}

function getConversationKey() {
  const seed = process.env.CHATBOT_HISTORY_ENCRYPTION_KEY || process.env.CHATBOT_ENCRYPTION_KEY || DEFAULT_KEY_SEED;
  return crypto.createHash("sha256").update(String(seed)).digest();
}

function encryptHistory(history) {
  const plainText = JSON.stringify(Array.isArray(history) ? history : []);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", getConversationKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

function decryptHistory(payload) {
  const raw = String(payload || "").trim();
  if (!raw) return [];

  try {
    const [ivHex, encryptedHex] = raw.split(":");
    if (!ivHex || !encryptedHex) return [];

    const iv = Buffer.from(ivHex, "hex");
    const encrypted = Buffer.from(encryptedHex, "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", getConversationKey(), iv);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
    const parsed = JSON.parse(decrypted);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => normalizeMessage(item.role, item.content, item.timestamp));
  } catch {
    return [];
  }
}

async function findOrCreateConversation({ sessionId, userRole, userId = null, portal = "public" }) {
  const safeSessionId = normalizeSessionId(sessionId);

  let conversation = await ChatConversation.findOne({ sessionId: safeSessionId });
  if (conversation) return conversation;

  conversation = await ChatConversation.create({
    sessionId: safeSessionId,
    userId,
    role: normalizeRole(userRole),
    portal: normalizePortal(portal),
    encryptedHistory: encryptHistory([]),
    historyHash: "",
    messageCount: 0,
    lastLanguage: "en",
    metadata: {},
    isActive: true,
    lastMessageAt: new Date(),
  });

  conversation.historyHash = conversation.computeHistoryHash();
  await conversation.save();
  return conversation;
}

async function getRecentConversationMessages({ sessionId, limit = MAX_HISTORY }) {
  const safeSessionId = normalizeSessionId(sessionId);
  const size = Number.isFinite(limit) ? Math.max(1, Math.min(30, limit)) : MAX_HISTORY;

  const conversation = await ChatConversation.findOne({ sessionId: safeSessionId }).lean();
  if (!conversation) return [];

  const history = decryptHistory(conversation.encryptedHistory);
  return history.slice(-size);
}

function mergeMetadata(existingMetadata, incomingMetadata) {
  return {
    ...(existingMetadata || {}),
    ...(incomingMetadata || {}),
  };
}

async function appendConversationMessages({
  sessionId,
  userRole,
  portal,
  userId = null,
  userMessage,
  assistantMessage,
  language = "en",
  metadata = {},
}) {
  const conversation = await findOrCreateConversation({ sessionId, userRole, userId, portal });
  const history = decryptHistory(conversation.encryptedHistory);

  if (userMessage) {
    history.push(normalizeMessage("user", userMessage));
  }

  if (assistantMessage) {
    history.push(normalizeMessage("assistant", assistantMessage));
  }

  const cappedHistory = history.slice(-2 * MAX_HISTORY);

  conversation.role = normalizeRole(userRole);
  conversation.portal = normalizePortal(portal || conversation.portal);
  conversation.lastLanguage = String(language || conversation.lastLanguage || "en").toLowerCase();
  conversation.messageCount = cappedHistory.length;
  conversation.lastMessageAt = new Date();
  conversation.metadata = mergeMetadata(conversation.metadata, metadata);
  conversation.encryptedHistory = encryptHistory(cappedHistory);
  conversation.historyHash = conversation.computeHistoryHash();

  if (userId) {
    conversation.userId = userId;
  }

  await conversation.save();
  return conversation;
}

module.exports = {
  appendConversationMessages,
  decryptHistory,
  encryptHistory,
  findOrCreateConversation,
  getRecentConversationMessages,
  MAX_HISTORY,
};
