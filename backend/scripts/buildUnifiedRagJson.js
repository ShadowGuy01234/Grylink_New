#!/usr/bin/env node

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const REPO_ROOT = path.resolve(__dirname, "..", "..");
const CHATBOT_DATA_DIR = path.join(REPO_ROOT, "chatbot-data");
const DEFAULT_OUTPUT_PATH = path.join(CHATBOT_DATA_DIR, "unified_rag_corpus.json");

const EXCLUDED_DIRS = new Set([
  ".git",
  ".next",
  ".turbo",
  "build",
  "coverage",
  "dist",
  "node_modules",
]);

const DOC_EXTENSIONS = new Set([".md", ".txt", ".tex", ".html"]);
const TEXT_FIELD_KEYS = ["text", "content", "answer", "question", "description", "summary"];

function toRelativePath(filePath) {
  return path.relative(REPO_ROOT, filePath).split(path.sep).join("/");
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
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

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value || ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseArgs(argv) {
  const options = {
    outputPath: DEFAULT_OUTPUT_PATH,
    includeRawChatbotData: true,
    chunkSizeChars: 1700,
    chunkOverlapChars: 180,
  };

  for (const arg of argv) {
    if (arg === "--no-raw") {
      options.includeRawChatbotData = false;
      continue;
    }

    if (arg.startsWith("--output=")) {
      const value = arg.slice("--output=".length).trim();
      if (value) {
        options.outputPath = path.isAbsolute(value) ? value : path.join(REPO_ROOT, value);
      }
      continue;
    }

    if (arg.startsWith("--chunk-size=")) {
      options.chunkSizeChars = parsePositiveInt(arg.slice("--chunk-size=".length), 1700);
      continue;
    }

    if (arg.startsWith("--chunk-overlap=")) {
      options.chunkOverlapChars = parsePositiveInt(arg.slice("--chunk-overlap=".length), 180);
    }
  }

  if (options.chunkOverlapChars >= options.chunkSizeChars) {
    options.chunkOverlapChars = Math.floor(options.chunkSizeChars / 4);
  }

  return options;
}

function walkFiles(rootDir, collected = []) {
  const entries = fs.readdirSync(rootDir, { withFileTypes: true });

  for (const entry of entries) {
    const absolutePath = path.join(rootDir, entry.name);

    if (entry.isDirectory()) {
      if (EXCLUDED_DIRS.has(entry.name)) {
        continue;
      }
      walkFiles(absolutePath, collected);
      continue;
    }

    if (entry.isFile()) {
      collected.push(absolutePath);
    }
  }

  return collected;
}

function decodeHtmlEntities(text) {
  return String(text || "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

function stripHtml(html) {
  return normalizeText(
    decodeHtmlEntities(
      String(html || "")
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<[^>]+>/g, " "),
    ),
  );
}

function stripTex(tex) {
  return normalizeText(
    String(tex || "")
      .replace(/^\s*%.*$/gm, " ")
      .replace(/\\[a-zA-Z@]+\*?(\[[^\]]*\])?(\{[^{}]*\})?/g, " ")
      .replace(/[{}]/g, " "),
  );
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

function isImportantDocument(relativePath) {
  if (relativePath.startsWith("chatbot-data/")) return false;

  const ext = path.extname(relativePath).toLowerCase();
  if (!DOC_EXTENSIONS.has(ext)) return false;

  const fileName = path.basename(relativePath).toLowerCase();

  if (fileName === "robots.txt" || fileName === "build_output.txt") {
    return false;
  }

  if (ext === ".html") {
    return relativePath.startsWith("doc/");
  }

  return true;
}

function inferSourceType(relativePath) {
  const lower = relativePath.toLowerCase();

  if (lower.includes("workflow")) return "workflow";
  if (lower.includes("sop") || lower.includes("policy")) return "policy";
  if (lower.includes("api")) return "api_reference";
  if (lower.includes("audit")) return "workflow";
  if (lower.includes("guide") || lower.includes("quickstart") || lower.includes("readme")) {
    return "doc";
  }

  return "doc";
}

function titleFromPath(relativePath) {
  const baseName = path.basename(relativePath, path.extname(relativePath));
  return baseName.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
}

function readDocumentAsText(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const raw = fs.readFileSync(filePath, "utf8");

  if (ext === ".html") {
    return stripHtml(raw);
  }

  if (ext === ".tex") {
    return stripTex(raw);
  }

  return normalizeText(raw);
}

function isNumericArray(value) {
  return Array.isArray(value) && value.length > 0 && value.every((item) => Number.isFinite(item));
}

function shouldSkipEmbeddingKey(key, value) {
  const lower = String(key || "").toLowerCase();
  if (!lower.includes("embedding") && !lower.includes("vector") && lower !== "values") {
    return false;
  }

  if (isNumericArray(value)) return true;
  if (Array.isArray(value) && value.length && value.every((item) => isNumericArray(item))) return true;
  return false;
}

function extractTextFragments(value, sectionPath = [], fragments = []) {
  if (typeof value === "string") {
    const text = normalizeText(value);
    if (text.length >= 30) {
      fragments.push({
        section: sectionPath.length ? sectionPath.join(" > ") : "Main",
        text,
      });
    }
    return fragments;
  }

  if (Array.isArray(value)) {
    if (isNumericArray(value)) {
      return fragments;
    }

    for (let index = 0; index < value.length; index += 1) {
      extractTextFragments(value[index], [...sectionPath, String(index + 1)], fragments);
    }
    return fragments;
  }

  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      if (shouldSkipEmbeddingKey(key, child)) {
        continue;
      }
      extractTextFragments(child, [...sectionPath, key], fragments);
    }
  }

  return fragments;
}

