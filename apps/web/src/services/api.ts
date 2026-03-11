import axios from "axios";
import { useAuthStore } from "../hooks/useAuthStore";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

api.interceptors.request.use((config) => {
  const { token, orgId } = useAuthStore.getState();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (orgId) config.headers["X-Organization-Id"] = orgId;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);
