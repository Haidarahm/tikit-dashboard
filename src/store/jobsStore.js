import { create } from "zustand";
import { toast } from "react-toastify";
import {
  getJobs,
  addJob,
  updateJob,
  deleteJob,
} from "../apis/jobs.js";

export const useJobsStore = create((set, get) => ({
  items: [],
  total: 0,
  page: 1,
  perPage: 10,
  isLoading: false,
  error: null,

  setPage: (page) => set({ page }),
  setPerPage: (perPage) => set({ perPage }),

  fetchList: async () => {
    const { page, perPage } = get();
    set({ isLoading: true, error: null });
    try {
      const resp = await getJobs({ page, per_page: perPage });
      const items = Array.isArray(resp?.data)
        ? resp.data
        : Array.isArray(resp)
        ? resp
        : [];
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
      toast.error(error?.response?.data?.message || "Failed to fetch jobs");
    } finally {
      set({ isLoading: false });
    }
  },

  create: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const created = await addJob(payload);
      await get().fetchList();
      toast.success("Job added successfully");
      return created;
    } catch (error) {
      set({ error });
      toast.error(error?.response?.data?.message || "Failed to add job");
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  update: async (id, payload) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await updateJob(id, payload);
      await get().fetchList();
      toast.success("Job updated successfully");
      return updated;
    } catch (error) {
      set({ error });
      toast.error(error?.response?.data?.message || "Failed to update job");
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  remove: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await deleteJob(id);
      await get().fetchList();
      const { items, page } = get();
      if (items.length === 0 && page > 1) {
        set({ page: page - 1 });
        await get().fetchList();
      }
      toast.success("Job deleted successfully");
    } catch (error) {
      set({ error });
      toast.error(error?.response?.data?.message || "Failed to delete job");
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
