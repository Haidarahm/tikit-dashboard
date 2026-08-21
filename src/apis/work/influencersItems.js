import { apiClient } from "../client.js";

/**
 * Dashboard listing: every work influence across all works, including the ones
 * hidden from the public website. Callers scope it to a work themselves.
 * GET /work-influences/{work_slug} is deliberately not used here, because it
 * filters out inactive items and an admin would lose the way to re-enable them.
 */
export async function getItemsAdmin() {
  const { data } = await apiClient.get("/work-influences/admin/all");
  return data;
}

export async function getItemAdmin(id) {
  const { data } = await apiClient.get(`/work-influences/admin/show/${id}`);
  return data;
}

export async function addItem(payload) {
  const formData = new FormData();

  // Add regular fields
  const fields = [
    "work_id",
    "title_en",
    "title_ar",
    "title_fr",
    "subtitle_en",
    "subtitle_ar",
    "subtitle_fr",
    "brief_en",
    "brief_ar",
    "brief_fr",
    "strategy_en",
    "strategy_ar",
    "strategy_fr",
    "approach_en",
    "approach_ar",
    "approach_fr",
    "reach",
    "views",
    "objective_ar",
    "objective_en",
    "objective_fr",
    "engagement_rate",
  ];
  fields.forEach((f) => {
    if (payload[f] != null) formData.append(f, payload[f]);
  });

  // Add logo
  if (payload?.logo) {
    formData.append("logo", payload.logo);
  }

  // Add multiple images
  if (payload?.images && Array.isArray(payload.images)) {
    payload.images
      .filter(Boolean)
      .forEach((image, idx) => {
        formData.append(`images[${idx}]`, image);
      });
  }

  // Add reels (videos): reels[index]
  if (payload?.reels && Array.isArray(payload.reels)) {
    payload.reels.forEach((reel, idx) => {
      if (reel) {
        formData.append(`reels[${idx}]`, reel);
      }
    });
  }

  const { data } = await apiClient.post("/work-influences/add", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function updateItem(id, payload) {
  const formData = new FormData();

  // Add regular fields
  const fields = [
    "work_id",
    "title_en",
    "title_ar",
    "title_fr",
    "subtitle_en",
    "subtitle_ar",
    "subtitle_fr",
    "brief_en",
    "brief_ar",
    "brief_fr",
    "strategy_en",
    "strategy_ar",
    "strategy_fr",
    "approach_en",
    "approach_ar",
    "approach_fr",
    "reach",
    "views",
    "objective_ar",
    "objective_en",
    "objective_fr",
    "engagement_rate",
  ];
  fields.forEach((f) => {
    if (payload[f] != null) formData.append(f, payload[f]);
  });

  // Add logo
  if (payload?.logo) {
    formData.append("logo", payload.logo);
  }

  // Add multiple images
  if (payload?.images && Array.isArray(payload.images)) {
    payload.images
      .filter(Boolean)
      .forEach((image, idx) => {
        formData.append(`images[${idx}]`, image);
      });
  }

  // Add reels (videos): reels[index]
  if (payload?.reels && Array.isArray(payload.reels)) {
    payload.reels.forEach((reel, idx) => {
      if (reel) {
        formData.append(`reels[${idx}]`, reel);
      }
    });
  }

  if (Array.isArray(payload?.remove_media_ids)) {
    payload.remove_media_ids.forEach((id, index) => {
      if (id != null && id !== "") {
        formData.append(`remove_media_ids[${index}]`, Number(id));
      }
    });
  }

  const { data } = await apiClient.post(
    `/work-influences/${id}/update`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return data;
}

export async function importExcelfile(slug, file) {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await apiClient.post(
    `/work-influences/${slug}/import`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
}

export async function deleteItem(id) {
  const { data } = await apiClient.delete(`/work-influences/${id}/delete`);
  return data;
}

export async function reorderInfluencerItems(orders) {
  const { data } = await apiClient.post("/work-influences/reorder", { orders });
  return data;
}
