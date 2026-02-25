import { apiClient } from "../client.js";

export async function getSocialItems({ slug, page, per_page, lang } = {}) {
  if (!slug) {
    throw new Error("Slug is required");
  }
  const params = {};
  if (page != null) params.page = page;
  if (per_page != null) params.per_page = per_page;
  if (lang != null) params.lang = lang;
  const { data } = await apiClient.get(`/work-socials/${slug}`, { params });
  return data;
}

const appendSocialFields = (formData, payload) => {
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
  const numericFields = ["follower_growth", "engagement_rate"];
  fields.forEach((f) => {
    if (payload[f] != null) {
      const val = payload[f];
      formData.append(
        f,
        numericFields.includes(f) && typeof val === "number" ? String(val) : val
      );
    }
  });
};

export async function createSocial(payload) {
  const formData = new FormData();
  appendSocialFields(formData, payload);
  if (payload?.logo) {
    formData.append("logo", payload.logo);
  }
  if (payload?.images && Array.isArray(payload.images)) {
    payload.images.forEach((image) => {
      if (image) {
        formData.append(`images[]`, image);
      }
    });
  }
  const { data } = await apiClient.post("/work-socials/add", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function updateSocial(id, payload) {
  const formData = new FormData();
  appendSocialFields(formData, payload);
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

  const { data } = await apiClient.post(
    `/work-socials/${id}/update`,
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
    `/work-socials/${slug}/import`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
}

export async function deleteSocial(id) {
  const { data } = await apiClient.delete(`/work-socials/${id}/delete`);
  return data;
}
