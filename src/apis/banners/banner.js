import { apiClient } from "../client.js";

export async function getVideos({ per_page, page } = {}) {
  const params = {};
  if (per_page != null) params.per_page = per_page;
  if (page != null) params.page = page;
  const { data } = await apiClient.get("/banners/get", { params });
  return data;
}

export async function addVideo(payload) {
  const formData = new FormData();

  if (payload?.video) {
    formData.append("video", payload.video);
  }

  const { data } = await apiClient.post("/banners/add", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function updateVideo(id, payload) {
  const formData = new FormData();

  if (payload?.video) {
    formData.append("video", payload.video);
  }

  const { data } = await apiClient.post(`/banners/${id}/update`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function deleteVideo(id) {
  const { data } = await apiClient.delete(`/banners/${id}/delete`);
  return data;
}

export async function reorderVideos(orders) {
  const { data } = await apiClient.post("/banners/reorder", { orders });
  return data;
}
