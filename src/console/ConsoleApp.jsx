import { Routes, Route, Navigate } from "react-router-dom";
import ConsoleGuard from "./ConsoleGuard.jsx";
import ConsoleLayout from "./ConsoleLayout.jsx";
import StubPage from "./pages/StubPage.jsx";
import LoginEditor from "./pages/LoginEditor.jsx";

// Admin console — mounted at /console/* (role-gated to admin/manager).
export default function ConsoleApp() {
  return (
    <ConsoleGuard>
      {(user) => (
        <Routes>
          <Route element={<ConsoleLayout user={user} />}>
            <Route index element={<Navigate to="/console/login-editor" replace />} />
            <Route path="login-editor" element={<LoginEditor />} />
            <Route
              path="landing"
              element={<StubPage eyebrow="Content · Landing" title="Landing Page"
                desc="A content editor for the marketing landing page is queued for a future release." />}
            />
            <Route
              path="email-templates"
              element={<StubPage eyebrow="Content · Email" title="Email Templates"
                desc="A library editor for outreach email templates is on the roadmap." />}
            />
            <Route
              path="users"
              element={<StubPage eyebrow="Access · Users" title="User Management"
                desc="User management is queued. For now, roles are changed directly in the database." />}
            />
            <Route
              path="roles"
              element={<StubPage eyebrow="Access · Roles" title="Roles & Permissions"
                desc="A visual roles and permissions matrix is planned for a later release." />}
            />
            <Route
              path="analytics"
              element={<StubPage eyebrow="Insights · Analytics" title="Analytics"
                desc="Console analytics — signups, content changes, usage — are on the roadmap." />}
            />
            <Route
              path="audit"
              element={<StubPage eyebrow="Insights · Audit" title="Audit Log"
                desc="A persistent audit log is planned. Each content save already records who changed it and when." />}
            />
            <Route path="*" element={<Navigate to="/console/login-editor" replace />} />
          </Route>
        </Routes>
      )}
    </ConsoleGuard>
  );
}
