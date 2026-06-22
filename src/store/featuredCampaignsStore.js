import { create } from "zustand";
import { toast } from "react-toastify";
import {
  getFeaturedCampaigns,
  addFeaturedCampaign,
  updateFeaturedCampaign,
  deleteFeaturedCampaign,
} from "../apis/featuredCampaigns.js";

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

  fetchList: async () => {
    const { page, perPage, lang } = get();
    set({ isLoading: true, error: null });
    try {
      const resp = await getFeaturedCampaigns({
        page,
        per_page: perPage,
        lang,
      });
      const rawItems = Array.isArray(resp?.data)
        ? resp.data
        : Array.isArray(resp)
        ? resp
        : [];
      const items = rawItems.map((item) => ({
        ...item,
        main_image: item.main_image ?? item.logo ?? null,
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
      const { items, page } = get();
      if (items.length === 0 && page > 1) {
        set({ page: page - 1 });
        await get().fetchList();
      }
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
}));
