import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
  Image,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  CloseOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  FaInstagram,
  FaYoutube,
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaTiktok,
  FaSnapchat,
  FaGlobe,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { useInfluencerStore } from "../../store/influencers/influencerStore.js";

const InfluencersData = () => {
  const { id } = useParams();
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
    setSectionId,
    create,
    update,
    remove,
    import: importExcel,
  } = useInfluencerStore();

  // Helper function to get icon based on link type
  const getLinkIcon = (linkType) => {
    const type = linkType?.toLowerCase() || "";
    switch (type) {
      case "instagram":
        return <FaInstagram />;
      case "youtube":
        return <FaYoutube />;
      case "facebook":
        return <FaFacebook />;
      case "twitter":
        return <FaTwitter />;
      case "linkedin":
        return <FaLinkedin />;
      case "tiktok":
        return <FaTiktok />;
      case "snapchat":
        return <FaSnapchat />;
      default:
        return <FaGlobe />;
    }
  };

  // Helper function to get icon color based on link type
  const getLinkColor = (linkType) => {
    const type = linkType?.toLowerCase() || "";
    switch (type) {
      case "instagram":
        return "#E4405F";
      case "youtube":
        return "#FF0000";
      case "facebook":
        return "#1877F2";
      case "twitter":
        return "#1DA1F2";
      case "linkedin":
        return "#0A66C2";
      case "tiktok":
        return "#000000";
      case "snapchat":
        return "#FFFC00";
      default:
        return "#6B7280";
    }
  };

  // Link type options for the selector
  const linkTypeOptions = [
    { value: "instagram", label: "Instagram", icon: <FaInstagram /> },
    { value: "youtube", label: "YouTube", icon: <FaYoutube /> },
    { value: "facebook", label: "Facebook", icon: <FaFacebook /> },
    { value: "twitter", label: "Twitter", icon: <FaTwitter /> },
    { value: "linkedin", label: "LinkedIn", icon: <FaLinkedin /> },
    { value: "tiktok", label: "TikTok", icon: <FaTiktok /> },
    { value: "snapchat", label: "Snapchat", icon: <FaSnapchat /> },
    { value: "other", label: "Other", icon: <FaGlobe /> },
  ];

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addForm] = Form.useForm();
  const [imageFileList, setImageFileList] = useState([]);
  const [links, setLinks] = useState([{ link: "", link_type: "" }]);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm] = Form.useForm();
  const [editImageFileList, setEditImageFileList] = useState([]);
  const [editLinks, setEditLinks] = useState([{ link: "", link_type: "" }]);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (id) {
      setSectionId(id);
      fetchList(id);
    }
  }, [id, page, perPage, lang]);

  const handleImportExcel = async (file) => {
    try {
      await importExcel(file, id);
    } catch (error) {
      // Error is already handled in the store
    }
  };

  const handleAdd = async () => {
    try {
      const values = await addForm.validateFields();
      const payload = {
        name_en: values.name_en,
        name_ar: values.name_ar,
        name_fr: values.name_fr,
        primary_subtitle_en: values.primary_subtitle_en,
        primary_subtitle_ar: values.primary_subtitle_ar,
        primary_subtitle_fr: values.primary_subtitle_fr,
        secondary_subtitle_en: values.secondary_subtitle_en,
        secondary_subtitle_ar: values.secondary_subtitle_ar,
        secondary_subtitle_fr: values.secondary_subtitle_fr,
        links: links.filter((l) => l.link && l.link_type),
      };

      if (imageFileList[0]?.originFileObj) {
        payload.image = imageFileList[0].originFileObj;
      }

      if (!payload.image) {
        toast.error("Please upload an image.");
        return;
      }

      await create(payload, id);
      setIsAddOpen(false);
      addForm.resetFields();
      setImageFileList([]);
      setLinks([{ link: "", link_type: "" }]);
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
      if (values.name_en) payload.name_en = values.name_en;
      if (values.name_ar) payload.name_ar = values.name_ar;
      if (values.name_fr) payload.name_fr = values.name_fr;
      if (values.primary_subtitle_en)
        payload.primary_subtitle_en = values.primary_subtitle_en;
      if (values.primary_subtitle_ar)
        payload.primary_subtitle_ar = values.primary_subtitle_ar;
      if (values.primary_subtitle_fr)
        payload.primary_subtitle_fr = values.primary_subtitle_fr;
      if (values.secondary_subtitle_en)
        payload.secondary_subtitle_en = values.secondary_subtitle_en;
      if (values.secondary_subtitle_ar)
        payload.secondary_subtitle_ar = values.secondary_subtitle_ar;
      if (values.secondary_subtitle_fr)
        payload.secondary_subtitle_fr = values.secondary_subtitle_fr;

      const filteredLinks = editLinks.filter((l) => l.link && l.link_type);
      if (filteredLinks.length > 0) {
        payload.links = filteredLinks;
      }

      if (editImageFileList[0]?.originFileObj) {
        payload.image = editImageFileList[0].originFileObj;
      }

      await update(editingId, payload);
      setIsEditOpen(false);
      editForm.resetFields();
      setEditImageFileList([]);
      setEditLinks([{ link: "", link_type: "" }]);
      setEditingId(null);
    } catch (err) {
      if (err?.response?.data?.message) {
        toast.error(err.response.data.message);
      } else if (err?.message) {
        toast.error(err.message);
      }
    }
  };

  const handleDelete = async (influencerId) => {
    try {
      await remove(influencerId);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Delete failed"
      );
    }
  };

  const openEditModal = (influencer) => {
    setEditingId(influencer.id);
    setIsEditOpen(true);
    editForm.setFieldsValue({
      name_en: influencer.name_en || "",
      name_ar: influencer.name_ar || "",
      name_fr: influencer.name_fr || "",
      primary_subtitle_en: influencer.primary_subtitle_en || "",
      primary_subtitle_ar: influencer.primary_subtitle_ar || "",
      primary_subtitle_fr: influencer.primary_subtitle_fr || "",
      secondary_subtitle_en: influencer.secondary_subtitle_en || "",
      secondary_subtitle_ar: influencer.secondary_subtitle_ar || "",
      secondary_subtitle_fr: influencer.secondary_subtitle_fr || "",
    });
    if (influencer.links && influencer.links.length > 0) {
      setEditLinks(influencer.links);
    } else {
      setEditLinks([{ link: "", link_type: "" }]);
    }
    setEditImageFileList([]);
  };

  const addLink = () => {
    setLinks([...links, { link: "", link_type: "" }]);
  };

  const removeLink = (index) => {
    const newLinks = links.filter((_, i) => i !== index);
    setLinks(newLinks.length > 0 ? newLinks : [{ link: "", link_type: "" }]);
  };

  const updateLink = (index, field, value) => {
    const newLinks = [...links];
    newLinks[index][field] = value;
    setLinks(newLinks);
  };

  const addEditLink = () => {
    setEditLinks([...editLinks, { link: "", link_type: "" }]);
  };

  const removeEditLink = (index) => {
    const newLinks = editLinks.filter((_, i) => i !== index);
    setEditLinks(
      newLinks.length > 0 ? newLinks : [{ link: "", link_type: "" }]
    );
  };

  const updateEditLink = (index, field, value) => {
    const newLinks = [...editLinks];
    newLinks[index][field] = value;
    setEditLinks(newLinks);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Influencers Data</h2>
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
            Add Influencer
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <Spin size="large" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No influencers found</p>
        </div>
      ) : (
        <>
          <Row gutter={[24, 24]}>
            {items.map((influencer) => (
              <Col xs={24} sm={12} md={8} lg={6} key={influencer.id}>
                <Card
                  hoverable
                  cover={
                    <div className="h-48 overflow-hidden bg-gray-100">
                      {influencer.image ? (
                        <Image
                          src={influencer.image}
                          alt={influencer.name}
                          className="w-full h-full object-cover"
                          preview={{ mask: "Preview" }}
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
                      onClick={() => openEditModal(influencer)}
                    />,
                    <Popconfirm
                      key="delete"
                      title="Delete this influencer?"
                      okText="Yes"
                      cancelText="No"
                      onConfirm={() => handleDelete(influencer.id)}
                    >
                      <DeleteOutlined danger />
                    </Popconfirm>,
                  ]}
                >
                  <Card.Meta
                    title={
                      <div className="font-semibold text-base line-clamp-2 mb-2">
                        {influencer.name || "No Name"}
                      </div>
                    }
                    description={
                      <div>
                        {influencer.primary_subtitle && (
                          <div className="text-gray-600 text-sm line-clamp-1 mb-1">
                            {influencer.primary_subtitle}
                          </div>
                        )}
                        {influencer.secondary_subtitle && (
                          <div className="text-gray-500 text-xs line-clamp-1 mb-2">
                            {influencer.secondary_subtitle}
                          </div>
                        )}
                        {influencer.links && influencer.links.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {influencer.links.map((link, idx) => (
                              <Button
                                key={idx}
                                type="text"
                                icon={getLinkIcon(link.link_type)}
                                onClick={() => {
                                  if (link.link) {
                                    window.open(
                                      link.link,
                                      "_blank",
                                      "noopener,noreferrer"
                                    );
                                  }
                                }}
                                style={{
                                  color: getLinkColor(link.link_type),
                                  fontSize: "18px",
                                  padding: "4px 8px",
                                  height: "auto",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                                className="hover:opacity-80 transition-opacity"
                                title={link.link_type || "Link"}
                              />
                            ))}
                          </div>
                        )}
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
        title="Add Influencer"
        open={isAddOpen}
        onCancel={() => {
          setIsAddOpen(false);
          addForm.resetFields();
          setImageFileList([]);
          setLinks([{ link: "", link_type: "" }]);
        }}
        onOk={handleAdd}
        confirmLoading={isLoading}
        okText="Create"
        width={900}
      >
        <Form form={addForm} layout="vertical">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Item
              name="name_en"
              label="Name (EN)"
              rules={[{ required: true }]}
            >
              <Input placeholder="Enter English name" />
            </Form.Item>
            <Form.Item
              name="name_ar"
              label="Name (AR)"
              rules={[{ required: true }]}
            >
              <Input placeholder="Enter Arabic name" />
            </Form.Item>
            <Form.Item
              name="name_fr"
              label="Name (FR)"
              rules={[{ required: true }]}
            >
              <Input placeholder="Enter French name" />
            </Form.Item>

            <Form.Item
              name="primary_subtitle_en"
              label="Primary Subtitle (EN)"
              rules={[{ required: true }]}
            >
              <Input placeholder="Enter English primary subtitle" />
            </Form.Item>
            <Form.Item
              name="primary_subtitle_ar"
              label="Primary Subtitle (AR)"
              rules={[{ required: true }]}
            >
              <Input placeholder="Enter Arabic primary subtitle" />
            </Form.Item>
            <Form.Item
              name="primary_subtitle_fr"
              label="Primary Subtitle (FR)"
              rules={[{ required: true }]}
            >
              <Input placeholder="Enter French primary subtitle" />
            </Form.Item>

            <Form.Item
              name="secondary_subtitle_en"
              label="Secondary Subtitle (EN)"
              rules={[{ required: true }]}
            >
              <Input placeholder="Enter English secondary subtitle" />
            </Form.Item>
            <Form.Item
              name="secondary_subtitle_ar"
              label="Secondary Subtitle (AR)"
              rules={[{ required: true }]}
            >
              <Input placeholder="Enter Arabic secondary subtitle" />
            </Form.Item>
            <Form.Item
              name="secondary_subtitle_fr"
              label="Secondary Subtitle (FR)"
              rules={[{ required: true }]}
            >
              <Input placeholder="Enter French secondary subtitle" />
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

          <Form.Item label="Links">
            {links.map((link, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <Input
                  placeholder="Link URL"
                  value={link.link}
                  onChange={(e) => updateLink(index, "link", e.target.value)}
                  className="flex-1"
                />
                <Select
                  placeholder="Select link type"
                  value={link.link_type || undefined}
                  onChange={(value) => updateLink(index, "link_type", value)}
                  className="flex-1"
                  options={linkTypeOptions.map((option) => ({
                    value: option.value,
                    label: (
                      <div className="flex items-center gap-2">
                        <span style={{ color: getLinkColor(option.value) }}>
                          {option.icon}
                        </span>
                        <span>{option.label}</span>
                      </div>
                    ),
                  }))}
                />
                {links.length > 1 && (
                  <Button
                    icon={<CloseOutlined />}
                    onClick={() => removeLink(index)}
                    danger
                  />
                )}
              </div>
            ))}
            <Button type="dashed" onClick={addLink} block>
              Add Link
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Update Influencer"
        open={isEditOpen}
        onCancel={() => {
          setIsEditOpen(false);
          editForm.resetFields();
          setEditImageFileList([]);
          setEditLinks([{ link: "", link_type: "" }]);
          setEditingId(null);
        }}
        onOk={handleEdit}
        confirmLoading={isLoading}
        okText="Update"
        width={900}
      >
        <Form form={editForm} layout="vertical">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Item name="name_en" label="Name (EN)">
              <Input placeholder="Enter English name" />
            </Form.Item>
            <Form.Item name="name_ar" label="Name (AR)">
              <Input placeholder="Enter Arabic name" />
            </Form.Item>
            <Form.Item name="name_fr" label="Name (FR)">
              <Input placeholder="Enter French name" />
            </Form.Item>

            <Form.Item name="primary_subtitle_en" label="Primary Subtitle (EN)">
              <Input placeholder="Enter English primary subtitle" />
            </Form.Item>
            <Form.Item name="primary_subtitle_ar" label="Primary Subtitle (AR)">
              <Input placeholder="Enter Arabic primary subtitle" />
            </Form.Item>
            <Form.Item name="primary_subtitle_fr" label="Primary Subtitle (FR)">
              <Input placeholder="Enter French primary subtitle" />
            </Form.Item>

            <Form.Item
              name="secondary_subtitle_en"
              label="Secondary Subtitle (EN)"
            >
              <Input placeholder="Enter English secondary subtitle" />
            </Form.Item>
            <Form.Item
              name="secondary_subtitle_ar"
              label="Secondary Subtitle (AR)"
            >
              <Input placeholder="Enter Arabic secondary subtitle" />
            </Form.Item>
            <Form.Item
              name="secondary_subtitle_fr"
              label="Secondary Subtitle (FR)"
            >
              <Input placeholder="Enter French secondary subtitle" />
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

          <Form.Item label="Links">
            {editLinks.map((link, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <Input
                  placeholder="Link URL"
                  value={link.link}
                  onChange={(e) =>
                    updateEditLink(index, "link", e.target.value)
                  }
                  className="flex-1"
                />
                <Select
                  placeholder="Select link type"
                  value={link.link_type || undefined}
                  onChange={(value) =>
                    updateEditLink(index, "link_type", value)
                  }
                  className="flex-1"
                  options={linkTypeOptions.map((option) => ({
                    value: option.value,
                    label: (
                      <div className="flex items-center gap-2">
                        <span style={{ color: getLinkColor(option.value) }}>
                          {option.icon}
                        </span>
                        <span>{option.label}</span>
                      </div>
                    ),
                  }))}
                />
                {editLinks.length > 1 && (
                  <Button
                    icon={<CloseOutlined />}
                    onClick={() => removeEditLink(index)}
                    danger
                  />
                )}
              </div>
            ))}
            <Button type="dashed" onClick={addEditLink} block>
              Add Link
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default InfluencersData;
