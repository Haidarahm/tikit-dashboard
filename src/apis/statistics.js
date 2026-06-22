import { apiClient } from "./client.js";

export async function getStatistics() {
  const { data } = await apiClient.get("/statistics");
  return data;
}

