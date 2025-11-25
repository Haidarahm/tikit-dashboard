import { apiClient } from "../client.js";

export async function getAllEventItems({ work_id, page, per_page, lang } = {}) {
  const params = {};
  if (work_id != null) params.work_id = work_id;
  if (page != null) params.page = page;
  if (per_page != null) params.per_page = per_page;
  if (lang) params.lang = lang;
  const { data } = await apiClient.get(`/work-events/get`, {
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
    payload.images.forEach((image, index) => {
      if (image) {
        formData.append(`images[${index}]`, image);
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
    payload.images.forEach((image, index) => {
      if (image) {
        formData.append(`images[${index}]`, image);
      }
    });
  }

  const { data } = await apiClient.post(
    `/work-events/${id}/update`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return data;
}

export async function deleteEventItem(id) {
  const { data } = await apiClient.delete(`/work-events/${id}/delete`);
  return data;
}
