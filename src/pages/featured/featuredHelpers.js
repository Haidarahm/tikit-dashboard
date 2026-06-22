/** Ant Design Upload `fileList` entry for an existing remote file URL. */
export function remoteUrlToUploadFile(url, { uidSuffix = "", mediaId = null } = {}) {
  if (url == null || String(url).trim() === "") return null;
  const str = String(url);
  const name = str.split("/").pop() || "file";
  return {
    uid: uidSuffix ? `${uidSuffix}-${str}` : str,
    name,
    status: "done",
    url: str,
    mediaId,
  };
}

export function deriveGalleryImageItems(campaign) {
  if (Array.isArray(campaign?.media) && campaign.media.length > 0) {
    return campaign.media
      .filter((m) => m?.type === "image" && m?.file)
      .map((m) => ({ id: m?.id ?? null, url: m.file }));
  }
  if (Array.isArray(campaign?.images) && campaign.images.length > 0) {
    return campaign.images.filter(Boolean).map((url) => ({ id: null, url }));
  }
  return [];
}

export function deriveVideoItems(campaign) {
  if (Array.isArray(campaign?.media) && campaign.media.length > 0) {
    return campaign.media
      .filter((m) => m?.type === "video" && m?.file)
      .map((m) => ({ id: m?.id ?? null, url: m.file }));
  }
  if (Array.isArray(campaign?.videos) && campaign.videos.length > 0) {
    return campaign.videos.filter(Boolean).map((url) => ({ id: null, url }));
  }
  return [];
}

export function extractExistingMediaId(file) {
  if (file?.originFileObj) return null;
  if (file?.mediaId != null) {
    const n = Number(file.mediaId);
    return Number.isInteger(n) ? n : null;
  }
  return null;
}

export function buildFeaturedPayload(values, logoList, imagesList, videosList) {
  const payload = { ...values };
  if (logoList[0]?.originFileObj) {
    payload.main_image = logoList[0].originFileObj;
  }
  const imageFiles = imagesList
    .map((file) => file.originFileObj)
    .filter(Boolean);
  if (imageFiles.length > 0) {
    payload.images = imageFiles;
  }
  const videoFiles = videosList
    .map((file) => file.originFileObj)
    .filter(Boolean);
  if (videoFiles.length > 0) {
    payload.thumbnails = videoFiles;
  }
  return payload;
}

export const EMPTY_TRANSLATION_FIELDS = {
  title_ar: "",
  title_fr: "",
  subtitle_ar: "",
  subtitle_fr: "",
  objective_ar: "",
  objective_fr: "",
  brief_ar: "",
  brief_fr: "",
  strategy_ar: "",
  strategy_fr: "",
};

/**
 * @param {(text: string) => Promise<{ ar?: string; fr?: string } | null>} translateText
 */
export async function translateFeaturedFields(translateText, fields) {
  const {
    title_en,
    subtitle_en,
    objective_en,
    brief_en,
    strategy_en,
  } = fields;
  const out = { ...EMPTY_TRANSLATION_FIELDS };

  const translatePlain = async (text, field) => {
    if (!text || !String(text).trim()) return;
    const result = await translateText(String(text).trim());
    if (result) {
      out[`${field}_ar`] = result.ar ?? "";
      out[`${field}_fr`] = result.fr ?? "";
    }
  };

  await translatePlain(title_en, "title");
  await translatePlain(subtitle_en, "subtitle");
  await translatePlain(objective_en, "objective");
  await translatePlain(brief_en, "brief");
  await translatePlain(strategy_en, "strategy");

  return out;
}

export function parseEngagementRate(campaign) {
  const er = campaign?.engagement_rate;
  if (er == null || er === "") return null;
  const n = Number(er);
  return Number.isFinite(n) ? n : null;
}
