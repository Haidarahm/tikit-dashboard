import { apiClient } from "../client.js";

export async function getItems({ slug, page, per_page, lang } = {}) {
  if (!slug) {
    throw new Error("Slug is required");
  }
  const params = {};
  if (page != null) params.page = page;
  if (per_page != null) params.per_page = per_page;
  if (lang != null) params.lang = lang;
  const { data } = await apiClient.get(`/work-influences/${slug}`, { params });
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
    "brief_en",
    "brief_ar",
    "brief_fr",
    "strategy_en",
    "strategy_ar",
    "strategy_fr",
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
    payload.images.forEach((image) => {
      if (image) {
        formData.append(`images[]`, image);
      }
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
    "brief_en",
    "brief_ar",
    "brief_fr",
    "strategy_en",
    "strategy_ar",
    "strategy_fr",
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
    payload.images.forEach((image) => {
      if (image) {
        formData.append(`images[]`, image);
      }
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
