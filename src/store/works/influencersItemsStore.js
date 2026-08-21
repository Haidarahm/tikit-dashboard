import { create } from "zustand";
import { toast } from "react-toastify";
import {
  getItemsAdmin,
  addItem,
  updateItem,
  deleteItem,
  importExcelfile,
  reorderInfluencerItems,
} from "../../apis/work/influencersItems.js";
import { getWorksSections } from "../../apis/work/worksSection.js";
import { createSectionItemActions } from "../content/sectionItemActions.js";
import { localizeSectionItem } from "../content/localizeSectionItem.js";
import { WORK_INFLUENCE_SECTION } from "../../constants/contentSections.js";

/**
 * GET /work-influences/admin/all is not scoped to a work, so the page resolves
 * the work behind the URL slug and filters the list with it.
 */
async function resolveWorkIdBySlug(slug) {
  const resp = await getWorksSections({ per_page: 500 });
  const works = Array.isArray(resp?.data) ? resp.data : [];
  return works.find((work) => work?.slug === slug)?.id ?? null;
}

/** Maps the admin payload onto the media shape the influence page expects. */
function normalizeInfluenceItem(item, lang) {
  const localized = localizeSectionItem(item, lang);
  return {
    ...localized,
    title_ar: item.title_ar ?? "",
    title_fr: item.title_fr ?? "",
    subtitle_ar: item.subtitle_ar ?? "",
    subtitle_fr: item.subtitle_fr ?? "",
    objective_ar: item.objective_ar ?? "",
    objective_fr: item.objective_fr ?? "",
    brief_ar: item.brief_ar ?? "",
    brief_fr: item.brief_fr ?? "",
    strategy_ar: item.strategy_ar ?? "",
    strategy_fr: item.strategy_fr ?? "",
    approach_ar: item.approach_ar ?? "",
    approach_fr: item.approach_fr ?? "",
    logo: item.main_image ?? item.logo ?? null,
    media_items: Array.isArray(item.media) ? item.media : [],
    media: Array.isArray(item.images) ? item.images : [],
    reels: Array.isArray(item.videos) ? item.videos : [],
  };
}

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
      const [workId, resp] = await Promise.all([
        resolveWorkIdBySlug(targetSlug),
        getItemsAdmin(),
      ]);
      const rawItems = Array.isArray(resp?.data)
        ? resp.data
        : Array.isArray(resp)
        ? resp
        : [];
      const scopedItems =
        workId == null
          ? []
          : rawItems.filter((item) => Number(item?.work_id) === Number(workId));
      const normalizedItems = scopedItems.map((item) =>
        normalizeInfluenceItem(item, lang)
      );
      if (workId == null) {
        toast.error("Could not resolve the work for this page");
      }
      const lastPage = Math.max(1, Math.ceil(normalizedItems.length / perPage));
      set({
        items: normalizedItems,
        total: normalizedItems.length,
        page: Math.min(page, lastPage),
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

  reorder: async (reorderedPageItems) => {
    const { items: prevItems, page, perPage } = get();
    const start = (page - 1) * perPage;
    const nextItems = [
      ...prevItems.slice(0, start),
      ...reorderedPageItems,
      ...prevItems.slice(start + reorderedPageItems.length),
    ];
    set({ items: nextItems });
    const orders = nextItems.map((item, index) => ({
      id: item.id,
      sort_order: index + 1,
    }));
    try {
      await reorderInfluencerItems(orders);
      toast.success("Order updated successfully");
    } catch (error) {
      set({ items: prevItems, error });
      toast.error(
        error?.response?.data?.message || "Failed to update order"
      );
      throw error;
    }
  },

  ...createSectionItemActions({
    section: WORK_INFLUENCE_SECTION,
    entityLabel: "Influencer item",
    set,
    get,
  }),
}));
