import { create } from "zustand";
import { toast } from "react-toastify";
import {
  getAllDigitalItems,
  createDigitalItem,
  updateDigitalItem,
  deleteDigitalItem,
  importExcelfile,
} from "../../apis/work/digitalItems.js";

export const useDigitalItemsStore = create((set, get) => ({
  items: [],
  total: 0,
  page: 1,
  perPage: 5,
  lang: "en",
  workId: null,
  current: null,
  isLoading: false,
  error: null,

  setWorkId: (workId) => set({ workId }),
  setPage: (page) => set({ page }),
  setPerPage: (perPage) => set({ perPage }),
  setLang: (lang) => set({ lang }),

  fetchList: async (workId = null) => {
    const { page, perPage, lang } = get();
    const targetWorkId = workId ?? get().workId;
    if (!targetWorkId) {
      set({ items: [], total: 0 });
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const resp = await getAllDigitalItems({
        work_id: targetWorkId,
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
        error?.response?.data?.message || "Failed to fetch digital items"
      );
    } finally {
      set({ isLoading: false });
    }
  },

  create: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const created = await createDigitalItem(payload);
      set({ current: created?.data || created });
      await get().fetchList();
      toast.success("Digital item created successfully");
      return created;
    } catch (error) {
      set({ error });
      toast.error(
        error?.response?.data?.message || "Failed to create digital item"
      );
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  update: async (id, payload) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await updateDigitalItem(id, payload);
      set({ current: updated?.data || updated });
      await get().fetchList();
      toast.success("Digital item updated successfully");
      return updated;
    } catch (error) {
      set({ error });
      toast.error(
        error?.response?.data?.message || "Failed to update digital item"
      );
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  remove: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await deleteDigitalItem(id);
      await get().fetchList();
      toast.success("Digital item deleted successfully");
    } catch (error) {
      set({ error });
      toast.error(
        error?.response?.data?.message || "Failed to delete digital item"
      );
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  importExcel: async (file) => {
    const workId = get().workId;
    if (!workId) {
      toast.error("Select a work before importing.");
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const result = await importExcelfile(workId, file);
      await get().fetchList();
      toast.success("Digital items imported successfully");
      return result;
    } catch (error) {
      set({ error });
      toast.error(
        error?.response?.data?.message || "Failed to import digital items"
      );
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
