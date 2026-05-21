import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminTopBar from "./AdminTopBar.jsx";
import AdminSidebar from "./AdminSidebar.jsx";
import { ToastContainer } from "./components/Toast.jsx";

export default function AdminLayout({ user, isAdmin }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="cms-root">
      <AdminTopBar
        user={user}
        onToggleSidebar={() => setSidebarCollapsed(v => !v)}
      />
      <div className="cms-body">
        <AdminSidebar collapsed={sidebarCollapsed} isAdmin={isAdmin} />
        <main className="cms-content">
          <Outlet context={{ sidebarCollapsed }} />
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
