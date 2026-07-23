import { useEffect, useState } from "react";
import {
  Button,
  Modal,
  Form,
  Upload,
  Popconfirm,
  Card,
  Pagination,
  Spin,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import SortableCards, { CardDragHandle } from "../components/common/SortableCards.jsx";
import { useBannerStore } from "../store/bannerStore.js";

const Banner = () => {
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
    reorder,
  } = useBannerStore();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addForm] = Form.useForm();
  const [videoFileList, setVideoFileList] = useState([]);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm] = Form.useForm();
  const [editVideoFileList, setEditVideoFileList] = useState([]);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchList();
  }, [page, perPage]);

  const handleAdd = async () => {
    try {
      const values = await addForm.validateFields();
      const payload = {
        video: null,
      };

      if (videoFileList[0]?.originFileObj) {
        payload.video = videoFileList[0].originFileObj;
      }

      if (!payload.video) {
        toast.error("Please upload a video.");
        return;
      }

      await create(payload);
      setIsAddOpen(false);
      addForm.resetFields();
      setVideoFileList([]);
    } catch (err) {
      if (err?.response?.data?.message) {
        toast.error(err.response.data.message);
      } else if (err?.message) {
        toast.error(err.message);
      }
    }
  };

  const handleEdit = async () => {
    try {
      const values = await editForm.validateFields();
      const payload = {};

      if (editVideoFileList[0]?.originFileObj) {
        payload.video = editVideoFileList[0].originFileObj;
      } else {
        toast.error("Please upload a new video.");
        return;
      }

      await update(editingId, payload);
      setIsEditOpen(false);
      editForm.resetFields();
      setEditVideoFileList([]);
      setEditingId(null);
    } catch (err) {
      if (err?.response?.data?.message) {
        toast.error(err.response.data.message);
      } else if (err?.message) {
        toast.error(err.message);
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await remove(id);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Delete failed"
      );
    }
  };

  const openEditModal = (banner) => {
    setEditingId(banner.id);
    setIsEditOpen(true);
    editForm.resetFields();
    setEditVideoFileList([]);
  };

  const handleRefresh = async () => {
    await fetchList();
    toast.success("Data refreshed successfully");
  };

  const handlePaginationChange = (nextPage, nextSize) => {
    if (nextSize !== perPage) setPerPage(nextSize);
    if (nextPage !== page) setPage(nextPage);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Banner Videos</h2>
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
          <SortableCards
            items={items}
            rowKey="id"
            onReorder={reorder}
            renderItem={(banner) => (
              <Card
                hoverable
                cover={
                  <div className="h-48 overflow-hidden bg-gray-100">
                    {banner.video ? (
                      <video
                        src={banner.video}
                        className="w-full h-full object-cover"
                        controls
                        muted
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Video
                      </div>
                    )}
                  </div>
                }
                actions={[
                  <EditOutlined
                    key="edit"
                    onClick={() => openEditModal(banner)}
                  />,
                  <Popconfirm
                    key="delete"
                    title="Delete this video?"
                    okText="Yes"
                    cancelText="No"
                    onConfirm={() => handleDelete(banner.id)}
                  >
                    <DeleteOutlined danger />
                  </Popconfirm>,
                ]}
              >
                <Card.Meta
                  title={
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-base">
                        Video #{banner.id}
                      </span>
                      <CardDragHandle />
                    </div>
                  }
                  description={
                    <div className="text-gray-600 text-sm">
                      {new Date(banner.created_at).toLocaleDateString()}
                    </div>
                  }
                />
              </Card>
            )}
          />

          {total > perPage && (
            <div className="flex justify-center mt-8">
              <Pagination
                current={page}
                pageSize={perPage}
                total={total}
                showSizeChanger
                pageSizeOptions={["5", "10", "20", "50"]}
                onChange={handlePaginationChange}
                onShowSizeChange={handlePaginationChange}
              />
            </div>
          )}
        </>
      )}

      {/* Add Modal */}
      <Modal
        title="Add Video"
        open={isAddOpen}
        onCancel={() => {
          setIsAddOpen(false);
          addForm.resetFields();
          setVideoFileList([]);
        }}
        onOk={handleAdd}
        confirmLoading={isLoading}
        okText="Create"
        width={600}
      >
        <Form form={addForm} layout="vertical">
          <Form.Item label="Upload Video" required>
            <Upload
              fileList={videoFileList}
              beforeUpload={() => false}
              maxCount={1}
              accept="video/*"
              onChange={({ fileList }) => setVideoFileList(fileList)}
            >
              <Button icon={<PlusOutlined />}>Upload Video</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Update Video"
        open={isEditOpen}
        onCancel={() => {
          setIsEditOpen(false);
          editForm.resetFields();
          setEditVideoFileList([]);
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
              fileList={editVideoFileList}
              beforeUpload={() => false}
              maxCount={1}
              accept="video/*"
              onChange={({ fileList }) => setEditVideoFileList(fileList)}
            >
              <Button icon={<PlusOutlined />}>Upload Video</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Banner;
