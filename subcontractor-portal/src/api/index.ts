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
  updateProfile: (data: any) => api.put("/auth/profile", data),
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
  uploadDocuments: (formData: FormData) =>
    api.post("/subcontractor/kyc", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  submitBill: (formData: FormData) =>
    api.post("/subcontractor/bill", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getCases: () => api.get("/subcontractor/cases"),
  getBills: () => api.get("/subcontractor/bills"),
  getBids: () => api.get("/subcontractor/bids"),
  respondToBid: (
    bidId: string,
    data: {
      decision: "accept" | "reject" | "negotiate";
      counterOffer?: number;
      counterDuration?: number;
      message?: string;
    },
  ) => api.post(`/subcontractor/bids/${bidId}/respond`, data),
  submitCwc: (data: {
    billId?: string;
    paymentReference?: string;
    amount?: number;
  }) => api.post("/subcontractor/cwc", data),
  getDashboard: () => api.get("/subcontractor/dashboard"),
};

// KYC Chat APIs - for chat-based document exchange with Ops
export const kycApi = {
  getMessages: (cwcRfId: string) => api.get(`/ops/kyc/${cwcRfId}/chat`),
  sendMessage: (cwcRfId: string, data: FormData) =>
    api.post(`/ops/kyc/${cwcRfId}/chat`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

export default api;
