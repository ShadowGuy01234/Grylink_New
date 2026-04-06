const crypto = require("crypto");

const DEFAULT_GROQ_BASE_URL = "https://api.groq.com/openai/v1";
const DEFAULT_HF_BASE_URL = "https://router.huggingface.co";
const DEFAULT_HF_EMBEDDING_MODEL = "BAAI/bge-m3";
const DEFAULT_LOCAL_DIMENSION = 1024;

let cachedPineconeDimension = null;
let cachedHfInferenceModule = null;

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value || ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
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
  return String(value || "").toLowerCase();
}

function shouldFallbackToLocal(error) {
  const message = String(error?.message || "").toLowerCase();
  return (
    message.includes("model_not_found") ||
    message.includes("does not exist or you do not have access") ||
    message.includes("embedding") ||
    message.includes("unauthorized") ||
    message.includes("forbidden") ||
    message.includes("rate limit")
  );
}

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function isNumericVector(value) {
  return Array.isArray(value) && value.length > 0 && value.every(isFiniteNumber);
}

function isNumericMatrix(value) {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((row) => Array.isArray(row) && row.length > 0 && row.every(isFiniteNumber))
  );
}

function vectorNormalize(values) {
  const norm = Math.sqrt(values.reduce((sum, value) => sum + value * value, 0));
  if (!norm) return values;
  return values.map((value) => value / norm);
}

function meanPoolMatrix(matrix) {
  if (!isNumericMatrix(matrix)) return null;

  const width = matrix[0].length;
  if (!width) return null;

  const accumulator = new Array(width).fill(0);
  let validRows = 0;

  for (const row of matrix) {
    if (!Array.isArray(row) || row.length !== width || !row.every(isFiniteNumber)) {
      continue;
    }

    for (let i = 0; i < width; i += 1) {
      accumulator[i] += row[i];
    }

    validRows += 1;
  }

  if (!validRows) return null;

  const pooled = accumulator.map((value) => value / validRows);
  return vectorNormalize(pooled);
}

function hashToIndex(token, dimension) {
  const hash = crypto.createHash("sha256").update(token).digest();
  const index = hash.readUInt32BE(0) % dimension;
  const sign = (hash[4] & 1) === 0 ? 1 : -1;
  return { index, sign };
}

function createLocalHashEmbedding(text, dimension) {
  const safeDimension = parsePositiveInt(dimension, DEFAULT_LOCAL_DIMENSION);
  const vector = new Array(safeDimension).fill(0);
  const tokens = normalizeText(text).match(/[a-z0-9]+/g) || [];

  if (!tokens.length) {
    return vector;
  }

  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    const unigram = hashToIndex(token, safeDimension);
    vector[unigram.index] += unigram.sign;

    if (i > 0) {
      const bigramToken = `${tokens[i - 1]}_${token}`;
      const bigram = hashToIndex(bigramToken, safeDimension);
      vector[bigram.index] += bigram.sign * 0.5;
    }
  }

  return vectorNormalize(vector);
}

