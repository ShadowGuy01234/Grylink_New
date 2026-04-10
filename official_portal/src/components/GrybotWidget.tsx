import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";

type Citation = {
  id?: string;
  score?: number;
  title?: string;
  source?: string;
  section?: string | null;
};

type QuickPrompt = {
  id: string;
  text: string;
  intent?: string;
};

type FeedbackRating = "helpful" | "not_helpful";

type FeedbackEntry = {
  rating?: FeedbackRating;
  status?: "idle" | "sending" | "sent" | "error";
  reason?: string;
  showReason?: boolean;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  citations?: Citation[];
  loading?: boolean;
  cacheHit?: boolean;
  language?: string;
  question?: string;
};

type GrybotWidgetProps = {
  portal: string;
  title?: string;
  usePublicEndpoint?: boolean;
  rightOffset?: number;
  bottomOffset?: number;
  zIndex?: number;
};

const API_BASE =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? "http://localhost:5000/api"
    : "https://api.gryork.com/api");
const MAX_INPUT_CHARS = 2000;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const DEFAULT_PROMPTS: QuickPrompt[] = [
  { id: "quick_start", text: "How do I get started on GryLink?", intent: "onboarding" },
  { id: "quick_docs", text: "What documents are needed for CWCRF?", intent: "workflow" },
  { id: "quick_track", text: "How can I track disbursement status?", intent: "tracking" },
];

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  text: "Hi, I am Grybot. Ask me about CWC, KYC, workflows, or platform usage.",
};

function getToken() {
  if (typeof window === "undefined") return "";

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("token") ||
    ""
  );
}

function getSessionStorageKey(portal: string) {
  return `grybot_session_${String(portal || "public").toLowerCase()}`;
}

function createSessionId(portal: string) {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return `gry_${portal}_${window.crypto.randomUUID()}`.slice(0, 120);
  }

  return `gry_${portal}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`.slice(0, 120);
}

function getOrCreateSessionId(portal: string) {
  if (typeof window === "undefined") return "";

  const key = getSessionStorageKey(portal);
  const existing = localStorage.getItem(key);
  if (existing) return existing;

  const created = createSessionId(portal);
  localStorage.setItem(key, created);
  return created;
}

function toConversation(messages: ChatMessage[]) {
  return messages
    .filter((message) => !message.loading)
    .slice(-10)
    .map((message) => ({ role: message.role, content: message.text }));
}

function resolveEndpoint(
  usePublicEndpoint: boolean,
  token: string,
  privatePath: string,
  publicPath: string,
) {
  return usePublicEndpoint || !token ? publicPath : privatePath;
}

async function readTextPreview(file: File) {
  const type = String(file.type || "").toLowerCase();
  const lowerName = file.name.toLowerCase();
  const isLikelyText =
    type.startsWith("text/") ||
    type.includes("json") ||
    lowerName.endsWith(".txt") ||
    lowerName.endsWith(".md") ||
    lowerName.endsWith(".json") ||
    lowerName.endsWith(".csv");

  if (!isLikelyText) return "";

  try {
    const content = await file.text();
    return content.replace(/\s+/g, " ").trim().slice(0, 1200);
  } catch {
    return "";
  }
}

function trimText(value: string, max = 1200) {
  return String(value || "").trim().slice(0, max);
}

function renderInlineFormat(value: string) {
  const text = String(value || "");
  const segments = text.split(/(\*\*[^*]+\*\*)/g);

  return segments.map((segment, index) => {
    if (segment.startsWith("**") && segment.endsWith("**") && segment.length > 4) {
      return <strong key={`strong_${index}`}>{segment.slice(2, -2)}</strong>;
    }

    return <span key={`text_${index}`}>{segment}</span>;
  });
}

