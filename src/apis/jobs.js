import { apiClient } from "./client.js";

const scalarFields = [
  "job_title",
  "job_category",
  "job_type",
  "work_mode",
  "city",
  "country",
  "job_description",
  "experience_level",
  "experience_years_min",
  "education_level",
  "application_deadline",
  "job_status",
];

const appendJobPayload = (formData, payload = {}) => {
  scalarFields.forEach((field) => {
    if (payload[field] != null && payload[field] !== "") {
      formData.append(field, payload[field]);
    }
  });

  if (payload?.image) {
    formData.append("image", payload.image);
  }

  ["skills", "responsibilities", "requirements"].forEach((field) => {
    if (Array.isArray(payload?.[field])) {
      payload[field].forEach((value, index) => {
        if (value != null && value !== "") {
          formData.append(`${field}[${index}]`, value);
        }
      });
    }
  });

  if (Array.isArray(payload?.custom_fields)) {
    payload.custom_fields.forEach((field, index) => {
      if (!field || !field.field_key || !field.field_label || !field.field_type) {
        return;
      }
      formData.append(`custom_fields[${index}][field_key]`, field.field_key);
      formData.append(`custom_fields[${index}][field_label]`, field.field_label);
      formData.append(`custom_fields[${index}][field_type]`, field.field_type);
      formData.append(
        `custom_fields[${index}][is_required]`,
        field.is_required ? 1 : 0
      );
      formData.append(
        `custom_fields[${index}][display_order]`,
        field.display_order != null ? field.display_order : index
      );
      if (Array.isArray(field.options)) {
        field.options.forEach((option, optIndex) => {
          if (option != null && option !== "") {
            formData.append(
              `custom_fields[${index}][options][${optIndex}]`,
              option
            );
          }
        });
      }
    });
  }
};

export async function getJobs({ page, per_page } = {}) {
  const params = {};
  if (page != null) params.page = page;
  if (per_page != null) params.per_page = per_page;
  const { data } = await apiClient.get("/jobs/get", { params });
  return data;
}

export async function getJobById(id) {
  const { data } = await apiClient.get(`/jobs/show/${id}`);
  return data;
}

export async function addJob(payload) {
  const formData = new FormData();
  appendJobPayload(formData, payload);
  const { data } = await apiClient.post("/jobs/add", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function updateJob(id, payload) {
  const formData = new FormData();
  appendJobPayload(formData, payload);
  const { data } = await apiClient.post(`/jobs/update/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function deleteJob(id) {
  const { data } = await apiClient.delete(`/jobs/delete/${id}`);
  return data;
}
