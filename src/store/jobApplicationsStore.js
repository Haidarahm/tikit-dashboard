import { create } from "zustand";
import { toast } from "react-toastify";
import {
  getJobApplications,
  updateFullApplicationStatus,
  updateQuickApplicationStatus,
} from "../apis/jobApplications.js";

export const useJobApplicationsStore = create((set, get) => ({
  items: [],
  jobId: null,
  isLoading: false,
  error: null,

  fetchList: async (jobId) => {
    set({ isLoading: true, error: null, jobId });
    try {
      const resp = await getJobApplications(jobId);
      const rawItems = Array.isArray(resp?.data) ? resp.data : [];
      const items = rawItems.map((entry, index) => ({
        rowKey: `${entry.type}-${entry?.data?.id ?? index}`,
        type: entry.type,
        ...entry.data,
      }));
      set({ items });
    } catch (error) {
      set({ error });
      toast.error(
        error?.response?.data?.message || "Failed to fetch applications"
      );
    } finally {
      set({ isLoading: false });
    }
  },

  updateStatus: async (type, id, status) => {
    set({ isLoading: true, error: null });
    try {
      if (type === "quick") {
        await updateQuickApplicationStatus(id, status);
      } else {
        await updateFullApplicationStatus(id, status);
      }
      const { jobId } = get();
      if (jobId != null) {
        await get().fetchList(jobId);
      }
      toast.success("Application status updated successfully");
    } catch (error) {
      set({ error });
      toast.error(
        error?.response?.data?.message || "Failed to update application status"
      );
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  reset: () => set({ items: [], jobId: null, error: null }),
}));
