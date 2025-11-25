import { apiClient } from "../client.js";

export async function getAllBannerVideo({ page, per_page } = {}) {
  const params = {};
  if (page != null) params.page = page;
  if (per_page != null) params.per_page = per_page;

  const { data } = await apiClient.get("/about-us-banners/get", {
    params,
  });
  return data;
}

export async function addBannerVideo(payload) {
  const formData = new FormData();

  if (payload?.media) {
    formData.append("media", payload.media);
  }

  const { data } = await apiClient.post("/about-us-banners/add", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
}

export async function updateVideo(id, payload) {
  const formData = new FormData();

  if (payload?.media) {
    formData.append("media", payload.media);
  }

  const { data } = await apiClient.post(
    `/about-us-banners/${id}/update`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );

  return data;
}

export async function deleteVideo(id) {
  const { data } = await apiClient.delete(`/about-us-banners/${id}/delete`);
  return data;
}
