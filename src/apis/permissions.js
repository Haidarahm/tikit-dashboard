import { apiClient } from "./client.js";

export async function getPermissions() {
  const { data } = await apiClient.get("/permissions/get/all");
  return data;
}
