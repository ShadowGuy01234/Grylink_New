const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const DEFAULT_GROQ_BASE_URL = "https://api.groq.com/openai/v1";

const { createEmbeddings } = require("./chatbotEmbeddingUtils");

const REPO_ROOT = path.resolve(__dirname, "..", "..");
const CHATBOT_DATA_DIR = path.join(REPO_ROOT, "chatbot-data");
const MANIFEST_FILE_PATH = path.join(CHATBOT_DATA_DIR, "ingestion-manifest.json");
const DEFAULT_HF_BASE_URL = "https://router.huggingface.co";
const DEFAULT_HF_EMBEDDING_MODEL = "BAAI/bge-m3";
const MAX_METADATA_STRING_LENGTH = 3000;

const DEFAULT_CHATBOT_DATA_SOURCES = [
  {
    filePath: path.join(CHATBOT_DATA_DIR, "unified_rag_corpus.json"),
    sourceType: "unified_corpus",
    title: "Unified RAG Corpus",
    optional: true,
  },
  {
    filePath: path.join(CHATBOT_DATA_DIR, "enhanced_knowledge_base.txt"),
    sourceType: "policy",
    title: "Enhanced Knowledge Base",
  },
  {
    filePath: path.join(CHATBOT_DATA_DIR, "cwc_knowledge_base.json"),
    sourceType: "faq",
    title: "CWC Knowledge Base",
  },
  {
    filePath: path.join(CHATBOT_DATA_DIR, "gemini_embeddings.json"),
    sourceType: "faq",
    title: "Gemini Knowledge Chunks",
    isEmbeddingFile: true,
  },
  {
    // Backward-compatible alias for alternate filename spelling.
    filePath: path.join(CHATBOT_DATA_DIR, "gemini_embeddindings.json"),
    sourceType: "faq",
    title: "Gemini Knowledge Chunks",
    optional: true,
    isEmbeddingFile: true,
  },
  {
    filePath: path.join(CHATBOT_DATA_DIR, "embeddings.json"),
    sourceType: "faq",
    title: "Legacy Knowledge Chunks",
    isEmbeddingFile: true,
  },
];

