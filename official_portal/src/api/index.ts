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
  getMe: () => api.get("/auth/me"),
};

// Sales
export const salesApi = {
  // Dashboard
  getDashboard: () => api.get("/sales/dashboard"),

  // Company Leads
  createLead: (data: any) => api.post("/sales/leads", data),
  getLeads: (params?: { search?: string; status?: string }) => api.get("/sales/leads", { params }),
  getLeadDetail: (id: string) => api.get(`/sales/leads/${id}`),
  getLeadSubContractors: (id: string) => api.get(`/sales/leads/${id}/subcontractors`),
  addCompanyNote: (id: string, note: string) => api.post(`/sales/leads/${id}/notes`, { note }),
  resendCompanyLink: (id: string) => api.post(`/sales/leads/${id}/resend-link`),

  // Sub-Contractors
  getSubContractors: (params?: { search?: string; status?: string; kycStatus?: string }) =>
    api.get("/sales/subcontractors", { params }),
  getSubContractorDetail: (id: string) => api.get(`/sales/subcontractors/${id}`),
  markContacted: (id: string, notes?: string) =>
    api.patch(`/sales/subcontractors/${id}/contacted`, { notes }),
  addContactLog: (id: string, data: { method: string; outcome?: string; notes?: string }) =>
    api.post(`/sales/subcontractors/${id}/contact-log`, data),

  // GryLinks
  getGryLinks: (params?: { status?: string; linkType?: string }) => api.get("/sales/grylinks", { params }),
  resendGryLink: (id: string) => api.post(`/sales/grylinks/${id}/resend`),
};

// Ops
export const opsApi = {
  getSubContractors: () => api.get("/ops/subcontractors"),
  getPending: () => api.get("/ops/pending"),
  verifyCompany: (id: string, data: { decision: string; notes?: string }) =>
    api.post(`/ops/companies/${id}/verify`, data),
  verifyBill: (id: string, data: { decision: string; notes?: string }) =>
    api.post(`/ops/bills/${id}/verify`, data),
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
  verifyBankDetails: (id: string, data: { decision: string; notes?: string }) =>
    api.post(`/ops/kyc/${id}/verify-bank-details`, data),
  requestAdditionalDoc: (id: string, data: { label: string; description?: string }) =>
    api.post(`/ops/kyc/${id}/request-additional`, data),
  verifyAdditionalDoc: (sellerId: string, docId: string, data: { decision: string; notes?: string }) =>
    api.post(`/ops/kyc/${sellerId}/verify-additional/${docId}`, data),

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

  // CWCRF Queue — Phase 6 (SUBMITTED/OPS_REVIEW) + Phase 8 (RMT_APPROVED triage) + Phase 10 (EPC_VERIFIED → NBFC dispatch)
  getCwcrfQueue: () => api.get("/cwcrf/ops/queue"),
  getCwcrfTriageQueue: () => api.get("/cwcrf/ops/queue?phase=triage"),
  getCwcrfNbfcQueue: () => api.get("/cwcrf/ops/queue?phase=epc_verified"),
  forwardCwcrfToRmt: (id: string, notes?: string) =>
    api.post(`/cwcrf/${id}/rmt/move-to-queue`, { notes }),
  verifyCwcrfSection: (id: string, data: { section: string; verified: boolean; notes?: string }) =>
    api.post(`/cwcrf/${id}/ops/verify-section`, data),
  detachCwcrfField: (id: string, data: { section: string; field: string; reason?: string }) =>
    api.post(`/cwcrf/${id}/ops/detach-field`, data),
  editCwcrfField: (id: string, data: { section: string; field: string; newValue: unknown; reason?: string }) =>
    api.patch(`/cwcrf/${id}/ops/edit-field`, data),
  reRequestFromSc: (id: string, data: { message: string; section?: string }) =>
    api.post(`/cwcrf/${id}/ops/re-request`, data),
  triageCwcrf: (id: string, data: { action: 'forward_to_epc' | 'reject'; notes?: string }) =>
    api.post(`/cwcrf/${id}/ops/triage`, data),
  getMatchingNbfcs: (cwcrfId: string) =>
    api.get(`/cwcrf/${cwcrfId}/matching-nbfcs`),
  shareWithNbfcs: (cwcrfId: string, nbfcIds?: string[]) =>
    api.post(`/cwcrf/${cwcrfId}/share-with-nbfcs`, { nbfcIds }),
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

// CWCRF/CWCAF APIs for RMT
export const cwcrfApi = {
  // Get CWCRFs in RMT queue
  getRmtQueue: () => api.get("/cwcrf/rmt/queue"),

  // Download full case as PDF (Phase 7.2)
  downloadCasePdf: (cwcrfId: string) =>
    api.get(`/cwcrf/${cwcrfId}/pdf`, { responseType: "blob" }),

  // Generate CWCAF for a CWCRF — Ops & RMT (Phase 10.1)
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
      rmtRecommendation: "PROCEED" | "REVIEW" | "REJECT";
      rmtNotes?: string;
    },
  ) => api.post(`/cwcrf/${cwcrfId}/rmt/generate-cwcaf`, cwcafData),

  // RMT forwards assessment to Ops (Phase 7.5)
  rmtForwardToOps: (cwcrfId: string, notes?: string) =>
    api.post(`/cwcrf/${cwcrfId}/rmt/forward-to-ops`, { notes }),

  // Get CWCAF details
  getCwcaf: (cwcrfId: string) => api.get(`/cwcrf/${cwcrfId}/cwcaf`),
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

// Transactions
export const transactionApi = {
  getOverdue: () => api.get("/transactions/overdue"),
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
