import { create } from "zustand";
import { toast } from "react-toastify";
import {
  getAllBannerVideo,
  addBannerVideo,
  updateVideo,
  deleteVideo,
} from "../apis/banners/aboutBannser.js";

const normalizeResponse = (response, fallbackPage, fallbackPerPage) => {
  if (!response) {
    return {
      items: [],
      total: 0,
      page: fallbackPage,
      perPage: fallbackPerPage,
    };
  }

  const rawData = response?.data;
  const items = Array.isArray(rawData)
    ? rawData
    : Array.isArray(response)
    ? response
    : [];

  const pagination = response?.pagination || {};

  return {
    items,
    total: pagination?.total ?? items.length,
    page: pagination?.current_page ?? fallbackPage,
    perPage: pagination?.per_page ?? fallbackPerPage,
  };
};

export const useAboutBannerStore = create((set, get) => ({
  items: [],
  total: 0,
  page: 1,
  perPage: 5,
  isLoading: false,
  error: null,

  setPage: (page) => set({ page }),
  setPerPage: (perPage) => set({ perPage }),

  fetchList: async () => {
    const { page, perPage } = get();
    set({ isLoading: true, error: null });
    try {
      const response = await getAllBannerVideo({ page, per_page: perPage });
      const normalized = normalizeResponse(response, page, perPage);
      set({
        items: normalized.items,
        total: normalized.total,
        page: normalized.page,
        perPage: normalized.perPage,
      });
    } catch (error) {
      set({ error });
      toast.error(error?.response?.data?.message || "Failed to fetch banners");
    } finally {
      set({ isLoading: false });
    }
  },

  create: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const created = await addBannerVideo(payload);
      await get().fetchList();
      toast.success("About banner added successfully");
      return created;
    } catch (error) {
      set({ error });
      toast.error(
        error?.response?.data?.message || "Failed to add about banner"
      );
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  update: async (id, payload) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await updateVideo(id, payload);
      await get().fetchList();
      toast.success("About banner updated successfully");
      return updated;
    } catch (error) {
      set({ error });
      toast.error(
        error?.response?.data?.message || "Failed to update about banner"
      );
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  remove: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await deleteVideo(id);
      await get().fetchList();
      toast.success("About banner deleted successfully");
    } catch (error) {
      set({ error });
      toast.error(
        error?.response?.data?.message || "Failed to delete about banner"
      );
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
