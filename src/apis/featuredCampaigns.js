import { apiClient } from "./client.js";

const scalarFields = [
  "reach",
  "views",
  "objective_ar",
  "objective_en",
  "objective_fr",
  "brief_en",
  "brief_ar",
  "brief_fr",
  "strategy_en",
  "strategy_ar",
  "strategy_fr",
  "engagement_rate",
  "title_en",
  "title_fr",
  "title_ar",
  "subtitle_en",
  "subtitle_ar",
  "subtitle_fr",
];

const appendCampaignPayload = (formData, payload = {}) => {
  scalarFields.forEach((field) => {
    if (payload[field] != null && payload[field] !== "") {
      formData.append(field, payload[field]);
    }
  });

  if (payload?.main_image) {
    formData.append("main_image", payload.main_image);
  }

  if (Array.isArray(payload?.images)) {
    payload.images.forEach((file, index) => {
      if (file) {
        formData.append(`images[${index}]`, file);
      }
    });
  }

  if (Array.isArray(payload?.thumbnails)) {
    payload.thumbnails.forEach((file, index) => {
      if (file) {
        formData.append(`thumbnails[${index}]`, file);
      }
    });
  }

  if (Array.isArray(payload?.remove_media_ids)) {
    payload.remove_media_ids.forEach((id, index) => {
      if (id != null && Number.isInteger(Number(id))) {
        formData.append(`remove_media_ids[${index}]`, Number(id));
      }
    });
  }
};

export async function getFeaturedCampaigns({ page, per_page, lang } = {}) {
  const params = {};
  if (page != null) params.page = page;
  if (per_page != null) params.per_page = per_page;
  if (lang) params.lang = lang;
  const { data } = await apiClient.get("/featured", { params });
  return data;
}

export async function addFeaturedCampaign(payload) {
  const formData = new FormData();
  appendCampaignPayload(formData, payload);
  const { data } = await apiClient.post("/featured/add", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function updateFeaturedCampaign(id, payload) {
  const formData = new FormData();
  appendCampaignPayload(formData, payload);
  const { data } = await apiClient.post(`/featured/update/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function deleteFeaturedCampaign(id) {
  const { data } = await apiClient.delete(`/featured/delete/${id}`);
  return data;
}

export async function reorderFeaturedCampaigns(orders) {
  const { data } = await apiClient.post("/featured/reorder", { orders });
  return data;
}
