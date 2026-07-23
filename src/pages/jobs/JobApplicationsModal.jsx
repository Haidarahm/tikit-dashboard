import { useEffect, useState } from "react";
import { Button, Modal, Select, Space, Table, Tag } from "antd";
import { EyeOutlined, ReloadOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import { useJobApplicationsStore } from "../../store/jobApplicationsStore.js";
import { getFullApplicationById } from "../../apis/jobApplications.js";
import {
  APPLICATION_STATUS_OPTIONS,
  getExperienceLevelLabel,
} from "./jobConstants.js";

const toStringList = (list, key) => {
  if (!Array.isArray(list)) return [];
  return list
    .map((item) => (typeof item === "string" ? item : item?.[key]))
    .filter((value) => value != null && value !== "");
};

export function JobApplicationsModal({ open, job, onClose }) {
  const { items, isLoading, fetchList, updateStatus, reset } =
    useJobApplicationsStore();
  const [detailItem, setDetailItem] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  useEffect(() => {
    if (open && job?.id != null) {
      fetchList(job.id);
    }
    if (!open) {
      reset();
      setDetailItem(null);
    }
  }, [open, job?.id]);

  const handleView = async (record) => {
    if (record.type === "full" && record.id != null) {
      setIsDetailLoading(true);
      try {
        const resp = await getFullApplicationById(record.id);
        setDetailItem({ type: "full", ...(resp?.data ?? record) });
      } catch (error) {
        toast.error(
          error?.response?.data?.message || "Failed to load application"
        );
        setDetailItem(record);
      } finally {
        setIsDetailLoading(false);
      }
    } else {
      setDetailItem(record);
    }
  };

  const columns = [
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: 90,
      render: (value) => (
        <Tag color={value === "full" ? "blue" : "gold"}>{value}</Tag>
      ),
    },
    {
      title: "Name",
      key: "name",
      render: (_, record) =>
        [record.first_name, record.last_name].filter(Boolean).join(" ") || "-",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (value) => value || "-",
    },
    {
      title: "Location",
      key: "location",
      render: (_, record) =>
        [record.city, record.country].filter(Boolean).join(", ") || "-",
    },
    {
      title: "Experience",
      dataIndex: "experience_level",
      key: "experience_level",
      render: (value) => getExperienceLevelLabel(value),
    },
    {
      title: "Status",
      key: "status",
      width: 160,
      render: (_, record) => (
        <Select
          size="small"
          style={{ width: 130 }}
          value={record.application_status || "pending"}
          options={APPLICATION_STATUS_OPTIONS}
          onChange={(value) => updateStatus(record.type, record.id, value)}
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 80,
      render: (_, record) => (
        <Button icon={<EyeOutlined />} onClick={() => handleView(record)} />
      ),
    },
  ];

  const languages = detailItem
    ? Array.isArray(detailItem.languages)
      ? detailItem.languages
      : []
    : [];
  const skills = toStringList(detailItem?.skills, "skill");
  const externalLinks = Array.isArray(
    detailItem?.externalLinks ?? detailItem?.external_links
  )
    ? detailItem.externalLinks ?? detailItem.external_links
    : [];
  const customAnswers = Array.isArray(detailItem?.customAnswers)
    ? detailItem.customAnswers
    : [];
  const additionalFiles = Array.isArray(detailItem?.additional_files)
    ? detailItem.additional_files
    : [];

  return (
    <>
      <Modal
        title={job ? `Applications — ${job.job_title || ""}` : "Applications"}
        open={open}
        onCancel={onClose}
        footer={null}
        width={1100}
      >
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button
              icon={<ReloadOutlined />}
              onClick={() => job?.id != null && fetchList(job.id)}
            >
              Refresh
            </Button>
          </div>
          <Table
            rowKey={(record) => record.rowKey}
            columns={columns}
            scroll={{ x: "max-content" }}
            dataSource={items}
            loading={isLoading}
            pagination={false}
          />
        </div>
      </Modal>

      <Modal
        title="Application Details"
        open={!!detailItem}
        onCancel={() => setDetailItem(null)}
        footer={[
          <Button key="close" onClick={() => setDetailItem(null)}>
            Close
          </Button>,
        ]}
        width={720}
        loading={isDetailLoading}
      >
        {detailItem && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>Type:</strong> {detailItem.type}
              </div>
              <div>
                <strong>Name:</strong>{" "}
                {[detailItem.first_name, detailItem.last_name]
                  .filter(Boolean)
                  .join(" ") || "-"}
              </div>
              <div>
                <strong>Email:</strong> {detailItem.email || "-"}
              </div>
              <div>
                <strong>Phone:</strong> {detailItem.phone_number || "-"}
              </div>
              <div>
                <strong>Location:</strong>{" "}
                {[detailItem.city, detailItem.country]
                  .filter(Boolean)
                  .join(", ") || "-"}
              </div>
              <div>
                <strong>Experience Level:</strong>{" "}
                {getExperienceLevelLabel(detailItem.experience_level)}
              </div>
              <div>
                <strong>Experience (years):</strong>{" "}
                {detailItem.experience_years ?? "-"}
              </div>
              <div>
                <strong>Education Level:</strong>{" "}
                {detailItem.education_level || "-"}
              </div>
              <div>
                <strong>Current Job Title:</strong>{" "}
                {detailItem.current_job_title || "-"}
              </div>
              <div>
                <strong>Status:</strong>{" "}
                <Tag
                  color={
                    detailItem.application_status === "accepted"
                      ? "green"
                      : "orange"
                  }
                >
                  {detailItem.application_status || "pending"}
                </Tag>
              </div>
            </div>

            {detailItem.bio && (
              <div>
                <strong>Bio:</strong>
                <p className="mt-1 whitespace-pre-wrap">{detailItem.bio}</p>
              </div>
            )}
            {detailItem.cover_letter && (
              <div>
                <strong>Cover Letter:</strong>
                <p className="mt-1 whitespace-pre-wrap">
                  {detailItem.cover_letter}
                </p>
              </div>
            )}

            {skills.length > 0 && (
              <div>
                <strong>Skills:</strong>
                <div className="mt-1">
                  <Space size={[8, 8]} wrap>
                    {skills.map((skill, index) => (
                      <Tag key={`${skill}-${index}`}>{skill}</Tag>
                    ))}
                  </Space>
                </div>
              </div>
            )}

            {languages.length > 0 && (
              <div>
                <strong>Languages:</strong>
                <ul className="mt-1 list-disc pl-5">
                  {languages.map((lang, index) => (
                    <li key={index}>
                      {typeof lang === "string"
                        ? lang
                        : `${lang?.language ?? ""}${
                            lang?.level ? ` (${lang.level})` : ""
                          }`}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {externalLinks.length > 0 && (
              <div>
                <strong>External Links:</strong>
                <ul className="mt-1 list-disc pl-5">
                  {externalLinks.map((link, index) => (
                    <li key={index}>
                      {link?.type ? `${link.type}: ` : ""}
                      <a
                        href={link?.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600"
                      >
                        {link?.url}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {customAnswers.length > 0 && (
              <div>
                <strong>Custom Answers:</strong>
                <ul className="mt-1 list-disc pl-5">
                  {customAnswers.map((answer, index) => (
                    <li key={answer?.field_key ?? index}>
                      {answer?.field_key}: {answer?.value}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {detailItem.cv_file && (
              <div>
                <strong>CV: </strong>
                <a
                  href={detailItem.cv_file}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600"
                >
                  Download CV
                </a>
              </div>
            )}

            {additionalFiles.length > 0 && (
              <div>
                <strong>Additional Files:</strong>
                <ul className="mt-1 list-disc pl-5">
                  {additionalFiles.map((file, index) => (
                    <li key={index}>
                      <a
                        href={file}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600"
                      >
                        File {index + 1}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
