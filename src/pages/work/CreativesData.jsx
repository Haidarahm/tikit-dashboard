import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Button,
  Modal,
  Form,
  Input,
  Upload,
  Popconfirm,
  Card,
  Row,
  Col,
  Pagination,
  Spin,
  Image,
  Tooltip,
  Select,
  Empty,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  EyeOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import { useCreativeItemsStore } from "../../store/works/creativeItemsStore.js";

const CreativesData = () => {
  const { id } = useParams();
  const {
    items,
    total,
    page,
    perPage,
    lang,
    isLoading,
    fetchList,
    setPage,
    setPerPage,
    setLang,
    setWorkId,
    create,
    update,
    remove,
  } = useCreativeItemsStore();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addForm] = Form.useForm();
  const [logoFileList, setLogoFileList] = useState([]);
  const [mainImageFileList, setMainImageFileList] = useState([]);
  const [brandImage1FileList, setBrandImage1FileList] = useState([]);
  const [brandImage2FileList, setBrandImage2FileList] = useState([]);
  const [brandImage3FileList, setBrandImage3FileList] = useState([]);
  const [imageFileList, setImageFileList] = useState([]);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm] = Form.useForm();
  const [editLogoFileList, setEditLogoFileList] = useState([]);
  const [editMainImageFileList, setEditMainImageFileList] = useState([]);
  const [editBrandImage1FileList, setEditBrandImage1FileList] = useState([]);
  const [editBrandImage2FileList, setEditBrandImage2FileList] = useState([]);
  const [editBrandImage3FileList, setEditBrandImage3FileList] = useState([]);
  const [editImageFileList, setEditImageFileList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [previewModal, setPreviewModal] = useState({
    open: false,
    data: null,
  });

  useEffect(() => {
    if (id) {
      setWorkId(id);
      fetchList(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, page, perPage, lang]);

  const handleAdd = async () => {
    try {
      const values = await addForm.validateFields();
      const payload = {
        work_id: id,
        title_en: values.title_en,
        title_ar: values.title_ar,
        title_fr: values.title_fr,
        images: imageFileList
          .map((file) => file.originFileObj)
          .filter((file) => file),
      };

      if (logoFileList[0]?.originFileObj) {
        payload.logo = logoFileList[0].originFileObj;
      }
      if (mainImageFileList[0]?.originFileObj) {
        payload.main_image = mainImageFileList[0].originFileObj;
      }
      if (brandImage1FileList[0]?.originFileObj) {
        payload.brand_image_1 = brandImage1FileList[0].originFileObj;
      }
      if (brandImage2FileList[0]?.originFileObj) {
        payload.brand_image_2 = brandImage2FileList[0].originFileObj;
      }
      if (brandImage3FileList[0]?.originFileObj) {
        payload.brand_image_3 = brandImage3FileList[0].originFileObj;
      }

      if (!payload.logo) {
        toast.error("Please upload a logo.");
        return;
      }

      await create(payload);
      setIsAddOpen(false);
      addForm.resetFields();
      setLogoFileList([]);
      setMainImageFileList([]);
      setBrandImage1FileList([]);
      setBrandImage2FileList([]);
      setBrandImage3FileList([]);
      setImageFileList([]);
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

      if (values.title_en && values.title_en.trim()) {
        payload.title_en = values.title_en;
      }
      if (values.title_ar && values.title_ar.trim()) {
        payload.title_ar = values.title_ar;
      }
      if (values.title_fr && values.title_fr.trim()) {
        payload.title_fr = values.title_fr;
      }
      if (editLogoFileList[0]?.originFileObj) {
        payload.logo = editLogoFileList[0].originFileObj;
      }
      if (editMainImageFileList[0]?.originFileObj) {
        payload.main_image = editMainImageFileList[0].originFileObj;
      }
      if (editBrandImage1FileList[0]?.originFileObj) {
        payload.brand_image_1 = editBrandImage1FileList[0].originFileObj;
      }
      if (editBrandImage2FileList[0]?.originFileObj) {
        payload.brand_image_2 = editBrandImage2FileList[0].originFileObj;
      }
      if (editBrandImage3FileList[0]?.originFileObj) {
        payload.brand_image_3 = editBrandImage3FileList[0].originFileObj;
      }
      if (editImageFileList.length > 0) {
        payload.images = editImageFileList
          .map((file) => file.originFileObj)
          .filter((file) => file);
      }

      await update(editingId, payload);
      setIsEditOpen(false);
      setEditingId(null);
      editForm.resetFields();
      setEditLogoFileList([]);
      setEditMainImageFileList([]);
      setEditBrandImage1FileList([]);
      setEditBrandImage2FileList([]);
      setEditBrandImage3FileList([]);
      setEditImageFileList([]);
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
      if (err?.response?.data?.message) {
        toast.error(err.response.data.message);
      }
    }
  };

  const openEditModal = (item) => {
    const creative = item.creative || {};
    setEditingId(creative.id);
    editForm.setFieldsValue({
      title_en: creative.title_en || "",
      title_ar: creative.title_ar || "",
      title_fr: creative.title_fr || "",
    });
    setIsEditOpen(true);
  };

  const openPreviewModal = (item) => {
    if (item?.creative) {
      setPreviewModal({
        open: true,
        data: item.creative,
      });
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Creative Items
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage creative items for the selected work.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-3 bg-white rounded-md px-3 py-2 shadow-sm">
            <span className="text-sm text-gray-600">Language</span>
            <Select
              value={lang}
              style={{ width: 160 }}
              options={[
                { label: "English", value: "en" },
                { label: "Arabic", value: "ar" },
                { label: "French", value: "fr" },
              ]}
              onChange={(value) => {
                setLang(value);
                setPage(1);
              }}
            />
          </div>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsAddOpen(true)}
            className="ml-2"
          >
            Add Item
          </Button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[280px]">
          <Spin size="large" />
        </div>
      ) : !items || items.length === 0 ? (
        <div className="py-12">
          <Empty
            description={
              <span className="text-gray-500">No creative items found</span>
            }
          >
            <Button type="primary" onClick={() => setIsAddOpen(true)}>
              <PlusOutlined /> Create first item
            </Button>
          </Empty>
        </div>
      ) : (
        <>
          <Row gutter={[20, 20]}>
            {items.map((item) => {
              const creative = item.creative || {};
              return (
                <Col
                  key={creative.id}
                  xs={24}
                  sm={12}
                  md={8}
                  lg={6}
                  style={{ display: "flex" }}
                >
                  <Card
                    hoverable
                    className="w-full flex flex-col rounded-2xl overflow-hidden shadow-sm"
                    bodyStyle={{
                      padding: 0,
                      display: "flex",
                      flexDirection: "column",
                      flex: 1,
                    }}
                    cover={
                      <div className="relative">
                        {/* Main Image */}
                        {creative.main_image ? (
                          <div className="h-56 overflow-hidden bg-gray-100">
                            <Image
                              src={creative.main_image}
                              alt="Main Image"
                              className="w-full h-full object-cover"
                              preview={false}
                            />
                          </div>
                        ) : (
                          <div className="h-56 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <div className="text-center text-gray-400">
                              <div className="text-4xl mb-2">🖼️</div>
                              <div className="text-sm">No Main Image</div>
                            </div>
                          </div>
                        )}
                      </div>
                    }
                    actions={[
                      <Tooltip title="View All Media" key="view">
                        <Button
                          type="text"
                          icon={<EyeOutlined />}
                          onClick={() => openPreviewModal(item)}
                        />
                      </Tooltip>,
                      <Tooltip title="Edit" key="edit">
                        <Button
                          type="text"
                          icon={<EditOutlined />}
                          onClick={() => openEditModal(item)}
                        />
                      </Tooltip>,
                      <Popconfirm
                        key="delete"
                        title="Delete this item?"
                        okText="Yes"
                        cancelText="No"
                        onConfirm={() => handleDelete(creative.id)}
                      >
                        <Tooltip title="Delete">
                          <Button
                            type="text"
                            icon={<DeleteOutlined />}
                            danger
                          />
                        </Tooltip>
                      </Popconfirm>,
                    ]}
                  >
                    <div className="p-4 flex flex-col gap-3">
                      {/* Title */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base text-gray-900 line-clamp-2 break-words mb-1">
                          {creative.title || "No Title"}
                        </h3>
                      </div>
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>

          {/* Pagination */}
          {total > 0 && (
            <div className="flex justify-center mt-8">
              <Pagination
                current={page}
                total={total}
                pageSize={perPage}
                showSizeChanger
                showTotal={(total, range) =>
                  `${range[0]}-${range[1]} of ${total} items`
                }
                onChange={(newPage, newPerPage) => {
                  setPage(newPage);
                  if (newPerPage !== perPage) {
                    setPerPage(newPerPage);
                    setPage(1);
                  }
                }}
                pageSizeOptions={["5", "10", "20", "50"]}
              />
            </div>
          )}
        </>
      )}

      {/* Add Modal */}
      <Modal
        title="Add Creative Item"
        open={isAddOpen}
        onOk={handleAdd}
        onCancel={() => {
          setIsAddOpen(false);
          addForm.resetFields();
          setLogoFileList([]);
          setMainImageFileList([]);
          setBrandImage1FileList([]);
          setBrandImage2FileList([]);
          setBrandImage3FileList([]);
          setImageFileList([]);
        }}
        confirmLoading={isLoading}
        okText="Create"
        width={820}
        centered
        destroyOnClose
      >
        <Form
          form={addForm}
          layout="vertical"
          className="max-h-[70vh] overflow-y-auto pr-2"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Item
              name="title_en"
              label="Title (EN)"
              rules={[{ required: true, message: "English title is required" }]}
            >
              <Input placeholder="Enter English title" />
            </Form.Item>

            <Form.Item
              name="title_ar"
              label="Title (AR)"
              rules={[{ required: true, message: "Arabic title is required" }]}
            >
              <Input placeholder="Enter Arabic title" />
            </Form.Item>

            <Form.Item
              name="title_fr"
              label="Title (FR)"
              rules={[{ required: true, message: "French title is required" }]}
            >
              <Input placeholder="Enter French title" />
            </Form.Item>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Item label="Upload Logo" required className="mb-0">
              <Upload
                fileList={logoFileList}
                beforeUpload={() => false}
                listType="picture-card"
                maxCount={1}
                accept="image/*"
                onChange={({ fileList }) => setLogoFileList(fileList)}
              >
                {logoFileList.length === 0 && (
                  <div>
                    <UploadOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                )}
              </Upload>
            </Form.Item>

            <Form.Item label="Upload Main Image" className="mb-0">
              <Upload
                fileList={mainImageFileList}
                beforeUpload={() => false}
                listType="picture-card"
                maxCount={1}
                accept="image/*"
                onChange={({ fileList }) => setMainImageFileList(fileList)}
              >
                {mainImageFileList.length === 0 && (
                  <div>
                    <UploadOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                )}
              </Upload>
            </Form.Item>

            <Form.Item label="Upload Gallery Images" className="mb-0">
              <Upload
                fileList={imageFileList}
                beforeUpload={() => false}
                listType="picture"
                accept="image/*"
                multiple
                onChange={({ fileList }) => setImageFileList(fileList)}
              >
                <Button icon={<UploadOutlined />}>
                  {imageFileList.length ? "Add more" : "Upload gallery"}
                </Button>
              </Upload>
            </Form.Item>
          </div>

          <div className="mt-4">
            <Form.Item label="Upload Brand Images">
              <div className="flex gap-3">
                <Upload
                  fileList={brandImage1FileList}
                  beforeUpload={() => false}
                  listType="picture-card"
                  maxCount={1}
                  accept="image/*"
                  onChange={({ fileList }) => setBrandImage1FileList(fileList)}
                >
                  {brandImage1FileList.length === 0 && "Brand 1"}
                </Upload>

                <Upload
                  fileList={brandImage2FileList}
                  beforeUpload={() => false}
                  listType="picture-card"
                  maxCount={1}
                  accept="image/*"
                  onChange={({ fileList }) => setBrandImage2FileList(fileList)}
                >
                  {brandImage2FileList.length === 0 && "Brand 2"}
                </Upload>

                <Upload
                  fileList={brandImage3FileList}
                  beforeUpload={() => false}
                  listType="picture-card"
                  maxCount={1}
                  accept="image/*"
                  onChange={({ fileList }) => setBrandImage3FileList(fileList)}
                >
                  {brandImage3FileList.length === 0 && "Brand 3"}
                </Upload>
              </div>
            </Form.Item>
          </div>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Edit Creative Item"
        open={isEditOpen}
        onOk={handleEdit}
        onCancel={() => {
          setIsEditOpen(false);
          setEditingId(null);
          editForm.resetFields();
          setEditLogoFileList([]);
          setEditMainImageFileList([]);
          setEditBrandImage1FileList([]);
          setEditBrandImage2FileList([]);
          setEditBrandImage3FileList([]);
          setEditImageFileList([]);
        }}
        confirmLoading={isLoading}
        okText="Update"
        width={820}
        centered
        destroyOnClose
      >
        <Form
          form={editForm}
          layout="vertical"
          className="max-h-[70vh] overflow-y-auto pr-2"
        >
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
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Item label="Upload New Logo (optional)" className="mb-0">
              <Upload
                fileList={editLogoFileList}
                beforeUpload={() => false}
                listType="picture-card"
                maxCount={1}
                accept="image/*"
                onChange={({ fileList }) => setEditLogoFileList(fileList)}
              >
                {editLogoFileList.length === 0 && (
                  <div>
                    <UploadOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                )}
              </Upload>
            </Form.Item>

            <Form.Item
              label="Upload New Main Image (optional)"
              className="mb-0"
            >
              <Upload
                fileList={editMainImageFileList}
                beforeUpload={() => false}
                listType="picture-card"
                maxCount={1}
                accept="image/*"
                onChange={({ fileList }) => setEditMainImageFileList(fileList)}
              >
                {editMainImageFileList.length === 0 && (
                  <div>
                    <UploadOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                )}
              </Upload>
            </Form.Item>

            <Form.Item
              label="Upload New Gallery Images (optional)"
              className="mb-0"
            >
              <Upload
                fileList={editImageFileList}
                beforeUpload={() => false}
                listType="picture"
                accept="image/*"
                multiple
                onChange={({ fileList }) => setEditImageFileList(fileList)}
              >
                <Button icon={<UploadOutlined />}>
                  {editImageFileList.length ? "Add more" : "Upload gallery"}
                </Button>
              </Upload>
            </Form.Item>
          </div>

          <div className="mt-4">
            <Form.Item label="Upload New Brand Images (optional)">
              <div className="flex gap-3">
                <Upload
                  fileList={editBrandImage1FileList}
                  beforeUpload={() => false}
                  listType="picture-card"
                  maxCount={1}
                  accept="image/*"
                  onChange={({ fileList }) =>
                    setEditBrandImage1FileList(fileList)
                  }
                >
                  {editBrandImage1FileList.length === 0 && "Brand 1"}
                </Upload>

                <Upload
                  fileList={editBrandImage2FileList}
                  beforeUpload={() => false}
                  listType="picture-card"
                  maxCount={1}
                  accept="image/*"
                  onChange={({ fileList }) =>
                    setEditBrandImage2FileList(fileList)
                  }
                >
                  {editBrandImage2FileList.length === 0 && "Brand 2"}
                </Upload>

                <Upload
                  fileList={editBrandImage3FileList}
                  beforeUpload={() => false}
                  listType="picture-card"
                  maxCount={1}
                  accept="image/*"
                  onChange={({ fileList }) =>
                    setEditBrandImage3FileList(fileList)
                  }
                >
                  {editBrandImage3FileList.length === 0 && "Brand 3"}
                </Upload>
              </div>
            </Form.Item>
          </div>
        </Form>
      </Modal>

      {/* Media Preview Modal */}
      <Modal
        title="Media Gallery"
        open={previewModal.open}
        onCancel={() => setPreviewModal({ open: false, data: null })}
        footer={null}
        width={1000}
        centered
        destroyOnClose
      >
        {previewModal.data ? (
          <div className="space-y-6">
            {/* Title */}
            <div className="text-center pb-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                {previewModal.data.title || "No Title"}
              </h3>
            </div>

            {/* Logo Section */}
            {previewModal.data.logo && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-700">Logo</h4>
                <div className="flex justify-center">
                  <div className="w-32 h-32 bg-gray-50 rounded-lg overflow-hidden border border-gray-200 p-3">
                    <Image
                      src={previewModal.data.logo}
                      alt="Logo"
                      className="w-full h-full object-contain"
                      preview={{
                        mask: "Preview",
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Main Image Section */}
            {previewModal.data.main_image && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-700">
                  Main Image
                </h4>
                <div className="w-full">
                  <Image
                    src={previewModal.data.main_image}
                    alt="Main Image"
                    className="w-full max-h-96 object-contain rounded-lg border border-gray-200"
                    preview={{
                      mask: "Preview",
                    }}
                  />
                </div>
              </div>
            )}

            {/* Brand Images Section */}
            {previewModal.data.brand_images &&
              previewModal.data.brand_images.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-700">
                    Brand Images ({previewModal.data.brand_images.length})
                  </h4>
                  <Image.PreviewGroup>
                    <div className="flex flex-wrap gap-3">
                      {previewModal.data.brand_images.map((img, idx) => (
                        <div
                          key={idx}
                          className="w-32 h-32 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0"
                        >
                          <Image
                            src={img}
                            alt={`Brand ${idx + 1}`}
                            className="w-full h-full object-cover"
                            preview={{
                              mask: "Preview",
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </Image.PreviewGroup>
                </div>
              )}

            {/* Gallery Images Section */}
            {previewModal.data.images &&
              previewModal.data.images.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-700">
                    Gallery Images ({previewModal.data.images.length})
                  </h4>
                  <Image.PreviewGroup>
                    <div className="flex flex-wrap gap-3">
                      {previewModal.data.images.map((img, idx) => (
                        <div
                          key={idx}
                          className="w-32 h-32 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0"
                        >
                          <Image
                            src={img}
                            alt={`Gallery ${idx + 1}`}
                            className="w-full h-full object-cover"
                            preview={{
                              mask: "Preview",
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </Image.PreviewGroup>
                </div>
              )}

            {!previewModal.data.logo &&
              !previewModal.data.main_image &&
              (!previewModal.data.brand_images ||
                previewModal.data.brand_images.length === 0) &&
              (!previewModal.data.images ||
                previewModal.data.images.length === 0) && (
                <div className="py-8">
                  <Empty description={<span>No media to preview</span>} />
                </div>
              )}
          </div>
        ) : (
          <div className="py-8">
            <Empty description={<span>No media to preview</span>} />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CreativesData;
