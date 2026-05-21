import { Routes, Route, Navigate } from "react-router-dom";
import ConsoleGuard from "./ConsoleGuard.jsx";
import ConsoleLayout from "./ConsoleLayout.jsx";
import LoginEditor from "./pages/LoginEditor.jsx";
import SiteEditor from "./pages/SiteEditor.jsx";
import UserManagement from "./pages/UserManagement.jsx";
import Analytics from "./pages/Analytics.jsx";
import AuditLog from "./pages/AuditLog.jsx";

// Admin console — mounted at /console/* (role-gated to admin/manager).
export default function ConsoleApp() {
  return (
    <ConsoleGuard>
      {(user) => (
        <Routes>
          <Route element={<ConsoleLayout user={user} />}>
            <Route index element={<Navigate to="/console/login-editor" replace />} />
            <Route path="login-editor" element={<LoginEditor />} />
            <Route path="site-editor" element={<SiteEditor />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="audit" element={<AuditLog />} />
            <Route path="*" element={<Navigate to="/console/login-editor" replace />} />
          </Route>
        </Routes>
      )}
    </ConsoleGuard>
  );
}
