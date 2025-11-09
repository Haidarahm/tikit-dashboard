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
} from "@ant-design/icons";
import { toast } from "react-toastify";
import { useNewsStore } from "../store/newsStore.js";

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
  } = useNewsStore();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [createImage, setCreateImage] = useState([]);
  const [editImage, setEditImage] = useState([]);
  const [editingId, setEditingId] = useState(null);

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
        payload.images = createImage[0].originFileObj;
      }
      await create(payload);
      toast.success("News card created successfully");
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
      title_en: record.title_en || "",
      title_ar: record.title_ar || "",
      title_fr: record.title_fr || "",
      subtitle_en: record.subtitle_en || "",
      subtitle_ar: record.subtitle_ar || "",
      subtitle_fr: record.subtitle_fr || "",
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
        payload.images = editImage[0].originFileObj;
      }
      await update(editingId, payload);
      toast.success("News card updated successfully");
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
        title: "Image",
        dataIndex: "images",
        key: "images",
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
            <Button onClick={() => handleEditOpen(record)}>Update</Button>
            <Popconfirm
              title="Delete this news card?"
              okText="Yes"
              cancelText="No"
              onConfirm={async () => {
                try {
                  await remove(record.id);
                  toast.success("News card deleted successfully");
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
          <h2 className="text-2xl font-semibold">Blogs / News</h2>
          <p className="text-gray-600">
            Manage news cards including localized titles, subtitles, and images.
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
            Add News
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
        title="Add News"
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        title="Update News"
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="title_en"
              label="Title (EN)"
            >
              <Input placeholder="Enter English title" />
            </Form.Item>
            <Form.Item
              name="title_ar"
              label="Title (AR)"
            >
              <Input placeholder="Enter Arabic title" />
            </Form.Item>
            <Form.Item
              name="title_fr"
              label="Title (FR)"
            >
              <Input placeholder="Enter French title" />
            </Form.Item>
            <Form.Item
              name="subtitle_en"
              label="Subtitle (EN)"
            >
              <Input placeholder="Enter English subtitle" />
            </Form.Item>
            <Form.Item
              name="subtitle_ar"
              label="Subtitle (AR)"
            >
              <Input placeholder="Enter Arabic subtitle" />
            </Form.Item>
            <Form.Item
              name="subtitle_fr"
              label="Subtitle (FR)"
            >
              <Input placeholder="Enter French subtitle" />
            </Form.Item>
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
    </div>
  );
}

export default News;
