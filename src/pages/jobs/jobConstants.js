export const JOB_TYPE_OPTIONS = [
  { label: "Full Time", value: "full_time" },
  { label: "Part Time", value: "part_time" },
  { label: "Contract", value: "contract" },
  { label: "Freelance", value: "freelance" },
];

export const WORK_MODE_OPTIONS = [
  { label: "On Site", value: "on_site" },
  { label: "Remote", value: "remote" },
];

export const EXPERIENCE_LEVEL_OPTIONS = [
  { label: "Junior", value: "junior" },
  { label: "Mid", value: "mid" },
  { label: "Senior", value: "senior" },
  { label: "Expert", value: "expert" },
];

export const JOB_STATUS_OPTIONS = [
  { label: "Open", value: "open" },
  { label: "Closed", value: "closed" },
];

export const CUSTOM_FIELD_TYPE_OPTIONS = [
  { label: "Text", value: "text" },
  { label: "Textarea", value: "textarea" },
  { label: "Number", value: "number" },
  { label: "Select", value: "select" },
  { label: "Multi Select", value: "multi_select" },
  { label: "Checkbox", value: "checkbox" },
  { label: "Radio", value: "radio" },
  { label: "Date", value: "date" },
  { label: "File", value: "file" },
];

export const APPLICATION_STATUS_OPTIONS = [
  { label: "Pending", value: "pending" },
  { label: "Accepted", value: "accepted" },
];

const findLabel = (options, value) =>
  options.find((option) => option.value === value)?.label || value || "-";

export const getJobTypeLabel = (value) => findLabel(JOB_TYPE_OPTIONS, value);
export const getWorkModeLabel = (value) => findLabel(WORK_MODE_OPTIONS, value);
export const getExperienceLevelLabel = (value) =>
  findLabel(EXPERIENCE_LEVEL_OPTIONS, value);

const CUSTOM_FIELD_TYPES_WITH_OPTIONS = new Set([
  "select",
  "multi_select",
  "checkbox",
  "radio",
]);

export const fieldTypeSupportsOptions = (value) =>
  CUSTOM_FIELD_TYPES_WITH_OPTIONS.has(value);

const toStringArray = (list, key) => {
  if (!Array.isArray(list)) return [];
  return list
    .map((item) => (typeof item === "string" ? item : item?.[key]))
    .filter((value) => value != null && value !== "");
};

export const deriveJobFormValues = (job) => ({
  job_title: job?.job_title ?? "",
  job_category: job?.job_category ?? "",
  job_type: job?.job_type ?? undefined,
  work_mode: job?.work_mode ?? undefined,
  city: job?.city ?? "",
  country: job?.country ?? "",
  job_description: job?.job_description ?? "",
  experience_level: job?.experience_level ?? undefined,
  experience_years_min: job?.experience_years_min ?? null,
  education_level: job?.education_level ?? "",
  application_deadline: job?.application_deadline
    ? String(job.application_deadline).slice(0, 10)
    : "",
  job_status: job?.job_status ?? undefined,
  skills: toStringArray(job?.skills, "skill"),
  responsibilities: toStringArray(job?.responsibilities, "responsibility"),
  requirements: toStringArray(job?.requirements, "requirement"),
  custom_fields: Array.isArray(job?.customFields ?? job?.custom_fields)
    ? (job.customFields ?? job.custom_fields).map((field) => ({
        field_key: field?.field_key ?? "",
        field_label: field?.field_label ?? "",
        field_type: field?.field_type ?? undefined,
        is_required: Boolean(field?.is_required),
        display_order: field?.display_order ?? 0,
        options: toStringArray(field?.options, "option_value"),
      }))
    : [],
});