const DEFAULT_REPO_DOC_SOURCES = [
  {
    filePath: path.join(REPO_ROOT, "GRYORK_TECHNICAL_DOCUMENTATION.md"),
    sourceType: "doc",
    title: "Technical Documentation",
  },
  {
    filePath: path.join(REPO_ROOT, "ROLE_ACCESS_DOCUMENTATION.md"),
    sourceType: "doc",
    title: "Role Access Documentation",
  },
  {
    filePath: path.join(REPO_ROOT, "WORKFLOW_AUDIT_REPORT.md"),
    sourceType: "workflow",
    title: "Workflow Audit Report",
  },
  {
    filePath: path.join(REPO_ROOT, "API_TESTING_GUIDE.md"),
    sourceType: "api_reference",
    title: "API Testing Guide",
  },
  {
    filePath: path.join(REPO_ROOT, "QUICKSTART.md"),
    sourceType: "doc",
    title: "Quickstart Guide",
  },
  {
    filePath: path.join(REPO_ROOT, "DEPLOYMENT_GUIDE.md"),
    sourceType: "doc",
    title: "Deployment Guide",
  },
  {
    filePath: path.join(REPO_ROOT, "doc", "GryorkSOP.md"),
    sourceType: "policy",
    title: "Gryork SOP",
  },
  {
    filePath: path.join(REPO_ROOT, "doc", "GRYORK_PLATFORM_WORKFLOW.md"),
    sourceType: "workflow",
    title: "Platform Workflow",
  },
];

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value || ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseOptionalPositiveInt(value) {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function parseOptionalNonNegativeInt(value) {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
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

function normalizeText(value) {
  return String(value || "")
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function normalizeForHash(value) {
  return normalizeText(value).replace(/\s+/g, " ").toLowerCase();
}

function toRelativePath(filePath) {
  return path.relative(REPO_ROOT, filePath).split(path.sep).join("/");
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function getConfig(overrides = {}) {
  const namespacePrefix = process.env.PINECONE_NAMESPACE_PREFIX || "gryork";
  const embeddingProvider = normalizeEmbeddingProvider(
    overrides.embeddingProvider || process.env.RAG_EMBEDDING_PROVIDER || "auto",
  );

  return {
    groqApiKey: process.env.GROQ_API_KEY,
    groqBaseUrl: process.env.GROQ_BASE_URL || DEFAULT_GROQ_BASE_URL,
    groqEmbeddingModel: process.env.GROQ_EMBEDDING_MODEL || "llama-text-embed-v2",
    hfToken:
      process.env.HF_TOKEN ||
      process.env.HUGGINGFACEHUB_API_TOKEN ||
      process.env.HUGGING_FACE_HUB_TOKEN,
    hfBaseUrl: process.env.HF_BASE_URL || DEFAULT_HF_BASE_URL,
    hfEmbeddingModel: process.env.HF_EMBEDDING_MODEL || DEFAULT_HF_EMBEDDING_MODEL,
    pineconeApiKey: process.env.PINECONE_API_KEY,
    pineconeIndexHost: process.env.PINECONE_INDEX_HOST,
    embeddingProvider,
    namespace:
      overrides.namespace || process.env.RAG_INGEST_NAMESPACE || `${namespacePrefix}-common`,
    namespacePrefix,
    embeddingBatchSize: parsePositiveInt(
      overrides.embeddingBatchSize || process.env.RAG_INGEST_EMBED_BATCH_SIZE,
      8,
    ),
    chunkSizeChars: parsePositiveInt(
      overrides.chunkSizeChars || process.env.RAG_INGEST_CHUNK_SIZE,
      900,
    ),
    chunkOverlapChars: parsePositiveInt(
      overrides.chunkOverlapChars || process.env.RAG_INGEST_CHUNK_OVERLAP,
      120,
    ),
    maxChunks:
      parseOptionalPositiveInt(overrides.maxChunks) ||
      parseOptionalPositiveInt(process.env.RAG_INGEST_MAX_CHUNKS),
  };
}

function validateConfig(config) {
  const required = [
    ["PINECONE_API_KEY", config.pineconeApiKey],
    ["PINECONE_INDEX_HOST", config.pineconeIndexHost],
  ];

  if (config.embeddingProvider === "groq") {
    required.push(["GROQ_API_KEY", config.groqApiKey]);
  }

  if (config.embeddingProvider === "huggingface") {
    required.push(["HF_TOKEN", config.hfToken]);
  }

  const missing = required
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length) {
    const err = new Error(`Missing required environment variables: ${missing.join(", ")}`);
    err.statusCode = 500;
    throw err;
  }
}

function splitOversizedText(text, maxChars, overlapChars) {
  const chunks = [];
  let start = 0;

  while (start < text.length) {
    let end = Math.min(start + maxChars, text.length);

    if (end < text.length) {
      const boundaryIndex = text.lastIndexOf(" ", end);
      if (boundaryIndex > start + Math.floor(maxChars * 0.6)) {
        end = boundaryIndex;
      }
    }

    const chunk = text.slice(start, end).trim();
    if (chunk) {
      chunks.push(chunk);
    }

    if (end >= text.length) {
      break;
    }

    start = Math.max(end - overlapChars, start + 1);
  }

  return chunks;
}

function splitTextIntoChunks(text, maxChars, overlapChars) {
  const normalized = normalizeText(text);
  if (!normalized) return [];

  const paragraphs = normalized.split(/\n{2,}/).map((part) => part.trim()).filter(Boolean);
  const chunks = [];
  let current = "";

  for (const paragraph of paragraphs) {
    if (paragraph.length > maxChars) {
      if (current) {
        chunks.push(current);
        current = "";
      }

      chunks.push(...splitOversizedText(paragraph, maxChars, overlapChars));
      continue;
    }

    if (!current) {
      current = paragraph;
      continue;
    }

    if (current.length + 2 + paragraph.length <= maxChars) {
      current += `\n\n${paragraph}`;
      continue;
    }

    chunks.push(current);
    current = paragraph;
  }

  if (current) {
    chunks.push(current);
  }

  return chunks;
}

function pushTextRecord(records, payload) {
  const text = normalizeText(payload.text);
  if (!text) return;

  records.push({
    sourcePath: payload.sourcePath,
    sourceType: payload.sourceType,
    title: payload.title || "Knowledge",
    section: payload.section || null,
    portal: payload.portal || "common",
    audience: payload.audience || "all",
    text,
    preChunked: Boolean(payload.preChunked),
    originalChunkIndex: Number.isFinite(payload.originalChunkIndex)
      ? Number(payload.originalChunkIndex)
      : null,
    originalChunkCount: Number.isFinite(payload.originalChunkCount)
      ? Number(payload.originalChunkCount)
      : null,
    originalChunkLength: Number.isFinite(payload.originalChunkLength)
      ? Number(payload.originalChunkLength)
      : text.length,
  });
}

function loadJsonTextRecords(filePath, sourceType, title) {
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = JSON.parse(raw);
  const records = [];
  const relativePath = toRelativePath(filePath);

  if (Array.isArray(parsed?.ragRecords)) {
    for (let index = 0; index < parsed.ragRecords.length; index += 1) {
      const item = parsed.ragRecords[index];
      if (!item || typeof item !== "object") continue;

      const itemMeta = item.metadata || {};
      pushTextRecord(records, {
        sourcePath: itemMeta.sourcePath || item.sourcePath || relativePath,
        sourceType: itemMeta.sourceType || item.sourceType || sourceType,
        title: itemMeta.title || item.title || title,
        section: itemMeta.section || item.section || `Record ${index + 1}`,
        portal: itemMeta.portal || item.portal || "common",
        audience: itemMeta.audience || item.audience || "all",
        text: item.text || item.chunk || item.content,
        preChunked: true,
        originalChunkIndex: Number(itemMeta.chunkIndex || item.chunkIndex || 0),
        originalChunkCount: Number(itemMeta.chunkCount || item.chunkCount || 0),
        originalChunkLength: Number(itemMeta.chunkLength || item.chunkLength || 0),
      });
    }

    return records;
  }

  if (Array.isArray(parsed)) {
    for (let index = 0; index < parsed.length; index += 1) {
      const item = parsed[index];
      if (!item || typeof item !== "object") continue;

      pushTextRecord(records, {
        sourcePath: relativePath,
        sourceType,
        title,
        section: item.source || `Entry ${index + 1}`,
        text: item.text,
      });
    }

    return records;
  }

  if (Array.isArray(parsed?.chunks)) {
    for (let index = 0; index < parsed.chunks.length; index += 1) {
      const chunk = parsed.chunks[index];
      if (!chunk || typeof chunk !== "object") continue;

      pushTextRecord(records, {
        sourcePath: relativePath,
        sourceType,
        title,
        section: chunk.source || `Chunk ${index + 1}`,
        text: chunk.text,
      });
    }

    return records;
  }

  if (typeof parsed?.text === "string") {
    pushTextRecord(records, {
      sourcePath: relativePath,
      sourceType,
      title,
      section: "Main",
      text: parsed.text,
    });
  }

  return records;
}

function loadTextFileRecords(filePath, sourceType, title) {
  const relativePath = toRelativePath(filePath);
  const raw = fs.readFileSync(filePath, "utf8");

  return [
    {
      sourcePath: relativePath,
      sourceType,
      title,
      section: "Main",
      portal: "common",
      audience: "all",
      text: normalizeText(raw),
    },
  ];
}

function collectRawRecords(options) {
  const sources = [...DEFAULT_CHATBOT_DATA_SOURCES];
  if (options.includeDocs) {
    sources.push(...DEFAULT_REPO_DOC_SOURCES);
  }

  const records = [];
  const missingSources = [];
  let skippedEmbeddingFiles = 0;

  for (const source of sources) {
    if (source.isEmbeddingFile && !options.includeEmbeddingFiles) {
      skippedEmbeddingFiles += 1;
      continue;
    }

    if (!fs.existsSync(source.filePath)) {
      if (!source.optional) {
        missingSources.push(toRelativePath(source.filePath));
      }
      continue;
    }

    const ext = path.extname(source.filePath).toLowerCase();
    let sourceRecords = [];

    if (ext === ".json") {
      sourceRecords = loadJsonTextRecords(source.filePath, source.sourceType, source.title);
    } else {
      sourceRecords = loadTextFileRecords(source.filePath, source.sourceType, source.title);
    }

    records.push(...sourceRecords);
  }

  return { records, missingSources, skippedEmbeddingFiles };
}

function loadManifest() {
  if (!fs.existsSync(MANIFEST_FILE_PATH)) {
    return {
      version: 1,
      updatedAt: null,
      namespace: null,
      embeddingModel: null,
      items: [],
    };
  }

  try {
    const raw = fs.readFileSync(MANIFEST_FILE_PATH, "utf8");
    const parsed = JSON.parse(raw);

    return {
      version: Number(parsed.version) || 1,
      updatedAt: parsed.updatedAt || null,
      namespace: parsed.namespace || null,
      embeddingModel: parsed.embeddingModel || null,
      items: Array.isArray(parsed.items) ? parsed.items : [],
    };
  } catch (error) {
    return {
      version: 1,
      updatedAt: null,
      namespace: null,
      embeddingModel: null,
      items: [],
      loadError: error.message,
    };
  }
}

function saveManifest(manifest) {
  const payload = {
    version: 1,
    updatedAt: new Date().toISOString(),
    namespace: manifest.namespace,
    embeddingModel: manifest.embeddingModel,
    items: manifest.items,
  };

  fs.writeFileSync(MANIFEST_FILE_PATH, JSON.stringify(payload, null, 2));
}

async function requestEmbeddings(input, config) {
  return createEmbeddings(input, {
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
}

async function embedTexts(texts, config) {
  if (!Array.isArray(texts) || !texts.length) return [];

  const result = await requestEmbeddings(texts, config);
  return {
    vectors: result.embeddings,
    provider: result.provider,
    model: result.model,
    dimension: result.dimension,
    usedFallback: result.usedFallback,
  };
}

function getPineconeHost(indexHost) {
  return String(indexHost || "")
    .replace(/^https?:\/\//i, "")
    .replace(/\/+$/g, "");
}

function sanitizeMetadataValue(value) {
  if (value === undefined || value === null) return undefined;

  if (typeof value === "string") {
    return value.slice(0, MAX_METADATA_STRING_LENGTH);
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (Array.isArray(value)) {
    const normalized = value
      .map((item) => {
        if (item === undefined || item === null) return null;
        if (typeof item === "string") return item;
        if (typeof item === "number" && Number.isFinite(item)) return String(item);
        if (typeof item === "boolean") return String(item);
        return String(item);
      })
      .filter(Boolean)
      .slice(0, 50);

    return normalized.length ? normalized : undefined;
  }

  try {
    return JSON.stringify(value).slice(0, MAX_METADATA_STRING_LENGTH);
  } catch {
    return String(value).slice(0, MAX_METADATA_STRING_LENGTH);
  }
}

function sanitizeMetadataObject(metadata) {
  if (!metadata || typeof metadata !== "object") return {};

  const output = {};
  for (const [key, value] of Object.entries(metadata)) {
    const sanitized = sanitizeMetadataValue(value);
    if (sanitized !== undefined) {
      output[key] = sanitized;
    }
  }

  return output;
}

async function deleteNamespaceVectors(namespace, config) {
  const host = getPineconeHost(config.pineconeIndexHost);
  const response = await fetch(`https://${host}/vectors/delete`, {
    method: "POST",
    headers: {
      "Api-Key": config.pineconeApiKey,
      "Content-Type": "application/json",
      "X-Pinecone-API-Version": "2024-07",
    },
    body: JSON.stringify({
      namespace,
      deleteAll: true,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    const err = new Error(`Pinecone namespace delete failed: ${errorText}`);
    err.statusCode = 502;
    throw err;
  }

  return true;
}

async function upsertVectors(vectors, namespace, config) {
  if (!vectors.length) return;

  const host = getPineconeHost(config.pineconeIndexHost);
  const response = await fetch(`https://${host}/vectors/upsert`, {
    method: "POST",
    headers: {
      "Api-Key": config.pineconeApiKey,
      "Content-Type": "application/json",
      "X-Pinecone-API-Version": "2024-07",
    },
    body: JSON.stringify({
      namespace,
      vectors,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    const err = new Error(`Pinecone upsert failed: ${errorText}`);
    err.statusCode = 502;
    throw err;
  }
}

function buildChunkCandidates(rawRecords, config) {
  const candidates = [];

  for (const rawRecord of rawRecords) {
    const chunks = splitTextIntoChunks(
      rawRecord.text,
      config.chunkSizeChars,
      config.chunkOverlapChars,
    );

    for (let index = 0; index < chunks.length; index += 1) {
      const text = chunks[index];
      const normalizedHashValue = normalizeForHash(text);
      if (!normalizedHashValue) continue;

      const hash = sha256(normalizedHashValue);
      candidates.push({
        id: `kb_${hash}`,
        hash,
        text,
        metadata: {
          sourcePath: rawRecord.sourcePath,
          sourceType: rawRecord.sourceType,
          portal: rawRecord.portal,
          audience: rawRecord.audience,
          title: rawRecord.title,
          section:
            chunks.length > 1
              ? `${rawRecord.section || "Main"} (${index + 1}/${chunks.length})`
              : rawRecord.section || "Main",
          preChunkedSource: Boolean(rawRecord.preChunked),
          ...(Number.isFinite(rawRecord.originalChunkIndex)
            ? { originalChunkIndex: Number(rawRecord.originalChunkIndex) }
            : {}),
          ...(Number.isFinite(rawRecord.originalChunkCount)
            ? { originalChunkCount: Number(rawRecord.originalChunkCount) }
            : {}),
          ...(Number.isFinite(rawRecord.originalChunkLength)
            ? { originalChunkLength: Number(rawRecord.originalChunkLength) }
            : {}),
          contentHash: hash,
          chunkLength: text.length,
          text,
          ingestedAt: new Date().toISOString(),
        },
      });
    }
  }

  return candidates;
}

function toBoolean(value, fallback) {
  if (value === undefined || value === null) return fallback;
  if (typeof value === "boolean") return value;
  const normalized = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "y", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "n", "off"].includes(normalized)) return false;
  return fallback;
}

function getConfiguredEmbeddingModel(config) {
  if (config.embeddingProvider === "huggingface") {
    return config.hfEmbeddingModel;
  }

  if (config.embeddingProvider === "groq") {
    return config.groqEmbeddingModel;
  }

  if (config.embeddingProvider === "local") {
    return `local-hash-${parsePositiveInt(process.env.RAG_LOCAL_EMBED_DIM, 1024)}`;
  }

  if (config.hfToken) {
    return config.hfEmbeddingModel;
  }

  if (config.groqApiKey) {
    return config.groqEmbeddingModel;
  }

  return `local-hash-${parsePositiveInt(process.env.RAG_LOCAL_EMBED_DIM, 1024)}`;
}

async function ingestKnowledgeBase(inputOptions = {}) {
  const logger =
    typeof inputOptions.logger === "function"
      ? inputOptions.logger
      : () => {};

  function log(message, data = undefined) {
    logger({
      timestamp: new Date().toISOString(),
      message,
      ...(data && typeof data === "object" ? { data } : {}),
    });
  }

  const startedAt = Date.now();

  const options = {
    includeDocs: toBoolean(inputOptions.includeDocs, true),
    includeEmbeddingFiles: toBoolean(inputOptions.includeEmbeddingFiles, false),
    dryRun: toBoolean(inputOptions.dryRun, false),
    force: toBoolean(inputOptions.force, false),
    purgeNamespace: toBoolean(inputOptions.purgeNamespace, false),
    resetManifest: toBoolean(inputOptions.resetManifest, false),
    embeddingProvider: inputOptions.embeddingProvider || null,
    maxChunks: parseOptionalPositiveInt(inputOptions.maxChunks),
    namespace: inputOptions.namespace || null,
    embeddingBatchSize: parseOptionalPositiveInt(inputOptions.embeddingBatchSize),
    chunkSizeChars: parseOptionalPositiveInt(inputOptions.chunkSizeChars),
    chunkOverlapChars: parseOptionalPositiveInt(inputOptions.chunkOverlapChars),
    logEveryBatches: parseOptionalNonNegativeInt(inputOptions.logEveryBatches) || 1,
  };

  if (options.purgeNamespace || options.resetManifest) {
    options.force = true;
  }

  const config = getConfig(options);
  log("Resolved ingestion config", {
    namespace: config.namespace,
    embeddingProvider: config.embeddingProvider,
    embeddingBatchSize: config.embeddingBatchSize,
    chunkSizeChars: config.chunkSizeChars,
    chunkOverlapChars: config.chunkOverlapChars,
    includeDocs: options.includeDocs,
    includeEmbeddingFiles: options.includeEmbeddingFiles,
    dryRun: options.dryRun,
    force: options.force,
    purgeNamespace: options.purgeNamespace,
    resetManifest: options.resetManifest,
    embeddingProvider: options.embeddingProvider || "auto",
  });

  log("Validating required environment variables");
  validateConfig(config);
  log("Environment validation passed");

  if (options.purgeNamespace && !options.dryRun) {
    log("Purging existing vectors in namespace", { namespace: config.namespace });
    await deleteNamespaceVectors(config.namespace, config);
    log("Namespace purge completed", { namespace: config.namespace });
  }

  if (options.resetManifest && !options.dryRun) {
    log("Resetting local ingestion manifest");
    saveManifest({
      namespace: config.namespace,
      embeddingModel: getConfiguredEmbeddingModel(config),
      items: [],
    });
    log("Manifest reset completed", { manifestPath: toRelativePath(MANIFEST_FILE_PATH) });
  }

  log("Collecting source records");
  const { records: rawRecords, missingSources, skippedEmbeddingFiles } = collectRawRecords(options);
  log("Source collection completed", {
    records: rawRecords.length,
    missingSources: missingSources.length,
    skippedEmbeddingFiles,
  });

  log("Chunking records into candidate chunks");
  const chunkCandidates = buildChunkCandidates(rawRecords, config);
  log("Chunking completed", { chunkCandidates: chunkCandidates.length });

  const manifest = loadManifest();
  const manifestItems = options.resetManifest ? [] : Array.isArray(manifest.items) ? manifest.items : [];
  const existingHashes = new Set(manifestItems.map((item) => item.hash));
  const seenInRun = new Set();

  let skippedDuplicatesInRun = 0;
  let skippedAlreadyIndexed = 0;

  const pending = [];
  for (const candidate of chunkCandidates) {
    if (seenInRun.has(candidate.hash)) {
      skippedDuplicatesInRun += 1;
      continue;
    }

    seenInRun.add(candidate.hash);

    if (!options.force && existingHashes.has(candidate.hash)) {
      skippedAlreadyIndexed += 1;
      continue;
    }

    pending.push(candidate);
  }

  let limitedByMax = 0;
  let selected = pending;
  const maxChunks = options.maxChunks || config.maxChunks;

  if (Number.isFinite(maxChunks) && maxChunks > 0 && pending.length > maxChunks) {
    selected = pending.slice(0, maxChunks);
    limitedByMax = pending.length - selected.length;
  }

  log("Candidate filtering completed", {
    uniqueChunkHashes: seenInRun.size,
    skippedDuplicatesInRun,
    skippedAlreadyIndexed,
    limitedByMax,
    queuedForEmbedding: selected.length,
  });

  const summary = {
    namespace: config.namespace,
    embeddingProvider: config.embeddingProvider,
    embeddingModel: manifest.embeddingModel || getConfiguredEmbeddingModel(config),
    embeddingDimension:
      config.embeddingProvider === "local"
        ? parsePositiveInt(process.env.RAG_LOCAL_EMBED_DIM, 1024)
        : null,
    includeDocs: options.includeDocs,
    includeEmbeddingFiles: options.includeEmbeddingFiles,
    dryRun: options.dryRun,
    force: options.force,
    purgeNamespace: options.purgeNamespace,
    resetManifest: options.resetManifest,
    sourcesRead: rawRecords.length,
    skippedEmbeddingFiles,
    chunkCandidates: chunkCandidates.length,
    uniqueChunkHashes: seenInRun.size,
    skippedDuplicatesInRun,
    skippedAlreadyIndexed,
    limitedByMax,
    queuedForEmbedding: selected.length,
    upserted: 0,
    missingSources,
    durationMs: Date.now() - startedAt,
  };

  if (options.dryRun || !selected.length) {
    log("Ingestion finished without embedding stage", {
      dryRun: options.dryRun,
      queuedForEmbedding: selected.length,
      durationMs: Date.now() - startedAt,
    });
    summary.durationMs = Date.now() - startedAt;
    return summary;
  }

  const embeddedItems = [];
  const batchSize = config.embeddingBatchSize;
  const totalBatches = Math.ceil(selected.length / batchSize);

  log("Starting embedding + upsert batches", {
    totalBatches,
    batchSize,
    queuedForEmbedding: selected.length,
  });

  for (let start = 0; start < selected.length; start += batchSize) {
    const batch = selected.slice(start, start + batchSize);
    const batchNumber = Math.floor(start / batchSize) + 1;
    const batchStartedAt = Date.now();

    if (batchNumber === 1 || batchNumber % options.logEveryBatches === 0 || batchNumber === totalBatches) {
      log("Embedding batch started", {
        batchNumber,
        totalBatches,
        chunkCount: batch.length,
        processed: start,
        remaining: selected.length - start,
      });
    }

    const embeddingResult = await embedTexts(
      batch.map((item) => item.text),
      config,
    );

    const vectors = embeddingResult.vectors;
    if (!Array.isArray(vectors) || vectors.length !== batch.length) {
      const err = new Error("Embedding result did not align with queued chunk count");
      err.statusCode = 502;
      throw err;
    }

    summary.embeddingProvider = embeddingResult.provider || summary.embeddingProvider;
    summary.embeddingModel = embeddingResult.model || summary.embeddingModel;
    summary.embeddingDimension = embeddingResult.dimension || summary.embeddingDimension;

    const pineconeVectors = batch.map((item, index) => ({
      id: item.id,
      values: vectors[index],
      metadata: sanitizeMetadataObject(item.metadata),
    }));

    await upsertVectors(pineconeVectors, config.namespace, config);

    summary.upserted += pineconeVectors.length;

    if (batchNumber === 1 || batchNumber % options.logEveryBatches === 0 || batchNumber === totalBatches) {
      const processed = Math.min(start + batch.length, selected.length);
      const elapsedMs = Date.now() - startedAt;
      const itemsPerSecond = elapsedMs > 0 ? Number((processed / (elapsedMs / 1000)).toFixed(2)) : 0;
      const remaining = selected.length - processed;
      const etaSeconds = itemsPerSecond > 0 ? Math.ceil(remaining / itemsPerSecond) : null;

      log("Embedding batch completed", {
        batchNumber,
        totalBatches,
        batchDurationMs: Date.now() - batchStartedAt,
        processed,
        total: selected.length,
        upserted: summary.upserted,
        itemsPerSecond,
        etaSeconds,
        embeddingProvider: summary.embeddingProvider,
        embeddingModel: summary.embeddingModel,
      });
    }

    for (const item of batch) {
      embeddedItems.push({
        hash: item.hash,
        id: item.id,
        sourcePath: item.metadata.sourcePath,
        sourceType: item.metadata.sourceType,
        title: item.metadata.title,
        section: item.metadata.section,
        chunkLength: item.metadata.chunkLength,
        indexedAt: new Date().toISOString(),
      });
    }
  }

  const mergedMap = new Map();
  for (const item of manifestItems) {
    mergedMap.set(item.hash, item);
  }
  for (const item of embeddedItems) {
    mergedMap.set(item.hash, item);
  }

  saveManifest({
    namespace: config.namespace,
    embeddingModel: summary.embeddingModel,
    items: Array.from(mergedMap.values()),
  });

  summary.durationMs = Date.now() - startedAt;
  log("Ingestion completed successfully", {
    upserted: summary.upserted,
    totalIndexedChunks: Array.from(mergedMap.values()).length,
    durationMs: summary.durationMs,
  });

  return summary;
}

function getIngestionStatus() {
  const manifest = loadManifest();

  return {
    manifestPath: toRelativePath(MANIFEST_FILE_PATH),
    configured: !manifest.loadError,
    loadError: manifest.loadError || null,
    updatedAt: manifest.updatedAt,
    namespace: manifest.namespace,
    embeddingModel: manifest.embeddingModel,
    totalIndexedChunks: Array.isArray(manifest.items) ? manifest.items.length : 0,
  };
}

function getIndexedSourceCoverageSummary() {
  const manifest = loadManifest();
  const items = Array.isArray(manifest.items) ? manifest.items : [];

  const bySourcePath = new Map();
  const bySourceType = new Map();

  for (const item of items) {
    const sourcePath = item.sourcePath || "unknown";
    const sourceType = item.sourceType || "unknown";
    const title = item.title || "Knowledge";
    const chunkLength = Number(item.chunkLength || 0);
    const indexedAt = item.indexedAt || null;

    const currentSource = bySourcePath.get(sourcePath) || {
      sourcePath,
      sourceType,
      title,
      chunks: 0,
      totalChunkLength: 0,
      latestIndexedAt: null,
    };

    currentSource.chunks += 1;
    currentSource.totalChunkLength += Number.isFinite(chunkLength) ? chunkLength : 0;
    if (indexedAt && (!currentSource.latestIndexedAt || indexedAt > currentSource.latestIndexedAt)) {
      currentSource.latestIndexedAt = indexedAt;
    }

    bySourcePath.set(sourcePath, currentSource);
    bySourceType.set(sourceType, (bySourceType.get(sourceType) || 0) + 1);
  }

  const sources = Array.from(bySourcePath.values()).sort((a, b) => b.chunks - a.chunks);
  const sourceTypes = Array.from(bySourceType.entries())
    .map(([sourceType, chunks]) => ({ sourceType, chunks }))
    .sort((a, b) => b.chunks - a.chunks);

  return {
    manifestPath: toRelativePath(MANIFEST_FILE_PATH),
    configured: !manifest.loadError,
    loadError: manifest.loadError || null,
    updatedAt: manifest.updatedAt,
    namespace: manifest.namespace,
    embeddingModel: manifest.embeddingModel,
    totalIndexedChunks: items.length,
    uniqueSourcePaths: sources.length,
    sourceTypes,
    sources,
  };
}

module.exports = {
  ingestKnowledgeBase,
  getIngestionStatus,
  getIndexedSourceCoverageSummary,
};
