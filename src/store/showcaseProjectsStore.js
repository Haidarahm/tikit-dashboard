import { create } from "zustand";
import { toast } from "react-toastify";
import {
  getShowcaseProjectsAdmin,
  addProject,
  updateProject,
  deleteProject,
  importShowcaseProjects,
  reorderShowcaseProjects,
} from "../apis/showcaseProjects.js";
import { createSectionItemActions } from "./content/sectionItemActions.js";
import { localizeSectionItem } from "./content/localizeSectionItem.js";
import { SHOWCASE_PROJECT_SECTION } from "../constants/contentSections.js";

export const useShowcaseProjectsStore = create((set, get) => ({
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

  // GET /showcase-projects/admin/all returns every project (including inactive
  // ones) as a plain array, so paging and language are resolved on the client.
  fetchList: async () => {
    const { page, perPage, lang } = get();
    set({ isLoading: true, error: null });
    try {
      const resp = await getShowcaseProjectsAdmin();
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
        error?.response?.data?.message || "Failed to fetch showcase projects"
      );
    } finally {
      set({ isLoading: false });
    }
  },

  create: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const created = await addProject(payload);
      await get().fetchList();
      toast.success("Showcase project added successfully");
      return created;
    } catch (error) {
      set({ error });
      toast.error(
        error?.response?.data?.message || "Failed to add showcase project"
      );
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  update: async (id, payload) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await updateProject(id, payload);
      await get().fetchList();
      toast.success("Showcase project updated successfully");
      return updated;
    } catch (error) {
      set({ error });
      toast.error(
        error?.response?.data?.message || "Failed to update showcase project"
      );
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  remove: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await deleteProject(id);
      await get().fetchList();
      toast.success("Showcase project deleted successfully");
    } catch (error) {
      set({ error });
      toast.error(
        error?.response?.data?.message || "Failed to delete showcase project"
      );
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  importExcel: async (file) => {
    set({ isLoading: true, error: null });
    try {
      const resp = await importShowcaseProjects(file);
      await get().fetchList();
      toast.success("Showcase projects imported successfully");
      return resp;
    } catch (error) {
      set({ error });
      toast.error(
        error?.response?.data?.message || "Failed to import showcase projects"
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
      await reorderShowcaseProjects(orders);
      toast.success("Order updated successfully");
    } catch (error) {
      set({ items: prevItems, error });
      toast.error(error?.response?.data?.message || "Failed to update order");
      throw error;
    }
  },

  ...createSectionItemActions({
    section: SHOWCASE_PROJECT_SECTION,
    entityLabel: "Showcase project",
    set,
    get,
  }),
}));
