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

// Sub-contractor APIs
export const scApi = {
<<<<<<< HEAD
  getProfile: () => api.get('/subcontractor/profile'),
  updateProfile: (data: any) => api.put('/subcontractor/profile', data),
  uploadDocuments: (formData: FormData) => api.post('/subcontractor/kyc', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  submitBill: (formData: FormData) => api.post('/subcontractor/bill', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getCases: () => api.get('/subcontractor/cases'),
  getBills: () => api.get('/subcontractor/bills'),
  getBids: () => api.get('/subcontractor/bids'),
  respondToBid: (bidId: string, data: { decision: string; counterOffer?: any }) => 
    api.post(`/subcontractor/bids/${bidId}/respond`, data),
  submitCwc: (data: { billId: string; paymentReference?: string }) => 
    api.post('/subcontractor/cwc', data),
=======
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
  submitCwc: (data: {
    caseId?: string;
    grylink?: string;
    amount: number;
    details?: string;
  }) => api.post("/subcontractor/cwc", data),
  respondToBid: (
    bidId: string,
    data: {
      decision: "accept" | "reject" | "negotiate";
      counterOffer?: number;
    },
  ) => api.post(`/subcontractor/bids/${bidId}/respond`, data),
  getDashboard: () => api.get("/subcontractor/dashboard"),
>>>>>>> 27b58c6ff018f59e5a590604941825bf4f863de5
};

export default api;
