import { create } from "zustand";
import { toast } from "react-toastify";
import {
  getAllTeamMembers,
  addTeamMember,
  updateTeamMember,
  deleteTeamMember,
} from "../../apis/team/teamMembers.js";

export const useTeamMembersStore = create((set, get) => ({
  items: [],
  total: 0,
  page: 1,
  perPage: 10,
  typeId: null,
  current: null,
  isLoading: false,
  error: null,

  setTypeId: (typeId) => set({ typeId }),
  setPage: (page) => set({ page }),
  setPerPage: (perPage) => set({ perPage }),
  setCurrent: (current) => set({ current }),

  fetchList: async (typeIdParam) => {
    const { typeId } = get();
    const effectiveTypeId = typeIdParam ?? typeId;
    if (!effectiveTypeId) {
      set({ items: [], total: 0 });
      return [];
    }
    set({ isLoading: true, error: null });
    try {
      const resp = await getAllTeamMembers(effectiveTypeId);
      const items = Array.isArray(resp?.data)
        ? resp.data
        : Array.isArray(resp)
        ? resp
        : [];
      const total = resp?.pagination?.total ?? resp?.total ?? items.length;
      set({ items, total, typeId: effectiveTypeId });
      return items;
    } catch (error) {
      set({ error });
      toast.error(
        error?.response?.data?.message || "Failed to load team members"
      );
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  create: async (payload, typeIdParam) => {
    const { typeId } = get();
    const effectiveTypeId = typeIdParam ?? typeId;
    if (!effectiveTypeId) {
      toast.error("Team type is required to create a team member");
      return null;
    }
    set({ isLoading: true, error: null });
    try {
      const created = await addTeamMember(effectiveTypeId, payload);
      set({ current: created?.data || created, typeId: effectiveTypeId });
      await get().fetchList(effectiveTypeId);
      toast.success("Team member created successfully");
      return created;
    } catch (error) {
      set({ error });
      toast.error(
        error?.response?.data?.message || "Failed to create team member"
      );
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  update: async (id, payload) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await updateTeamMember(id, payload);
      set({ current: updated?.data || updated });
      await get().fetchList();
      toast.success("Team member updated successfully");
      return updated;
    } catch (error) {
      set({ error });
      toast.error(
        error?.response?.data?.message || "Failed to update team member"
      );
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  remove: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await deleteTeamMember(id);
      await get().fetchList();
      toast.success("Team member deleted successfully");
    } catch (error) {
      set({ error });
      toast.error(
        error?.response?.data?.message || "Failed to delete team member"
      );
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
