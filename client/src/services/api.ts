import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// JWT token interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cap-predictor-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response error interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('cap-predictor-token');
      // Don't force redirect — let the app handle it gracefully
    }
    return Promise.reject(error);
  }
);

// ── Auth API ───────────────────────────────────────────────────────────

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
  };
}

export const authAPI = {
  register: (name: string, email: string, password: string) =>
    api.post<AuthResponse>('/auth/register', { name, email, password }),

  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }),

  getMe: () =>
    api.get<{ user: AuthResponse['user'] }>('/auth/me'),
};

// ── Colleges API ───────────────────────────────────────────────────────

export const collegesAPI = {
  getAll: () =>
    api.get<{ colleges: any[] }>('/colleges/all'),

  getBranches: () =>
    api.get<{ branches: string[] }>('/colleges/branches'),

  getDistricts: () =>
    api.get<{ districts: string[] }>('/colleges/districts'),

  getCategories: () =>
    api.get<{ categories: string[] }>('/colleges/categories'),

  getCategoryMap: () =>
    api.get<{ categories: Record<string, any> }>('/colleges/category-map'),

  getMeta: () =>
    api.get<{ meta: any }>('/colleges/meta'),
};

// ── Predictions API ────────────────────────────────────────────────────

export const predictionsAPI = {
  predict: (params: {
    percentile: number;
    category: string;
    branches?: string[];
    districts?: string[];
  }) =>
    api.post<{ results: any; meta: any }>('/predictions', params),

  reverse: (params: {
    collegeCode: string;
    choiceCode: string;
    category: string;
  }) =>
    api.post<{ prediction: any; college: any; branch: any }>('/predictions/reverse', params),

  heatmap: (params: {
    category: string;
    districts?: string[];
    branches?: string[];
  }) =>
    api.post<{ heatmap: any[] }>('/predictions/heatmap', params),
};

// ── Shortlists API ────────────────────────────────────────────────────

export const shortlistsAPI = {
  get: () =>
    api.get<{ items: any[] }>('/shortlists'),

  add: (item: {
    collegeCode: string;
    choiceCode: string;
    collegeName: string;
    courseName: string;
    district: string;
  }) =>
    api.post<{ items: any[] }>('/shortlists', item),

  remove: (choiceCode: string) =>
    api.delete<{ items: any[] }>(`/shortlists/${choiceCode}`),
};

// ── Option Forms API ───────────────────────────────────────────────────

export const optionFormsAPI = {
  get: () =>
    api.get<{ items: any[] }>('/option-forms'),

  save: (items: any[]) =>
    api.put<{ items: any[] }>('/option-forms', { items }),

  add: (item: {
    collegeCode: string;
    choiceCode: string;
    collegeName: string;
    courseName: string;
    district: string;
  }) =>
    api.post<{ items: any[] }>('/option-forms/add', item),

  remove: (choiceCode: string) =>
    api.delete<{ items: any[] }>(`/option-forms/${choiceCode}`),
};

// ── Admin API ──────────────────────────────────────────────────────────

export const adminAPI = {
  upload: (data: { colleges: any[]; meta?: any }) =>
    api.post<{ message: string; inserted: number; updated: number }>('/admin/upload', data),

  getStats: () =>
    api.get<{ stats: any }>('/admin/stats'),

  clearData: () =>
    api.delete<{ message: string; deletedCount: number }>('/admin/clear'),
};

export default api;
