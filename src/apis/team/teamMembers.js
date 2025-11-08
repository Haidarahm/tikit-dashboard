import { apiClient } from "../client.js";

const serializeSocialLinks = (formData, links) => {
  if (!Array.isArray(links)) return;
  links.forEach((link, index) => {
    if (!link) return;
    if (link.url != null) {
      formData.append(`social_links[${index}][url]`, link.url);
    }
    if (link.link_type != null) {
      formData.append(`social_links[${index}][link_type]`, link.link_type);
    }
  });
};

const buildFormData = (payload = {}) => {
  const formData = new FormData();
  const { name, specialist, image, social_links } = payload;
  if (name != null) formData.append("name", name);
  if (specialist != null) formData.append("specialist", specialist);
  if (image != null) formData.append("image", image);
  serializeSocialLinks(formData, social_links);
  return formData;
};

export async function getAllTeamMembers(typeId) {
  const { data } = await apiClient.get(`/api/teams/${typeId}/show`);
  return data;
}

export async function addTeamMember(typeId, payload) {
  const formData = buildFormData(payload);
  const { data } = await apiClient.post(`/api/teams/add/${typeId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function updateTeamMember(id, payload) {
  const formData = buildFormData(payload);
  const { data } = await apiClient.post(`/api/teams/${id}/update`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function deleteTeamMember(id) {
  const { data } = await apiClient.delete(`/api/teams/${id}/delete`);
  return data;
}
