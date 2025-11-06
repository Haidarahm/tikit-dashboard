import { create } from "zustand";
import { toast } from "react-toastify";
import {
  getItems,
  addItem,
  updateItem,
  deleteItem,
} from "../../apis/work/influencersItems.js";

export const useInfluencersItemsStore = create((set, get) => ({
  items: [],
  total: 0,
  page: 1,
  perPage: 5,
  workId: null,
  current: null,
  isLoading: false,
  error: null,

  setWorkId: (workId) => set({ workId }),
  setPage: (page) => set({ page }),
  setPerPage: (perPage) => set({ perPage }),

  fetchList: async (workId = null) => {
    const { page, perPage } = get();
    const targetWorkId = workId ?? get().workId;
    if (!targetWorkId) {
      set({ items: [], total: 0 });
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const resp = await getItems({
        work_id: targetWorkId,
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
}));
