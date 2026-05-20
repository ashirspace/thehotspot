import { Routes, Route, Navigate } from "react-router-dom";
import ConsoleGuard from "./ConsoleGuard.jsx";
import ConsoleLayout from "./ConsoleLayout.jsx";
import StubPage from "./pages/StubPage.jsx";

// Admin console — mounted at /console/* (role-gated to admin/manager).
export default function ConsoleApp() {
  return (
    <ConsoleGuard>
      {(user) => (
        <Routes>
          <Route element={<ConsoleLayout user={user} />}>
            <Route index element={<Navigate to="/console/login-editor" replace />} />
            <Route
              path="login-editor"
              element={
                <StubPage
                  eyebrow="Content · Login"
                  title="Login Page Editor"
                  desc="The editor form arrives in the next commit."
                />
              }
            />
            <Route
              path="landing"
              element={<StubPage eyebrow="Content · Landing" title="Landing Page" />}
            />
            <Route
              path="email-templates"
              element={<StubPage eyebrow="Content · Email" title="Email Templates" />}
            />
            <Route
              path="users"
              element={<StubPage eyebrow="Access · Users" title="User Management" />}
            />
            <Route
              path="roles"
              element={<StubPage eyebrow="Access · Roles" title="Roles & Permissions" />}
            />
            <Route
              path="analytics"
              element={<StubPage eyebrow="Insights · Analytics" title="Analytics" />}
            />
            <Route
              path="audit"
              element={<StubPage eyebrow="Insights · Audit" title="Audit Log" />}
            />
            <Route path="*" element={<Navigate to="/console/login-editor" replace />} />
          </Route>
        </Routes>
      )}
    </ConsoleGuard>
  );
}
