import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.js";

function PublicRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/works" replace />;
  }
  return children;
}

export default PublicRoute;
