import { create } from "zustand";
import { toast } from "react-toastify";
import {
  getWorksSections,
  createWorkSection,
  updateWorkSection,
  deleteWorkSection,
  importExcel,
} from "../../apis/worksSection.js";

export const useWorksSectionStore = create((set, get) => ({
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
      const resp = await getWorksSections({
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

  create: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const created = await createWorkSection(payload);
      set({ current: created });
      await get().fetchList();
      toast.success("Work section created successfully");
      return created;
    } catch (error) {
      set({ error });
      toast.error(
        error?.response?.data?.message || "Failed to create work section"
      );
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  update: async (id, payload) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await updateWorkSection(id, payload);
      set({ current: updated });
      await get().fetchList();
      toast.success("Work section updated successfully");
      return updated;
    } catch (error) {
      set({ error });
      toast.error(
        error?.response?.data?.message || "Failed to update work section"
      );
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  remove: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await deleteWorkSection(id);
      await get().fetchList();
      toast.success("Work section deleted successfully");
    } catch (error) {
      set({ error });
      toast.error(
        error?.response?.data?.message || "Failed to delete work section"
      );
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
      toast.success("Work sections imported successfully");
      return result;
    } catch (error) {
      set({ error });
      toast.error(
        error?.response?.data?.message || "Failed to import work sections"
      );
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
