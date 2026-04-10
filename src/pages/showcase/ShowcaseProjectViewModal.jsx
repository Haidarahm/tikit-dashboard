import { Button, Image, Modal, Space } from "antd";

export function ShowcaseProjectViewModal({ open, project, onClose }) {
  return (
    <Modal
      title="Project Details"
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
      width={900}
    >
      {project && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>ID:</strong> {project.id}
            </div>
            <div>
              <strong>Title:</strong> {project.title_en || project.title || "-"}
            </div>
            <div>
              <strong>Title (AR):</strong> {project.title_ar || "-"}
            </div>
            <div>
              <strong>Title (FR):</strong> {project.title_fr || "-"}
            </div>
            <div>
              <strong>Subtitle:</strong> {project.subtitle_en || project.subtitle || "-"}
            </div>
            <div>
              <strong>Subtitle (AR):</strong> {project.subtitle_ar || "-"}
            </div>
            <div>
              <strong>Subtitle (FR):</strong> {project.subtitle_fr || "-"}
            </div>
            <div>
              <strong>Reach:</strong> {project.reach || "-"}
            </div>
            <div>
              <strong>Views:</strong> {project.views || "-"}
            </div>
            <div>
              <strong>Engagement Rate:</strong> {project.engagement_rate || "-"}%
            </div>
          </div>

          <div>
            <strong>Objective (EN):</strong>
            <p className="mt-1">{project.objective_en || project.objective || "-"}</p>
          </div>
          <div>
            <strong>Objective (AR):</strong>
            <p className="mt-1">{project.objective_ar || "-"}</p>
          </div>
          <div>
            <strong>Objective (FR):</strong>
            <p className="mt-1">{project.objective_fr || "-"}</p>
          </div>

          <div>
            <strong>Brief (EN):</strong>
            <p className="mt-1">{project.brief_en || project.brief || "-"}</p>
          </div>
          <div>
            <strong>Brief (AR):</strong>
            <p className="mt-1">{project.brief_ar || "-"}</p>
          </div>
          <div>
            <strong>Brief (FR):</strong>
            <p className="mt-1">{project.brief_fr || "-"}</p>
          </div>

          <div>
            <strong>Strategy (EN):</strong>
            <p className="mt-1">{project.strategy_en || project.strategy || "-"}</p>
          </div>
          <div>
            <strong>Strategy (AR):</strong>
            <p className="mt-1">{project.strategy_ar || "-"}</p>
          </div>
          <div>
            <strong>Strategy (FR):</strong>
            <p className="mt-1">{project.strategy_fr || "-"}</p>
          </div>

          {(project.main_image || project.logo) && (
            <div>
              <strong>Main Image:</strong>
              <div className="mt-2">
                <Image
                  src={project.main_image || project.logo}
                  width={100}
                  height={100}
                  style={{ objectFit: "cover" }}
                  preview={{ mask: "Preview" }}
                />
              </div>
            </div>
          )}

          {Array.isArray(project.images) && project.images.length > 0 && (
            <div>
              <strong>Images:</strong>
              <div className="mt-2">
                <Space size={[8, 8]} wrap>
                  {project.images.map((img, index) => (
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

          {Array.isArray(project.videos) && project.videos.length > 0 && (
            <div>
              <strong>Videos:</strong>
              <div className="mt-2">
                <Space size={[8, 8]} wrap direction="vertical">
                  {project.videos.map((video, index) => (
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
              <strong>Created At:</strong> {new Date(project.created_at).toLocaleString()}
            </div>
            <div>
              <strong>Updated At:</strong> {new Date(project.updated_at).toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
