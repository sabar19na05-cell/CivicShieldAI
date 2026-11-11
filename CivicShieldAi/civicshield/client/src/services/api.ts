import axios from "axios";

export const api = axios.create({ baseURL: "/api" });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("csai_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !window.location.pathname.startsWith("/login")) {
      localStorage.removeItem("csai_token");
      localStorage.removeItem("csai_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export function apiErrorMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.message || fallback;
  }
  return fallback;
}

export const AuthAPI = {
  login: (email: string, password: string) => api.post("/auth/login", { email, password }),
  register: (payload: Record<string, string>) => api.post("/auth/register", payload),
  me: () => api.get("/auth/me"),
};

export const IncidentAPI = {
  list: (params?: Record<string, string>) => api.get("/incidents", { params }),
  get: (id: string) => api.get(`/incidents/${id}`),
  create: (formData: FormData) =>
    api.post("/incidents", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  update: (id: string, payload: Record<string, unknown>) => api.put(`/incidents/${id}`, payload),
  assign: (id: string, payload: { workerId: string; department: string; deadline?: string }) =>
    api.post(`/incidents/${id}/assign`, payload),
  uploadRepairEvidence: (id: string, formData: FormData) =>
    api.post(`/incidents/${id}/repair-evidence`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  close: (id: string) => api.put(`/incidents/${id}/close`),
};

export const AiAPI = {
  analyzeImage: (formData: FormData) =>
    api.post("/ai/analyze-image", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  verifyRepair: (formData: FormData) =>
    api.post("/ai/verify-repair", formData, { headers: { "Content-Type": "multipart/form-data" } }),
};

export const SensorAPI = {
  list: (type?: string) => api.get("/sensors", { params: type ? { type } : {} }),
  simulate: () => api.post("/sensors/simulate"),
};

export const MaintenanceAPI = {
  tasks: () => api.get("/maintenance/tasks"),
  updateTask: (id: string, status: string) => api.put(`/maintenance/tasks/${id}`, { status }),
  assets: (type?: string) => api.get("/maintenance/assets", { params: type ? { type } : {} }),
  workers: () => api.get("/maintenance/workers"),
};

export const AnalyticsAPI = {
  dashboard: () => api.get("/analytics/dashboard"),
  performance: () => api.get("/analytics/performance"),
};

export const NotificationAPI = {
  list: () => api.get("/notifications"),
  markRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put("/notifications/read-all"),
};
