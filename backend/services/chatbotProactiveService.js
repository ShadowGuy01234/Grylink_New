function createPrompt(id, text, intent, category, roles = ["all"]) {
  return {
    id,
    text,
    intent,
    category,
    roles,
  };
}

const PROMPT_CATALOG = [
  createPrompt("platform_get_started", "How do I get started on GryLink as a new user?", "onboarding", "platform", ["all"]),
  createPrompt("platform_roles", "What are EPC, subcontractor, and NBFC roles on this platform?", "education", "platform", ["all"]),
  createPrompt("platform_docs", "What KYC and business documents are mandatory before activation?", "onboarding", "platform", ["all"]),
  createPrompt("platform_workflow", "Explain the full invoice-to-disbursement workflow in simple steps.", "workflow", "platform", ["all"]),

  createPrompt("finance_disbursement_eta", "How long does disbursement usually take after approvals?", "tracking", "finance", ["subcontractor", "epc", "nbfc", "ops"]),
  createPrompt("finance_repayment", "How can I track repayment schedule and overdue amounts?", "tracking", "finance", ["subcontractor", "nbfc", "ops"]),
  createPrompt("finance_ra_bill", "How is RA bill verification handled before funding release?", "workflow", "finance", ["subcontractor", "epc", "ops"]),
  createPrompt("finance_fees", "What charges or deductions should users expect in the financing cycle?", "policy", "finance", ["subcontractor", "epc", "nbfc", "sales"]),

  createPrompt("wf_upload_invoice", "How do I upload invoice and supporting files correctly?", "workflow", "workflow", ["subcontractor", "ops"]),
  createPrompt("wf_epc_approval", "How does EPC approval routing work for submitted invoices?", "approval", "workflow", ["epc", "ops", "admin"]),
  createPrompt("wf_nbfc_review", "What checks does NBFC perform before approving a case?", "risk", "workflow", ["nbfc", "ops", "admin"]),
  createPrompt("wf_action_required", "Case is in Action Required state. What should I do next?", "support", "workflow", ["subcontractor", "epc", "ops"]),

  createPrompt("risk_red_flags", "What are major risk red flags in subcontractor cases?", "risk", "risk", ["nbfc", "ops", "admin"]),
  createPrompt("risk_default", "What happens when repayment defaults occur?", "policy", "risk", ["nbfc", "ops", "admin"]),
  createPrompt("risk_rekyc", "When is re-KYC required and what triggers it?", "policy", "risk", ["ops", "admin", "subcontractor", "epc"]),
  createPrompt("risk_blacklist", "How does blacklist verification impact approvals?", "risk", "risk", ["ops", "admin", "nbfc"]),

  createPrompt("security_data", "How is user financial data protected in storage and transit?", "security", "security", ["all"]),
  createPrompt("security_pii", "How does the chatbot detect and mask sensitive PII values?", "security", "security", ["all"]),
  createPrompt("security_rate_limit", "What rate limits apply to chatbot usage and feedback APIs?", "security", "security", ["all"]),
  createPrompt("security_audit_logs", "How can admins review chatbot security events and audit logs?", "audit", "security", ["admin", "founder", "ops"]),

  createPrompt("support_upload_fail", "File upload fails repeatedly. What are the first troubleshooting checks?", "support", "troubleshooting", ["subcontractor", "ops", "epc"]),
  createPrompt("support_no_answer", "Chatbot gave a fallback response. How do I refine my question?", "support", "troubleshooting", ["all"]),
  createPrompt("support_session", "How can I continue the same chat session after refresh?", "support", "troubleshooting", ["all"]),
  createPrompt("support_feedback", "How do negative feedback reasons improve future chatbot answers?", "support", "troubleshooting", ["all"]),

  createPrompt("sales_pitch_epc", "Give me a short value pitch for EPC stakeholders.", "sales", "sales", ["sales", "admin", "founder"]),
  createPrompt("sales_pitch_nbfc", "How does GryLink help NBFC partners reduce turnaround time?", "value", "sales", ["sales", "admin", "founder"]),
  createPrompt("sales_objections", "How should we answer common onboarding objections from partners?", "sales", "sales", ["sales", "admin", "founder"]),
  createPrompt("sales_roi", "What ROI angles work best while explaining GryLink to prospects?", "value", "sales", ["sales", "admin", "founder"]),
];

const DEFAULT_ROLE = "public";

function isPromptAllowedForRole(prompt, role) {
  const roles = Array.isArray(prompt.roles) ? prompt.roles : ["all"];
  return roles.includes("all") || roles.includes(role);
}

function dedupePrompts(prompts) {
  const unique = new Map();

  for (const prompt of prompts) {
    if (!prompt?.id) continue;
    if (!unique.has(prompt.id)) {
      unique.set(prompt.id, prompt);
    }
  }

  return Array.from(unique.values());
}

function rankPromptForRole(prompt, role) {
  const roles = Array.isArray(prompt.roles) ? prompt.roles : [];
  if (roles.includes(role)) return 2;
  if (roles.includes("all")) return 1;
  return 0;
}

function selectByCategory(prompts, categories, limit) {
  const normalizedCategories = categories.map((item) => String(item || "").toLowerCase());
  const matched = prompts.filter((prompt) =>
    normalizedCategories.includes(String(prompt.category || "").toLowerCase()),
  );

  if (matched.length >= limit) {
    return matched.slice(0, limit);
  }

  const fallback = prompts.filter((prompt) => !matched.find((item) => item.id === prompt.id));
  return [...matched, ...fallback].slice(0, limit);
}

function getRolePrompts(userRole, limit = 10) {
  const role = String(userRole || DEFAULT_ROLE).toLowerCase();
  const safeLimit = Math.max(2, Math.min(24, Number(limit) || 10));

  const filtered = PROMPT_CATALOG.filter((prompt) => isPromptAllowedForRole(prompt, role));
  const ranked = filtered.sort((a, b) => {
    const aRank = rankPromptForRole(a, role);
    const bRank = rankPromptForRole(b, role);
    return bRank - aRank;
  });

  return dedupePrompts(ranked).slice(0, safeLimit);
}

function buildProactiveResponse(userRole, currentPrompt = "") {
  const prompts = getRolePrompts(userRole, 12);

  if (!currentPrompt) {
    return {
      reason: "initial",
      prompts: prompts.slice(0, 6),
    };
  }

  const text = String(currentPrompt).toLowerCase();
  if (
    text.includes("invoice") ||
    text.includes("payment") ||
    text.includes("disbursement") ||
    text.includes("repayment") ||
    text.includes("fund")
  ) {
    return {
      reason: "financial_context",
      prompts: selectByCategory(prompts, ["finance", "workflow", "risk"], 4),
    };
  }

  if (
    text.includes("risk") ||
    text.includes("default") ||
    text.includes("fraud") ||
    text.includes("compliance")
  ) {
    return {
      reason: "risk_context",
      prompts: selectByCategory(prompts, ["risk", "security", "workflow"], 4),
    };
  }

  if (
    text.includes("error") ||
    text.includes("failed") ||
    text.includes("issue") ||
    text.includes("support")
  ) {
    return {
      reason: "troubleshooting_context",
      prompts: selectByCategory(prompts, ["troubleshooting", "workflow", "platform"], 4),
    };
  }

  if (text.includes("secure") || text.includes("privacy") || text.includes("pii")) {
    return {
      reason: "security_context",
      prompts: selectByCategory(prompts, ["security", "risk"], 4),
    };
  }

  return {
    reason: "role_default",
    prompts: prompts.slice(0, 6),
  };
}

module.exports = {
  buildProactiveResponse,
  getRolePrompts,
};
