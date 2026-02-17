import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// Auth
export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),
  register: (data: any) => api.post("/auth/register", data),
  getMe: () => api.get("/auth/me"),
};

// Sales
export const salesApi = {
  createLead: (data: any) => api.post("/sales/leads", data),
  getLeads: () => api.get("/sales/leads"),
  getSubContractors: () => api.get("/sales/subcontractors"),
  getDashboard: () => api.get("/sales/dashboard"),
  markContacted: (id: string, notes?: string) =>
    api.patch(`/sales/subcontractors/${id}/contacted`, { notes }),
};

// Ops
export const opsApi = {
  getPending: () => api.get("/ops/pending"),
  verifyCompany: (id: string, data: { decision: string; notes?: string }) =>
    api.post(`/ops/companies/${id}/verify`, data),
  verifyBill: (id: string, data: { decision: string; notes?: string }) =>
    api.post(`/ops/bills/${id}/verify`, data),
  requestKyc: (id: string, message: string) =>
    api.post(`/ops/kyc/${id}/request`, { message }),
  completeKyc: (id: string) => api.post(`/ops/kyc/${id}/complete`),
  
  // Bill Verification APIs
  getPendingBills: () => api.get("/ops/bills/pending"),
  getBillDetails: (id: string) => api.get(`/ops/bills/${id}`),
  addBillNote: (id: string, data: { text: string }) => 
    api.post(`/ops/bills/${id}/notes`, data),
  
  // KYC Verification APIs
  getPendingKyc: () => api.get("/ops/kyc/pending"),
  getSellerKyc: (id: string) => api.get(`/ops/kyc/${id}`),
  verifyKyc: (id: string, data: { decision: string; notes?: string }) =>
    api.post(`/ops/kyc/${id}/verify`, data),
  verifyKycDocument: (id: string, data: { decision: string; notes?: string }) =>
    api.post(`/ops/kyc/documents/${id}/verify`, data),
  getKycChat: (id: string) => api.get(`/ops/kyc/${id}/chat`),
  sendKycMessage: (id: string, data: { message: string; replyTo?: string }) =>
    api.post(`/ops/kyc/${id}/chat`, data),
  editKycMessage: (messageId: string, data: { message: string }) =>
    api.put(`/ops/chat/${messageId}`, data),
  deleteKycMessage: (messageId: string) =>
    api.delete(`/ops/chat/${messageId}`),
  addKycReaction: (messageId: string, emoji: string) =>
    api.post(`/ops/chat/${messageId}/reaction`, { emoji }),
  
  // Enhanced Chat API
  getChatMessages: (id: string, params?: { since?: string; limit?: number }) => 
    api.get(`/ops/kyc/${id}/chat`, { params }),
  sendChatMessage: (id: string, data: FormData) =>
    api.post(`/ops/kyc/${id}/chat`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  markMessagesAsRead: (id: string) => 
    api.post(`/ops/kyc/${id}/chat/read`),
  getUnreadCount: (id: string) => 
    api.get(`/ops/kyc/${id}/chat/unread`),
  searchMessages: (id: string, query: string) => 
    api.get(`/ops/kyc/${id}/chat/search`, { params: { q: query } }),
  addReaction: (messageId: string, emoji: string) => 
    api.post(`/ops/chat/${messageId}/reaction`, { emoji }),
  removeReaction: (messageId: string, emoji: string) => 
    api.delete(`/ops/chat/${messageId}/reaction`, { data: { emoji } }),
  editMessage: (messageId: string, content: string) => 
    api.put(`/ops/chat/${messageId}`, { content }),
  deleteMessage: (messageId: string) => 
    api.delete(`/ops/chat/${messageId}`),
  resolveAction: (messageId: string) => 
    api.post(`/ops/chat/${messageId}/resolve`),

  // SLA Tracking APIs
  getSlaItems: (params?: { type?: string; status?: string; priority?: string }) =>
    api.get("/ops/sla", { params }),
  getSlaStats: () => api.get("/ops/sla/stats"),
  getTeamWorkload: () => api.get("/ops/team/workload"),

  // Documents
  getCompanyDocuments: (id: string) =>
    api.get(`/ops/companies/${id}/documents`),
  verifyDocument: (id: string, data: { decision: string; notes?: string }) =>
    api.post(`/ops/documents/${id}/verify`, data),

  // NBFC
  inviteNbfc: (data: Record<string, unknown>) => api.post("/ops/nbfc/invite", data),
};

// Cases
export const casesApi = {
  getCases: (params?: any) => api.get("/cases", { params }),
  getCase: (id: string) => api.get(`/cases/${id}`),
};

// Bids
export const bidsApi = {
  getBidsForCase: (caseId: string) => api.get(`/bids/case/${caseId}`),
};

// RMT - Risk Management Team
export const rmtApi = {
  getPendingCases: () => api.get("/cases/rmt/pending"),
  submitRiskAssessment: (
    caseId: string,
    data: {
      riskScore: number;
      riskLevel: "low" | "medium" | "high" | "critical";
      assessment: string;
      recommendation: "approve" | "reject" | "needs_review";
      notes?: string;
    },
  ) => api.post(`/cases/${caseId}/risk-assessment`, data),
};

// CWCRF/CWCAF APIs for RMT
export const cwcrfApi = {
  // Get CWCRFs in RMT queue
  getRmtQueue: () => api.get("/cwcrf/rmt/queue"),

  // Generate CWCAF for a CWCRF
  generateCwcaf: (
    cwcrfId: string,
    cwcafData: {
      sellerProfileSummary: {
        businessAge: number;
        totalTransactions: number;
        averageInvoiceValue: number;
        repaymentHistory: string;
      };
      riskAssessmentDetails: {
        invoiceAging: { score: number; remarks: string };
        buyerCreditworthiness: { score: number; remarks: string };
        sellerTrackRecord: { score: number; remarks: string };
        collateralCoverage: { score: number; remarks: string };
      };
      riskCategory: "LOW" | "MEDIUM" | "HIGH";
      rmtRecommendation: string;
    },
  ) => api.post(`/cwcrf/${cwcrfId}/rmt/generate-cwcaf`, cwcafData),

  // Get CWCAF details
  getCwcaf: (cwcrfId: string) => api.get(`/cwcrf/${cwcrfId}/cwcaf`),

  // Share with NBFCs
  shareWithNbfcs: (cwcrfId: string, nbfcIds: string[]) =>
    api.post(`/cwcrf/${cwcrfId}/share-with-nbfcs`, { nbfcIds }),

  // Get matching NBFCs for a CWCRF
  getMatchingNbfcs: (cwcrfId: string) =>
    api.get(`/cwcrf/${cwcrfId}/matching-nbfcs`),

  // Move CWCRF to NBFC process
  moveToNbfcProcess: (cwcrfId: string, nbfcId: string) =>
    api.post(`/cwcrf/${cwcrfId}/move-to-nbfc-process`, { nbfcId }),
};

// Admin - User Management
export const adminApi = {
  getUsers: (params?: { role?: string; isActive?: boolean; search?: string }) =>
    api.get("/admin/users", { params }),
  getUser: (id: string) => api.get(`/admin/users/${id}`),
  createUser: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role: string;
  }) => api.post("/admin/users", data),
  updateUser: (
    id: string,
    data: {
      name?: string;
      email?: string;
      phone?: string;
      role?: string;
      isActive?: boolean;
      password?: string;
    },
  ) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  restoreUser: (id: string) => api.post(`/admin/users/${id}/restore`),
  getStats: () => api.get("/admin/stats"),
};

