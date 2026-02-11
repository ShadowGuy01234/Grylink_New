import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_URL });

// GryLink APIs - for onboarding only
export const grylinkApi = {
  validate: (token: string) => api.get(`/grylink/validate/${token}`),
  setPassword: (token: string, password: string) => api.post('/grylink/set-password', { token, password }),
};

export default api;
