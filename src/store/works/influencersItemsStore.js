import { create } from "zustand";
import { toast } from "react-toastify";
import {
  getItems,
  addItem,
  updateItem,
  deleteItem,
  importExcelfile,
} from "../../apis/work/influencersItems.js";

export const useInfluencersItemsStore = create((set, get) => ({
  items: [],
  total: 0,
  page: 1,
  perPage: 8,
  lang: "en",
  slug: null,
  workId: null,
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
      const resp = await getItems({
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
      const normalizedItems = items.map((item) => ({
        ...item,
        title_en: item.title_en ?? item.title ?? "",
        title_ar: item.title_ar ?? item.title ?? "",
        title_fr: item.title_fr ?? item.title ?? "",
        subtitle_en: item.subtitle_en ?? item.subtitle ?? "",
        subtitle_ar: item.subtitle_ar ?? item.subtitle ?? "",
        subtitle_fr: item.subtitle_fr ?? item.subtitle ?? "",
        objective_en: item.objective_en ?? item.objective ?? "",
        objective_ar: item.objective_ar ?? item.objective ?? "",
        objective_fr: item.objective_fr ?? item.objective ?? "",
        brief_en: item.brief_en ?? item.brief ?? "",
        brief_ar: item.brief_ar ?? item.brief ?? "",
        brief_fr: item.brief_fr ?? item.brief ?? "",
        strategy_en: item.strategy_en ?? item.strategy ?? "",
        strategy_ar: item.strategy_ar ?? item.strategy ?? "",
        strategy_fr: item.strategy_fr ?? item.strategy ?? "",
      }));
      const total = resp?.pagination?.total ?? resp?.total ?? items.length;
      const nextPage = resp?.pagination?.current_page ?? page;
      const nextPerPage = resp?.pagination?.per_page ?? perPage;
      const workId =
        resp?.work?.id ?? resp?.work_id ?? resp?.data?.work_id ?? items[0]?.work_id ?? null;
      set({
        items: normalizedItems,
        total,
        page: nextPage,
        perPage: nextPerPage,
        workId,
      });
    } catch (error) {
      set({ error });
      toast.error(
        error?.response?.data?.message || "Failed to fetch influencer items"
      );
    } finally {
      set({ isLoading: false });
    }
  },

  create: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const created = await addItem(payload);
      set({ current: created?.data || created });
      await get().fetchList();
      toast.success("Influencer item created successfully");
      return created;
    } catch (error) {
      set({ error });
      toast.error(
        error?.response?.data?.message || "Failed to create influencer item"
      );
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  update: async (id, payload) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await updateItem(id, payload);
      set({ current: updated?.data || updated });
      await get().fetchList();
      toast.success("Influencer item updated successfully");
      return updated;
    } catch (error) {
      set({ error });
      toast.error(
        error?.response?.data?.message || "Failed to update influencer item"
      );
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  remove: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await deleteItem(id);
      await get().fetchList();
      toast.success("Influencer item deleted successfully");
    } catch (error) {
      set({ error });
      toast.error(
        error?.response?.data?.message || "Failed to delete influencer item"
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
      toast.success("Influencer items imported successfully");
      return result;
    } catch (error) {
      set({ error });
      toast.error(
        error?.response?.data?.message || "Failed to import influencer items"
      );
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