// Risk Assessment
export const riskAssessmentApi = {
  getDashboard: () => api.get("/risk-assessment/dashboard"),
  getPending: () => api.get("/risk-assessment/pending"),
  getById: (id: string) => api.get(`/risk-assessment/${id}`),
  getBySeller: (sellerId: string) =>
    api.get(`/risk-assessment/seller/${sellerId}`),
  create: (sellerId: string) => api.post("/risk-assessment", { sellerId }),
  updateChecklist: (
    id: string,
    item: string,
    data: { verified: boolean; notes?: string },
  ) => api.put(`/risk-assessment/${id}/checklist/${item}`, data),
  complete: (id: string, decision: "APPROVE" | "REJECT", notes?: string) =>
    api.post(`/risk-assessment/${id}/complete`, { decision, notes }),
};

// Approvals
export const approvalApi = {
  getMyPending: () => api.get("/approvals/my-pending"),
  getPendingCount: () => api.get("/approvals/pending-count"),
  getAll: (params?: { status?: string; requestType?: string }) =>
    api.get("/approvals", { params }),
  getById: (id: string) => api.get(`/approvals/${id}`),
  approve: (id: string, comments?: string) =>
    api.post(`/approvals/${id}/approve`, { comments }),
  reject: (id: string, comments?: string) =>
    api.post(`/approvals/${id}/reject`, { comments }),
  escalate: (id: string, reason: string) =>
    api.post(`/approvals/${id}/escalate`, { reason }),
};

// SLA
export const slaApi = {
  getDashboard: () => api.get("/sla/dashboard"),
  getActive: () => api.get("/sla/active"),
  getOverdue: () => api.get("/sla/overdue"),
  getByCase: (caseId: string) => api.get(`/sla/case/${caseId}`),
  completeMilestone: (id: string, milestone: string) =>
    api.post(`/sla/${id}/milestone/${milestone}/complete`),
};

// Blacklist
export const blacklistApi = {
  check: (data: { pan?: string; gstin?: string; email?: string }) =>
    api.post("/blacklist/check", data),
  report: (data: any) => api.post("/blacklist/report", data),
  getAll: (params?: { status?: string }) => api.get("/blacklist", { params }),
  getPending: () => api.get("/blacklist/pending"),
  approve: (id: string, notes?: string) =>
    api.post(`/blacklist/${id}/approve`, { notes }),
  reject: (id: string, notes?: string) =>
    api.post(`/blacklist/${id}/reject`, { notes }),
  revoke: (id: string, reason: string) =>
    api.post(`/blacklist/${id}/revoke`, { reason }),
};

