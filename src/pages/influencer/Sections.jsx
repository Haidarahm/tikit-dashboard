import { useEffect, useState } from "react";
import {
  Select,
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
} from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import { useInfluencersSectionsStore } from "../../store/influencersSectionsStore.js";

export const Sections = () => {
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
    create,
    update,
    remove,
  } = useInfluencersSectionsStore();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addForm] = Form.useForm();
  const [imageFileList, setImageFileList] = useState([]);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm] = Form.useForm();
  const [editImageFileList, setEditImageFileList] = useState([]);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchList();
  }, [page, perPage, lang]);

  const handleAdd = async () => {
    try {
      const values = await addForm.validateFields();
      const payload = {
        title_en: values.title_en,
        title_ar: values.title_ar,
        title_fr: values.title_fr,
        subtitle_en: values.subtitle_en,
        subtitle_ar: values.subtitle_ar,
        subtitle_fr: values.subtitle_fr,
        image: null,
      };

      if (imageFileList[0]?.originFileObj) {
        payload.image = imageFileList[0].originFileObj;
      }

      if (!payload.image) {
        toast.error("Please upload an image.");
        return;
      }

      await create(payload);
      setIsAddOpen(false);
      addForm.resetFields();
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
      const payload = {
        title_en: values.title_en,
        title_ar: values.title_ar,
        title_fr: values.title_fr,
        subtitle_en: values.subtitle_en,
        subtitle_ar: values.subtitle_ar,
        subtitle_fr: values.subtitle_fr,
      };

      if (editImageFileList[0]?.originFileObj) {
        payload.image = editImageFileList[0].originFileObj;
      }

      await update(editingId, payload);
      setIsEditOpen(false);
      editForm.resetFields();
      setEditImageFileList([]);
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

  const openEditModal = (section) => {
    setEditingId(section.id);
    setIsEditOpen(true);
    editForm.setFieldsValue({
      title_en: section.title_en || "",
      title_ar: section.title_ar || "",
      title_fr: section.title_fr || "",
      subtitle_en: section.subtitle_en || "",
      subtitle_ar: section.subtitle_ar || "",
      subtitle_fr: section.subtitle_fr || "",
    });
    setEditImageFileList([]);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Influencer Sections</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Language:</span>
            <Select
              value={lang}
              style={{ width: 140 }}
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
          >
            Add Section
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <Spin size="large" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No sections found</p>
        </div>
      ) : (
        <>
          <Row gutter={[24, 24]}>
            {items.map((section) => (
              <Col xs={24} sm={12} md={8} lg={6} key={section.id}>
                <Card
                  hoverable
                  cover={
                    <div className="h-48 overflow-hidden bg-gray-100">
                      {section.image ? (
                        <img
                          src={section.images}
                          alt={section.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>
                  }
                  actions={[
                    <EditOutlined
                      key="edit"
                      onClick={() => openEditModal(section)}
                    />,
                    <Popconfirm
                      key="delete"
                      title="Delete this section?"
                      okText="Yes"
                      cancelText="No"
                      onConfirm={() => handleDelete(section.id)}
                    >
                      <DeleteOutlined danger />
                    </Popconfirm>,
                  ]}
                >
                  <Card.Meta
                    title={
                      <div className="font-semibold text-base line-clamp-2">
                        {section.title || "No Title"}
                      </div>
                    }
                    description={
                      <div className="text-gray-600 line-clamp-2">
                        {section.subtitle || "No Subtitle"}
                      </div>
                    }
                  />
                </Card>
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

      {/* Add Modal */}
      <Modal
        title="Add Section"
        open={isAddOpen}
        onCancel={() => {
          setIsAddOpen(false);
          addForm.resetFields();
          setImageFileList([]);
        }}
        onOk={handleAdd}
        confirmLoading={isLoading}
        okText="Create"
        width={800}
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
              name="subtitle_en"
              label="Subtitle (EN)"
              rules={[{ required: true }]}
            >
              <Input placeholder="Enter English subtitle" />
            </Form.Item>
            <Form.Item
              name="subtitle_ar"
              label="Subtitle (AR)"
              rules={[{ required: true }]}
            >
              <Input placeholder="Enter Arabic subtitle" />
            </Form.Item>
            <Form.Item
              name="subtitle_fr"
              label="Subtitle (FR)"
              rules={[{ required: true }]}
            >
              <Input placeholder="Enter French subtitle" />
            </Form.Item>
          </div>

          <Form.Item label="Upload Image" required>
            <Upload
              fileList={imageFileList}
              beforeUpload={() => false}
              listType="picture-card"
              maxCount={1}
              accept="image/*"
              onChange={({ fileList }) => setImageFileList(fileList)}
            >
              {imageFileList.length === 0 && "+ Upload"}
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Update Section"
        open={isEditOpen}
        onCancel={() => {
          setIsEditOpen(false);
          editForm.resetFields();
          setEditImageFileList([]);
          setEditingId(null);
        }}
        onOk={handleEdit}
        confirmLoading={isLoading}
        okText="Update"
        width={800}
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

            <Form.Item name="subtitle_en" label="Subtitle (EN)">
              <Input placeholder="Enter English subtitle" />
            </Form.Item>
            <Form.Item name="subtitle_ar" label="Subtitle (AR)">
              <Input placeholder="Enter Arabic subtitle" />
            </Form.Item>
            <Form.Item name="subtitle_fr" label="Subtitle (FR)">
              <Input placeholder="Enter French subtitle" />
            </Form.Item>
          </div>

          <Form.Item label="Upload New Image (optional)">
            <Upload
              fileList={editImageFileList}
              beforeUpload={() => false}
              listType="picture-card"
              maxCount={1}
              accept="image/*"
              onChange={({ fileList }) => setEditImageFileList(fileList)}
            >
              {editImageFileList.length === 0 && "+ Upload"}
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Sections;
