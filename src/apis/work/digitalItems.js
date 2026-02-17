import { apiClient } from "../client.js";

export async function getAllDigitalItems({
  slug,
  page,
  per_page,
  lang,
} = {}) {
  if (!slug) {
    throw new Error("Slug is required");
  }
  const params = {};
  if (page != null) params.page = page;
  if (per_page != null) params.per_page = per_page;
  if (lang) params.lang = lang;
  const { data } = await apiClient.get(`/work-digitals/${slug}`, { params });
  return data;
}

export async function createDigitalItem(payload) {
  const formData = new FormData();

  // Add regular fields
  const fields = [
    "work_id",
    "cpo",
    "orders",
    "title_en",
    "title_ar",
    "title_fr",
    "roas",
    "top_search",
    "conversions",
    "traffic",
    "ctr",
    "cpp",
    "avg_cart",
    "cltv",
    "ftus",
    "objective_ar",
    "objective_en",
    "objective_fr",
  ];
  fields.forEach((f) => {
    if (payload[f] != null) formData.append(f, payload[f]);
  });

  // Add logo
  if (payload?.logo) {
    formData.append("logo", payload.logo);
  }

  const { data } = await apiClient.post("/work-digitals/add", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function updateDigitalItem(id, payload) {
  const formData = new FormData();

  // Add regular fields
  const fields = [
    "work_id",
    "cpo",
    "orders",
    "title_en",
    "title_ar",
    "title_fr",
    "roas",
    "top_search",
    "conversions",
    "traffic",
    "ctr",
    "cpp",
    "avg_cart",
    "cltv",
    "ftus",
    "objective_ar",
    "objective_en",
    "objective_fr",
  ];
  fields.forEach((f) => {
    if (payload[f] != null) formData.append(f, payload[f]);
  });

  // Add logo
  if (payload?.logo) {
    formData.append("logo", payload.logo);
  }

  const { data } = await apiClient.post(
    `/work-digitals/${id}/update`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return data;
}

export async function importExcelfile(slug, file) {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await apiClient.post(
    `/work-digitals/${slug}/import`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
}

export async function deleteDigitalItem(id) {
  const { data } = await apiClient.delete(`/work-digitals/${id}/delete`);
  return data;
}
