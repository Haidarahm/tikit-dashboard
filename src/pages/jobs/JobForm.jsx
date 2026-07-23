import {
  Button,
  Divider,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Upload,
} from "antd";
import {
  DeleteOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  CUSTOM_FIELD_TYPE_OPTIONS,
  EXPERIENCE_LEVEL_OPTIONS,
  JOB_STATUS_OPTIONS,
  JOB_TYPE_OPTIONS,
  WORK_MODE_OPTIONS,
  fieldTypeSupportsOptions,
} from "./jobConstants.js";

export function JobForm({
  form,
  imageFileList,
  onImageChange,
  isEdit = false,
}) {
  const requiredWhenCreate = (message) =>
    isEdit ? [] : [{ required: true, message }];

  return (
    <Form form={form} layout="vertical">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Form.Item
          name="job_title"
          label="Job Title"
          rules={requiredWhenCreate("Job title is required")}
        >
          <Input placeholder="Enter job title" />
        </Form.Item>
        <Form.Item
          name="job_category"
          label="Category"
          rules={requiredWhenCreate("Category is required")}
        >
          <Input placeholder="Enter job category" />
        </Form.Item>
        <Form.Item
          name="job_type"
          label="Job Type"
          rules={requiredWhenCreate("Job type is required")}
        >
          <Select placeholder="Select job type" options={JOB_TYPE_OPTIONS} />
        </Form.Item>
        <Form.Item
          name="work_mode"
          label="Work Mode"
          rules={requiredWhenCreate("Work mode is required")}
        >
          <Select placeholder="Select work mode" options={WORK_MODE_OPTIONS} />
        </Form.Item>
        <Form.Item
          name="city"
          label="City"
          rules={requiredWhenCreate("City is required")}
        >
          <Input placeholder="Enter city" />
        </Form.Item>
        <Form.Item
          name="country"
          label="Country"
          rules={requiredWhenCreate("Country is required")}
        >
          <Input placeholder="Enter country" />
        </Form.Item>
        <Form.Item
          name="experience_level"
          label="Experience Level"
          rules={requiredWhenCreate("Experience level is required")}
        >
          <Select
            placeholder="Select experience level"
            options={EXPERIENCE_LEVEL_OPTIONS}
          />
        </Form.Item>
        <Form.Item
          name="experience_years_min"
          label="Minimum Experience (years)"
          rules={requiredWhenCreate("Minimum experience is required")}
        >
          <InputNumber style={{ width: "100%" }} min={0} max={35} />
        </Form.Item>
        <Form.Item
          name="education_level"
          label="Education Level"
          rules={requiredWhenCreate("Education level is required")}
        >
          <Input placeholder="Enter education level" />
        </Form.Item>
        <Form.Item
          name="application_deadline"
          label="Application Deadline"
          tooltip="Format: YYYY-MM-DD"
        >
          <Input placeholder="YYYY-MM-DD" />
        </Form.Item>
        {isEdit && (
          <Form.Item name="job_status" label="Status">
            <Select placeholder="Select status" options={JOB_STATUS_OPTIONS} />
          </Form.Item>
        )}
      </div>

      <Form.Item
        name="job_description"
        label="Job Description"
        rules={requiredWhenCreate("Job description is required")}
      >
        <Input.TextArea rows={4} placeholder="Enter job description" />
      </Form.Item>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Form.Item name="skills" label="Skills">
          <Select
            mode="tags"
            tokenSeparators={[","]}
            placeholder="Type and press enter"
          />
        </Form.Item>
        <Form.Item name="responsibilities" label="Responsibilities">
          <Select
            mode="tags"
            tokenSeparators={[","]}
            placeholder="Type and press enter"
          />
        </Form.Item>
        <Form.Item name="requirements" label="Requirements">
          <Select
            mode="tags"
            tokenSeparators={[","]}
            placeholder="Type and press enter"
          />
        </Form.Item>
      </div>

      <Divider>Custom Application Fields</Divider>
      <Form.List name="custom_fields">
        {(fields, { add, remove }) => (
          <div className="space-y-4">
            {fields.map(({ key, name, ...restField }) => (
              <div
                key={key}
                className="rounded-lg border border-gray-200 p-4 space-y-3"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <Form.Item
                    {...restField}
                    name={[name, "field_key"]}
                    label="Field Key"
                    rules={[{ required: true, message: "Field key is required" }]}
                  >
                    <Input placeholder="e.g. portfolio_url" />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "field_label"]}
                    label="Field Label"
                    rules={[
                      { required: true, message: "Field label is required" },
                    ]}
                  >
                    <Input placeholder="e.g. Portfolio URL" />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "field_type"]}
                    label="Field Type"
                    rules={[
                      { required: true, message: "Field type is required" },
                    ]}
                  >
                    <Select
                      placeholder="Select type"
                      options={CUSTOM_FIELD_TYPE_OPTIONS}
                    />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "display_order"]}
                    label="Display Order"
                  >
                    <InputNumber style={{ width: "100%" }} min={0} />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "is_required"]}
                    label="Required"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </div>
                <Form.Item
                  noStyle
                  shouldUpdate={(prev, curr) =>
                    prev?.custom_fields?.[name]?.field_type !==
                    curr?.custom_fields?.[name]?.field_type
                  }
                >
                  {({ getFieldValue }) =>
                    fieldTypeSupportsOptions(
                      getFieldValue(["custom_fields", name, "field_type"])
                    ) ? (
                      <Form.Item
                        {...restField}
                        name={[name, "options"]}
                        label="Options"
                      >
                        <Select
                          mode="tags"
                          tokenSeparators={[","]}
                          placeholder="Type and press enter"
                        />
                      </Form.Item>
                    ) : null
                  }
                </Form.Item>
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => remove(name)}
                >
                  Remove Field
                </Button>
              </div>
            ))}
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={() =>
                add({
                  is_required: false,
                  display_order: fields.length,
                  options: [],
                })
              }
              block
            >
              Add Custom Field
            </Button>
          </div>
        )}
      </Form.List>

      <Divider>Image</Divider>
      <Form.Item label="Job Image" tooltip="Optional job image">
        <Upload
          fileList={imageFileList}
          beforeUpload={() => false}
          listType="picture-card"
          maxCount={1}
          accept="image/*"
          onChange={({ fileList }) => onImageChange(fileList)}
        >
          {imageFileList.length === 0 && (
            <div>
              <UploadOutlined />
              <div style={{ marginTop: 8 }}>Upload Image</div>
            </div>
          )}
        </Upload>
      </Form.Item>
    </Form>
  );
}
