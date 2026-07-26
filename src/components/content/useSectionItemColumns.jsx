import { useMemo } from "react";
import { Button, Dropdown, Popconfirm, Space, Typography } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import ActiveStatusSwitch from "./ActiveStatusSwitch.jsx";

const { Text } = Typography;

const notifyError = (error) => {
  if (error?.response?.data?.message) {
    toast.error(error.response.data.message);
  } else if (error?.message) {
    toast.error(error.message);
  }
};

const clampedTextColumn = ({ title, key, localizedKey, expanded, setExpanded }) => ({
  title,
  dataIndex: key,
  key,
  width: 300,
  render: (value, record) => {
    const text = record[localizedKey] || value || "-";
    const isExpanded = expanded.has(record.id);

    if (text === "-" || !text) {
      return <Text>{text}</Text>;
    }

    return (
      <div>
        <div
          style={{
            display: "-webkit-box",
            WebkitLineClamp: isExpanded ? "unset" : 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            wordBreak: "break-word",
            lineHeight: "1.5",
            maxHeight: isExpanded ? "none" : "3em",
          }}
        >
          <Text>{text}</Text>
        </div>
        <Button
          type="link"
          size="small"
          onClick={() => {
            setExpanded((prev) => {
              const next = new Set(prev);
              if (isExpanded) next.delete(record.id);
              else next.add(record.id);
              return next;
            });
          }}
          style={{ padding: 0, marginTop: 4, height: "auto" }}
        >
          {isExpanded ? "Read less" : "Read more"}
        </Button>
      </div>
    );
  },
});

/**
 * Table columns shared by the showcase projects and featured campaigns lists.
 * Both sections render the same fields; only the noun used in the confirmation
 * copy differs.
 *
 * @param {{
 *   entityNoun: string;
 *   remove: (id: number) => Promise<unknown>;
 *   toggleActive: (id: number, isActive: boolean) => Promise<unknown>;
 *   expandedBriefs: Set<unknown>;
 *   setExpandedBriefs: React.Dispatch<React.SetStateAction<Set<unknown>>>;
 *   expandedStrategies: Set<unknown>;
 *   setExpandedStrategies: React.Dispatch<React.SetStateAction<Set<unknown>>>;
 *   onView: (record: unknown) => void;
 *   onEdit: (record: unknown) => void;
 *   onDuplicate: (record: unknown) => void;
 *   onCopy: (record: unknown) => void;
 *   onMove: (record: unknown) => void;
 *   isSuperAdmin?: boolean;
 * }} params
 */
export function useSectionItemColumns({
  entityNoun,
  remove,
  toggleActive,
  expandedBriefs,
  setExpandedBriefs,
  expandedStrategies,
  setExpandedStrategies,
  onView,
  onEdit,
  onDuplicate,
  onCopy,
  onMove,
  isSuperAdmin = false,
}) {
  return useMemo(
    () => [
      {
        title: "Title",
        dataIndex: "title_en",
        key: "title_en",
        render: (value, record) => record.title || value || "-",
      },
      clampedTextColumn({
        title: "Brief",
        key: "brief_en",
        localizedKey: "brief",
        expanded: expandedBriefs,
        setExpanded: setExpandedBriefs,
      }),
      clampedTextColumn({
        title: "Strategy",
        key: "strategy_en",
        localizedKey: "strategy",
        expanded: expandedStrategies,
        setExpanded: setExpandedStrategies,
      }),
      {
        title: "Reach",
        dataIndex: "reach",
        key: "reach",
        width: 120,
      },
      {
        title: "Views",
        dataIndex: "views",
        key: "views",
        width: 120,
      },
      {
        title: "Engagement Rate",
        dataIndex: "engagement_rate",
        key: "engagement_rate",
        width: 160,
      },
      {
        title: "Status",
        key: "is_active",
        width: 120,
        render: (_, record) => (
          <ActiveStatusSwitch
            isActive={record.is_active}
            onToggle={(nextValue) => toggleActive(record.id, nextValue)}
          />
        ),
      },
      {
        title: "Actions",
        key: "actions",
        width: 320,
        render: (_, record) => (
          <Space>
            <Button onClick={() => onView(record)}>View</Button>
            <Button onClick={() => onEdit(record)}>Update</Button>
            {isSuperAdmin && (
              <Dropdown
                menu={{
                  items: [
                    { key: "duplicate", label: "Duplicate" },
                    { key: "copy", label: "Copy to section…" },
                    { key: "move", label: "Move to section…" },
                  ],
                  onClick: ({ key }) => {
                    if (key === "duplicate") onDuplicate(record);
                    else if (key === "copy") onCopy(record);
                    else if (key === "move") onMove(record);
                  },
                }}
              >
                <Button>
                  More <DownOutlined />
                </Button>
              </Dropdown>
            )}
            {isSuperAdmin && (
              <Popconfirm
                title={`Delete this ${entityNoun}?`}
                okText="Yes"
                cancelText="No"
                onConfirm={async () => {
                  try {
                    await remove(record.id);
                  } catch (error) {
                    notifyError(error);
                  }
                }}
              >
                <Button danger>Delete</Button>
              </Popconfirm>
            )}
          </Space>
        ),
      },
    ],
    [
      entityNoun,
      remove,
      toggleActive,
      expandedBriefs,
      expandedStrategies,
      setExpandedBriefs,
      setExpandedStrategies,
      onView,
      onEdit,
      onDuplicate,
      onCopy,
      onMove,
      isSuperAdmin,
    ]
  );
}
