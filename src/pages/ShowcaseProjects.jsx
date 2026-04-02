import { useEffect, useMemo, useState } from "react";
import {
  Table,
  Image,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Upload,
  Select,
  Popconfirm,
  Typography,
} from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import { useShowcaseProjectsStore } from "../store/showcaseProjectsStore.js";
import { useTranslateStore } from "../store/translateStore.js";

const { Text } = Typography;

const LANG_OPTIONS = [
  { label: "English", value: "en" },
  { label: "Arabic", value: "ar" },
  { label: "French", value: "fr" },
];

const ShowcaseProjects = () => {
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
    importExcel,
  } = useShowcaseProjectsStore();

  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [logoFileList, setLogoFileList] = useState([]);
  const [imagesFileList, setImagesFileList] = useState([]);
  const [videosFileList, setVideosFileList] = useState([]);
  const [editLogoFileList, setEditLogoFileList] = useState([]);
  const [editImagesFileList, setEditImagesFileList] = useState([]);
  const [editVideosFileList, setEditVideosFileList] = useState([]);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingProject, setViewingProject] = useState(null);
  const [expandedBriefs, setExpandedBriefs] = useState(new Set());
  const [expandedStrategies, setExpandedStrategies] = useState(new Set());
  const [importFileList, setImportFileList] = useState([]);

  const [isCreateTranslating, setIsCreateTranslating] = useState(false);
  const [isEditTranslating, setIsEditTranslating] = useState(false);
  
  const translateText = useTranslateStore((state) => state.translateText);

  useEffect(() => {
    fetchList();
  }, [page, perPage, lang]);

  const resetCreateModal = () => {
    createForm.resetFields();
    setLogoFileList([]);
    setImagesFileList([]);
    setVideosFileList([]);
  };

  const resetEditModal = () => {
    editForm.resetFields();
    setEditLogoFileList([]);
    setEditImagesFileList([]);
    setEditVideosFileList([]);
    setEditingId(null);
  };

  const handleImport = async () => {
    const file = importFileList[0]?.originFileObj;
    if (!file) {
      toast.error("Please select a file to import");
      return;
    }
    try {
      await importExcel(file);
      setImportFileList([]);
    } catch (error) {
      // toast already handled in store
    }
  };

  const buildPayload = (values, logoList, imagesList, videosList) => {
    const payload = { ...values };
    if (logoList[0]?.originFileObj) {
      payload.logo = logoList[0].originFileObj;
    }
    const imageFiles = imagesList
      .map((file) => file.originFileObj)
      .filter(Boolean);
    if (imageFiles.length > 0) {
      payload.images = imageFiles;
    }
    const videoFiles = videosList
      .map((file) => file.originFileObj)
      .filter(Boolean);
    if (videoFiles.length > 0) {
      payload.thumbnails = videoFiles;
    }
    return payload;
  };

  /** Translate EN fields to AR/FR before sending payload. */
  const translateShowcaseFields = async ({
    title_en,
    subtitle_en,
    objective_en,
    brief_en,
    strategy_en,
  }) => {
    const out = {
      title_ar: "",
      title_fr: "",
      subtitle_ar: "",
      subtitle_fr: "",
      objective_ar: "",
      objective_fr: "",
      brief_ar: "",
      brief_fr: "",
      strategy_ar: "",
      strategy_fr: "",
    };

    const translatePlain = async (text, field) => {
      if (!text || !String(text).trim()) return;
      const result = await translateText(String(text).trim());
      if (result) {
        out[`${field}_ar`] = result.ar ?? "";
        out[`${field}_fr`] = result.fr ?? "";
      }
    };

    await translatePlain(title_en, "title");
    await translatePlain(subtitle_en, "subtitle");
    await translatePlain(objective_en, "objective");
    await translatePlain(brief_en, "brief");
    await translatePlain(strategy_en, "strategy");

    return out;
  };

  const handleCreate = async () => {
    try {
      await createForm.validateFields();
      const values = createForm.getFieldsValue(true);

      setIsCreateTranslating(true);
      const translated = await translateShowcaseFields({
        title_en: values.title_en,
        subtitle_en: values.subtitle_en,
        objective_en: values.objective_en,
        brief_en: values.brief_en,
        strategy_en: values.strategy_en,
      });
      setIsCreateTranslating(false);

      const payload = buildPayload(
        values,
        logoFileList,
        imagesFileList,
        videosFileList
      );
      payload.title_ar = translated.title_ar;
      payload.title_fr = translated.title_fr;
      payload.subtitle_ar = translated.subtitle_ar;
      payload.subtitle_fr = translated.subtitle_fr;
      payload.objective_ar = translated.objective_ar;
      payload.objective_fr = translated.objective_fr;
      payload.brief_ar = translated.brief_ar;
      payload.brief_fr = translated.brief_fr;
      payload.strategy_ar = translated.strategy_ar;
      payload.strategy_fr = translated.strategy_fr;

      await create(payload);
      setIsCreateOpen(false);
      resetCreateModal();
    } catch (error) {
      setIsCreateTranslating(false);
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error?.message) {
        toast.error(error.message);
      }
    }
  };

  const handleEditOpen = (project) => {
    setEditingId(project.id);
    editForm.setFieldsValue({
      title_en: project.title_en ?? project.title ?? "",
      title_ar: project.title_ar ?? "",
      title_fr: project.title_fr ?? "",
      subtitle_en: project.subtitle_en ?? project.subtitle ?? "",
      subtitle_ar: project.subtitle_ar ?? "",
      subtitle_fr: project.subtitle_fr ?? "",
      objective_en: project.objective_en ?? project.objective ?? "",
      objective_ar: project.objective_ar ?? "",
      objective_fr: project.objective_fr ?? "",
      brief_en: project.brief_en ?? project.brief ?? "",
      brief_ar: project.brief_ar ?? "",
      brief_fr: project.brief_fr ?? "",
      strategy_en: project.strategy_en ?? project.strategy ?? "",
      strategy_ar: project.strategy_ar ?? "",
      strategy_fr: project.strategy_fr ?? "",
      reach: project.reach ?? null,
      views: project.views ?? null,
      engagement_rate: project.engagement_rate ?? null,
    });
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    try {
      await editForm.validateFields();
      const values = editForm.getFieldsValue(true);

      setIsEditTranslating(true);
      const translated = await translateShowcaseFields({
        title_en: values.title_en,
        subtitle_en: values.subtitle_en,
        objective_en: values.objective_en,
        brief_en: values.brief_en,
        strategy_en: values.strategy_en,
      });
      setIsEditTranslating(false);

      const payload = buildPayload(
        values,
        editLogoFileList,
        editImagesFileList,
        editVideosFileList
      );
      payload.title_ar = translated.title_ar;
      payload.title_fr = translated.title_fr;
      payload.subtitle_ar = translated.subtitle_ar;
      payload.subtitle_fr = translated.subtitle_fr;
      payload.objective_ar = translated.objective_ar;
      payload.objective_fr = translated.objective_fr;
      payload.brief_ar = translated.brief_ar;
      payload.brief_fr = translated.brief_fr;
      payload.strategy_ar = translated.strategy_ar;
      payload.strategy_fr = translated.strategy_fr;

      await update(editingId, payload);
      setIsEditOpen(false);
      resetEditModal();
    } catch (error) {
      setIsEditTranslating(false);
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error?.message) {
        toast.error(error.message);
      }
    }
  };

  const columns = useMemo(
    () => [
      {
        title: "Title",
        dataIndex: "title_en",
        key: "title_en",
        render: (value, record) => value || record.title || "-",
      },
      {
        title: "Brief",
        dataIndex: "brief_en",
        key: "brief_en",
        width: 300,
        render: (value, record) => {
          const text = value || record.brief || "-";
          const isExpanded = expandedBriefs.has(record.id);
          
          if (text === "-" || !text) {
            return <Text>{text}</Text>;
          }
          
          return (
            <div>
              <div
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: isExpanded ? "unset" : 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  wordBreak: "break-word",
                  lineHeight: "1.5",
                  maxHeight: isExpanded ? "none" : "3em",
                }}
              >
                <Text>{text}</Text>
              </div>
              <Button
                type="link"
                size="small"
                onClick={() => {
                  const newSet = new Set(expandedBriefs);
                  if (isExpanded) {
                    newSet.delete(record.id);
                  } else {
                    newSet.add(record.id);
                  }
                  setExpandedBriefs(newSet);
                }}
                style={{ padding: 0, marginTop: 4, height: "auto" }}
              >
                {isExpanded ? "Read less" : "Read more"}
              </Button>
            </div>
          );
        },
      },
      {
        title: "Strategy",
        dataIndex: "strategy_en",
        key: "strategy_en",
        width: 300,
        render: (value, record) => {
          const text = value || record.strategy || "-";
          const isExpanded = expandedStrategies.has(record.id);
          
          if (text === "-" || !text) {
            return <Text>{text}</Text>;
          }
          
          return (
            <div>
              <div
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: isExpanded ? "unset" : 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  wordBreak: "break-word",
                  lineHeight: "1.5",
                  maxHeight: isExpanded ? "none" : "3em",
                }}
              >
                <Text>{text}</Text>
              </div>
              <Button
                type="link"
                size="small"
                onClick={() => {
                  const newSet = new Set(expandedStrategies);
                  if (isExpanded) {
                    newSet.delete(record.id);
                  } else {
                    newSet.add(record.id);
                  }
                  setExpandedStrategies(newSet);
                }}
                style={{ padding: 0, marginTop: 4, height: "auto" }}
              >
                {isExpanded ? "Read less" : "Read more"}
              </Button>
            </div>
          );
        },
      },
      {
        title: "Reach",
        dataIndex: "reach",
        key: "reach",
        width: 120,
      },
      {
        title: "Views",
        dataIndex: "views",
        key: "views",
        width: 120,
      },
      {
        title: "Engagement Rate",
        dataIndex: "engagement_rate",
        key: "engagement_rate",
        width: 160,
      },
      {
        title: "Actions",
        key: "actions",
        width: 220,
        render: (record) => (
          <Space>
            <Button onClick={() => {
              setViewingProject(record);
              setViewModalOpen(true);
            }}>View</Button>
            <Button onClick={() => handleEditOpen(record)}>Update</Button>
            <Popconfirm
              title="Delete this project?"
              okText="Yes"
              cancelText="No"
              onConfirm={async () => {
                try {
                  await remove(record.id);
                } catch (error) {
                  if (error?.response?.data?.message) {
                    toast.error(error.response.data.message);
                  } else if (error?.message) {
                    toast.error(error.message);
                  }
                }
              }}
            >
              <Button danger>Delete</Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [remove, expandedBriefs, expandedStrategies]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Showcase Projects</h2>
          <p className="text-gray-600">
            Manage featured showcase projects including reach, views, and media.
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
            fileList={importFileList}
            beforeUpload={() => false}
            maxCount={1}
            accept=".xlsx,.xls"
            onChange={({ fileList }) => setImportFileList(fileList)}
            showUploadList={{ showRemoveIcon: true }}
          >
            <Button icon={<UploadOutlined />}>Select Excel</Button>
          </Upload>
          <Button
            type="default"
            onClick={handleImport}
            disabled={importFileList.length === 0}
            loading={isLoading}
          >
            Import
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              resetCreateModal();
              setIsCreateOpen(true);
            }}
          >
            Add Project
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
        title="Add Showcase Project"
        open={isCreateOpen}
        onCancel={() => {
          setIsCreateOpen(false);
          resetCreateModal();
        }}
        onOk={handleCreate}
        okText="Create"
        confirmLoading={isLoading || isCreateTranslating}
        width={900}
      >
        <ProjectForm
          form={createForm}
          logoFileList={logoFileList}
          onLogoChange={setLogoFileList}
          imagesFileList={imagesFileList}
          onImagesChange={setImagesFileList}
          videosFileList={videosFileList}
          onVideosChange={setVideosFileList}
        />
      </Modal>

      <Modal
        title="Update Showcase Project"
        open={isEditOpen}
        onCancel={() => {
          setIsEditOpen(false);
          resetEditModal();
        }}
        onOk={handleUpdate}
        okText="Update"
        confirmLoading={isLoading || isEditTranslating}
        width={900}
      >
        <ProjectForm
          form={editForm}
          logoFileList={editLogoFileList}
          onLogoChange={setEditLogoFileList}
          imagesFileList={editImagesFileList}
          onImagesChange={setEditImagesFileList}
          videosFileList={editVideosFileList}
          onVideosChange={setEditVideosFileList}
          isEdit
        />
      </Modal>

      <Modal
        title="Project Details"
        open={viewModalOpen}
        onCancel={() => {
          setViewModalOpen(false);
          setViewingProject(null);
        }}
        footer={[
          <Button key="close" onClick={() => {
            setViewModalOpen(false);
            setViewingProject(null);
          }}>
            Close
          </Button>
        ]}
        width={900}
      >
        {viewingProject && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>ID:</strong> {viewingProject.id}
              </div>
              <div>
                <strong>Title:</strong> {viewingProject.title_en || viewingProject.title || "-"}
              </div>
              <div>
                <strong>Title (AR):</strong> {viewingProject.title_ar || "-"}
              </div>
              <div>
                <strong>Title (FR):</strong> {viewingProject.title_fr || "-"}
              </div>
              <div>
                <strong>Subtitle:</strong> {viewingProject.subtitle_en || viewingProject.subtitle || "-"}
              </div>
              <div>
                <strong>Subtitle (AR):</strong> {viewingProject.subtitle_ar || "-"}
              </div>
              <div>
                <strong>Subtitle (FR):</strong> {viewingProject.subtitle_fr || "-"}
              </div>
              <div>
                <strong>Reach:</strong> {viewingProject.reach || "-"}
              </div>
              <div>
                <strong>Views:</strong> {viewingProject.views || "-"}
              </div>
              <div>
                <strong>Engagement Rate:</strong> {viewingProject.engagement_rate || "-"}%
              </div>
            </div>
            
            <div>
              <strong>Objective (EN):</strong>
              <p className="mt-1">{viewingProject.objective_en || viewingProject.objective || "-"}</p>
            </div>
            <div>
              <strong>Objective (AR):</strong>
              <p className="mt-1">{viewingProject.objective_ar || "-"}</p>
            </div>
            <div>
              <strong>Objective (FR):</strong>
              <p className="mt-1">{viewingProject.objective_fr || "-"}</p>
            </div>
            
            <div>
              <strong>Brief (EN):</strong>
              <p className="mt-1">{viewingProject.brief_en || viewingProject.brief || "-"}</p>
            </div>
            <div>
              <strong>Brief (AR):</strong>
              <p className="mt-1">{viewingProject.brief_ar || "-"}</p>
            </div>
            <div>
              <strong>Brief (FR):</strong>
              <p className="mt-1">{viewingProject.brief_fr || "-"}</p>
            </div>
            
            <div>
              <strong>Strategy (EN):</strong>
              <p className="mt-1">{viewingProject.strategy_en || viewingProject.strategy || "-"}</p>
            </div>
            <div>
              <strong>Strategy (AR):</strong>
              <p className="mt-1">{viewingProject.strategy_ar || "-"}</p>
            </div>
            <div>
              <strong>Strategy (FR):</strong>
              <p className="mt-1">{viewingProject.strategy_fr || "-"}</p>
            </div>

            {viewingProject.logo && (
              <div>
                <strong>Logo:</strong>
                <div className="mt-2">
                  <Image
                    src={viewingProject.logo}
                    width={100}
                    height={100}
                    style={{ objectFit: "cover" }}
                    preview={{ mask: "Preview" }}
                  />
                </div>
              </div>
            )}

            {Array.isArray(viewingProject.images) && viewingProject.images.length > 0 && (
              <div>
                <strong>Images:</strong>
                <div className="mt-2">
                  <Space size={[8, 8]} wrap>
                    {viewingProject.images.map((img, index) => (
                      <Image
                        key={img || index}
                        src={img}
                        width={100}
                        height={100}
                        style={{ objectFit: "cover" }}
                        preview={{ mask: "Preview" }}
                      />
                    ))}
                  </Space>
                </div>
              </div>
            )}

            {Array.isArray(viewingProject.videos) && viewingProject.videos.length > 0 && (
              <div>
                <strong>Videos:</strong>
                <div className="mt-2">
                  <Space size={[8, 8]} wrap direction="vertical">
                    {viewingProject.videos.map((video, index) => (
                      <video
                        key={video || index}
                        src={video}
                        controls
                        style={{ maxWidth: "100%", maxHeight: "300px" }}
                      />
                    ))}
                  </Space>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <strong>Created At:</strong> {new Date(viewingProject.created_at).toLocaleString()}
              </div>
              <div>
                <strong>Updated At:</strong> {new Date(viewingProject.updated_at).toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

const ProjectForm = ({
  form,
  logoFileList,
  onLogoChange,
  imagesFileList,
  onImagesChange,
  videosFileList,
  onVideosChange,
  isEdit = false,
}) => {
  return (
    <Form form={form} layout="vertical">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Form.Item
          name="title_en"
          label="Title (EN)"
          rules={isEdit ? [] : [{ required: true, message: "Title is required" }]}
        >
          <Input placeholder="Enter English title" />
        </Form.Item>
        <Form.Item
          name="subtitle_en"
          label="Subtitle (EN)"
          rules={isEdit ? [] : [{ required: true, message: "Subtitle is required" }]}
        >
          <Input placeholder="Enter English subtitle" />
        </Form.Item>
        <Form.Item
          name="objective_en"
          label="Objective (EN)"
          rules={isEdit ? [] : [{ required: true, message: "Objective is required" }]}
        >
          <Input placeholder="Enter English objective" />
        </Form.Item>
        <Form.Item
          name="brief_en"
          label="Brief (EN)"
        >
          <Input.TextArea rows={3} placeholder="Enter English brief" />
        </Form.Item>
        <Form.Item
          name="strategy_en"
          label="Strategy (EN)"
        >
          <Input.TextArea rows={3} placeholder="Enter English strategy" />
        </Form.Item>
        <Form.Item
          name="reach"
          label="Reach"
          rules={isEdit ? [] : [{ required: true, message: "Reach is required" }]}
        >
          <InputNumber style={{ width: "100%" }} min={0} />
        </Form.Item>
        <Form.Item
          name="views"
          label="Views"
          rules={isEdit ? [] : [{ required: true, message: "Views are required" }]}
        >
          <InputNumber style={{ width: "100%" }} min={0} />
        </Form.Item>
        <Form.Item
          name="engagement_rate"
          label="Engagement Rate (%)"
          rules={isEdit ? [] : [{ required: true, message: "Engagement rate is required" }]}
        >
          <InputNumber style={{ width: "100%" }} min={0} max={100} />
        </Form.Item>
      </div>

      <Form.Item label="Main Image" required={!isEdit} tooltip="Upload project Main Image">
        <Upload
          fileList={logoFileList}
          beforeUpload={() => false}
          listType="picture-card"
          maxCount={1}
          accept="image/*"
          onChange={({ fileList }) => onLogoChange(fileList)}
        >
          {logoFileList.length === 0 && (
            <div>
              <UploadOutlined />
              <div style={{ marginTop: 8 }}>Upload Logo</div>
            </div>
          )}
        </Upload>
      </Form.Item>

      <Form.Item
        label="Gallery Images"
        required={!isEdit}
        tooltip="Upload one or more showcase images"
      >
        <Upload
          fileList={imagesFileList}
          beforeUpload={() => false}
          listType="picture-card"
          accept="image/*"
          multiple
          onChange={({ fileList }) => onImagesChange(fileList)}
        >
          <div>
            <UploadOutlined />
            <div style={{ marginTop: 8 }}>Upload Images</div>
          </div>
        </Upload>
      </Form.Item>

      <Form.Item
        label="Videos"
        tooltip="Upload MP4 video files"
      >
        <Upload
          fileList={videosFileList}
          beforeUpload={() => false}
          listType="text"
          accept="video/mp4"
          multiple
          onChange={({ fileList }) => onVideosChange(fileList)}
        >
          <Button icon={<UploadOutlined />}>Upload Videos (MP4)</Button>
        </Upload>
      </Form.Item>
    </Form>
  );
};

export default ShowcaseProjects;
