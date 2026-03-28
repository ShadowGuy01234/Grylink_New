import { useEffect, useState } from "react";
import { useRoleStore } from "../store/roleStore";
import { publicApi } from "../lib/api";
import { getSessionId } from "../lib/session";
import { trackEvent } from "../lib/analytics";

type FeedbackType = "bug" | "idea" | "question";

type FloatingFeedbackWidgetProps = {
  showFloatingButton?: boolean;
};

export function FloatingFeedbackWidget({
  showFloatingButton = true,
}: FloatingFeedbackWidgetProps) {
  const { activeRole } = useRoleStore();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<FeedbackType>("idea");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "error" | "loading">("idle");
  const [errorText, setErrorText] = useState("");

  function openFeedback(source: "floating" | "navbar") {
    setOpen(true);
    trackEvent({
      eventName: "feedback_opened",
      category: "engagement",
      roleContext: activeRole,
      properties: { source },
    });
  }

  useEffect(() => {
    const onOpenRequest = () => openFeedback("navbar");
    window.addEventListener("gryork-feedback-open", onOpenRequest);
    return () => window.removeEventListener("gryork-feedback-open", onOpenRequest);
  }, [activeRole]);

  async function onSubmit() {
    const cleanMessage = message.trim();
    if (!cleanMessage) {
      setStatus("error");
      setErrorText("Please add your feedback before submitting.");
      return;
    }

    try {
      setStatus("loading");
      setErrorText("");

      await publicApi.submitFeedback({
        type,
        roleContext: activeRole,
        message: cleanMessage,
        name: name.trim(),
        email: email.trim(),
        company: company.trim(),
        pagePath: window.location.pathname + window.location.search,
        pageTitle: document.title,
        sessionId: getSessionId(),
      });

      setStatus("ok");
      setMessage("");
      setName("");
      setEmail("");
      setCompany("");

      trackEvent({
        eventName: "feedback_submitted",
        category: "engagement",
        roleContext: activeRole,
        properties: { type },
      });
    } catch (error) {
      setStatus("error");
      setErrorText(error instanceof Error ? error.message : "Unable to submit feedback.");
    }
  }

  return (
    <>
      {showFloatingButton && (
        <button
          aria-label="Open feedback form"
          onClick={() => openFeedback("floating")}
          className="fixed bottom-4 right-4 rounded-full bg-emerald px-4 py-3 font-semibold text-white shadow-glow sm:bottom-6 sm:right-6"
        >
          Feedback
        </button>
      )}
      {open && (
        <aside
          aria-label="Feedback drawer"
          className="fixed right-0 top-0 z-50 h-full w-full border-l border-slate-200 bg-white p-5 sm:w-[420px]"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Share feedback for Gryork</h3>
            <button onClick={() => setOpen(false)} className="text-slate-500" aria-label="Close feedback form">
              Close
            </button>
          </div>
          <p className="mb-1 text-xs text-slate-500">Role context: {activeRole}</p>
          <p className="mb-3 text-xs text-slate-500">
            Help us improve subcontractor funding journeys, EPC verification flow, or NBFC deal review quality.
          </p>
          <div className="mb-3 flex gap-2">
            {(["bug", "idea", "question"] as FeedbackType[]).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                aria-pressed={type === t}
                className={`rounded-full border px-3 py-1 text-xs ${
                  type === t ? "border-emerald bg-emerald text-white" : "border-slate-200 text-slate-600"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="space-y-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="field"
              placeholder="Your name (optional)"
              aria-label="Your name"
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field"
              placeholder="Work email (optional)"
              aria-label="Your email"
              type="email"
            />
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="field"
              placeholder="Company / EPC / NBFC name (optional)"
              aria-label="Your company"
            />
          </div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            className="field mt-3"
            placeholder="What should we improve? Include page, flow step, and expected outcome."
            aria-label="Feedback message"
          />
          <button
            onClick={onSubmit}
            disabled={status === "loading"}
            className="mt-4 w-full rounded-xl bg-cobalt px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            {status === "loading" ? "Submitting..." : "Submit Feedback"}
          </button>
          {status === "ok" && (
            <p className="mt-3 text-sm text-emerald">Thanks. Your feedback was submitted to Gryork operations.</p>
          )}
          {status === "error" && (
            <p className="mt-3 text-sm text-red-600" role="alert">
              {errorText}
            </p>
          )}
        </aside>
      )}
    </>
  );
}