function renderMessageText(value: string): ReactNode {
  const lines = String(value || "").replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let orderedItems: string[] = [];
  let bulletItems: string[] = [];

  const flushOrdered = () => {
    if (!orderedItems.length) return;

    blocks.push(
      <ol
        key={`ol_${blocks.length}`}
        style={{ margin: "6px 0", paddingLeft: 18 }}
      >
        {orderedItems.map((item, index) => (
          <li key={`oli_${index}`} style={{ marginBottom: 4 }}>
            {renderInlineFormat(item)}
          </li>
        ))}
      </ol>,
    );

    orderedItems = [];
  };

  const flushBullets = () => {
    if (!bulletItems.length) return;

    blocks.push(
      <ul
        key={`ul_${blocks.length}`}
        style={{ margin: "6px 0", paddingLeft: 18 }}
      >
        {bulletItems.map((item, index) => (
          <li key={`uli_${index}`} style={{ marginBottom: 4 }}>
            {renderInlineFormat(item)}
          </li>
        ))}
      </ul>,
    );

    bulletItems = [];
  };

  lines.forEach((rawLine) => {
    const line = rawLine.trim();
    const orderedMatch = line.match(/^\d+[.)]\s+(.*)$/);
    const bulletMatch = line.match(/^[-*]\s+(.*)$/);

    if (orderedMatch) {
      flushBullets();
      orderedItems.push(orderedMatch[1]);
      return;
    }

    if (bulletMatch) {
      flushOrdered();
      bulletItems.push(bulletMatch[1]);
      return;
    }

    flushOrdered();
    flushBullets();

    if (!line) {
      blocks.push(<div key={`gap_${blocks.length}`} style={{ height: 6 }} />);
      return;
    }

    blocks.push(
      <p
        key={`p_${blocks.length}`}
        style={{ margin: "0 0 6px 0" }}
      >
        {renderInlineFormat(line)}
      </p>,
    );
  });

  flushOrdered();
  flushBullets();

  return <>{blocks}</>;
}

function ChatbotLauncherIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 3C7.03 3 3 6.58 3 11c0 2.47 1.26 4.69 3.24 6.15V21l3.51-2.11c.72.15 1.48.23 2.25.23 4.97 0 9-3.58 9-8s-4.03-8-9-8Z"
        fill="white"
        opacity="0.95"
      />
      <circle cx="9" cy="11" r="1.2" fill="#1E3A8A" />
      <circle cx="12" cy="11" r="1.2" fill="#1E3A8A" />
      <circle cx="15" cy="11" r="1.2" fill="#1E3A8A" />
    </svg>
  );
}

