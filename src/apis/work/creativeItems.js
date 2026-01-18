import { apiClient } from "../client.js";

export async function getAllCreativesItems({
  work_id,
  page,
  per_page,
  lang,
} = {}) {
  const params = {};
  if (work_id != null) params.work_id = work_id;
  if (page != null) params.page = page;
  if (per_page != null) params.per_page = per_page;
  if (lang) params.lang = lang;
  const { data } = await apiClient.get(`/work-creatives/get`, {
    params,
  });
  return data;
}

export async function createCreativeItem(payload) {
  const formData = new FormData();

  // Add regular fields
  const fields = ["work_id", "title_en", "title_ar", "title_fr"];
  fields.forEach((f) => {
    if (payload[f] != null) formData.append(f, payload[f]);
  });

  // Add logo
  if (payload?.logo) {
    formData.append("logo", payload.logo);
  }

  // Add main_image
  if (payload?.main_image) {
    formData.append("main_image", payload.main_image);
  }

  // Add brand images
  if (payload?.brand_image_1) {
    formData.append("brand_image_1", payload.brand_image_1);
  }
  if (payload?.brand_image_2) {
    formData.append("brand_image_2", payload.brand_image_2);
  }
  if (payload?.brand_image_3) {
    formData.append("brand_image_3", payload.brand_image_3);
  }

  // Add multiple images
  if (payload?.images && Array.isArray(payload.images)) {
    payload.images.forEach((image) => {
      if (image) {
        formData.append(`images[]`, image);
      }
    });
  }

  const { data } = await apiClient.post("/work-creatives/add", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function updateCreativeItem(id, payload) {
  const formData = new FormData();

  // Add regular fields
  const fields = ["work_id", "title_en", "title_ar", "title_fr"];
  fields.forEach((f) => {
    if (payload[f] != null) formData.append(f, payload[f]);
  });

  // Add logo
  if (payload?.logo) {
    formData.append("logo", payload.logo);
  }

  // Add main_image
  if (payload?.main_image) {
    formData.append("main_image", payload.main_image);
  }

  // Add brand images
  if (payload?.brand_image_1) {
    formData.append("brand_image_1", payload.brand_image_1);
  }
  if (payload?.brand_image_2) {
    formData.append("brand_image_2", payload.brand_image_2);
  }
  if (payload?.brand_image_3) {
    formData.append("brand_image_3", payload.brand_image_3);
  }

  // Add multiple images
  if (payload?.images && Array.isArray(payload.images)) {
    payload.images.forEach((image) => {
      if (image) {
        formData.append(`images[]`, image);
      }
    });
  }

  const { data } = await apiClient.post(
    `/work-creatives/${id}/update`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return data;
}

export async function importExcelfile(id, file) {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await apiClient.post(
    `/work-creatives/${id}/import`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
}

export async function deleteCreativesItem(id) {
  const { data } = await apiClient.delete(`/work-creatives/${id}/delete`);
  return data;
}
