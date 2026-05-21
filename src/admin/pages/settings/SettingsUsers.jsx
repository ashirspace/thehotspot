export default function SettingsUsers() {
  return (
    <div className="cms-editor">
      <div className="cms-editor-header">
        <div className="cms-editor-eyebrow">Settings · Users</div>
        <h1 className="cms-editor-title">Users &amp; Roles</h1>
        <p className="cms-editor-subtitle">Manage user accounts and role assignments.</p>
      </div>
      <div className="cms-settings-stub">
        <p>User management is available in the <a href="/console/users" style={{color:"var(--teal)"}}>console</a>.</p>
      </div>
    </div>
  );
}
