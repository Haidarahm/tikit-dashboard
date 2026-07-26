import { toast } from "react-toastify";
import {
  copySectionItem,
  duplicateSectionItem,
  moveSectionItem,
  setSectionItemActive,
} from "../../apis/contentSections.js";
import {
  buildDroppedFieldsWarning,
  sectionLabel,
} from "../../constants/contentSections.js";

const errorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

const warnAboutDroppedFields = (resp) => {
  const warning = buildDroppedFieldsWarning(resp?.meta);
  if (warning) {
    toast.warning(warning, { autoClose: 8000 });
  }
};

/**
 * Duplicate / copy / move / activate actions shared by the three content
 * sections. Each action refreshes the owning store's list afterwards so the
 * table reflects the server state.
 *
 * @param {{
 *   section: string;
 *   entityLabel: string;
 *   set: (partial: object) => void;
 *   get: () => { fetchList: () => Promise<unknown> };
 * }} params
 */
export const createSectionItemActions = ({ section, entityLabel, set, get }) => ({
  toggleActive: async (id, isActive = null) => {
    set({ error: null });
    try {
      const resp = await setSectionItemActive(section, id, isActive);
      await get().fetchList();
      toast.success(resp?.message || `${entityLabel} updated successfully`);
      return resp;
    } catch (error) {
      set({ error });
      toast.error(
        errorMessage(error, `Failed to update the ${entityLabel.toLowerCase()}`)
      );
      throw error;
    }
  },

  duplicateItem: async (id, options = {}) => {
    set({ isLoading: true, error: null });
    try {
      const resp = await duplicateSectionItem(section, id, options);
      await get().fetchList();
      toast.success(resp?.message || `${entityLabel} duplicated successfully`);
      return resp;
    } catch (error) {
      set({ error });
      toast.error(
        errorMessage(
          error,
          `Failed to duplicate the ${entityLabel.toLowerCase()}`
        )
      );
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  copyItem: async (id, { targetSection, workId } = {}) => {
    set({ isLoading: true, error: null });
    try {
      const resp = await copySectionItem(section, id, { targetSection, workId });
      await get().fetchList();
      toast.success(
        resp?.message ||
          `${entityLabel} copied to ${sectionLabel(targetSection)} successfully`
      );
      warnAboutDroppedFields(resp);
      return resp;
    } catch (error) {
      set({ error });
      toast.error(
        errorMessage(error, `Failed to copy the ${entityLabel.toLowerCase()}`)
      );
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  moveItem: async (id, { targetSection, workId } = {}) => {
    set({ isLoading: true, error: null });
    try {
      const resp = await moveSectionItem(section, id, { targetSection, workId });
      await get().fetchList();
      toast.success(
        resp?.message ||
          `${entityLabel} moved to ${sectionLabel(targetSection)} successfully`
      );
      warnAboutDroppedFields(resp);
      return resp;
    } catch (error) {
      set({ error });
      toast.error(
        errorMessage(error, `Failed to move the ${entityLabel.toLowerCase()}`)
      );
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
});
