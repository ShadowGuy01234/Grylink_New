import { useState, useRef, useEffect } from "react";

// ─── FAQ Data ─────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  // EPC Questions
  {
    id: "epc-1",
    category: "EPC - Onboarding",
    audience: "epc",
    question: "What documents does an EPC company need to submit for verification?",
    answer: "EPC companies must upload: Company Registration Certificate, GST Certificate, PAN Card, and a cancelled cheque or company bank statement. Additionally, authorised signatory ID proof may be required. All documents should be clear, valid, and under 10 MB.",
  },
  {
    id: "epc-2",
    category: "EPC - Onboarding",
    audience: "epc",
    question: "How long does EPC company verification take?",
    answer: "Company document verification typically takes 2–4 business days after all documents are submitted. You will receive an email notification once your company is verified. After verification, you can add Sub-Contractors and manage CWCRF requests.",
  },
  {
    id: "epc-3",
    category: "EPC - Sub-Contractors",
    audience: "epc",
    question: "How do I add a Sub-Contractor to my account?",
    answer: "Go to the 'Sub-Contractors' tab in your dashboard. Click 'Add Sub-Contractor' and enter their email address. They will receive an onboarding invitation link. Once they complete onboarding and KYC, they will appear in your Sub-Contractors list and can submit CWCRF requests linked to your company.",
  },
  {
    id: "epc-4",
    category: "EPC - Sub-Contractors",
    audience: "epc",
    question: "What is the CWCRF buyer verification step?",
    answer: "When a Sub-Contractor raises a CWCRF (Credit on Working Capital Request Form) citing your company as the buyer, Ops will forward it to you for buyer verification. In the 'CWC Requests' tab, you confirm the invoice amount, approve the declared amount, set the repayment timeline, and submit your buyer declaration. This is a mandatory compliance step.",
  },
  {
    id: "epc-5",
    category: "EPC - Invoices",
    audience: "epc",
    question: "What is the Invoice Review section for?",
    answer: "The Invoice Review section shows RA Bills (Running Account Bills) submitted by your Sub-Contractors for your verification. You need to confirm whether the work described on the bill has been completed and matches your records. You can approve or reject with notes. This helps validate the financing request.",
  },
  {
    id: "epc-6",
    category: "EPC - Invoices",
    audience: "epc",
    question: "A Sub-Contractor claims their invoice is ₹X but I disagree. What can I do?",
    answer: "In the Invoice Review section, you can reject the bill with a detailed note explaining the discrepancy. The Ops team will be notified and will mediate. Do NOT approve an incorrect amount — it affects the financing calculation for the Sub-Contractor and creates legal liability.",
  },
  {
    id: "epc-7",
    category: "EPC - Cases",
    audience: "epc",
    question: "What is a 'Case' in the Gryork platform?",
    answer: "A case is created after a CWCRF is approved and risk-assessed. It tracks the entire financing lifecycle: from NBFC bidding to fund disbursement and repayment. As the EPC buyer, your case shows the financing amount tied to your Sub-Contractor's invoice and the current repayment status.",
  },
  {
    id: "epc-8",
    category: "EPC - Bids",
    audience: "epc",
    question: "Do I (as EPC) have any involvement in the NBFC bidding process?",
    answer: "No — NBFC bidding happens between the Sub-Contractor and the NBFCs. As EPC, your role is limited to buyer verification (confirming the invoice and approved amount) and invoice review. The Sub-Contractor accepts or negotiates the NBFC bid independently.",
  },
  // NBFC Questions
  {
    id: "nbfc-1",
    category: "NBFC - LPS Settings",
    audience: "nbfc",
    question: "What is the Lending Parameters Setup (LPS)?",
    answer: "LPS allows your NBFC to define your financing preferences so Gryork can match you to suitable CWCRF cases. Parameters include: minimum and maximum loan amount, interest rate range, preferred tenure range, geographic preferences, and industry sectors you finance. Configure these in the 'LPS Settings' tab.",
  },
  {
    id: "nbfc-2",
    category: "NBFC - LPS Settings",
    audience: "nbfc",
    question: "How does Gryork match CWCRFs to our NBFC?",
    answer: "After the RMT team generates a CWCAF (Credit on Working Capital Assessment Form), suitable cases are shared with NBFCs whose LPS settings match the case parameters (amount, sector, risk level). Your NBFC receives a notification and the case appears in your 'Quotations' tab.",
  },
  {
    id: "nbfc-3",
    category: "NBFC - Quotations",
    audience: "nbfc",
    question: "How do I submit a quotation/bid for a CWCRF case?",
    answer: "In the 'Quotations' tab, you will see all cases shared with your NBFC. Click on a case to view the CWCAF — it contains the risk score, SC profile, EPC details, and invoice information. Submit your bid with: offer amount (₹), interest rate (%), tenure (days), and any conditions. The SC will then review and respond.",
  },
  {
    id: "nbfc-4",
    category: "NBFC - Quotations",
    audience: "nbfc",
    question: "What does the CWCAF contain?",
    answer: "The CWCAF (Credit on Working Capital Assessment Form) is generated by the RMT team and includes: Sub-Contractor company profile and KYC summary, EPC buyer details and verification status, invoice details, credit risk score (0–100), risk category (LOW/MEDIUM/HIGH), payment behavior assessment, legal compliance score, and the RMT's recommendation.",
  },
  {
    id: "nbfc-5",
    category: "NBFC - Quotations",
    audience: "nbfc",
    question: "What happens after the SC accepts our bid?",
    answer: "When the Sub-Contractor accepts your bid, the case moves to 'COMMERCIAL_LOCKED' status. Your NBFC will be notified to proceed with fund disbursement to the SC's registered bank account. Complete your internal due diligence and disburse within the agreed timeframe.",
  },
  // Common Questions
  {
    id: "common-1",
    category: "Platform",
    audience: "both",
    question: "How do I update my company profile or contact details?",
    answer: "Go to the 'Overview' tab and look for the profile edit option. Company details can be updated by submitting updated documents to Ops. For critical changes (bank account, GST number), please contact support with supporting documentation.",
  },
  {
    id: "common-2",
    category: "Platform",
    audience: "both",
    question: "I see a 'Pending Verification' status on my account. What does this mean?",
    answer: "Pending Verification means Ops is reviewing your submitted documents. This takes 2–4 business days. If it has been longer, please contact our support team with your registered email and company name.",
  },
  {
    id: "common-3",
    category: "Platform",
    audience: "both",
    question: "How do I raise an issue or report a discrepancy?",
    answer: "Use the 'Message Ops Team' option in the Contact Support section below. Describe the issue in detail — include case number, CWCRF number, or invoice number for faster resolution.",
  },
];

