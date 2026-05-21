import { Outlet, useLocation } from "react-router-dom";
import ConsoleTopBar from "./ConsoleTopBar.jsx";
import ConsoleSidebar from "./ConsoleSidebar.jsx";

const CRUMBS = {
  "/console/login-editor": "Login Editor",
  "/console/landing": "Landing Page",
  "/console/email-templates": "Email Templates",
  "/console/users": "User Management",
  "/console/roles": "Roles & Permissions",
  "/console/analytics": "Analytics",
  "/console/audit": "Audit Log",
};

// Console shell — white topbar + light sidebar + content outlet.
export default function ConsoleLayout({ user }) {
  const { pathname } = useLocation();
  return (
    <div className="dash-shell" style={{ position: "fixed", inset: 0 }}>
      <ConsoleTopBar user={user} crumb={CRUMBS[pathname] || "Console"} />
      <div className="dash-body">
        <ConsoleSidebar user={user} />
        <main className="dash-main">
          <Outlet context={{ user }} />
        </main>
      </div>
    </div>
  );
}
