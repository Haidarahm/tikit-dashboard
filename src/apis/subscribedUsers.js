import { apiClient } from "./client.js";

export async function getUsers({ page, per_page } = {}) {
  const params = {};
  if (page != null) params.page = page;
  if (per_page != null) params.per_page = per_page;
  const { data } = await apiClient.get("/subscriptions/get", { params });
  return data;
}