export function GrybotWidget({
  portal,
  title = "Grybot",
  usePublicEndpoint = false,
  rightOffset = 20,
  bottomOffset = 20,
  zIndex = 2147483000,
}: GrybotWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [errorText, setErrorText] = useState("");
  const [quickPrompts, setQuickPrompts] = useState<QuickPrompt[]>(DEFAULT_PROMPTS);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState("");
  const [feedbackMap, setFeedbackMap] = useState<Record<string, FeedbackEntry>>({});
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);

  const messageListRef = useRef<HTMLDivElement | null>(null);
  const hasHydratedSessionRef = useRef(false);

  useEffect(() => {
    setSessionId(getOrCreateSessionId(portal));
  }, [portal]);

  useEffect(() => {
    if (!messageListRef.current) return;
    messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
  }, [messages, isOpen]);

  const canSend = useMemo(() => {
    return input.trim().length > 0 && input.trim().length <= MAX_INPUT_CHARS && !isSending;
  }, [input, isSending]);

  const charCount = input.trim().length;
  const token = getToken();

  async function fetchProactivePrompts(currentPrompt = "") {
    try {
      const endpoint = resolveEndpoint(
        usePublicEndpoint,
        token,
        "/chatbot/proactive",
        "/chatbot/public-proactive",
      );
      const query = currentPrompt ? `?currentPrompt=${encodeURIComponent(currentPrompt)}` : "";

      const response = await fetch(`${API_BASE}${endpoint}${query}`, {
        method: "GET",
        headers: {
          ...(endpoint === "/chatbot/proactive" && token
            ? { Authorization: `Bearer ${token}` }
            : {}),
        },
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) return;

      if (Array.isArray(payload?.prompts) && payload.prompts.length > 0) {
        setQuickPrompts(
          payload.prompts
            .map((item: any) => ({
              id: String(item.id || item.text || Math.random()),
              text: String(item.text || "").trim(),
              intent: String(item.intent || "general"),
            }))
            .filter((item: QuickPrompt) => item.text)
            .slice(0, 6),
        );
      }
    } catch {
      // Ignore proactive fetch issues and keep local defaults.
    }
  }

  async function hydrateSession() {
    if (hasHydratedSessionRef.current || !sessionId || usePublicEndpoint || !token) return;

    hasHydratedSessionRef.current = true;
    try {
      const response = await fetch(
        `${API_BASE}/chatbot/session/${encodeURIComponent(sessionId)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) return;
      const payload = await response.json().catch(() => ({}));
      if (!Array.isArray(payload?.messages) || payload.messages.length === 0) return;

      const restored: ChatMessage[] = payload.messages.slice(-10).map((item: any, index: number) => ({
        id: `history_${index}_${Date.now()}`,
        role: item.role === "assistant" ? "assistant" : "user",
        text: trimText(item.content || "", 2000),
      }));

      setMessages([WELCOME_MESSAGE, ...restored]);
    } catch {
      // Keep local state if session hydration fails.
    }
  }

  useEffect(() => {
    if (!isOpen) return;
    void hydrateSession();
    void fetchProactivePrompts();
  }, [isOpen, sessionId]);

  async function sendMessage(prefilled?: string, proactivePromptId?: string) {
    const content = (prefilled ?? input).trim();
    if (!content || isSending) return;

    if (content.length > MAX_INPUT_CHARS) {
      setErrorText(`Please keep your message within ${MAX_INPUT_CHARS} characters.`);
      return;
    }

    const activeSessionId = sessionId || getOrCreateSessionId(portal);
    if (!sessionId && activeSessionId) {
      setSessionId(activeSessionId);
    }

    setErrorText("");

    const userMessage: ChatMessage = {
      id: `u_${Date.now()}`,
      role: "user",
      text: content,
    };

    const loadingMessage: ChatMessage = {
      id: `a_loading_${Date.now()}`,
      role: "assistant",
      text: "Thinking...",
      loading: true,
    };

    const nextMessages = [...messages, userMessage, loadingMessage];

    setMessages(nextMessages);
    setInput("");
    setIsSending(true);

    try {
      const endpoint = resolveEndpoint(
        usePublicEndpoint,
        token,
        "/chatbot/query",
        "/chatbot/public-query",
      );

      const attachmentPayload = attachedFile
        ? [
            {
              name: attachedFile.name,
              type: attachedFile.type || "application/octet-stream",
              size: attachedFile.size,
              textPreview: attachmentPreview,
            },
          ]
        : [];

      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-chat-session-id": activeSessionId,
          ...(endpoint === "/chatbot/query" && token
            ? { Authorization: `Bearer ${token}` }
            : {}),
        },
        body: JSON.stringify({
          message: content,
          portal,
          sessionId: activeSessionId,
          proactivePromptId,
          attachments: attachmentPayload,
          conversation: toConversation(nextMessages),
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || "Grybot request failed");
      }

      const answerText =
        typeof payload?.answer === "string" && payload.answer.trim()
          ? payload.answer.trim()
          : "I could not generate an answer right now.";

      const assistantMessage: ChatMessage = {
        id: `a_${Date.now()}`,
        role: "assistant",
        text: answerText,
        citations: Array.isArray(payload?.citations) ? payload.citations : [],
        cacheHit: Boolean(payload?.cacheHit || payload?.usedCache),
        language: typeof payload?.language === "string" ? payload.language : undefined,
        question: content,
      };

      setMessages((current) => [
        ...current.filter((message) => !message.loading),
        assistantMessage,
      ]);

      if (Array.isArray(payload?.proactive?.prompts) && payload.proactive.prompts.length > 0) {
        setQuickPrompts(
          payload.proactive.prompts
            .map((item: any) => ({
              id: String(item.id || item.text || Math.random()),
              text: String(item.text || "").trim(),
              intent: String(item.intent || "general"),
            }))
            .filter((item: QuickPrompt) => item.text)
            .slice(0, 6),
        );
      } else if (Array.isArray(payload?.suggestions) && payload.suggestions.length > 0) {
        setQuickPrompts(
          payload.suggestions.slice(0, 6).map((text: string, index: number) => ({
            id: `suggestion_${index}`,
            text: String(text || "").trim(),
            intent: "suggested",
          })),
        );
      }

      if (typeof payload?.sessionId === "string" && payload.sessionId.trim()) {
        const nextSessionId = payload.sessionId.trim();
        setSessionId(nextSessionId);
        if (typeof window !== "undefined") {
          localStorage.setItem(getSessionStorageKey(portal), nextSessionId);
        }
      }

      setAttachedFile(null);
      setAttachmentPreview("");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "I could not process that request right now. Please try again shortly.";
      setErrorText(message);

      setMessages((current) => [
        ...current.filter((messageItem) => !messageItem.loading),
        {
          id: `a_error_${Date.now()}`,
          role: "assistant",
          text: "I could not process that request right now. Please try again shortly.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  function onInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      if (canSend) {
        void sendMessage();
      }
    }
  }

  async function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setErrorText("Attachment too large. Keep files under 10 MB.");
      return;
    }

    const allowed =
      file.type.startsWith("image/") ||
      file.type.startsWith("video/") ||
      file.type === "application/pdf" ||
      file.type.startsWith("text/") ||
      file.type.includes("json") ||
      file.name.toLowerCase().endsWith(".txt") ||
      file.name.toLowerCase().endsWith(".md") ||
      file.name.toLowerCase().endsWith(".json");

    if (!allowed) {
      setErrorText("Unsupported file type. Upload image, PDF, video, TXT, MD, or JSON.");
      return;
    }

    setAttachedFile(file);
    setAttachmentPreview(await readTextPreview(file));
    setErrorText("");
  }

  async function submitFeedback(message: ChatMessage, rating: FeedbackRating) {
    const state = feedbackMap[message.id] || { status: "idle" as const };
    const reason = trimText(state.reason || "", 1200);

    if (rating === "not_helpful" && reason.length < 3) {
      setFeedbackMap((current) => ({
        ...current,
        [message.id]: {
          ...state,
          rating,
          showReason: true,
          status: "error",
        },
      }));
      return;
    }

    const endpoint = resolveEndpoint(
      usePublicEndpoint,
      token,
      "/chatbot/feedback",
      "/chatbot/public-feedback",
    );

    setFeedbackMap((current) => ({
      ...current,
      [message.id]: {
        ...state,
        rating,
        showReason: rating === "not_helpful",
        status: "sending",
      },
    }));

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(endpoint === "/chatbot/feedback" && token
            ? { Authorization: `Bearer ${token}` }
            : {}),
        },
        body: JSON.stringify({
          sessionId,
          portal,
          language: message.language || "en",
          messageId: message.id,
          rating,
          reason,
          question: message.question || "",
          answerExcerpt: message.text,
        }),
      });

      if (!response.ok) {
        throw new Error("feedback_failed");
      }

      setFeedbackMap((current) => ({
        ...current,
        [message.id]: {
          ...current[message.id],
          rating,
          status: "sent",
          showReason: false,
        },
      }));
    } catch {
      setFeedbackMap((current) => ({
        ...current,
        [message.id]: {
          ...current[message.id],
          rating,
          status: "error",
          showReason: rating === "not_helpful",
        },
      }));
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        right: rightOffset,
        bottom: bottomOffset,
        zIndex,
        fontFamily: "inherit",
      }}
    >
      {isOpen ? (
        <div
          style={{
            width: "min(390px, calc(100vw - 24px))",
            height: "min(600px, calc(100vh - 32px))",
            background: "#ffffff",
            border: "1px solid #dbe3ef",
            borderRadius: 16,
            boxShadow: "0 18px 40px rgba(15, 23, 42, 0.22)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "12px 14px",
              borderBottom: "1px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "linear-gradient(135deg, #0f172a, #1e293b)",
              color: "#f8fafc",
            }}
          >
            <div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{title}</div>
              <div style={{ fontSize: 11, opacity: 0.85 }}>Gryork Assistant</div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{
                border: "none",
                background: "transparent",
                color: "#f8fafc",
                fontSize: 18,
                cursor: "pointer",
                lineHeight: 1,
              }}
              aria-label="Close Grybot"
            >
              x
            </button>
          </div>

          <div
            ref={messageListRef}
            style={{
              flex: 1,
              overflowY: "auto",
              padding: 12,
              background: "#f8fafc",
            }}
          >
            {messages.length <= 1 && quickPrompts.length > 0 && (
              <div
                style={{
                  marginBottom: 10,
                  padding: "10px 11px",
                  borderRadius: 12,
                  border: "1px solid #dbe3ef",
                  background: "#eff6ff",
                }}
              >
                <div style={{ fontSize: 12, color: "#1e3a8a", fontWeight: 600, marginBottom: 6 }}>
                  Try these quick actions
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {quickPrompts.slice(0, 2).map((prompt) => (
                    <button
                      key={prompt.id}
                      type="button"
                      onClick={() => void sendMessage(prompt.text, prompt.id)}
                      style={{
                        border: "1px solid #bfdbfe",
                        background: "#ffffff",
                        color: "#1e3a8a",
                        borderRadius: 999,
                        fontSize: 11,
                        padding: "4px 8px",
                        cursor: "pointer",
                      }}
                    >
                      {prompt.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => {
              const feedback = feedbackMap[message.id] || { status: "idle" };

              return (
                <div
                  key={message.id}
                  style={{
                    marginBottom: 10,
                    textAlign: message.role === "user" ? "right" : "left",
                  }}
                >
                  <div
                    style={{
                      display: "inline-block",
                      maxWidth: "88%",
                      padding: "9px 11px",
                      borderRadius: 12,
                      fontSize: 13,
                      lineHeight: 1.45,
                      background: message.role === "user" ? "#1d4ed8" : "#ffffff",
                      color: message.role === "user" ? "#ffffff" : "#0f172a",
                      border: message.role === "user" ? "none" : "1px solid #e2e8f0",
                    }}
                  >
                    {message.role === "assistant" ? renderMessageText(message.text) : message.text}
                  </div>

                  {message.cacheHit && (
                    <div style={{ marginTop: 5, fontSize: 11, color: "#475569" }}>⚡ Cached response</div>
                  )}

                  {message.role === "assistant" && !message.loading && message.id !== "welcome" && (
                    <div style={{ marginTop: 6 }}>
                      <button
                        type="button"
                        onClick={() => void submitFeedback(message, "helpful")}
                        disabled={feedback.status === "sending" || feedback.status === "sent"}
                        style={{
                          border: "1px solid #cbd5e1",
                          background: feedback.rating === "helpful" ? "#dcfce7" : "#ffffff",
                          color: "#0f172a",
                          borderRadius: 999,
                          padding: "3px 8px",
                          marginRight: 6,
                          fontSize: 11,
                          cursor: "pointer",
                        }}
                      >
                        👍 Helpful
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setFeedbackMap((current) => ({
                            ...current,
                            [message.id]: {
                              ...(current[message.id] || {}),
                              rating: "not_helpful",
                              showReason: true,
                              status: "idle",
                            },
                          }))
                        }
                        disabled={feedback.status === "sending" || feedback.status === "sent"}
                        style={{
                          border: "1px solid #cbd5e1",
                          background: feedback.rating === "not_helpful" ? "#fee2e2" : "#ffffff",
                          color: "#0f172a",
                          borderRadius: 999,
                          padding: "3px 8px",
                          fontSize: 11,
                          cursor: "pointer",
                        }}
                      >
                        👎 Not helpful
                      </button>

                      {feedback.status === "sent" && (
                        <div style={{ marginTop: 4, fontSize: 11, color: "#166534" }}>Thanks for the feedback.</div>
                      )}

                      {feedback.showReason && (
                        <div style={{ marginTop: 6 }}>
                          <input
                            value={feedback.reason || ""}
                            onChange={(event) =>
                              setFeedbackMap((current) => ({
                                ...current,
                                [message.id]: {
                                  ...(current[message.id] || {}),
                                  reason: event.target.value,
                                },
                              }))
                            }
                            placeholder="Tell us what was missing"
                            style={{
                              width: "100%",
                              border: "1px solid #cbd5e1",
                              borderRadius: 8,
                              fontSize: 11,
                              padding: "6px 8px",
                              outline: "none",
                              boxSizing: "border-box",
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => void submitFeedback(message, "not_helpful")}
                            style={{
                              marginTop: 6,
                              border: "none",
                              borderRadius: 8,
                              background: "#334155",
                              color: "#ffffff",
                              fontSize: 11,
                              padding: "5px 10px",
                              cursor: "pointer",
                            }}
                          >
                            Submit Feedback
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div
            style={{
              borderTop: "1px solid #e2e8f0",
              padding: 10,
              background: "#ffffff",
            }}
          >
            {quickPrompts.length > 0 && (
              <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 8, paddingBottom: 2 }}>
                {quickPrompts.slice(0, 4).map((prompt) => (
                  <button
                    key={prompt.id}
                    type="button"
                    onClick={() => void sendMessage(prompt.text, prompt.id)}
                    style={{
                      border: "1px solid #cbd5e1",
                      borderRadius: 999,
                      background: "#f8fafc",
                      color: "#0f172a",
                      padding: "4px 8px",
                      fontSize: 11,
                      whiteSpace: "nowrap",
                      cursor: "pointer",
                    }}
                  >
                    {prompt.text}
                  </button>
                ))}
              </div>
            )}

            {attachedFile && (
              <div
                style={{
                  marginBottom: 8,
                  fontSize: 11,
                  background: "#eff6ff",
                  color: "#1e3a8a",
                  border: "1px solid #bfdbfe",
                  borderRadius: 8,
                  padding: "6px 8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                }}
              >
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  Attached: {attachedFile.name}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setAttachedFile(null);
                    setAttachmentPreview("");
                  }}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "#1e3a8a",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  Remove
                </button>
              </div>
            )}

            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={onInputKeyDown}
                placeholder="Ask Grybot..."
                style={{
                  flex: 1,
                  border: "1px solid #cbd5e1",
                  borderRadius: 10,
                  padding: "9px 10px",
                  fontSize: 13,
                  outline: "none",
                }}
              />

              <label
                style={{
                  border: "1px solid #cbd5e1",
                  borderRadius: 10,
                  background: "#f8fafc",
                  color: "#334155",
                  padding: "8px 10px",
                  fontSize: 12,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                📎
                <input
                  type="file"
                  accept="image/*,video/*,.pdf,.txt,.md,.json"
                  onChange={onFileChange}
                  style={{ display: "none" }}
                />
              </label>

              <button
                type="button"
                onClick={() => void sendMessage()}
                disabled={!canSend}
                style={{
                  border: "none",
                  borderRadius: 10,
                  background: canSend ? "#0f172a" : "#94a3b8",
                  color: "#ffffff",
                  padding: "0 12px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: canSend ? "pointer" : "not-allowed",
                }}
              >
                Send
              </button>
            </div>

            <div
              style={{
                marginTop: 6,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: 11,
                color: charCount > MAX_INPUT_CHARS ? "#b91c1c" : "#64748b",
              }}
            >
              <span>{errorText || ""}</span>
              <span>
                {charCount}/{MAX_INPUT_CHARS}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          style={{
            border: "none",
            borderRadius: 999,
            width: 56,
            height: 56,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #0f172a, #1d4ed8)",
            color: "#ffffff",
            boxShadow: "0 14px 30px rgba(29, 78, 216, 0.34)",
            cursor: "pointer",
          }}
          aria-label="Open Grybot"
        >
          <ChatbotLauncherIcon />
        </button>
      )}
    </div>
  );
}

export default GrybotWidget;
