import { create } from "zustand";
import { toast } from "react-toastify";
import { translate } from "../apis/translate.js";

export const useTranslateStore = create((set) => ({
  isTranslating: false,
  lastResult: null,
  error: null,

  /**
   * Translate English text to EN/AR/FR via backend /translate.
   * @param {string} text
   * @returns {Promise<{ en: string; ar: string; fr: string } | null>}
   */
  translateText: async (text) => {
    if (!text || !String(text).trim()) {
      toast.warning("Please enter English text to translate.");
      return null;
    }

    set({ isTranslating: true, error: null });
    try {
      const result = await translate(String(text).trim());
      set({ lastResult: result });
      return result;
    } catch (error) {
      set({ error });
      toast.error(
        error?.response?.data?.message || "Failed to translate text. Please try again."
      );
      throw error;
    } finally {
      set({ isTranslating: false });
    }
  },
}));

