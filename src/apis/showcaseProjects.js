import { apiClient } from "./client.js";

const scalarFields = [
  "reach",
  "views",
  "objective_ar",
  "objective_en",
  "objective_fr",
  "brief_en",
  "brief_ar",
  "brief_fr",
  "strategy_en",
  "strategy_ar",
  "strategy_fr",
  "engagement_rate",
  "title_en",
  "title_fr",
  "title_ar",
  "subtitle_en",
  "subtitle_ar",
  "subtitle_fr",
];

const appendProjectPayload = (formData, payload = {}) => {
  scalarFields.forEach((field) => {
    if (payload[field] != null && payload[field] !== "") {
      formData.append(field, payload[field]);
    }
  });

  if (payload?.main_image) {
    formData.append("main_image", payload.main_image);
  }

  if (Array.isArray(payload?.images)) {
    payload.images.forEach((file, index) => {
      if (file) {
        formData.append(`images[${index}]`, file);
      }
    });
  }

  if (Array.isArray(payload?.thumbnails)) {
    payload.thumbnails.forEach((file, index) => {
      if (file) {
        formData.append(`thumbnails[${index}]`, file);
      }
    });
  }

  if (Array.isArray(payload?.remove_media_ids)) {
    payload.remove_media_ids.forEach((id, index) => {
      if (id != null && Number.isInteger(Number(id))) {
        formData.append(`remove_media_ids[${index}]`, Number(id));
      }
    });
  }
};

export async function getShowcaseProjects({ page, per_page, lang } = {}) {
  const params = {};
  if (page != null) params.page = page;
  if (per_page != null) params.per_page = per_page;
  if (lang) params.lang = lang;
  const { data } = await apiClient.get("/showcase-projects/get", { params });
  return data;
}

export async function addProject(payload) {
  const formData = new FormData();
  appendProjectPayload(formData, payload);
  const { data } = await apiClient.post("/showcase-projects/add", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function updateProject(id, payload) {
  const formData = new FormData();
  appendProjectPayload(formData, payload);
  const { data } = await apiClient.post(
    `/showcase-projects/update/${id}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return data;
}

export async function importShowcaseProjects(file) {
  const formData = new FormData();
  if (file) {
    formData.append("file", file);
  }
  const { data } = await apiClient.post(
    "/showcase-projects/import",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return data;
}

export async function deleteProject(id) {
  const { data } = await apiClient.delete(`/showcase-projects/delete/${id}`);
  return data;
}

export async function reorderShowcaseProjects(orders) {
  const { data } = await apiClient.post("/showcase-projects/reorder", { orders });
  return data;
}
