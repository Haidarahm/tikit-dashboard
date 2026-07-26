import { apiClient } from "./client.js";
import { sectionPrefix } from "../constants/contentSections.js";

export async function getContentSections() {
  const { data } = await apiClient.get("/content-sections");
  return data;
}

export async function getSectionItems(section) {
  const { data } = await apiClient.get(`${sectionPrefix(section)}/admin/all`);
  return data;
}

export async function getSectionItem(section, id) {
  const { data } = await apiClient.get(
    `${sectionPrefix(section)}/admin/show/${id}`
  );
  return data;
}

export async function duplicateSectionItem(section, id, options = {}) {
  const body = {};
  if (options.workId != null) body.work_id = options.workId;
  if (options.isActive != null) body.is_active = options.isActive;
  const { data } = await apiClient.post(
    `${sectionPrefix(section)}/${id}/duplicate`,
    body
  );
  return data;
}

export async function copySectionItem(section, id, options = {}) {
  const { data } = await apiClient.post(
    `${sectionPrefix(section)}/${id}/copy`,
    buildTransferBody(options)
  );
  return data;
}

export async function moveSectionItem(section, id, options = {}) {
  const { data } = await apiClient.post(
    `${sectionPrefix(section)}/${id}/move`,
    buildTransferBody(options)
  );
  return data;
}

/** Omitting `is_active` asks the backend to flip the current state. */
export async function setSectionItemActive(section, id, isActive = null) {
  const body = isActive == null ? {} : { is_active: isActive };
  const { data } = await apiClient.post(
    `${sectionPrefix(section)}/${id}/active`,
    body
  );
  return data;
}

function buildTransferBody({ targetSection, workId, isActive } = {}) {
  const body = { target_section: targetSection };
  if (workId != null) body.work_id = workId;
  if (isActive != null) body.is_active = isActive;
  return body;
}
