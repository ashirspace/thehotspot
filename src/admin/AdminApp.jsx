import { useState, useEffect } from "react";
import { Routes, Route, NavLink, useNavigate, Navigate } from "react-router-dom";
import {
  LuLayoutDashboard, LuUsers, LuDatabase, LuRadio,
  LuMail, LuDollarSign, LuSettings, LuLogOut,
  LuMenu, LuX, LuShield, LuFileText, LuChevronDown, LuChevronRight,
  LuGlobe, LuStar, LuUser,
} from "react-icons/lu";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminContacts from "./pages/AdminContacts";
import AdminCampaigns from "./pages/AdminCampaigns";
import AdminEmailLogs from "./pages/AdminEmailLogs";
import AdminPayments from "./pages/AdminPayments";
import AdminSettings from "./pages/AdminSettings";
import AdminPages from "./pages/AdminPages";

const FF = "'DM Sans', sans-serif";
const C = {
  bg: "#09090d", sidebar: "#0a0a0f", card: "#111116",
  border: "#ffffff12", text: "#F1F5F9", muted: "#64748B",
  purple: "#6366f1",
};

const NAV = [
  { to: "/admin/dashboard",  label: "Dashboard",  Icon: LuLayoutDashboard },
  { to: "/admin/users",      label: "Users",       Icon: LuUsers },
  { to: "/admin/contacts",   label: "Contacts",    Icon: LuDatabase },
  { to: "/admin/campaigns",  label: "Campaigns",   Icon: LuRadio },
  { to: "/admin/email-logs", label: "Email Logs",  Icon: LuMail },
  { to: "/admin/payments",   label: "Payments",    Icon: LuDollarSign },
  { to: "/admin/settings",   label: "Settings",    Icon: LuSettings },
];

const MAIN_PAGES = [
  { to: "/admin/pages/login",     label: "Login Page",     Icon: LuGlobe },
  { to: "/admin/pages/home",      label: "Home Page",      Icon: LuLayoutDashboard },
  { to: "/admin/pages/dashboard", label: "Dashboard Page", Icon: LuStar },
  { to: "/admin/pages/contacts",  label: "Contacts Page",  Icon: LuUsers },
  { to: "/admin/pages/campaigns", label: "Campaigns Page", Icon: LuRadio },
  { to: "/admin/pages/templates", label: "Template Page",  Icon: LuMail },
  { to: "/admin/pages/settings",  label: "Settings Page",  Icon: LuSettings },
  { to: "/admin/pages/profile",   label: "Profile Page",   Icon: LuUser },
];

