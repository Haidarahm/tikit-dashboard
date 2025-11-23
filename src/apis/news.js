import { apiClient } from "./client.js";

export async function getAllNews({ page, per_page, lang } = {}) {
  const params = {};
  if (page != null) params.page = page;
  if (per_page != null) params.per_page = per_page;
  if (lang) params.lang = lang;
  const { data } = await apiClient.get("/api/news/get", { params });
  return data;
}

const appendNewsFields = (formData, payload = {}) => {
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
  ];
  fields.forEach((field) => {
    if (payload[field] != null) {
      formData.append(field, payload[field]);
    }
  });
  if (payload?.image) {
    formData.append("image", payload.image);
  }
};

export async function addNewsCard(payload) {
  const formData = new FormData();
  appendNewsFields(formData, payload);
  const { data } = await apiClient.post("/api/news/add", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function updateNewsCard(id, payload) {
  const formData = new FormData();
  appendNewsFields(formData, payload);
  const { data } = await apiClient.post(`/api/news/${id}/update`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function deleteNewsCard(id) {
  const { data } = await apiClient.delete(`/api/news/${id}/delete`);
  return data;
}
