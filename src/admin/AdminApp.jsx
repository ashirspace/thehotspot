import { useState, useEffect } from "react";
import { Routes, Route, NavLink, useNavigate, Navigate } from "react-router-dom";
import {
  LuLayoutDashboard, LuUsers, LuRadio, LuMail,
  LuDollarSign, LuSettings, LuLogOut, LuMenu, LuX,
  LuShield,
} from "react-icons/lu";
import "./AdminApp.css";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminCampaigns from "./pages/AdminCampaigns";
import AdminEmailLogs from "./pages/AdminEmailLogs";
import AdminPayments from "./pages/AdminPayments";
import AdminSettings from "./pages/AdminSettings";

const NAV = [
  { to: "/admin/dashboard", label: "Dashboard",   Icon: LuLayoutDashboard },
  { to: "/admin/users",     label: "Users",        Icon: LuUsers },
  { to: "/admin/campaigns", label: "Campaigns",    Icon: LuRadio },
  { to: "/admin/email-logs",label: "Email Logs",   Icon: LuMail },
  { to: "/admin/payments",  label: "Payments",     Icon: LuDollarSign },
  { to: "/admin/settings",  label: "Settings",     Icon: LuSettings },
];

function AdminShell({ admin, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function closeSidebar() { setSidebarOpen(false); }

  return (
    <div className="admin-shell">
      <button className="admin-hamburger" onClick={() => setSidebarOpen(v => !v)} aria-label="Toggle menu">
        {sidebarOpen ? <LuX size={20} /> : <LuMenu size={20} />}
      </button>

      <div className={`admin-sidebar-backdrop ${sidebarOpen ? "open" : ""}`} onClick={closeSidebar} />

      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="admin-sidebar__brand">
          <div className="admin-sidebar__logo">HS</div>
          <div>
            <div className="admin-sidebar__title">thehotspot</div>
            <div className="admin-sidebar__subtitle">Admin Panel</div>
          </div>
        </div>

        <nav className="admin-sidebar__nav">
          <div className="admin-nav-label">Menu</div>
          {NAV.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `admin-nav-item${isActive ? " active" : ""}`}
              onClick={closeSidebar}
            >
              <Icon />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <div className="admin-sidebar__admin-info" style={{ padding: "0 10px 10px", fontSize: 12, color: "var(--text-muted)" }}>
            <LuShield size={12} style={{ verticalAlign: "middle", marginRight: 5 }} />
            {admin?.full_name || admin?.email}
          </div>
          <button className="admin-logout-btn" onClick={onLogout}>
            <LuLogOut />
            Logout
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <div className="admin-content">
          <Routes>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard"  element={<AdminDashboard />} />
            <Route path="users"      element={<AdminUsers />} />
            <Route path="campaigns"  element={<AdminCampaigns />} />
            <Route path="email-logs" element={<AdminEmailLogs />} />
            <Route path="payments"   element={<AdminPayments />} />
            <Route path="settings"   element={<AdminSettings admin={admin} />} />
            <Route path="*"          element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default function AdminApp() {
  const [admin, setAdmin] = useState(null);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("thehotspot_admin");
    if (stored) {
      try { setAdmin(JSON.parse(stored)); } catch { localStorage.removeItem("thehotspot_admin"); }
    }
    setChecking(false);
  }, []);

  function handleLogin(adminData) {
    setAdmin(adminData);
    localStorage.setItem("thehotspot_admin", JSON.stringify(adminData));
    navigate("/admin/dashboard", { replace: true });
  }

  function handleLogout() {
    localStorage.removeItem("thehotspot_admin");
    setAdmin(null);
    navigate("/admin/login", { replace: true });
  }

  if (checking) return null;

  return (
    <div className="admin-root">
      <Routes>
        <Route
          path="login"
          element={admin ? <Navigate to="/admin/dashboard" replace /> : <AdminLogin onLogin={handleLogin} />}
        />
        <Route
          path="*"
          element={admin ? <AdminShell admin={admin} onLogout={handleLogout} /> : <Navigate to="/admin/login" replace />}
        />
      </Routes>
    </div>
  );
}
