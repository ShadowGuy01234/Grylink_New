const DEFAULT_GROQ_BASE_URL = "https://api.groq.com/openai/v1";
const DEFAULT_CHAT_MODEL = "llama-3.3-70b-versatile";
const DEFAULT_FAST_CHAT_MODEL = "llama-3.1-8b-instant";
const DEFAULT_EMBEDDING_MODEL = "llama-text-embed-v2";
const DEFAULT_HF_BASE_URL = "https://router.huggingface.co";
const DEFAULT_HF_EMBEDDING_MODEL = "BAAI/bge-m3";
const DEFAULT_HF_RERANK_TOP_N = 10;
const DEFAULT_HF_RERANK_TIMEOUT_MS = 1200;
const DEFAULT_RAG_FAST_MODE = true;

const LOCALHOST_URL_REGEX =
  /\bhttps?:\/\/(?:localhost|127(?:\.\d{1,3}){3}|0\.0\.0\.0)(?::\d+)?(?:\/[^\s)]*)?/gi;
const LOCALHOST_HOST_REGEX =
  /\b(?:localhost|127(?:\.\d{1,3}){3}|0\.0\.0\.0)(?::\d+)?\b/gi;
const LOCALHOST_REPLACEMENT =
  "the GryLink portal link provided in your invitation email";

const { createEmbeddings } = require("./chatbotEmbeddingUtils");

let cachedHfInferenceModule = null;

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value || ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseScore(value, fallback) {
  const parsed = Number.parseFloat(String(value || ""));
  if (!Number.isFinite(parsed)) return fallback;
  if (parsed < 0) return 0;
  if (parsed > 1) return 1;
  return parsed;
}

function parseBoolean(value, fallback) {
  if (value === undefined || value === null) return fallback;
  if (typeof value === "boolean") return value;

  const normalized = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "y", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "n", "off"].includes(normalized)) return false;
  return fallback;
}

