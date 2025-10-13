import { useEffect, useMemo } from "react";
import { Table, Image, Select } from "antd";
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
  } = useWorksStore();

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
    </div>
  );
}

export default Works;
