import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";

const LANDING_ITEMS = [
  { to: "/admin/landing/announcement", label: "Announcement Bar" },
  { to: "/admin/landing/hero",         label: "Hero Section" },
  { to: "/admin/landing/features",     label: "Features" },
  { to: "/admin/landing/stats",        label: "Stats" },
  { to: "/admin/landing/testimonial",  label: "Testimonial" },
  { to: "/admin/landing/pricing",      label: "Pricing" },
  { to: "/admin/landing/footer",       label: "Footer" },
];

const LOGIN_ITEMS = [
  { to: "/admin/login/branding",    label: "Branding & Tagline" },
  { to: "/admin/login/welcome",     label: "Welcome Text" },
  { to: "/admin/login/form-labels", label: "Form Labels" },
  { to: "/admin/login/buttons",     label: "Buttons & CTAs" },
  { to: "/admin/login/toggle-links",label: "Toggle Links" },
];

const SETTINGS_ITEMS = [
  { to: "/admin/settings/users",        label: "Users & Roles" },
  { to: "/admin/settings/integrations", label: "Integrations" },
  { to: "/admin/settings/audit",        label: "Audit Log" },
];

const SOON_ITEMS = ["Dashboard Pages", "Email Templates", "Agent Pages"];

function SidebarGroup({ label, items, storageKey }) {
  const { pathname } = useLocation();
  const isGroupActive = items.some(i => pathname.startsWith(i.to));

  const [open, setOpen] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("cms_sidebar_open") || "{}");
      return stored[storageKey] !== false;
    } catch { return true; }
  });

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("cms_sidebar_open") || "{}");
      stored[storageKey] = open;
      localStorage.setItem("cms_sidebar_open", JSON.stringify(stored));
    } catch { /* */ }
  }, [open, storageKey]);

  return (
    <div className="cms-sidebar-group">
      <button
        className={`cms-sidebar-group-btn${isGroupActive ? " active" : ""}`}
        onClick={() => setOpen(v => !v)}
      >
        <span className="cms-sidebar-chevron">{open ? "▼" : "▷"}</span>
        <span className="cms-sidebar-group-label">{label}</span>
        {isGroupActive && <span className="cms-sidebar-dot" />}
      </button>

      {open && (
        <div className="cms-sidebar-items">
          {items.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `cms-sidebar-item${isActive ? " cms-sidebar-item--active" : ""}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminSidebar({ collapsed, isAdmin }) {
  return (
    <aside className={`cms-sidebar${collapsed ? " cms-sidebar--collapsed" : ""}`}>
      <div className="cms-sidebar-section-label">Pages</div>

      <SidebarGroup label="Landing Page" items={LANDING_ITEMS} storageKey="landing" />
      <SidebarGroup label="Login Page"   items={LOGIN_ITEMS}   storageKey="login" />

      {SOON_ITEMS.map(name => (
        <button key={name} className="cms-sidebar-group-btn cms-sidebar-group-btn--soon" disabled>
          <span className="cms-sidebar-chevron">▷</span>
          <span className="cms-sidebar-group-label">{name}</span>
          <span className="cms-soon-badge">Soon</span>
        </button>
      ))}

      {isAdmin && (
        <>
          <div className="cms-sidebar-section-label cms-sidebar-section-label--settings">Settings</div>
          {SETTINGS_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `cms-sidebar-item cms-sidebar-item--settings${isActive ? " cms-sidebar-item--active" : ""}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </>
      )}
    </aside>
  );
}