function parseNonNegativeInt(value, fallback) {
  const parsed = Number.parseInt(String(value || ""), 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function clampPositiveInt(value, maxAllowed) {
  if (!Number.isFinite(value) || value <= 0) return value;
  return Math.min(value, maxAllowed);
}

function fetchTimeoutMs(signalMs, fallback) {
  const parsed = parseNonNegativeInt(signalMs, fallback);
  return parsed <= 0 ? fallback : parsed;
}

async function fetchWithTimeout(url, options, timeoutMs, timeoutLabel) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      const err = new Error(`${timeoutLabel || "request"}_timeout`);
      err.statusCode = 504;
      throw err;
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

function normalizeEmbeddingProvider(value) {
  const normalized = String(value || "auto").trim().toLowerCase();

  if (["hf", "huggingface", "hf-inference"].includes(normalized)) {
    return "huggingface";
  }

  if (["groq", "local", "auto"].includes(normalized)) {
    return normalized;
  }

  return "auto";
}

function getConfig() {
  const embeddingProvider = normalizeEmbeddingProvider(
    process.env.RAG_EMBEDDING_PROVIDER || "auto",
  );

  const fastMode = parseBoolean(process.env.RAG_FAST_MODE, DEFAULT_RAG_FAST_MODE);
  const configuredChatModel = process.env.GROQ_CHAT_MODEL || DEFAULT_CHAT_MODEL;
  const fastChatModel = process.env.RAG_FAST_CHAT_MODEL || DEFAULT_FAST_CHAT_MODEL;
  const useFastChatModel = fastMode
    ? parseBoolean(process.env.RAG_USE_FAST_CHAT_MODEL, true)
    : false;
  const topK = parsePositiveInt(process.env.PINECONE_TOP_K, 6);
  const maxContextChunks = parsePositiveInt(process.env.RAG_MAX_CONTEXT_CHUNKS, 4);
  const contextCharsPerChunk = parsePositiveInt(process.env.RAG_CONTEXT_CHARS_PER_CHUNK, 900);
  const hfRerankTopN = parsePositiveInt(
    process.env.RAG_HF_RERANK_TOP_N,
    DEFAULT_HF_RERANK_TOP_N,
  );
  const hfRerankEnabledFromEnv = parseBoolean(process.env.RAG_HF_RERANK_ENABLED, false);

  const effectiveTopK = fastMode ? clampPositiveInt(topK, 4) : topK;
  const effectiveContextChunks = fastMode ? clampPositiveInt(maxContextChunks, 3) : maxContextChunks;
  const effectiveContextChars = fastMode ? clampPositiveInt(contextCharsPerChunk, 700) : contextCharsPerChunk;
  const effectiveRerankTopN = fastMode ? clampPositiveInt(hfRerankTopN, 8) : hfRerankTopN;
  const effectiveRerankEnabled = fastMode ? false : hfRerankEnabledFromEnv;

  return {
    groqApiKey: process.env.GROQ_API_KEY,
    groqBaseUrl: process.env.GROQ_BASE_URL || DEFAULT_GROQ_BASE_URL,
    groqChatModel: useFastChatModel ? fastChatModel : configuredChatModel,
    groqChatModelFallback: configuredChatModel,
    groqEmbeddingModel:
      process.env.GROQ_EMBEDDING_MODEL || DEFAULT_EMBEDDING_MODEL,
    hfToken:
      process.env.HF_TOKEN ||
      process.env.HUGGINGFACEHUB_API_TOKEN ||
      process.env.HUGGING_FACE_HUB_TOKEN,
    hfBaseUrl: process.env.HF_BASE_URL || DEFAULT_HF_BASE_URL,
    hfEmbeddingModel: process.env.HF_EMBEDDING_MODEL || DEFAULT_HF_EMBEDDING_MODEL,
    hfRerankEnabled: effectiveRerankEnabled,
    hfRerankTopN: effectiveRerankTopN,
    hfRerankTimeoutMs: parseNonNegativeInt(
      process.env.RAG_HF_RERANK_TIMEOUT_MS,
      DEFAULT_HF_RERANK_TIMEOUT_MS,
    ),
    embeddingProvider,
    pineconeApiKey: process.env.PINECONE_API_KEY,
    pineconeIndexHost: process.env.PINECONE_INDEX_HOST,
    pineconeIndexName: process.env.PINECONE_INDEX_NAME || "gryork-rag",
    namespacePrefix: process.env.PINECONE_NAMESPACE_PREFIX || "gryork",
    topK: effectiveTopK,
    maxContextChunks: effectiveContextChunks,
    contextCharsPerChunk: effectiveContextChars,
    scoreThreshold: parseScore(process.env.RAG_SCORE_THRESHOLD, 0.72),
    ragFastMode: fastMode,
    timeouts: {
      pineconeQueryMs: fetchTimeoutMs(process.env.RAG_PINECONE_TIMEOUT_MS, fastMode ? 4500 : 7000),
      groqChatMs: fetchTimeoutMs(process.env.RAG_CHAT_TIMEOUT_MS, fastMode ? 12000 : 20000),
    },
  };
}

function getMissingConfig(config) {
  const required = [
    ["GROQ_API_KEY", config.groqApiKey],
    ["PINECONE_API_KEY", config.pineconeApiKey],
    ["PINECONE_INDEX_HOST", config.pineconeIndexHost],
  ];

  if (config.embeddingProvider === "huggingface") {
    required.push(["HF_TOKEN", config.hfToken]);
  }

  return required.filter(([, value]) => !value).map(([key]) => key);
}

function buildNamespace({ portal, role, namespace, config }) {
  if (namespace && String(namespace).trim()) {
    return String(namespace).trim();
  }

  const normalizedPortal = (portal || role || "common").toLowerCase();
  return `${config.namespacePrefix}-${normalizedPortal}`;
}

function buildCommonNamespace(config) {
  return `${config.namespacePrefix}-common`;
}

function mergeMatches(...matchLists) {
  const mergedById = new Map();

  for (const list of matchLists) {
    for (const item of list || []) {
      if (!item || !item.id) continue;
      const previous = mergedById.get(item.id);
      if (!previous || Number(item.score || 0) > Number(previous.score || 0)) {
        mergedById.set(item.id, item);
      }
    }
  }

  return Array.from(mergedById.values()).sort(
    (a, b) => Number(b?.score || 0) - Number(a?.score || 0),
  );
}

function toRerankText(item) {
  const md = item?.metadata || {};
  const text = String(md.text || md.chunk || md.content || "").trim();
  if (!text) return "";
  return text.slice(0, 1200);
}

async function getHfInferenceClient(hfToken) {
  if (!cachedHfInferenceModule) {
    cachedHfInferenceModule = import("@huggingface/inference");
  }

  const { InferenceClient } = await cachedHfInferenceModule;
  return new InferenceClient(hfToken);
}

function normalizeSimilarityScores(output) {
  if (Array.isArray(output)) {
    return output.map((value) => Number(value)).filter((value) => Number.isFinite(value));
  }

  if (Array.isArray(output?.scores)) {
    return output.scores
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value));
  }

  return [];
}

