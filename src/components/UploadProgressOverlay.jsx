import { Progress } from "antd";
import { CloudUploadOutlined, LoadingOutlined } from "@ant-design/icons";
import { useUploadProgressStore } from "../store/uploadProgressStore.js";

export function UploadProgressOverlay() {
  const uploads = useUploadProgressStore((s) => s.uploads);
  const ids = Object.keys(uploads);
  if (ids.length === 0) return null;

  const entries = ids.map((id) => uploads[id]);
  const isProcessing = entries.every((e) => e.phase === "processing");
  const anyProcessing = entries.some((e) => e.phase === "processing");

  const uploadingEntries = entries.filter(
    (e) => e.phase === "uploading" && typeof e.percent === "number"
  );
  const percent =
    uploadingEntries.length > 0
      ? Math.round(
          uploadingEntries.reduce((sum, e) => sum + e.percent, 0) /
            uploadingEntries.length
        )
      : null;

  const label = isProcessing
    ? ids.length > 1
      ? `Saving ${ids.length} items…`
      : "Saving…"
    : anyProcessing
      ? "Uploading to storage & saving…"
      : ids.length > 1
        ? `Uploading ${ids.length} files to storage…`
        : "Uploading to storage…";

  return (
    <div
      className="fixed bottom-6 left-1/2 z-[9999] w-[min(420px,calc(100vw-2rem))] -translate-x-1/2 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-lg"
      role="status"
      aria-live="polite"
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
          {isProcessing ? (
            <LoadingOutlined className="text-base" />
          ) : (
            <CloudUploadOutlined className="text-base" />
          )}
          <span>{label}</span>
        </div>
        {!isProcessing && percent != null && (
          <span className="text-sm tabular-nums text-gray-600">{percent}%</span>
        )}
      </div>
      {isProcessing ? (
        <Progress
          percent={100}
          showInfo={false}
          status="active"
          strokeColor="#1677ff"
          trailColor="#f0f0f0"
          size="small"
        />
      ) : (
        <Progress
          percent={percent ?? 0}
          showInfo={false}
          strokeColor="#1677ff"
          trailColor="#f0f0f0"
          size="small"
        />
      )}
      <p className="mt-2 text-xs text-gray-500">
        {isProcessing
          ? "File is already in cloud storage. Saving record…"
          : "Real transfer progress to cloud storage (R2)."}
      </p>
    </div>
  );
}
