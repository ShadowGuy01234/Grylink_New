import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronDown, ChevronUp, MessageSquare, Phone, HelpCircle,
  Send, Bot, User, CheckCircle2, Search, BookOpen, Headphones,
  X, ExternalLink,
} from "lucide-react";
import { toast } from "react-hot-toast";

// ─── FAQ Data ─────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    id: "kyc-1",
    category: "KYC & Verification",
    question: "What documents are required for KYC verification?",
    answer: "You need to upload the following documents: PAN Card (mandatory), Aadhaar Card (mandatory), GST Certificate (mandatory), Cancelled Cheque or Bank Passbook (mandatory). Optional documents include Incorporation Certificate and 6-month Bank Statement. All files must be under 5 MB in JPG, PNG, or PDF format.",
  },
  {
    id: "kyc-2",
    category: "KYC & Verification",
    question: "How long does KYC verification take?",
    answer: "KYC verification typically takes 2–3 business days after you submit all required documents. You will be notified in your portal if any document needs to be re-uploaded or if additional documents are required.",
  },
  {
    id: "kyc-3",
    category: "KYC & Verification",
    question: "My document was rejected. What should I do?",
    answer: "If a document is rejected, it will show a 'Rejected' badge on your KYC page. You can re-upload a new, clearer copy. Common reasons for rejection are: blurry images, expired documents, or mismatched information. Ensure the document is clearly visible and all details match your business registration.",
  },
  {
    id: "kyc-4",
    category: "KYC & Verification",
    question: "What are 'Additional Documents' requested by Ops?",
    answer: "Sometimes our operations team may need supplementary documents to complete your verification (e.g. a specific business license, project agreement, or a newer bank statement). These requests appear in the 'Extra Docs' tab in your dashboard with upload instructions. Upload promptly to avoid delays.",
  },
  {
    id: "cwcrf-1",
    category: "CWCRF & Financing",
    question: "What is a CWCRF and how do I submit one?",
    answer: "CWCRF stands for Credit on Working Capital Request Form. It is your financing application to request funds against an invoice raised to an EPC company. To submit: go to 'CWC RF' tab, fill in buyer (EPC) details, invoice details, credit request amount, tenure, and interest preference. Attach the RA Bill and any work completion certificates.",
  },
  {
    id: "cwcrf-2",
    category: "CWCRF & Financing",
    question: "What is the platform fee and why is it charged?",
    answer: "A one-time non-refundable platform processing fee of ₹1,000 is charged per CWCRF submission. This covers Gryork's document review, verification, and NBFC coordination services. Payment confirmation is required before your CWCRF can be submitted.",
  },
  {
    id: "cwcrf-3",
    category: "CWCRF & Financing",
    question: "How long before I receive funding after submitting a CWCRF?",
    answer: "The typical timeline is: Day 1–2: Ops verification; Day 3–4: EPC buyer verification; Day 5–7: RMT risk assessment; Day 8–10: NBFC bids arrive; Day 11–12: You select an offer and funds are disbursed. Total: approximately 10–14 business days. Urgent cases may be fast-tracked.",
  },
  {
    id: "cwcrf-4",
    category: "CWCRF & Financing",
    question: "Can I cancel a submitted CWCRF?",
    answer: "Once a CWCRF is submitted and under review, it cannot be cancelled directly. Please contact Ops support through the Contact Us section below to discuss withdrawal. Note that the ₹1,000 platform fee is non-refundable once the CWCRF is submitted.",
  },
  {
    id: "bids-1",
    category: "Bids & Offers",
    question: "How do NBFC bids work?",
    answer: "After your CWCRF is risk-assessed and approved, multiple NBFCs will place bids offering different funding amounts, interest rates, and tenures. You will see these in the 'Bids' tab. You can accept a bid, negotiate a counter-offer, or reject it. The NBFC whose bid you accept will disburse the funds.",
  },
  {
    id: "bids-2",
    category: "Bids & Offers",
    question: "What does 'Negotiate' mean in the bids section?",
    answer: "The Negotiate option allows you to send a counter-offer to an NBFC — you can propose a different funding amount or repayment duration. The NBFC will then respond to your counter-offer. You can continue negotiating until both parties agree or you accept/reject.",
  },
  {
    id: "account-1",
    category: "Account & Profile",
    question: "How do I update my company profile?",
    answer: "Go to the 'Profile' tab in your dashboard. You can update your company name, owner details, contact phone, GSTIN, and registered address. Note: once your KYC is completed, some fields may be locked for security. Contact Ops if you need to update locked fields.",
  },
  {
    id: "account-2",
    category: "Account & Profile",
    question: "How do I update my bank account details?",
    answer: "Bank details can be updated from the KYC page (accessible when your account is in KYC stage) or from the Profile tab. Once bank details are verified by Ops, they cannot be changed without contacting support — this is to protect against fraud.",
  },
  {
    id: "status-1",
    category: "Status & Tracking",
    question: "What do the different CWCRF status stages mean?",
    answer: "SUBMITTED: Received by Ops → OPS_REVIEW: Being verified by Ops → EPC_VERIFICATION: Buyer (EPC) is confirming the invoice → RMT_REVIEW: Risk assessment in progress → NBFC_BIDDING: Listed for NBFC bids → COMMERCIAL_LOCKED: You've accepted a bid → DISBURSED: Funds sent to your account.",
  },
  {
    id: "status-2",
    category: "Status & Tracking",
    question: "Why is my case showing 'Action Required'?",
    answer: "An 'Action Required' status means our team needs something from you — this could be re-uploading a rejected document, accepting a bid, or signing an agreement. Check your KYC page, Extra Docs tab, and Bids tab for pending actions.",
  },
];

