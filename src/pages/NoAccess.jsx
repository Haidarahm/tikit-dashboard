import { Typography } from "antd";

function NoAccess() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-center px-4">
      <Typography.Title level={4} className="!mb-0">
        No dashboard sections available
      </Typography.Title>
      <Typography.Text type="secondary" className="max-w-md">
        Your account does not have permission to access any admin sections. Contact
        a super admin if you believe this is a mistake.
      </Typography.Text>
    </div>
  );
}

export default NoAccess;
