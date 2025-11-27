import { create } from "zustand";
import { toast } from "react-toastify";
import {
  getAllNews,
  addNewsCard,
  updateNewsCard,
  deleteNewsCard,
  importNewsExcel,
} from "../apis/news.js";

export const useNewsStore = create((set, get) => ({
  items: [],
  total: 0,
  page: 1,
  perPage: 10,
  lang: "en",
  current: null,
  isLoading: false,
  error: null,

  setPage: (page) => set({ page }),
  setPerPage: (perPage) => set({ perPage }),
  setLang: (lang) => set({ lang }),
  setCurrent: (current) => set({ current }),

  fetchList: async () => {
    const { page, perPage, lang } = get();
    set({ isLoading: true, error: null });
    try {
      const resp = await getAllNews({ page, per_page: perPage, lang });
      const rawItems = Array.isArray(resp?.data)
        ? resp.data
        : Array.isArray(resp)
        ? resp
        : [];
      const items = rawItems.map((item) => ({
        ...item,
        title_en: item.title_en ?? item.title ?? "",
        title_ar: item.title_ar ?? item.title ?? "",
        title_fr: item.title_fr ?? item.title ?? "",
        subtitle_en: item.subtitle_en ?? item.subtitle ?? "",
        subtitle_ar: item.subtitle_ar ?? item.subtitle ?? "",
        subtitle_fr: item.subtitle_fr ?? item.subtitle ?? "",
        description_en: item.description_en ?? item.description ?? "",
        description_ar: item.description_ar ?? item.description ?? "",
        description_fr: item.description_fr ?? item.description ?? "",
      }));
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
      toast.error(error?.response?.data?.message || "Failed to load news");
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  create: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const created = await addNewsCard(payload);
      set({ current: created?.data || created });
      await get().fetchList();
      toast.success("News card created successfully");
      return created;
    } catch (error) {
      set({ error });
      toast.error(
        error?.response?.data?.message || "Failed to create news card"
      );
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  update: async (id, payload) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await updateNewsCard(id, payload);
      set({ current: updated?.data || updated });
      await get().fetchList();
      toast.success("News card updated successfully");
      return updated;
    } catch (error) {
      set({ error });
      toast.error(
        error?.response?.data?.message || "Failed to update news card"
      );
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  remove: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await deleteNewsCard(id);
      await get().fetchList();
    } catch (error) {
      set({ error });
      toast.error(
        error?.response?.data?.message || "Failed to delete news card"
      );
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  importFromExcel: async (file) => {
    set({ isLoading: true, error: null });
    try {
      await importNewsExcel(file);
      await get().fetchList();
      toast.success("News imported successfully");
    } catch (error) {
      set({ error });
      toast.error(
        error?.response?.data?.message || "Failed to import news from Excel"
      );
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
