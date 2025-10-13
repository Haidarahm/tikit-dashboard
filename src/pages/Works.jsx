import { useEffect, useMemo, useState } from "react";
import {
  Table,
  Image,
  Select,
  Button,
  Modal,
  Form,
  Input,
  Upload,
  Radio,
  message,
} from "antd";
import { useWorksStore } from "../store/worksStrore.js";

function Works() {
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
  } = useWorksStore();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addForm] = Form.useForm();
  const [mediaType, setMediaType] = useState("image");
  const [imageFileList, setImageFileList] = useState([]);
  const [videoFileList, setVideoFileList] = useState([]);

  useEffect(() => {
    fetchList();
  }, [page, perPage, lang]);

  const columns = useMemo(
    () => [
      {
        title: "ID",
        dataIndex: "id",
        key: "id",
        width: 80,
        render: (v, _r, i) => v ?? i + 1,
      },
      {
        title: "Title",
        dataIndex: "title",
        key: "title",
        ellipsis: true,
      },
      {
        title: "Subtitle",
        dataIndex: "subtitle",
        key: "subtitle",
        ellipsis: true,
      },
      {
        title: "Description",
        dataIndex: "description",
        key: "description",
        ellipsis: true,
      },
      {
        title: "Media",
        key: "media",
        render: (row) => {
          if (row.media_type === "image" && row.media) {
            return (
              <Image src={row.media} width={64} preview={{ mask: "Preview" }} />
            );
          }
          return row.media_type || "-";
        },
        width: 120,
      },
    ],
    []
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-4">
        <h2 className="text-xl font-semibold">Works</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Language:</span>
          <Select
            value={lang}
            style={{ width: 140 }}
            options={[
              { label: "English", value: "en" },
              { label: "Arabic", value: "ar" },
              { label: "French", value: "fr" },
            ]}
            onChange={(value) => {
              setLang(value);
              setPage(1);
            }}
          />
          <Button type="primary" onClick={() => setIsAddOpen(true)}>
            Add Work
          </Button>
        </div>
      </div>
      <Table
        rowKey={(r, i) => r.id ?? i}
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
        title="Add Work"
        open={isAddOpen}
        onCancel={() => {
          setIsAddOpen(false);
          addForm.resetFields();
          setImageFileList([]);
          setVideoFileList([]);
          setMediaType("image");
        }}
        onOk={async () => {
          try {
            const values = await addForm.validateFields();
            const payload = {
              title_en: values.title_en,
              title_ar: values.title_ar,
              title_fr: values.title_fr,
              subtitle_en: values.subtitle_en,
              subtitle_ar: values.subtitle_ar,
              subtitle_fr: values.subtitle_fr,
              description_en: values.description_en,
              description_ar: values.description_ar,
              description_fr: values.description_fr,
              media: null,
            };

            if (mediaType === "image" && imageFileList[0]?.originFileObj) {
              payload.media = imageFileList[0].originFileObj;
            }
            if (mediaType === "video" && videoFileList[0]?.originFileObj) {
              payload.media = videoFileList[0].originFileObj;
            }

            if (!payload.media) {
              message.error("Please upload an image or a video.");
              return;
            }

            await create(payload);
            message.success("Work added successfully");
            setIsAddOpen(false);
            addForm.resetFields();
            setImageFileList([]);
            setVideoFileList([]);
            setMediaType("image");
          } catch (err) {
            // validation or API error
          }
        }}
        confirmLoading={isLoading}
        okText="Create"
      >
        <Form form={addForm} layout="vertical">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Item
              name="title_en"
              label="Title (EN)"
              rules={[{ required: true }]}
            >
              <Input placeholder="Enter English title" />
            </Form.Item>
            <Form.Item
              name="title_ar"
              label="Title (AR)"
              rules={[{ required: true }]}
            >
              <Input placeholder="Enter Arabic title" />
            </Form.Item>
            <Form.Item
              name="title_fr"
              label="Title (FR)"
              rules={[{ required: true }]}
            >
              <Input placeholder="Enter French title" />
            </Form.Item>

            <Form.Item
              name="subtitle_en"
              label="Subtitle (EN)"
              rules={[{ required: true }]}
            >
              <Input placeholder="Enter English subtitle" />
            </Form.Item>
            <Form.Item
              name="subtitle_ar"
              label="Subtitle (AR)"
              rules={[{ required: true }]}
            >
              <Input placeholder="Enter Arabic subtitle" />
            </Form.Item>
            <Form.Item
              name="subtitle_fr"
              label="Subtitle (FR)"
              rules={[{ required: true }]}
            >
              <Input placeholder="Enter French subtitle" />
            </Form.Item>

            <Form.Item
              name="description_en"
              label="Description (EN)"
              rules={[{ required: true }]}
            >
              <Input.TextArea
                rows={3}
                placeholder="Enter English description"
              />
            </Form.Item>
            <Form.Item
              name="description_ar"
              label="Description (AR)"
              rules={[{ required: true }]}
            >
              <Input.TextArea rows={3} placeholder="Enter Arabic description" />
            </Form.Item>
            <Form.Item
              name="description_fr"
              label="Description (FR)"
              rules={[{ required: true }]}
            >
              <Input.TextArea rows={3} placeholder="Enter French description" />
            </Form.Item>
          </div>

          <Form.Item label="Media Type">
            <Radio.Group
              value={mediaType}
              onChange={(e) => setMediaType(e.target.value)}
            >
              <Radio value="image">Image</Radio>
              <Radio value="video">Video</Radio>
            </Radio.Group>
          </Form.Item>

          {mediaType === "image" ? (
            <Form.Item label="Upload Image" required>
              <Upload
                fileList={imageFileList}
                beforeUpload={() => false}
                listType="picture-card"
                maxCount={1}
                accept="image/*"
                onChange={({ fileList }) => setImageFileList(fileList)}
              >
                {imageFileList.length === 0 && "+ Upload"}
              </Upload>
            </Form.Item>
          ) : (
            <Form.Item label="Upload Video" required>
              <Upload
                fileList={videoFileList}
                beforeUpload={() => false}
                maxCount={1}
                accept="video/*"
                onChange={({ fileList }) => setVideoFileList(fileList)}
              >
                {videoFileList.length === 0 && "+ Upload"}
              </Upload>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
}

export default Works;
