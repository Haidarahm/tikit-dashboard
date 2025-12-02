import { create } from "zustand";
import { toast } from "react-toastify";
import {
  getAllRegisteredInfluencers,
  updateInfluencerStatus,
} from "../apis/registeredInfluencers.js";

export const useRegisteredInfluencersStore = create((set, get) => ({
  items: [],
  total: 0,
  page: 1,
  perPage: 25,
  isLoading: false,
  error: null,

  setPage: (page) => set({ page }),
  setPerPage: (perPage) => set({ perPage }),

  fetchList: async () => {
    const { page, perPage } = get();
    set({ isLoading: true, error: null });
    try {
      const resp = await getAllRegisteredInfluencers({
        page,
        per_page: perPage,
      });
      const items = Array.isArray(resp?.data) ? resp.data : [];
      const total = resp?.pagination?.total ?? items.length;
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
        error?.response?.data?.message ||
          "Failed to fetch registered influencers"
      );
    } finally {
      set({ isLoading: false });
    }
  },

  updateStatus: async (id, status) => {
    set({ isLoading: true, error: null });
    try {
      await updateInfluencerStatus(id, status);
      await get().fetchList();
      toast.success(`Influencer ${status} successfully`);
    } catch (error) {
      set({ error });
      toast.error(
        error?.response?.data?.message || "Failed to update influencer status"
      );
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
