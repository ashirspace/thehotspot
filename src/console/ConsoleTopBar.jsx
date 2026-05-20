// Console top bar — white, 64px, matches the dashboard topbar.
export default function ConsoleTopBar({ user, crumb }) {
  return (
    <div className="dash-topbar">
      <span className="dash-wordmark">
        <span className="dash-wordmark-dot" />
        thehotspot
      </span>
      <span className="console-badge">Admin</span>
      <span className="dash-breadcrumb rsp-breadcrumb">
        <span className="dash-breadcrumb-sep">/</span>
        {crumb || "Console"}
      </span>
      <div className="dash-topbar-right">
        <a href="/" className="dash-btn dash-btn-ghost dash-btn-sm" style={{ textDecoration: "none" }}>
          ← Back to Dashboard
        </a>
        <span className="dash-avatar" title={user?.username}>
          {user?.username?.[0]?.toUpperCase() || "A"}
        </span>
      </div>
    </div>
  );
}
