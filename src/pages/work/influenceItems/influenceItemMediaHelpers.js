/** Gallery images: prefer `media_items` (with ids), else `media` URL list. */
export function deriveInfluenceImageMediaItems(item) {
  if (Array.isArray(item?.media_items) && item.media_items.length > 0) {
    return item.media_items
      .filter((m) => m?.type === "image" && m?.file)
      .map((m) => ({ id: m?.id ?? null, url: m.file }));
  }
  if (Array.isArray(item?.media) && item.media.length > 0) {
    return item.media.filter(Boolean).map((url) => ({ id: null, url }));
  }
  return [];
}

/** Reels: prefer `media_items` (type reel), else `reels` URL list. */
export function deriveInfluenceReelMediaItems(item) {
  if (Array.isArray(item?.media_items) && item.media_items.length > 0) {
    return item.media_items
      .filter(
        (m) =>
          (m?.type === "reel" || m?.type === "video") && m?.file
      )
      .map((m) => ({ id: m?.id ?? null, url: m.file }));
  }
  if (Array.isArray(item?.reels) && item.reels.length > 0) {
    return item.reels.filter(Boolean).map((url) => ({ id: null, url }));
  }
  return [];
}
