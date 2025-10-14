import { create } from "zustand";
import { toast } from "react-toastify";
import {
  getAllSubServices,
  addSubService,
  updateSubService,
  deleteSubService,
} from "../apis/subServices.js";

export const useSubServicesStore = create((set, get) => ({
  items: [],
  total: 0,
  page: 1,
  perPage: 5,
  lang: "en",
  current: null,
  isLoading: false,
  error: null,
  subId: null,

  setSubId: (subId) => set({ subId, page: 1 }),
  setPage: (page) => set({ page }),
  setPerPage: (perPage) => set({ perPage }),
  setLang: (lang) => set({ lang, page: 1 }),

  fetchList: async () => {
    const { page, perPage, lang, subId } = get();
    if (!subId) return; // wait for subId
    set({ isLoading: true, error: null });
    try {
      const resp = await getAllSubServices(subId, {
        page,
        per_page: perPage,
        lang,
      });
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
      toast.error(
        error?.response?.data?.message || "Failed to load sub services"
      );
    } finally {
      set({ isLoading: false });
    }
  },

  create: async (payload) => {
    const { subId } = get();
    if (!subId) {
      toast.error("No sub selected");
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const created = await addSubService(subId, payload);
      set({ current: created });
      await get().fetchList();
      return created;
    } catch (error) {
      set({ error });
      toast.error(
        error?.response?.data?.message || "Failed to create sub service"
      );
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  update: async (id, payload) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await updateSubService(id, payload);
      set({ current: updated });
      await get().fetchList();
      return updated;
    } catch (error) {
      set({ error });
      toast.error(
        error?.response?.data?.message || "Failed to update sub service"
      );
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  remove: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await deleteSubService(id);
      await get().fetchList();
    } catch (error) {
      set({ error });
      toast.error(
        error?.response?.data?.message || "Failed to delete sub service"
      );
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
