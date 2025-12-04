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
} from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import { useShowcaseProjectsStore } from "../store/showcaseProjectsStore.js";

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
  } = useShowcaseProjectsStore();

  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [logoFileList, setLogoFileList] = useState([]);
  const [imagesFileList, setImagesFileList] = useState([]);
  const [editLogoFileList, setEditLogoFileList] = useState([]);
  const [editImagesFileList, setEditImagesFileList] = useState([]);

  useEffect(() => {
    fetchList();
  }, [page, perPage, lang]);

  const resetCreateModal = () => {
    createForm.resetFields();
    setLogoFileList([]);
    setImagesFileList([]);
  };

  const resetEditModal = () => {
    editForm.resetFields();
    setEditLogoFileList([]);
    setEditImagesFileList([]);
    setEditingId(null);
  };

  const buildPayload = (values, logoList, imagesList) => {
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
    return payload;
  };

  const handleCreate = async () => {
    try {
      const values = await createForm.validateFields();
      const payload = buildPayload(values, logoFileList, imagesFileList);
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
      const values = await editForm.validateFields();
      const payload = buildPayload(
        values,
        editLogoFileList,
        editImagesFileList
      );
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
        render: (value, record) => value || record.brief || "-",
      },
      {
        title: "Strategy",
        dataIndex: "strategy_en",
        key: "strategy_en",
        render: (value, record) => value || record.strategy || "-",
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
        title: "Logo",
        dataIndex: "logo",
        key: "logo",
        width: 120,
        render: (value) =>
          value ? (
            <Image
              src={value}
              width={48}
              height={48}
              style={{ objectFit: "cover" }}
              preview={{ mask: "Preview" }}
            />
          ) : (
            "-"
          ),
      },
      {
        title: "Images",
        dataIndex: "media",
        key: "media",
        render: (value, record) => {
          const imgs =
            (Array.isArray(value) && value.length > 0
              ? value
              : Array.isArray(record?.images) && record.images.length > 0
              ? record.images
              : Array.isArray(record?.media)
              ? record.media
              : []) || [];

          return imgs.length > 0 ? (
            <Space size={[8, 8]} wrap>
              {imgs.map((img) => (
                <Image
                  key={img}
                  src={img}
                  width={48}
                  height={48}
                  style={{ objectFit: "cover" }}
                  preview={{ mask: "Preview" }}
                />
              ))}
            </Space>
          ) : (
            "-"
          );
        },
      },
      {
        title: "Actions",
        key: "actions",
        width: 220,
        render: (record) => (
          <Space>
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
    [remove]
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
        confirmLoading={isLoading}
        width={900}
      >
        <ProjectForm
          form={createForm}
          logoFileList={logoFileList}
          onLogoChange={setLogoFileList}
          imagesFileList={imagesFileList}
          onImagesChange={setImagesFileList}
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
        confirmLoading={isLoading}
        width={900}
      >
        <ProjectForm
          form={editForm}
          logoFileList={editLogoFileList}
          onLogoChange={setEditLogoFileList}
          imagesFileList={editImagesFileList}
          onImagesChange={setEditImagesFileList}
          isEdit
        />
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
          name="title_ar"
          label="Title (AR)"
          rules={isEdit ? [] : [{ required: true, message: "Title is required" }]}
        >
          <Input placeholder="Enter Arabic title" />
        </Form.Item>
        <Form.Item
          name="title_fr"
          label="Title (FR)"
          rules={isEdit ? [] : [{ required: true, message: "Title is required" }]}
        >
          <Input placeholder="Enter French title" />
        </Form.Item>
        <Form.Item
          name="subtitle_en"
          label="Subtitle (EN)"
          rules={isEdit ? [] : [{ required: true, message: "Subtitle is required" }]}
        >
          <Input placeholder="Enter English subtitle" />
        </Form.Item>
        <Form.Item
          name="subtitle_ar"
          label="Subtitle (AR)"
          rules={isEdit ? [] : [{ required: true, message: "Subtitle is required" }]}
        >
          <Input placeholder="Enter Arabic subtitle" />
        </Form.Item>
        <Form.Item
          name="subtitle_fr"
          label="Subtitle (FR)"
          rules={isEdit ? [] : [{ required: true, message: "Subtitle is required" }]}
        >
          <Input placeholder="Enter French subtitle" />
        </Form.Item>
        <Form.Item
          name="objective_en"
          label="Objective (EN)"
          rules={isEdit ? [] : [{ required: true, message: "Objective is required" }]}
        >
          <Input placeholder="Enter English objective" />
        </Form.Item>
        <Form.Item
          name="objective_ar"
          label="Objective (AR)"
          rules={isEdit ? [] : [{ required: true, message: "Objective is required" }]}
        >
          <Input placeholder="Enter Arabic objective" />
        </Form.Item>
        <Form.Item
          name="objective_fr"
          label="Objective (FR)"
          rules={isEdit ? [] : [{ required: true, message: "Objective is required" }]}
        >
          <Input placeholder="Enter French objective" />
        </Form.Item>
        <Form.Item
          name="brief_en"
          label="Brief (EN)"
        >
          <Input.TextArea rows={3} placeholder="Enter English brief" />
        </Form.Item>
        <Form.Item
          name="brief_ar"
          label="Brief (AR)"
        >
          <Input.TextArea rows={3} placeholder="Enter Arabic brief" />
        </Form.Item>
        <Form.Item
          name="brief_fr"
          label="Brief (FR)"
        >
          <Input.TextArea rows={3} placeholder="Enter French brief" />
        </Form.Item>
        <Form.Item
          name="strategy_en"
          label="Strategy (EN)"
        >
          <Input.TextArea rows={3} placeholder="Enter English strategy" />
        </Form.Item>
        <Form.Item
          name="strategy_ar"
          label="Strategy (AR)"
        >
          <Input.TextArea rows={3} placeholder="Enter Arabic strategy" />
        </Form.Item>
        <Form.Item
          name="strategy_fr"
          label="Strategy (FR)"
        >
          <Input.TextArea rows={3} placeholder="Enter French strategy" />
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

      <Form.Item label="Logo" required={!isEdit} tooltip="Upload project logo">
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
    </Form>
  );
};

export default ShowcaseProjects;
