import { create } from "zustand";
import { toast } from "react-toastify";
import { login as loginAPI } from "../apis/auth.js";

const getInitialToken = () => {
  try {
    return localStorage.getItem("auth_token") || "";
  } catch {
    return "";
  }
};

const getInitialUser = () => {
  try {
    const userStr = localStorage.getItem("auth_user");
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

export const useAuthStore = create((set, get) => ({
  token: getInitialToken(),
  user: getInitialUser(),
  isAuthenticated: !!getInitialToken(),
  login: async (credentials) => {
    try {
      const response = await loginAPI(credentials);
      if (response.status && response.data) {
        const { token, user } = response.data;
        try {
          localStorage.setItem("auth_token", token);
          localStorage.setItem("auth_user", JSON.stringify(user));
        } catch {}
        set({ token, user, isAuthenticated: true });
        toast.success(response.message || "Logged in successfully");
        return { success: true, data: response.data };
      } else {
        toast.error(response.message || "Login failed");
        return { success: false, error: response.message };
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || error?.message || "Login failed";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },
  logout: () => {
    try {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
    } catch {}
    set({ token: "", user: null, isAuthenticated: false });
    toast.success("Logged out");
  },
}));
