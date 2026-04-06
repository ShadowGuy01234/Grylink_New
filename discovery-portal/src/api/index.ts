import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('discovery_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('discovery_token');
      localStorage.removeItem('discovery_user');
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

// BDF
export const bdfApi = {
  getDashboard: () => api.get('/bdf/dashboard'),
  getAll: (params?: Record<string, string>) => api.get('/bdf', { params }),
  getById: (id: string) => api.get(`/bdf/${id}`),
  create: (data: Record<string, unknown>) => api.post('/bdf', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/bdf/${id}`, data),
  addGroundIntelligence: (id: string, data: Record<string, unknown>) =>
    api.post(`/bdf/${id}/ground-intelligence`, data),
  removeGroundIntelligence: (id: string, convoId: string) =>
    api.delete(`/bdf/${id}/ground-intelligence/${convoId}`),
  submit: (id: string) => api.post(`/bdf/${id}/submit`),
  convert: (id: string, data: Record<string, unknown>) => api.post(`/bdf/${id}/convert`, data),
};

// FPDF
export const fpdfApi = {
  getDashboard: () => api.get('/fpdf/dashboard'),
  getAll: (params?: Record<string, string>) => api.get('/fpdf', { params }),
  getById: (id: string) => api.get(`/fpdf/${id}`),
  create: (data: Record<string, unknown>) => api.post('/fpdf', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/fpdf/${id}`, data),
  submit: (id: string) => api.post(`/fpdf/${id}/submit`),
  convert: (id: string, data: Record<string, unknown>) => api.post(`/fpdf/${id}/convert`, data),
};

export default api;
