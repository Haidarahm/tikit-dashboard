import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Upload,
  Popconfirm,
  Card,
  Row,
  Col,
  Pagination,
  Spin,
  Image,
  Badge,
  Tooltip,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  CloseOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import { useInfluencersItemsStore } from "../../store/works/influencersItemsStore.js";

const InfluencersItems = () => {
  const { id } = useParams();
  const {
    items,
    total,
    page,
    perPage,
    isLoading,
    fetchList,
    setPage,
    setPerPage,
    setWorkId,
    create,
    update,
    remove,
  } = useInfluencersItemsStore();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addForm] = Form.useForm();
  const [imageFileList, setImageFileList] = useState([]);
  const [logoFileList, setLogoFileList] = useState([]);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm] = Form.useForm();
  const [editImageFileList, setEditImageFileList] = useState([]);
  const [editLogoFileList, setEditLogoFileList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [previewModal, setPreviewModal] = useState({
    open: false,
    images: [],
    current: 0,
  });

  useEffect(() => {
    if (id) {
      setWorkId(id);
      fetchList(id);
    }
  }, [id, page, perPage]);

  const handleAdd = async () => {
    try {
      const values = await addForm.validateFields();
      const payload = {
        work_id: id,
        title_en: values.title_en,
        title_ar: values.title_ar,
        title_fr: values.title_fr,
        reach: values.reach,
        views: values.views,
        objective_en: values.objective_en,
        objective_ar: values.objective_ar,
        objective_fr: values.objective_fr,
        engagement_rate: values.engagement_rate,
        images: imageFileList
          .map((file) => file.originFileObj)
          .filter((file) => file),
      };

      if (logoFileList[0]?.originFileObj) {
        payload.logo = logoFileList[0].originFileObj;
      }

      if (!payload.logo) {
        toast.error("Please upload a logo.");
        return;
      }

      if (payload.images.length === 0) {
        toast.error("Please upload at least one image.");
        return;
      }

      await create(payload);
      setIsAddOpen(false);
      addForm.resetFields();
      setImageFileList([]);
      setLogoFileList([]);
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

      if (values.title_en) payload.title_en = values.title_en;
      if (values.title_ar) payload.title_ar = values.title_ar;
      if (values.title_fr) payload.title_fr = values.title_fr;
      if (values.reach) payload.reach = values.reach;
      if (values.views) payload.views = values.views;
      if (values.objective_en) payload.objective_en = values.objective_en;
      if (values.objective_ar) payload.objective_ar = values.objective_ar;
      if (values.objective_fr) payload.objective_fr = values.objective_fr;
      if (values.engagement_rate)
        payload.engagement_rate = values.engagement_rate;

      const newImages = editImageFileList
        .map((file) => file.originFileObj)
        .filter((file) => file);
      if (newImages.length > 0) {
        payload.images = newImages;
      }

      if (editLogoFileList[0]?.originFileObj) {
        payload.logo = editLogoFileList[0].originFileObj;
      }

      await update(editingId, payload);
      setIsEditOpen(false);
      editForm.resetFields();
      setEditImageFileList([]);
      setEditLogoFileList([]);
      setEditingId(null);
    } catch (err) {
      if (err?.response?.data?.message) {
        toast.error(err.response.data.message);
      } else if (err?.message) {
        toast.error(err.message);
      }
    }
  };

  const handleDelete = async (itemId) => {
    try {
      await remove(itemId);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Delete failed"
      );
    }
  };

  const openEditModal = (item) => {
    const influence = item.influence || {};
    setEditingId(influence.id);
    setIsEditOpen(true);
    editForm.setFieldsValue({
      title_en: influence.title_en || "",
      title_ar: influence.title_ar || "",
      title_fr: influence.title_fr || "",
      reach: influence.reach || 0,
      views: influence.views || 0,
      objective_en: influence.objective_en || "",
      objective_ar: influence.objective_ar || "",
      objective_fr: influence.objective_fr || "",
      engagement_rate: influence.engagement_rate || 0,
    });
    setEditImageFileList([]);
    setEditLogoFileList([]);
  };

  const openPreviewModal = (media) => {
    if (media && media.length > 0) {
      setPreviewModal({
        open: true,
        images: media,
        current: 0,
      });
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Influencer Items</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsAddOpen(true)}
        >
          Add Item
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <Spin size="large" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No items found</p>
        </div>
      ) : (
        <>
          <Row gutter={[24, 24]}>
            {items.map((item) => {
              const influence = item.influence || {};
              const media = item.media || [];
              return (
                <Col xs={24} sm={12} md={8} lg={6} key={influence.id}>
                  <Card
                    hoverable
                    className="h-full flex flex-col overflow-hidden"
                    bodyStyle={{
                      padding: 0,
                      display: "flex",
                      flexDirection: "column",
                      flex: 1,
                      minHeight: 0,
                    }}
                    cover={
                      <div className="relative">
                        {/* Logo Section */}
                        <div className="h-40 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                          {influence.logo ? (
                            <Image
                              src={influence.logo}
                              alt={influence.title}
                              className="w-full h-full object-contain p-4"
                              preview={{
                                mask: "Preview Logo",
                                src: influence.logo,
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <div className="text-center">
                                <div className="text-4xl mb-2">🖼️</div>
                                <div className="text-sm">No Logo</div>
                              </div>
                            </div>
                          )}
                        </div>
                        {/* Media Preview Section */}
                        {media.length > 0 && (
                          <div className="bg-white border-t border-gray-200 p-2">
                            <div
                              className="flex gap-1 overflow-x-auto scrollbar-hide"
                              style={{ WebkitOverflowScrolling: "touch" }}
                            >
                              {media.slice(0, 4).map((img, idx) => (
                                <div
                                  key={idx}
                                  className="flex-shrink-0 w-16 h-16 rounded overflow-hidden border border-gray-200 cursor-pointer hover:border-blue-400 transition-colors"
                                  onClick={() => openPreviewModal(media)}
                                >
                                  <Image
                                    src={img}
                                    alt={`Media ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                    preview={false}
                                  />
                                </div>
                              ))}
                              {media.length > 4 && (
                                <div
                                  className="flex-shrink-0 w-16 h-16 rounded border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-blue-400 transition-colors bg-gray-50"
                                  onClick={() => openPreviewModal(media)}
                                >
                                  <div className="text-center px-1">
                                    <div className="text-xs font-semibold text-gray-600 leading-tight">
                                      +{media.length - 4}
                                    </div>
                                    <div className="text-[10px] text-gray-400 leading-tight">
                                      more
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    }
                    actions={[
                      <Tooltip title="View Media" key="view">
                        <Button
                          type="text"
                          icon={<EyeOutlined />}
                          onClick={() => openPreviewModal(media)}
                          disabled={media.length === 0}
                          className="flex items-center justify-center"
                        />
                      </Tooltip>,
                      <Tooltip title="Edit" key="edit">
                        <EditOutlined
                          onClick={() => openEditModal(item)}
                          className="text-blue-500 hover:text-blue-700"
                        />
                      </Tooltip>,
                      <Popconfirm
                        key="delete"
                        title="Delete this item?"
                        okText="Yes"
                        cancelText="No"
                        onConfirm={() => handleDelete(influence.id)}
                      >
                        <Tooltip title="Delete">
                          <DeleteOutlined
                            danger
                            className="text-red-500 hover:text-red-700"
                          />
                        </Tooltip>
                      </Popconfirm>,
                    ]}
                  >
                    <div className="p-4 flex flex-col flex-1 min-h-0 overflow-hidden">
                      <h3 className="font-bold text-base text-gray-900 line-clamp-2 mb-2 min-w-0 break-words">
                        {influence.title || "No Title"}
                      </h3>
                      {influence.objective && (
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3 min-w-0 break-words">
                          {influence.objective}
                        </p>
                      )}
                      <div className="space-y-2 mt-auto">
                        <div className="grid grid-cols-3 gap-1.5 text-xs min-w-0">
                          {influence.reach && (
                            <div className="bg-blue-50 rounded-lg p-1.5 text-center min-w-0 overflow-hidden">
                              <div className="text-gray-500 text-[10px] mb-0.5 truncate">
                                Reach
                              </div>
                              <div
                                className="font-bold text-blue-700 text-xs truncate"
                                title={influence.reach.toLocaleString()}
                              >
                                {influence.reach >= 1000000
                                  ? `${(influence.reach / 1000000).toFixed(1)}M`
                                  : influence.reach >= 1000
                                  ? `${(influence.reach / 1000).toFixed(1)}K`
                                  : influence.reach.toLocaleString()}
                              </div>
                            </div>
                          )}
                          {influence.views && (
                            <div className="bg-green-50 rounded-lg p-1.5 text-center min-w-0 overflow-hidden">
                              <div className="text-gray-500 text-[10px] mb-0.5 truncate">
                                Views
                              </div>
                              <div
                                className="font-bold text-green-700 text-xs truncate"
                                title={influence.views.toLocaleString()}
                              >
                                {influence.views >= 1000000
                                  ? `${(influence.views / 1000000).toFixed(1)}M`
                                  : influence.views >= 1000
                                  ? `${(influence.views / 1000).toFixed(1)}K`
                                  : influence.views.toLocaleString()}
                              </div>
                            </div>
                          )}
                          {influence.engagement_rate && (
                            <div className="bg-purple-50 rounded-lg p-1.5 text-center min-w-0 overflow-hidden">
                              <div className="text-gray-500 text-[10px] mb-0.5 truncate">
                                Engagement
                              </div>
                              <div className="font-bold text-purple-700 text-xs truncate">
                                {influence.engagement_rate}%
                              </div>
                            </div>
                          )}
                        </div>
                        {media.length > 0 && (
                          <div className="text-xs text-gray-500 text-center pt-1">
                            <Badge
                              count={media.length}
                              showZero={false}
                              size="small"
                            >
                              <span className="text-gray-600 text-xs">
                                Media
                              </span>
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>

          {total > 0 && (
            <div className="flex justify-center mt-8">
              <Pagination
                current={page}
                pageSize={perPage}
                total={total}
                showSizeChanger
                pageSizeOptions={["5", "10", "20", "50"]}
                onChange={(nextPage, nextSize) => {
                  if (nextSize !== perPage) {
                    setPerPage(nextSize);
                    setPage(1);
                  }
                  if (nextPage !== page) {
                    setPage(nextPage);
                  }
                }}
                showTotal={(total, range) =>
                  `${range[0]}-${range[1]} of ${total} items`
                }
              />
            </div>
          )}
        </>
      )}

      {/* Add Modal */}
      <Modal
        title="Add Influencer Item"
        open={isAddOpen}
        onCancel={() => {
          setIsAddOpen(false);
          addForm.resetFields();
          setImageFileList([]);
          setLogoFileList([]);
        }}
        onOk={handleAdd}
        confirmLoading={isLoading}
        okText="Create"
        width={900}
      >
        <Form form={addForm} layout="vertical">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Item
              name="title_en"
              label="Title (EN)"
              rules={[{ required: true }]}
            >
              <Input placeholder="Enter English title" />
            </Form.Item>
            <Form.Item
              name="title_ar"
              label="Title (AR)"
              rules={[{ required: true }]}
            >
              <Input placeholder="Enter Arabic title" />
            </Form.Item>
            <Form.Item
              name="title_fr"
              label="Title (FR)"
              rules={[{ required: true }]}
            >
              <Input placeholder="Enter French title" />
            </Form.Item>

            <Form.Item
              name="objective_en"
              label="Objective (EN)"
              rules={[{ required: true }]}
            >
              <Input.TextArea rows={2} placeholder="Enter English objective" />
            </Form.Item>
            <Form.Item
              name="objective_ar"
              label="Objective (AR)"
              rules={[{ required: true }]}
            >
              <Input.TextArea rows={2} placeholder="Enter Arabic objective" />
            </Form.Item>
            <Form.Item
              name="objective_fr"
              label="Objective (FR)"
              rules={[{ required: true }]}
            >
              <Input.TextArea rows={2} placeholder="Enter French objective" />
            </Form.Item>

            <Form.Item
              name="reach"
              label="Reach"
              rules={[{ required: true, type: "number", min: 0 }]}
            >
              <InputNumber
                placeholder="Enter reach"
                className="w-full"
                min={0}
              />
            </Form.Item>
            <Form.Item
              name="views"
              label="Views"
              rules={[{ required: true, type: "number", min: 0 }]}
            >
              <InputNumber
                placeholder="Enter views"
                className="w-full"
                min={0}
              />
            </Form.Item>
            <Form.Item
              name="engagement_rate"
              label="Engagement Rate (%)"
              rules={[{ required: true, type: "number", min: 0, max: 100 }]}
            >
              <InputNumber
                placeholder="Enter engagement rate"
                className="w-full"
                min={0}
                max={100}
                step={0.01}
              />
            </Form.Item>
          </div>

          <Form.Item label="Upload Logo" required>
            <Upload
              fileList={logoFileList}
              beforeUpload={() => false}
              listType="picture-card"
              maxCount={1}
              accept="image/*"
              onChange={({ fileList }) => setLogoFileList(fileList)}
            >
              {logoFileList.length === 0 && "+ Upload"}
            </Upload>
          </Form.Item>

          <Form.Item label="Upload Images" required>
            <Upload
              fileList={imageFileList}
              beforeUpload={() => false}
              listType="picture-card"
              accept="image/*"
              onChange={({ fileList }) => setImageFileList(fileList)}
            >
              {imageFileList.length < 10 && "+ Upload"}
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Update Influencer Item"
        open={isEditOpen}
        onCancel={() => {
          setIsEditOpen(false);
          editForm.resetFields();
          setEditImageFileList([]);
          setEditLogoFileList([]);
          setEditingId(null);
        }}
        onOk={handleEdit}
        confirmLoading={isLoading}
        okText="Update"
        width={900}
      >
        <Form form={editForm} layout="vertical">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Item name="title_en" label="Title (EN)">
              <Input placeholder="Enter English title" />
            </Form.Item>
            <Form.Item name="title_ar" label="Title (AR)">
              <Input placeholder="Enter Arabic title" />
            </Form.Item>
            <Form.Item name="title_fr" label="Title (FR)">
              <Input placeholder="Enter French title" />
            </Form.Item>

            <Form.Item name="objective_en" label="Objective (EN)">
              <Input.TextArea rows={2} placeholder="Enter English objective" />
            </Form.Item>
            <Form.Item name="objective_ar" label="Objective (AR)">
              <Input.TextArea rows={2} placeholder="Enter Arabic objective" />
            </Form.Item>
            <Form.Item name="objective_fr" label="Objective (FR)">
              <Input.TextArea rows={2} placeholder="Enter French objective" />
            </Form.Item>

            <Form.Item name="reach" label="Reach">
              <InputNumber
                placeholder="Enter reach"
                className="w-full"
                min={0}
              />
            </Form.Item>
            <Form.Item name="views" label="Views">
              <InputNumber
                placeholder="Enter views"
                className="w-full"
                min={0}
              />
            </Form.Item>
            <Form.Item name="engagement_rate" label="Engagement Rate (%)">
              <InputNumber
                placeholder="Enter engagement rate"
                className="w-full"
                min={0}
                max={100}
                step={0.01}
              />
            </Form.Item>
          </div>

          <Form.Item label="Upload New Logo (optional)">
            <Upload
              fileList={editLogoFileList}
              beforeUpload={() => false}
              listType="picture-card"
              maxCount={1}
              accept="image/*"
              onChange={({ fileList }) => setEditLogoFileList(fileList)}
            >
              {editLogoFileList.length === 0 && "+ Upload"}
            </Upload>
          </Form.Item>

          <Form.Item label="Upload New Images (optional)">
            <Upload
              fileList={editImageFileList}
              beforeUpload={() => false}
              listType="picture-card"
              accept="image/*"
              onChange={({ fileList }) => setEditImageFileList(fileList)}
            >
              {editImageFileList.length < 10 && "+ Upload"}
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      {/* Media Preview Modal */}
      <Modal
        title="Media Gallery"
        open={previewModal.open}
        onCancel={() =>
          setPreviewModal({ open: false, images: [], current: 0 })
        }
        footer={null}
        width={900}
        centered
      >
        {previewModal.images.length > 0 && (
          <Image.PreviewGroup>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {previewModal.images.map((img, idx) => (
                <div
                  key={idx}
                  className="aspect-square rounded-lg overflow-hidden border border-gray-200"
                >
                  <Image
                    src={img}
                    alt={`Media ${idx + 1}`}
                    className="w-full h-full object-cover"
                    preview={{
                      mask: "Preview",
                    }}
                  />
                </div>
              ))}
            </div>
          </Image.PreviewGroup>
        )}
      </Modal>
    </div>
  );
};

export default InfluencersItems;
