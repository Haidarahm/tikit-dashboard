import { apiClient } from "./client.js";

export async function getAllRegisteredInfluencers({ page, per_page } = {}) {
  const params = {};
  if (page != null) params.page = page;
  if (per_page != null) params.per_page = per_page;
  const { data } = await apiClient.get("/creators/get", { params });
  return data;
}

export async function updateInfluencerStatus(id, status) {
  const { data } = await apiClient.post(`/creators/${id}/status`, {
    status,
  });
  return data;
}

export async function getRegisteredInfluencerById(id) {
  const { data } = await apiClient.get(`/creators/${id}`);
  return data;
}
