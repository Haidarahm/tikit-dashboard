import { useEffect, useMemo, useState } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Upload,
  Popconfirm,
  Image,
  Switch,
  Tag,
  Checkbox,
} from "antd";
import {
  ReloadOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import { useAdminStore } from "../store/adminStore.js";
import { usePermissionsStore } from "../store/permissionsStore.js";

const Admins = () => {
  const {
    items,
    total,
    page,
    perPage,
    isLoading,
    fetchList,
    setPage,
    setPerPage,
    create,
    update,
    remove,
  } = useAdminStore();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [addImageFileList, setAddImageFileList] = useState([]);
  const [editImageFileList, setEditImageFileList] = useState([]);
  const [changePasswordOnEdit, setChangePasswordOnEdit] = useState(false);
  const { items: permissionsItems, fetchPermissions } = usePermissionsStore();

  useEffect(() => {
    fetchList();
  }, [page, perPage]);

  const resetAddModal = () => {
    addForm.resetFields();
    setAddImageFileList([]);
  };

  const resetEditModal = () => {
    editForm.resetFields();
    setEditImageFileList([]);
    setChangePasswordOnEdit(false);
    setEditingId(null);
  };

  const loadPermissions = async () => {
    if (permissionsItems.length > 0) return;
    try {
      await fetchPermissions();
    } catch {
      // Error toast is already handled in permissions store.
    }
  };

  const extractPermissionSlugs = (record) => {
    if (!Array.isArray(record?.permissions)) return [];
    return record.permissions
      .map((permission) => {
        if (typeof permission === "string") return permission;
        return permission?.slug || null;
      })
      .filter(Boolean);
  };

  const columns = useMemo(
    () => [
      { title: "ID", dataIndex: "id", key: "id", width: 80 },
      { title: "Name", dataIndex: "name", key: "name" },
      { title: "Email", dataIndex: "email", key: "email" },
      {
        title: "Phone",
        dataIndex: "phone_number",
        key: "phone_number",
        render: (value) => value || "-",
      },
      {
        title: "Role",
        dataIndex: "role",
        key: "role",
        width: 110,
        render: (value) => <Tag color="blue">{value || "-"}</Tag>,
      },
      {
        title: "Actions",
        key: "actions",
        width: 170,
        render: (record) => (
          <Space>
            <Button
              icon={<EditOutlined />}
              onClick={async () => {
                await loadPermissions();
                setEditingId(record.id);
                editForm.setFieldsValue({
                  name: record.name || "",
                  email: record.email || "",
                  phone_number: record.phone_number || "",
                  password: "",
                  permissions: extractPermissionSlugs(record),
                });
                setIsEditOpen(true);
              }}
            />
            <Popconfirm
              title="Delete this admin?"
              okText="Yes"
              cancelText="No"
              onConfirm={async () => {
                try {
                  await remove(record.id);
                } catch (error) {
                  toast.error(error?.response?.data?.message || "Failed to delete admin");
                }
              }}
            >
              <Button danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [editForm, remove]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Admins</h2>
          <p className="text-gray-600">Manage dashboard admins and their profile details.</p>
        </div>
        <Space wrap>
          <Button icon={<ReloadOutlined />} onClick={() => fetchList()}>
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={async () => {
              await loadPermissions();
              resetAddModal();
              setIsAddOpen(true);
            }}
          >
            Add Admin
          </Button>
        </Space>
      </div>

      <Table
        rowKey={(record) => record.id}
        columns={columns}
        scroll={{ x: 'max-content' }}
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
        title="Add Admin"
        open={isAddOpen}
        onCancel={() => {
          setIsAddOpen(false);
          resetAddModal();
        }}
        onOk={async () => {
          try {
            const values = await addForm.validateFields();
            const payload = {
              name: values.name,
              email: values.email,
              phone_number: values.phone_number,
              password: values.password,
              permissions: values.permissions,
            };
            if (addImageFileList[0]?.originFileObj) {
              payload.profile_image = addImageFileList[0].originFileObj;
            }
            await create(payload);
            setIsAddOpen(false);
            resetAddModal();
          } catch (error) {
            if (error?.response?.data?.message) {
              toast.error(error.response.data.message);
            }
          }
        }}
        confirmLoading={isLoading}
        okText="Create"
      >
        <Form form={addForm} layout="vertical" autoComplete="off">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input placeholder="Enter admin name" autoComplete="off" />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
            <Input placeholder="Enter admin email" autoComplete="off" />
          </Form.Item>
          <Form.Item name="phone_number" label="Phone Number" rules={[{ required: true }]}>
            <Input placeholder="Enter phone number" autoComplete="off" />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true, min: 6 }]}>
            <Input.Password placeholder="Enter password" autoComplete="new-password" />
          </Form.Item>
          <Form.Item
            name="permissions"
            label="Permissions"
            rules={[{ required: true, message: "Select at least one permission" }]}
          >
            <Checkbox.Group className="w-full">
              <div className="grid grid-cols-1 gap-2 max-h-52 overflow-y-auto pr-1">
                {permissionsItems.map((permission) => (
                  <Checkbox key={permission.slug} value={permission.slug}>
                    <span className="font-medium">{permission.name}</span>
                    <span className="text-gray-500"> ({permission.slug})</span>
                  </Checkbox>
                ))}
              </div>
            </Checkbox.Group>
          </Form.Item>
          <Form.Item label="Profile Image">
            <Upload
              listType="picture-card"
              fileList={addImageFileList}
              beforeUpload={() => false}
              maxCount={1}
              accept="image/*"
              onChange={({ fileList }) => setAddImageFileList(fileList)}
            >
              {addImageFileList.length === 0 && (
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
        title="Update Admin"
        open={isEditOpen}
        onCancel={() => {
          setIsEditOpen(false);
          resetEditModal();
        }}
        onOk={async () => {
          try {
            const values = await editForm.validateFields();
            const payload = {
              name: values.name,
              email: values.email,
              phone_number: values.phone_number,
              permissions: Array.isArray(values.permissions)
                ? values.permissions
                : [],
            };
            if (changePasswordOnEdit && values.password) {
              payload.password = values.password;
            }
            if (editImageFileList[0]?.originFileObj) {
              payload.profile_image = editImageFileList[0].originFileObj;
            }
            await update(editingId, payload);
            setIsEditOpen(false);
            resetEditModal();
          } catch (error) {
            if (error?.response?.data?.message) {
              toast.error(error.response.data.message);
            }
          }
        }}
        confirmLoading={isLoading}
        okText="Update"
      >
        <Form form={editForm} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input placeholder="Enter admin name" />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
            <Input placeholder="Enter admin email" />
          </Form.Item>
          <Form.Item name="phone_number" label="Phone Number" rules={[{ required: true }]}>
            <Input placeholder="Enter phone number" />
          </Form.Item>
          <Form.Item label="Change Password">
            <Switch
              checked={changePasswordOnEdit}
              onChange={(checked) => {
                setChangePasswordOnEdit(checked);
                if (!checked) {
                  editForm.setFieldValue("password", "");
                }
              }}
            />
          </Form.Item>
          {changePasswordOnEdit ? (
            <Form.Item name="password" label="Password" rules={[{ required: true, min: 6 }]}>
              <Input.Password placeholder="Enter new password" />
            </Form.Item>
          ) : null}
          <Form.Item
            name="permissions"
            label="Permissions"
            rules={[{ required: true, message: "Select at least one permission" }]}
          >
            <Checkbox.Group className="w-full">
              <div className="grid grid-cols-1 gap-2 max-h-52 overflow-y-auto pr-1">
                {permissionsItems.map((permission) => (
                  <Checkbox key={permission.slug} value={permission.slug}>
                    <span className="font-medium">{permission.name}</span>
                    <span className="text-gray-500"> ({permission.slug})</span>
                  </Checkbox>
                ))}
              </div>
            </Checkbox.Group>
          </Form.Item>
          <Form.Item label="Profile Image">
            <Upload
              listType="picture-card"
              fileList={editImageFileList}
              beforeUpload={() => false}
              maxCount={1}
              accept="image/*"
              onChange={({ fileList }) => setEditImageFileList(fileList)}
            >
              {editImageFileList.length === 0 && (
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
};

export default Admins;
