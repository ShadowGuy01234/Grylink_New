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
<<<<<<< HEAD
  createLead: (data: any) => api.post('/sales/leads', data),
  getLeads: () => api.get('/sales/leads'),
  getSubContractors: () => api.get('/sales/subcontractors'),
  getDashboard: () => api.get('/sales/dashboard'),
  markContacted: (id: string, notes?: string) => api.patch(`/sales/subcontractors/${id}/contacted`, { notes }),
=======
  createLead: (data: any) => api.post("/sales/leads", data),
  getLeads: () => api.get("/sales/leads"),
  getSubContractors: () => api.get("/sales/subcontractors"),
  getDashboard: () => api.get("/sales/dashboard"),
>>>>>>> 27b58c6ff018f59e5a590604941825bf4f863de5
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
  
  // NBFC
  inviteNbfc: (data: any) => api.post('/ops/nbfc/invite', data),
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

export default api;
