import { create } from "zustand";
import { toast } from "react-toastify";
import {
  getAllAdmins,
  addAdmin,
  updateAdmin,
  deleteAdmin,
} from "../apis/admin.js";

export const useAdminStore = create((set, get) => ({
  items: [],
  total: 0,
  page: 1,
  perPage: 10,
  current: null,
  isLoading: false,
  error: null,

  setPage: (page) => set({ page }),
  setPerPage: (perPage) => set({ perPage }),
  setCurrent: (current) => set({ current }),

  fetchList: async () => {
    const { page, perPage } = get();
    set({ isLoading: true, error: null });
    try {
      const resp = await getAllAdmins({ page, per_page: perPage });
      const items = Array.isArray(resp?.data)
        ? resp.data
        : Array.isArray(resp)
        ? resp
        : [];
      const total = resp?.pagination?.total ?? resp?.total ?? items.length;
      const nextPage = resp?.pagination?.current_page ?? page;
      const nextPerPage = resp?.pagination?.per_page ?? perPage;

      set({
        items,
        total,
        page: nextPage,
        perPage: nextPerPage,
      });
      return items;
    } catch (error) {
      set({ error });
      toast.error(error?.response?.data?.message || "Failed to load admins");
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  create: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const created = await addAdmin(payload);
      set({ current: created?.data || created });
      await get().fetchList();
      toast.success("Admin created successfully");
      return created;
    } catch (error) {
      set({ error });
      toast.error(error?.response?.data?.message || "Failed to create admin");
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  update: async (id, payload) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await updateAdmin(id, payload);
      set({ current: updated?.data || updated });
      await get().fetchList();
      toast.success("Admin updated successfully");
      return updated;
    } catch (error) {
      set({ error });
      toast.error(error?.response?.data?.message || "Failed to update admin");
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  remove: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await deleteAdmin(id);
      await get().fetchList();
      toast.success("Admin deleted successfully");
    } catch (error) {
      set({ error });
      toast.error(error?.response?.data?.message || "Failed to delete admin");
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
