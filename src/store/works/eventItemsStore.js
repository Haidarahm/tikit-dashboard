import { create } from "zustand";
import { toast } from "react-toastify";
import {
  getAllEventItems,
  createEventItem,
  updateEventItem,
  deleteEventItem,
  importExcelfile,
} from "../../apis/work/eventItems.js";

export const useEventItemsStore = create((set, get) => ({
  items: [],
  total: 0,
  page: 1,
  perPage: 5,
  lang: "en",
  slug: null,
  current: null,
  isLoading: false,
  error: null,

  setSlug: (slug) => set({ slug }),
  setPage: (page) => set({ page }),
  setPerPage: (perPage) => set({ perPage }),
  setLang: (lang) => set({ lang }),

  fetchList: async (slug = null) => {
    const { page, perPage, lang } = get();
    const targetSlug = slug ?? get().slug;
    if (!targetSlug) {
      set({ items: [], total: 0 });
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const resp = await getAllEventItems({
        slug: targetSlug,
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
      const created = await createEventItem(payload);
      set({ current: created?.data || created });
      await get().fetchList();
      toast.success("Event item created successfully");
      return created;
    } catch (error) {
      set({ error });
      toast.error(
        error?.response?.data?.message || "Failed to create event item"
      );
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  update: async (id, payload) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await updateEventItem(id, payload);
      set({ current: updated?.data || updated });
      await get().fetchList();
      toast.success("Event item updated successfully");
      return updated;
    } catch (error) {
      set({ error });
      toast.error(
        error?.response?.data?.message || "Failed to update event item"
      );
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  remove: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await deleteEventItem(id);
      await get().fetchList();
      toast.success("Event item deleted successfully");
    } catch (error) {
      set({ error });
      toast.error(
        error?.response?.data?.message || "Failed to delete event item"
      );
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  importExcel: async (file) => {
    const slug = get().slug;
    if (!slug) {
      toast.error("Select a work before importing.");
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const result = await importExcelfile(slug, file);
      await get().fetchList();
      toast.success("Event items imported successfully");
      return result;
    } catch (error) {
      set({ error });
      toast.error(
        error?.response?.data?.message || "Failed to import event items"
      );
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
