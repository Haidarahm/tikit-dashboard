import { apiClient } from "../client.js";

export async function getWorksSections({ per_page, page, lang } = {}) {
  const params = {};
  if (per_page != null) params.per_page = per_page;
  if (page != null) params.page = page;
  if (lang) params.lang = lang;
  const { data } = await apiClient.get("/api/works/get", { params });
  return data;
}

export async function createWorkSection(payload) {
  const formData = new FormData();
  const fields = [
    "title_en",
    "title_ar",
    "title_fr",
    "subtitle_en",
    "subtitle_ar",
    "subtitle_fr",
    "description_en",
    "description_ar",
    "description_fr",
    "type",
  ];
  fields.forEach((f) => {
    if (payload[f] != null) formData.append(f, payload[f]);
  });

  if (payload?.media) {
    formData.append("media", payload.media);
  }

  const { data } = await apiClient.post("/api/works/add", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function updateWorkSection(id, payload) {
  const formData = new FormData();
  const fields = [
    "title_en",
    "title_ar",
    "title_fr",
    "subtitle_en",
    "subtitle_ar",
    "subtitle_fr",
    "description_en",
    "description_ar",
    "description_fr",
    "type",
  ];
  fields.forEach((f) => {
    if (payload[f] != null) formData.append(f, payload[f]);
  });
  if (payload?.media) {
    formData.append("media", payload.media);
  }

  const { data } = await apiClient.post(`/api/works/update/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function deleteWorkSection(id) {
  const { data } = await apiClient.delete(`/api/works/delete/${id}`);
  return data;
}

export async function importExcel(file) {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await apiClient.post("/api/works/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
