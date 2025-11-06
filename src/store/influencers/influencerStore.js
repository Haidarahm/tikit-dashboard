import { create } from "zustand";
import { toast } from "react-toastify";
import {
  getInfluencers,
  addInfluencer,
  updateInfluencer,
  deleteInfluencer,
} from "../../apis/influencers/influencer.js";

export const useInfluencerStore = create((set, get) => ({
  items: [],
  total: 0,
  page: 1,
  perPage: 10,
  lang: "en",
  sectionId: null,
  current: null,
  isLoading: false,
  error: null,

  setPage: (page) => set({ page }),
  setPerPage: (perPage) => set({ perPage }),
  setLang: (lang) => set({ lang }),
  setSectionId: (sectionId) => set({ sectionId }),

  fetchList: async (sectionId = null) => {
    const { page, perPage, lang } = get();
    const targetSectionId = sectionId ?? get().sectionId;

    if (!targetSectionId) {
      console.warn("Section ID is required to fetch influencers");
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const resp = await getInfluencers(targetSectionId, {
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
        error?.response?.data?.message || "Failed to fetch influencers"
      );
    } finally {
      set({ isLoading: false });
    }
  },

  create: async (payload, sectionId = null) => {
    set({ isLoading: true, error: null });
    try {
      const targetSectionId = sectionId ?? get().sectionId;
      if (!targetSectionId) {
        throw new Error("Section ID is required to create influencer");
      }
      const created = await addInfluencer(targetSectionId, payload);
      set({ current: created });
      await get().fetchList();
      toast.success("Influencer created successfully");
      return created;
    } catch (error) {
      set({ error });
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to create influencer"
      );
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  update: async (id, payload) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await updateInfluencer(id, payload);
      set({ current: updated });
      await get().fetchList();
      toast.success("Influencer updated successfully");
      return updated;
    } catch (error) {
      set({ error });
      toast.error(
        error?.response?.data?.message || "Failed to update influencer"
      );
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  remove: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await deleteInfluencer(id);
      await get().fetchList();
      toast.success("Influencer deleted successfully");
    } catch (error) {
      set({ error });
      toast.error(
        error?.response?.data?.message || "Failed to delete influencer"
      );
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
