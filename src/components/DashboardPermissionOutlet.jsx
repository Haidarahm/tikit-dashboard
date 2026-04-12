import { Spin } from "antd";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/auth.js";
import {
  canAccessPath,
  getFirstAccessibleDashboardPath,
  permissionsReadyForRouteCheck,
} from "../auth/routeAccess.js";

/**
 * Renders nested dashboard routes only if the current user may access the URL;
 * otherwise redirects to the first allowed section (or /no-access).
 */
export function DashboardPermissionOutlet() {
  const location = useLocation();
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

  if (!canAccessPath(user, location.pathname)) {
    const fallback = getFirstAccessibleDashboardPath(user);
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
}
