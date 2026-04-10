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
  Tooltip,
  Select,
  Switch,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  EyeOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import { useInfluencersItemsStore } from "../../../store/works/influencersItemsStore.js";
import { useTranslateStore } from "../../../store/translateStore.js";
import ExcelImportButton from "../../../components/work/ExcelImportButton.jsx";
import { LANG_OPTIONS } from "../../../constants/language.js";

const EMPTY_INFLUENCER_TRANSLATION = {
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
  approach_ar: "",
  approach_fr: "",
};

const InfluenceItems = () => {
  const { slug } = useParams();
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
    setSlug,
    create,
    update,
    remove,
    importExcel: importInfluencersExcel,
    workId,
  } = useInfluencersItemsStore();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addForm] = Form.useForm();
  const [imageFileList, setImageFileList] = useState([]);
  const [logoFileList, setLogoFileList] = useState([]);
  const [reelsFileList, setReelsFileList] = useState([]);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm] = Form.useForm();
  const [editImageFileList, setEditImageFileList] = useState([]);
  const [editLogoFileList, setEditLogoFileList] = useState([]);
  const [editReelsFileList, setEditReelsFileList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [viewModal, setViewModal] = useState({
    open: false,
    item: null,
  });
  const [isCreateTranslating, setIsCreateTranslating] = useState(false);
  const [isEditTranslating, setIsEditTranslating] = useState(false);
  const [autoTranslateCreate, setAutoTranslateCreate] = useState(true);
  const [autoTranslateEdit, setAutoTranslateEdit] = useState(true);

  const translateText = useTranslateStore((state) => state.translateText);

  /** Translate EN fields to AR/FR for Influencer item (plain text). */
  const translateInfluencerFields = async ({
    title_en,
    subtitle_en,
    objective_en,
    brief_en,
    strategy_en,
    approach_en,
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
      approach_ar: "",
      approach_fr: "",
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
    await translatePlain(approach_en, "approach");
    return out;
  };

  useEffect(() => {
    if (slug) {
      setSlug(slug);
      fetchList(slug);
    }
  }, [slug, page, perPage, lang]);

  const handleAdd = async () => {
    try {
      await addForm.validateFields();
      const values = addForm.getFieldsValue(true);
      let translated = { ...EMPTY_INFLUENCER_TRANSLATION };
      if (autoTranslateCreate) {
        setIsCreateTranslating(true);
        translated = await translateInfluencerFields({
          title_en: values.title_en,
          subtitle_en: values.subtitle_en,
          objective_en: values.objective_en,
          brief_en: values.brief_en,
          strategy_en: values.strategy_en,
          approach_en: values.approach_en,
        });
        setIsCreateTranslating(false);
      }
      const payload = {
        work_id: workId,
        title_en: values.title_en,
        subtitle_en: values.subtitle_en,
        brief_en: values.brief_en,
        strategy_en: values.strategy_en,
        approach_en: values.approach_en,
        reach: values.reach,
        views: values.views,
        objective_en: values.objective_en,
        engagement_rate: values.engagement_rate,
        images: imageFileList
          .map((file) => file.originFileObj)
          .filter((file) => file),
        reels: reelsFileList
          .map((file) => file.originFileObj)
          .filter((file) => file),
      };
      if (autoTranslateCreate) {
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
        payload.approach_ar = translated.approach_ar;
        payload.approach_fr = translated.approach_fr;
      } else {
        payload.title_ar = values.title_ar;
        payload.title_fr = values.title_fr;
        payload.subtitle_ar = values.subtitle_ar;
        payload.subtitle_fr = values.subtitle_fr;
        payload.objective_ar = values.objective_ar;
        payload.objective_fr = values.objective_fr;
        payload.brief_ar = values.brief_ar;
        payload.brief_fr = values.brief_fr;
        payload.strategy_ar = values.strategy_ar;
        payload.strategy_fr = values.strategy_fr;
        payload.approach_ar = values.approach_ar;
        payload.approach_fr = values.approach_fr;
      }

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
      setAutoTranslateCreate(true);
      addForm.resetFields();
      setImageFileList([]);
      setLogoFileList([]);
      setReelsFileList([]);
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
      let translated = { ...EMPTY_INFLUENCER_TRANSLATION };
      if (autoTranslateEdit) {
        setIsEditTranslating(true);
        translated = await translateInfluencerFields({
          title_en: values.title_en,
          subtitle_en: values.subtitle_en,
          objective_en: values.objective_en,
          brief_en: values.brief_en,
          strategy_en: values.strategy_en,
          approach_en: values.approach_en,
        });
        setIsEditTranslating(false);
      }
      const payload = {
        title_en: values.title_en,
        subtitle_en: values.subtitle_en,
        objective_en: values.objective_en,
        brief_en: values.brief_en,
        strategy_en: values.strategy_en,
        approach_en: values.approach_en,
      };
      if (autoTranslateEdit) {
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
        payload.approach_ar = translated.approach_ar;
        payload.approach_fr = translated.approach_fr;
      } else {
        payload.title_ar = values.title_ar;
        payload.title_fr = values.title_fr;
        payload.subtitle_ar = values.subtitle_ar;
        payload.subtitle_fr = values.subtitle_fr;
        payload.objective_ar = values.objective_ar;
        payload.objective_fr = values.objective_fr;
        payload.brief_ar = values.brief_ar;
        payload.brief_fr = values.brief_fr;
        payload.strategy_ar = values.strategy_ar;
        payload.strategy_fr = values.strategy_fr;
        payload.approach_ar = values.approach_ar;
        payload.approach_fr = values.approach_fr;
      }
      if (values.reach != null) payload.reach = values.reach;
      if (values.views != null) payload.views = values.views;
      if (values.engagement_rate != null) {
        payload.engagement_rate = values.engagement_rate;
      }

      const newImages = editImageFileList
        .map((file) => file.originFileObj)
        .filter((file) => file);
      if (newImages.length > 0) {
        payload.images = newImages;
      }

      if (editLogoFileList[0]?.originFileObj) {
        payload.logo = editLogoFileList[0].originFileObj;
      }

      const newReels = editReelsFileList
        .map((file) => file.originFileObj)
        .filter((file) => file);
      if (newReels.length > 0) {
        payload.reels = newReels;
      }

      await update(editingId, payload);
      setIsEditOpen(false);
      setAutoTranslateEdit(true);
      editForm.resetFields();
      setEditImageFileList([]);
      setEditLogoFileList([]);
      setEditReelsFileList([]);
      setEditingId(null);
    } catch (err) {
      setIsEditTranslating(false);
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
    setEditingId(item.id);
    setAutoTranslateEdit(true);
    setIsEditOpen(true);
    editForm.setFieldsValue({
      title_en: item.title_en || "",
      title_ar: item.title_ar || "",
      title_fr: item.title_fr || "",
      subtitle_en: item.subtitle_en || "",
      subtitle_ar: item.subtitle_ar || "",
      subtitle_fr: item.subtitle_fr || "",
      reach: item.reach || 0,
      views: item.views || 0,
      objective_en: item.objective_en || "",
      objective_ar: item.objective_ar || "",
      objective_fr: item.objective_fr || "",
      engagement_rate: item.engagement_rate || 0,
      brief_en: item.brief_en || "",
      brief_ar: item.brief_ar || "",
      brief_fr: item.brief_fr || "",
      strategy_en: item.strategy_en || "",
      strategy_ar: item.strategy_ar || "",
      strategy_fr: item.strategy_fr || "",
      approach_en: item.approach_en || "",
      approach_ar: item.approach_ar || "",
      approach_fr: item.approach_fr || "",
    });
    setEditImageFileList([]);
    setEditLogoFileList([]);
    setEditReelsFileList([]);
  };

  const openViewModal = (item) => {
    setViewModal({
      open: true,
      item: item,
    });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Influencer Items</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Language:</span>
            <Select
              value={lang}
              style={{ width: 140 }}
              options={LANG_OPTIONS}
              onChange={(value) => {
                setLang(value);
                setPage(1);
              }}
            />
          </div>
          <ExcelImportButton
            disabled={!slug}
            className="flex items-center"
            onImport={importInfluencersExcel}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setAutoTranslateCreate(true);
              setIsAddOpen(true);
            }}
          >
            Add Item
          </Button>
        </div>
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
              return (
                <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
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
                          {item.logo ? (
                            <Image
                              src={item.logo}
                              alt={item.title}
                              className="w-full h-full object-contain p-4"
                              preview={false}
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
                      </div>
                    }
                    actions={[
                      <Tooltip title="View Details" key="view">
                        <Button
                          type="text"
                          icon={<EyeOutlined />}
                          onClick={() => openViewModal(item)}
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
                        onConfirm={() => handleDelete(item.id)}
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
                      <h3 className="font-bold text-base text-gray-900 line-clamp-2 mb-2 min-w-0 break-words text-center">
                        {item.title || "No Title"}
                      </h3>
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
          setAutoTranslateCreate(true);
          addForm.resetFields();
          setImageFileList([]);
          setLogoFileList([]);
          setReelsFileList([]);
        }}
        onOk={handleAdd}
        confirmLoading={
          isLoading || (autoTranslateCreate && isCreateTranslating)
        }
        okText="Create"
        width={900}
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
          <div className="space-y-4">
            <div className="rounded-md border border-gray-200 p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Content Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item
                  name="title_en"
                  label="Title (EN)"
                  rules={[{ required: true }]}
                  className="md:col-span-2"
                >
                  <Input placeholder="Enter English title" />
                </Form.Item>
                <Form.Item name="subtitle_en" label="Subtitle (EN)" className="md:col-span-2">
                  <Input placeholder="Enter English subtitle" />
                </Form.Item>

                <Form.Item
                  name="objective_en"
                  label="Objective (EN)"
                  rules={[{ required: true }]}
                >
                  <Input.TextArea rows={2} placeholder="Enter English objective" />
                </Form.Item>

                <Form.Item name="brief_en" label="Brief (EN)">
                  <Input.TextArea rows={2} placeholder="Enter English brief" />
                </Form.Item>

                <Form.Item name="strategy_en" label="Strategy (EN)" className="md:col-span-2">
                  <Input.TextArea rows={2} placeholder="Enter English strategy" />
                </Form.Item>
                <Form.Item name="approach_en" label="Approach (EN)" className="md:col-span-2">
                  <Input.TextArea rows={2} placeholder="Enter English approach" />
                </Form.Item>
                {!autoTranslateCreate && (
                  <>
                    <Form.Item name="title_ar" label="Title (AR)" className="md:col-span-2">
                      <Input placeholder="Enter Arabic title" />
                    </Form.Item>
                    <Form.Item name="title_fr" label="Title (FR)" className="md:col-span-2">
                      <Input placeholder="Enter French title" />
                    </Form.Item>
                    <Form.Item name="subtitle_ar" label="Subtitle (AR)" className="md:col-span-2">
                      <Input placeholder="Enter Arabic subtitle" />
                    </Form.Item>
                    <Form.Item name="subtitle_fr" label="Subtitle (FR)" className="md:col-span-2">
                      <Input placeholder="Enter French subtitle" />
                    </Form.Item>
                    <Form.Item name="objective_ar" label="Objective (AR)">
                      <Input.TextArea rows={2} placeholder="Enter Arabic objective" />
                    </Form.Item>
                    <Form.Item name="objective_fr" label="Objective (FR)">
                      <Input.TextArea rows={2} placeholder="Enter French objective" />
                    </Form.Item>
                    <Form.Item name="brief_ar" label="Brief (AR)">
                      <Input.TextArea rows={2} placeholder="Enter Arabic brief" />
                    </Form.Item>
                    <Form.Item name="brief_fr" label="Brief (FR)">
                      <Input.TextArea rows={2} placeholder="Enter French brief" />
                    </Form.Item>
                    <Form.Item name="strategy_ar" label="Strategy (AR)" className="md:col-span-2">
                      <Input.TextArea rows={2} placeholder="Enter Arabic strategy" />
                    </Form.Item>
                    <Form.Item name="strategy_fr" label="Strategy (FR)" className="md:col-span-2">
                      <Input.TextArea rows={2} placeholder="Enter French strategy" />
                    </Form.Item>
                    <Form.Item name="approach_ar" label="Approach (AR)" className="md:col-span-2">
                      <Input.TextArea rows={2} placeholder="Enter Arabic approach" />
                    </Form.Item>
                    <Form.Item name="approach_fr" label="Approach (FR)" className="md:col-span-2">
                      <Input.TextArea rows={2} placeholder="Enter French approach" />
                    </Form.Item>
                  </>
                )}
              </div>
            </div>

            <div className="rounded-md border border-gray-200 p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Performance Metrics
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Form.Item
                  name="reach"
                  label="Reach"
                  rules={[{ required: true, type: "number", min: 0 }]}
                >
                  <InputNumber
                    placeholder="Reach"
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
                    placeholder="Views"
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
                    placeholder="%"
                    className="w-full"
                    min={0}
                    max={100}
                    step={0.01}
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          <Form.Item label="Upload Logo / Main Image" required>
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

          <Form.Item label="Upload Reels (Videos) (optional)">
            <Upload
              fileList={reelsFileList}
              beforeUpload={() => false}
              listType="text"
              accept="video/*"
              multiple
              onChange={({ fileList }) => setReelsFileList(fileList)}
            >
              <Button icon={<UploadOutlined />}>Upload Videos</Button>
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
          setAutoTranslateEdit(true);
          editForm.resetFields();
          setEditImageFileList([]);
          setEditLogoFileList([]);
          setEditReelsFileList([]);
          setEditingId(null);
        }}
        onOk={handleEdit}
        confirmLoading={isLoading || (autoTranslateEdit && isEditTranslating)}
        okText="Update"
        width={900}
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
          <div className="space-y-4">
            <div className="rounded-md border border-gray-200 p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Content Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item name="title_en" label="Title (EN)" className="md:col-span-2">
                  <Input placeholder="Enter English title" />
                </Form.Item>
                <Form.Item name="subtitle_en" label="Subtitle (EN)" className="md:col-span-2">
                  <Input placeholder="Enter English subtitle" />
                </Form.Item>

                <Form.Item name="objective_en" label="Objective (EN)">
                  <Input.TextArea rows={2} placeholder="Enter English objective" />
                </Form.Item>

                <Form.Item name="brief_en" label="Brief (EN)">
                  <Input.TextArea rows={2} placeholder="Enter English brief" />
                </Form.Item>

                <Form.Item name="strategy_en" label="Strategy (EN)" className="md:col-span-2">
                  <Input.TextArea rows={2} placeholder="Enter English strategy" />
                </Form.Item>
                <Form.Item name="approach_en" label="Approach (EN)" className="md:col-span-2">
                  <Input.TextArea rows={2} placeholder="Enter English approach" />
                </Form.Item>
                {!autoTranslateEdit && (
                  <>
                    <Form.Item name="title_ar" label="Title (AR)" className="md:col-span-2">
                      <Input placeholder="Enter Arabic title" />
                    </Form.Item>
                    <Form.Item name="title_fr" label="Title (FR)" className="md:col-span-2">
                      <Input placeholder="Enter French title" />
                    </Form.Item>
                    <Form.Item name="subtitle_ar" label="Subtitle (AR)" className="md:col-span-2">
                      <Input placeholder="Enter Arabic subtitle" />
                    </Form.Item>
                    <Form.Item name="subtitle_fr" label="Subtitle (FR)" className="md:col-span-2">
                      <Input placeholder="Enter French subtitle" />
                    </Form.Item>
                    <Form.Item name="objective_ar" label="Objective (AR)">
                      <Input.TextArea rows={2} placeholder="Enter Arabic objective" />
                    </Form.Item>
                    <Form.Item name="objective_fr" label="Objective (FR)">
                      <Input.TextArea rows={2} placeholder="Enter French objective" />
                    </Form.Item>
                    <Form.Item name="brief_ar" label="Brief (AR)">
                      <Input.TextArea rows={2} placeholder="Enter Arabic brief" />
                    </Form.Item>
                    <Form.Item name="brief_fr" label="Brief (FR)">
                      <Input.TextArea rows={2} placeholder="Enter French brief" />
                    </Form.Item>
                    <Form.Item name="strategy_ar" label="Strategy (AR)" className="md:col-span-2">
                      <Input.TextArea rows={2} placeholder="Enter Arabic strategy" />
                    </Form.Item>
                    <Form.Item name="strategy_fr" label="Strategy (FR)" className="md:col-span-2">
                      <Input.TextArea rows={2} placeholder="Enter French strategy" />
                    </Form.Item>
                    <Form.Item name="approach_ar" label="Approach (AR)" className="md:col-span-2">
                      <Input.TextArea rows={2} placeholder="Enter Arabic approach" />
                    </Form.Item>
                    <Form.Item name="approach_fr" label="Approach (FR)" className="md:col-span-2">
                      <Input.TextArea rows={2} placeholder="Enter French approach" />
                    </Form.Item>
                  </>
                )}
              </div>
            </div>

            <div className="rounded-md border border-gray-200 p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Performance Metrics
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Form.Item name="reach" label="Reach">
                  <InputNumber
                    placeholder="Reach"
                    className="w-full"
                    min={0}
                  />
                </Form.Item>
                <Form.Item name="views" label="Views">
                  <InputNumber
                    placeholder="Views"
                    className="w-full"
                    min={0}
                  />
                </Form.Item>
                <Form.Item name="engagement_rate" label="Engagement Rate (%)">
                  <InputNumber
                    placeholder="%"
                    className="w-full"
                    min={0}
                    max={100}
                    step={0.01}
                  />
                </Form.Item>
              </div>
            </div>
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

          <Form.Item label="Upload New Reels (Videos) (optional)">
            <Upload
              fileList={editReelsFileList}
              beforeUpload={() => false}
              listType="text"
              accept="video/*"
              multiple
              onChange={({ fileList }) => setEditReelsFileList(fileList)}
            >
              <Button icon={<UploadOutlined />}>Upload Videos</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      {/* View Details Modal */}
      <Modal
        title="Item Details"
        open={viewModal.open}
        onCancel={() => setViewModal({ open: false, item: null })}
        footer={null}
        width={1000}
        centered
        destroyOnClose
      >
        {viewModal.item ? (
          <div className="space-y-6">
            {/* Title */}
            <div className="text-center pb-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                {viewModal.item.title || "No Title"}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {viewModal.item.subtitle || viewModal.item.subtitle_en || "-"}
              </p>
            </div>

            {/* Logo Section */}
            {viewModal.item.logo && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-700">Logo</h4>
                <div className="flex justify-center">
                  <div className="w-32 h-32 bg-gray-50 rounded-lg overflow-hidden border border-gray-200 p-3">
                    <Image
                      src={viewModal.item.logo}
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

            {/* Stats Section */}
            {(viewModal.item.reach ||
              viewModal.item.views ||
              viewModal.item.engagement_rate) && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700">
                  Statistics
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  {viewModal.item.reach && (
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <div className="text-gray-500 text-sm mb-1">Reach</div>
                      <div className="font-bold text-blue-700 text-xl">
                        {viewModal.item.reach >= 1000000
                          ? `${(viewModal.item.reach / 1000000).toFixed(1)}M`
                          : viewModal.item.reach >= 1000
                          ? `${(viewModal.item.reach / 1000).toFixed(1)}K`
                          : viewModal.item.reach.toLocaleString()}
                      </div>
                    </div>
                  )}
                  {viewModal.item.views && (
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <div className="text-gray-500 text-sm mb-1">Views</div>
                      <div className="font-bold text-green-700 text-xl">
                        {viewModal.item.views >= 1000000
                          ? `${(viewModal.item.views / 1000000).toFixed(1)}M`
                          : viewModal.item.views >= 1000
                          ? `${(viewModal.item.views / 1000).toFixed(1)}K`
                          : viewModal.item.views.toLocaleString()}
                      </div>
                    </div>
                  )}
                  {viewModal.item.engagement_rate && (
                    <div className="bg-purple-50 rounded-lg p-4 text-center">
                      <div className="text-gray-500 text-sm mb-1">
                        Engagement Rate
                      </div>
                      <div className="font-bold text-purple-700 text-xl">
                        {viewModal.item.engagement_rate}%
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Objective Section */}
            {viewModal.item.objective && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-700">
                  Objective
                </h4>
                <p className="text-gray-600 text-sm whitespace-pre-wrap">
                  {viewModal.item.objective}
                </p>
              </div>
            )}

            {/* Brief Section */}
            {(viewModal.item.brief || viewModal.item.brief_en) && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-700">Brief</h4>
                <p className="text-gray-600 text-sm whitespace-pre-wrap">
                  {viewModal.item.brief || viewModal.item.brief_en}
                </p>
              </div>
            )}

            {/* Strategy Section */}  
            {(viewModal.item.strategy || viewModal.item.strategy_en) && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-700">Strategy</h4>
                <p className="text-gray-600 text-sm whitespace-pre-wrap">
                  {viewModal.item.strategy || viewModal.item.strategy_en}
                </p>
              </div>
            )}

            {/* Approach Section */}
            {(viewModal.item.approach || viewModal.item.approach_en) && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-700">Approach</h4>
                <p className="text-gray-600 text-sm whitespace-pre-wrap">
                  {viewModal.item.approach || viewModal.item.approach_en}
                </p>
              </div>
            )}

            {/* Reels Section */}
            {viewModal.item.reels &&
              Array.isArray(viewModal.item.reels) &&
              viewModal.item.reels.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-700">
                    Reels ({viewModal.item.reels.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {viewModal.item.reels.map((src, idx) => (
                      <video
                        key={idx}
                        src={src}
                        controls
                        className="w-full rounded-lg border border-gray-200 bg-black"
                      />
                    ))}
                  </div>
                </div>
              )}

            {/* Media Gallery Section */}
            {viewModal.item.media && viewModal.item.media.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700">
                  Media Gallery ({viewModal.item.media.length})
                </h4>
                <Image.PreviewGroup>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {viewModal.item.media.map((img, idx) => (
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
              </div>
            )}

            {!viewModal.item.logo &&
              !viewModal.item.reach &&
              !viewModal.item.views &&
              !viewModal.item.engagement_rate &&
              !viewModal.item.objective &&
              (!viewModal.item.media || viewModal.item.media.length === 0) && (
                <div className="py-8 text-center text-gray-500">
                  No additional details available
                </div>
              )}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            No data to display
          </div>
        )}
      </Modal>
    </div>
  );
};

export default InfluenceItems;