function getPineconeHost(indexHost) {
  return String(indexHost || "")
    .replace(/^https?:\/\//i, "")
    .replace(/\/+$/g, "");
}

async function resolvePineconeDimension(config) {
  if (cachedPineconeDimension) {
    return cachedPineconeDimension;
  }

  const explicitDimension = parsePositiveInt(
    config.localEmbeddingDimension || process.env.RAG_LOCAL_EMBED_DIM,
    null,
  );
  if (explicitDimension) {
    cachedPineconeDimension = explicitDimension;
    return cachedPineconeDimension;
  }

  if (!config.pineconeApiKey || !config.pineconeIndexHost) {
    cachedPineconeDimension = DEFAULT_LOCAL_DIMENSION;
    return cachedPineconeDimension;
  }

  const host = getPineconeHost(config.pineconeIndexHost);
  const response = await fetch(`https://${host}/describe_index_stats`, {
    method: "POST",
    headers: {
      "Api-Key": config.pineconeApiKey,
      "Content-Type": "application/json",
      "X-Pinecone-API-Version": "2024-07",
    },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    cachedPineconeDimension = DEFAULT_LOCAL_DIMENSION;
    return cachedPineconeDimension;
  }

  const data = await response.json();
  cachedPineconeDimension = parsePositiveInt(data?.dimension, DEFAULT_LOCAL_DIMENSION);
  return cachedPineconeDimension;
}

async function requestGroqEmbeddings(input, config) {
  const response = await fetch(`${config.groqBaseUrl || DEFAULT_GROQ_BASE_URL}/embeddings`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.groqApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.groqEmbeddingModel,
      input,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    const err = new Error(`Groq embedding request failed: ${errorText}`);
    err.statusCode = 502;
    throw err;
  }

  const data = await response.json();
  const embeddings = Array.isArray(data?.data)
    ? data.data.map((item) => item?.embedding).filter((value) => Array.isArray(value))
    : [];

  if (!embeddings.length) {
    const err = new Error("Groq embedding response did not include vectors");
    err.statusCode = 502;
    throw err;
  }

  return embeddings;
}

function toHfModelPath(model) {
  return String(model || "")
    .split("/")
    .map((segment) => encodeURIComponent(segment.trim()))
    .join("/");
}

async function getHfInferenceClient(hfToken) {
  if (!cachedHfInferenceModule) {
    cachedHfInferenceModule = import("@huggingface/inference");
  }

  const { InferenceClient } = await cachedHfInferenceModule;
  return new InferenceClient(hfToken);
}

function normalizeHfEmbeddingResponse(payload, inputCount) {
  // Some providers return { data: [...] } while others return array payload directly.
  const value = payload?.data !== undefined ? payload.data : payload;

  if (isNumericVector(value)) {
    return [vectorNormalize(value)];
  }

  if (!Array.isArray(value) || value.length === 0) {
    return [];
  }

  if (inputCount === 1) {
    if (isNumericMatrix(value)) {
      const pooled = meanPoolMatrix(value);
      return pooled ? [pooled] : [];
    }

    if (Array.isArray(value[0])) {
      const maybeVector = isNumericVector(value[0]) ? vectorNormalize(value[0]) : meanPoolMatrix(value[0]);
      return maybeVector ? [maybeVector] : [];
    }
  }

  const embeddings = [];

  for (const item of value) {
    if (isNumericVector(item)) {
      embeddings.push(vectorNormalize(item));
      continue;
    }

    const pooled = meanPoolMatrix(item);
    if (pooled) {
      embeddings.push(pooled);
    }
  }

  return embeddings;
}

async function requestHuggingFaceEmbeddings(input, config) {
  const hfToken =
    config.hfToken ||
    process.env.HF_TOKEN ||
    process.env.HUGGINGFACEHUB_API_TOKEN ||
    process.env.HUGGING_FACE_HUB_TOKEN;
  if (!hfToken) {
    const err = new Error("HF_TOKEN is required for Hugging Face embeddings");
    err.statusCode = 500;
    throw err;
  }

  const model =
    config.hfEmbeddingModel || process.env.HF_EMBEDDING_MODEL || DEFAULT_HF_EMBEDDING_MODEL;
  const client = await getHfInferenceClient(hfToken);
  const data = await client.featureExtraction({
    provider: "hf-inference",
    model,
    inputs: input,
    normalize: true,
    truncate: true,
  });

  const inputCount = Array.isArray(input) ? input.length : 1;
  const embeddings = normalizeHfEmbeddingResponse(data, inputCount);

  if (!embeddings.length) {
    const err = new Error("Hugging Face embedding response did not include vectors");
    err.statusCode = 502;
    throw err;
  }

  if (embeddings.length !== inputCount) {
    const err = new Error(
      `Hugging Face embedding vector count mismatch: expected ${inputCount}, got ${embeddings.length}`,
    );
    err.statusCode = 502;
    throw err;
  }

  return {
    embeddings,
    model,
  };
}

async function ensureDimensionCompatibility(embeddings, config, provider) {
  if (!Array.isArray(embeddings) || !embeddings.length) {
    return null;
  }

  const firstDimension = Array.isArray(embeddings[0]) ? embeddings[0].length : 0;
  if (!firstDimension) {
    const err = new Error(`${provider} embedding response produced empty vectors`);
    err.statusCode = 502;
    throw err;
  }

  for (const vector of embeddings) {
    if (!Array.isArray(vector) || vector.length !== firstDimension) {
      const err = new Error(`${provider} embedding response returned inconsistent vector dimensions`);
      err.statusCode = 502;
      throw err;
    }
  }

  const expectedDimension = await resolvePineconeDimension(config);
  if (expectedDimension && firstDimension !== expectedDimension) {
    const err = new Error(
      `${provider} embedding dimension mismatch: got ${firstDimension}, expected ${expectedDimension} (Pinecone index dimension)`,
    );
    err.statusCode = 502;
    throw err;
  }

  return firstDimension;
}

async function createEmbeddings(input, config = {}) {
  const items = Array.isArray(input) ? input : [input];
  const embeddingProvider = normalizeEmbeddingProvider(
    config.embeddingProvider || process.env.RAG_EMBEDDING_PROVIDER || "auto",
  );

  if (!items.length) {
    return {
      embeddings: [],
      provider: embeddingProvider,
      model: null,
      dimension: null,
      usedFallback: false,
    };
  }

  const hasHfToken = Boolean(
    config.hfToken ||
      process.env.HF_TOKEN ||
      process.env.HUGGINGFACEHUB_API_TOKEN ||
      process.env.HUGGING_FACE_HUB_TOKEN,
  );
  const hasGroqKey = Boolean(config.groqApiKey);

  if (embeddingProvider === "huggingface") {
    const hfResult = await requestHuggingFaceEmbeddings(items.length === 1 ? items[0] : items, config);
    const dimension = await ensureDimensionCompatibility(
      hfResult.embeddings,
      config,
      "Hugging Face",
    );

    return {
      embeddings: hfResult.embeddings,
      provider: "huggingface",
      model: hfResult.model,
      dimension,
      usedFallback: false,
    };
  }

  if (embeddingProvider === "groq") {
    if (!hasGroqKey) {
      const err = new Error("GROQ_API_KEY is required for Groq embeddings");
      err.statusCode = 500;
      throw err;
    }

    try {
      const embeddings = await requestGroqEmbeddings(items, config);
      const dimension = await ensureDimensionCompatibility(embeddings, config, "Groq");

      return {
        embeddings,
        provider: "groq",
        model: config.groqEmbeddingModel,
        dimension,
        usedFallback: false,
      };
    } catch (error) {
      if (!shouldFallbackToLocal(error)) {
        throw error;
      }
    }
  }

  if (embeddingProvider === "auto" && hasHfToken) {
    try {
      const hfResult = await requestHuggingFaceEmbeddings(
        items.length === 1 ? items[0] : items,
        config,
      );
      const dimension = await ensureDimensionCompatibility(
        hfResult.embeddings,
        config,
        "Hugging Face",
      );

      return {
        embeddings: hfResult.embeddings,
        provider: "huggingface",
        model: hfResult.model,
        dimension,
        usedFallback: false,
      };
    } catch (error) {
      if (!shouldFallbackToLocal(error)) {
        throw error;
      }
    }
  }

  if (embeddingProvider === "auto" && hasGroqKey) {
    try {
      const embeddings = await requestGroqEmbeddings(items, config);
      if (embeddings.length === items.length) {
        const dimension = await ensureDimensionCompatibility(embeddings, config, "Groq");

        return {
          embeddings,
          provider: "groq",
          model: config.groqEmbeddingModel,
          dimension,
          usedFallback: false,
        };
      }
    } catch (error) {
      if (!shouldFallbackToLocal(error)) {
        throw error;
      }
    }
  }

  const dimension = await resolvePineconeDimension(config);
  const embeddings = items.map((text) => createLocalHashEmbedding(text, dimension));

  return {
    embeddings,
    provider: "local-hash",
    model: `local-hash-${dimension}`,
    dimension,
    usedFallback: embeddingProvider !== "local",
  };
}

module.exports = {
  createEmbeddings,
};