async function rerankMatchesWithHuggingFace(query, matches, config) {
  if (!config.hfRerankEnabled || !config.hfToken) {
    return matches;
  }

  if (!Array.isArray(matches) || matches.length < 2) {
    return matches;
  }

  const topN = Math.min(config.hfRerankTopN, matches.length);
  const candidates = matches.slice(0, topN);
  const sentences = candidates.map(toRerankText);

  if (!sentences.some(Boolean)) {
    return matches;
  }

  try {
    const timeoutMs = Number(config.hfRerankTimeoutMs || 0);
    const client = await getHfInferenceClient(config.hfToken);
    const requestPromise = client.sentenceSimilarity({
      model: config.hfEmbeddingModel,
      provider: "hf-inference",
      inputs: {
        source_sentence: query,
        sentences,
      },
    });

    const output =
      timeoutMs > 0
        ? await Promise.race([
            requestPromise,
            new Promise((_, reject) => {
              setTimeout(() => reject(new Error("hf_rerank_timeout")), timeoutMs);
            }),
          ])
        : await requestPromise;

    const similarityScores = normalizeSimilarityScores(output);
    if (similarityScores.length !== candidates.length) {
      return matches;
    }

    const rerankedCandidates = candidates
      .map((item, index) => ({
        item,
        similarity: similarityScores[index],
        pineconeScore: Number(item?.score || 0),
      }))
      .sort((a, b) => {
        if (b.similarity !== a.similarity) {
          return b.similarity - a.similarity;
        }
        return b.pineconeScore - a.pineconeScore;
      })
      .map(({ item }) => item);

    return [...rerankedCandidates, ...matches.slice(topN)];
  } catch (error) {
    return matches;
  }
}

function trimConversation(conversation) {
  if (!Array.isArray(conversation)) return [];

  return conversation
    .filter((item) => item && item.role && item.content)
    .slice(-6)
    .map((item) => ({
      role: item.role,
      content: String(item.content)
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 420),
    }));
}

function sanitizeLocalhostMentions(value) {
  return String(value || "")
    .replace(LOCALHOST_URL_REGEX, LOCALHOST_REPLACEMENT)
    .replace(LOCALHOST_HOST_REGEX, "your invitation portal link");
}

function buildSystemPrompt({ portal, role, roleInstruction, languageCode }) {
  const effectiveRole = role || portal || "user";
  const language = String(languageCode || "en").toLowerCase();

  return [
    "You are Gryork's support assistant.",
    "Answer only from the supplied context.",
    "If context does not contain the answer, clearly say you do not have enough information.",
    "Do not fabricate policy, timelines, rates, legal guarantees, or case status details.",
    "Use short, practical answers suitable for portal users.",
    "Never provide localhost, 127.0.0.1, or development URLs to end users.",
    "If context contains local URLs, replace them with the invitation portal link wording.",
    "Always suggest contacting Ops support for account-specific actions when required.",
    `Prefer response language: ${language}.`,
    `Current user audience: ${effectiveRole}.`,
    roleInstruction || "",
  ].join(" ");
}

