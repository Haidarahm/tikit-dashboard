import { apiClient } from "./client.js";

export async function getAllAdmins({ page, per_page } = {}) {
  const params = {};
  if (page != null) params.page = page;
  if (per_page != null) params.per_page = per_page;

  const { data } = await apiClient.get("/admins/get/all", { params });
  return data;
}

const appendAdminFields = (formData, payload = {}) => {
  const fields = ["name", "email", "phone_number", "password"];

  fields.forEach((field) => {
    if (payload[field] != null) {
      formData.append(field, payload[field]);
    }
  });

  if (payload?.profile_image) {
    formData.append("profile_image", payload.profile_image);
  }
};

export async function addAdmin(payload) {
  const formData = new FormData();
  appendAdminFields(formData, payload);

  const { data } = await apiClient.post("/admins", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function updateAdmin(id, payload) {
  const formData = new FormData();
  appendAdminFields(formData, payload);

  const { data } = await apiClient.post(`/admins/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function deleteAdmin(id) {
  const { data } = await apiClient.delete(`/admins/${id}`);
  return data;
}
