import { apiClient } from "../client.js";

export async function getInfluencersSections({ per_page, page, lang } = {}) {
  const params = {};
  if (per_page != null) params.per_page = per_page;
  if (page != null) params.page = page;
  if (lang) params.lang = lang;
  const { data } = await apiClient.get("/api/sections/get", { params });
  return data;
}

export async function addInfluencersSection(payload) {
  const formData = new FormData();
  const fields = [
    "title_en",
    "title_ar",
    "title_fr",
    "subtitle_en",
    "subtitle_ar",
    "subtitle_fr",
  ];
  fields.forEach((f) => {
    if (payload[f] != null) formData.append(f, payload[f]);
  });

  if (payload?.image) {
    formData.append("image", payload.image);
  }

  const { data } = await apiClient.post("/api/sections/add", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function updateInfluencersSection(id, payload) {
  const formData = new FormData();
  const fields = [
    "title_en",
    "title_ar",
    "title_fr",
    "subtitle_en",
    "subtitle_ar",
    "subtitle_fr",
  ];
  fields.forEach((f) => {
    if (payload[f] != null) formData.append(f, payload[f]);
  });
  if (payload?.image) {
    formData.append("image", payload.image);
  }

  const { data } = await apiClient.post(
    `/api/sections/${id}/update`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return data;
}

export async function deleteInfluencersSection(id) {
  const { data } = await apiClient.delete(`/api/sections/${id}/delete`);
  return data;
}

export async function getInfluencersSection(id, { lang } = {}) {
  const params = {};
  if (lang) params.lang = lang;
  const { data } = await apiClient.get(`/api/sections/${id}`, { params });
  return data;
}

export async function importExcel(file) {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await apiClient.post("/api/sections/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
