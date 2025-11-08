import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Form,
  Image,
  Input,
  Modal,
  Popconfirm,
  Space,
  Table,
  Upload,
} from "antd";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import { useTeamMembersStore } from "../../store/team/teamMembersStore.js";

const normalizeSocialLinks = (links) =>
  Array.isArray(links)
    ? links
        .map((link) => ({
          url: link?.url ?? "",
          link_type: link?.link_type ?? "",
        }))
        .filter((link) => link.url || link.link_type)
    : [];

function TeamMembersManager({ typeId }) {
  const { items, isLoading, fetchList, create, update, remove, setTypeId } =
    useTeamMembersStore();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [addImageFileList, setAddImageFileList] = useState([]);
  const [editImageFileList, setEditImageFileList] = useState([]);

  useEffect(() => {
    if (!typeId) return;
    setTypeId(typeId);
    fetchList(typeId);
  }, [typeId, fetchList, setTypeId]);

  useEffect(() => {
    if (!isAddOpen) {
      addForm.resetFields();
      setAddImageFileList([]);
    }
  }, [isAddOpen, addForm]);

  useEffect(() => {
    if (!isEditOpen) {
      editForm.resetFields();
      setEditImageFileList([]);
      setEditingId(null);
    }
  }, [isEditOpen, editForm]);

  const handleCreateMember = async () => {
    try {
      const values = await addForm.validateFields();
      if (!typeId) {
        toast.error("Select a team type first");
        return;
      }
      const payload = {
        name: values.name,
        specialist: values.specialist,
        social_links: normalizeSocialLinks(values.social_links),
      };
      if (addImageFileList[0]?.originFileObj) {
        payload.image = addImageFileList[0].originFileObj;
      }
      await create(payload, typeId);
      setIsAddOpen(false);
    } catch (error) {
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error?.message) {
        toast.error(error.message);
      }
    }
  };

  const handleOpenEdit = (record) => {
    setEditingId(record.id);
    setIsEditOpen(true);
    editForm.setFieldsValue({
      name: record.name,
      specialist: record.specialist,
      social_links:
        normalizeSocialLinks(record.social_links).length > 0
          ? normalizeSocialLinks(record.social_links)
          : [{ url: "", link_type: "" }],
    });
  };

  const handleUpdateMember = async () => {
    try {
      const values = await editForm.validateFields();
      const payload = {
        name: values.name,
        specialist: values.specialist,
        social_links: normalizeSocialLinks(values.social_links),
      };
      if (editImageFileList[0]?.originFileObj) {
        payload.image = editImageFileList[0].originFileObj;
      }
      await update(editingId, payload);
      setIsEditOpen(false);
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
        title: "Name",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "Specialist",
        dataIndex: "specialist",
        key: "specialist",
      },
      {
        title: "Image",
        dataIndex: "image",
        key: "image",
        width: 120,
        render: (value) =>
          value ? (
            <Image src={value} width={64} preview={{ mask: "Preview" }} />
          ) : (
            "-"
          ),
      },
      {
        title: "Social Links",
        dataIndex: "social_links",
        key: "social_links",
        render: (links) => {
          const list = normalizeSocialLinks(links);
          if (!list.length) return "-";
          return (
            <div className="flex flex-col gap-1">
              {list.map((link, index) => (
                <a
                  key={`${link.url}-${index}`}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  {link.link_type || "Link"}: {link.url}
                </a>
              ))}
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
            <Button type="primary" onClick={() => handleOpenEdit(record)}>
              Edit
            </Button>
            <Popconfirm
              title="Delete this member?"
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

  if (!typeId) {
    return (
      <div className="p-6 bg-white rounded-lg border border-gray-200 text-center text-gray-600">
        Select or create a team type to manage its members.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Team Members</h3>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            addForm.setFieldsValue({
              social_links: [{ url: "", link_type: "" }],
            });
            setIsAddOpen(true);
          }}
        >
          Add Member
        </Button>
      </div>

      <Table
        rowKey={(record) => record.id}
        dataSource={items}
        columns={columns}
        loading={isLoading}
        pagination={false}
      />

      <Modal
        title="Add Team Member"
        open={isAddOpen}
        onCancel={() => setIsAddOpen(false)}
        onOk={handleCreateMember}
        okText="Create"
        confirmLoading={isLoading}
      >
        <Form form={addForm} layout="vertical">
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Name is required" }]}
          >
            <Input placeholder="Enter member name" />
          </Form.Item>

          <Form.Item
            name="specialist"
            label="Specialist"
            rules={[{ required: true, message: "Specialist is required" }]}
          >
            <Input placeholder="Enter specialist" />
          </Form.Item>

          <Form.Item label="Profile Image">
            <Upload
              listType="picture-card"
              fileList={addImageFileList}
              beforeUpload={() => false}
              onChange={({ fileList }) => setAddImageFileList(fileList)}
              maxCount={1}
              accept="image/*"
            >
              {addImageFileList.length === 0 && (
                <div className="flex flex-col items-center">
                  <UploadOutlined />
                  <span className="mt-1 text-sm">Upload</span>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.List name="social_links">
            {(fields, { add, remove: removeField }) => (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Social Links</span>
                  <Button
                    type="dashed"
                    onClick={() => add({ url: "", link_type: "" })}
                    icon={<PlusOutlined />}
                  >
                    Add Link
                  </Button>
                </div>
                {fields.map(({ key, name, ...restField }, index) => (
                  <Space
                    key={key}
                    align="baseline"
                    className="flex flex-wrap gap-3"
                  >
                    <Form.Item
                      {...restField}
                      name={[name, "url"]}
                      rules={[
                        {
                          required: true,
                          message: "URL is required",
                        },
                      ]}
                    >
                      <Input placeholder="https://example.com" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "link_type"]}
                      rules={[
                        {
                          required: true,
                          message: "Type is required",
                        },
                      ]}
                    >
                      <Input placeholder="e.g. twitter" />
                    </Form.Item>
                    {fields.length > 1 && (
                      <Button
                        danger
                        type="link"
                        onClick={() => removeField(name)}
                      >
                        Remove
                      </Button>
                    )}
                  </Space>
                ))}
              </div>
            )}
          </Form.List>
        </Form>
      </Modal>

      <Modal
        title="Edit Team Member"
        open={isEditOpen}
        onCancel={() => setIsEditOpen(false)}
        onOk={handleUpdateMember}
        okText="Update"
        confirmLoading={isLoading}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Name is required" }]}
          >
            <Input placeholder="Enter member name" />
          </Form.Item>

          <Form.Item
            name="specialist"
            label="Specialist"
            rules={[{ required: true, message: "Specialist is required" }]}
          >
            <Input placeholder="Enter specialist" />
          </Form.Item>

          <Form.Item label="Profile Image">
            <Upload
              listType="picture-card"
              fileList={editImageFileList}
              beforeUpload={() => false}
              onChange={({ fileList }) => setEditImageFileList(fileList)}
              maxCount={1}
              accept="image/*"
            >
              {editImageFileList.length === 0 && (
                <div className="flex flex-col items-center">
                  <UploadOutlined />
                  <span className="mt-1 text-sm">Upload</span>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.List name="social_links">
            {(fields, { add, remove: removeField }) => (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Social Links</span>
                  <Button
                    type="dashed"
                    onClick={() => add({ url: "", link_type: "" })}
                    icon={<PlusOutlined />}
                  >
                    Add Link
                  </Button>
                </div>
                {fields.map(({ key, name, ...restField }, index) => (
                  <Space
                    key={key}
                    align="baseline"
                    className="flex flex-wrap gap-3"
                  >
                    <Form.Item
                      {...restField}
                      name={[name, "url"]}
                      rules={[
                        {
                          required: true,
                          message: "URL is required",
                        },
                      ]}
                    >
                      <Input placeholder="https://example.com" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "link_type"]}
                      rules={[
                        {
                          required: true,
                          message: "Type is required",
                        },
                      ]}
                    >
                      <Input placeholder="e.g. twitter" />
                    </Form.Item>
                    {fields.length > 1 && (
                      <Button
                        danger
                        type="link"
                        onClick={() => removeField(name)}
                      >
                        Remove
                      </Button>
                    )}
                  </Space>
                ))}
              </div>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
}

export default TeamMembersManager;
