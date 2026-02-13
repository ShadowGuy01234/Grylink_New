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
  // WCC and Measurement Sheet uploads (SOP Phase 6)
  uploadWcc: (billId: string, formData: FormData) =>
    api.post(`/subcontractor/bills/${billId}/wcc`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  uploadMeasurementSheet: (billId: string, formData: FormData) =>
    api.post(`/subcontractor/bills/${billId}/measurement-sheet`, formData, {
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

  // Seller Declaration (Workflow Step 4 - Hard Gate)
  acceptDeclaration: () => api.post("/subcontractor/declaration/accept"),
  getDeclarationStatus: () => api.get("/subcontractor/declaration/status"),

  // KYC Documents Upload (Workflow Step 3)
  uploadKycDocument: (documentType: string, formData: FormData) =>
    api.post(`/subcontractor/kyc/${documentType}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getKycStatus: () => api.get("/subcontractor/kyc/status"),

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
  // Submit new CWCRF
  submit: (data: {
    billId: string;
    buyerDetails: {
      buyerId?: string;
      projectName: string;
      projectLocation: string;
    };
    invoiceDetails: {
      invoiceNumber: string;
      invoiceDate: string;
      invoiceAmount: number;
      expectedPaymentDate: string;
      workDescription?: string;
    };
    cwcRequest: {
      requestedAmount: number;
      requestedTenure: number; // 30, 45, 60, 90 days
    };
    interestPreference: {
      preferenceType: "RANGE" | "MAX_ACCEPTABLE";
      minRate?: number;
      maxRate?: number;
      maxAcceptableRate?: number;
    };
    platformFeePaid?: boolean;
    paymentReference?: string;
  }) => api.post("/cwcrf", data),

  // Get all my CWCRFs
  getMyCwcrfs: () => api.get("/cwcrf/my"),

  // Get single CWCRF details
  getById: (id: string) => api.get(`/cwcrf/${id}`),

  // Select NBFC (Workflow Step 10)
  selectNbfc: (cwcrfId: string, nbfcId: string) =>
    api.post(`/cwcrf/${cwcrfId}/select-nbfc`, { nbfcId }),
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
