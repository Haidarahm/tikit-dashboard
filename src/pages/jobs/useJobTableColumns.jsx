import { useMemo } from "react";
import { Button, Popconfirm, Space, Tag } from "antd";
import {
  DatabaseOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import {
  getExperienceLevelLabel,
  getJobTypeLabel,
  getWorkModeLabel,
} from "./jobConstants.js";

export function useJobTableColumns({
  remove,
  onView,
  onEdit,
  onViewApplications,
}) {
  return useMemo(
    () => [
      {
        title: "ID",
        dataIndex: "id",
        key: "id",
        width: 80,
      },
      {
        title: "Title",
        dataIndex: "job_title",
        key: "job_title",
        render: (value) => value || "-",
      },
      {
        title: "Category",
        dataIndex: "job_category",
        key: "job_category",
        render: (value) => value || "-",
      },
      {
        title: "Type",
        dataIndex: "job_type",
        key: "job_type",
        render: (value) => getJobTypeLabel(value),
      },
      {
        title: "Work Mode",
        dataIndex: "work_mode",
        key: "work_mode",
        render: (value) => getWorkModeLabel(value),
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
        dataIndex: "job_status",
        key: "job_status",
        render: (value) => (
          <Tag color={value === "open" ? "green" : "red"}>
            {value || "-"}
          </Tag>
        ),
      },
      {
        title: "Actions",
        key: "actions",
        width: 240,
        render: (_, record) => (
          <Space>
            <Button icon={<EyeOutlined />} onClick={() => onView(record)} />
            <Button icon={<EditOutlined />} onClick={() => onEdit(record)} />
            <Button
              icon={<DatabaseOutlined />}
              onClick={() => onViewApplications(record)}
            />
            <Popconfirm
              title="Delete this job?"
              okText="Yes"
              cancelText="No"
              onConfirm={async () => {
                try {
                  await remove(record.id);
                } catch (error) {
                  if (error?.response?.data?.message) {
                    toast.error(error.response.data.message);
                  } else if (error?.message) {
                    toast.error(error.message);
                  }
                }
              }}
            >
              <Button danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [remove, onView, onEdit, onViewApplications]
  );
}
