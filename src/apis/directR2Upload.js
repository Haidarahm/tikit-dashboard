import axios from "axios";
import { useAuthStore } from "../store/auth.js";
import { useUploadProgressStore } from "../store/uploadProgressStore.js";

const baseURL = import.meta.env.VITE_BASE_URL || "";

const MEDIA_MIME_PREFIXES = ["image/", "video/"];
const SKIP_NAME_HINTS = ["xlsx", "xls", "csv", "pdf", "doc", "docx"];

function isMediaFile(value) {
  if (typeof File === "undefined" || !(value instanceof File)) return false;
  const type = String(value.type || "").toLowerCase();
  const name = String(value.name || "").toLowerCase();
  if (SKIP_NAME_HINTS.some((ext) => name.endsWith(`.${ext}`))) return false;
  if (MEDIA_MIME_PREFIXES.some((p) => type.startsWith(p))) return true;
  // Some browsers leave type empty; allow common media extensions.
  return /\.(jpe?g|png|gif|svg|webp|mp4|mov|avi|wmv|webm)$/i.test(name);
}

function shouldSkipDirectUpload(url = "") {
  const path = String(url || "");
  return (
    path.includes("/import") ||
    path.includes("/media/presign") ||
    path.includes("/translate")
  );
}

function resolveFolder(apiUrl = "", fieldName = "", file) {
  const url = String(apiUrl);
  const field = String(fieldName);
  const isVideo =
    String(file?.type || "").startsWith("video/") ||
    /\.(mp4|mov|avi|wmv|webm)$/i.test(file?.name || "");

  if (url.includes("showcase-projects")) {
    if (field.includes("thumbnail") || isVideo) return "uploads/showcase/thumbnails";
    if (field.includes("main_image") || field.includes("logo")) {
      return "uploads/showcase/logos";
    }
    return "uploads/showcase";
  }
  if (url.includes("featured")) {
    if (field.includes("thumbnail") || isVideo) {
      return "uploads/featured-campaigns/thumbnails";
    }
    if (field.includes("main_image") || field.includes("logo")) {
      return "uploads/featured-campaigns/logos";
    }
    return "uploads/featured-campaigns";
  }
  if (url.includes("about-us-banners") || url.includes("about-banners")) {
    return "AboutUsBanners";
  }
  if (url.includes("banners") || url.includes("/banner")) return "banners";
  if (url.includes("work-influences")) {
    if (field.includes("reel") || isVideo) return "uploads/work_influences/reels";
    if (field.includes("logo")) return "uploads/work_influences/logos";
    return "uploads/work_influences/media";
  }
  if (url.includes("work-digitals")) return "uploads/work_digitals/logos";
  if (url.includes("/teams") || url.includes("/team")) return "teams/images";
  if (url.includes("/jobs")) return "jobs";
  if (url.includes("/cases")) return "cases";
  if (url.includes("/blogs") || url.includes("/news")) return "news";
  if (url.includes("/sections")) return "sections";
  if (url.includes("/influencers")) return "influencers";
  if (url.includes("/works")) return "works";
  if (url.includes("/admins") || url.includes("profile")) return "admins";

  return isVideo ? "uploads/dashboard/videos" : "uploads/dashboard/images";
}

async function presignUpload({ folder, filename, contentType }) {
  const token = useAuthStore.getState().token;
  const { data } = await axios.post(
    `${baseURL}/media/presign`,
    {
      folder,
      filename,
      content_type: contentType || "application/octet-stream",
    },
    {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        Accept: "application/json",
      },
    }
  );

  if (!data?.status || !data?.data?.upload_url || !data?.data?.public_url) {
    throw new Error(data?.message || "Failed to get upload URL");
  }
  return data.data;
}

/**
 * PUT file directly to R2 using a presigned URL (real browser upload progress).
 */
export async function uploadFileToR2(file, { folder, onProgress } = {}) {
  const contentType = file.type || "application/octet-stream";
  const signed = await presignUpload({
    folder: folder || "uploads/dashboard",
    filename: file.name || "upload.bin",
    contentType,
  });

  await axios.put(signed.upload_url, file, {
    headers: {
      "Content-Type": signed.content_type || contentType,
    },
    onUploadProgress: (event) => {
      if (!event.total || typeof onProgress !== "function") return;
      onProgress({
        loaded: event.loaded,
        total: event.total,
        percent: (event.loaded * 100) / event.total,
      });
    },
  });

  return signed.public_url;
}

/**
 * Replace media File entries in FormData with public R2 URLs.
 * Non-media files (Excel, etc.) are left untouched.
 * Falls back to original files if R2 upload fails.
 */
export async function rewriteFormDataFilesToR2(formData, apiUrl = "") {
  if (shouldSkipDirectUpload(apiUrl)) {
    return { formData, uploadId: null };
  }
  if (typeof FormData === "undefined" || !(formData instanceof FormData)) {
    return { formData, uploadId: null };
  }

  const entries = [];
  formData.forEach((value, key) => {
    entries.push([key, value]);
  });

  const mediaEntries = entries.filter(([, value]) => isMediaFile(value));
  if (mediaEntries.length === 0) {
    return { formData, uploadId: null };
  }

  const uploadId = `r2-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const {
    startUpload,
    updateUploadBytes,
    startProcessing,
    finishUpload,
  } = useUploadProgressStore.getState();

  startUpload(uploadId);

  const totalBytes = mediaEntries.reduce(
    (sum, [, file]) => sum + (file.size || 0),
    0
  );
  let uploadedBytes = 0;
  const fileLoaded = new Map();

  try {
    const replacements = new Map();

    for (const [fieldName, file] of mediaEntries) {
      const folder = resolveFolder(apiUrl, fieldName, file);
      const publicUrl = await uploadFileToR2(file, {
        folder,
        onProgress: ({ loaded }) => {
          fileLoaded.set(file, loaded);
          uploadedBytes = [...fileLoaded.values()].reduce((a, b) => a + b, 0);
          if (totalBytes > 0) {
            updateUploadBytes(uploadId, (uploadedBytes * 100) / totalBytes);
          }
        },
      });
      fileLoaded.set(file, file.size || 0);
      uploadedBytes = [...fileLoaded.values()].reduce((a, b) => a + b, 0);
      if (totalBytes > 0) {
        updateUploadBytes(uploadId, (uploadedBytes * 100) / totalBytes);
      }
      replacements.set(file, publicUrl);
    }

    startProcessing(uploadId);

    const next = new FormData();
    for (const [key, value] of entries) {
      if (replacements.has(value)) {
        next.append(key, replacements.get(value));
      } else {
        next.append(key, value);
      }
    }

    return { formData: next, uploadId };
  } catch (error) {
    finishUpload(uploadId);
    // Fall back to classic multipart through Laravel.
    console.warn(
      "Direct R2 upload failed; falling back to server upload.",
      error
    );
    return { formData, uploadId: null };
  }
}
