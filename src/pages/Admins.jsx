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
        title: "Email Verified",
        dataIndex: "email_verified_at",
        key: "email_verified_at",
        width: 140,
        render: (value) =>
          value ? <Tag color="green">Verified</Tag> : <Tag>Not Verified</Tag>,
      },
      {
        title: "Image",
        dataIndex: "profile_image",
        key: "profile_image",
        width: 110,
        render: (value) =>
          value ? (
            <Image src={value} width={52} height={52} style={{ objectFit: "cover" }} />
          ) : (
            "-"
          ),
      },
      {
        title: "Actions",
        key: "actions",
        width: 170,
        render: (record) => (
          <Space>
            <Button
              icon={<EditOutlined />}
              onClick={() => {
                setEditingId(record.id);
                editForm.setFieldsValue({
                  name: record.name || "",
                  email: record.email || "",
                  phone_number: record.phone_number || "",
                  password: "",
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
            onClick={() => {
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
        <Form form={addForm} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input placeholder="Enter admin name" />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
            <Input placeholder="Enter admin email" />
          </Form.Item>
          <Form.Item name="phone_number" label="Phone Number" rules={[{ required: true }]}>
            <Input placeholder="Enter phone number" />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true, min: 6 }]}>
            <Input.Password placeholder="Enter password" />
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
