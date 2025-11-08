import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Empty,
  Form,
  Input,
  Modal,
  Popconfirm,
  Spin,
  Tabs,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import { useTeamsTypeStore } from "../../store/team/teamsTypeStore.js";
import TeamMembersManager from "./TeamMembersManager.jsx";

function TeamManagement() {
  const { items, isLoading, fetchList, create, remove, setCurrent } =
    useTeamsTypeStore();

  const [selectedTypeId, setSelectedTypeId] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm] = Form.useForm();

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

  const tabItems = useMemo(
    () =>
      (items || []).map((type) => ({
        key: String(type.id),
        label: (
          <div className="flex items-center gap-2">
            <span>{type.type || `Type ${type.id}`}</span>
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
              <Button
                danger
                type="link"
                onClick={(event) => event.stopPropagation()}
                size="small"
              >
                Delete
              </Button>
            </Popconfirm>
          </div>
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
    </div>
  );
}

export default TeamManagement;
