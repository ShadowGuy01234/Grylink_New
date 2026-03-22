"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, X } from "lucide-react";
import { useActiveRole } from "@/context/ActiveRoleContext";
import { cn } from "@/lib/utils";
import { trackEvent, GA4_EVENTS } from "@/lib/analytics";
import { postJson } from "@/lib/api";

type FeedbackType = "bug" | "idea" | "question";

export default function FloatingFeedbackWidget() {
  const { activeRole } = useActiveRole();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<FeedbackType>("idea");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const submit = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      setStatus("error");
      setErrorMessage("Please enter feedback before submitting.");
      return;
    }
    setStatus("sending");
    setErrorMessage("");
    try {
      await postJson("/feedback", { role: activeRole, category: type, message: trimmedMessage });
      setStatus("success");
      setMessage("");
      trackEvent(GA4_EVENTS.FEEDBACK_SUBMIT_SUCCESS, { role: activeRole, category: type });
    } catch (error: unknown) {
      setStatus("error");
      const msg = error instanceof Error ? error.message : "Could not submit feedback. Try again.";
      setErrorMessage(msg);
      trackEvent(GA4_EVENTS.FEEDBACK_SUBMIT_ERROR, { role: activeRole, category: type });
    }
  };

  return (
    <>
      <button
        onClick={() => {
          setOpen(true);
          trackEvent(GA4_EVENTS.FEEDBACK_WIDGET_OPEN, { role: activeRole });
        }}
        className="fixed bottom-6 right-6 z-[60] rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 p-4 shadow-xl"
        aria-label="Open feedback widget"
      >
        <MessageSquare className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: 360, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 360, opacity: 0 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[360px] z-[70] bg-slate-950 border-l border-white/10 p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Feedback</h3>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-400 mb-3">Role context: {activeRole}</p>
            <div className="flex gap-2 mb-4">
              {(["bug", "idea", "question"] as FeedbackType[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setType(v)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs border",
                    type === v ? "bg-emerald-500 text-slate-950 border-emerald-400" : "border-white/20 text-gray-300"
                  )}
                >
                  {v[0].toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="w-full rounded-xl bg-white/[0.04] border border-white/10 text-gray-100 p-3 outline-none"
              placeholder="Share your feedback..."
            />

            <button
              onClick={submit}
              disabled={status === "sending"}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold disabled:opacity-70"
            >
              <Send className="w-4 h-4" />
              {status === "sending" ? "Sending..." : "Submit feedback"}
            </button>

            {status === "success" && <p className="text-emerald-300 text-sm mt-3">Thanks! Feedback submitted.</p>}
            {status === "error" && <p className="text-red-300 text-sm mt-3">{errorMessage || "Could not submit feedback. Try again."}</p>}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
