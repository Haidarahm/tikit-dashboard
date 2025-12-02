import { useEffect, useMemo, useCallback, useState } from "react";
import { Table, Button, Space, Tag, Popover } from "antd";
import {
  ReloadOutlined,
  CheckOutlined,
  CloseOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { useRegisteredInfluencersStore } from "../store/registeredInfluencersStore.js";
import { toast } from "react-toastify";

const RegisteredInfluencers = () => {
  const {
    items,
    total,
    page,
    perPage,
    isLoading,
    fetchList,
    setPage,
    setPerPage,
    updateStatus,
  } = useRegisteredInfluencersStore();

  const [openPopovers, setOpenPopovers] = useState({});

  useEffect(() => {
    fetchList();
  }, [page, perPage]);

  const handleStatusUpdate = useCallback(
    async (id, status) => {
      try {
        await updateStatus(id, status);
        setOpenPopovers((prev) => ({ ...prev, [id]: false }));
      } catch (error) {
        if (error?.response?.data?.message) {
          toast.error(error.response.data.message);
        } else if (error?.message) {
          toast.error(error.message);
        }
      }
    },
    [updateStatus]
  );

  const columns = useMemo(
    () => [
      {
        title: "ID",
        dataIndex: "id",
        key: "id",
        width: 80,
      },
      {
        title: "Name",
        dataIndex: "name",
        key: "name",
        width: 180,
      },
      {
        title: "Email",
        dataIndex: "email",
        key: "email",
        width: 220,
      },
      {
        title: "Phone",
        dataIndex: "phone",
        key: "phone",
        width: 150,
      },
      {
        title: "Nationality",
        dataIndex: "nationality",
        key: "nationality",
        width: 120,
      },
      {
        title: "Residence",
        dataIndex: "residence",
        key: "residence",
        width: 200,
      },
      {
        title: "Type",
        dataIndex: "type",
        key: "type",
        width: 120,
        render: (type) => (
          <Tag color={type === "premium" ? "gold" : "default"}>
            {type || "-"}
          </Tag>
        ),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 120,
        render: (status) => {
          const color =
            status === "accepted"
              ? "green"
              : status === "rejected"
              ? "red"
              : "default";
          return <Tag color={color}>{status || "-"}</Tag>;
        },
      },
      {
        title: "Followers",
        dataIndex: "followerCount",
        key: "followerCount",
        width: 120,
        render: (count) => (count ? count.toLocaleString() : "-"),
      },
      {
        title: "Why Join",
        dataIndex: "whyJoin",
        key: "whyJoin",
        width: 250,
        ellipsis: true,
      },
      {
        title: "Actions",
        key: "actions",
        width: 100,
        fixed: "right",
        render: (record) => {
          const isPending = record.status === "pending" || !record.status;
          const isOpen = openPopovers[record.id] || false;
          const popoverContent = (
            <div className="flex flex-col gap-2">
              <Button
                type="primary"
                icon={<CheckOutlined />}
                size="small"
                block
                style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
                onClick={() => handleStatusUpdate(record.id, "accepted")}
              >
                Accept
              </Button>
              <Button
                danger
                icon={<CloseOutlined />}
                size="small"
                block
                onClick={() => handleStatusUpdate(record.id, "rejected")}
              >
                Reject
              </Button>
            </div>
          );

          return (
            <Popover
              content={popoverContent}
              title="Change Status"
              trigger="click"
              placement="left"
              open={isOpen}
              onOpenChange={(open) =>
                setOpenPopovers((prev) => ({ ...prev, [record.id]: open }))
              }
            >
              <Button
                icon={<MoreOutlined />}
                size="small"
                disabled={!isPending}
              />
            </Popover>
          );
        },
      },
    ],
    [handleStatusUpdate, openPopovers]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Registered Influencers</h2>
          <p className="text-gray-600">
            Manage registered influencers and their status.
          </p>
        </div>
        <Button icon={<ReloadOutlined />} onClick={() => fetchList()}>
          Refresh
        </Button>
      </div>

      <Table
        rowKey={(record) => record.id}
        columns={columns}
        dataSource={items}
        loading={isLoading}
        scroll={{ x: 1500 }}
        pagination={{
          current: page,
          pageSize: perPage,
          total,
          showSizeChanger: true,
          pageSizeOptions: ["10", "25", "50", "100"],
          onChange: (nextPage, nextSize) => {
            if (nextSize !== perPage) setPerPage(nextSize);
            if (nextPage !== page) setPage(nextPage);
          },
        }}
      />
    </div>
  );
};

export default RegisteredInfluencers;
