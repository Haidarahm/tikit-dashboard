import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Form,
  Image,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Upload,
} from "antd";
import {
  ReloadOutlined,
  UploadOutlined,
  PlusOutlined,
  DatabaseOutlined,
  EditOutlined,
  DeleteOutlined,
  TranslationOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import { useNewsStore } from "../store/newsStore.js";
import { useTranslateStore } from "../store/translateStore.js";

const LANG_OPTIONS = [
  { label: "English", value: "en" },
  { label: "Arabic", value: "ar" },
  { label: "French", value: "fr" },
];

function News() {
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
    importFromExcel,
    detailsItems,
    fetchNewsDetails,
    createNewsDetails,
    updateNewsDetails,
    removeNewsDetails,
    importNewsDetailsExcel,
  } = useNewsStore();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [createImage, setCreateImage] = useState([]);
  const [editImage, setEditImage] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedNewsId, setSelectedNewsId] = useState(null);
  const [selectedNewsSlug, setSelectedNewsSlug] = useState(null);
  const [isDetailsCreateOpen, setIsDetailsCreateOpen] = useState(false);
  const [isDetailsEditOpen, setIsDetailsEditOpen] = useState(false);
  const [editingDetailsId, setEditingDetailsId] = useState(null);
  const [detailsCreateForm] = Form.useForm();
  const [detailsEditForm] = Form.useForm();
  const [detailsCreateImages, setDetailsCreateImages] = useState([]);
  const [detailsEditImages, setDetailsEditImages] = useState([]);
  const [isDetailsImporting, setIsDetailsImporting] = useState(false);
  const [expandedDetailsDescriptions, setExpandedDetailsDescriptions] = useState({});
  
  // Separate loading states for each translation button
  const [translatingTitle, setTranslatingTitle] = useState(false);
  const [translatingSubtitle, setTranslatingSubtitle] = useState(false);
  const [translatingDescription, setTranslatingDescription] = useState(false);
  const [translatingEditTitle, setTranslatingEditTitle] = useState(false);
  const [translatingEditSubtitle, setTranslatingEditSubtitle] = useState(false);
  const [translatingEditDescription, setTranslatingEditDescription] = useState(false);
  const [translatingDetailsTitle, setTranslatingDetailsTitle] = useState(false);
  const [translatingDetailsSubtitle, setTranslatingDetailsSubtitle] = useState(false);
  const [translatingDetailsDescription, setTranslatingDetailsDescription] = useState(false);
  const [translatingDetailsEditTitle, setTranslatingDetailsEditTitle] = useState(false);
  const [translatingDetailsEditSubtitle, setTranslatingDetailsEditSubtitle] = useState(false);
  const [translatingDetailsEditDescription, setTranslatingDetailsEditDescription] = useState(false);
  
  const translateText = useTranslateStore((state) => state.translateText);

  useEffect(() => {
    fetchList();
  }, [page, perPage, lang]);

  const resetCreateModal = () => {
    createForm.resetFields();
    setCreateImage([]);
  };

  const resetEditModal = () => {
    editForm.resetFields();
    setEditImage([]);
    setEditingId(null);
  };

  const handleCreate = async () => {
    try {
      const values = await createForm.validateFields();
      const payload = {
        ...values,
      };
      if (createImage[0]?.originFileObj) {
        payload.image = createImage[0].originFileObj;
      }
      await create(payload);
      setIsCreateOpen(false);
      resetCreateModal();
    } catch (error) {
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error?.message) {
        toast.error(error.message);
      }
    }
  };

  const handleEditOpen = (record) => {
    setEditingId(record.id);
    editForm.setFieldsValue({
      title_en: record.title_en || record.title || "",
      title_ar: record.title_ar || record.title || "",
      title_fr: record.title_fr || record.title || "",
      subtitle_en: record.subtitle_en || record.subtitle || "",
      subtitle_ar: record.subtitle_ar || record.subtitle || "",
      subtitle_fr: record.subtitle_fr || record.subtitle || "",
      description_en: record.description_en || record.description || "",
      description_ar: record.description_ar || record.description || "",
      description_fr: record.description_fr || record.description || "",
    });
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    try {
      const values = await editForm.validateFields();
      const payload = Object.entries(values).reduce((acc, [key, value]) => {
        if (value != null && value !== "") {
          acc[key] = value;
        }
        return acc;
      }, {});
      if (editImage[0]?.originFileObj) {
        payload.image = editImage[0].originFileObj;
      }
      await update(editingId, payload);
      setIsEditOpen(false);
      resetEditModal();
    } catch (error) {
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error?.message) {
        toast.error(error.message);
      }
    }
  };

  const handleImportExcel = async (file) => {
    setIsImporting(true);
    try {
      await importFromExcel(file);
    } catch (error) {
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error?.message) {
        toast.error(error.message);
      }
    } finally {
      setIsImporting(false);
    }
    return false;
  };

  const handleTranslateField = async (fieldBase) => {
    const enValue = createForm.getFieldValue(`${fieldBase}_en`);
    if (!enValue || !String(enValue).trim()) {
      toast.warning(`Please enter ${fieldBase} (EN) text first.`);
      return;
    }

    // Set loading state for specific field
    const setLoading = {
      title: setTranslatingTitle,
      subtitle: setTranslatingSubtitle,
      description: setTranslatingDescription,
    }[fieldBase];
    
    if (!setLoading) return;

    setLoading(true);
    try {
      const result = await translateText(String(enValue));
      if (!result) return;

      createForm.setFieldsValue({
        [`${fieldBase}_en`]: result.en || enValue,
        [`${fieldBase}_ar`]: result.ar || "",
        [`${fieldBase}_fr`]: result.fr || "",
      });
      toast.success(
        `Translated ${fieldBase} to Arabic and French successfully.`
      );
    } catch {
      // Error toast already handled in store
    } finally {
      setLoading(false);
    }
  };

  const handleTranslateDetailsField = async (fieldBase) => {
    const enValue = detailsCreateForm.getFieldValue(`${fieldBase}_en`);
    if (!enValue || !String(enValue).trim()) {
      toast.warning(`Please enter ${fieldBase} (EN) text first.`);
      return;
    }

    // Set loading state for specific field
    const setLoading = {
      title: setTranslatingDetailsTitle,
      subtitle: setTranslatingDetailsSubtitle,
      description: setTranslatingDetailsDescription,
    }[fieldBase];
    
    if (!setLoading) return;

    setLoading(true);
    try {
      const result = await translateText(String(enValue));
      if (!result) return;

      detailsCreateForm.setFieldsValue({
        [`${fieldBase}_en`]: result.en || enValue,
        [`${fieldBase}_ar`]: result.ar || "",
        [`${fieldBase}_fr`]: result.fr || "",
      });
      toast.success(
        `Translated ${fieldBase} to Arabic and French successfully.`
      );
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

    // Set loading state for specific field
    const setLoading = {
      title: setTranslatingEditTitle,
      subtitle: setTranslatingEditSubtitle,
      description: setTranslatingEditDescription,
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
      toast.success(
        `Translated ${fieldBase} to Arabic and French successfully.`
      );
    } catch {
      // Error toast already handled in store
    } finally {
      setLoading(false);
    }
  };

  const handleTranslateDetailsEditField = async (fieldBase) => {
    const enValue = detailsEditForm.getFieldValue(`${fieldBase}_en`);
    if (!enValue || !String(enValue).trim()) {
      toast.warning(`Please enter ${fieldBase} (EN) text first.`);
      return;
    }

    // Set loading state for specific field
    const setLoading = {
      title: setTranslatingDetailsEditTitle,
      subtitle: setTranslatingDetailsEditSubtitle,
      description: setTranslatingDetailsEditDescription,
    }[fieldBase];
    
    if (!setLoading) return;

    setLoading(true);
    try {
      const result = await translateText(String(enValue));
      if (!result) return;

      detailsEditForm.setFieldsValue({
        [`${fieldBase}_en`]: result.en || enValue,
        [`${fieldBase}_ar`]: result.ar || "",
        [`${fieldBase}_fr`]: result.fr || "",
      });
      toast.success(
        `Translated ${fieldBase} to Arabic and French successfully.`
      );
    } catch {
      // Error toast already handled in store
    } finally {
      setLoading(false);
    }
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
        title: "Title",
        dataIndex: "title",
        key: "title",
        ellipsis: true,
      },
      {
        title: "Subtitle",
        dataIndex: "subtitle",
        key: "subtitle",
        ellipsis: true,
      },
      {
        title: "Description",
        dataIndex: "description",
        key: "description",
        ellipsis: true,
        render: (text) => text || "-",
      },
      {
        title: "Image",
        dataIndex: "image",
        key: "image",
        width: 120,
        render: (value) =>
          value ? (
            <Image
              src={value}
              width={64}
              height={64}
              style={{ objectFit: "cover" }}
              preview={{ mask: "Preview" }}
            />
          ) : (
            "-"
          ),
      },
      {
        title: "Actions",
        key: "actions",
        width: 180,
        render: (record) => (
          <Space>
            <Button
              icon={<EditOutlined />}
              onClick={() => handleEditOpen(record)}
            />
            <Button
              icon={<DatabaseOutlined />}
              onClick={() => {
                setSelectedNewsId(record.id);
                setSelectedNewsSlug(record.slug);
                setIsDetailsModalOpen(true);
                fetchNewsDetails(record.slug, { lang });
              }}
            />
            <Popconfirm
              title="Delete this blog card?"
              okText="Yes"
              cancelText="No"
              onConfirm={async () => {
                try {
                  await remove(record.id);
                  toast.success("Blog card deleted successfully");
                } catch (error) {
                  if (error?.response?.data?.message) {
                    toast.error(error.response.data.message);
                  } else if (error?.message) {
                    toast.error(error.message);
                  }
                }
              }}
            >
              <Button danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [remove, handleEditOpen]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Blogs</h2>
          <p className="text-gray-600">
            Manage blog cards including localized titles, subtitles, and images.
          </p>
        </div>
        <Space wrap>
          <Select
            value={lang}
            style={{ width: 160 }}
            options={LANG_OPTIONS}
            onChange={(value) => {
              setLang(value);
              setPage(1);
            }}
          />
          <Button icon={<ReloadOutlined />} onClick={() => fetchList()}>
            Refresh
          </Button>
          <Upload
            accept=".xlsx,.xls"
            showUploadList={false}
            beforeUpload={handleImportExcel}
          >
            <Button
              icon={<UploadOutlined />}
              loading={isImporting}
              disabled={isImporting}
            >
              Import Excel
            </Button>
          </Upload>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              resetCreateModal();
              setIsCreateOpen(true);
            }}
          >
            Add Blog
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
          onChange: (nextPage, nextSize) => {
            if (nextSize !== perPage) setPerPage(nextSize);
            if (nextPage !== page) setPage(nextPage);
          },
        }}
      />

      <Modal
        title="Add Blog"
        open={isCreateOpen}
        onCancel={() => {
          setIsCreateOpen(false);
          resetCreateModal();
        }}
        onOk={handleCreate}
        okText="Create"
        confirmLoading={isLoading}
      >
        <Form form={createForm} layout="vertical">
          <div className="space-y-6">
            {/* Title Section */}
            <div>
              <h4 className="text-sm font-semibold mb-3 text-gray-700">Title</h4>
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
                        onClick={() => handleTranslateField("title")}
                        loading={translatingTitle}
                        style={{ padding: 0, fontSize: "12px", height: "auto" }}
                      />
                    </span>
                  }
                  rules={[{ required: true, message: "Title is required" }]}
                >
                  <Input placeholder="Enter English title" />
                </Form.Item>
                <Form.Item
                  name="title_ar"
                  label="Title (AR)"
                  rules={[{ required: true, message: "Title is required" }]}
                >
                  <Input placeholder="Enter Arabic title" />
                </Form.Item>
                <Form.Item
                  name="title_fr"
                  label="Title (FR)"
                  rules={[{ required: true, message: "Title is required" }]}
                >
                  <Input placeholder="Enter French title" />
                </Form.Item>
              </div>
            </div>

            {/* Subtitle Section */}
            <div>
              <h4 className="text-sm font-semibold mb-3 text-gray-700">Subtitle</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Form.Item
                  name="subtitle_en"
                  label={
                    <span className="flex items-center gap-2">
                      <span>Subtitle (EN)</span>
                      <Button
                        type="link"
                        size="small"
                        icon={<TranslationOutlined />}
                        onClick={() => handleTranslateField("subtitle")}
                        loading={translatingSubtitle}
                        style={{ padding: 0, fontSize: "12px", height: "auto" }}
                      />
                    </span>
                  }
                  rules={[{ required: true, message: "Subtitle is required" }]}
                >
                  <Input placeholder="Enter English subtitle" />
                </Form.Item>
                <Form.Item
                  name="subtitle_ar"
                  label="Subtitle (AR)"
                  rules={[{ required: true, message: "Subtitle is required" }]}
                >
                  <Input placeholder="Enter Arabic subtitle" />
                </Form.Item>
                <Form.Item
                  name="subtitle_fr"
                  label="Subtitle (FR)"
                  rules={[{ required: true, message: "Subtitle is required" }]}
                >
                  <Input placeholder="Enter French subtitle" />
                </Form.Item>
              </div>
            </div>

            {/* Description Section */}
            <div>
              <h4 className="text-sm font-semibold mb-3 text-gray-700">Description</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Form.Item
                  name="description_en"
                  label={
                    <span className="flex items-center gap-2">
                      <span>Description (EN)</span>
                      <Button
                        type="link"
                        size="small"
                        icon={<TranslationOutlined />}
                        onClick={() => handleTranslateField("description")}
                        loading={translatingDescription}
                        style={{ padding: 0, fontSize: "12px", height: "auto" }}
                      />
                    </span>
                  }
                  rules={[{ required: true, message: "Description is required" }]}
                >
                  <Input.TextArea
                    rows={3}
                    placeholder="Enter English description"
                  />
                </Form.Item>
                <Form.Item
                  name="description_ar"
                  label="Description (AR)"
                  rules={[{ required: true, message: "Description is required" }]}
                >
                  <Input.TextArea rows={3} placeholder="Enter Arabic description" />
                </Form.Item>
                <Form.Item
                  name="description_fr"
                  label="Description (FR)"
                  rules={[{ required: true, message: "Description is required" }]}
                >
                  <Input.TextArea rows={3} placeholder="Enter French description" />
                </Form.Item>
              </div>
            </div>
          </div>
          <Form.Item label="Image" required>
            <Upload
              listType="picture-card"
              fileList={createImage}
              beforeUpload={() => false}
              maxCount={1}
              accept="image/*"
              onChange={({ fileList }) => setCreateImage(fileList)}
            >
              {createImage.length === 0 && (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Update Blog"
        open={isEditOpen}
        onCancel={() => {
          setIsEditOpen(false);
          resetEditModal();
        }}
        onOk={handleUpdate}
        okText="Update"
        confirmLoading={isLoading}
      >
        <Form form={editForm} layout="vertical">
          <div className="space-y-6">
            {/* Title Section */}
            <div>
              <h4 className="text-sm font-semibold mb-3 text-gray-700">Title</h4>
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
              </div>
            </div>

            {/* Subtitle Section */}
            <div>
              <h4 className="text-sm font-semibold mb-3 text-gray-700">Subtitle</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            </div>

            {/* Description Section */}
            <div>
              <h4 className="text-sm font-semibold mb-3 text-gray-700">Description</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Form.Item
                  name="description_en"
                  label={
                    <span className="flex items-center gap-2">
                      <span>Description (EN)</span>
                      <Button
                        type="link"
                        size="small"
                        icon={<TranslationOutlined />}
                        onClick={() => handleTranslateEditField("description")}
                        loading={translatingEditDescription}
                        style={{ padding: 0, fontSize: "12px", height: "auto" }}
                      />
                    </span>
                  }
                >
                  <Input.TextArea
                    rows={3}
                    placeholder="Enter English description"
                  />
                </Form.Item>
                <Form.Item name="description_ar" label="Description (AR)">
                  <Input.TextArea rows={3} placeholder="Enter Arabic description" />
                </Form.Item>
                <Form.Item name="description_fr" label="Description (FR)">
                  <Input.TextArea rows={3} placeholder="Enter French description" />
                </Form.Item>
              </div>
            </div>
          </div>
          <Form.Item label="Image">
            <Upload
              listType="picture-card"
              fileList={editImage}
              beforeUpload={() => false}
              maxCount={1}
              accept="image/*"
              onChange={({ fileList }) => setEditImage(fileList)}
            >
              {editImage.length === 0 && (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Blog Details"
        open={isDetailsModalOpen}
        onCancel={() => {
          setIsDetailsModalOpen(false);
          setSelectedNewsId(null);
          setSelectedNewsSlug(null);
          setExpandedDetailsDescriptions({});
        }}
        footer={null}
        width={1200}
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  detailsCreateForm.resetFields();
                  setDetailsCreateImages([]);
                  setIsDetailsCreateOpen(true);
                }}
              >
                Add Blog Details
              </Button>
              <Upload
                accept=".xlsx,.xls"
                showUploadList={false}
                beforeUpload={async (file) => {
                  setIsDetailsImporting(true);
                  try {
                    await importNewsDetailsExcel(selectedNewsId, file, selectedNewsSlug);
                    if (selectedNewsSlug) {
                      await fetchNewsDetails(selectedNewsSlug, { lang });
                    }
                  } catch (error) {
                    if (error?.response?.data?.message) {
                      toast.error(error.response.data.message);
                    } else if (error?.message) {
                      toast.error(error.message);
                    }
                  } finally {
                    setIsDetailsImporting(false);
                  }
                  return false;
                }}
              >
                <Button
                  icon={<UploadOutlined />}
                  loading={isDetailsImporting}
                  disabled={isDetailsImporting}
                >
                  Import Excel
                </Button>
              </Upload>
            </div>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                if (selectedNewsSlug) {
                  fetchNewsDetails(selectedNewsSlug, { lang });
                }
              }}
            >
              Refresh
            </Button>
          </div>

          <Table
            rowKey={(record) => record.id}
            columns={[
              {
                title: "ID",
                dataIndex: "id",
                key: "id",
                width: 80,
              },
              {
                title: "Title",
                dataIndex: "title",
                key: "title",
                ellipsis: true,
              },
              {
                title: "Subtitle",
                dataIndex: "subtitle",
                key: "subtitle",
                ellipsis: true,
              },
              {
                title: "Description",
                dataIndex: "description",
                key: "description",
                width: 300,
                render: (text, record) => {
                  const isExpanded = expandedDetailsDescriptions[record.id];
                  const maxLength = 50;

                  if (!text) return "-";

                  if (text.length <= maxLength) {
                    return <div className="whitespace-pre-wrap">{text}</div>;
                  }

                  return (
                    <div>
                      <div className="whitespace-pre-wrap mb-1">
                        {isExpanded ? text : `${text.substring(0, maxLength)}...`}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedDetailsDescriptions({
                            ...expandedDetailsDescriptions,
                            [record.id]: !isExpanded,
                          });
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        {isExpanded ? "Read less" : "Read more"}
                      </button>
                    </div>
                  );
                },
              },
              {
                title: "Images",
                dataIndex: "images",
                key: "images",
                width: 200,
                render: (images) => {
                  if (!images || !Array.isArray(images) || images.length === 0) {
                    return "-";
                  }
                  return (
                    <div className="flex gap-2 flex-wrap">
                      {images.slice(0, 3).map((img, idx) => (
                        <Image
                          key={idx}
                          src={img}
                          width={50}
                          height={50}
                          style={{ objectFit: "cover" }}
                          preview={{ mask: "Preview" }}
                        />
                      ))}
                      {images.length > 3 && (
                        <span className="text-gray-500">+{images.length - 3}</span>
                      )}
                    </div>
                  );
                },
              },
              {
                title: "Actions",
                key: "actions",
                width: 150,
                render: (record) => (
                  <Space>
                    <Button
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => {
                        setEditingDetailsId(record.id);
                        detailsEditForm.setFieldsValue({
                          title_en: record.title_en || record.title || "",
                          title_ar: record.title_ar || record.title || "",
                          title_fr: record.title_fr || record.title || "",
                          subtitle_en: record.subtitle_en || record.subtitle || "",
                          subtitle_ar: record.subtitle_ar || record.subtitle || "",
                          subtitle_fr: record.subtitle_fr || record.subtitle || "",
                          description_en: record.description_en || record.description || "",
                          description_ar: record.description_ar || record.description || "",
                          description_fr: record.description_fr || record.description || "",
                        });
                        if (record.images && Array.isArray(record.images)) {
                          setDetailsEditImages(
                            record.images.map((img) => ({
                              uid: img,
                              name: img.split("/").pop(),
                              status: "done",
                              url: img,
                            }))
                          );
                        } else {
                          setDetailsEditImages([]);
                        }
                        setIsDetailsEditOpen(true);
                      }}
                    />
                    <Popconfirm
                      title="Delete this blog detail?"
                      okText="Yes"
                      cancelText="No"
                      onConfirm={async () => {
                        try {
                          await removeNewsDetails(record.id, selectedNewsSlug);
                        } catch (error) {
                          if (error?.response?.data?.message) {
                            toast.error(error.response.data.message);
                          } else if (error?.message) {
                            toast.error(error.message);
                          }
                        }
                      }}
                    >
                      <Button size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                  </Space>
                ),
              },
            ]}
            dataSource={detailsItems}
            loading={isLoading}
            pagination={false}
          />
        </div>
      </Modal>

      <Modal
        title="Add Blog Details"
        open={isDetailsCreateOpen}
        onCancel={() => {
          setIsDetailsCreateOpen(false);
          detailsCreateForm.resetFields();
          setDetailsCreateImages([]);
        }}
        onOk={async () => {
          try {
            const values = await detailsCreateForm.validateFields();
            const payload = {
              ...values,
            };
            if (detailsCreateImages.length > 0) {
              payload.images = detailsCreateImages
                .map((img) => img.originFileObj)
                .filter(Boolean);
            }
            await createNewsDetails(selectedNewsId, payload, selectedNewsSlug);
            setIsDetailsCreateOpen(false);
            detailsCreateForm.resetFields();
            setDetailsCreateImages([]);
            if (selectedNewsSlug) {
              await fetchNewsDetails(selectedNewsSlug, { lang });
            }
          } catch (error) {
            if (error?.response?.data?.message) {
              toast.error(error.response.data.message);
            } else if (error?.message) {
              toast.error(error.message);
            }
          }
        }}
        okText="Create"
        confirmLoading={isLoading}
      >
        <Form form={detailsCreateForm} layout="vertical">
          <div className="space-y-6">
            {/* Title Section */}
            <div>
              <h4 className="text-sm font-semibold mb-3 text-gray-700">Title</h4>
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
                        onClick={() => handleTranslateDetailsField("title")}
                        loading={translatingDetailsTitle}
                        style={{ padding: 0, fontSize: "12px", height: "auto" }}
                      />
                    </span>
                  }
                  rules={[{ required: true, message: "Title is required" }]}
                >
                  <Input placeholder="Enter English title" />
                </Form.Item>
                <Form.Item
                  name="title_ar"
                  label="Title (AR)"
                  rules={[{ required: true, message: "Title is required" }]}
                >
                  <Input placeholder="Enter Arabic title" />
                </Form.Item>
                <Form.Item
                  name="title_fr"
                  label="Title (FR)"
                  rules={[{ required: true, message: "Title is required" }]}
                >
                  <Input placeholder="Enter French title" />
                </Form.Item>
              </div>
            </div>

            {/* Subtitle Section */}
            <div>
              <h4 className="text-sm font-semibold mb-3 text-gray-700">Subtitle</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Form.Item
                  name="subtitle_en"
                  label={
                    <span className="flex items-center gap-2">
                      <span>Subtitle (EN)</span>
                      <Button
                        type="link"
                        size="small"
                        icon={<TranslationOutlined />}
                        onClick={() => handleTranslateDetailsField("subtitle")}
                        loading={translatingDetailsSubtitle}
                        style={{ padding: 0, fontSize: "12px", height: "auto" }}
                      />
                    </span>
                  }
                  rules={[{ required: true, message: "Subtitle is required" }]}
                >
                  <Input placeholder="Enter English subtitle" />
                </Form.Item>
                <Form.Item
                  name="subtitle_ar"
                  label="Subtitle (AR)"
                  rules={[{ required: true, message: "Subtitle is required" }]}
                >
                  <Input placeholder="Enter Arabic subtitle" />
                </Form.Item>
                <Form.Item
                  name="subtitle_fr"
                  label="Subtitle (FR)"
                  rules={[{ required: true, message: "Subtitle is required" }]}
                >
                  <Input placeholder="Enter French subtitle" />
                </Form.Item>
              </div>
            </div>

            {/* Description Section */}
            <div>
              <h4 className="text-sm font-semibold mb-3 text-gray-700">Description</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Form.Item
                  name="description_en"
                  label={
                    <span className="flex items-center gap-2">
                      <span>Description (EN)</span>
                      <Button
                        type="link"
                        size="small"
                        icon={<TranslationOutlined />}
                        onClick={() => handleTranslateDetailsField("description")}
                        loading={translatingDetailsDescription}
                        style={{ padding: 0, fontSize: "12px", height: "auto" }}
                      />
                    </span>
                  }
                  rules={[{ required: true, message: "Description is required" }]}
                >
                  <Input.TextArea
                    rows={3}
                    placeholder="Enter English description"
                  />
                </Form.Item>
                <Form.Item
                  name="description_ar"
                  label="Description (AR)"
                  rules={[{ required: true, message: "Description is required" }]}
                >
                  <Input.TextArea rows={3} placeholder="Enter Arabic description" />
                </Form.Item>
                <Form.Item
                  name="description_fr"
                  label="Description (FR)"
                  rules={[{ required: true, message: "Description is required" }]}
                >
                  <Input.TextArea rows={3} placeholder="Enter French description" />
                </Form.Item>
              </div>
            </div>
          </div>
          <Form.Item label="Images">
            <Upload
              listType="picture-card"
              fileList={detailsCreateImages}
              beforeUpload={() => false}
              accept="image/*"
              onChange={({ fileList }) => setDetailsCreateImages(fileList)}
            >
              {detailsCreateImages.length < 10 && (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Update Blog Details"
        open={isDetailsEditOpen}
        onCancel={() => {
          setIsDetailsEditOpen(false);
          detailsEditForm.resetFields();
          setDetailsEditImages([]);
          setEditingDetailsId(null);
        }}
        onOk={async () => {
          try {
            const values = await detailsEditForm.validateFields();
            const payload = Object.entries(values).reduce((acc, [key, value]) => {
              if (value != null && value !== "") {
                acc[key] = value;
              }
              return acc;
            }, {});
            if (detailsEditImages.length > 0) {
              const newImages = detailsEditImages
                .map((img) => img.originFileObj)
                .filter(Boolean);
              if (newImages.length > 0) {
                payload.images = newImages;
              }
            }
            await updateNewsDetails(editingDetailsId, payload, selectedNewsSlug);
            setIsDetailsEditOpen(false);
            detailsEditForm.resetFields();
            setDetailsEditImages([]);
            setEditingDetailsId(null);
          } catch (error) {
            if (error?.response?.data?.message) {
              toast.error(error.response.data.message);
            } else if (error?.message) {
              toast.error(error.message);
            }
          }
        }}
        okText="Update"
        confirmLoading={isLoading}
      >
        <Form form={detailsEditForm} layout="vertical">
          <div className="space-y-6">
            {/* Title Section */}
            <div>
              <h4 className="text-sm font-semibold mb-3 text-gray-700">Title</h4>
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
                        onClick={() => handleTranslateDetailsEditField("title")}
                        loading={translatingDetailsEditTitle}
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
              </div>
            </div>

            {/* Subtitle Section */}
            <div>
              <h4 className="text-sm font-semibold mb-3 text-gray-700">Subtitle</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Form.Item
                  name="subtitle_en"
                  label={
                    <span className="flex items-center gap-2">
                      <span>Subtitle (EN)</span>
                      <Button
                        type="link"
                        size="small"
                        icon={<TranslationOutlined />}
                        onClick={() => handleTranslateDetailsEditField("subtitle")}
                        loading={translatingDetailsEditSubtitle}
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
            </div>

            {/* Description Section */}
            <div>
              <h4 className="text-sm font-semibold mb-3 text-gray-700">Description</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Form.Item
                  name="description_en"
                  label={
                    <span className="flex items-center gap-2">
                      <span>Description (EN)</span>
                      <Button
                        type="link"
                        size="small"
                        icon={<TranslationOutlined />}
                        onClick={() => handleTranslateDetailsEditField("description")}
                        loading={translatingDetailsEditDescription}
                        style={{ padding: 0, fontSize: "12px", height: "auto" }}
                      />
                    </span>
                  }
                >
                  <Input.TextArea
                    rows={3}
                    placeholder="Enter English description"
                  />
                </Form.Item>
                <Form.Item name="description_ar" label="Description (AR)">
                  <Input.TextArea rows={3} placeholder="Enter Arabic description" />
                </Form.Item>
                <Form.Item name="description_fr" label="Description (FR)">
                  <Input.TextArea rows={3} placeholder="Enter French description" />
                </Form.Item>
              </div>
            </div>
          </div>
          <Form.Item label="Images">
            <Upload
              listType="picture-card"
              fileList={detailsEditImages}
              beforeUpload={() => false}
              accept="image/*"
              onChange={({ fileList }) => setDetailsEditImages(fileList)}
            >
              {detailsEditImages.length < 10 && (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default News;
