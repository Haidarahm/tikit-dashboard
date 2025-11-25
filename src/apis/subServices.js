import { apiClient } from "./client.js";

export async function getAllSubServices(subId, { per_page, page, lang } = {}) {
  const params = {};
  if (per_page != null) params.per_page = per_page;
  if (page != null) params.page = page;
  if (lang) params.lang = lang;
  const { data } = await apiClient.get(`/services/${subId}/cases/get`, {
    params,
  });
  return data;
}

export async function addSubService(subId, payload) {
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

  const { data } = await apiClient.post(
    `/services/${subId}/cases/add`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return data;
}

export async function updateSubService(id, payload) {
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

  const { data } = await apiClient.post(`/services/${id}/cases/update`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function deleteSubService(id) {
  const { data } = await apiClient.delete(`/cases/delete/${id}`);
  return data;
}