function buildSmartFallback(role) {
  const normalizedRole = String(role || "public").toLowerCase();
  const suggestionsByRole = {
    subcontractor: [
      "How do I submit CWCRF with correct documents?",
      "How can I track disbursement status?",
      "What to do if my invoice is rejected?",
    ],
    epc: [
      "How does EPC invoice verification work?",
      "How to approve buyer confirmation quickly?",
      "What are top compliance checks for EPC users?",
    ],
    nbfc: [
      "How should an NBFC evaluate case risk?",
      "What data is included in CWCAF?",
      "How to handle default escalation?",
    ],
    admin: [
      "How do I review audit logs?",
      "How can I reindex chatbot knowledge?",
      "How to monitor user workflow bottlenecks?",
    ],
    ops: [
      "What are first steps for upload failures?",
      "How to resolve Action Required status?",
      "How do I escalate repayment disputes?",
    ],
    sales: [
      "How do I explain GryLink value to EPC?",
      "What are common onboarding objections?",
      "What is the typical funding turnaround?",
    ],
    public: [
      "How do I start on GryLink?",
      "What roles are supported on Gryork?",
      "How secure is user financial data?",
    ],
  };

  return {
    answer:
      "I do not have enough grounded context for that yet. You can try one of these related queries, or contact Ops support for an accurate account-specific response.",
    suggestions: suggestionsByRole[normalizedRole] || suggestionsByRole.public,
  };
}

async function callGroqEmbeddings(input, config) {
  const result = await createEmbeddings(input, {
    groqApiKey: config.groqApiKey,
    groqBaseUrl: config.groqBaseUrl,
    groqEmbeddingModel: config.groqEmbeddingModel,
    hfToken: config.hfToken,
    hfBaseUrl: config.hfBaseUrl,
    hfEmbeddingModel: config.hfEmbeddingModel,
    pineconeApiKey: config.pineconeApiKey,
    pineconeIndexHost: config.pineconeIndexHost,
    embeddingProvider: config.embeddingProvider,
  });

  const embedding = result?.embeddings?.[0];
  if (!Array.isArray(embedding) || !embedding.length) {
    const err = new Error("Embedding generation did not return a valid vector");
    err.statusCode = 502;
    throw err;
  }

  return embedding;
}

