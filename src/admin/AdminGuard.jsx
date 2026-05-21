import { Navigate } from "react-router-dom";

export default function AdminGuard({ children, requireAdmin = false }) {
  let user = {};
  try { user = JSON.parse(localStorage.getItem("thehotspot_user") || "{}"); } catch { /* */ }

  const isAdmin   = user.role === "admin";
  const isManager = user.role === "manager";

  if (!isAdmin && !isManager) return <Navigate to="/" replace />;
  if (requireAdmin && !isAdmin) return <Navigate to="/" replace />;

  return typeof children === "function" ? children(user, isAdmin) : children;
}
