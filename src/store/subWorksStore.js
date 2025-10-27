import { create } from "zustand";
import { toast } from "react-toastify";
import {
  getAllCases,
  addCase,
  updateCase,
  deleteCase,
} from "../apis/subWorks.js";

export const useSubWorksStore = create((set, get) => ({
  items: [],
  total: 0,
  page: 1,
  perPage: 5,
  lang: "en",
  current: null,
  isLoading: false,
  error: null,
  workId: null,

  setWorkId: (workId) => {
    if (!workId) {
      // Clear items when no work is selected so the table shows no data
      set({ workId: null, page: 1, items: [], total: 0 });
      return;
    }
    set({ workId, page: 1 });
  },
  setPage: (page) => set({ page }),
  setPerPage: (perPage) => set({ perPage }),
  setLang: (lang) => set({ lang, page: 1 }),

  fetchList: async () => {
    const { page, perPage, lang, workId } = get();
    if (!workId) {
      set({ items: [], total: 0 });
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const resp = await getAllCases(workId, { page, per_page: perPage, lang });
      let items = [];
      if (Array.isArray(resp?.data)) items = resp.data;
      else if (Array.isArray(resp)) items = resp;
      else if (Array.isArray(resp?.items)) items = resp.items;

      const safeItems = Array.isArray(items) ? items : [];
      const total =
        resp?.pagination?.total ?? resp?.total ?? safeItems.length ?? 0;
      const nextPage = resp?.pagination?.current_page ?? page;
      const nextPerPage = resp?.pagination?.per_page ?? perPage;
      set({ items: safeItems, total, page: nextPage, perPage: nextPerPage });
    } catch (error) {
      set({ error, items: [], total: 0 });
    } finally {
      set({ isLoading: false });
    }
  },

  create: async (payload) => {
    const { workId } = get();
    if (!workId) {
      toast.error("No work selected");
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const created = await addCase(workId, payload);
      set({ current: created });
      await get().fetchList();
      return created;
    } catch (error) {
      set({ error });
      toast.error(error?.response?.data?.message || "Failed to create case");
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  update: async (id, payload) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await updateCase(id, payload);
      set({ current: updated });
      await get().fetchList();
      return updated;
    } catch (error) {
      set({ error });
      toast.error(error?.response?.data?.message || "Failed to update case");
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  remove: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await deleteCase(id);
      await get().fetchList();
    } catch (error) {
      set({ error });
      toast.error(error?.response?.data?.message || "Failed to delete case");
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
