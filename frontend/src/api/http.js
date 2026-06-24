import axios from "axios";
import { API_BASE_URL } from "../config";
import { getAccessToken, clearTokens } from "../auth/tokenStorage";

const unauthorizedListeners = [];

export function subscribeUnauthorized(callback) {
  unauthorizedListeners.push(callback);
  return () => {
    const idx = unauthorizedListeners.indexOf(callback);
    if (idx > -1) unauthorizedListeners.splice(idx, 1);
  };
}

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

http.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await clearTokens();
      unauthorizedListeners.forEach((cb) => cb());
    }
    return Promise.reject(error);
  }
);

