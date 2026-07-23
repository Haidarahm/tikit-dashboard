import { apiClient } from "./client.js";

export async function getJobApplications(jobId) {
  const { data } = await apiClient.get(`/applications/jobs/${jobId}/all`);
  return data;
}

export async function getFullApplicationById(id) {
  const { data } = await apiClient.get(`/applications/jobs/full/${id}`);
  return data;
}

export async function updateFullApplicationStatus(id, status) {
  const { data } = await apiClient.post(`/applications/jobs/${id}/update`, {
    application_status: status,
  });
  return data;
}

export async function updateQuickApplicationStatus(id, status) {
  const { data } = await apiClient.post(`/applications/jobs/${id}/update/quick`, {
    application_status: status,
  });
  return data;
}
