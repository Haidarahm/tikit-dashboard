import { create } from "zustand";
import { toast } from "react-toastify";
import { login as loginAPI, logout as logoutAPI } from "../apis/auth.js";
import { getProfile } from "../apis/profile.js";

/** Header display only; cleared on logout. Full `auth_user` stays for menu permissions. */
export const AUTH_PROFILE_SUMMARY_KEY = "auth_profile_summary";

function persistProfileSummary(user) {
  if (!user || (user.name == null && user.role == null)) return;
  try {
    localStorage.setItem(
      AUTH_PROFILE_SUMMARY_KEY,
      JSON.stringify({
        name: user.name ?? "",
        role: user.role ?? "",
      })
    );
  } catch {
    /* ignore */
  }
}

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
  isProfileLoading: false,
  fetchProfile: async () => {
    const token = get().token;
    if (!token) {
      set({ isProfileLoading: false });
      return null;
    }
    set({ isProfileLoading: true });
    try {
      const resp = await getProfile();
      const user = resp?.data?.user;
      if (user) {
        try {
          localStorage.setItem("auth_user", JSON.stringify(user));
        } catch {
          /* ignore */
        }
        persistProfileSummary(user);
        set({ user, isAuthenticated: true });
      }
      return resp;
    } catch (error) {
      const status = error?.response?.status;
      if (status === 401) {
        await get().logout({ skipApi: true, silent: true });
        toast.error(
          error?.response?.data?.message ||
            "Session expired or unauthorized. Please log in again."
        );
        return null;
      }
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load profile"
      );
      throw error;
    } finally {
      set({ isProfileLoading: false });
    }
  },
  login: async (credentials) => {
    try {
      const response = await loginAPI(credentials);
      if (response.status && response.data) {
        const { token, user } = response.data;
        try {
          localStorage.setItem("auth_token", token);
          localStorage.setItem("auth_user", JSON.stringify(user));
          persistProfileSummary(user);
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
  logout: async ({ skipApi = false, silent = false } = {}) => {
    const token = get().token;
    if (!skipApi && token) {
      try {
        await logoutAPI(token);
      } catch (error) {
        if (!silent) {
          toast.error(
            error?.response?.data?.message || error?.message || "Logout failed"
          );
        }
      }
    }
    try {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      localStorage.removeItem(AUTH_PROFILE_SUMMARY_KEY);
    } catch {}
    set({
      token: "",
      user: null,
      isAuthenticated: false,
      isProfileLoading: false,
    });
    if (!silent) {
      toast.success("Logged out");
    }
  },
}));
