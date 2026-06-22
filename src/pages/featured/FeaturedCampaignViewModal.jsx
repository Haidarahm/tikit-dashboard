import { Button, Image, Modal, Space } from "antd";

export function FeaturedCampaignViewModal({ open, campaign, onClose }) {
  return (
    <Modal
      title="Campaign Details"
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
      width={900}
    >
      {campaign && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>ID:</strong> {campaign.id}
            </div>
            <div>
              <strong>Title:</strong> {campaign.title_en || campaign.title || "-"}
            </div>
            <div>
              <strong>Title (AR):</strong> {campaign.title_ar || "-"}
            </div>
            <div>
              <strong>Title (FR):</strong> {campaign.title_fr || "-"}
            </div>
            <div>
              <strong>Subtitle:</strong>{" "}
              {campaign.subtitle_en || campaign.subtitle || "-"}
            </div>
            <div>
              <strong>Subtitle (AR):</strong> {campaign.subtitle_ar || "-"}
            </div>
            <div>
              <strong>Subtitle (FR):</strong> {campaign.subtitle_fr || "-"}
            </div>
            <div>
              <strong>Reach:</strong> {campaign.reach || "-"}
            </div>
            <div>
              <strong>Views:</strong> {campaign.views || "-"}
            </div>
            <div>
              <strong>Engagement Rate:</strong> {campaign.engagement_rate || "-"}%
            </div>
          </div>

          <div>
            <strong>Objective (EN):</strong>
            <p className="mt-1">{campaign.objective_en || campaign.objective || "-"}</p>
          </div>
          <div>
            <strong>Objective (AR):</strong>
            <p className="mt-1">{campaign.objective_ar || "-"}</p>
          </div>
          <div>
            <strong>Objective (FR):</strong>
            <p className="mt-1">{campaign.objective_fr || "-"}</p>
          </div>

          <div>
            <strong>Brief (EN):</strong>
            <p className="mt-1">{campaign.brief_en || campaign.brief || "-"}</p>
          </div>
          <div>
            <strong>Brief (AR):</strong>
            <p className="mt-1">{campaign.brief_ar || "-"}</p>
          </div>
          <div>
            <strong>Brief (FR):</strong>
            <p className="mt-1">{campaign.brief_fr || "-"}</p>
          </div>

          <div>
            <strong>Strategy (EN):</strong>
            <p className="mt-1">{campaign.strategy_en || campaign.strategy || "-"}</p>
          </div>
          <div>
            <strong>Strategy (AR):</strong>
            <p className="mt-1">{campaign.strategy_ar || "-"}</p>
          </div>
          <div>
            <strong>Strategy (FR):</strong>
            <p className="mt-1">{campaign.strategy_fr || "-"}</p>
          </div>

          {(campaign.main_image || campaign.logo) && (
            <div>
              <strong>Main Image:</strong>
              <div className="mt-2">
                <Image
                  src={campaign.main_image || campaign.logo}
                  width={100}
                  height={100}
                  style={{ objectFit: "cover" }}
                  preview={{ mask: "Preview" }}
                />
              </div>
            </div>
          )}

          {Array.isArray(campaign.images) && campaign.images.length > 0 && (
            <div>
              <strong>Images:</strong>
              <div className="mt-2">
                <Space size={[8, 8]} wrap>
                  {campaign.images.map((img, index) => (
                    <Image
                      key={img || index}
                      src={img}
                      width={100}
                      height={100}
                      style={{ objectFit: "cover" }}
                      preview={{ mask: "Preview" }}
                    />
                  ))}
                </Space>
              </div>
            </div>
          )}

          {Array.isArray(campaign.videos) && campaign.videos.length > 0 && (
            <div>
              <strong>Videos:</strong>
              <div className="mt-2">
                <Space size={[8, 8]} wrap direction="vertical">
                  {campaign.videos.map((video, index) => (
                    <video
                      key={video || index}
                      src={video}
                      controls
                      style={{ maxWidth: "100%", maxHeight: "300px" }}
                    />
                  ))}
                </Space>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <strong>Created At:</strong>{" "}
              {campaign.created_at
                ? new Date(campaign.created_at).toLocaleString()
                : "-"}
            </div>
            <div>
              <strong>Updated At:</strong>{" "}
              {campaign.updated_at
                ? new Date(campaign.updated_at).toLocaleString()
                : "-"}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
