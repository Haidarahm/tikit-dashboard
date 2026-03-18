import { create } from "zustand";
import { toast } from "react-toastify";
import {
  getAllNews,
  addNewsCard,
  updateNewsCard,
  deleteNewsCard,
  importNewsExcel,
  addNewsDetails as addNewsDetailsAPI,
  updateNewsDetails as updateNewsDetailsAPI,
  getAllNewsDetails as getAllNewsDetailsAPI,
  deleteNewsDetails as deleteNewsDetailsAPI,
  importNewsDetailsExcel as importNewsDetailsExcelAPI,
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
  detailsItems: [],
  currentDetails: null,

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
        focus_keyword: item.focus_keyword ?? "",
        written_by: item.written_by ?? "",
        meta_title: item.meta_title ?? "",
        meta_description: item.meta_description ?? "",
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
      toast.error(error?.response?.data?.message || "Failed to load blogs");
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
      toast.success("Blog card created successfully");
      return created;
    } catch (error) {
      set({ error });
      toast.error(
        error?.response?.data?.message || "Failed to create blog card"
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
      toast.success("Blog card updated successfully");
      return updated;
    } catch (error) {
      set({ error });
      toast.error(
        error?.response?.data?.message || "Failed to update blog card"
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
        error?.response?.data?.message || "Failed to delete blog card"
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
      toast.success("Blogs imported successfully");
    } catch (error) {
      set({ error });
      toast.error(
        error?.response?.data?.message || "Failed to import blogs from Excel"
      );
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchNewsDetails: async (slug, { lang } = {}) => {
    const { lang: storeLang } = get();
    set({ isLoading: true, error: null });
    try {
      const resp = await getAllNewsDetailsAPI(slug, { lang: lang ?? storeLang });
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
      set({ detailsItems: items });
      return items;
    } catch (error) {
      set({ error });
      toast.error(
        error?.response?.data?.message || "Failed to load blog details"
      );
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  createNewsDetails: async (id, payload, slug = null) => {
    set({ isLoading: true, error: null });
    try {
      const created = await addNewsDetailsAPI(id, payload);
      set({ currentDetails: created?.data || created });
      if (slug) await get().fetchNewsDetails(slug);
      toast.success("Blog details created successfully");
      return created;
    } catch (error) {
      set({ error });
      toast.error(
        error?.response?.data?.message || "Failed to create blog details"
      );
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateNewsDetails: async (id, payload, newsSlug = null) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await updateNewsDetailsAPI(id, payload);
      set({ currentDetails: updated?.data || updated });
      if (newsSlug) {
        await get().fetchNewsDetails(newsSlug);
      }
      toast.success("Blog details updated successfully");
      return updated;
    } catch (error) {
      set({ error });
      toast.error(
        error?.response?.data?.message || "Failed to update blog details"
      );
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  removeNewsDetails: async (id, newsSlug = null) => {
    set({ isLoading: true, error: null });
    try {
      await deleteNewsDetailsAPI(id);
      if (newsSlug) {
        await get().fetchNewsDetails(newsSlug);
      }
      toast.success("Blog details deleted successfully");
    } catch (error) {
      set({ error });
      toast.error(
        error?.response?.data?.message || "Failed to delete blog details"
      );
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  importNewsDetailsExcel: async (id, file, slug = null) => {
    set({ isLoading: true, error: null });
    try {
      await importNewsDetailsExcelAPI(id, file);
      if (slug) await get().fetchNewsDetails(slug);
      toast.success("Blog details imported successfully");
    } catch (error) {
      set({ error });
      toast.error(
        error?.response?.data?.message || "Failed to import blog details from Excel"
      );
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
