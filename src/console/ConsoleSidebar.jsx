import { Link, useLocation } from "react-router-dom";

const SECTIONS = [
  {
    eyebrow: "Content",
    items: [
      { label: "Login Page", to: "/console/login-editor" },
      { label: "Site Copy", to: "/console/site-editor" },
    ],
  },
  {
    eyebrow: "Access",
    adminOnly: true,
    items: [
      { label: "User Management", to: "/console/users" },
    ],
  },
  {
    eyebrow: "Insights",
    items: [
      { label: "Analytics", to: "/console/analytics" },
      { label: "Audit Log", to: "/console/audit" },
    ],
  },
];

// Console sidebar — reuses .dash-sidebar. ACCESS section is admin-only.
export default function ConsoleSidebar({ user }) {
  const { pathname } = useLocation();
  return (
    <aside className="dash-sidebar">
      {SECTIONS.filter(s => !s.adminOnly || user?.role === "admin").map(section => (
        <div key={section.eyebrow}>
          <div className="dash-sidebar-section">
            <span className="dash-sidebar-eyebrow">{section.eyebrow}</span>
          </div>
          {section.items.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className={`dash-nav-item${pathname === item.to ? " is-active" : ""}`}
              style={{ textDecoration: "none" }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      ))}

      <div className="dash-sidebar-footer">
        <div className="dash-user-card">
          <span className="dash-avatar">{user?.username?.[0]?.toUpperCase() || "A"}</span>
          <span style={{ minWidth: 0 }}>
            <span className="dash-user-name" style={{ display: "block" }}>{user?.username}</span>
            <span className="dash-user-mail" style={{ display: "block" }}>{user?.role}</span>
          </span>
        </div>
        <div className="dash-version">v2.3 beta · admin</div>
      </div>
    </aside>
  );
}
