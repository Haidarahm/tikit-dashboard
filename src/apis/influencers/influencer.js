import { apiClient } from "../client.js";

export async function addInfluencer(sectionId, payload) {
  const formData = new FormData();
  const fields = [
    "name_en",
    "name_ar",
    "name_fr",
    "primary_subtitle_en",
    "primary_subtitle_ar",
    "primary_subtitle_fr",
    "secondary_subtitle_en",
    "secondary_subtitle_ar",
    "secondary_subtitle_fr",
  ];
  fields.forEach((f) => {
    if (payload[f] != null) formData.append(f, payload[f]);
  });

  if (payload?.image) {
    formData.append("image", payload.image);
  }

  // Handle links array
  if (payload?.links && Array.isArray(payload.links)) {
    payload.links.forEach((link, index) => {
      if (link?.link != null) {
        formData.append(`links[${index}][link]`, link.link);
      }
      if (link?.link_type != null) {
        formData.append(`links[${index}][link_type]`, link.link_type);
      }
    });
  }

  const { data } = await apiClient.post(
    `/influencers/sections/${sectionId}/add`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return data;
}

export async function getInfluencers(sectionId, { per_page, page, lang } = {}) {
  const params = {};
  if (per_page != null) params.per_page = per_page;
  if (page != null) params.page = page;
  if (lang) params.lang = lang;
  const { data } = await apiClient.get(
    `/influencers/sections/${sectionId}/get`,
    { params }
  );
  return data;
}

export async function updateInfluencer(id, payload) {
  const formData = new FormData();
  const fields = [
    "name_en",
    "name_ar",
    "name_fr",
    "primary_subtitle_en",
    "primary_subtitle_ar",
    "primary_subtitle_fr",
    "secondary_subtitle_en",
    "secondary_subtitle_ar",
    "secondary_subtitle_fr",
  ];
  fields.forEach((f) => {
    if (payload[f] != null) formData.append(f, payload[f]);
  });

  if (payload?.image) {
    formData.append("image", payload.image);
  }

  // Handle links array
  if (payload?.links && Array.isArray(payload.links)) {
    payload.links.forEach((link, index) => {
      if (link?.link != null) {
        formData.append(`links[${index}][link]`, link.link);
      }
      if (link?.link_type != null) {
        formData.append(`links[${index}][link_type]`, link.link_type);
      }
    });
  }

  const { data } = await apiClient.post(
    `/influencers/${id}/update`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return data;
}

export async function deleteInfluencer(id) {
  const { data } = await apiClient.delete(`/influencers/${id}/delete`);
  return data;
}

export async function importExcel(sectionId, file) {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await apiClient.post(
    `/influencers/sections/${sectionId}/import`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return data;
}
