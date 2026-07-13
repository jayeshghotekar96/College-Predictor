import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// JWT token interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cap-predictor-token");
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
      localStorage.removeItem("cap-predictor-token");
      // Don't force redirect — let the app handle it gracefully
    }
    return Promise.reject(error);
  },
);

// ── Auth API ───────────────────────────────────────────────────────────

export const authAPI = {
  register: (name, email, password) =>
    api.post("/auth/register", { name, email, password }),

  login: (email, password) => api.post("/auth/login", { email, password }),

  getMe: () => api.get("/auth/me"),
};

// ── Colleges API ───────────────────────────────────────────────────────

export const collegesAPI = {
  getAll: () => api.get("/colleges/all"),

  getLight: () => api.get("/colleges/light"),

  getBranches: () => api.get("/colleges/branches"),

  getDistricts: () => api.get("/colleges/districts"),

  getCategories: () => api.get("/colleges/categories"),

  getCategoryMap: () => api.get("/colleges/category-map"),

  getMeta: () => api.get("/colleges/meta"),

  getCollegeByCode: (code) => api.get(`/colleges/${code}`),
};

// ── Predictions API ────────────────────────────────────────────────────

export const predictionsAPI = {
  predict: (params) => api.post("/predictions", params),

  reverse: (params) => api.post("/predictions/reverse", params),

  heatmap: (params) => api.post("/predictions/heatmap", params),
};

// ── Shortlists API ────────────────────────────────────────────────────

export const shortlistsAPI = {
  get: () => api.get("/shortlists"),

  add: (item) => api.post("/shortlists", item),

  remove: (choiceCode) => api.delete(`/shortlists/${choiceCode}`),
};

// ── Option Forms API ───────────────────────────────────────────────────

export const optionFormsAPI = {
  get: () => api.get("/option-forms"),

  save: (items) => api.put("/option-forms", { items }),

  add: (item) => api.post("/option-forms/add", item),

  remove: (choiceCode) => api.delete(`/option-forms/${choiceCode}`),
};

// ── Admin API ──────────────────────────────────────────────────────────

export const adminAPI = {
  upload: (data) => api.post("/admin/upload", data),

  getStats: () => api.get("/admin/stats"),

  clearData: () => api.delete("/admin/clear"),
};

export default api;
