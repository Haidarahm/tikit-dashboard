import { create } from "zustand";
import { toast } from "react-toastify";
import {
  getVideos,
  addVideo,
  updateVideo,
  deleteVideo,
} from "../apis/banners/banner";

export const useBannerStore = create((set, get) => ({
  items: [],
  total: 0,
  page: 1,
  perPage: 5,
  current: null,
  isLoading: false,
  error: null,

  setPage: (page) => set({ page }),
  setPerPage: (perPage) => set({ perPage }),

  fetchList: async () => {
    const { page, perPage } = get();
    set({ isLoading: true, error: null });
    try {
      const resp = await getVideos({
        page,
        per_page: perPage,
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
      const created = await addVideo(payload);
      set({ current: created?.data || created });
      await get().fetchList();
      toast.success("Video added successfully");
      return created;
    } catch (error) {
      set({ error });
      toast.error(error?.response?.data?.message || "Failed to add video");
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  update: async (id, payload) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await updateVideo(id, payload);
      set({ current: updated?.data || updated });
      await get().fetchList();
      toast.success("Video updated successfully");
      return updated;
    } catch (error) {
      set({ error });
      toast.error(error?.response?.data?.message || "Failed to update video");
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
      const { items, page } = get();
      if (items.length === 0 && page > 1) {
        set({ page: page - 1 });
        await get().fetchList();
      }
      toast.success("Video deleted successfully");
    } catch (error) {
      set({ error });
      toast.error(error?.response?.data?.message || "Failed to delete video");
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
