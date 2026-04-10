import {
  Button,
  Divider,
  Form,
  Input,
  InputNumber,
  Switch,
  Upload,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";

export function ShowcaseProjectForm({
  form,
  logoFileList,
  onLogoChange,
  imagesFileList,
  onImagesChange,
  videosFileList,
  onVideosChange,
  existingImagesFileList = [],
  onExistingImagesChange,
  existingVideosFileList = [],
  onExistingVideosChange,
  isEdit = false,
  autoTranslate = true,
  onToggleAutoTranslate,
}) {
  return (
    <Form form={form} layout="vertical">
      <div className="mb-4 flex items-center gap-3">
        <span className="text-sm text-gray-600">Translation:</span>
        <Switch
          checked={autoTranslate}
          onChange={onToggleAutoTranslate}
          checkedChildren="Auto"
          unCheckedChildren="Manual"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Form.Item
          name="title_en"
          label="Title (EN)"
          rules={isEdit ? [] : [{ required: true, message: "Title is required" }]}
        >
          <Input placeholder="Enter English title" />
        </Form.Item>
        <Form.Item
          name="subtitle_en"
          label="Subtitle (EN)"
          rules={isEdit ? [] : [{ required: true, message: "Subtitle is required" }]}
        >
          <Input placeholder="Enter English subtitle" />
        </Form.Item>
        <Form.Item
          name="objective_en"
          label="Objective (EN)"
          rules={isEdit ? [] : [{ required: true, message: "Objective is required" }]}
        >
          <Input placeholder="Enter English objective" />
        </Form.Item>
        <Form.Item name="brief_en" label="Brief (EN)">
          <Input.TextArea rows={3} placeholder="Enter English brief" />
        </Form.Item>
        <Form.Item name="strategy_en" label="Strategy (EN)">
          <Input.TextArea rows={3} placeholder="Enter English strategy" />
        </Form.Item>
        {!autoTranslate && (
          <>
            <Form.Item name="title_ar" label="Title (AR)">
              <Input placeholder="Enter Arabic title" />
            </Form.Item>
            <Form.Item name="title_fr" label="Title (FR)">
              <Input placeholder="Enter French title" />
            </Form.Item>
            <Form.Item name="subtitle_ar" label="Subtitle (AR)">
              <Input placeholder="Enter Arabic subtitle" />
            </Form.Item>
            <Form.Item name="subtitle_fr" label="Subtitle (FR)">
              <Input placeholder="Enter French subtitle" />
            </Form.Item>
            <Form.Item name="objective_ar" label="Objective (AR)">
              <Input placeholder="Enter Arabic objective" />
            </Form.Item>
            <Form.Item name="objective_fr" label="Objective (FR)">
              <Input placeholder="Enter French objective" />
            </Form.Item>
            <Form.Item name="brief_ar" label="Brief (AR)">
              <Input.TextArea rows={3} placeholder="Enter Arabic brief" />
            </Form.Item>
            <Form.Item name="brief_fr" label="Brief (FR)">
              <Input.TextArea rows={3} placeholder="Enter French brief" />
            </Form.Item>
            <Form.Item name="strategy_ar" label="Strategy (AR)">
              <Input.TextArea rows={3} placeholder="Enter Arabic strategy" />
            </Form.Item>
            <Form.Item name="strategy_fr" label="Strategy (FR)">
              <Input.TextArea rows={3} placeholder="Enter French strategy" />
            </Form.Item>
          </>
        )}
        <Form.Item
          name="reach"
          label="Reach"
          rules={isEdit ? [] : [{ required: true, message: "Reach is required" }]}
        >
          <InputNumber style={{ width: "100%" }} min={0} />
        </Form.Item>
        <Form.Item
          name="views"
          label="Views"
          rules={isEdit ? [] : [{ required: true, message: "Views are required" }]}
        >
          <InputNumber style={{ width: "100%" }} min={0} />
        </Form.Item>
        <Form.Item
          name="engagement_rate"
          label="Engagement Rate (%)"
          rules={
            isEdit ? [] : [{ required: true, message: "Engagement rate is required" }]
          }
        >
          <InputNumber style={{ width: "100%" }} min={0} max={100} />
        </Form.Item>
      </div>

      <Form.Item label="Main Image" required={!isEdit} tooltip="Upload project Main Image">
        <Upload
          fileList={logoFileList}
          beforeUpload={() => false}
          listType="picture-card"
          maxCount={1}
          accept="image/*"
          onChange={({ fileList }) => onLogoChange(fileList)}
        >
          {logoFileList.length === 0 && (
            <div>
              <UploadOutlined />
              <div style={{ marginTop: 8 }}>Upload Logo</div>
            </div>
          )}
        </Upload>
      </Form.Item>

      <Form.Item
        label="Gallery Images"
        required={!isEdit}
        tooltip="Upload one or more showcase images"
      >
        {isEdit && (
          <>
            <div className="mb-2 text-sm text-gray-600">Existing images</div>
            <Upload
              fileList={existingImagesFileList}
              listType="picture-card"
              onChange={({ fileList }) => onExistingImagesChange?.(fileList)}
            />
            <Divider className="my-3">New images</Divider>
          </>
        )}
        <Upload
          fileList={imagesFileList}
          beforeUpload={() => false}
          listType="picture-card"
          accept="image/*"
          multiple
          onChange={({ fileList }) => onImagesChange(fileList)}
        >
          <div>
            <UploadOutlined />
            <div style={{ marginTop: 8 }}>Upload Images</div>
          </div>
        </Upload>
      </Form.Item>

      <Form.Item label="Videos" tooltip="Upload MP4 video files">
        {isEdit && (
          <>
            <div className="mb-2 text-sm text-gray-600">Existing videos</div>
            <Upload
              fileList={existingVideosFileList}
              listType="text"
              onChange={({ fileList }) => onExistingVideosChange?.(fileList)}
            />
            <Divider className="my-3">New videos</Divider>
          </>
        )}
        <Upload
          fileList={videosFileList}
          beforeUpload={() => false}
          listType="text"
          accept="video/mp4"
          multiple
          onChange={({ fileList }) => onVideosChange(fileList)}
        >
          <Button icon={<UploadOutlined />}>Upload Videos (MP4)</Button>
        </Upload>
      </Form.Item>
    </Form>
  );
}
