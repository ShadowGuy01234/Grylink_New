function createPrompt(id, text, intent) {
  return {
    id,
    text,
    intent,
  };
}

const ROLE_PROMPTS = {
  subcontractor: [
    createPrompt("sub_onboard_docs", "What documents do I need to start invoice financing?", "onboarding"),
    createPrompt("sub_upload_invoice", "How do I upload an invoice and supporting documents?", "workflow"),
    createPrompt("sub_track_payment", "How can I track my disbursement and repayment status?", "tracking"),
  ],
  epc: [
    createPrompt("epc_approve_invoice", "How do I review and approve subcontractor invoices?", "approval"),
    createPrompt("epc_log_process", "Explain Letter of Guarantee flow in simple steps.", "workflow"),
    createPrompt("epc_risk_flags", "What risk flags should I watch during invoice validation?", "risk"),
  ],
  nbfc: [
    createPrompt("nbfc_risk_review", "Show me the risk assessment checkpoints before disbursement.", "risk"),
    createPrompt("nbfc_collections", "What is the repayment and collections process?", "collections"),
    createPrompt("nbfc_default_protocol", "What happens when an account defaults?", "policy"),
  ],
  admin: [
    createPrompt("admin_audit", "How can I audit all chatbot and user activity?", "audit"),
    createPrompt("admin_approvals", "Explain approval request routing for operations.", "approval"),
    createPrompt("admin_security", "How does the platform protect sensitive user data?", "security"),
  ],
  ops: [
    createPrompt("ops_failed_upload", "A user cannot upload a file. What should I check first?", "support"),
    createPrompt("ops_case_followup", "How should I move a case from pending to resolved?", "workflow"),
    createPrompt("ops_dispute", "What are the standard steps for invoice dispute resolution?", "policy"),
  ],
  sales: [
    createPrompt("sales_pitch", "Give me a quick platform pitch for EPC companies.", "sales"),
    createPrompt("sales_roi", "How does GryLink improve working capital turnaround?", "value"),
    createPrompt("sales_objections", "How should I answer common NBFC onboarding objections?", "sales"),
  ],
  public: [
    createPrompt("pub_start", "I am new. How do I start using GryLink?", "onboarding"),
    createPrompt("pub_roles", "What are EPC, subcontractor, and NBFC roles on the platform?", "education"),
    createPrompt("pub_security", "Is my financial data secure on this platform?", "security"),
  ],
};

function getRolePrompts(userRole) {
  const role = String(userRole || "public").toLowerCase();
  return ROLE_PROMPTS[role] || ROLE_PROMPTS.public;
}

function buildProactiveResponse(userRole, currentPrompt = "") {
  const prompts = getRolePrompts(userRole);

  if (!currentPrompt) {
    return {
      reason: "initial",
      prompts,
    };
  }

  const text = String(currentPrompt).toLowerCase();
  if (text.includes("invoice") || text.includes("payment") || text.includes("disbursement")) {
    return {
      reason: "financial_context",
      prompts: prompts.filter((item) => ["workflow", "tracking", "risk"].includes(item.intent)).slice(0, 3),
    };
  }

  if (text.includes("risk") || text.includes("default") || text.includes("fraud")) {
    return {
      reason: "risk_context",
      prompts: prompts.filter((item) => ["risk", "policy", "security"].includes(item.intent)).slice(0, 3),
    };
  }

  return {
    reason: "role_default",
    prompts,
  };
}

module.exports = {
  buildProactiveResponse,
  getRolePrompts,
};
