import { useCallback, useEffect, useState } from "react";
import { Button, Form, Modal, Select, Space } from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import SortableTable, { DragHandle } from "../../components/common/SortableTable.jsx";
import { useFeaturedCampaignsStore } from "../../store/featuredCampaignsStore.js";
import { useTranslateStore } from "../../store/translateStore.js";
import { LANG_OPTIONS } from "../../constants/language.js";
import {
  buildFeaturedPayload,
  deriveGalleryImageItems,
  deriveVideoItems,
  EMPTY_TRANSLATION_FIELDS,
  extractExistingMediaId,
  parseEngagementRate,
  remoteUrlToUploadFile,
  translateFeaturedFields,
} from "./featuredHelpers.js";
import { FeaturedCampaignForm } from "./FeaturedCampaignForm.jsx";
import { FeaturedCampaignViewModal } from "./FeaturedCampaignViewModal.jsx";
import { useAuthStore } from "../../store/auth.js";
import { useFeaturedTableColumns } from "./useFeaturedTableColumns.jsx";

const SUPER_ADMIN_ROLE = "super_admin";

const FeaturedCampaigns = () => {
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
    reorder,
  } = useFeaturedCampaignsStore();

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
  const [viewingCampaign, setViewingCampaign] = useState(null);
  const [expandedBriefs, setExpandedBriefs] = useState(new Set());
  const [expandedStrategies, setExpandedStrategies] = useState(new Set());

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

  const handleEditOpen = useCallback((campaign) => {
    setEditingId(campaign.id);
    editForm.setFieldsValue({
      title_en: campaign.title_en ?? campaign.title ?? "",
      title_ar: campaign.title_ar ?? "",
      title_fr: campaign.title_fr ?? "",
      subtitle_en: campaign.subtitle_en ?? campaign.subtitle ?? "",
      subtitle_ar: campaign.subtitle_ar ?? "",
      subtitle_fr: campaign.subtitle_fr ?? "",
      objective_en: campaign.objective_en ?? campaign.objective ?? "",
      objective_ar: campaign.objective_ar ?? "",
      objective_fr: campaign.objective_fr ?? "",
      brief_en: campaign.brief_en ?? campaign.brief ?? "",
      brief_ar: campaign.brief_ar ?? "",
      brief_fr: campaign.brief_fr ?? "",
      strategy_en: campaign.strategy_en ?? campaign.strategy ?? "",
      strategy_ar: campaign.strategy_ar ?? "",
      strategy_fr: campaign.strategy_fr ?? "",
      reach: campaign.reach ?? null,
      views: campaign.views ?? null,
      engagement_rate: parseEngagementRate(campaign),
    });

    const mainImageFile = remoteUrlToUploadFile(
      campaign.main_image ?? campaign.logo,
      { uidSuffix: "main-image" }
    );
    setEditLogoFileList(mainImageFile ? [mainImageFile] : []);

    const imageItems = deriveGalleryImageItems(campaign);
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

    const videoItems = deriveVideoItems(campaign);
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
    setViewingCampaign(record);
    setViewModalOpen(true);
  }, []);

  const handleViewClose = useCallback(() => {
    setViewModalOpen(false);
    setViewingCampaign(null);
  }, []);

  const baseColumns = useFeaturedTableColumns({
    remove,
    expandedBriefs,
    setExpandedBriefs,
    expandedStrategies,
    setExpandedStrategies,
    onView: handleViewOpen,
    onEdit: handleEditOpen,
    isSuperAdmin,
  });

  const columns = [
    {
      title: "",
      key: "sort",
      width: 48,
      align: "center",
      render: () => <DragHandle />,
    },
    ...baseColumns,
  ];

  const handleCreate = async () => {
    try {
      await createForm.validateFields();
      const values = createForm.getFieldsValue(true);

      let translated = { ...EMPTY_TRANSLATION_FIELDS };
      if (autoTranslateCreate) {
        setIsCreateTranslating(true);
        translated = await translateFeaturedFields(translateText, {
          title_en: values.title_en,
          subtitle_en: values.subtitle_en,
          objective_en: values.objective_en,
          brief_en: values.brief_en,
          strategy_en: values.strategy_en,
        });
        setIsCreateTranslating(false);
      }

      const payload = buildFeaturedPayload(
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
        translated = await translateFeaturedFields(translateText, {
          title_en: values.title_en,
          subtitle_en: values.subtitle_en,
          objective_en: values.objective_en,
          brief_en: values.brief_en,
          strategy_en: values.strategy_en,
        });
        setIsEditTranslating(false);
      }

      const payload = buildFeaturedPayload(
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
          <h2 className="text-2xl font-semibold">Featured Campaigns</h2>
          <p className="text-gray-600">
            Manage featured campaigns including reach, views, and media.
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
          {isSuperAdmin && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                resetCreateModal();
                setIsCreateOpen(true);
              }}
            >
              Add Campaign
            </Button>
          )}
        </Space>
      </div>

      <SortableTable
        rowKey={(record) => record.id}
        columns={columns}
        onReorder={reorder}
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
        title="Add Featured Campaign"
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
        <FeaturedCampaignForm
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
        title="Update Featured Campaign"
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
        <FeaturedCampaignForm
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

      <FeaturedCampaignViewModal
        open={viewModalOpen}
        campaign={viewingCampaign}
        onClose={handleViewClose}
      />
    </div>
  );
};

export default FeaturedCampaigns;
