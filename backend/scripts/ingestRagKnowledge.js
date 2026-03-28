require("dotenv").config();

const { ingestKnowledgeBase } = require("../services/chatbotIngestionService");

function parseArgs(argv) {
  const options = {
    dryRun: false,
    force: false,
    purgeNamespace: false,
    resetManifest: false,
    includeDocs: true,
    includeEmbeddingFiles: false,
    verbose: true,
    logEveryBatches: 1,
    embeddingBatchSize: undefined,
    embeddingProvider: undefined,
    maxChunks: undefined,
    namespace: undefined,
    chunkSizeChars: undefined,
    chunkOverlapChars: undefined,
  };

  for (const arg of argv) {
    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }

    if (arg === "--force") {
      options.force = true;
      continue;
    }

    if (arg === "--purge-namespace") {
      options.purgeNamespace = true;
      options.force = true;
      continue;
    }

    if (arg === "--reset-manifest") {
      options.resetManifest = true;
      options.force = true;
      continue;
    }

    if (arg === "--no-docs") {
      options.includeDocs = false;
      continue;
    }

    if (arg === "--include-embedding-files") {
      options.includeEmbeddingFiles = true;
      continue;
    }

    if (arg === "--quiet") {
      options.verbose = false;
      continue;
    }

    if (arg.startsWith("--log-every=")) {
      const value = Number.parseInt(arg.slice("--log-every=".length), 10);
      if (Number.isFinite(value) && value > 0) {
        options.logEveryBatches = value;
      }
      continue;
    }

    if (arg.startsWith("--embedding-batch-size=")) {
      const value = Number.parseInt(arg.slice("--embedding-batch-size=".length), 10);
      if (Number.isFinite(value) && value > 0) {
        options.embeddingBatchSize = value;
      }
      continue;
    }

    if (arg.startsWith("--embedding-provider=")) {
      const value = arg.slice("--embedding-provider=".length).trim();
      if (value) {
        options.embeddingProvider = value;
      }
      continue;
    }

    if (arg.startsWith("--max-chunks=")) {
      const value = Number.parseInt(arg.slice("--max-chunks=".length), 10);
      if (Number.isFinite(value) && value > 0) {
        options.maxChunks = value;
      }
      continue;
    }

    if (arg.startsWith("--namespace=")) {
      const value = arg.slice("--namespace=".length).trim();
      if (value) {
        options.namespace = value;
      }
      continue;
    }

    if (arg.startsWith("--chunk-size=")) {
      const value = Number.parseInt(arg.slice("--chunk-size=".length), 10);
      if (Number.isFinite(value) && value > 0) {
        options.chunkSizeChars = value;
      }
      continue;
    }

    if (arg.startsWith("--chunk-overlap=")) {
      const value = Number.parseInt(arg.slice("--chunk-overlap=".length), 10);
      if (Number.isFinite(value) && value >= 0) {
        options.chunkOverlapChars = value;
      }
    }
  }

  return options;
}

function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const startedAt = Date.now();

  const log = (message, data = undefined) => {
    if (!options.verbose) return;

    const time = new Date().toISOString();
    if (data && typeof data === "object") {
      console.log(`[INGEST][${time}] ${message}`);
      console.log(JSON.stringify(data, null, 2));
      return;
    }

    console.log(`[INGEST][${time}] ${message}`);
  };

  log("Starting RAG ingestion", {
    dryRun: options.dryRun,
    force: options.force,
    purgeNamespace: options.purgeNamespace,
    resetManifest: options.resetManifest,
    includeDocs: options.includeDocs,
    includeEmbeddingFiles: options.includeEmbeddingFiles,
    embeddingBatchSize: options.embeddingBatchSize || null,
    embeddingProvider: options.embeddingProvider || null,
    maxChunks: options.maxChunks || null,
    namespace: options.namespace || null,
    chunkSizeChars: options.chunkSizeChars || null,
    chunkOverlapChars: options.chunkOverlapChars || null,
    logEveryBatches: options.logEveryBatches,
  });

  if (!options.includeEmbeddingFiles) {
    log("Embedding source files are excluded for faster ingestion (use --include-embedding-files to include them)");
  }

  const result = await ingestKnowledgeBase({
    ...options,
    logger: (event) => {
      if (!options.verbose) return;
      const message = event?.message || "Ingestion update";
      const data = event?.data;
      const time = event?.timestamp || new Date().toISOString();

      if (data && typeof data === "object") {
        console.log(`[INGEST][${time}] ${message}`);
        console.log(JSON.stringify(data, null, 2));
      } else {
        console.log(`[INGEST][${time}] ${message}`);
      }
    },
  });

  const totalMs = Date.now() - startedAt;
  console.log(`[INGEST] Completed in ${formatDuration(totalMs)} (${totalMs} ms)`);
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error("[INGEST] Ingestion failed:", error.message);
  if (error?.stack) {
    console.error(error.stack);
  }
  process.exit(1);
});
