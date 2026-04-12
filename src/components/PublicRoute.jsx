import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.js";
import { getFirstAccessibleDashboardPath } from "../auth/routeAccess.js";

function PublicRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  if (isAuthenticated) {
    return <Navigate to={getFirstAccessibleDashboardPath(user)} replace />;
  }
  return children;
}

export default PublicRoute;
