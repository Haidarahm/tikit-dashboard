import { apiClient } from "../client.js";

export async function getSocialItems({ work_id, page, per_page, lang } = {}) {
  const params = {};
  if (work_id != null) params.work_id = work_id;
  if (page != null) params.page = page;
  if (per_page != null) params.per_page = per_page;
  if (lang != null) params.lang = lang;
  const { data } = await apiClient.get("/api/work-socials/get", { params });
  return data;
}

export async function createSocial(payload) {
  const formData = new FormData();

  // Add regular fields
  const fields = [
    "work_id",
    "follower_growth",
    "engagement_rate",
    "objective_ar",
    "objective_en",
    "objective_fr",
    "approach_ar",
    "approach_en",
    "approach_fr",
    "title_en",
    "title_ar",
    "title_fr",
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
    payload.images.forEach((image, index) => {
      if (image) {
        formData.append(`images[${index}]`, image);
      }
    });
  }

  const { data } = await apiClient.post("/api/work-socials/add", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function updateSocial(id, payload) {
  const formData = new FormData();

  // Add regular fields
  const fields = [
    "work_id",
    "follower_growth",
    "engagement_rate",
    "objective_ar",
    "objective_en",
    "objective_fr",
    "approach_ar",
    "approach_en",
    "approach_fr",
    "title_en",
    "title_ar",
    "title_fr",
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
    payload.images.forEach((image, index) => {
      if (image) {
        formData.append(`images[${index}]`, image);
      }
    });
  }

  const { data } = await apiClient.post(
    `/api/work-socials/${id}/update`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return data;
}

export async function deleteSocial(id) {
  const { data } = await apiClient.delete(`/api/work-socials/${id}/delete`);
  return data;
}
