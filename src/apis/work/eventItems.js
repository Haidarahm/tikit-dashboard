import { apiClient } from "../client.js";

export async function getAllEventItems({ slug, page, per_page, lang } = {}) {
  if (!slug) {
    throw new Error("Slug is required");
  }
  const params = {};
  if (page != null) params.page = page;
  if (per_page != null) params.per_page = per_page;
  if (lang) params.lang = lang;
  const { data } = await apiClient.get(`/work-events/${slug}`, {
    params,
  });
  return data;
}

export async function createEventItem(payload) {
  const formData = new FormData();

  // Add regular fields
  const fields = [
    "work_id",
    "title_en",
    "title_ar",
    "title_fr",
    "objective_en",
    "objective_ar",
    "objective_fr",
  ];
  fields.forEach((f) => {
    if (payload[f] != null && payload[f] !== "") {
      formData.append(f, payload[f]);
    }
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

  const { data } = await apiClient.post("/work-events/add", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function updateEventItem(id, payload) {
  const formData = new FormData();

  // Add regular fields
  const fields = [
    "work_id",
    "title_en",
    "title_ar",
    "title_fr",
    "objective_en",
    "objective_ar",
    "objective_fr",
  ];
  fields.forEach((f) => {
    if (payload[f] != null && payload[f] !== "") {
      formData.append(f, payload[f]);
    }
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

  const { data } = await apiClient.post(`/work-events/${id}/update`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function importExcelfile(slug, file) {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await apiClient.post(`/work-events/${slug}/import`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function deleteEventItem(id) {
  const { data } = await apiClient.delete(`/work-events/${id}/delete`);
  return data;
}