function loadJsonTextRecords(parsed, relativePath) {
  const sourceType = inferSourceType(relativePath);
  const title = titleFromPath(relativePath);
  const records = [];

  if (Array.isArray(parsed)) {
    for (let index = 0; index < parsed.length; index += 1) {
      const item = parsed[index];
      if (!item || typeof item !== "object") continue;

      let text = "";
      for (const key of TEXT_FIELD_KEYS) {
        if (typeof item[key] === "string" && item[key].trim()) {
          text = item[key];
          break;
        }
      }

      if (!text) continue;

      records.push({
        sourcePath: relativePath,
        sourceType,
        title,
        section: item.source || `Entry ${index + 1}`,
        portal: "common",
        audience: "all",
        text: normalizeText(text),
      });
    }

    return records;
  }

  if (Array.isArray(parsed?.chunks)) {
    for (let index = 0; index < parsed.chunks.length; index += 1) {
      const item = parsed.chunks[index];
      if (!item || typeof item !== "object") continue;

      const text =
        typeof item.text === "string"
          ? item.text
          : typeof item.content === "string"
            ? item.content
            : "";

      if (!text) continue;

      records.push({
        sourcePath: relativePath,
        sourceType,
        title,
        section: item.source || `Chunk ${index + 1}`,
        portal: "common",
        audience: "all",
        text: normalizeText(text),
      });
    }

    return records;
  }

  if (typeof parsed?.text === "string") {
    records.push({
      sourcePath: relativePath,
      sourceType,
      title,
      section: "Main",
      portal: "common",
      audience: "all",
      text: normalizeText(parsed.text),
    });
    return records;
  }

  const fragments = extractTextFragments(parsed);
  for (const fragment of fragments) {
    records.push({
      sourcePath: relativePath,
      sourceType,
      title,
      section: fragment.section,
      portal: "common",
      audience: "all",
      text: fragment.text,
    });
  }

  return records;
}

function buildDocumentRecords(filePaths) {
  const records = [];

  for (const filePath of filePaths) {
    const relativePath = toRelativePath(filePath);
    const text = readDocumentAsText(filePath);

    if (!text) continue;

    records.push({
      sourcePath: relativePath,
      sourceType: inferSourceType(relativePath),
      title: titleFromPath(relativePath),
      section: "Main",
      portal: "common",
      audience: "all",
      text,
    });
  }

  return records;
}