// ─── Chatbot Knowledge ────────────────────────────────────────────────────────

interface BotResponse {
  keywords: string[];
  response: string;
}

const BOT_KNOWLEDGE: BotResponse[] = [
  {
    keywords: ["kyc", "document", "verification", "verify", "upload", "pan", "aadhaar", "gst"],
    response: "For KYC, you need to upload: PAN Card, Aadhaar Card, GST Certificate, and a Cancelled Cheque. All files must be under 5 MB (JPG, PNG, or PDF). After uploading, submit for review from the KYC page. Verification usually takes 2–3 business days.",
  },
  {
    keywords: ["rejected", "rejection", "re-upload", "reupload", "red"],
    response: "If a document is rejected, go to your KYC page and look for the red 'Rejected' badge. Click the re-upload button next to that document and upload a clearer, valid copy. Make sure all details are legible and the document is not expired.",
  },
  {
    keywords: ["additional document", "extra doc", "ops request", "additional docs", "requested"],
    response: "If the Ops team requests additional documents, they appear in the 'Extra Docs' tab (look for the orange badge in the sidebar). Each request shows the document name, description, and an upload button. Upload promptly to avoid delays in your verification.",
  },
  {
    keywords: ["cwcrf", "cwc rf", "credit request", "working capital", "application", "submit"],
    response: "A CWCRF is your working capital financing application. Go to 'CWC RF' tab → fill Sections A (buyer), B (invoice), C (credit amount & tenure), D (interest preference) → upload your RA Bill → pay the ₹1,000 platform fee → Submit. The processing takes about 10–14 business days.",
  },
  {
    keywords: ["fee", "1000", "platform fee", "payment", "charge"],
    response: "The Gryork platform fee is ₹1,000 per CWCRF submission. It is non-refundable and covers document verification, risk assessment, and NBFC coordination. You must pay this before submitting your CWCRF.",
  },
  {
    keywords: ["bid", "bids", "nbfc", "offer", "interest rate", "tenure", "negotiate"],
    response: "After your CWCRF is approved, NBFCs place bids in your 'Bids' tab. Each bid shows the offer amount, interest rate, and repayment duration. You can Accept (immediate), Negotiate (counter-offer), or Reject. Accepted bids proceed to fund disbursement.",
  },
  {
    keywords: ["status", "stage", "progress", "track", "where", "how long"],
    response: "CWCRF stages: SUBMITTED → OPS_REVIEW (1–2 days) → EPC_VERIFICATION (1–2 days) → RMT_REVIEW (2–3 days) → NBFC_BIDDING (2–3 days) → COMMERCIAL_LOCKED → DISBURSED. Total: ~10–14 business days. Check your 'Cases' tab for real-time status.",
  },
  {
    keywords: ["profile", "update", "company name", "phone", "address", "gstin"],
    response: "Update your company profile in the 'Profile' tab. You can change company name, owner name, phone, GSTIN, and address. Note: fields locked after KYC cannot be changed through the portal — contact Ops support for locked fields.",
  },
  {
    keywords: ["bank", "bank account", "ifsc", "account number", "bank details"],
    response: "Bank details are entered during KYC on the KYC Upload page. Once verified by Ops, they get locked for security. To update locked bank details, please contact our support team directly (Contact section below) with a valid reason and supporting documents.",
  },
  {
    keywords: ["disburse", "disbursement", "funds", "transfer", "money", "receive"],
    response: "Funds are disbursed to your registered bank account after you accept an NBFC bid and all paperwork is complete. Disbursement typically occurs within 1–2 business days after commercial lock. Ensure your bank details are verified.",
  },
  {
    keywords: ["cancel", "withdraw", "abort", "stop"],
    response: "Once a CWCRF is submitted, it cannot be self-cancelled. Contact our Ops support team (use Contact Us below) to request withdrawal. Note the ₹1,000 platform fee is non-refundable.",
  },
  {
    keywords: ["password", "login", "otp", "forgot", "reset"],
    response: "For login issues or password reset: on the login page click 'Forgot Password' and enter your registered email. You will receive a reset OTP. If you still face issues, contact support at support@gryork.com.",
  },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: "user" | "bot";
  text: string;
  timestamp: Date;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function getBotResponse(query: string): string | null {
  const lower = query.toLowerCase();
  for (const item of BOT_KNOWLEDGE) {
    if (item.keywords.some((kw) => lower.includes(kw))) {
      return item.response;
    }
  }
  return null;
}

// ─── Main Component ───────────────────────────────────────────────────────────

const HelpCenterTab = () => {
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [faqSearch, setFaqSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "bot",
      text: "Hi! I'm Gryork's virtual assistant. Ask me anything about KYC, CWCRF, bids, payments, or your account. If I can't help, I'll connect you to our support team.",
      timestamp: new Date(),
    },
  ]);
  const [showContactForm, setShowContactForm] = useState(false);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [supportMsg, setSupportMsg] = useState("");
  const [sendingSupport, setSendingSupport] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const categories = ["All", ...Array.from(new Set(FAQ_ITEMS.map((f) => f.category)))];

  const filteredFaqs = FAQ_ITEMS.filter((f) => {
    const matchCat = activeFilter === "All" || f.category === activeFilter;
    const matchSearch =
      !faqSearch ||
      f.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
      f.answer.toLowerCase().includes(faqSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isBotTyping]);

  const handleChatSend = () => {
    const text = chatInput.trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      text,
      timestamp: new Date(),
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setIsBotTyping(true);

    setTimeout(() => {
      const response = getBotResponse(text);
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        text:
          response ||
          "I couldn't find a direct answer to that. Please browse the FAQ above or use the 'Talk to Ops' option below to connect with our support team.",
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, botMsg]);
      setIsBotTyping(false);
    }, 800);
  };

  const handleSupportSubmit = async () => {
    if (!supportMsg.trim()) { toast.error("Please write your message first"); return; }
    setSendingSupport(true);
    // Simulate sending — in production connect to support/ticket API
    await new Promise((r) => setTimeout(r, 1200));
    toast.success("Message sent to Ops support! We'll respond within 1 business day.");
    setSupportMsg("");
    setShowContactForm(false);
    setSendingSupport(false);
  };

  return (
    <motion.div
      key="help"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="space-y-8"
    >
      {/* ── Hero Banner ── */}
      <div className="bg-gradient-to-r from-indigo-600 to-sky-500 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <HelpCircle className="h-7 w-7" />
          <h2 className="text-xl font-bold">Help Center</h2>
        </div>
        <p className="text-indigo-100 text-sm">
          Find answers to common questions, chat with our virtual assistant, or reach out to our support team directly.
        </p>
      </div>

      {/* ── FAQ Section ── */}
      <Card className="border border-gray-200 shadow-none">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-600" />
            <CardTitle className="text-base">Frequently Asked Questions</CardTitle>
          </div>
          {/* Search */}
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={faqSearch}
              onChange={(e) => setFaqSearch(e.target.value)}
              placeholder="Search questions..."
              className="pl-9"
            />
          </div>
          {/* Category filters */}
          <div className="flex flex-wrap gap-2 mt-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                  activeFilter === cat
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <HelpCircle className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No matching questions found</p>
            </div>
          ) : (
            filteredFaqs.map((item) => (
              <div
                key={item.id}
                className={`border rounded-xl overflow-hidden transition-colors ${
                  openFaq === item.id ? "border-indigo-200 bg-indigo-50/30" : "border-gray-200"
                }`}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === item.id ? null : item.id)}
                  className="w-full flex items-center justify-between gap-3 p-4 text-left"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full mt-0.5 shrink-0">
                      {item.category.split("&")[0].trim()}
                    </span>
                    <span className="text-sm font-medium text-gray-800">{item.question}</span>
                  </div>
                  {openFaq === item.id ? (
                    <ChevronUp className="h-4 w-4 text-indigo-600 shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
                  )}
                </button>
                <AnimatePresence>
                  {openFaq === item.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 text-sm text-gray-600 border-t border-indigo-100 pt-3">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* ── Virtual Assistant ── */}
      <Card className="border border-gray-200 shadow-none">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-sky-600" />
            <CardTitle className="text-base">Virtual Assistant</CardTitle>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Ask questions about KYC, CWCRF, bids, payments, or your account status.
          </p>
        </CardHeader>
        <CardContent>
          {/* Chat messages */}
          <div className="h-72 overflow-y-auto rounded-xl border border-gray-100 bg-gray-50/50 p-4 space-y-4 mb-3">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === "bot" ? "bg-sky-100" : "bg-indigo-100"
                }`}>
                  {msg.role === "bot" ? (
                    <Bot className="h-4 w-4 text-sky-600" />
                  ) : (
                    <User className="h-4 w-4 text-indigo-600" />
                  )}
                </div>
                <div className={`max-w-[80%] text-sm rounded-2xl px-4 py-2.5 ${
                  msg.role === "bot"
                    ? "bg-white border border-gray-200 text-gray-700 rounded-tl-sm"
                    : "bg-indigo-600 text-white rounded-tr-sm"
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isBotTyping && (
              <div className="flex gap-2.5">
                <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-sky-600" />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]"></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]"></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]"></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input row */}
          <div className="flex gap-2">
            <Input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleChatSend()}
              placeholder="Type your question..."
              className="flex-1"
            />
            <Button onClick={handleChatSend} disabled={!chatInput.trim()} className="bg-sky-600 hover:bg-sky-700 text-white">
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-center text-gray-400 mt-2">
            Tip: Ask about KYC, CWCRF, bids, platform fee, disbursement, or account issues
          </p>
        </CardContent>
      </Card>

      {/* ── Contact Us ── */}
      <Card className="border border-gray-200 shadow-none">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Headphones className="h-5 w-5 text-emerald-600" />
            <CardTitle className="text-base">Contact Support</CardTitle>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Still need help? Reach us directly — our support team is available Mon–Sat, 10 AM–6 PM IST.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Call Support */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <Phone className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Call Us</p>
                <p className="text-xs text-gray-500 mt-0.5">Mon–Sat · 10 AM – 6 PM IST</p>
              </div>
            </div>
            <a
              href="tel:+918000000000"
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <Phone className="h-4 w-4" />
              +91 80000 00000
            </a>
          </div>

          {/* Email Support */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-blue-200 bg-blue-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <ExternalLink className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Email Support</p>
                <p className="text-xs text-gray-500 mt-0.5">Response within 1 business day</p>
              </div>
            </div>
            <a
              href="mailto:support@gryork.com"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              support@gryork.com
            </a>
          </div>

          {/* Chat with Ops */}
          <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Message Ops Team</p>
                  <p className="text-xs text-gray-500 mt-0.5">Send a support request directly to our operations team</p>
                </div>
              </div>
              <button
                onClick={() => setShowContactForm(!showContactForm)}
                className="text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                {showContactForm ? <X className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
            </div>

            <AnimatePresence>
              {showContactForm && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-3 border-t border-indigo-100 pt-3">
                    <Textarea
                      value={supportMsg}
                      onChange={(e) => setSupportMsg(e.target.value)}
                      placeholder="Describe your issue in detail — include your CWCRF number, document type, or case number if relevant..."
                      className="min-h-[100px] resize-none bg-white"
                    />
                    <div className="flex justify-end">
                      <Button
                        onClick={handleSupportSubmit}
                        disabled={sendingSupport || !supportMsg.trim()}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                      >
                        {sendingSupport ? (
                          "Sending..."
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Send to Ops
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      Your message will be received by the Ops team and responded to within 1 business day.
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default HelpCenterTab;
