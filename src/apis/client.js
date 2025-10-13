import axios from "axios";
import { useAuthStore } from "../store/auth.js";

const baseURL = import.meta.env.VITE_BASE_URL || "";

export const apiClient = axios.create({
  baseURL,
  withCredentials: false,
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);
