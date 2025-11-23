import { create } from "zustand";
import { toast } from "react-toastify";
import {
  getInfluencersSections,
  getInfluencersSection,
  addInfluencersSection,
  updateInfluencersSection,
  deleteInfluencersSection,
  importExcel,
} from "../../apis/influencers/influencersSections.js";

export const useInfluencersSectionsStore = create((set, get) => ({
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
      const resp = await getInfluencersSections({
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
    } finally {
      set({ isLoading: false });
    }
  },

  fetchOne: async (id, opts = {}) => {
    set({ isLoading: true, error: null });
    try {
      const data = await getInfluencersSection(id, {
        lang: opts.lang ?? get().lang,
      });
      set({ current: data });
    } catch (error) {
      set({ error });
      toast.error(error?.response?.data?.message || "Failed to load section");
    } finally {
      set({ isLoading: false });
    }
  },

  create: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const created = await addInfluencersSection(payload);
      set({ current: created });
      await get().fetchList();
      toast.success("Section created successfully");
      return created;
    } catch (error) {
      set({ error });
      toast.error(error?.response?.data?.message || "Failed to create section");
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  update: async (id, payload) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await updateInfluencersSection(id, payload);
      set({ current: updated });
      await get().fetchList();
      toast.success("Section updated successfully");
      return updated;
    } catch (error) {
      set({ error });
      toast.error(error?.response?.data?.message || "Failed to update section");
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  remove: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await deleteInfluencersSection(id);
      await get().fetchList();
      toast.success("Section deleted successfully");
    } catch (error) {
      set({ error });
      toast.error(error?.response?.data?.message || "Failed to delete section");
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  import: async (file) => {
    set({ isLoading: true, error: null });
    try {
      const result = await importExcel(file);
      await get().fetchList();
      toast.success("Sections imported successfully");
      return result;
    } catch (error) {
      set({ error });
      toast.error(
        error?.response?.data?.message || "Failed to import sections"
      );
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
