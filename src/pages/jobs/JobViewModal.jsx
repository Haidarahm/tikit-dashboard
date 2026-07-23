import { Button, Image, Modal, Space, Tag } from "antd";
import {
  getExperienceLevelLabel,
  getJobTypeLabel,
  getWorkModeLabel,
} from "./jobConstants.js";

const toStringList = (list, key) => {
  if (!Array.isArray(list)) return [];
  return list
    .map((item) => (typeof item === "string" ? item : item?.[key]))
    .filter((value) => value != null && value !== "");
};

export function JobViewModal({ open, job, onClose }) {
  const skills = toStringList(job?.skills, "skill");
  const responsibilities = toStringList(job?.responsibilities, "responsibility");
  const requirements = toStringList(job?.requirements, "requirement");
  const customFields = Array.isArray(job?.customFields ?? job?.custom_fields)
    ? job.customFields ?? job.custom_fields
    : [];

  return (
    <Modal
      title="Job Details"
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
      width={900}
    >
      {job && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>ID:</strong> {job.id}
            </div>
            <div>
              <strong>Title:</strong> {job.job_title || "-"}
            </div>
            <div>
              <strong>Category:</strong> {job.job_category || "-"}
            </div>
            <div>
              <strong>Type:</strong> {getJobTypeLabel(job.job_type)}
            </div>
            <div>
              <strong>Work Mode:</strong> {getWorkModeLabel(job.work_mode)}
            </div>
            <div>
              <strong>Location:</strong>{" "}
              {[job.city, job.country].filter(Boolean).join(", ") || "-"}
            </div>
            <div>
              <strong>Experience Level:</strong>{" "}
              {getExperienceLevelLabel(job.experience_level)}
            </div>
            <div>
              <strong>Min Experience (years):</strong>{" "}
              {job.experience_years_min ?? "-"}
            </div>
            <div>
              <strong>Education Level:</strong> {job.education_level || "-"}
            </div>
            <div>
              <strong>Status:</strong>{" "}
              <Tag color={job.job_status === "open" ? "green" : "red"}>
                {job.job_status || "-"}
              </Tag>
            </div>
            <div>
              <strong>Application Deadline:</strong>{" "}
              {job.application_deadline
                ? new Date(job.application_deadline).toLocaleDateString()
                : "-"}
            </div>
          </div>

          <div>
            <strong>Description:</strong>
            <p className="mt-1 whitespace-pre-wrap">
              {job.job_description || "-"}
            </p>
          </div>

          <div>
            <strong>Skills:</strong>
            <div className="mt-1">
              {skills.length > 0 ? (
                <Space size={[8, 8]} wrap>
                  {skills.map((skill, index) => (
                    <Tag key={`${skill}-${index}`}>{skill}</Tag>
                  ))}
                </Space>
              ) : (
                "-"
              )}
            </div>
          </div>

          <div>
            <strong>Responsibilities:</strong>
            {responsibilities.length > 0 ? (
              <ul className="mt-1 list-disc pl-5">
                {responsibilities.map((item, index) => (
                  <li key={`${item}-${index}`}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-1">-</p>
            )}
          </div>

          <div>
            <strong>Requirements:</strong>
            {requirements.length > 0 ? (
              <ul className="mt-1 list-disc pl-5">
                {requirements.map((item, index) => (
                  <li key={`${item}-${index}`}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-1">-</p>
            )}
          </div>

          {customFields.length > 0 && (
            <div>
              <strong>Custom Fields:</strong>
              <ul className="mt-1 list-disc pl-5">
                {customFields.map((field, index) => (
                  <li key={field?.field_key ?? index}>
                    {field?.field_label} ({field?.field_type})
                    {field?.is_required ? " · required" : ""}
                    {Array.isArray(field?.options) && field.options.length > 0
                      ? ` — ${toStringList(field.options, "option_value").join(
                          ", "
                        )}`
                      : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {job.image && (
            <div>
              <strong>Image:</strong>
              <div className="mt-2">
                <Image
                  src={job.image}
                  width={120}
                  height={120}
                  style={{ objectFit: "cover" }}
                  preview={{ mask: "Preview" }}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <strong>Created At:</strong>{" "}
              {job.created_at
                ? new Date(job.created_at).toLocaleString()
                : "-"}
            </div>
            <div>
              <strong>Updated At:</strong>{" "}
              {job.updated_at
                ? new Date(job.updated_at).toLocaleString()
                : "-"}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
