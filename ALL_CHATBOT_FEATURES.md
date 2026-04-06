# 🤖 Grybot (Gryork Chatbot) - Master Feature Documentation

This document serves as the comprehensive and authoritative list of all features, enhancements, and capabilities implemented in Grybot across all development phases.

## 📑 Table of Contents

1. [Core Conversational Features](#1-core-conversational-features)
2. [User Experience & UI](#2-user-experience--ui)
3. [Performance & Architecture](#3-performance--architecture)
4. [Security & Protection](#4-security--protection)
5. [Analytics & Insights](#5-analytics--insights)
6. [Ecosystem & Integration](#6-ecosystem--integration)

---

## 1. Core Conversational Features 💬

### 1.1 Conversation Memory & Context (Feature #1)
- **Context Awareness:** Remembers previous messages in the conversation (up to a 10-message sliding window).
- **Session Tracking:** Unique session IDs persist across reloads structure saved in MongoDB (`ChatConversation.js`).
- **Seamless Continuation:** Allows follow-up questions referencing previous answers (e.g., answering "How do I apply for *it*?").

### 1.2 Multi-Language Support (Feature #6)
- **Linguistic Processing:** Understands and generates responses in up to 8 Indian regional languages.
- **Auto-Detection:** Detects the user's input language and automatically matches the response language without requiring manual switching.

### 1.3 Advanced Semantic Embeddings (Feature #8)
- **Vector Search:** Replaced basic keyword matching (TF-IDF) with advanced Google Gemini (`text-embedding-004`) embeddings.
- **Accurate Retrieval:** Computes cosine similarity across chunks of the Gryork Knowledge Base to ensure hyper-accurate, context-rich responses.

### 1.4 User Personalization (Feature #10)
- **Role-Based Adaptation:** Leverages the `UserContextManager` to adapt responses based on the individual user's role (Subcontractor vs. Infrastructure Company vs. Admin).

### 1.5 Multi-modal Chatbot Capabilities (Feature #13)
- **Attachment Support:** Accepts images (JPG, PNG, WebP), PDFs, and videos (MP4, MOV).
- **Vision Integration:** Uses AI vision tools to extract text, understand invoice images, and analyze uploaded contracts directly within the chat window.

---

## 2. User Experience & UI 🎨

### 2.1 Quick Action Buttons (Feature #3)
- **Suggested Prompts:** Provides 24+ pre-written queries distributed across 6 contextual categories (Finance, Platform, Troubleshooting, etc.).
- **Dynamic Display:** Shows relevant chip-style chips automatically based on user role to jump-start the conversation.

### 2.2 User Feedback System (Feature #2)
- **Granular Ratings:** Adds "👍 Helpful" and "👎 Not helpful" prompt evaluations to every message.
- **Detailed Insights:** Prompts the user to leave a short written explanation if a negative rating is given.

### 2.3 Enhanced Error Handling (Feature #5)
- **Smart Fallbacks:** Prevents "I don't know" dead-ends by guiding users toward relevant topics (CWC, Finance, Platform).
- **Character & Format Limits:** Intercepts oversized messages and empty queries gracefully with actionable UI prompts instead of backend crash errors.

### 2.4 Proactive Assistance (Feature #12)
- **Smart Suggestions Banner:** Greets the user immediately upon login with up to 2 actionable items.
- **Action Triggers:** Suggests invoice uploads, reminds about pending approvals, and pushes relevant tutorials dynamically.

---

## 3. Performance & Architecture ⚡

### 3.1 Response Time Optimization & Caching (Feature #4)
- **Intelligent Caching:** Common queries are securely cached using `node-cache` with a 1-hour Time-to-Live (TTL).
- **Speed Increases:** Drops common question response times from ~1.6s to under ~100ms. Displays a visual ⚡ icon whenever a cached answer is served.

### 3.2 Response Compression (Feature #17)
- **Optimized Payloads:** Uses gzip/deflate compression on network responses, significantly speeding up payload deliveries on slow mobile networks.

### 3.3 Lazy Loading Architecture (Feature #19)
- **React.lazy + Suspense:** Prevents the chatbot widget from blocking the main dashboard render. Only downloads and executes chatbot frontend code when the widget is actively opened.

---

## 4. Security & Protection 🛡️

### 4.1 Data Encryption At-Rest & In-Transit (Feature #20)
- **AES-256-CBC Encryption:** Sensitive chat history objects, PII data, and storage tokens are symmetrically encrypted via random IVs before being committed to MongoDB.

### 4.2 Progressive Rate Limiting (Feature #21)
- **Granular Constraints:** 
  - *Standard Queries:* 10/minute per user
  - *Feedback/Session Actions:* 5/minute
  - *Analytics Endpoints:* 60/minute
- **Protective Bypassing:** Automatic exceptions granted to authenticated Admins.

### 4.3 Intelligent Content Filtering (Feature #22)
- **Spam Prevention:** Detects message spamming via repeated characters ("Hiii!!!!!"), ALL CAPS patterns, or excessive URL linking.
- **Threat Detection:** Guards the API against injection attacks (SQLi, Code Injection, XSS payloads).
- **Content Sanitization:** Normalizes whitespace, strips dangerous HTML tags, and enforces Emoji limits.

### 4.4 PII Detection & Masking (Feature #23)
- **Indian Compliance:** Detects standard identification sequences (Aadhaar, PAN, GST, 10-digit Phone numbers, Bank Accounts).
- **Redaction Strategies:** Automatically applies masking (e.g., `****-****-1234`) on outputs and logs to secure personally identifiable information from database leaks or admin dashboards.

---

## 5. Analytics & Continuous Learning 📈

### 5.1 AI-Powered Analytics Dashboard (Feature #11)
- **Admin Portal Views:** Integrated right into the central dashboard with metrics covering Active Users, Sentiment Doughnut Charts, Average Response times, and trending topic summaries. 
- **Knowledge Gap Detection:** Automatically surfaces specific questions that received bad rating scores to aid knowledge base augmentation.

### 5.2 AI Training & Continuous Learning (Feature #14)
- **Success Profiling:** AI analyzes highly rated interactions and extracts prompt success rates.
- **A/B Testing:** Tests variable AI instructions directly against user groups to locate the highest converting prompt style.
- **KB Automation:** Automatically formats new document chunks required based on "Failed" or low-rated queries.

### 5.3 Advanced Security Analytics (Feature #24 & #25)
- **Threat Logging:** Logs rejected queries due to rate-limit triggers, offensive content, or PII detection. 
- **Security Dashboard:** Features visual monitoring dedicated to tracking potential system abusers or IP spikes.

---

## 6. Ecosystem & Integration 🌐

### 6.1 Omni-Channel Integration Ecosystem (Feature #15)
- **Platform Bridging:** Ready-to-go architecture built out to hook Grybot's conversational logic seamlessly into platforms like WhatsApp Business API, Slack, MS Teams, SMS (via MSG91), and traditional Email. 
- Allows the bot to respond directly through native apps outside the Gryork portal.