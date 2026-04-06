# Gryork RAG Chatbot Implementation Blueprint

## 1. Objective

Implement a production-ready Retrieval-Augmented Generation (RAG) chatbot for Gryork using:
- Groq for generation output and embeddings
- Pinecone for vector search

Primary goal:
- Replace hardcoded keyword-response chatbot logic in portal Help Center tabs
- Keep answer quality grounded in Gryork-specific workflows, policy docs, and role-based context
- Add safe fallbacks to human support when confidence is low

---

## 2. Current Project Research Summary (What Exists Today)

### 2.1 Existing chat surfaces

1. Sub-contractor portal Help Center has a local FAQ + local keyword chatbot only.
- File: `subcontractor-portal/src/components/HelpCenterTab.tsx`
- Current behavior:
  - Uses `BOT_KNOWLEDGE` array for keyword matching
  - Returns fallback text when no keyword match
  - No API call to backend for bot answers

2. Partner portal (EPC/NBFC) Help Center has similar local keyword chatbot.
- File: `partner-portal/src/components/HelpCenterTab.tsx`
- Current behavior:
  - Role-aware initial greeting (`epc` vs `nbfc`)
  - Local `BOT_KNOWLEDGE` and FAQ arrays
  - No backend RAG integration

3. Help Center rendering points:
- `subcontractor-portal/src/pages/DashboardPage.tsx` uses `<HelpCenterTab />` for `help` tab
- `partner-portal/src/pages/DashboardPage.tsx` uses `<HelpCenterTab userRole={isEpc ? "epc" : "nbfc"} />`

### 2.2 Existing backend chat data model

1. KYC chat persistence exists.
- File: `backend/models/ChatMessage.js`
- Designed for operational chat linked to `cwcRfId`
- Supports text/file/system/action_required, reactions, read states

2. Ops KYC chat endpoints exist.
- File: `backend/routes/ops.js`
- Endpoints include:
  - `GET /api/ops/kyc/:id/chat`
  - `POST /api/ops/kyc/:id/chat`
  - read/reaction/edit/delete endpoints

3. KYC chat logic service exists.
- File: `backend/services/kycService.js`
- Supports message creation, retrieval, file upload to Cloudinary

### 2.3 Existing backend architecture pattern to follow

- Express route modules under `backend/routes`
- Service modules under `backend/services`
- JWT middleware in `backend/middleware/auth.js`
- Route mounting in `backend/index.js`
- Portal API clients use base URL pattern:
  - `VITE_API_URL` -> default `http://localhost:5000/api`

### 2.4 Key gap

The current virtual assistant in portal Help Center tabs is not using backend retrieval or LLM. It is deterministic keyword matching and cannot answer out-of-coverage questions robustly.

---

## 3. Target RAG Architecture

## 3.1 Runtime request flow

1. User asks question in Help Center tab (subcontractor or partner portal)
2. Frontend sends `POST /api/chatbot/query`
3. Backend generates embedding via Groq embedding model
4. Backend queries Pinecone (namespace + metadata filters)
5. Backend builds grounded context from retrieved chunks
6. Backend calls Groq chat completion model with:
- system instructions
- retrieved context
- user question
7. Backend returns answer + citations + retrieval metadata
8. Frontend renders answer and optional cited sources
9. If confidence is low or no relevant retrieval, assistant returns support handoff guidance

## 3.2 Components

1. Retriever
- Pinecone top-k semantic retrieval
- Role/portal aware namespace strategy

2. Generator
- Groq chat completion model for final answer

3. Grounding and guardrails
- Constrain response to retrieved context
- If unknown, explicitly say not found and route user to Ops support

4. Citation support
- Return list of source metadata used in answer

---

## 4. Knowledge Sources for Pinecone Ingestion

Use a hybrid corpus:

1. Static governance and product knowledge
- `doc/GryorkSOP.md`
- `doc/GRYORK_PLATFORM_WORKFLOW.md`
- `GRYORK_TECHNICAL_DOCUMENTATION.md`
- `ROLE_ACCESS_DOCUMENTATION.md`
- `WORKFLOW_AUDIT_REPORT.md`
- `API_TESTING_GUIDE.md`

2. Existing FAQ/chatbot seed data
- `subcontractor-portal/src/components/HelpCenterTab.tsx` (FAQ + BOT_KNOWLEDGE)
- `partner-portal/src/components/HelpCenterTab.tsx` (FAQ + BOT_KNOWLEDGE)

3. Structured operational snapshots (optional phase 2)
- Case/CWCRF status dictionaries from API responses
- Non-sensitive workflow states from backend service outputs

Important:
- Do not ingest secrets or private PII into Pinecone vectors
- Keep sensitive user records out of static vector corpus

---

## 5. Pinecone Data Model and Namespace Strategy

## 5.1 Suggested namespace strategy

Use namespace per portal/role scope:
- `gryork-subcontractor`
- `gryork-epc`
- `gryork-nbfc`
- `gryork-common`

Query strategy:
- Query role namespace first
- Merge with `gryork-common` results
- Rerank by score and recency

## 5.2 Metadata schema (recommended)

Store each chunk with:
- `sourcePath` (file path)
- `sourceType` (`doc`, `faq`, `policy`, `workflow`, `api_reference`)
- `portal` (`subcontractor`, `partner`, `common`)
- `audience` (`subcontractor`, `epc`, `nbfc`, `all`)
- `title`
- `section`
- `updatedAt`
- `version`

---

## 6. Groq + Pinecone Configuration

Use the following backend environment keys:

