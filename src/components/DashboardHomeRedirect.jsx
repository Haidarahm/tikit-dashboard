import { Spin } from "antd";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.js";
import {
  getFirstAccessibleDashboardPath,
  permissionsReadyForRouteCheck,
} from "../auth/routeAccess.js";

export default function DashboardHomeRedirect() {
  const user = useAuthStore((s) => s.user);
  const isProfileLoading = useAuthStore((s) => s.isProfileLoading);

  const ready = permissionsReadyForRouteCheck(user, isProfileLoading);
  if (!ready) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <Spin size="large" />
      </div>
    );
  }

  return <Navigate to={getFirstAccessibleDashboardPath(user)} replace />;
}
