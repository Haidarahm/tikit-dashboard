import { useMemo } from "react";
import { Button, Popconfirm, Space, Typography } from "antd";
import { toast } from "react-toastify";

const { Text } = Typography;

/**
 * @param {{
 *   remove: (id: number) => Promise<unknown>;
 *   expandedBriefs: Set<unknown>;
 *   setExpandedBriefs: React.Dispatch<React.SetStateAction<Set<unknown>>>;
 *   expandedStrategies: Set<unknown>;
 *   setExpandedStrategies: React.Dispatch<React.SetStateAction<Set<unknown>>>;
 *   onView: (record: unknown) => void;
 *   onEdit: (record: unknown) => void;
 *   isSuperAdmin?: boolean;
 * }} params
 */
export function useFeaturedTableColumns({
  remove,
  expandedBriefs,
  setExpandedBriefs,
  expandedStrategies,
  setExpandedStrategies,
  onView,
  onEdit,
  isSuperAdmin = false,
}) {
  return useMemo(
    () => [
      {
        title: "Title",
        dataIndex: "title_en",
        key: "title_en",
        render: (value, record) => value || record.title || "-",
      },
      {
        title: "Brief",
        dataIndex: "brief_en",
        key: "brief_en",
        width: 300,
        render: (value, record) => {
          const text = value || record.brief || "-";
          const isExpanded = expandedBriefs.has(record.id);

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
                  setExpandedBriefs((prev) => {
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
      },
      {
        title: "Strategy",
        dataIndex: "strategy_en",
        key: "strategy_en",
        width: 300,
        render: (value, record) => {
          const text = value || record.strategy || "-";
          const isExpanded = expandedStrategies.has(record.id);

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
                  setExpandedStrategies((prev) => {
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
      },
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
        title: "Actions",
        key: "actions",
        width: 220,
        render: (_, record) => (
          <Space>
            <Button onClick={() => onView(record)}>View</Button>
            <Button onClick={() => onEdit(record)}>Update</Button>
            {isSuperAdmin && (
              <Popconfirm
                title="Delete this campaign?"
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
                <Button danger>Delete</Button>
              </Popconfirm>
            )}
          </Space>
        ),
      },
    ],
    [
      remove,
      expandedBriefs,
      expandedStrategies,
      setExpandedBriefs,
      setExpandedStrategies,
      onView,
      onEdit,
      isSuperAdmin,
    ]
  );
}