// ─── Chatbot Knowledge ────────────────────────────────────────────────────────

interface BotResponse {
  keywords: string[];
  response: string;
}

const BOT_KNOWLEDGE: BotResponse[] = [
  {
    keywords: ["document", "verify", "verification", "upload", "kyc", "registration", "certificate"],
    response: "For company verification, upload: Company Registration Certificate, GST Certificate, PAN Card, and bank proof. Verification typically takes 2–4 business days. Check the 'Documents' tab for upload status.",
  },
  {
    keywords: ["sub-contractor", "subcontractor", "add sc", "invite", "onboard"],
    response: "To add a Sub-Contractor: go to 'Sub-Contractors' tab → 'Add Sub-Contractor' → enter their email. They receive an invitation link to complete onboarding and KYC. Once verified, they can submit CWCRF requests linked to your EPC company.",
  },
  {
    keywords: ["cwcrf", "buyer verification", "cwc request", "approve invoice", "buyer declaration"],
    response: "CWCRF buyer verification: when a Sub-Contractor submits a financing request citing your company, you need to verify the invoice in the 'CWC Requests' tab. Confirm the approved amount, set the repayment timeline, and submit your buyer declaration. This is mandatory.",
  },
  {
    keywords: ["invoice", "bill", "review", "ra bill", "work completion", "reject"],
    response: "Invoice Review is for EPC companies to verify RA Bills submitted by Sub-Contractors. Approve if the work and amount are correct. Reject with notes if there's a discrepancy. Rejections are reviewed by the Ops team for mediation.",
  },
  {
    keywords: ["lps", "lending parameters", "lending preference", "finance preference", "min", "max", "interest"],
    response: "LPS (Lending Parameters Setup) lets your NBFC define financing preferences: min/max loan amount, interest rate range, preferred tenure, geographic and sector focus. Gryork uses these settings to match you with suitable CWCRF cases. Configure in the 'LPS Settings' tab.",
  },
  {
    keywords: ["quotation", "bid", "cwcaf", "assessment form", "risk score", "offer"],
    response: "In the 'Quotations' tab, review CWCAF documents shared with your NBFC. Each CWCAF includes a risk score, SC profile, EPC details, and invoice info. Submit your bid with offer amount, interest rate, and tenure. The Sub-Contractor will accept, negotiate, or reject.",
  },
  {
    keywords: ["case", "status", "stage", "track", "progress", "where"],
    response: "Cases track the full financing lifecycle: SUBMITTED → OPS_REVIEW → EPC_VERIFICATION → RMT_REVIEW → NBFC_BIDDING → COMMERCIAL_LOCKED → DISBURSED. Check the 'Cases' tab for real-time status.",
  },
  {
    keywords: ["accept", "disburs", "fund", "money", "transfer", "payment"],
    response: "After the SC accepts your NBFC bid, the case moves to COMMERCIAL_LOCKED. Your NBFC disburses funds to the SC's registered bank account. Complete your internal due diligence and disburse within the agreed timeframe.",
  },
  {
    keywords: ["profile", "update", "company", "gstin", "address", "contact"],
    response: "Update your company profile from the Overview tab. For critical changes (GST number, bank account), contact our support team with supporting documents. Minor contact detail changes can be done directly.",
  },
  {
    keywords: ["password", "login", "otp", "forgot", "reset", "access"],
    response: "For login issues: click 'Forgot Password' on the login page and enter your registered email for an OTP reset. Contact support at support@gryork.com if you continue to face access issues.",
  },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: "user" | "bot";
  text: string;
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

interface HelpCenterTabProps {
  userRole: "epc" | "nbfc";
}

const HelpCenterTab = ({ userRole }: HelpCenterTabProps) => {
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [faqSearch, setFaqSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "bot",
      text: `Hi! I'm Gryork's virtual assistant. I can help you with questions about ${
        userRole === "epc"
          ? "document verification, Sub-Contractor management, invoice review, and CWCRF buyer verification"
          : "LPS settings, CWCAF review, quotation submission, and case tracking"
      }.`,
    },
  ]);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [supportMsg, setSupportMsg] = useState("");
  const [sendingSupport, setSendingSupport] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const roleFilteredFaqs = FAQ_ITEMS.filter(
    (f) => f.audience === "both" || f.audience === userRole
  );
  const categories = ["All", ...Array.from(new Set(roleFilteredFaqs.map((f) => f.category)))];

  const filteredFaqs = roleFilteredFaqs.filter((f) => {
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

  const handleSend = () => {
    const text = chatInput.trim();
    if (!text) return;
    setChatMessages((prev) => [...prev, { id: Date.now().toString(), role: "user", text }]);
    setChatInput("");
    setIsBotTyping(true);
    setTimeout(() => {
      const response = getBotResponse(text);
      setChatMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "bot",
          text:
            response ||
            "I couldn't find a direct answer. Please browse the FAQ above or use the 'Message Ops Team' option below to get in touch with our support team.",
        },
      ]);
      setIsBotTyping(false);
    }, 800);
  };

  const handleSupportSubmit = async () => {
    if (!supportMsg.trim()) return;
    setSendingSupport(true);
    await new Promise((r) => setTimeout(r, 1200));
    alert("Message sent to Ops support! We'll respond within 1 business day.");
    setSupportMsg("");
    setShowContactForm(false);
    setSendingSupport(false);
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #4f46e5 0%, #0ea5e9 100%)",
          borderRadius: 16,
          padding: "24px 28px",
          color: "white",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: 24 }}>❓</span>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Help Center</h2>
        </div>
        <p style={{ color: "#c7d2fe", fontSize: 13, margin: 0 }}>
          {userRole === "epc"
            ? "Find answers about company verification, Sub-Contractor management, invoice review, and CWCRF processes."
            : "Find answers about LPS configuration, CWCAF review, quotations, and case management."}
        </p>
      </div>

      {/* FAQ Section */}
      <div className="help-section-card">
        <div className="help-section-header">
          <span>📖</span>
          <h3>Frequently Asked Questions</h3>
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: 12 }}>
          <input
            value={faqSearch}
            onChange={(e) => setFaqSearch(e.target.value)}
            placeholder="Search questions..."
            style={{
              width: "100%",
              padding: "10px 12px 10px 36px",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              fontSize: 14,
              boxSizing: "border-box",
              outline: "none",
            }}
          />
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 14 }}>🔍</span>
        </div>

        {/* Category filters */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              style={{
                padding: "4px 12px",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 500,
                border: "none",
                cursor: "pointer",
                background: activeFilter === cat ? "#4f46e5" : "#f1f5f9",
                color: activeFilter === cat ? "white" : "#64748b",
                transition: "all 0.15s",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ accordion */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {filteredFaqs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: "#94a3b8", fontSize: 13 }}>
              No matching questions found
            </div>
          ) : (
            filteredFaqs.map((item) => (
              <div
                key={item.id}
                style={{
                  border: `1px solid ${openFaq === item.id ? "#c7d2fe" : "#e2e8f0"}`,
                  borderRadius: 10,
                  overflow: "hidden",
                  background: openFaq === item.id ? "#f5f3ff" : "white",
                  transition: "all 0.15s",
                }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === item.id ? null : item.id)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "14px 16px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        background: "#e0e7ff",
                        color: "#4f46e5",
                        padding: "2px 8px",
                        borderRadius: 20,
                        whiteSpace: "nowrap",
                        marginTop: 2,
                      }}
                    >
                      {item.category.split("-").pop()?.trim()}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 500, color: "#1e293b" }}>{item.question}</span>
                  </div>
                  <span style={{ color: openFaq === item.id ? "#4f46e5" : "#94a3b8", fontSize: 16, flexShrink: 0 }}>
                    {openFaq === item.id ? "▲" : "▼"}
                  </span>
                </button>
                {openFaq === item.id && (
                  <div
                    style={{
                      padding: "0 16px 14px",
                      fontSize: 13,
                      color: "#475569",
                      lineHeight: 1.6,
                      borderTop: "1px solid #e0e7ff",
                      paddingTop: 12,
                    }}
                  >
                    {item.answer}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Virtual Assistant */}
      <div className="help-section-card">
        <div className="help-section-header">
          <span>🤖</span>
          <h3>Virtual Assistant</h3>
        </div>
        <p style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>
          Ask questions about {userRole === "epc" ? "verification, CWCRF processes, invoices, and Sub-Contractors" : "LPS settings, quotations, CWCAF, and cases"}.
        </p>

        {/* Chat messages */}
        <div
          style={{
            height: 272,
            overflowY: "auto",
            borderRadius: 12,
            border: "1px solid #e2e8f0",
            background: "#f8fafc",
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            marginBottom: 10,
          }}
        >
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: "flex",
                gap: 10,
                flexDirection: msg.role === "user" ? "row-reverse" : "row",
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background: msg.role === "bot" ? "#e0f2fe" : "#e0e7ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  flexShrink: 0,
                }}
              >
                {msg.role === "bot" ? "🤖" : "👤"}
              </div>
              <div
                style={{
                  maxWidth: "80%",
                  fontSize: 13,
                  lineHeight: 1.6,
                  borderRadius: 14,
                  padding: "10px 14px",
                  background: msg.role === "bot" ? "white" : "#4f46e5",
                  color: msg.role === "bot" ? "#374151" : "white",
                  border: msg.role === "bot" ? "1px solid #e2e8f0" : "none",
                  borderTopLeftRadius: msg.role === "bot" ? 4 : 14,
                  borderTopRightRadius: msg.role === "user" ? 4 : 14,
                }}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isBotTyping && (
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#e0f2fe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>🤖</div>
              <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 14, borderTopLeftRadius: 4, padding: "10px 14px", display: "flex", gap: 4, alignItems: "center" }}>
                <span style={{ width: 6, height: 6, background: "#94a3b8", borderRadius: "50%", animation: "bounce 0.6s infinite" }}></span>
                <span style={{ width: 6, height: 6, background: "#94a3b8", borderRadius: "50%", animation: "bounce 0.6s 0.15s infinite" }}></span>
                <span style={{ width: 6, height: 6, background: "#94a3b8", borderRadius: "50%", animation: "bounce 0.6s 0.3s infinite" }}></span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Type your question..."
            style={{
              flex: 1,
              padding: "10px 14px",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              fontSize: 14,
              outline: "none",
            }}
          />
          <button
            onClick={handleSend}
            disabled={!chatInput.trim()}
            style={{
              background: chatInput.trim() ? "#0ea5e9" : "#e2e8f0",
              color: chatInput.trim() ? "white" : "#94a3b8",
              border: "none",
              borderRadius: 8,
              padding: "10px 16px",
              cursor: chatInput.trim() ? "pointer" : "default",
              fontSize: 14,
              fontWeight: 600,
              transition: "all 0.15s",
            }}
          >
            ➤
          </button>
        </div>
      </div>

      {/* Contact Support */}
      <div className="help-section-card">
        <div className="help-section-header">
          <span>🎧</span>
          <h3>Contact Support</h3>
        </div>
        <p style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>
          Still need help? Our support team is available Mon–Sat, 10 AM – 6 PM IST.
        </p>

        {/* Call */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderRadius: 10, border: "1px solid #d1fae5", background: "#f0fdf4", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📞</div>
            <div>
              <p style={{ fontWeight: 600, fontSize: 14, margin: "0 0 2px", color: "#1e293b" }}>Call Us</p>
              <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>Mon–Sat · 10 AM – 6 PM IST</p>
            </div>
          </div>
          <a
            href="tel:+918000000000"
            style={{
              background: "#059669",
              color: "white",
              padding: "8px 16px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            📞 +91 80000 00000
          </a>
        </div>

        {/* Email */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderRadius: 10, border: "1px solid #bfdbfe", background: "#eff6ff", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#bfdbfe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>✉️</div>
            <div>
              <p style={{ fontWeight: 600, fontSize: 14, margin: "0 0 2px", color: "#1e293b" }}>Email Support</p>
              <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>Response within 1 business day</p>
            </div>
          </div>
          <a
            href="mailto:support@gryork.com"
            style={{
              background: "#2563eb",
              color: "white",
              padding: "8px 16px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            support@gryork.com
          </a>
        </div>

        {/* Chat with Ops */}
        <div style={{ padding: "14px 16px", borderRadius: 10, border: "1px solid #e0e7ff", background: "#eef2ff" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: showContactForm ? 12 : 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#e0e7ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>💬</div>
              <div>
                <p style={{ fontWeight: 600, fontSize: 14, margin: "0 0 2px", color: "#1e293b" }}>Message Ops Team</p>
                <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>Send a message directly to our operations team</p>
              </div>
            </div>
            <button
              onClick={() => setShowContactForm(!showContactForm)}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#4f46e5", padding: 4 }}
            >
              {showContactForm ? "✕" : "▼"}
            </button>
          </div>
          {showContactForm && (
            <div style={{ borderTop: "1px solid #c7d2fe", paddingTop: 12 }}>
              <textarea
                value={supportMsg}
                onChange={(e) => setSupportMsg(e.target.value)}
                placeholder="Describe your issue — include case number, CWCRF number, or invoice ID if relevant..."
                style={{
                  width: "100%",
                  minHeight: 96,
                  padding: "10px 12px",
                  border: "1px solid #c7d2fe",
                  borderRadius: 8,
                  fontSize: 13,
                  resize: "vertical",
                  background: "white",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8, gap: 8 }}>
                <button
                  onClick={handleSupportSubmit}
                  disabled={sendingSupport || !supportMsg.trim()}
                  style={{
                    background: sendingSupport || !supportMsg.trim() ? "#e0e7ff" : "#4f46e5",
                    color: sendingSupport || !supportMsg.trim() ? "#94a3b8" : "white",
                    border: "none",
                    borderRadius: 8,
                    padding: "9px 18px",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: sendingSupport || !supportMsg.trim() ? "default" : "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {sendingSupport ? "Sending..." : "Send to Ops ➤"}
                </button>
              </div>
              <p style={{ fontSize: 11, color: "#6b7280", marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
                ✅ Your message will be received by the Ops team and responded to within 1 business day.
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .help-section-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 20px 22px;
        }
        .help-section-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }
        .help-section-header span {
          font-size: 18px;
        }
        .help-section-header h3 {
          font-size: 15px;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
};

export default HelpCenterTab;
