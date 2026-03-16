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
  Tooltip,
  Upload,
} from "antd";
import {
  ReloadOutlined,
  UploadOutlined,
  PlusOutlined,
  DatabaseOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import { useNewsStore } from "../store/newsStore.js";
import { useTranslateStore } from "../store/translateStore.js";
import RichTextEditor, {
  normalizeDescriptionHtml,
  stripHtml,
  translateHtmlPreservingStructure,
} from "../components/RichTextEditor.jsx";

const LANG_OPTIONS = [
  { label: "English", value: "en" },
  { label: "Arabic", value: "ar" },
  { label: "French", value: "fr" },
];
const NEWS_WRITER_STORAGE_KEY = "news_written_by";

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
  const [detailsViewItem, setDetailsViewItem] = useState(null);
  const [detailsCreateForm] = Form.useForm();
  const [detailsEditForm] = Form.useForm();
  const [detailsCreateImages, setDetailsCreateImages] = useState([]);
  const [detailsEditImages, setDetailsEditImages] = useState([]);
  const [isDetailsImporting, setIsDetailsImporting] = useState(false);
  const [isDetailsTranslating, setIsDetailsTranslating] = useState(false);
  const [isCreateTranslating, setIsCreateTranslating] = useState(false);
  const [isEditTranslating, setIsEditTranslating] = useState(false);
  
  const translateText = useTranslateStore((state) => state.translateText);

  const getStoredWriter = () => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(NEWS_WRITER_STORAGE_KEY) || "";
  };

  const persistWriter = (value) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(NEWS_WRITER_STORAGE_KEY, value || "");
  };

  /** Translate EN fields to AR/FR before sending Blog Details. Description keeps HTML structure. */
  const translateDetailsFields = async ({ title_en, subtitle_en, description_en }) => {
    const out = {
      title_ar: "",
      title_fr: "",
      subtitle_ar: "",
      subtitle_fr: "",
      description_ar: "",
      description_fr: "",
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
    if (description_en && String(description_en).trim()) {
      const { arHtml, frHtml } = await translateHtmlPreservingStructure(
        description_en,
        async (text) => {
          const t = text.trim();
          if (!t) return { ar: "", fr: "" };
          const result = await translateText(t);
          return result ? { ar: result.ar ?? "", fr: result.fr ?? "" } : { ar: "", fr: "" };
        }
      );
      out.description_ar = arHtml;
      out.description_fr = frHtml;
    }
    return out;
  };

  /** Translate EN fields to AR/FR for Blog (card). All plain text. */
  const translateBlogFields = async ({ title_en, subtitle_en, description_en }) => {
    const out = {
      title_ar: "",
      title_fr: "",
      subtitle_ar: "",
      subtitle_fr: "",
      description_ar: "",
      description_fr: "",
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
    await translatePlain(description_en, "description");
    return out;
  };

  useEffect(() => {
    fetchList();
  }, [page, perPage, lang]);

  const resetCreateModal = () => {
    createForm.resetFields();
    createForm.setFieldsValue({ written_by: getStoredWriter() });
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
      setIsCreateTranslating(true);
      const translated = await translateBlogFields({
        title_en: values.title_en,
        subtitle_en: values.subtitle_en,
        description_en: values.description_en,
      });
      setIsCreateTranslating(false);
      const payload = {
        title_en: values.title_en,
        title_ar: translated.title_ar,
        title_fr: translated.title_fr,
        subtitle_en: values.subtitle_en,
        subtitle_ar: translated.subtitle_ar,
        subtitle_fr: translated.subtitle_fr,
        description_en: values.description_en,
        description_ar: translated.description_ar,
        description_fr: translated.description_fr,
        focus_keyword: values.focus_keyword,
        written_by: values.written_by,
      };
      if (createImage[0]?.originFileObj) {
        payload.image = createImage[0].originFileObj;
      }
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

  const handleEditOpen = (record) => {
    setEditingId(record.id);
    editForm.setFieldsValue({
      title_en: record.title_en || record.title || "",
      subtitle_en: record.subtitle_en || record.subtitle || "",
      description_en: record.description_en || record.description || "",
      focus_keyword: record.focus_keyword || "",
      written_by: record.written_by || getStoredWriter(),
    });
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    try {
      const values = await editForm.validateFields();
      setIsEditTranslating(true);
      const translated = await translateBlogFields({
        title_en: values.title_en,
        subtitle_en: values.subtitle_en,
        description_en: values.description_en,
      });
      setIsEditTranslating(false);
      const payload = {
        title_en: values.title_en,
        title_ar: translated.title_ar,
        title_fr: translated.title_fr,
        subtitle_en: values.subtitle_en,
        subtitle_ar: translated.subtitle_ar,
        subtitle_fr: translated.subtitle_fr,
        description_en: values.description_en,
        description_ar: translated.description_ar,
        description_fr: translated.description_fr,
        focus_keyword: values.focus_keyword,
        written_by: values.written_by,
      };
      if (editImage[0]?.originFileObj) {
        payload.image = editImage[0].originFileObj;
      }
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
        render: (text) => (
          <Tooltip title={text || ""}>
            <span className="block max-w-[150px] truncate">
              {text || "-"}
            </span>
          </Tooltip>
        ),
      },
      {
        title: "Subtitle",
        dataIndex: "subtitle",
        key: "subtitle",
        render: (text) => (
          <Tooltip title={text || ""}>
            <span className="block max-w-[150px] truncate">
              {text || "-"}
            </span>
          </Tooltip>
        ),
      },
      {
        title: "Description",
        dataIndex: "description",
        key: "description",
        width: 300,
        render: (text) => (
          <Tooltip title={text || ""}>
            <span className="block max-w-[220px] truncate">
              {text || "-"}
            </span>
          </Tooltip>
        ),
      },
      {
        title: "Focus Keyword",
        dataIndex: "focus_keyword",
        key: "focus_keyword",
        width: 220,
        render: (value) => (
          <Tooltip title={value || ""}>
            <span className="block max-w-[160px] truncate">
              {value || "-"}
            </span>
          </Tooltip>
        ),
      },
      {
        title: "Written By",
        dataIndex: "written_by",
        key: "written_by",
        width: 180,
        render: (value) => (
          <Tooltip title={value || ""}>
            <span className="block max-w-[140px] truncate">
              {value || "-"}
            </span>
          </Tooltip>
        ),
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
        confirmLoading={isLoading || isCreateTranslating}
      >
        <Form form={createForm} layout="vertical">
          <div className="space-y-6">
            <Form.Item
              name="title_en"
              label="Title (EN)"
              rules={[{ required: true, message: "Title is required" }]}
            >
              <Input placeholder="Enter English title" />
            </Form.Item>
            <Form.Item
              name="subtitle_en"
              label="Subtitle (EN)"
              rules={[{ required: true, message: "Subtitle is required" }]}
            >
              <Input placeholder="Enter English subtitle" />
            </Form.Item>
            <Form.Item
              name="description_en"
              label="Description (EN)"
              rules={[{ required: true, message: "Description is required" }]}
            >
              <Input.TextArea
                rows={3}
                placeholder="Enter English description"
              />
            </Form.Item>
            <Form.Item
              name="focus_keyword"
              label="Focus Keyword"
              rules={[{ required: true, message: "Focus keyword is required" }]}
            >
              <Input placeholder="Enter focus keyword" />
            </Form.Item>
            <Form.Item
              name="written_by"
              label="Written By"
              rules={[{ required: true, message: "Writer is required" }]}
            >
              <Input
                placeholder="Enter writer name"
                onChange={(e) => persistWriter(e.target.value)}
              />
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
        title="Update Blog"
        open={isEditOpen}
        onCancel={() => {
          setIsEditOpen(false);
          resetEditModal();
        }}
        onOk={handleUpdate}
        okText="Update"
        confirmLoading={isLoading || isEditTranslating}
      >
        <Form form={editForm} layout="vertical">
          <div className="space-y-6">
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
            <Form.Item name="focus_keyword" label="Focus Keyword">
              <Input placeholder="Enter focus keyword" />
            </Form.Item>
            <Form.Item name="written_by" label="Written By">
              <Input
                placeholder="Enter writer name"
                onChange={(e) => persistWriter(e.target.value)}
              />
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

      <Modal
        title="Blog Details"
        open={isDetailsModalOpen}
        onCancel={() => {
          setIsDetailsModalOpen(false);
          setSelectedNewsId(null);
          setSelectedNewsSlug(null);
          setDetailsViewItem(null);
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
                width: 180,
                render: (record) => (
                  <Space>
                    <Button
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() => setDetailsViewItem(record)}
                    />
                    <Button
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => {
                        setEditingDetailsId(record.id);
                        detailsEditForm.setFieldsValue({
                          title_en: record.title_en || record.title || "",
                          subtitle_en: record.subtitle_en || record.subtitle || "",
                          description_en: record.description_en || record.description || "",
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
        title="View Blog Detail"
        open={!!detailsViewItem}
        onCancel={() => setDetailsViewItem(null)}
        footer={
          <Button type="primary" onClick={() => setDetailsViewItem(null)}>
            Close
          </Button>
        }
        width={640}
      >
        {detailsViewItem && (() => {
          const titleByLang =
            lang === "en"
              ? detailsViewItem.title_en ?? detailsViewItem.title
              : lang === "ar"
                ? detailsViewItem.title_ar ?? detailsViewItem.title
                : detailsViewItem.title_fr ?? detailsViewItem.title;
          const subtitleByLang =
            lang === "en"
              ? detailsViewItem.subtitle_en ?? detailsViewItem.subtitle
              : lang === "ar"
                ? detailsViewItem.subtitle_ar ?? detailsViewItem.subtitle
                : detailsViewItem.subtitle_fr ?? detailsViewItem.subtitle;
          const descriptionByLang =
            lang === "en"
              ? detailsViewItem.description_en ?? detailsViewItem.description
              : lang === "ar"
                ? detailsViewItem.description_ar ?? detailsViewItem.description
                : detailsViewItem.description_fr ?? detailsViewItem.description;
          return (
            <div className="space-y-5">
              <div>
                <span className="text-gray-500 font-medium">ID</span>
                <div className="mt-1">{detailsViewItem.id}</div>
              </div>
              <div>
                <span className="text-gray-500 text-sm">Title</span>
                <div className="mt-0.5">{titleByLang || "-"}</div>
              </div>
              <div>
                <span className="text-gray-500 text-sm">Subtitle</span>
                <div className="mt-0.5">{subtitleByLang || "-"}</div>
              </div>
              <div>
                <span className="text-gray-500 text-sm">Description</span>
                <div
                  className="news-detail-view-description mt-1 min-h-[1em]"
                  dangerouslySetInnerHTML={{ __html: descriptionByLang || "" }}
                />
              </div>
              <div>
                <span className="text-gray-500 font-medium">Images</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {detailsViewItem.images &&
                  Array.isArray(detailsViewItem.images) &&
                  detailsViewItem.images.length > 0 ? (
                    detailsViewItem.images.map((img, idx) => (
                      <Image
                        key={idx}
                        src={img}
                        width={120}
                        height={120}
                        style={{ objectFit: "cover" }}
                        className="rounded"
                        preview={{ mask: "Preview" }}
                      />
                    ))
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
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
            setIsDetailsTranslating(true);
            const translated = await translateDetailsFields({
              title_en: values.title_en,
              subtitle_en: values.subtitle_en,
              description_en: values.description_en,
            });
            setIsDetailsTranslating(false);
            const payload = {
              title_en: values.title_en,
              title_ar: translated.title_ar,
              title_fr: translated.title_fr,
              subtitle_en: values.subtitle_en,
              subtitle_ar: translated.subtitle_ar,
              subtitle_fr: translated.subtitle_fr,
              description_en: normalizeDescriptionHtml(values.description_en),
              description_ar: normalizeDescriptionHtml(translated.description_ar),
              description_fr: normalizeDescriptionHtml(translated.description_fr),
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
            setIsDetailsTranslating(false);
            if (error?.response?.data?.message) {
              toast.error(error.response.data.message);
            } else if (error?.message) {
              toast.error(error.message);
            }
          }
        }}
        okText="Create"
        confirmLoading={isLoading || isDetailsTranslating}
      >
        <Form form={detailsCreateForm} layout="vertical">
          <div className="space-y-6">
            <Form.Item
              name="title_en"
              label="Title (EN)"
              rules={[{ required: true, message: "Title is required" }]}
            >
              <Input placeholder="Enter English title" />
            </Form.Item>
            <Form.Item
              name="subtitle_en"
              label="Subtitle (EN)"
              rules={[{ required: true, message: "Subtitle is required" }]}
            >
              <Input placeholder="Enter English subtitle" />
            </Form.Item>
            <Form.Item
              name="description_en"
              label="Description (EN)"
              rules={[{ required: true, message: "Description is required" }]}
            >
              <RichTextEditor placeholder="Enter English description" />
            </Form.Item>
          </div>
          <Form.Item label="Images" className="news-details-upload-section">
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
            setIsDetailsTranslating(true);
            const translated = await translateDetailsFields({
              title_en: values.title_en,
              subtitle_en: values.subtitle_en,
              description_en: values.description_en,
            });
            setIsDetailsTranslating(false);
            const payload = {
              title_en: values.title_en,
              title_ar: translated.title_ar,
              title_fr: translated.title_fr,
              subtitle_en: values.subtitle_en,
              subtitle_ar: translated.subtitle_ar,
              subtitle_fr: translated.subtitle_fr,
              description_en: normalizeDescriptionHtml(values.description_en),
              description_ar: normalizeDescriptionHtml(translated.description_ar),
              description_fr: normalizeDescriptionHtml(translated.description_fr),
            };
            if (detailsEditImages.length > 0) {
              const newImages = detailsEditImages
                .map((img) => img.originFileObj)
                .filter(Boolean);
              if (newImages.length > 0) payload.images = newImages;
            }
            await updateNewsDetails(editingDetailsId, payload, selectedNewsSlug);
            setIsDetailsEditOpen(false);
            detailsEditForm.resetFields();
            setDetailsEditImages([]);
            setEditingDetailsId(null);
          } catch (error) {
            setIsDetailsTranslating(false);
            if (error?.response?.data?.message) {
              toast.error(error.response.data.message);
            } else if (error?.message) {
              toast.error(error.message);
            }
          }
        }}
        okText="Update"
        confirmLoading={isLoading || isDetailsTranslating}
      >
        <Form form={detailsEditForm} layout="vertical">
          <div className="space-y-6">
            <Form.Item name="title_en" label="Title (EN)">
              <Input placeholder="Enter English title" />
            </Form.Item>
            <Form.Item name="subtitle_en" label="Subtitle (EN)">
              <Input placeholder="Enter English subtitle" />
            </Form.Item>
            <Form.Item name="description_en" label="Description (EN)">
              <RichTextEditor placeholder="Enter English description" />
            </Form.Item>
          </div>
          <Form.Item label="Images" className="news-details-upload-section">
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
