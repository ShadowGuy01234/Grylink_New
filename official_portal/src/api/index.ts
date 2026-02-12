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
  markContacted: (id: string, notes?: string) => api.patch(`/sales/subcontractors/${id}/contacted`, { notes }),
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
  getChatMessages: (id: string) => api.get(`/ops/kyc/${id}/chat`),
  sendChatMessage: (id: string, data: FormData) =>
    api.post(`/ops/kyc/${id}/chat`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // Documents
  getCompanyDocuments: (id: string) =>
    api.get(`/ops/companies/${id}/documents`),
  verifyDocument: (id: string, data: { decision: string; notes?: string }) =>
    api.post(`/ops/documents/${id}/verify`, data),
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
  getBySeller: (sellerId: string) => api.get(`/risk-assessment/seller/${sellerId}`),
  create: (sellerId: string) => api.post("/risk-assessment", { sellerId }),
  updateChecklist: (id: string, item: string, data: { verified: boolean; notes?: string }) =>
    api.put(`/risk-assessment/${id}/checklist/${item}`, data),
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
  getAll: (params?: { status?: string }) => api.get("/transactions", { params }),
  getById: (id: string) => api.get(`/transactions/${id}`),
  getOverdue: () => api.get("/transactions/overdue"),
  setupEscrow: (id: string, data: any) => api.post(`/transactions/${id}/escrow`, data),
  disburse: (id: string, data: any) => api.post(`/transactions/${id}/disburse`, data),
  trackRepayment: (id: string, data: any) => api.post(`/transactions/${id}/repayment`, data),
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

export { api };

export default api;
