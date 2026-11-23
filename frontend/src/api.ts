import axios from "axios";
import { DocumentItem, DocumentDetail, AnalyticsData } from "./types";

const api = axios.create({
  baseURL: "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("documind_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("documind_token");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (data: { email: string; password: string }) => api.post("/auth/login", data),
  register: (data: any) => api.post("/auth/register", data),
  getMe: () => api.get("/auth/me"),
};

export const documentApi = {
  list: (params?: { search?: string; category?: string; status?: string }) =>
    api.get<DocumentItem[]>("/documents", { params }),
  get: (id: string) => api.get<DocumentDetail>(`/documents/${id}`),
  upload: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<DocumentItem>("/documents/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  delete: (id: string) => api.delete(`/documents/${id}`),
  process: (id: string) => api.post(`/documents/${id}/process`),
};

export const reviewApi = {
  getPending: () => api.get<any[]>("/reviews/pending"),
  updateField: (documentId: string, fieldId: string, data: { corrected_value: any; reason?: string }) =>
    api.patch(`/reviews/${documentId}/fields/${fieldId}`, data),
  approve: (documentId: string, comments?: string) =>
    api.post(`/reviews/${documentId}/approve`, { comments }),
  reject: (documentId: string, comments?: string) =>
    api.post(`/reviews/${documentId}/reject`, { comments }),
};

export const analyticsApi = {
  getOverview: () => api.get<AnalyticsData>("/analytics/overview"),
};

export const exportApi = {
  getDownloadUrl: (documentId: string, format: string) =>
    `/api/exports/${documentId}/download?format=${format}`,
};

export default api;
