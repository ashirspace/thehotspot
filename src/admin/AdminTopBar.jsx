import { useLocation } from "react-router-dom";

const BREADCRUMBS = {
  "/admin/landing/announcement": "Landing Page / Announcement Bar",
  "/admin/landing/hero":         "Landing Page / Hero Section",
  "/admin/landing/features":     "Landing Page / Features",
  "/admin/landing/stats":        "Landing Page / Stats",
  "/admin/landing/testimonial":  "Landing Page / Testimonial",
  "/admin/landing/pricing":      "Landing Page / Pricing",
  "/admin/landing/footer":       "Landing Page / Footer",
  "/admin/login/branding":       "Login Page / Branding",
  "/admin/login/welcome":        "Login Page / Welcome Text",
  "/admin/login/form-labels":    "Login Page / Form Labels",
  "/admin/login/buttons":        "Login Page / Buttons & CTAs",
  "/admin/login/toggle-links":   "Login Page / Toggle Links",
  "/admin/settings/users":       "Settings / Users & Roles",
  "/admin/settings/integrations":"Settings / Integrations",
  "/admin/settings/audit":       "Settings / Audit Log",
};

export default function AdminTopBar({ user, onToggleSidebar }) {
  const { pathname } = useLocation();
  const breadcrumb = BREADCRUMBS[pathname] || "";

  return (
    <header className="cms-topbar">
      <div className="cms-topbar-left">
        <button className="cms-topbar-hamburger" onClick={onToggleSidebar} aria-label="Toggle sidebar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <span className="cms-topbar-wordmark">thehotspot</span>
        <span className="cms-topbar-pill">CMS</span>
        {breadcrumb && (
          <>
            <span className="cms-topbar-divider-v" />
            <span className="cms-topbar-breadcrumb">{breadcrumb}</span>
          </>
        )}
      </div>

      <div className="cms-topbar-right">
        <a
          href="https://thehotspot.in"
          target="_blank"
          rel="noreferrer"
          className="cms-topbar-viewsite"
        >
          ↗ View Site
        </a>
        <span className="cms-topbar-divider-v" />
        {user?.avatar
          ? <img src={user.avatar} alt="" className="cms-topbar-avatar" />
          : <div className="cms-topbar-avatar cms-topbar-avatar--initials">
              {(user?.name || user?.username || "U")[0].toUpperCase()}
            </div>
        }
        <span className="cms-topbar-username">{user?.name?.split(" ")[0] || user?.username || "Admin"}</span>
        <span className="cms-topbar-divider-v" />
        <span className="cms-topbar-version">v2.3</span>
      </div>
    </header>
  );
}
