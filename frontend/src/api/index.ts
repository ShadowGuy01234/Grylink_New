import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// GryLink
export const grylinkApi = {
  validate: (token: string) => api.get(`/grylink/validate/${token}`),
  setPassword: (token: string, password: string) => api.post('/grylink/set-password', { token, password }),
};

// Company (EPC)
export const companyApi = {
  getProfile: () => api.get('/company/profile'),
  uploadDocuments: (data: FormData) => api.post('/company/documents', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  addSubContractors: (subContractors: any[]) => api.post('/company/subcontractors', { subContractors }),
  bulkAddSubContractors: (data: FormData) => api.post('/company/subcontractors/bulk', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getSubContractors: () => api.get('/company/subcontractors'),
};

// Sub-Contractor
export const subContractorApi = {
  updateProfile: (data: any) => api.put('/subcontractor/profile', data),
  uploadBills: (data: FormData) => api.post('/subcontractor/bills', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  submitCwc: (data: any) => api.post('/subcontractor/cwc', data),
  respondToBid: (bidId: string, data: any) => api.post(`/subcontractor/bids/${bidId}/respond`, data),
  getDashboard: () => api.get('/subcontractor/dashboard'),
};

// Cases & Bids (EPC)
export const casesApi = {
  getCases: (params?: any) => api.get('/cases', { params }),
  getCase: (id: string) => api.get(`/cases/${id}`),
  reviewCase: (id: string, data: { decision: string; notes?: string }) => api.post(`/cases/${id}/review`, data),
};

export const bidsApi = {
  placeBid: (data: any) => api.post('/bids', data),
  negotiate: (id: string, counterOffer: any) => api.post(`/bids/${id}/negotiate`, { counterOffer }),
  lockBid: (id: string) => api.post(`/bids/${id}/lock`),
  getBidsForCase: (caseId: string) => api.get(`/bids/case/${caseId}`),
};

// KYC Chat
export const kycApi = {
  getMessages: (cwcRfId: string) => api.get(`/ops/kyc/${cwcRfId}/chat`),
  sendMessage: (cwcRfId: string, data: FormData) => api.post(`/ops/kyc/${cwcRfId}/chat`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

export default api;
