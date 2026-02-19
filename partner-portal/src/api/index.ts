import axios, { AxiosError } from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({ baseURL: API_URL });

// Request interceptor - add token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor - handle 401
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// ============= Auth APIs =============
export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
};

// ============= Company (EPC) APIs =============
export const companyApi = {
  getProfile: () => api.get("/company/profile"),
  uploadDocuments: (data: FormData) =>
    api.post("/company/documents", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  addSubContractors: (subContractors: any[]) =>
    api.post("/company/subcontractors", { subContractors }),
  bulkAddSubContractors: (data: FormData) =>
    api.post("/company/subcontractors/bulk", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getSubContractors: () => api.get("/company/subcontractors"),
  deleteSubContractor: (id: string) =>
    api.delete(`/company/subcontractors/${id}`),
  // Bill review (EPC verifies OPS_APPROVED bills)
  getBillsForReview: () => api.get("/company/bills/pending-review"),
  verifyBill: (id: string, data: { decision: string; notes?: string }) =>
    api.post(`/company/bills/${id}/verify`, data),
};

// ============= Cases APIs =============
export const casesApi = {
  getCases: (params?: any) => api.get("/cases", { params }),
  getCase: (id: string) => api.get(`/cases/${id}`),
  reviewCase: (id: string, data: { decision: string; notes?: string }) =>
    api.post(`/cases/${id}/review`, data),
};

// ============= Bids APIs =============
export const bidsApi = {
  placeBid: (data: any) => api.post("/bids", data),
  getBid: (id: string) => api.get(`/bids/${id}`),
  getMyBids: () => api.get("/bids/my"),
  negotiate: (id: string, counterOffer: any) =>
    api.post(`/bids/${id}/negotiate`, { counterOffer }),
  lockBid: (id: string) => api.post(`/bids/${id}/lock`),
  getBidsForCase: (caseId: string) => api.get(`/bids/case/${caseId}`),
};

// ============= NBFC APIs =============
export const nbfcApi = {
  getDashboard: () => api.get("/nbfc/dashboard"),
  getCases: () => api.get("/nbfc/cases"),
  respondToCase: (caseId: string, data: any) =>
    api.post(`/nbfc/${caseId}/respond`, data),
  getTransactions: () => api.get("/transactions"),
  requestReKyc: (entityType: string, entityId: string, reason: string) =>
    api.post("/rekyc/nbfc-request", { entityType, entityId, reason }),
  // LPS Management
  getLps: () => api.get("/nbfc/lps"),
  updateLps: (lpsData: any) => api.put("/nbfc/lps", lpsData),
};

// ============= CWCRF APIs (EPC Buyer Verification) =============
export const cwcrfApi = {
  // For EPC/Buyer
  getPendingVerifications: () => api.get("/cwcrf/buyer/pending"),
  verifyCwcrf: (
    cwcrfId: string,
    verificationData: {
      approvedAmount: number;
      repaymentTimeline: number;
      repaymentArrangement: {
        source: string;
        otherDetails?: string;
        remarks?: string;
      };
    },
  ) => api.post(`/cwcrf/${cwcrfId}/buyer/verify`, verificationData),
  rejectCwcrf: (cwcrfId: string, data: { reason: string }) =>
    api.post(`/cwcrf/${cwcrfId}/buyer/reject`, data),

  // For NBFC
  getAvailableCwcrfs: () => api.get("/cwcrf/nbfc/available"),
  submitQuotation: (
    cwcrfId: string,
    quotation: {
      offeredAmount: number;
      interestRate: number;
      tenure: number;
      processingFee: number;
      terms?: string;
    },
  ) => api.post(`/cwcrf/${cwcrfId}/nbfc/quote`, quotation),

  // CWCAF viewing
  getCwcaf: (cwcrfId: string) => api.get(`/cwcrf/${cwcrfId}/cwcaf`),
};

export { api };
export default api;
