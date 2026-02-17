import axios, { AxiosError } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_URL });

// Request interceptor - add token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor - handle 401
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============= Auth APIs =============
export const authApi = {
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  register: (data: { name: string; email: string; password: string; phone?: string; role: string }) => 
    api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

// ============= GryLink APIs =============
export const grylinkApi = {
  validate: (token: string) => api.get(`/grylink/validate/${token}`),
  setPassword: (token: string, password: string) => api.post('/grylink/set-password', { token, password }),
};

// ============= Company (EPC) APIs =============
export const companyApi = {
  getProfile: () => api.get('/company/profile'),
  uploadDocuments: (data: FormData) => 
    api.post('/company/documents', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  addSubContractors: (subContractors: any[]) => api.post('/company/subcontractors', { subContractors }),
  bulkAddSubContractors: (data: FormData) => 
    api.post('/company/subcontractors/bulk', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getSubContractors: () => api.get('/company/subcontractors'),
  getDocuments: () => api.get('/company/documents'),
  deleteDocument: (docId: string) => api.delete(`/company/documents/${docId}`),
};

// ============= Sub-Contractor APIs =============
export const subContractorApi = {
  updateProfile: (data: any) => api.put('/subcontractor/profile', data),
  getProfile: () => api.get('/subcontractor/profile'),
  uploadBills: (data: FormData) => 
    api.post('/subcontractor/bills', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getBills: () => api.get('/subcontractor/bills'),
  submitCwc: (data: any) => api.post('/subcontractor/cwc', data),
  getCwcRequests: () => api.get('/subcontractor/cwc'),
  respondToBid: (bidId: string, data: any) => api.post(`/subcontractor/bids/${bidId}/respond`, data),
  getBids: () => api.get('/subcontractor/bids'),
  getDashboard: () => api.get('/subcontractor/dashboard'),
};

// ============= Cases APIs =============
export const casesApi = {
  getCases: (params?: any) => api.get('/cases', { params }),
  getCase: (id: string) => api.get(`/cases/${id}`),
  reviewCase: (id: string, data: { decision: string; notes?: string }) => 
    api.post(`/cases/${id}/review`, data),
};

// ============= Bids APIs =============
export const bidsApi = {
  placeBid: (data: any) => api.post('/bids', data),
  getBid: (id: string) => api.get(`/bids/${id}`),
  negotiate: (id: string, counterOffer: any) => api.post(`/bids/${id}/negotiate`, { counterOffer }),
  lockBid: (id: string) => api.post(`/bids/${id}/lock`),
  getBidsForCase: (caseId: string) => api.get(`/bids/case/${caseId}`),
  getUserBids: () => api.get('/bids/my-bids'),
};

// ============= KYC Chat APIs =============
export const kycApi = {
  getMessages: (cwcRfId: string) => api.get(`/ops/kyc/${cwcRfId}/chat`),
  sendMessage: (cwcRfId: string, data: FormData) => 
    api.post(`/ops/kyc/${cwcRfId}/chat`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

// ============= NBFC APIs =============
export const nbfcApi = {
  getDashboard: () => api.get('/nbfc/dashboard'),
  getLps: () => api.get('/nbfc/lps'),
  updateLps: (data: any) => api.put('/nbfc/lps', data),
  getAvailableCwcafs: () => api.get('/cwcrf/nbfc/available'),
  submitQuote: (cwcrfId: string, data: any) => api.post(`/cwcrf/${cwcrfId}/submit-quote`, data),
  respondToCase: (caseId: string, data: any) => api.post(`/nbfc/${caseId}/respond`, data),
  getMyBids: () => api.get('/bids/my'),
  getTransactions: () => api.get('/transaction/my'),
};

// ============= Health Check =============
export const healthApi = {
  check: () => api.get('/health'),
};

export default api;
