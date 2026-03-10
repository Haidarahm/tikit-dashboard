import { useState } from "react";
import { Button, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";

const excelMimeTypes = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
];

function isExcelFile(file) {
  if (!file) return false;
  const name = file.name?.toLowerCase() || "";
  return (
    excelMimeTypes.includes(file.type) ||
    name.endsWith(".xlsx") ||
    name.endsWith(".xls")
  );
}

export default function ExcelImportButton({
  disabled,
  onImport,
  children = "Import Excel",
  className,
}) {
  const [importing, setImporting] = useState(false);

  return (
    <Upload
      accept=".xlsx,.xls"
      showUploadList={false}
      disabled={disabled || importing}
      beforeUpload={async (file) => {
        if (!file) return false;
        if (!isExcelFile(file)) {
          toast.error("Please upload a valid Excel file (.xlsx or .xls).");
          return false;
        }
        setImporting(true);
        try {
          await onImport?.(file);
        } catch (err) {
          toast.error(
            err?.response?.data?.message || err?.message || "Failed to import Excel"
          );
        } finally {
          setImporting(false);
        }
        return false;
      }}
    >
      <Button
        icon={<UploadOutlined />}
        disabled={disabled || importing}
        loading={importing}
        className={className}
      >
        {children}
      </Button>
    </Upload>
  );
}

