import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Empty,
  Form,
  Input,
  Modal,
  Popconfirm,
  Space,
  Spin,
  Tabs,
  Tooltip,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";
import { useTeamsTypeStore } from "../../store/team/teamsTypeStore.js";
import TeamMembersManager from "./TeamMembersManager.jsx";

function TeamManagement() {
  const { items, isLoading, fetchList, create, update, remove, setCurrent } =
    useTeamsTypeStore();

  const [selectedTypeId, setSelectedTypeId] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  useEffect(() => {
    if (!items?.length) {
      setSelectedTypeId(null);
      return;
    }
    if (!selectedTypeId) {
      const firstTypeId = items[0]?.id;
      if (firstTypeId != null) {
        setSelectedTypeId(firstTypeId);
        setCurrent(items[0]);
      }
    }
  }, [items, selectedTypeId, setCurrent]);

  const handleCreateType = async () => {
    try {
      const values = await createForm.validateFields();
      const result = await create({ type: values.type });
      const createdId = result?.data?.id ?? result?.id;
      if (createdId != null) {
        setSelectedTypeId(createdId);
      }
      setIsCreateOpen(false);
      createForm.resetFields();
    } catch (error) {
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error?.message) {
        toast.error(error.message);
      }
    }
  };

  const handleOpenEdit = (type) => {
    setEditingType(type);
    editForm.setFieldsValue({ type: type.type || "" });
    setIsEditOpen(true);
  };

  const handleUpdateType = async () => {
    try {
      const values = await editForm.validateFields();
      if (!editingType?.id) return;
      await update(editingType.id, { type: values.type });
      toast.success("Team type updated successfully");
      setIsEditOpen(false);
      setEditingType(null);
    } catch (error) {
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error?.message) {
        toast.error(error.message);
      }
    }
  };

  const tabItems = useMemo(
    () =>
      (items || []).map((type) => ({
        key: String(type.id),
        label: (
          <Space size={8} align="center">
            <span>{type.type || `Type ${type.id}`}</span>
            <Tooltip title="Update team type">
              <Button
                size="small"
                shape="circle"
                icon={<FiEdit2 />}
                aria-label="Update team type"
                onClick={(event) => {
                  event.stopPropagation();
                  handleOpenEdit(type);
                }}
              />
            </Tooltip>
            <Popconfirm
              title="Delete this team type?"
              okText="Yes"
              cancelText="No"
              onConfirm={async (event) => {
                event?.stopPropagation?.();
                try {
                  await remove(type.id);
                  if (selectedTypeId === type.id) {
                    setSelectedTypeId(null);
                  }
                } catch (error) {
                  if (error?.response?.data?.message) {
                    toast.error(error.response.data.message);
                  } else if (error?.message) {
                    toast.error(error.message);
                  }
                }
              }}
              onCancel={(event) => event?.stopPropagation?.()}
            >
              <Tooltip title="Delete team type">
                <Button
                  danger
                  size="small"
                  shape="circle"
                  icon={<FiTrash2 />}
                  aria-label="Delete team type"
                  onClick={(event) => event.stopPropagation()}
                />
              </Tooltip>
            </Popconfirm>
          </Space>
        ),
        children: <TeamMembersManager typeId={type.id} />,
      })),
    [items, remove, selectedTypeId]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Team Management</h2>
          <p className="text-gray-600">
            Organize team types and manage the members assigned to each type.
          </p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            createForm.resetFields();
            setIsCreateOpen(true);
          }}
        >
          New Team Type
        </Button>
      </div>

      {isLoading && !items.length ? (
        <div className="flex justify-center py-12">
          <Spin />
        </div>
      ) : null}

      {!isLoading && !items.length ? (
        <Card className="text-center py-12">
          <Empty description="No team types created yet" />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="mt-4"
            onClick={() => setIsCreateOpen(true)}
          >
            Create Your First Team Type
          </Button>
        </Card>
      ) : null}

      {items.length > 0 ? (
        <Tabs
          activeKey={selectedTypeId ? String(selectedTypeId) : tabItems[0]?.key}
          onChange={(key) => {
            const numericId = Number(key);
            setSelectedTypeId(Number.isNaN(numericId) ? null : numericId);
            const selected = items.find((type) => String(type.id) === key);
            if (selected) {
              setCurrent(selected);
            }
          }}
          items={tabItems}
          destroyInactiveTabPane
        />
      ) : null}

      <Modal
        title="Create Team Type"
        open={isCreateOpen}
        onCancel={() => setIsCreateOpen(false)}
        onOk={handleCreateType}
        okText="Create"
        confirmLoading={isLoading}
      >
        <Form form={createForm} layout="vertical">
          <Form.Item
            name="type"
            label="Type Name"
            rules={[{ required: true, message: "Type name is required" }]}
          >
            <Input placeholder="e.g. Design, Development" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Update Team Type"
        open={isEditOpen}
        onCancel={() => {
          setIsEditOpen(false);
          setEditingType(null);
          editForm.resetFields();
        }}
        onOk={handleUpdateType}
        okText="Update"
        confirmLoading={isLoading}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="type"
            label="Type Name"
            rules={[{ required: true, message: "Type name is required" }]}
          >
            <Input placeholder="Enter team type name" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default TeamManagement;
