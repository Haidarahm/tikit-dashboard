import { create } from "zustand";
import { toast } from "react-toastify";
import { getUsers } from "../apis/subscribedUsers.js";

export const useSubscribedUsersStore = create((set, get) => ({
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
      const resp = await getUsers({
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
      set({
        items,
        total,
        page: nextPage,
        perPage: nextPerPage,
      });
    } catch (error) {
      set({ error });
      toast.error(
        error?.response?.data?.message || "Failed to fetch subscribed users"
      );
    } finally {
      set({ isLoading: false });
    }
  },
}));
