import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  UploadOutlined,
  TranslationOutlined,
} from "@ant-design/icons";
import { FaDatabase } from "react-icons/fa";
import { toast } from "react-toastify";
import { useInfluencersSectionsStore } from "../../store/influencers/influencersSectionsStore.js";
import { useTranslateStore } from "../../store/translateStore.js";

export const Sections = () => {
  const navigate = useNavigate();
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
    import: importExcel,
  } = useInfluencersSectionsStore();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addForm] = Form.useForm();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm] = Form.useForm();
  const [editingId, setEditingId] = useState(null);
  
  // Translation loading states
  const [translatingAddTitle, setTranslatingAddTitle] = useState(false);
  const [translatingAddSubtitle, setTranslatingAddSubtitle] = useState(false);
  const [translatingEditTitle, setTranslatingEditTitle] = useState(false);
  const [translatingEditSubtitle, setTranslatingEditSubtitle] = useState(false);
  
  const translateText = useTranslateStore((state) => state.translateText);

  useEffect(() => {
    fetchList();
  }, [page, perPage, lang]);

  const handleImportExcel = async (file) => {
    try {
      await importExcel(file);
    } catch (error) {
      // Error is already handled in the store
    }
  };

  const handleTranslateAddField = async (fieldBase) => {
    const enValue = addForm.getFieldValue(`${fieldBase}_en`);
    if (!enValue || !String(enValue).trim()) {
      toast.warning(`Please enter ${fieldBase} (EN) text first.`);
      return;
    }

    const setLoading = {
      title: setTranslatingAddTitle,
      subtitle: setTranslatingAddSubtitle,
    }[fieldBase];
    
    if (!setLoading) return;

    setLoading(true);
    try {
      const result = await translateText(String(enValue));
      if (!result) return;

      addForm.setFieldsValue({
        [`${fieldBase}_en`]: result.en || enValue,
        [`${fieldBase}_ar`]: result.ar || "",
        [`${fieldBase}_fr`]: result.fr || "",
      });
    } catch {
      // Error toast already handled in store
    } finally {
      setLoading(false);
    }
  };

  const handleTranslateEditField = async (fieldBase) => {
    const enValue = editForm.getFieldValue(`${fieldBase}_en`);
    if (!enValue || !String(enValue).trim()) {
      toast.warning(`Please enter ${fieldBase} (EN) text first.`);
      return;
    }

    const setLoading = {
      title: setTranslatingEditTitle,
      subtitle: setTranslatingEditSubtitle,
    }[fieldBase];
    
    if (!setLoading) return;

    setLoading(true);
    try {
      const result = await translateText(String(enValue));
      if (!result) return;

      editForm.setFieldsValue({
        [`${fieldBase}_en`]: result.en || enValue,
        [`${fieldBase}_ar`]: result.ar || "",
        [`${fieldBase}_fr`]: result.fr || "",
      });
    } catch {
      // Error toast already handled in store
    } finally {
      setLoading(false);
    }
  };

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
      };

      await create(payload);
      setIsAddOpen(false);
      addForm.resetFields();
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

      // Only include fields that have values
      if (values.title_en && values.title_en.trim()) {
        payload.title_en = values.title_en;
      }
      if (values.title_ar && values.title_ar.trim()) {
        payload.title_ar = values.title_ar;
      }
      if (values.title_fr && values.title_fr.trim()) {
        payload.title_fr = values.title_fr;
      }
      if (values.subtitle_en && values.subtitle_en.trim()) {
        payload.subtitle_en = values.subtitle_en;
      }
      if (values.subtitle_ar && values.subtitle_ar.trim()) {
        payload.subtitle_ar = values.subtitle_ar;
      }
      if (values.subtitle_fr && values.subtitle_fr.trim()) {
        payload.subtitle_fr = values.subtitle_fr;
      }

      await update(editingId, payload);
      setIsEditOpen(false);
      editForm.resetFields();
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
  };

  const handleViewData = (sectionId) => {
    navigate(`/influencer/data/${sectionId}`);
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
          <Upload
            accept=".xlsx,.xls"
            beforeUpload={(file) => {
              const isExcel =
                file.type ===
                  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
                file.type === "application/vnd.ms-excel" ||
                file.name.endsWith(".xlsx") ||
                file.name.endsWith(".xls");
              if (!isExcel) {
                toast.error("Please upload an Excel file (.xlsx or .xls)");
                return false;
              }
              return false; // Prevent auto upload
            }}
            onChange={(info) => {
              if (info.fileList.length > 0) {
                const file = info.fileList[0].originFileObj;
                handleImportExcel(file);
              }
            }}
            maxCount={1}
            showUploadList={false}
          >
            <Button icon={<UploadOutlined />}>Import Excel</Button>
          </Upload>
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
                 
                  actions={[
                    <Button
                      key="data"
                      type="text"
                      icon={<FaDatabase />}
                      onClick={() => handleViewData(section.id)}
                      className="flex items-center justify-center"
                    />,
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
              label={
                <span className="flex items-center gap-2">
                  <span>Title (EN)</span>
                  <Button
                    type="link"
                    size="small"
                    icon={<TranslationOutlined />}
                    onClick={() => handleTranslateAddField("title")}
                    loading={translatingAddTitle}
                    style={{ padding: 0, fontSize: "12px", height: "auto" }}
                  />
                </span>
              }
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
              label={
                <span className="flex items-center gap-2">
                  <span>Subtitle (EN)</span>
                  <Button
                    type="link"
                    size="small"
                    icon={<TranslationOutlined />}
                    onClick={() => handleTranslateAddField("subtitle")}
                    loading={translatingAddSubtitle}
                    style={{ padding: 0, fontSize: "12px", height: "auto" }}
                  />
                </span>
              }
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
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Update Section"
        open={isEditOpen}
        onCancel={() => {
          setIsEditOpen(false);
          editForm.resetFields();
          setEditingId(null);
        }}
        onOk={handleEdit}
        confirmLoading={isLoading}
        okText="Update"
        width={800}
      >
        <Form form={editForm} layout="vertical">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Item
              name="title_en"
              label={
                <span className="flex items-center gap-2">
                  <span>Title (EN)</span>
                  <Button
                    type="link"
                    size="small"
                    icon={<TranslationOutlined />}
                    onClick={() => handleTranslateEditField("title")}
                    loading={translatingEditTitle}
                    style={{ padding: 0, fontSize: "12px", height: "auto" }}
                  />
                </span>
              }
            >
              <Input placeholder="Enter English title" />
            </Form.Item>
            <Form.Item name="title_ar" label="Title (AR)">
              <Input placeholder="Enter Arabic title" />
            </Form.Item>
            <Form.Item name="title_fr" label="Title (FR)">
              <Input placeholder="Enter French title" />
            </Form.Item>

            <Form.Item
              name="subtitle_en"
              label={
                <span className="flex items-center gap-2">
                  <span>Subtitle (EN)</span>
                  <Button
                    type="link"
                    size="small"
                    icon={<TranslationOutlined />}
                    onClick={() => handleTranslateEditField("subtitle")}
                    loading={translatingEditSubtitle}
                    style={{ padding: 0, fontSize: "12px", height: "auto" }}
                  />
                </span>
              }
            >
              <Input placeholder="Enter English subtitle" />
            </Form.Item>
            <Form.Item name="subtitle_ar" label="Subtitle (AR)">
              <Input placeholder="Enter Arabic subtitle" />
            </Form.Item>
            <Form.Item name="subtitle_fr" label="Subtitle (FR)">
              <Input placeholder="Enter French subtitle" />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Sections;
