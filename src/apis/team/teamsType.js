import { apiClient } from "../client.js";

export async function getAllTeamTypes(params = {}) {
  const query = {};
  if (params.page != null) query.page = params.page;
  if (params.per_page != null) query.per_page = params.per_page;
  const { data } = await apiClient.get("/team-types/get", {
    params: query,
  });
  return data;
}

export async function createTeamType(input) {
  const payload = typeof input === "string" ? { type: input } : input;
  const { data } = await apiClient.post("/team-types/add", payload);
  return data;
}

export async function updateTeamType(id, input) {
  const payload = typeof input === "string" ? { type: input } : input;
  const { data } = await apiClient.post(
    `/team-types/${id}/update`,
    payload
  );
  return data;
}

export async function deleteTeamType(id) {
  const { data } = await apiClient.delete(`/team-types/${id}/delete`);
  return data;
}
