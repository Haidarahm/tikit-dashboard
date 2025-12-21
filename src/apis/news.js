import { apiClient } from "./client.js";

export async function getAllNews({ page, per_page, lang } = {}) {
  const params = {};
  if (page != null) params.page = page;
  if (per_page != null) params.per_page = per_page;
  if (lang) params.lang = lang;
  const { data } = await apiClient.get("/news/get", { params });
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
  const { data } = await apiClient.post("/news/add", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function updateNewsCard(id, payload) {
  const formData = new FormData();
  appendNewsFields(formData, payload);
  const { data } = await apiClient.post(`/news/${id}/update`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function deleteNewsCard(id) {
  const { data } = await apiClient.delete(`/news/${id}/delete`);
  return data;
}

export async function importNewsExcel(file) {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await apiClient.post("/news/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

const appendNewsDetailsFields = (formData, payload = {}) => {
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
  if (payload?.images && Array.isArray(payload.images)) {
    payload.images.forEach((image, index) => {
      if (image != null) {
        formData.append(`images[${index}]`, image);
      }
    });
  }
};

export async function addNewsDetails(id, payload) {
  const formData = new FormData();
  appendNewsDetailsFields(formData, payload);
  const { data } = await apiClient.post(`/news-details/${id}/add`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function updateNewsDetails(id, payload) {
  const formData = new FormData();
  appendNewsDetailsFields(formData, payload);
  const { data } = await apiClient.post(`/news-details/update/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function getAllNewsDetails(id, { lang } = {}) {
  const params = {};
  if (lang) params.lang = lang;
  const { data } = await apiClient.get(`/news-details/${id}/get`, { params });
  return data;
}

export async function deleteNewsDetails(id) {
  const { data } = await apiClient.delete(`/news-details/delete/${id}`);
  return data;
}