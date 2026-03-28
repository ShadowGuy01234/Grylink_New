const crypto = require("crypto");
const NodeCache = require("node-cache");

const chatCache = new NodeCache({
  stdTTL: 180,
  checkperiod: 120,
  useClones: false,
  deleteOnExpire: true,
  maxKeys: 5000,
});

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim().toLowerCase();
}

function createCacheKey({ prompt, role, language = "en", namespace = "chatbot" }) {
  const payload = {
    prompt: normalizeText(prompt),
    role: String(role || "public").toLowerCase(),
    language: String(language || "en").toLowerCase(),
    namespace: String(namespace || "chatbot").toLowerCase(),
  };

  const hash = crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex");
  return `chat:${hash}`;
}

function getCachedChatResponse(input) {
  const key = createCacheKey(input);
  const value = chatCache.get(key);
  if (!value) return null;

  return {
    ...value,
    fromCache: true,
  };
}

function setCachedChatResponse(input, payload, ttlSeconds = 180) {
  const key = createCacheKey(input);
  chatCache.set(key, payload, Math.max(30, Number(ttlSeconds) || 180));
  return key;
}

module.exports = {
  createCacheKey,
  getCachedChatResponse,
  setCachedChatResponse,
};
