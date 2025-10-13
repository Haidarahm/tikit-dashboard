import { apiClient } from "./client.js";

export async function getServices({ per_page, page, lang } = {}) {
  const params = {};
  if (per_page != null) params.per_page = per_page;
  if (page != null) params.page = page;
  if (lang) params.lang = lang;
  const { data } = await apiClient.get("/api/services", { params });
  return data;
}

export async function addService(payload) {
  const formData = new FormData();
  const fields = [
    "title_en",
    "title_ar",
    "title_fr",
    "subtitle_en",
    "subtitle_fr",
    "subtitle_ar",
    "description_en",
    "description_ar",
    "description_fr",
  ];
  fields.forEach((f) => {
    if (payload[f] != null) formData.append(f, payload[f]);
  });

  if (payload?.media) {
    formData.append("media", payload.media);
  }

  const { data } = await apiClient.post("/api/services", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function updateService(id, payload) {
  const formData = new FormData();
  const fields = [
    "title_en",
    "title_ar",
    "title_fr",
    "subtitle_en",
    "subtitle_fr",
    "subtitle_ar",
    "description_en",
    "description_ar",
    "description_fr",
  ];
  fields.forEach((f) => {
    if (payload[f] != null) formData.append(f, payload[f]);
  });
  if (payload?.media) {
    formData.append("media", payload.media);
  }

  const { data } = await apiClient.post(`/api/services/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function deleteService(id) {
  const { data } = await apiClient.delete(`/api/services/${id}`);
  return data;
}

export async function getService(id, { lang } = {}) {
  const params = {};
  if (lang) params.lang = lang;
  const { data } = await apiClient.get(`/api/services/${id}`, { params });
  return data;
}
