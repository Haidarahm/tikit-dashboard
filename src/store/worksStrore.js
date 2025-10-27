import { create } from "zustand";
import { toast } from "react-toastify";
import {
  getWorks,
  getWork,
  addWork,
  updateWork,
  deleteWork,
  importWorks,
} from "../apis/work.js";

export const useWorksStore = create((set, get) => ({
  items: [],
  total: 0,
  page: 1,
  perPage: 5,
  lang: "en",
  current: null,
  isLoading: false,
  error: null,

  setPage: (page) => set({ page }),
  setPerPage: (perPage) => set({ perPage }),
  setLang: (lang) => set({ lang }),

  fetchList: async () => {
    const { page, perPage, lang } = get();
    set({ isLoading: true, error: null });
    try {
      const resp = await getWorks({ page, per_page: perPage, lang });
      const items = Array.isArray(resp?.data)
        ? resp.data
        : Array.isArray(resp)
        ? resp
        : [];
      const total = resp?.pagination?.total ?? resp?.total ?? items.length;
      const nextPage = resp?.pagination?.current_page ?? page;
      const nextPerPage = resp?.pagination?.per_page ?? perPage;
      set({ items, total, page: nextPage, perPage: nextPerPage });
    } catch (error) {
      set({ error });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchOne: async (id, opts = {}) => {
    set({ isLoading: true, error: null });
    try {
      const data = await getWork(id, { lang: opts.lang ?? get().lang });
      set({ current: data });
    } catch (error) {
      set({ error });
      toast.error(error?.response?.data?.message || "Failed to load work");
    } finally {
      set({ isLoading: false });
    }
  },

  create: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const created = await addWork(payload);
      set({ current: created });
      await get().fetchList();
      return created;
    } catch (error) {
      set({ error });
      toast.error(error?.response?.data?.message || "Failed to create work");
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  update: async (id, payload) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await updateWork(id, payload);
      set({ current: updated });
      await get().fetchList();
      return updated;
    } catch (error) {
      set({ error });
      toast.error(error?.response?.data?.message || "Failed to update work");
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  remove: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await deleteWork(id);
      await get().fetchList();
    } catch (error) {
      set({ error });
      toast.error(error?.response?.data?.message || "Failed to delete work");
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  import: async (file) => {
    set({ isLoading: true, error: null });
    try {
      const result = await importWorks(file);
      await get().fetchList();
      toast.success("Works imported successfully");
      return result;
    } catch (error) {
      set({ error });
      toast.error(error?.response?.data?.message || "Failed to import works");
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
