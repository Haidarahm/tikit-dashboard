import { create } from "zustand";
import { toast } from "react-toastify";

const getInitialToken = () => {
  try {
    return localStorage.getItem("auth_token") || "";
  } catch {
    return "";
  }
};

export const useAuthStore = create((set, get) => ({
  token: getInitialToken(),
  isAuthenticated: !!getInitialToken(),
  login: (token) => {
    try {
      localStorage.setItem("auth_token", token);
    } catch {}
    set({ token, isAuthenticated: true });
    toast.success("Logged in successfully");
  },
  logout: () => {
    try {
      localStorage.removeItem("auth_token");
    } catch {}
    set({ token: "", isAuthenticated: false });
    toast.success("Logged out");
  },
}));
