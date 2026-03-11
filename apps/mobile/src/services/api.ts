import axios from "axios";

// In production, this comes from environment config
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000/api";

export const api = axios.create({ baseURL: BASE_URL });

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export function setOrgId(orgId: string | null) {
  if (orgId) {
    api.defaults.headers.common["X-Organization-Id"] = orgId;
  } else {
    delete api.defaults.headers.common["X-Organization-Id"];
  }
}
