import { useCallback, useEffect, useState } from "react";
import { Button, Form, Modal, Space, Table } from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import { useJobsStore } from "../../store/jobsStore.js";
import { JobForm } from "./JobForm.jsx";
import { JobViewModal } from "./JobViewModal.jsx";
import { JobApplicationsModal } from "./JobApplicationsModal.jsx";
import { useJobTableColumns } from "./useJobTableColumns.jsx";
import { deriveJobFormValues } from "./jobConstants.js";

const remoteImageToFileList = (url) => {
  if (!url || typeof url !== "string") return [];
  return [
    {
      uid: "existing-image",
      name: url.split("/").pop() || "image",
      status: "done",
      url,
    },
  ];
};

const buildJobPayload = (values, imageFileList) => {
  const payload = { ...values };
  if (imageFileList[0]?.originFileObj) {
    payload.image = imageFileList[0].originFileObj;
  }
  return payload;
};

const Jobs = () => {
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
  } = useJobsStore();

  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [createImage, setCreateImage] = useState([]);
  const [editImage, setEditImage] = useState([]);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingJob, setViewingJob] = useState(null);
  const [applicationsJob, setApplicationsJob] = useState(null);
  const [isApplicationsOpen, setIsApplicationsOpen] = useState(false);

  useEffect(() => {
    fetchList();
  }, [page, perPage]);

  const resetCreateModal = () => {
    createForm.resetFields();
    setCreateImage([]);
  };

  const resetEditModal = () => {
    editForm.resetFields();
    setEditImage([]);
    setEditingId(null);
  };

  const handleView = useCallback((record) => {
    setViewingJob(record);
    setViewModalOpen(true);
  }, []);

  const handleEditOpen = useCallback(
    (record) => {
      setEditingId(record.id);
      editForm.setFieldsValue(deriveJobFormValues(record));
      setEditImage(remoteImageToFileList(record.image));
      setIsEditOpen(true);
    },
    [editForm]
  );

  const handleViewApplications = useCallback((record) => {
    setApplicationsJob(record);
    setIsApplicationsOpen(true);
  }, []);

  const columns = useJobTableColumns({
    remove,
    onView: handleView,
    onEdit: handleEditOpen,
    onViewApplications: handleViewApplications,
  });

  const handleCreate = async () => {
    try {
      await createForm.validateFields();
      const values = createForm.getFieldsValue(true);
      const payload = buildJobPayload(values, createImage);
      await create(payload);
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

  const handleUpdate = async () => {
    try {
      await editForm.validateFields();
      const values = editForm.getFieldsValue(true);
      const payload = buildJobPayload(values, editImage);
      await update(editingId, payload);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Jobs</h2>
          <p className="text-gray-600">
            Manage job postings, requirements, and applications.
          </p>
        </div>
        <Space wrap>
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
            Add Job
          </Button>
        </Space>
      </div>

      <Table
        rowKey={(record) => record.id}
        columns={columns}
        scroll={{ x: "max-content" }}
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
        title="Add Job"
        open={isCreateOpen}
        onCancel={() => {
          setIsCreateOpen(false);
          resetCreateModal();
        }}
        onOk={handleCreate}
        okText="Create"
        confirmLoading={isLoading}
        width={900}
      >
        <JobForm
          form={createForm}
          imageFileList={createImage}
          onImageChange={setCreateImage}
        />
      </Modal>

      <Modal
        title="Update Job"
        open={isEditOpen}
        onCancel={() => {
          setIsEditOpen(false);
          resetEditModal();
        }}
        onOk={handleUpdate}
        okText="Update"
        confirmLoading={isLoading}
        width={900}
      >
        <JobForm
          form={editForm}
          imageFileList={editImage}
          onImageChange={setEditImage}
          isEdit
        />
      </Modal>

      <JobViewModal
        open={viewModalOpen}
        job={viewingJob}
        onClose={() => {
          setViewModalOpen(false);
          setViewingJob(null);
        }}
      />

      <JobApplicationsModal
        open={isApplicationsOpen}
        job={applicationsJob}
        onClose={() => {
          setIsApplicationsOpen(false);
          setApplicationsJob(null);
        }}
      />
    </div>
  );
};

export default Jobs;