function AdminShell({ admin, onLogout }) {
  const [open, setOpen] = useState(false);
  const [pagesOpen, setPagesOpen] = useState(false);

  return (
    <div style={{ display: "flex", height: "100dvh", background: C.bg, fontFamily: FF, overflow: "hidden" }}>
      {/* Mobile hamburger */}
      <button
        onClick={() => setOpen(v => !v)}
        className="admin-hbg"
        style={{
          position: "fixed", top: 14, left: 14, zIndex: 400,
          background: C.card, border: `1px solid ${C.border}`,
          borderRadius: 8, padding: 8, cursor: "pointer", color: C.text,
          display: "none", alignItems: "center", justifyContent: "center",
        }}
      >
        {open ? <LuX size={18} /> : <LuMenu size={18} />}
      </button>

      {/* Backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 300 }}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`admin-sb${open ? " open" : ""}`}
        style={{
          width: 220, flexShrink: 0, background: C.sidebar,
          borderRight: `1px solid ${C.border}`,
          display: "flex", flexDirection: "column",
          zIndex: 350, transition: "transform .25s",
        }}
      >
        {/* Brand */}
        <div style={{ padding: "22px 18px 16px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: C.purple, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <LuShield size={17} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text, letterSpacing: -0.3 }}>thehotspot</div>
              <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, letterSpacing: 0.8 }}>ADMIN PANEL</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1, padding: "4px 8px 10px", textTransform: "uppercase" }}>Menu</div>
          {NAV.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              style={({ isActive }) => ({
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 10px", borderRadius: 8, textDecoration: "none",
                fontSize: 13, fontWeight: 600, transition: "all .15s",
                background: isActive ? `${C.purple}18` : "transparent",
                color: isActive ? C.purple : C.muted,
                border: isActive ? `1px solid ${C.purple}28` : "1px solid transparent",
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon size={15} color={isActive ? C.purple : C.muted} />
                  {label}
                </>
              )}
            </NavLink>
          ))}

          {/* Main Pages collapsible */}
          <div style={{ marginTop: 4 }}>
            <button
              onClick={() => setPagesOpen(v => !v)}
              style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%",
                padding: "9px 10px", borderRadius: 8, border: "1px solid transparent",
                background: "transparent", color: C.muted, fontSize: 13, fontWeight: 600,
                cursor: "pointer", fontFamily: C.ff || "'DM Sans',sans-serif", transition: "all .15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#ffffff08"; e.currentTarget.style.color = "#94A3B8"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.muted; }}
            >
              <LuFileText size={15} color={C.muted} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1, textAlign: "left" }}>Main Pages</span>
              {pagesOpen ? <LuChevronDown size={13} /> : <LuChevronRight size={13} />}
            </button>

            {pagesOpen && (
              <div style={{ paddingLeft: 10, marginTop: 2, display: "flex", flexDirection: "column", gap: 1 }}>
                {MAIN_PAGES.map(({ to, label, Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setOpen(false)}
                    style={({ isActive }) => ({
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "7px 10px", borderRadius: 7, textDecoration: "none",
                      fontSize: 12, fontWeight: 600, transition: "all .15s",
                      background: isActive ? `${C.purple}18` : "transparent",
                      color: isActive ? C.purple : C.muted,
                      border: isActive ? `1px solid ${C.purple}28` : "1px solid transparent",
                    })}
                  >
                    {({ isActive }) => (
                      <>
                        <Icon size={13} color={isActive ? C.purple : C.muted} />
                        {label}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Footer */}
        <div style={{ padding: "12px 10px", borderTop: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 11, color: C.muted, padding: "4px 10px 8px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            <LuShield size={11} style={{ verticalAlign: "middle", marginRight: 4 }} />
            {admin?.full_name || admin?.email}
          </div>
          <button
            onClick={onLogout}
            style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "9px 10px", borderRadius: 8, border: "1px solid #ef444430", background: "transparent", color: "#ef4444", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: FF }}
          >
            <LuLogOut size={14} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "28px 24px" }}>
          <Routes>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard"  element={<AdminDashboard />} />
            <Route path="users"      element={<AdminUsers />} />
            <Route path="contacts"   element={<AdminContacts />} />
            <Route path="campaigns"  element={<AdminCampaigns />} />
            <Route path="email-logs" element={<AdminEmailLogs />} />
            <Route path="payments"   element={<AdminPayments />} />
            <Route path="pages"          element={<AdminPages />} />
            <Route path="pages/:pageId" element={<AdminPages />} />
            <Route path="settings"   element={<AdminSettings admin={admin} />} />
            <Route path="*"          element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
        </div>
      </main>

      <style>{`
        @media (max-width: 768px) {
          .admin-hbg { display: flex !important; }
          .admin-sb { position: fixed; top: 0; left: 0; height: 100dvh; transform: translateX(-100%); }
          .admin-sb.open { transform: translateX(0); }
        }
      `}</style>
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
    <Routes>
      <Route path="login" element={admin ? <Navigate to="/admin/dashboard" replace /> : <AdminLogin onLogin={handleLogin} />} />
      <Route path="*" element={admin ? <AdminShell admin={admin} onLogout={handleLogout} /> : <Navigate to="/admin/login" replace />} />
    </Routes>
  );
}
