import { useEffect, useMemo, useCallback, useState } from "react";
import { Table, Button, Space, Tag, Popover, Modal, Descriptions, List, Card, Typography } from "antd";
import {
  ReloadOutlined,
  CheckOutlined,
  CloseOutlined,
  MoreOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import {
  FaInstagram,
  FaTiktok,
  FaYoutube,
  FaFacebook,
  FaTwitter,
  FaSnapchatGhost,
  FaLinkedin,
  FaGlobe,
} from "react-icons/fa";
import { useRegisteredInfluencersStore } from "../store/registeredInfluencersStore.js";
import { toast } from "react-toastify";

const { Link } = Typography;

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
    fetchItem,
    selectedItem,
    setSelectedItem,
  } = useRegisteredInfluencersStore();

  const [openPopovers, setOpenPopovers] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleView = useCallback(
    async (id) => {
      await fetchItem(id);
      setIsModalOpen(true);
    },
    [fetchItem]
  );

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

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
      {
        title: "View",
        key: "view",
        width: 80,
        fixed: "right",
        render: (_, record) => (
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleView(record.id)}
          />
        ),
      },
    ],
    [handleStatusUpdate, openPopovers, handleView]
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

      <Modal
        title="Registered Influencer Details"
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={[
          <Button key="close" onClick={handleCloseModal}>
            Close
          </Button>,
        ]}
        width={800}
      >
        {selectedItem ? (
          <div className="flex flex-col gap-6">
            <Descriptions bordered size="small" column={1} title="Creator Info">
              <Descriptions.Item label="ID">
                {selectedItem.creator?.id}
              </Descriptions.Item>
              <Descriptions.Item label="Name">
                {selectedItem.creator?.name}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedItem.creator?.email}
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                {selectedItem.creator?.phone}
              </Descriptions.Item>
              <Descriptions.Item label="Nationality">
                {selectedItem.creator?.nationality}
              </Descriptions.Item>
              <Descriptions.Item label="Residence">
                {selectedItem.creator?.residence}
              </Descriptions.Item>
              <Descriptions.Item label="Type">
                {selectedItem.creator?.type}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag
                  color={
                    selectedItem.creator?.status === "accepted"
                      ? "green"
                      : selectedItem.creator?.status === "rejected"
                      ? "red"
                      : "default"
                  }
                >
                  {selectedItem.creator?.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Follower Count">
                {selectedItem.creator?.followerCount?.toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Why Join">
                {selectedItem.creator?.whyJoin}
              </Descriptions.Item>
              <Descriptions.Item label="Media">
                {selectedItem.creator?.media ? (
                  <Link
                    href={selectedItem.creator.media}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View {selectedItem.creator.mediaType || "File"}
                  </Link>
                ) : (
                  "-"
                )}
              </Descriptions.Item>
            </Descriptions>

            {selectedItem.niches && selectedItem.niches.length > 0 && (
              <Card size="small" title="Niches">
                <Space wrap>
                  {selectedItem.niches.map((niche, index) => (
                    <Tag key={index} color="blue">
                      {niche}
                    </Tag>
                  ))}
                </Space>
              </Card>
            )}

            {selectedItem.social_links &&
              selectedItem.social_links.length > 0 && (
                <Card size="small" title="Social Links">
                  <List
                    itemLayout="horizontal"
                    dataSource={selectedItem.social_links}
                    renderItem={(item) => {
                      const getIcon = (platform) => {
                        const p = platform?.toLowerCase();
                        if (p?.includes("instagram"))
                          return <FaInstagram size={24} color="#E1306C" />;
                        if (p?.includes("tiktok"))
                          return <FaTiktok size={24} color="#000000" />;
                        if (p?.includes("youtube"))
                          return <FaYoutube size={24} color="#FF0000" />;
                        if (p?.includes("facebook"))
                          return <FaFacebook size={24} color="#1877F2" />;
                        if (p?.includes("twitter") || p?.includes("x"))
                          return <FaTwitter size={24} color="#1DA1F2" />;
                        if (p?.includes("snapchat"))
                          return <FaSnapchatGhost size={24} color="#FFFC00" />;
                        if (p?.includes("linkedin"))
                          return <FaLinkedin size={24} color="#0A66C2" />;
                        return <FaGlobe size={24} color="#555" />;
                      };

                      return (
                        <List.Item>
                          <List.Item.Meta
                            avatar={
                              <a
                                href={item.link}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-center p-2 hover:opacity-80 transition-opacity"
                              >
                                {getIcon(item.platform)}
                              </a>
                            }
                            title={
                              <Link
                                href={item.link}
                                target="_blank"
                                rel="noreferrer"
                                className="capitalize font-medium"
                              >
                                {item.platform}
                              </Link>
                            }
                            description={
                              item.prices &&
                              item.prices.length > 0 && (
                                <Space wrap className="mt-1">
                                  {item.prices.map((price) => (
                                    <Tag key={price.id}>
                                      {price.type}: {price.price}
                                    </Tag>
                                  ))}
                                </Space>
                              )
                            }
                          />
                        </List.Item>
                      );
                    }}
                  />
                </Card>
              )}
          </div>
        ) : (
          <div className="p-4 text-center">Loading...</div>
        )}
      </Modal>
    </div>
  );
};

export default RegisteredInfluencers;
