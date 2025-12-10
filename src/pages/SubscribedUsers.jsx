import { useEffect, useMemo } from "react";
import { Table, Button, Space } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { useSubscribedUsersStore } from "../store/subscribedUsersStore.js";

const SubscribedUsers = () => {
  const {
    items,
    total,
    page,
    perPage,
    isLoading,
    fetchList,
    setPage,
    setPerPage,
  } = useSubscribedUsersStore();

  useEffect(() => {
    fetchList();
  }, [page, perPage]);

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
      },
      {
        title: "Email",
        dataIndex: "email",
        key: "email",
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Subscribed Users</h2>
          <p className="text-gray-600">
            View all users who have subscribed to the newsletter.
          </p>
        </div>
        <Space wrap>
          <Button icon={<ReloadOutlined />} onClick={() => fetchList()}>
            Refresh
          </Button>
        </Space>
      </div>

      <Table
        rowKey={(record) => record.id}
        columns={columns}
        dataSource={items}
        loading={isLoading}
        pagination={{
          current: page,
          pageSize: perPage,
          total,
          showSizeChanger: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} users`,
          onChange: (nextPage, nextSize) => {
            if (nextSize !== perPage) setPerPage(nextSize);
            if (nextPage !== page) setPage(nextPage);
          },
        }}
      />
    </div>
  );
};

export default SubscribedUsers;
