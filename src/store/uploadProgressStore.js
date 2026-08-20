import { create } from "zustand";

const processingTimers = new Map();

function clearProcessingTimer(id) {
  const timer = processingTimers.get(id);
  if (timer) {
    clearInterval(timer);
    processingTimers.delete(id);
  }
}

/**
 * Tracks only what the browser can truly measure:
 * - uploading: bytes sent to Laravel (real %)
 * - processing: waiting for Laravel → R2/DB (indeterminate; no fake %)
 */
export const useUploadProgressStore = create((set, get) => ({
  /**
   * @type {Record<string, { percent: number | null, phase: "uploading" | "processing" }>}
   */
  uploads: {},

  startUpload: (id) => {
    clearProcessingTimer(id);
    set((state) => ({
      uploads: {
        ...state.uploads,
        [id]: { percent: 0, phase: "uploading" },
      },
    }));
  },

  /** @param {string} id @param {number} uploadPercent 0–100 of request body transferred */
  updateUploadBytes: (id, uploadPercent) => {
    const clamped = Math.max(0, Math.min(100, Math.round(uploadPercent)));
    set((state) => {
      if (!(id in state.uploads)) return state;
      return {
        uploads: {
          ...state.uploads,
          [id]: {
            percent: Math.max(state.uploads[id].percent ?? 0, clamped),
            phase: clamped >= 100 ? "processing" : "uploading",
          },
        },
      };
    });
    if (clamped >= 100) {
      get().startProcessing(id);
    }
  },

  startProcessing: (id) => {
    if (!get().uploads[id]) return;
    clearProcessingTimer(id);
    set((state) => {
      if (!(id in state.uploads)) return state;
      return {
        uploads: {
          ...state.uploads,
          [id]: { percent: null, phase: "processing" },
        },
      };
    });
  },

  finishUpload: (id) => {
    clearProcessingTimer(id);
    set((state) => {
      if (!(id in state.uploads)) return state;
      const next = { ...state.uploads };
      delete next[id];
      return { uploads: next };
    });
  },
}));