- `GROQ_API_KEY`
- `GROQ_BASE_URL`
- `GROQ_CHAT_MODEL`
- `GROQ_EMBEDDING_MODEL`
- `PINECONE_API_KEY`
- `PINECONE_INDEX_HOST`
- `PINECONE_INDEX_NAME`
- `PINECONE_NAMESPACE_PREFIX`
- `PINECONE_TOP_K`
- `RAG_MAX_CONTEXT_CHUNKS`
- `RAG_SCORE_THRESHOLD`

Model notes:
- Keep generation and embedding models configurable
- Verify embedding dimension in Groq before creating Pinecone index

---

## 7. Backend API Contract (Recommended)

## 7.1 `POST /api/chatbot/query`

Request:

```json
{
  "message": "How long does KYC verification take?",
  "portal": "subcontractor",
  "conversation": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ],
  "namespace": "optional-override"
}
```

Response:

```json
{
  "answer": "KYC usually takes 2-3 business days once required docs are submitted.",
  "citations": [
    {
      "id": "faq_subcontractor_kyc_2",
      "score": 0.88,
      "title": "KYC Verification FAQ",
      "source": "subcontractor-portal/src/components/HelpCenterTab.tsx",
      "section": "KYC & Verification"
    }
  ],
  "retrieval": {
    "namespace": "gryork-subcontractor",
    "topK": 6,
    "returned": 4
  }
}
```

## 7.2 `GET /api/chatbot/health`

Returns readiness and missing env keys.

---

## 8. Backend Integration Plan (Project-specific)

## 8.1 New backend files

1. `backend/services/chatbotRagService.js`
- Encapsulates Groq embedding call
- Encapsulates Pinecone vector query
- Builds grounded prompt and calls Groq generation
- Returns answer + citations

2. `backend/routes/chatbot.js`
- `POST /query` for authenticated users
- `GET /health` for readiness checks

## 8.2 Backend wiring

1. Mount chatbot route in `backend/index.js`
- `app.use("/api/chatbot", require("./routes/chatbot"));`

2. Keep authorization broad for internal portals
- `subcontractor`, `epc`, `nbfc`, `ops`, `admin`, `founder`, `sales`, `rmt`

---

## 9. Frontend Integration Plan

## 9.1 Sub-contractor portal

File: `subcontractor-portal/src/components/HelpCenterTab.tsx`

Replace `getBotResponse` + local timeout simulation with API call:
- Add `chatbotApi.ask({ message, portal: "subcontractor", conversation })`
- Render returned answer and citation footnotes
- Keep fallback to "Message Ops Team" when API fails

## 9.2 Partner portal

File: `partner-portal/src/components/HelpCenterTab.tsx`

Replace local keyword response with API call:
- `portal` value can be `epc` or `nbfc` by `userRole`
- Send short conversation history for context continuity

---

## 10. Ingestion Pipeline Design (Phase 1 to Phase 2)

## 10.1 Phase 1 ingestion (fastest path)

Ingest static markdown/docs + HelpCenter FAQs only.

Steps:
1. Parse source files
2. Split into chunks (target 400-900 tokens)
3. Generate embeddings via Groq
4. Upsert to Pinecone with metadata

## 10.2 Phase 2 ingestion

Add controlled operational content:
- status dictionaries
- approved workflow summaries
- curated API behavior docs

Do not ingest sensitive personal records.

## 10.3 Refresh strategy

- Nightly re-index for docs that changed
- Delta re-index using file hash checks
- Keep version tag in metadata for rollback

---

## 11. Prompt and Safety Guardrails

System prompt requirements:
1. Answer only from supplied context
2. If context is missing, say so clearly
3. Avoid legal/financial commitments
4. Keep responses short and operationally actionable
5. Suggest escalation path when uncertainty is high

Response style:
- concise
- role-aware language
- include source citations when available

---

## 12. Observability and Quality

Track per request:
- latency (embed, retrieval, generation)
- retrieval hit count
- top similarity score
- fallback/no-context rate
- user feedback thumbs up/down (future)

Quality checks:
- role leakage test (nbfc info should not leak to subcontractor scope)
- hallucination test for unsupported questions
- regression suite using 50+ known Q/A prompts from existing FAQ data

---

## 13. Rollout Plan

## Sprint 1

1. Add backend chatbot route + service scaffolding
2. Add env placeholders
3. Build ingestion script for docs + FAQ arrays
4. Validate with local Postman tests

## Sprint 2

1. Connect subcontractor Help Center to RAG endpoint
2. Add citation rendering
3. Deploy and monitor fallback rate

## Sprint 3

1. Connect partner Help Center
2. Add role-based namespace optimization
3. Add analytics for answer quality

---

## 14. Acceptance Criteria

1. Both Help Center tabs can call backend chatbot endpoint
2. Response is generated by Groq using Pinecone-retrieved context
3. Citations are returned and displayed
4. Missing-context questions return graceful escalation guidance
5. No hardcoded keyword chatbot remains in production path
6. Environment setup is fully documented and configurable

---

## 15. Immediate Next Steps in This Repo

1. Implement ingestion script:
- `backend/scripts/ingestRagKnowledge.js`

2. Add frontend API wrappers:
- `subcontractor-portal/src/api/chatbot.ts`
- `partner-portal/src/api/chatbot.ts`

3. Replace local bot logic in:
- `subcontractor-portal/src/components/HelpCenterTab.tsx`
- `partner-portal/src/components/HelpCenterTab.tsx`

4. Add simple admin-only reindex trigger endpoint (optional):
- `POST /api/chatbot/reindex`

---

This blueprint is intentionally aligned with your existing Express service architecture, role model, and portal split so implementation can proceed incrementally without breaking the current KYC chat flow.
