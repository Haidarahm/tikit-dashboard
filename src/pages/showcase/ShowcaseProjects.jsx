import { useCallback, useEffect, useState } from "react";
import { Button, Form, Modal, Select, Space, Table, Upload } from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import { useShowcaseProjectsStore } from "../../store/showcaseProjectsStore.js";
import { useTranslateStore } from "../../store/translateStore.js";
import { LANG_OPTIONS } from "../../constants/language.js";
import {
  buildShowcasePayload,
  deriveGalleryImageItems,
  deriveVideoItems,
  EMPTY_TRANSLATION_FIELDS,
  extractExistingMediaId,
  parseEngagementRate,
  remoteUrlToUploadFile,
  translateShowcaseFields,
} from "./showcaseHelpers.js";
import { ShowcaseProjectForm } from "./ShowcaseProjectForm.jsx";
import { ShowcaseProjectViewModal } from "./ShowcaseProjectViewModal.jsx";
import { useAuthStore } from "../../store/auth.js";
import { useShowcaseTableColumns } from "./useShowcaseTableColumns.jsx";

const SUPER_ADMIN_ROLE = "super_admin";

const ShowcaseProjects = () => {
  const user = useAuthStore((s) => s.user);
  const isSuperAdmin = user?.role === SUPER_ADMIN_ROLE;
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
    importExcel,
  } = useShowcaseProjectsStore();

  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [logoFileList, setLogoFileList] = useState([]);
  const [imagesFileList, setImagesFileList] = useState([]);
  const [videosFileList, setVideosFileList] = useState([]);
  const [editLogoFileList, setEditLogoFileList] = useState([]);
  const [editExistingImages, setEditExistingImages] = useState([]);
  const [editExistingVideos, setEditExistingVideos] = useState([]);
  const [editNewImagesFileList, setEditNewImagesFileList] = useState([]);
  const [editNewVideosFileList, setEditNewVideosFileList] = useState([]);
  const [editInitialMediaIds, setEditInitialMediaIds] = useState([]);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingProject, setViewingProject] = useState(null);
  const [expandedBriefs, setExpandedBriefs] = useState(new Set());
  const [expandedStrategies, setExpandedStrategies] = useState(new Set());
  const [importFileList, setImportFileList] = useState([]);

  const [isCreateTranslating, setIsCreateTranslating] = useState(false);
  const [isEditTranslating, setIsEditTranslating] = useState(false);
  const [autoTranslateCreate, setAutoTranslateCreate] = useState(true);
  const [autoTranslateEdit, setAutoTranslateEdit] = useState(true);

  const translateText = useTranslateStore((state) => state.translateText);

  useEffect(() => {
    fetchList();
  }, [page, perPage, lang]);

  const resetCreateModal = () => {
    createForm.resetFields();
    setLogoFileList([]);
    setImagesFileList([]);
    setVideosFileList([]);
    setAutoTranslateCreate(true);
  };

  const resetEditModal = () => {
    editForm.resetFields();
    setEditLogoFileList([]);
    setEditExistingImages([]);
    setEditExistingVideos([]);
    setEditNewImagesFileList([]);
    setEditNewVideosFileList([]);
    setEditInitialMediaIds([]);
    setAutoTranslateEdit(true);
    setEditingId(null);
  };

  const handleImport = async () => {
    const file = importFileList[0]?.originFileObj;
    if (!file) {
      toast.error("Please select a file to import");
      return;
    }
    try {
      await importExcel(file);
      setImportFileList([]);
    } catch {
      // toast already handled in store
    }
  };

  const handleEditOpen = useCallback((project) => {
    setEditingId(project.id);
    editForm.setFieldsValue({
      title_en: project.title_en ?? project.title ?? "",
      title_ar: project.title_ar ?? "",
      title_fr: project.title_fr ?? "",
      subtitle_en: project.subtitle_en ?? project.subtitle ?? "",
      subtitle_ar: project.subtitle_ar ?? "",
      subtitle_fr: project.subtitle_fr ?? "",
      objective_en: project.objective_en ?? project.objective ?? "",
      objective_ar: project.objective_ar ?? "",
      objective_fr: project.objective_fr ?? "",
      brief_en: project.brief_en ?? project.brief ?? "",
      brief_ar: project.brief_ar ?? "",
      brief_fr: project.brief_fr ?? "",
      strategy_en: project.strategy_en ?? project.strategy ?? "",
      strategy_ar: project.strategy_ar ?? "",
      strategy_fr: project.strategy_fr ?? "",
      reach: project.reach ?? null,
      views: project.views ?? null,
      engagement_rate: parseEngagementRate(project),
    });

    const mainImageFile = remoteUrlToUploadFile(
      project.main_image ?? project.logo,
      { uidSuffix: "main-image" }
    );
    setEditLogoFileList(mainImageFile ? [mainImageFile] : []);

    const imageItems = deriveGalleryImageItems(project);
    setEditExistingImages(
      imageItems
        .map((item, i) =>
          remoteUrlToUploadFile(item.url, {
            uidSuffix: `img-${item.id ?? i}`,
            mediaId: item.id,
          })
        )
        .filter(Boolean)
    );

    const videoItems = deriveVideoItems(project);
    setEditExistingVideos(
      videoItems
        .map((item, i) =>
          remoteUrlToUploadFile(item.url, {
            uidSuffix: `vid-${item.id ?? i}`,
            mediaId: item.id,
          })
        )
        .filter(Boolean)
    );
    const initialIds = [...imageItems, ...videoItems]
      .map((item) => item.id)
      .filter((id) => Number.isInteger(Number(id)))
      .map((id) => Number(id));
    setEditInitialMediaIds(initialIds);
    setEditNewImagesFileList([]);
    setEditNewVideosFileList([]);

    setIsEditOpen(true);
  }, [editForm]);

  const handleViewOpen = useCallback((record) => {
    setViewingProject(record);
    setViewModalOpen(true);
  }, []);

  const handleViewClose = useCallback(() => {
    setViewModalOpen(false);
    setViewingProject(null);
  }, []);

  const columns = useShowcaseTableColumns({
    remove,
    expandedBriefs,
    setExpandedBriefs,
    expandedStrategies,
    setExpandedStrategies,
    onView: handleViewOpen,
    onEdit: handleEditOpen,
    isSuperAdmin,
  });

  const handleCreate = async () => {
    try {
      await createForm.validateFields();
      const values = createForm.getFieldsValue(true);

      let translated = { ...EMPTY_TRANSLATION_FIELDS };
      if (autoTranslateCreate) {
        setIsCreateTranslating(true);
        translated = await translateShowcaseFields(translateText, {
          title_en: values.title_en,
          subtitle_en: values.subtitle_en,
          objective_en: values.objective_en,
          brief_en: values.brief_en,
          strategy_en: values.strategy_en,
        });
        setIsCreateTranslating(false);
      }

      const payload = buildShowcasePayload(
        values,
        logoFileList,
        imagesFileList,
        videosFileList
      );
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

  const handleUpdate = async () => {
    try {
      await editForm.validateFields();
      const values = editForm.getFieldsValue(true);

      let translated = { ...EMPTY_TRANSLATION_FIELDS };
      if (autoTranslateEdit) {
        setIsEditTranslating(true);
        translated = await translateShowcaseFields(translateText, {
          title_en: values.title_en,
          subtitle_en: values.subtitle_en,
          objective_en: values.objective_en,
          brief_en: values.brief_en,
          strategy_en: values.strategy_en,
        });
        setIsEditTranslating(false);
      }

      const payload = buildShowcasePayload(
        values,
        editLogoFileList,
        editNewImagesFileList,
        editNewVideosFileList
      );
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
      }
      const keptExistingIds = new Set(
        [...editExistingImages, ...editExistingVideos]
          .map((file) => extractExistingMediaId(file))
          .filter((id) => Number.isInteger(id))
      );
      const removeMediaIds = editInitialMediaIds.filter(
        (id) => !keptExistingIds.has(id)
      );
      if (removeMediaIds.length > 0) {
        payload.remove_media_ids = removeMediaIds;
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Showcase Projects</h2>
          <p className="text-gray-600">
            Manage featured showcase projects including reach, views, and media.
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
            fileList={importFileList}
            beforeUpload={() => false}
            maxCount={1}
            accept=".xlsx,.xls"
            onChange={({ fileList }) => setImportFileList(fileList)}
            showUploadList={{ showRemoveIcon: true }}
          >
            <Button icon={<UploadOutlined />}>Select Excel</Button>
          </Upload>
          <Button
            type="default"
            onClick={handleImport}
            disabled={importFileList.length === 0}
            loading={isLoading}
          >
            Import
          </Button>
          {isSuperAdmin && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                resetCreateModal();
                setIsCreateOpen(true);
              }}
            >
              Add Project
            </Button>
          )}
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
        title="Add Showcase Project"
        open={isCreateOpen}
        onCancel={() => {
          setIsCreateOpen(false);
          resetCreateModal();
        }}
        onOk={handleCreate}
        okText="Create"
        confirmLoading={isLoading || isCreateTranslating}
        width={900}
      >
        <ShowcaseProjectForm
          form={createForm}
          logoFileList={logoFileList}
          onLogoChange={setLogoFileList}
          imagesFileList={imagesFileList}
          onImagesChange={setImagesFileList}
          videosFileList={videosFileList}
          onVideosChange={setVideosFileList}
          autoTranslate={autoTranslateCreate}
          onToggleAutoTranslate={setAutoTranslateCreate}
        />
      </Modal>

      <Modal
        title="Update Showcase Project"
        open={isEditOpen}
        onCancel={() => {
          setIsEditOpen(false);
          resetEditModal();
        }}
        onOk={handleUpdate}
        okText="Update"
        confirmLoading={isLoading || isEditTranslating}
        width={900}
      >
        <ShowcaseProjectForm
          form={editForm}
          logoFileList={editLogoFileList}
          onLogoChange={setEditLogoFileList}
          imagesFileList={editNewImagesFileList}
          onImagesChange={setEditNewImagesFileList}
          videosFileList={editNewVideosFileList}
          onVideosChange={setEditNewVideosFileList}
          existingImagesFileList={editExistingImages}
          onExistingImagesChange={setEditExistingImages}
          existingVideosFileList={editExistingVideos}
          onExistingVideosChange={setEditExistingVideos}
          isEdit
          autoTranslate={autoTranslateEdit}
          onToggleAutoTranslate={setAutoTranslateEdit}
        />
      </Modal>

      <ShowcaseProjectViewModal
        open={viewModalOpen}
        project={viewingProject}
        onClose={handleViewClose}
      />
    </div>
  );
};

export default ShowcaseProjects;
