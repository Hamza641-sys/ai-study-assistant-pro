import axios from 'axios';
import toast from 'react-hot-toast';

// Production: use VITE_API_URL env var
// Development: use vite proxy /api → localhost:5000
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status  = error.response?.status;
    const message = error.response?.data?.message || 'Something went wrong.';

    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    } else if (status === 429) {
      toast.error('Too many requests. Please slow down.');
    } else if (status >= 500) {
      toast.error('Server error. Please try again later.');
    }

    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  register:       (data) => api.post('/auth/register', data),
  login:          (data) => api.post('/auth/login', data),
  getMe:          ()     => api.get('/auth/me'),
  updateProfile:  (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// ─── Documents ────────────────────────────────────────────────────────────────
export const documentsAPI = {
  upload:    (formData) => api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  }),
  list:      (params)   => api.get('/documents', { params }),
  get:       (id)       => api.get(`/documents/${id}`),
  getStatus: (id)       => api.get(`/documents/${id}/status`),
  update:    (id, data) => api.put(`/documents/${id}`, data),
  delete:    (id)       => api.delete(`/documents/${id}`),
};

// ─── Conversations ────────────────────────────────────────────────────────────
export const conversationsAPI = {
  create:      (data)      => api.post('/conversations', data),
  list:        ()          => api.get('/conversations'),
  get:         (id)        => api.get(`/conversations/${id}`),
  sendMessage: (id, data)  => api.post(`/conversations/${id}/messages`, data),
  delete:      (id)        => api.delete(`/conversations/${id}`),
};

// ─── RAG ──────────────────────────────────────────────────────────────────────
export const ragAPI = {
  ask: (data) => api.post('/rag/ask', data, { timeout: 60000 }),
};

// ─── Summaries ────────────────────────────────────────────────────────────────
export const summariesAPI = {
  generate: (data)   => api.post('/summaries/generate', data, { timeout: 60000 }),
  list:     (params) => api.get('/summaries', { params }),
  get:      (id)     => api.get(`/summaries/${id}`),
  delete:   (id)     => api.delete(`/summaries/${id}`),
};

// ─── Quizzes ──────────────────────────────────────────────────────────────────
export const quizzesAPI = {
  generate: (data)       => api.post('/quizzes/generate', data, { timeout: 60000 }),
  submit:   (id, data)   => api.post(`/quizzes/${id}/submit`, data),
  list:     (params)     => api.get('/quizzes', { params }),
  get:      (id)         => api.get(`/quizzes/${id}`),
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

export default api;