async function queryPinecone(vector, { namespace, topK }, config) {
  const host = String(config.pineconeIndexHost || "")
    .replace(/^https?:\/\//i, "")
    .replace(/\/+$/g, "");

  const response = await fetchWithTimeout(
    `https://${host}/query`,
    {
      method: "POST",
      headers: {
        "Api-Key": config.pineconeApiKey,
        "Content-Type": "application/json",
        "X-Pinecone-API-Version": "2024-07",
      },
      body: JSON.stringify({
        namespace,
        vector,
        topK,
        includeMetadata: true,
        includeValues: false,
      }),
    },
    config.timeouts?.pineconeQueryMs || 4000,
    "pinecone_query",
  );

  if (!response.ok) {
    const errorText = await response.text();
    const err = new Error(`Pinecone query failed: ${errorText}`);
    err.statusCode = 502;
    throw err;
  }

  const data = await response.json();
  return Array.isArray(data?.matches) ? data.matches : [];
}

function normalizeMatches(matches, scoreThreshold, maxContextChunks, contextCharsPerChunk) {
  const filtered = matches
    .filter((item) => Number(item?.score || 0) >= scoreThreshold)
    .slice(0, maxContextChunks);

  const contextChunks = filtered
    .map((item, index) => {
      const md = item.metadata || {};
      const text = sanitizeLocalhostMentions(md.text || md.chunk || md.content || "");
      if (!text) return null;

      return {
        position: index + 1,
        id: item.id,
        score: Number(item.score || 0),
        text: String(text).slice(0, contextCharsPerChunk),
        title: md.title || md.section || md.sourcePath || "Knowledge Chunk",
        source: md.sourcePath || md.source || "unknown",
        section: md.section || null,
      };
    })
    .filter(Boolean);

  const citations = contextChunks.map((chunk) => ({
    id: chunk.id,
    score: Number(chunk.score.toFixed(4)),
    title: chunk.title,
    source: chunk.source,
    section: chunk.section,
  }));

  return { contextChunks, citations };
}

function buildContextBlock(contextChunks) {
  if (!contextChunks.length) return "";

  return contextChunks
    .map((chunk) => `[Source ${chunk.position}] ${chunk.title}\n${chunk.text}`)
    .join("\n\n");
}

async function callGroqChat(messages, config) {
  async function requestWithModel(modelName) {
    return fetchWithTimeout(
      `${config.groqBaseUrl}/chat/completions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.groqApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: modelName,
          temperature: 0.2,
          max_tokens: 320,
          messages,
        }),
      },
      config.timeouts?.groqChatMs || 12000,
      "groq_chat",
    );
  }

  let response = await requestWithModel(config.groqChatModel);

  if (!response.ok) {
    const errorText = await response.text();
    const shouldRetryWithFallback =
      String(errorText || "").toLowerCase().includes("model_not_found") &&
      config.groqChatModelFallback &&
      config.groqChatModelFallback !== config.groqChatModel;

    if (!shouldRetryWithFallback) {
      const err = new Error(`Groq chat completion failed: ${errorText}`);
      err.statusCode = 502;
      throw err;
    }

    response = await requestWithModel(config.groqChatModelFallback);
    if (!response.ok) {
      const fallbackErrorText = await response.text();
      const err = new Error(`Groq chat completion failed: ${fallbackErrorText}`);
      err.statusCode = 502;
      throw err;
    }
  }

  const data = await response.json();
  const answer = data?.choices?.[0]?.message?.content;

  if (!answer || !String(answer).trim()) {
    const err = new Error("Groq chat completion returned an empty answer");
    err.statusCode = 502;
    throw err;
  }

  const usage = {
    promptTokens: Number(data?.usage?.prompt_tokens || 0),
    completionTokens: Number(data?.usage?.completion_tokens || 0),
    totalTokens: Number(data?.usage?.total_tokens || 0),
  };

  return {
    answer: String(answer).trim(),
    usage,
  };
}

async function askRag({
  message,
  user,
  portal,
  conversation,
  namespace,
  roleInstruction,
  languageCode,
  attachmentContext,
}) {
  const config = getConfig();
  const missing = getMissingConfig(config);

  if (missing.length) {
    const err = new Error(
      `RAG chatbot is not configured. Missing environment variables: ${missing.join(", ")}`,
    );
    err.statusCode = 503;
    throw err;
  }

  const input = String(message || "").trim();
  if (!input) {
    const err = new Error("message is required");
    err.statusCode = 400;
    throw err;
  }

  const role = user?.role || "user";
  const resolvedNamespace = buildNamespace({
    portal,
    role,
    namespace,
    config,
  });
  const commonNamespace = buildCommonNamespace(config);

  const vector = await callGroqEmbeddings(input, config);
  const roleQuery = queryPinecone(
    vector,
    { namespace: resolvedNamespace, topK: config.topK },
    config,
  );
  const commonQuery =
    resolvedNamespace === commonNamespace
      ? Promise.resolve([])
      : queryPinecone(
          vector,
          { namespace: commonNamespace, topK: config.topK },
          config,
        );

  const [roleResult, commonResult] = await Promise.allSettled([roleQuery, commonQuery]);

  const roleMatches = roleResult.status === "fulfilled" ? roleResult.value : [];
  const commonMatches = commonResult.status === "fulfilled" ? commonResult.value : [];

  if (roleResult.status === "rejected" && commonResult.status === "rejected") {
    const err = new Error("Vector retrieval temporarily unavailable");
    err.statusCode = 503;
    throw err;
  }

  const mergedMatches = mergeMatches(roleMatches, commonMatches);
  const rawMatches = await rerankMatchesWithHuggingFace(input, mergedMatches, config);

  const strictResult = normalizeMatches(
    rawMatches,
    config.scoreThreshold,
    config.maxContextChunks,
    config.contextCharsPerChunk,
  );
  const relaxedThreshold = Math.min(config.scoreThreshold, 0.08);
  const relaxedResult =
    !strictResult.contextChunks.length && rawMatches.length
      ? normalizeMatches(
          rawMatches,
          relaxedThreshold,
          config.maxContextChunks,
          config.contextCharsPerChunk,
        )
      : strictResult;

  const { contextChunks, citations } = relaxedResult;
  const scoreThresholdUsed = strictResult.contextChunks.length
    ? config.scoreThreshold
    : relaxedThreshold;

  if (!contextChunks.length) {
    const fallback = buildSmartFallback(role);

    return {
      answer: sanitizeLocalhostMentions(fallback.answer),
      suggestions: fallback.suggestions,
      citations: [],
      retrieval: {
        namespace: resolvedNamespace,
        namespacesQueried:
          resolvedNamespace === commonNamespace
            ? [resolvedNamespace]
            : [resolvedNamespace, commonNamespace],
        topK: config.topK,
        returned: 0,
        scoreThreshold: config.scoreThreshold,
        scoreThresholdUsed,
      },
      fallbackTriggered: true,
      modelInfo: {
        chat: config.groqChatModel,
        embedding: config.embeddingProvider === "huggingface" ? config.hfEmbeddingModel : config.groqEmbeddingModel,
      },
      usage: {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      },
    };
  }

  const systemPrompt = buildSystemPrompt({
    portal,
    role,
    roleInstruction,
    languageCode,
  });
  const contextBlock = buildContextBlock(contextChunks);

  const chatMessages = [
    { role: "system", content: systemPrompt },
    {
      role: "system",
      content: `Use only this context to answer:\n\n${contextBlock}`,
    },
    ...(attachmentContext
      ? [
          {
            role: "system",
            content: `Attachment context provided by user:\n${attachmentContext}`,
          },
        ]
      : []),
    ...trimConversation(conversation),
    { role: "user", content: input },
  ];

  const response = await callGroqChat(chatMessages, config);

  return {
    answer: sanitizeLocalhostMentions(response.answer),
    citations,
    retrieval: {
      namespace: resolvedNamespace,
      namespacesQueried:
        resolvedNamespace === commonNamespace
          ? [resolvedNamespace]
          : [resolvedNamespace, commonNamespace],
      topK: config.topK,
      returned: contextChunks.length,
      scoreThreshold: config.scoreThreshold,
      scoreThresholdUsed,
    },
    fallbackTriggered: false,
    modelInfo: {
      chat: config.groqChatModel,
      embedding: config.embeddingProvider === "huggingface" ? config.hfEmbeddingModel : config.groqEmbeddingModel,
    },
    usage: response.usage,
  };
}

function getHealth() {
  const config = getConfig();
  const missing = getMissingConfig(config);

  const embeddingProviderLabel =
    config.embeddingProvider === "huggingface"
      ? "huggingface"
      : config.embeddingProvider === "groq"
        ? "groq"
        : config.embeddingProvider === "local"
          ? "local-hash"
          : config.hfToken
            ? "huggingface-then-groq-then-local"
            : "groq-with-local-fallback";

  const embeddingModelLabel =
    config.embeddingProvider === "huggingface"
      ? config.hfEmbeddingModel
      : config.embeddingProvider === "local"
        ? `local-hash-${parsePositiveInt(process.env.RAG_LOCAL_EMBED_DIM, 1024)}`
        : config.embeddingProvider === "groq"
          ? config.groqEmbeddingModel
          : config.hfToken
            ? config.hfEmbeddingModel
            : config.groqEmbeddingModel;

  return {
    configured: missing.length === 0,
    missing,
    provider: {
      generation: "groq",
      embeddings: embeddingProviderLabel,
      reranking:
        config.hfRerankEnabled && config.hfToken
          ? `huggingface-sentence-similarity:${config.hfEmbeddingModel}`
          : "disabled",
      vectorDb: "pinecone",
    },
    models: {
      chat: config.groqChatModel,
      embedding: embeddingModelLabel,
    },
    pinecone: {
      indexName: config.pineconeIndexName,
      namespacePrefix: config.namespacePrefix,
      topK: config.topK,
      scoreThreshold: config.scoreThreshold,
    },
    performance: {
      fastMode: config.ragFastMode,
      maxContextChunks: config.maxContextChunks,
      contextCharsPerChunk: config.contextCharsPerChunk,
      hfRerankEnabled: config.hfRerankEnabled,
      hfRerankTopN: config.hfRerankTopN,
      hfRerankTimeoutMs: config.hfRerankTimeoutMs,
      pineconeQueryTimeoutMs: config.timeouts?.pineconeQueryMs,
      groqChatTimeoutMs: config.timeouts?.groqChatMs,
    },
  };
}

module.exports = {
  askRag,
  getHealth,
};
