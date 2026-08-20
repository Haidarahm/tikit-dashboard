import axios from "axios";
import { useAuthStore } from "../store/auth.js";
import { useUploadProgressStore } from "../store/uploadProgressStore.js";
import {
  rewriteFormDataFilesToR2,
} from "./directR2Upload.js";

const baseURL = import.meta.env.VITE_BASE_URL || "";

export const apiClient = axios.create({
  baseURL,
  withCredentials: false,
});

function isFormDataPost(config) {
  const method = String(config?.method || "get").toLowerCase();
  if (method !== "post") return false;
  return typeof FormData !== "undefined" && config?.data instanceof FormData;
}

apiClient.interceptors.request.use(async (config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (isFormDataPost(config) && !config.__skipDirectR2) {
    const { formData: rewritten, uploadId } = await rewriteFormDataFilesToR2(
      config.data,
      config.url || ""
    );
    config.data = rewritten;
    if (uploadId) {
      config.__uploadId = uploadId;
    }
  }

  // Fallback progress for classic multipart (when R2 direct upload was skipped/failed)
  if (isFormDataPost(config) && !config.__uploadId) {
    const uploadId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const { startUpload, updateUploadBytes, startProcessing } =
      useUploadProgressStore.getState();
    startUpload(uploadId);
    config.__uploadId = uploadId;

    const previousProgress = config.onUploadProgress;
    let sawProgress = false;
    config.onUploadProgress = (event) => {
      if (event.total) {
        sawProgress = true;
        updateUploadBytes(uploadId, (event.loaded * 100) / event.total);
      }
      if (typeof previousProgress === "function") previousProgress(event);
    };
    config.__uploadProgressFallback = setTimeout(() => {
      if (!sawProgress) startProcessing(uploadId);
    }, 500);
  } else if (config.__uploadId) {
    // R2 already uploaded; remaining Laravel POST is the "saving" phase.
    useUploadProgressStore.getState().startProcessing(config.__uploadId);
  }

  return config;
});

function clearUploadTracking(config) {
  if (config?.__uploadProgressFallback) {
    clearTimeout(config.__uploadProgressFallback);
  }
  const uploadId = config?.__uploadId;
  if (uploadId) {
    useUploadProgressStore.getState().finishUpload(uploadId);
  }
}

apiClient.interceptors.response.use(
  (response) => {
    clearUploadTracking(response?.config);
    return response;
  },
  (error) => {
    clearUploadTracking(error?.config);
    const status = error?.response?.status;
    if (status === 401) {
      const { logout } = useAuthStore.getState();
      logout({ skipApi: true, silent: true });
    }
    return Promise.reject(error);
  }
);
