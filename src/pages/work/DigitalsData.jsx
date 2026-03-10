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
  Pagination,
  Spin,
  Image,
  Tooltip,
  Select,
  Empty,
  Row,
  Col,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  EyeOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import { useDigitalItemsStore } from "../../store/works/digitalItemsStore.js";
import ExcelImportButton from "../../components/work/ExcelImportButton.jsx";
import WorkLangSelect from "../../components/work/WorkLangSelect.jsx";

const DigitalsData = () => {
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
    importExcel: importDigitalExcel,
  } = useDigitalItemsStore();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addForm] = Form.useForm();
  const [logoFileList, setLogoFileList] = useState([]);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm] = Form.useForm();
  const [editLogoFileList, setEditLogoFileList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [previewModal, setPreviewModal] = useState({
    open: false,
    data: null,
  });

  useEffect(() => {
    if (slug) {
      setSlug(slug);
      fetchList(slug);
    }
  }, [slug, page, perPage, lang]);

  const handleAdd = async () => {
    try {
      const values = await addForm.validateFields();
      const payload = {
        work_id: slug,
        title_en: values.title_en,
        title_ar: values.title_ar,
        title_fr: values.title_fr,
        cpo: typeof values.cpo === "number" ? values.cpo : null,
        orders: typeof values.orders === "number" ? values.orders : null,
        roas: typeof values.roas === "number" ? values.roas : null,
        top_search:
          typeof values.top_search === "number" ? values.top_search : null,
        conversions:
          typeof values.conversions === "number" ? values.conversions : null,
        traffic: typeof values.traffic === "number" ? values.traffic : null,
        ctr: typeof values.ctr === "number" ? values.ctr : null,
        cpp: typeof values.cpp === "number" ? values.cpp : null,
        avg_cart: typeof values.avg_cart === "number" ? values.avg_cart : null,
        cltv: typeof values.cltv === "number" ? values.cltv : null,
        ftus: typeof values.ftus === "number" ? values.ftus : null,
        reach: typeof values.reach === "number" ? values.reach : null,
        objective_en: values.objective_en,
        objective_ar: values.objective_ar,
        objective_fr: values.objective_fr,
      };

      if (logoFileList[0]?.originFileObj) {
        payload.logo = logoFileList[0].originFileObj;
      }

      if (!payload.logo) {
        toast.error("Please upload a logo.");
        return;
      }

      await create(payload);
      setIsAddOpen(false);
      addForm.resetFields();
      setLogoFileList([]);
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
      if (values.cpo != null && typeof values.cpo === "number") {
        payload.cpo = values.cpo;
      }
      if (values.orders != null && typeof values.orders === "number") {
        payload.orders = values.orders;
      }
      if (values.roas != null && typeof values.roas === "number") {
        payload.roas = values.roas;
      }
      if (values.top_search != null && typeof values.top_search === "number") {
        payload.top_search = values.top_search;
      }
      if (
        values.conversions != null &&
        typeof values.conversions === "number"
      ) {
        payload.conversions = values.conversions;
      }
      if (values.traffic != null && typeof values.traffic === "number") {
        payload.traffic = values.traffic;
      }
      if (values.ctr != null && typeof values.ctr === "number") {
        payload.ctr = values.ctr;
      }
      if (values.cpp != null && typeof values.cpp === "number") {
        payload.cpp = values.cpp;
      }
      if (values.avg_cart != null && typeof values.avg_cart === "number") {
        payload.avg_cart = values.avg_cart;
      }
      if (values.cltv != null && typeof values.cltv === "number") {
        payload.cltv = values.cltv;
      }
      if (values.ftus != null && typeof values.ftus === "number") {
        payload.ftus = values.ftus;
      }
      if (values.reach != null && typeof values.reach === "number") {
        payload.reach = values.reach;
      }
      if (values.objective_en && values.objective_en.trim()) {
        payload.objective_en = values.objective_en;
      }
      if (values.objective_ar && values.objective_ar.trim()) {
        payload.objective_ar = values.objective_ar;
      }
      if (values.objective_fr && values.objective_fr.trim()) {
        payload.objective_fr = values.objective_fr;
      }

      if (editLogoFileList[0]?.originFileObj) {
        payload.logo = editLogoFileList[0].originFileObj;
      }

      await update(editingId, payload);
      setIsEditOpen(false);
      editForm.resetFields();
      setEditLogoFileList([]);
      setEditingId(null);
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
      toast.error(
        err?.response?.data?.message || err?.message || "Delete failed"
      );
    }
  };

  const openEditModal = (item) => {
    const digital = item || {};
    setEditingId(digital.id);
    setIsEditOpen(true);
    editForm.setFieldsValue({
      title_en: digital.title_en || "",
      title_ar: digital.title_ar || "",
      title_fr: digital.title_fr || "",
      cpo: digital.cpo || null,
      orders: digital.orders || null,
      roas: digital.roas || null,
      top_search: digital.top_search || null,
      conversions: digital.conversions || null,
      traffic: digital.traffic || null,
      ctr: digital.ctr || null,
      cpp: digital.cpp || null,
      avg_cart: digital.avg_cart || null,
      cltv: digital.cltv || null,
      ftus: digital.ftus || null,
      reach: digital.reach || null,
      objective_en: digital.objective_en || "",
      objective_ar: digital.objective_ar || "",
      objective_fr: digital.objective_fr || "",
    });
    setEditLogoFileList([]);
  };

  const openPreviewModal = (item) => {
    if (item) {
      setPreviewModal({
        open: true,
        data: item,
      });
    }
  };

  const formatNumber = (num) => {
    if (num == null) return "N/A";
    if (typeof num === "string") return num;
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Digital Items</h2>
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
          <ExcelImportButton
            disabled={!slug}
            className="flex items-center"
            onImport={importDigitalExcel}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsAddOpen(true)}
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
          <div className="flex flex-wrap gap-6">
            {items.map((item) => {
              const digital = item || {};
              return (
                <div
                  key={digital.id}
                  className="w-full sm:w-[calc(50%-12px)] md:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)]"
                >
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
                        {/* Main Image (Logo) */}
                        {digital.logo ? (
                          <div className="h-56 overflow-hidden bg-gray-100">
                            <Image
                              src={digital.logo}
                              alt={digital.title}
                              className="w-full h-full object-cover"
                              preview={false}
                            />
                          </div>
                        ) : (
                          <div className="h-56 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <div className="text-center text-gray-400">
                              <div className="text-4xl mb-2">🖼️</div>
                              <div className="text-sm">No Logo</div>
                            </div>
                          </div>
                        )}
                      </div>
                    }
                    actions={[
                      <Tooltip title="View All Data" key="view">
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
                        onConfirm={() => handleDelete(digital.id)}
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
                          {digital.title || "No Title"}
                        </h3>
                      </div>
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>

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
        title="Add Digital Item"
        open={isAddOpen}
        onCancel={() => {
          setIsAddOpen(false);
          addForm.resetFields();
          setLogoFileList([]);
        }}
        onOk={handleAdd}
        confirmLoading={isLoading}
        okText="Create"
        width={1000}
        style={{ top: 20 }}
      >
        <Form
          form={addForm}
          layout="vertical"
          className="max-h-[70vh] overflow-y-auto pr-2"
        >
          <div className="flex flex-col md:flex-row md:flex-wrap gap-4">
            <div className="flex-1 min-w-full md:min-w-[calc(33.333%-11px)]">
              <Form.Item
                name="title_en"
                label="Title (EN)"
                rules={[{ required: true }]}
              >
                <Input placeholder="Enter English title" />
              </Form.Item>
            </div>
            <div className="flex-1 min-w-full md:min-w-[calc(33.333%-11px)]">
              <Form.Item
                name="title_ar"
                label="Title (AR)"
                rules={[{ required: true }]}
              >
                <Input placeholder="Enter Arabic title" />
              </Form.Item>
            </div>
            <div className="flex-1 min-w-full md:min-w-[calc(33.333%-11px)]">
              <Form.Item
                name="title_fr"
                label="Title (FR)"
                rules={[{ required: true }]}
              >
                <Input placeholder="Enter French title" />
              </Form.Item>
            </div>

            <div className="flex-1 min-w-full md:min-w-[calc(33.333%-11px)]">
              <Form.Item
                name="objective_en"
                label="Objective (EN)"
                rules={[{ required: true }]}
              >
                <Input.TextArea
                  rows={2}
                  placeholder="Enter English objective"
                />
              </Form.Item>
            </div>
            <div className="flex-1 min-w-full md:min-w-[calc(33.333%-11px)]">
              <Form.Item
                name="objective_ar"
                label="Objective (AR)"
                rules={[{ required: true }]}
              >
                <Input.TextArea rows={2} placeholder="Enter Arabic objective" />
              </Form.Item>
            </div>
            <div className="flex-1 min-w-full md:min-w-[calc(33.333%-11px)]">
              <Form.Item
                name="objective_fr"
                label="Objective (FR)"
                rules={[{ required: true }]}
              >
                <Input.TextArea rows={2} placeholder="Enter French objective" />
              </Form.Item>
            </div>

            <div className="flex-1 min-w-full md:min-w-[calc(33.333%-11px)]">
              <Form.Item
                name="cpo"
                label="CPO"
                rules={[
                  {
                    validator: (_, value) => {
                      if (
                        value === null ||
                        value === undefined ||
                        value === ""
                      ) {
                        return Promise.resolve();
                      }
                      const numValue = Number(value);
                      if (isNaN(numValue)) {
                        return Promise.reject(
                          new Error("CPO must be a number")
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <InputNumber
                  placeholder="Enter CPO"
                  className="w-full"
                  min={0}
                  step={0.01}
                  controls={true}
                />
              </Form.Item>
            </div>
            <div className="flex-1 min-w-full md:min-w-[calc(33.333%-11px)]">
              <Form.Item
                name="orders"
                label="Orders"
                rules={[
                  {
                    validator: (_, value) => {
                      if (
                        value === null ||
                        value === undefined ||
                        value === ""
                      ) {
                        return Promise.resolve();
                      }
                      const numValue = Number(value);
                      if (isNaN(numValue) || value === "") {
                        return Promise.reject(
                          new Error("Orders must be a number")
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <InputNumber
                  placeholder="Enter orders"
                  className="w-full"
                  min={0}
                  controls={true}
                />
              </Form.Item>
            </div>
            <div className="flex-1 min-w-full md:min-w-[calc(33.333%-11px)]">
              <Form.Item
                name="roas"
                label="ROAS"
                rules={[
                  {
                    validator: (_, value) => {
                      if (
                        value === null ||
                        value === undefined ||
                        value === ""
                      ) {
                        return Promise.resolve();
                      }
                      const numValue = Number(value);
                      if (isNaN(numValue) || value === "") {
                        return Promise.reject(
                          new Error("ROAS must be a number")
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <InputNumber
                  placeholder="Enter ROAS"
                  className="w-full"
                  min={0}
                  step={0.01}
                  controls={true}
                />
              </Form.Item>
            </div>

            <div className="flex-1 min-w-full md:min-w-[calc(33.333%-11px)]">
              <Form.Item
                name="top_search"
                label="Top Search"
                rules={[
                  {
                    validator: (_, value) => {
                      if (
                        value === null ||
                        value === undefined ||
                        value === ""
                      ) {
                        return Promise.resolve();
                      }
                      const numValue = Number(value);
                      if (isNaN(numValue) || value === "") {
                        return Promise.reject(
                          new Error("Top Search must be a number")
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <InputNumber
                  placeholder="Enter top search"
                  className="w-full"
                  min={0}
                  controls={true}
                />
              </Form.Item>
            </div>
            <div className="flex-1 min-w-full md:min-w-[calc(33.333%-11px)]">
              <Form.Item
                name="conversions"
                label="Conversions"
                rules={[
                  {
                    validator: (_, value) => {
                      if (
                        value === null ||
                        value === undefined ||
                        value === ""
                      ) {
                        return Promise.resolve();
                      }
                      const numValue = Number(value);
                      if (isNaN(numValue) || value === "") {
                        return Promise.reject(
                          new Error("Conversions must be a number")
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <InputNumber
                  placeholder="Enter conversions"
                  className="w-full"
                  min={0}
                  controls={true}
                />
              </Form.Item>
            </div>
            <div className="flex-1 min-w-full md:min-w-[calc(33.333%-11px)]">
              <Form.Item
                name="traffic"
                label="Traffic"
                rules={[
                  {
                    validator: (_, value) => {
                      if (
                        value === null ||
                        value === undefined ||
                        value === ""
                      ) {
                        return Promise.resolve();
                      }
                      const numValue = Number(value);
                      if (isNaN(numValue) || value === "") {
                        return Promise.reject(
                          new Error("Traffic must be a number")
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <InputNumber
                  placeholder="Enter traffic"
                  className="w-full"
                  min={0}
                  controls={true}
                />
              </Form.Item>
            </div>

            <div className="flex-1 min-w-full md:min-w-[calc(33.333%-11px)]">
              <Form.Item
                name="ctr"
                label="CTR (%)"
                rules={[
                  {
                    validator: (_, value) => {
                      if (
                        value === null ||
                        value === undefined ||
                        value === ""
                      ) {
                        return Promise.resolve();
                      }
                      const numValue = Number(value);
                      if (isNaN(numValue) || value === "") {
                        return Promise.reject(
                          new Error("CTR must be a number")
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <InputNumber
                  placeholder="Enter CTR"
                  className="w-full"
                  min={0}
                  max={100}
                  step={0.01}
                  controls={true}
                />
              </Form.Item>
            </div>
            <div className="flex-1 min-w-full md:min-w-[calc(33.333%-11px)]">
              <Form.Item
                name="cpp"
                label="CPP"
                rules={[
                  {
                    validator: (_, value) => {
                      if (
                        value === null ||
                        value === undefined ||
                        value === ""
                      ) {
                        return Promise.resolve();
                      }
                      const numValue = Number(value);
                      if (isNaN(numValue) || value === "") {
                        return Promise.reject(
                          new Error("CPP must be a number")
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <InputNumber
                  placeholder="Enter CPP"
                  className="w-full"
                  min={0}
                  step={0.01}
                  controls={true}
                />
              </Form.Item>
            </div>
            <div className="flex-1 min-w-full md:min-w-[calc(33.333%-11px)]">
              <Form.Item
                name="avg_cart"
                label="Avg Cart"
                rules={[
                  {
                    validator: (_, value) => {
                      if (
                        value === null ||
                        value === undefined ||
                        value === ""
                      ) {
                        return Promise.resolve();
                      }
                      const numValue = Number(value);
                      if (isNaN(numValue) || value === "") {
                        return Promise.reject(
                          new Error("Avg Cart must be a number")
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <InputNumber
                  placeholder="Enter average cart"
                  className="w-full"
                  min={0}
                  step={0.01}
                  controls={true}
                />
              </Form.Item>
            </div>

            <div className="flex-1 min-w-full md:min-w-[calc(33.333%-11px)]">
              <Form.Item
                name="cltv"
                label="CLTV"
                rules={[
                  {
                    validator: (_, value) => {
                      if (
                        value === null ||
                        value === undefined ||
                        value === ""
                      ) {
                        return Promise.resolve();
                      }
                      const numValue = Number(value);
                      if (isNaN(numValue) || value === "") {
                        return Promise.reject(
                          new Error("CLTV must be a number")
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <InputNumber
                  placeholder="Enter CLTV"
                  className="w-full"
                  min={0}
                  step={0.01}
                  controls={true}
                />
              </Form.Item>
            </div>
            <div className="flex-1 min-w-full md:min-w-[calc(33.333%-11px)]">
              <Form.Item
                name="ftus"
                label="FTUs"
                rules={[
                  {
                    validator: (_, value) => {
                      if (
                        value === null ||
                        value === undefined ||
                        value === ""
                      ) {
                        return Promise.resolve();
                      }
                      const numValue = Number(value);
                      if (isNaN(numValue) || value === "") {
                        return Promise.reject(
                          new Error("FTUs must be a number")
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <InputNumber
                  placeholder="Enter FTUs"
                  className="w-full"
                  min={0}
                  controls={true}
                />
              </Form.Item>
            </div>
            <div className="flex-1 min-w-full md:min-w-[calc(33.333%-11px)]">
              <Form.Item
                name="reach"
                label="Reach"
                rules={[
                  {
                    validator: (_, value) => {
                      if (
                        value === null ||
                        value === undefined ||
                        value === ""
                      ) {
                        return Promise.resolve();
                      }
                      const numValue = Number(value);
                      if (isNaN(numValue) || value === "") {
                        return Promise.reject(
                          new Error("Reach must be a number")
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <InputNumber
                  placeholder="Enter reach"
                  className="w-full"
                  min={0}
                  controls={true}
                />
              </Form.Item>
            </div>
          </div>

          <Form.Item label="Upload Logo" required>
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
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Update Digital Item"
        open={isEditOpen}
        onCancel={() => {
          setIsEditOpen(false);
          editForm.resetFields();
          setEditLogoFileList([]);
          setEditingId(null);
        }}
        onOk={handleEdit}
        confirmLoading={isLoading}
        okText="Update"
        width={1000}
        style={{ top: 20 }}
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

            <Form.Item name="objective_en" label="Objective (EN)">
              <Input.TextArea rows={2} placeholder="Enter English objective" />
            </Form.Item>
            <Form.Item name="objective_ar" label="Objective (AR)">
              <Input.TextArea rows={2} placeholder="Enter Arabic objective" />
            </Form.Item>
            <Form.Item name="objective_fr" label="Objective (FR)">
              <Input.TextArea rows={2} placeholder="Enter French objective" />
            </Form.Item>

            <Form.Item
              name="cpo"
              label="CPO"
              rules={[
                {
                  validator: (_, value) => {
                    if (value === null || value === undefined || value === "") {
                      return Promise.resolve();
                    }
                    const numValue = Number(value);
                    if (isNaN(numValue) || value === "") {
                      return Promise.reject(new Error("CPO must be a number"));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <InputNumber
                placeholder="Enter CPO"
                className="w-full"
                min={0}
                step={0.01}
                controls={true}
              />
            </Form.Item>
            <Form.Item
              name="orders"
              label="Orders"
              rules={[
                {
                  validator: (_, value) => {
                    if (value === null || value === undefined || value === "") {
                      return Promise.resolve();
                    }
                    const numValue = Number(value);
                    if (isNaN(numValue) || value === "") {
                      return Promise.reject(
                        new Error("Orders must be a number")
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <InputNumber
                placeholder="Enter orders"
                className="w-full"
                min={0}
                controls={true}
              />
            </Form.Item>
            <Form.Item
              name="roas"
              label="ROAS"
              rules={[
                {
                  validator: (_, value) => {
                    if (value === null || value === undefined || value === "") {
                      return Promise.resolve();
                    }
                    const numValue = Number(value);
                    if (isNaN(numValue) || value === "") {
                      return Promise.reject(new Error("ROAS must be a number"));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <InputNumber
                placeholder="Enter ROAS"
                className="w-full"
                min={0}
                step={0.01}
                controls={true}
              />
            </Form.Item>

            <Form.Item
              name="top_search"
              label="Top Search"
              rules={[
                {
                  validator: (_, value) => {
                    if (value === null || value === undefined || value === "") {
                      return Promise.resolve();
                    }
                    const numValue = Number(value);
                    if (isNaN(numValue) || value === "") {
                      return Promise.reject(
                        new Error("Top Search must be a number")
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <InputNumber
                placeholder="Enter top search"
                className="w-full"
                min={0}
                controls={true}
              />
            </Form.Item>
            <Form.Item
              name="conversions"
              label="Conversions"
              rules={[
                {
                  validator: (_, value) => {
                    if (value === null || value === undefined || value === "") {
                      return Promise.resolve();
                    }
                    const numValue = Number(value);
                    if (isNaN(numValue) || value === "") {
                      return Promise.reject(
                        new Error("Conversions must be a number")
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <InputNumber
                placeholder="Enter conversions"
                className="w-full"
                min={0}
                controls={true}
              />
            </Form.Item>
            <Form.Item
              name="traffic"
              label="Traffic"
              rules={[
                {
                  validator: (_, value) => {
                    if (value === null || value === undefined || value === "") {
                      return Promise.resolve();
                    }
                    const numValue = Number(value);
                    if (isNaN(numValue) || value === "") {
                      return Promise.reject(
                        new Error("Traffic must be a number")
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <InputNumber
                placeholder="Enter traffic"
                className="w-full"
                min={0}
                controls={true}
              />
            </Form.Item>

            <Form.Item
              name="ctr"
              label="CTR (%)"
              rules={[
                {
                  validator: (_, value) => {
                    if (value === null || value === undefined || value === "") {
                      return Promise.resolve();
                    }
                    const numValue = Number(value);
                    if (isNaN(numValue) || value === "") {
                      return Promise.reject(new Error("CTR must be a number"));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <InputNumber
                placeholder="Enter CTR"
                className="w-full"
                min={0}
                max={100}
                step={0.01}
                controls={true}
              />
            </Form.Item>
            <Form.Item
              name="cpp"
              label="CPP"
              rules={[
                {
                  validator: (_, value) => {
                    if (value === null || value === undefined || value === "") {
                      return Promise.resolve();
                    }
                    const numValue = Number(value);
                    if (isNaN(numValue) || value === "") {
                      return Promise.reject(new Error("CPP must be a number"));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <InputNumber
                placeholder="Enter CPP"
                className="w-full"
                min={0}
                step={0.01}
                controls={true}
              />
            </Form.Item>
            <Form.Item
              name="avg_cart"
              label="Avg Cart"
              rules={[
                {
                  validator: (_, value) => {
                    if (value === null || value === undefined || value === "") {
                      return Promise.resolve();
                    }
                    const numValue = Number(value);
                    if (isNaN(numValue) || value === "") {
                      return Promise.reject(
                        new Error("Avg Cart must be a number")
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <InputNumber
                placeholder="Enter average cart"
                className="w-full"
                min={0}
                step={0.01}
                controls={true}
              />
            </Form.Item>

            <Form.Item
              name="cltv"
              label="CLTV"
              rules={[
                {
                  validator: (_, value) => {
                    if (value === null || value === undefined || value === "") {
                      return Promise.resolve();
                    }
                    const numValue = Number(value);
                    if (isNaN(numValue) || value === "") {
                      return Promise.reject(new Error("CLTV must be a number"));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <InputNumber
                placeholder="Enter CLTV"
                className="w-full"
                min={0}
                step={0.01}
                controls={true}
              />
            </Form.Item>
            <Form.Item
              name="ftus"
              label="FTUs"
              rules={[
                {
                  validator: (_, value) => {
                    if (value === null || value === undefined || value === "") {
                      return Promise.resolve();
                    }
                    const numValue = Number(value);
                    if (isNaN(numValue) || value === "") {
                      return Promise.reject(new Error("FTUs must be a number"));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <InputNumber
                placeholder="Enter FTUs"
                className="w-full"
                min={0}
                controls={true}
              />
            </Form.Item>
            <Form.Item
              name="reach"
              label="Reach"
              rules={[
                {
                  validator: (_, value) => {
                    if (value === null || value === undefined || value === "") {
                      return Promise.resolve();
                    }
                    const numValue = Number(value);
                    if (isNaN(numValue) || value === "") {
                      return Promise.reject(
                        new Error("Reach must be a number")
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <InputNumber
                placeholder="Enter reach"
                className="w-full"
                min={0}
                controls={true}
              />
            </Form.Item>
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
        </Form>
      </Modal>

      {/* View Data Modal */}
      <Modal
        title="Digital Item Details"
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

            {/* Objective Section */}
            {previewModal.data.objective && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-700">
                  Objective
                </h4>
                <p className="text-gray-600 text-sm whitespace-pre-wrap">
                  {previewModal.data.objective}
                </p>
              </div>
            )}

            {/* Metrics Section */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-700">Metrics</h4>
              <Row gutter={[16, 16]}>
                {previewModal.data.cpo != null && (
                  <Col xs={12} sm={8} md={6}>
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                      <div className="text-gray-500 text-xs mb-1">CPO</div>
                      <div className="font-bold text-blue-700 text-sm">
                        {previewModal.data.cpo}
                      </div>
                    </div>
                  </Col>
                )}
                {previewModal.data.orders != null && (
                  <Col xs={12} sm={8} md={6}>
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <div className="text-gray-500 text-xs mb-1">Orders</div>
                      <div className="font-bold text-green-700 text-sm">
                        {formatNumber(previewModal.data.orders)}
                      </div>
                    </div>
                  </Col>
                )}
                {previewModal.data.roas != null && (
                  <Col xs={12} sm={8} md={6}>
                    <div className="bg-purple-50 rounded-lg p-3 text-center">
                      <div className="text-gray-500 text-xs mb-1">ROAS</div>
                      <div className="font-bold text-purple-700 text-sm">
                        {previewModal.data.roas}
                      </div>
                    </div>
                  </Col>
                )}
                {previewModal.data.conversions != null && (
                  <Col xs={12} sm={8} md={6}>
                    <div className="bg-orange-50 rounded-lg p-3 text-center">
                      <div className="text-gray-500 text-xs mb-1">
                        Conversions
                      </div>
                      <div className="font-bold text-orange-700 text-sm">
                        {formatNumber(previewModal.data.conversions)}
                      </div>
                    </div>
                  </Col>
                )}
                {previewModal.data.traffic != null && (
                  <Col xs={12} sm={8} md={6}>
                    <div className="bg-indigo-50 rounded-lg p-3 text-center">
                      <div className="text-gray-500 text-xs mb-1">Traffic</div>
                      <div className="font-bold text-indigo-700 text-sm">
                        {formatNumber(previewModal.data.traffic)}
                      </div>
                    </div>
                  </Col>
                )}
                {previewModal.data.ctr != null && (
                  <Col xs={12} sm={8} md={6}>
                    <div className="bg-pink-50 rounded-lg p-3 text-center">
                      <div className="text-gray-500 text-xs mb-1">CTR</div>
                      <div className="font-bold text-pink-700 text-sm">
                        {previewModal.data.ctr}%
                      </div>
                    </div>
                  </Col>
                )}
                {previewModal.data.cpp != null && (
                  <Col xs={12} sm={8} md={6}>
                    <div className="bg-teal-50 rounded-lg p-3 text-center">
                      <div className="text-gray-500 text-xs mb-1">CPP</div>
                      <div className="font-bold text-teal-700 text-sm">
                        {previewModal.data.cpp}
                      </div>
                    </div>
                  </Col>
                )}
                {previewModal.data.avg_cart != null && (
                  <Col xs={12} sm={8} md={6}>
                    <div className="bg-cyan-50 rounded-lg p-3 text-center">
                      <div className="text-gray-500 text-xs mb-1">Avg Cart</div>
                      <div className="font-bold text-cyan-700 text-sm">
                        {previewModal.data.avg_cart}
                      </div>
                    </div>
                  </Col>
                )}
                {previewModal.data.cltv != null && (
                  <Col xs={12} sm={8} md={6}>
                    <div className="bg-amber-50 rounded-lg p-3 text-center">
                      <div className="text-gray-500 text-xs mb-1">CLTV</div>
                      <div className="font-bold text-amber-700 text-sm">
                        {previewModal.data.cltv}
                      </div>
                    </div>
                  </Col>
                )}
                {previewModal.data.ftus != null && (
                  <Col xs={12} sm={8} md={6}>
                    <div className="bg-lime-50 rounded-lg p-3 text-center">
                      <div className="text-gray-500 text-xs mb-1">FTUs</div>
                      <div className="font-bold text-lime-700 text-sm">
                        {formatNumber(previewModal.data.ftus)}
                      </div>
                    </div>
                  </Col>
                )}
                {previewModal.data.reach != null && (
                  <Col xs={12} sm={8} md={6}>
                    <div className="bg-rose-50 rounded-lg p-3 text-center">
                      <div className="text-gray-500 text-xs mb-1">Reach</div>
                      <div className="font-bold text-rose-700 text-sm">
                        {formatNumber(previewModal.data.reach)}
                      </div>
                    </div>
                  </Col>
                )}
              </Row>
            </div>

            {/* Top Search Section */}
            {previewModal.data.top_search && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-700">
                  Top Search
                </h4>
                <p className="text-gray-600 text-sm">
                  {previewModal.data.top_search}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="py-8">
            <Empty description={<span>No data to display</span>} />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DigitalsData;