// Transactions
export const transactionApi = {
  getAll: (params?: { status?: string }) =>
    api.get("/transactions", { params }),
  getById: (id: string) => api.get(`/transactions/${id}`),
  getOverdue: () => api.get("/transactions/overdue"),
  setupEscrow: (id: string, data: any) =>
    api.post(`/transactions/${id}/escrow`, data),
  disburse: (id: string, data: any) =>
    api.post(`/transactions/${id}/disburse`, data),
  trackRepayment: (id: string, data: any) =>
    api.post(`/transactions/${id}/repayment`, data),
};

// NBFC Management (Admin)
export const nbfcApi = {
  getAll: () => api.get("/nbfc"),
  getById: (id: string) => api.get(`/nbfc/${id}`),
  create: (data: any) => api.post("/nbfc", data),
  update: (id: string, data: any) => api.put(`/nbfc/${id}`, data),
  matchForCase: (caseId: string) => api.get(`/nbfc/match/${caseId}`),
  shareCase: (caseId: string, nbfcIds: string[]) =>
    api.post(`/nbfc/share/${caseId}`, { nbfcIds }),
};

// Agent Management (SOP Section 11)
export const agentApi = {
  getAll: () => api.get("/agents"),
  getById: (id: string) => api.get(`/agents/${id}`),
  create: (data: any) => api.post("/agents", data),
  getDashboard: () => api.get("/agents/dashboard"),
  introduceEpc: (agentId: string, companyId: string) =>
    api.post(`/agents/${agentId}/introduce-epc`, { companyId }),
  processCommission: (transactionId: string) =>
    api.post(`/agents/process-commission/${transactionId}`),
  markCommissionPaid: (
    agentId: string,
    commissionIndex: number,
    paymentRef: string,
  ) =>
    api.post(`/agents/${agentId}/commission/${commissionIndex}/pay`, {
      paymentRef,
    }),
  reportMisconduct: (
    agentId: string,
    type: string,
    description: string,
    evidence?: string[],
  ) =>
    api.post(`/agents/${agentId}/misconduct`, { type, description, evidence }),
  handleMisconductDecision: (
    agentId: string,
    misconductIndex: number,
    decision: string,
    action: string,
  ) =>
    api.post(`/agents/${agentId}/misconduct/${misconductIndex}/decision`, {
      decision,
      action,
    }),
};

// Re-KYC (SOP Section 8)
export const rekycApi = {
  getPending: (entityType?: string) =>
    api.get("/rekyc/pending", { params: { entityType } }),
  getExpiring: (days?: number) =>
    api.get("/rekyc/expiring", { params: { days } }),
  getTriggers: () => api.get("/rekyc/triggers"),
  triggerCompany: (companyId: string, trigger: string, details?: any) =>
    api.post(`/rekyc/trigger/company/${companyId}`, { trigger, details }),
  triggerSubContractor: (scId: string, trigger: string, details?: any) =>
    api.post(`/rekyc/trigger/subcontractor/${scId}`, { trigger, details }),
  nbfcRequest: (entityType: string, entityId: string, reason: string) =>
    api.post("/rekyc/nbfc-request", { entityType, entityId, reason }),
  complete: (entityType: string, entityId: string, documents?: string[]) =>
    api.post(`/rekyc/complete/${entityType}/${entityId}`, { documents }),
};

// Audit Logs
export const auditApi = {
  getLogs: (params?: {
    page?: number;
    limit?: number;
    userId?: string;
    action?: string;
    category?: string;
    entityType?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    success?: boolean;
  }) => api.get("/audit", { params }),
  getStats: (days?: number) => api.get("/audit/stats", { params: { days } }),
  getById: (id: string) => api.get(`/audit/${id}`),
  getEntityLogs: (entityType: string, entityId: string, params?: { page?: number; limit?: number }) =>
    api.get(`/audit/entity/${entityType}/${entityId}`, { params }),
  getUserTimeline: (userId: string, params?: { page?: number; limit?: number }) =>
    api.get(`/audit/user/${userId}/timeline`, { params }),
  exportLogs: (params?: { startDate?: string; endDate?: string; category?: string; format?: string }) =>
    api.get("/audit/export", { params }),
};

// Cron Jobs (Admin)
export const cronApi = {
  getStatus: () => api.get("/cron/status"),
  runDormant: () => api.post("/cron/run/dormant"),
  runSlaReminders: () => api.post("/cron/run/sla-reminders"),
  runKycExpiry: () => api.post("/cron/run/kyc-expiry"),
  runOverdueNotifications: () => api.post("/cron/run/overdue-notifications"),
  runActualOverdue: () => api.post("/cron/run/actual-overdue"),
  runAll: () => api.post("/cron/run/all"),
};

export { api };

export default api;
