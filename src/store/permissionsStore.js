import { create } from "zustand";
import { toast } from "react-toastify";
import { getPermissions as getPermissionsAPI } from "../apis/permissions.js";

export const usePermissionsStore = create((set) => ({
  items: [],
  isLoading: false,
  error: null,

  fetchPermissions: async () => {
    set({ isLoading: true, error: null });
    try {
      const resp = await getPermissionsAPI();
      const items = Array.isArray(resp?.data)
        ? resp.data
        : Array.isArray(resp)
        ? resp
        : [];
      set({ items });
      return items;
    } catch (error) {
      set({ error });
      toast.error(
        error?.response?.data?.message || "Failed to fetch permissions"
      );
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