function buildChatbotDataRecords(chatbotFilePaths) {
  const records = [];
  const rawFiles = [];

  for (const filePath of chatbotFilePaths) {
    const relativePath = toRelativePath(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const raw = fs.readFileSync(filePath, "utf8");

    if (ext === ".json") {
      const parsed = JSON.parse(raw);

      rawFiles.push({
        sourcePath: relativePath,
        format: "json",
        data: parsed,
      });

      records.push(...loadJsonTextRecords(parsed, relativePath));
      continue;
    }

    rawFiles.push({
      sourcePath: relativePath,
      format: "text",
      data: raw,
    });

    const text = normalizeText(raw);
    if (!text) continue;

    records.push({
      sourcePath: relativePath,
      sourceType: "policy",
      title: titleFromPath(relativePath),
      section: "Main",
      portal: "common",
      audience: "all",
      text,
    });
  }

  return { records, rawFiles };
}

function buildSourceManifest(filePaths, kind) {
  return filePaths.map((filePath) => {
    const stat = fs.statSync(filePath);
    const raw = fs.readFileSync(filePath);

    return {
      kind,
      sourcePath: toRelativePath(filePath),
      sizeBytes: stat.size,
      lastModified: stat.mtime.toISOString(),
      sha256: sha256(raw),
    };
  });
}

function dedupeChunkRecords(rawRecords, options) {
  const chunks = [];
  const seenChunkHashes = new Set();

  for (const rawRecord of rawRecords) {
    const textChunks = splitTextIntoChunks(
      rawRecord.text,
      options.chunkSizeChars,
      options.chunkOverlapChars,
    );

    for (let index = 0; index < textChunks.length; index += 1) {
      const text = textChunks[index];
      const normalizedHashValue = normalizeForHash(text);
      if (!normalizedHashValue) continue;

      const contentHash = sha256(normalizedHashValue);
      if (seenChunkHashes.has(contentHash)) continue;

      seenChunkHashes.add(contentHash);

      chunks.push({
        id: `kb_${contentHash}`,
        text,
        metadata: {
          sourcePath: rawRecord.sourcePath,
          sourceType: rawRecord.sourceType,
          title: rawRecord.title,
          section:
            textChunks.length > 1
              ? `${rawRecord.section || "Main"} (${index + 1}/${textChunks.length})`
              : rawRecord.section || "Main",
          portal: rawRecord.portal || "common",
          audience: rawRecord.audience || "all",
          contentHash,
          chunkIndex: index + 1,
          chunkCount: textChunks.length,
          chunkLength: text.length,
        },
      });
    }
  }

  return chunks;
}

function discoverImportantDocumentFiles() {
  const allFiles = walkFiles(REPO_ROOT);
  return allFiles.filter((filePath) => isImportantDocument(toRelativePath(filePath))).sort();
}

function discoverChatbotDataFiles() {
  const allFiles = walkFiles(CHATBOT_DATA_DIR);
  return allFiles.sort();
}

function main() {
  const options = parseArgs(process.argv.slice(2));

  const importantDocFiles = discoverImportantDocumentFiles();
  const chatbotDataFiles = discoverChatbotDataFiles();

  const documentRecords = buildDocumentRecords(importantDocFiles);
  const chatbotDataResult = buildChatbotDataRecords(chatbotDataFiles);
  const allRawRecords = [...documentRecords, ...chatbotDataResult.records];

  const ragRecords = dedupeChunkRecords(allRawRecords, options);

  const outputPayload = {
    meta: {
      schemaVersion: 1,
      generatedAt: new Date().toISOString(),
      generatedBy: "backend/scripts/buildUnifiedRagJson.js",
      repositoryRoot: REPO_ROOT,
      description:
        "Unified RAG corpus generated from important project documents and all chatbot-data folder files.",
      ragReady: true,
      chunking: {
        chunkSizeChars: options.chunkSizeChars,
        chunkOverlapChars: options.chunkOverlapChars,
      },
    },
    stats: {
      importantDocumentFileCount: importantDocFiles.length,
      chatbotDataFileCount: chatbotDataFiles.length,
      rawRecordCount: allRawRecords.length,
      ragChunkCount: ragRecords.length,
    },
    sources: {
      importantDocuments: buildSourceManifest(importantDocFiles, "important-document"),
      chatbotData: buildSourceManifest(chatbotDataFiles, "chatbot-data"),
    },
    ragRecords,
    chatbotDataRaw: options.includeRawChatbotData ? chatbotDataResult.rawFiles : [],
  };

  fs.mkdirSync(path.dirname(options.outputPath), { recursive: true });
  fs.writeFileSync(options.outputPath, JSON.stringify(outputPayload, null, 2), "utf8");

  console.log("Unified RAG JSON generated successfully.");
  console.log(`Output: ${toRelativePath(options.outputPath)}`);
  console.log(`Important documents: ${importantDocFiles.length}`);
  console.log(`Chatbot-data files: ${chatbotDataFiles.length}`);
  console.log(`RAG chunks: ${ragRecords.length}`);
}

try {
  main();
} catch (error) {
  console.error("Failed to build unified RAG JSON:", error.message);
  process.exit(1);
}
