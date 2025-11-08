import { useEffect, useState } from "react";
import {
  Button,
  Modal,
  Form,
  Upload,
  Popconfirm,
  Pagination,
  Spin,
  Tooltip,
  Row,
  Col,
  Card,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import { useAboutBannerStore } from "../store/aboutBannerStore.js";

const AboutBanners = () => {
  const {
    items,
    total,
    page,
    perPage,
    isLoading,
    fetchList,
    setPage,
    setPerPage,
    create,
    update,
    remove,
  } = useAboutBannerStore();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addForm] = Form.useForm();
  const [mediaFileList, setMediaFileList] = useState([]);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm] = Form.useForm();
  const [editMediaFileList, setEditMediaFileList] = useState([]);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchList();
  }, [page, perPage]);

  const handleAdd = async () => {
    try {
      const payload = {
        media: mediaFileList[0]?.originFileObj || null,
      };

      if (!payload.media) {
        toast.error("Please upload a video file.");
        return;
      }

      await create(payload);
      setIsAddOpen(false);
      addForm.resetFields();
      setMediaFileList([]);
    } catch (error) {
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error?.message) {
        toast.error(error.message);
      }
    }
  };

  const handleEdit = async () => {
    try {
      const payload = {
        media: editMediaFileList[0]?.originFileObj || null,
      };

      if (!payload.media) {
        toast.error("Please upload a new video file.");
        return;
      }

      await update(editingId, payload);
      setIsEditOpen(false);
      editForm.resetFields();
      setEditMediaFileList([]);
      setEditingId(null);
    } catch (error) {
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error?.message) {
        toast.error(error.message);
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await remove(id);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error?.message || "Delete failed"
      );
    }
  };

  const openEditModal = (banner) => {
    setEditingId(banner.id);
    setIsEditOpen(true);
    editForm.resetFields();
    setEditMediaFileList([]);
  };

  const handleRefresh = async () => {
    await fetchList();
    toast.success("Data refreshed successfully");
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">About Us Banner Videos</h2>
        <div className="flex items-center gap-2">
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={isLoading}
          >
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsAddOpen(true)}
          >
            Add Video
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <Spin size="large" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No videos found</p>
        </div>
      ) : (
        <>
          <Row gutter={[24, 24]}>
            {items.map((banner) => (
              <Col xs={24} sm={12} md={8} lg={6} key={banner.id}>
                <Card
                  hoverable
                  bodyStyle={{ padding: 0 }}
                  cover={
                    banner.media ? (
                      <video
                        src={banner.media}
                        className="w-full h-48 object-cover rounded-t-md"
                        controls
                      />
                    ) : (
                      <div className="h-48 flex items-center justify-center text-gray-400 bg-gray-100">
                        No Video
                      </div>
                    )
                  }
                  actions={[
                    <Tooltip key="edit" title="Edit">
                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => openEditModal(banner)}
                      />
                    </Tooltip>,
                    <Popconfirm
                      key="delete"
                      title="Delete this video?"
                      okText="Yes"
                      cancelText="No"
                      onConfirm={() => handleDelete(banner.id)}
                    >
                      <Tooltip title="Delete">
                        <Button type="text" danger icon={<DeleteOutlined />} />
                      </Tooltip>
                    </Popconfirm>,
                  ]}
                />
              </Col>
            ))}
          </Row>

          {total > perPage && (
            <div className="flex justify-center mt-8">
              <Pagination
                current={page}
                pageSize={perPage}
                total={total}
                showSizeChanger
                pageSizeOptions={["5", "10", "20", "50"]}
                onChange={(nextPage, nextSize) => {
                  if (nextSize !== perPage) setPerPage(nextSize);
                  if (nextPage !== page) setPage(nextPage);
                }}
              />
            </div>
          )}
        </>
      )}

      <Modal
        title="Add Video"
        open={isAddOpen}
        onCancel={() => {
          setIsAddOpen(false);
          addForm.resetFields();
          setMediaFileList([]);
        }}
        onOk={handleAdd}
        confirmLoading={isLoading}
        okText="Create"
        width={600}
      >
        <Form form={addForm} layout="vertical">
          <Form.Item label="Upload Video" required>
            <Upload
              fileList={mediaFileList}
              beforeUpload={() => false}
              maxCount={1}
              accept="video/*"
              onChange={({ fileList }) => setMediaFileList(fileList)}
            >
              <Button icon={<PlusOutlined />}>Upload Video</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Update Video"
        open={isEditOpen}
        onCancel={() => {
          setIsEditOpen(false);
          editForm.resetFields();
          setEditMediaFileList([]);
          setEditingId(null);
        }}
        onOk={handleEdit}
        confirmLoading={isLoading}
        okText="Update"
        width={600}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item label="Upload New Video" required>
            <Upload
              fileList={editMediaFileList}
              beforeUpload={() => false}
              maxCount={1}
              accept="video/*"
              onChange={({ fileList }) => setEditMediaFileList(fileList)}
            >
              <Button icon={<PlusOutlined />}>Upload Video</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AboutBanners;
