import { Link, useLocation } from "react-router-dom";

const SECTIONS = [
  {
    eyebrow: "Content",
    items: [
      { label: "Login Page", to: "/console/login-editor" },
      { label: "Landing Page", to: "/console/landing", soon: true },
      { label: "Email Templates", to: "/console/email-templates", soon: true },
    ],
  },
  {
    eyebrow: "Access",
    adminOnly: true,
    items: [
      { label: "User Management", to: "/console/users", soon: true },
      { label: "Roles & Permissions", to: "/console/roles", soon: true },
    ],
  },
  {
    eyebrow: "Insights",
    items: [
      { label: "Analytics", to: "/console/analytics", soon: true },
      { label: "Audit Log", to: "/console/audit", soon: true },
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
            item.soon ? (
              <div key={item.to} className="dash-nav-item is-stub" title="Coming soon">
                {item.label}
                <span className="console-nav-soon">Soon</span>
              </div>
            ) : (
              <Link
                key={item.to}
                to={item.to}
                className={`dash-nav-item${pathname === item.to ? " is-active" : ""}`}
                style={{ textDecoration: "none" }}
              >
                {item.label}
              </Link>
            )
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
