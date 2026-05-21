export default function SettingsAudit() {
  return (
    <div className="cms-editor">
      <div className="cms-editor-header">
        <div className="cms-editor-eyebrow">Settings · Audit</div>
        <h1 className="cms-editor-title">Audit Log</h1>
        <p className="cms-editor-subtitle">Review recent admin actions.</p>
      </div>
      <div className="cms-settings-stub">
        <p>Audit log is available in the <a href="/console/audit" style={{color:"var(--teal)"}}>console</a>.</p>
      </div>
    </div>
  );
}
