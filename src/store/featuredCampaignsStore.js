import { create } from "zustand";
import { toast } from "react-toastify";
import {
  getFeaturedCampaignsAdmin,
  addFeaturedCampaign,
  updateFeaturedCampaign,
  deleteFeaturedCampaign,
  reorderFeaturedCampaigns,
} from "../apis/featuredCampaigns.js";
import { createSectionItemActions } from "./content/sectionItemActions.js";
import { localizeSectionItem } from "./content/localizeSectionItem.js";
import { FEATURED_CAMPAIGN_SECTION } from "../constants/contentSections.js";

export const useFeaturedCampaignsStore = create((set, get) => ({
  items: [],
  total: 0,
  page: 1,
  perPage: 10,
  lang: "en",
  isLoading: false,
  error: null,

  setPage: (page) => set({ page }),
  setPerPage: (perPage) => set({ perPage }),
  setLang: (lang) => set({ lang, page: 1 }),

  // GET /featured/admin/all returns every campaign (including inactive ones) as
  // a plain array, so paging and language are resolved on the client.
  fetchList: async () => {
    const { page, perPage, lang } = get();
    set({ isLoading: true, error: null });
    try {
      const resp = await getFeaturedCampaignsAdmin();
      const rawItems = Array.isArray(resp?.data)
        ? resp.data
        : Array.isArray(resp)
        ? resp
        : [];
      const items = rawItems.map((item) => localizeSectionItem(item, lang));
      const lastPage = Math.max(1, Math.ceil(items.length / perPage));
      set({
        items,
        total: items.length,
        page: Math.min(page, lastPage),
      });
    } catch (error) {
      set({ error });
      toast.error(
        error?.response?.data?.message || "Failed to fetch featured campaigns"
      );
    } finally {
      set({ isLoading: false });
    }
  },

  create: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const created = await addFeaturedCampaign(payload);
      await get().fetchList();
      toast.success("Featured campaign added successfully");
      return created;
    } catch (error) {
      set({ error });
      toast.error(
        error?.response?.data?.message || "Failed to add featured campaign"
      );
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  update: async (id, payload) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await updateFeaturedCampaign(id, payload);
      await get().fetchList();
      toast.success("Featured campaign updated successfully");
      return updated;
    } catch (error) {
      set({ error });
      toast.error(
        error?.response?.data?.message || "Failed to update featured campaign"
      );
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  remove: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await deleteFeaturedCampaign(id);
      await get().fetchList();
      toast.success("Featured campaign deleted successfully");
    } catch (error) {
      set({ error });
      toast.error(
        error?.response?.data?.message || "Failed to delete featured campaign"
      );
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  reorder: async (reorderedItems) => {
    const prevItems = get().items;
    set({ items: reorderedItems });
    const orders = reorderedItems.map((item, index) => ({
      id: item.id,
      sort_order: index + 1,
    }));
    try {
      await reorderFeaturedCampaigns(orders);
      toast.success("Order updated successfully");
    } catch (error) {
      set({ items: prevItems, error });
      toast.error(error?.response?.data?.message || "Failed to update order");
      throw error;
    }
  },

  ...createSectionItemActions({
    section: FEATURED_CAMPAIGN_SECTION,
    entityLabel: "Featured campaign",
    set,
    get,
  }),
}));
