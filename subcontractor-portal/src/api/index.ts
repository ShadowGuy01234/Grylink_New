import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth APIs
export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),
  me: () => api.get("/auth/me"),
  checkEmail: (email: string) =>
    api.get(`/auth/check-email/${encodeURIComponent(email)}`),
  registerSubcontractor: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    companyName?: string;
  }) => api.post("/auth/register-subcontractor", data),
};

// GryLink APIs - for onboarding
export const grylinkApi = {
  validate: (token: string) => api.get(`/grylink/validate/${token}`),
  setPassword: (token: string, password: string) =>
    api.post("/grylink/set-password", { token, password }),
};

// Sub-contractor APIs
export const scApi = {
  getProfile: () => api.get("/subcontractor/profile"),
  updateProfile: (data: any) => api.put("/subcontractor/profile", data),
  submitBillWithCwcrf: (formData: FormData) =>
    api.post("/subcontractor/bill-with-cwcrf", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  respondToBid: (
    bidId: string,
    data: {
      decision: "accept" | "reject" | "negotiate";
      counterOffer?: number;
      counterDuration?: number;
      message?: string;
    },
  ) => api.post(`/subcontractor/bids/${bidId}/respond`, data),
  getDashboard: () => api.get("/subcontractor/dashboard"),

  // Seller Declaration (Workflow Step 4 - Hard Gate)
  acceptDeclaration: () => api.post("/subcontractor/declaration/accept"),
  getDeclarationStatus: () => api.get("/subcontractor/declaration/status"),

  // KYC Documents Upload (Workflow Step 3)
  uploadKycDocument: (documentType: string, formData: FormData) =>
    api.post(`/subcontractor/kyc/${documentType}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getKycStatus: () => api.get("/subcontractor/kyc/status"),
  submitKycForReview: () => api.post("/subcontractor/kyc/submit"),
  uploadAdditionalDocument: (docId: string, formData: FormData) =>
    api.post(`/subcontractor/kyc/additional/${docId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // Bank Details
  updateBankDetails: (data: {
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    branchName?: string;
    accountType?: string;
  }) => api.put("/subcontractor/bank-details", data),
};

// CWCRF APIs (Workflow Section 4 - Phase 2)
export const cwcrfApi = {
  // Get all my CWCRFs
  getMyCwcrfs: () => api.get("/cwcrf/my"),

  // Get single CWCRF details
  getById: (id: string) => api.get(`/cwcrf/${id}`),

  // Select NBFC (Workflow Step 10)
  selectNbfc: (cwcrfId: string, nbfcId: string) =>
    api.post(`/cwcrf/${cwcrfId}/select-nbfc`, { nbfcId }),

  // Accept Sanction Letter (Phase 11.4)
  acceptSanctionLetter: (cwcrfId: string) =>
    api.post(`/cwcrf/${cwcrfId}/accept-sanction`),
};

export default api;
