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
  Pagination,
  Spin,
  Image,
  Table,
  Tooltip,
  Typography,
  Switch,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { FaDatabase } from "react-icons/fa";
import { toast } from "react-toastify";
import { useWorksSectionStore } from "../../store/works/worksSectionStore.js";
import { useTranslateStore } from "../../store/translateStore.js";
import ExcelImportButton from "../../components/work/ExcelImportButton.jsx";
import WorkLangSelect from "../../components/work/WorkLangSelect.jsx";
import {
  EMPTY_TRANSLATION_FIELDS,
  translateWorksSectionFields,
} from "./worksSectionHelpers.js";

const WorksSection = () => {
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
  } = useWorksSectionStore();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addForm] = Form.useForm();
  const [imageFileList, setImageFileList] = useState([]);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm] = Form.useForm();
  const [editImageFileList, setEditImageFileList] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [isCreateTranslating, setIsCreateTranslating] = useState(false);
  const [isEditTranslating, setIsEditTranslating] = useState(false);
  const [autoTranslateCreate, setAutoTranslateCreate] = useState(true);
  const [autoTranslateEdit, setAutoTranslateEdit] = useState(true);

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

  const handleAdd = async () => {
    try {
      await addForm.validateFields();
      const values = addForm.getFieldsValue(true);

      let translated = { ...EMPTY_TRANSLATION_FIELDS };
      if (autoTranslateCreate) {
        setIsCreateTranslating(true);
        translated = await translateWorksSectionFields(translateText, {
          title_en: values.title_en,
          subtitle_en: values.subtitle_en,
          description_en: values.description_en,
        });
        setIsCreateTranslating(false);
      }

      const payload = {
        title_en: values.title_en,
        subtitle_en: values.subtitle_en,
        description_en: values.description_en,
        type: values.type,
        media: null,
      };

      if (autoTranslateCreate) {
        payload.title_ar = translated.title_ar;
        payload.title_fr = translated.title_fr;
        payload.subtitle_ar = translated.subtitle_ar;
        payload.subtitle_fr = translated.subtitle_fr;
        payload.description_ar = translated.description_ar;
        payload.description_fr = translated.description_fr;
      } else {
        payload.title_ar = values.title_ar;
        payload.title_fr = values.title_fr;
        payload.subtitle_ar = values.subtitle_ar;
        payload.subtitle_fr = values.subtitle_fr;
        payload.description_ar = values.description_ar;
        payload.description_fr = values.description_fr;
      }

      if (imageFileList[0]?.originFileObj) {
        payload.media = imageFileList[0].originFileObj;
      }

      if (!payload.media) {
        toast.error("Please upload an image.");
        return;
      }

      await create(payload);
      setIsAddOpen(false);
      addForm.resetFields();
      setImageFileList([]);
      setAutoTranslateCreate(true);
    } catch (err) {
      setIsCreateTranslating(false);
      if (err?.response?.data?.message) {
        toast.error(err.response.data.message);
      } else if (err?.message) {
        toast.error(err.message);
      }
    }
  };

  const handleEdit = async () => {
    try {
      await editForm.validateFields();
      const values = editForm.getFieldsValue(true);

      let translated = { ...EMPTY_TRANSLATION_FIELDS };
      if (autoTranslateEdit) {
        setIsEditTranslating(true);
        translated = await translateWorksSectionFields(translateText, {
          title_en: values.title_en,
          subtitle_en: values.subtitle_en,
          description_en: values.description_en,
        });
        setIsEditTranslating(false);
      }

      const payload = {};

      if (values.title_en) payload.title_en = values.title_en;
      if (values.subtitle_en) payload.subtitle_en = values.subtitle_en;
      if (values.description_en) payload.description_en = values.description_en;
      if (values.type) payload.type = values.type;

      if (autoTranslateEdit) {
        payload.title_ar = translated.title_ar;
        payload.title_fr = translated.title_fr;
        payload.subtitle_ar = translated.subtitle_ar;
        payload.subtitle_fr = translated.subtitle_fr;
        payload.description_ar = translated.description_ar;
        payload.description_fr = translated.description_fr;
      } else {
        if (values.title_ar) payload.title_ar = values.title_ar;
        if (values.title_fr) payload.title_fr = values.title_fr;
        if (values.subtitle_ar) payload.subtitle_ar = values.subtitle_ar;
        if (values.subtitle_fr) payload.subtitle_fr = values.subtitle_fr;
        if (values.description_ar)
          payload.description_ar = values.description_ar;
        if (values.description_fr)
          payload.description_fr = values.description_fr;
      }

      if (editImageFileList[0]?.originFileObj) {
        payload.media = editImageFileList[0].originFileObj;
      }

      await update(editingId, payload);
      setIsEditOpen(false);
      editForm.resetFields();
      setEditImageFileList([]);
      setEditingId(null);
      setAutoTranslateEdit(true);
    } catch (err) {
      setIsEditTranslating(false);
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

  const openEditModal = (work) => {
    setEditingId(work.id);
    setIsEditOpen(true);
    const localizedTitle = work.title ?? "";
    const localizedSubtitle = work.subtitle ?? "";
    const localizedDescription = work.description ?? "";
    editForm.setFieldsValue({
      title_en:
        work.title_en || (lang === "en" ? localizedTitle : "") || "",
      title_ar:
        work.title_ar || (lang === "ar" ? localizedTitle : "") || "",
      title_fr:
        work.title_fr || (lang === "fr" ? localizedTitle : "") || "",
      subtitle_en:
        work.subtitle_en || (lang === "en" ? localizedSubtitle : "") || "",
      subtitle_ar:
        work.subtitle_ar || (lang === "ar" ? localizedSubtitle : "") || "",
      subtitle_fr:
        work.subtitle_fr || (lang === "fr" ? localizedSubtitle : "") || "",
      description_en:
        work.description_en ||
        (lang === "en" ? localizedDescription : "") ||
        "",
      description_ar:
        work.description_ar ||
        (lang === "ar" ? localizedDescription : "") ||
        "",
      description_fr:
        work.description_fr ||
        (lang === "fr" ? localizedDescription : "") ||
        "",
      type: work.type || "",
    });
    setEditImageFileList(
      work.media
        ? [
            {
              uid: "-1",
              name: "current",
              status: "done",
              url: work.media,
            },
          ]
        : []
    );
  };

  const handleViewData = (workSlug, workType) => {
    if (workType === "social") {
      navigate(`/works/social/${workSlug}`);
    } else if (workType === "influence") {
      navigate(`/works/influence/${workSlug}`);
    } else if (workType === "digital") {
      navigate(`/works/digital/${workSlug}`);
    } else if (workType === "creative") {
      navigate(`/works/creative/${workSlug}`);
    } else if (workType === "event") {
      navigate(`/works/event/${workSlug}`);
    } else {
      // Default to influence for backward compatibility
      navigate(`/works/influence/${workSlug}`);
    }
  };

  const { Text } = Typography;

  const columns = [
    {
      title: "Media",
      dataIndex: "media",
      key: "media",
      width: 120,
      render: (media) =>
        media ? (
          <Image
            src={media}
            alt="Work media"
            width={80}
            height={80}
            className="object-cover"
            preview={{ mask: "Preview" }}
          />
        ) : (
          <span className="text-gray-400">No Image</span>
        ),
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      ellipsis: true,
      render: (_, work) => (
        <Text strong ellipsis={{ tooltip: work.title }}>
          {work.title || "No Title"}
        </Text>
      ),
    },
    {
      title: "Subtitle",
      dataIndex: "subtitle",
      key: "subtitle",
      ellipsis: true,
      render: (_, work) => (
        <Text ellipsis={{ tooltip: work.subtitle }}>
          {work.subtitle || "No Subtitle"}
        </Text>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (description) => (
        <Tooltip title={description || ""}>
          <span className="block max-w-[320px] truncate">
            {description || ""}
          </span> 
        </Tooltip>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: 120,
      render: (type) => (
        <Text type="secondary" className="uppercase tracking-wide">
          {type || ""}
        </Text>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 140,
      fixed: "right",
      render: (_, work) => (
        <div className="flex items-center gap-2">
          <Tooltip title="View Data">
            <Button
              type="text"
              icon={<FaDatabase />}
              onClick={() => handleViewData(work.slug, work.type)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => openEditModal(work)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete this work section?"
            okText="Yes"
            cancelText="No"
            onConfirm={() => handleDelete(work.id)}
          >
            <Tooltip title="Delete">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Works Sections</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Language:</span>
            <WorkLangSelect
              value={lang}
              style={{ width: 140 }}
              onChange={(value) => {
                setLang(value);
                setPage(1);
              }}
            />
          </div>
          <ExcelImportButton onImport={handleImportExcel}>Import Excel</ExcelImportButton>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setAutoTranslateCreate(true);
              setIsAddOpen(true);
            }}
          >
            Add Work Section
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <Spin size="large" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No work sections found</p>
        </div>
      ) : (
        <>
          <Table
            columns={columns}
            dataSource={items}
            rowKey="id"
            pagination={false}
            className="bg-white shadow-sm rounded-lg"
            size="middle"
            scroll={{ x: true }}
          />

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
        title="Add Work Section"
        open={isAddOpen}
        onCancel={() => {
          setIsAddOpen(false);
          addForm.resetFields();
          setImageFileList([]);
          setAutoTranslateCreate(true);
        }}
        onOk={handleAdd}
        confirmLoading={isLoading || isCreateTranslating}
        okText="Create"
        width={800}
      >
        <Form form={addForm} layout="vertical">
          <div className="mb-4 flex items-center gap-3">
            <span className="text-sm text-gray-600">Translation:</span>
            <Switch
              checked={autoTranslateCreate}
              onChange={setAutoTranslateCreate}
              checkedChildren="Auto"
              unCheckedChildren="Manual"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Item
              name="title_en"
              label="Title (EN)"
              rules={[{ required: true }]}
            >
              <Input placeholder="Enter English title" />
            </Form.Item>
            <Form.Item
              name="subtitle_en"
              label="Subtitle (EN)"
              rules={[{ required: true }]}
            >
              <Input placeholder="Enter English subtitle" />
            </Form.Item>
            <Form.Item
              name="description_en"
              label="Description (EN)"
              rules={[{ required: true }]}
            >
              <Input.TextArea
                rows={3}
                placeholder="Enter English description"
              />
            </Form.Item>
            {!autoTranslateCreate && (
              <>
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
                <Form.Item
                  name="description_ar"
                  label="Description (AR)"
                  rules={[{ required: true }]}
                >
                  <Input.TextArea
                    rows={3}
                    placeholder="Enter Arabic description"
                  />
                </Form.Item>
                <Form.Item
                  name="description_fr"
                  label="Description (FR)"
                  rules={[{ required: true }]}
                >
                  <Input.TextArea
                    rows={3}
                    placeholder="Enter French description"
                  />
                </Form.Item>
              </>
            )}
          </div>

          <Form.Item name="type" label="Type" rules={[{ required: true }]}>
            <Select
              placeholder="Select type"
              options={[
                { label: "Influence", value: "influence" },
                { label: "Social", value: "social" },
                { label: "Creative", value: "creative" },
                { label: "Digital", value: "digital" },
                { label: "Event", value: "event" },
                { label: "Featured", value: "featured" },
              ]}
            />
          </Form.Item>

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
        title="Update Work Section"
        open={isEditOpen}
        onCancel={() => {
          setIsEditOpen(false);
          editForm.resetFields();
          setEditImageFileList([]);
          setEditingId(null);
          setAutoTranslateEdit(true);
        }}
        onOk={handleEdit}
        confirmLoading={isLoading || isEditTranslating}
        okText="Update"
        width={800}
      >
        <Form form={editForm} layout="vertical">
          <div className="mb-4 flex items-center gap-3">
            <span className="text-sm text-gray-600">Translation:</span>
            <Switch
              checked={autoTranslateEdit}
              onChange={setAutoTranslateEdit}
              checkedChildren="Auto"
              unCheckedChildren="Manual"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Item name="title_en" label="Title (EN)">
              <Input placeholder="Enter English title" />
            </Form.Item>
            <Form.Item name="subtitle_en" label="Subtitle (EN)">
              <Input placeholder="Enter English subtitle" />
            </Form.Item>
            <Form.Item name="description_en" label="Description (EN)">
              <Input.TextArea
                rows={3}
                placeholder="Enter English description"
              />
            </Form.Item>
            {!autoTranslateEdit && (
              <>
                <Form.Item name="title_ar" label="Title (AR)">
                  <Input placeholder="Enter Arabic title" />
                </Form.Item>
                <Form.Item name="title_fr" label="Title (FR)">
                  <Input placeholder="Enter French title" />
                </Form.Item>
                <Form.Item name="subtitle_ar" label="Subtitle (AR)">
                  <Input placeholder="Enter Arabic subtitle" />
                </Form.Item>
                <Form.Item name="subtitle_fr" label="Subtitle (FR)">
                  <Input placeholder="Enter French subtitle" />
                </Form.Item>
                <Form.Item name="description_ar" label="Description (AR)">
                  <Input.TextArea
                    rows={3}
                    placeholder="Enter Arabic description"
                  />
                </Form.Item>
                <Form.Item name="description_fr" label="Description (FR)">
                  <Input.TextArea
                    rows={3}
                    placeholder="Enter French description"
                  />
                </Form.Item>
              </>
            )}
          </div>

          <Form.Item name="type" label="Type">
            <Select
              placeholder="Select type"
              options={[
                { label: "Influence", value: "influence" },
                { label: "Social", value: "social" },
                { label: "Creative", value: "creative" },
                { label: "Digital", value: "digital" },
                { label: "Event", value: "event" },
                { label: "Featured", value: "featured" },
              ]}
            />
          </Form.Item>

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

export default WorksSection;
