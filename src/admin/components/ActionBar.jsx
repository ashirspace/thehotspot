import { useEffect } from "react";

export default function ActionBar({ isDirty, saving, onDiscard, onSave, sidebarCollapsed }) {
  useEffect(() => {
    if (isDirty) {
      window.onbeforeunload = () => "You have unsaved changes. Leave anyway?";
    } else {
      window.onbeforeunload = null;
    }
    return () => { window.onbeforeunload = null; };
  }, [isDirty]);

  if (!isDirty) return null;

  const barClass = `cms-action-bar${sidebarCollapsed ? " cms-action-bar--sidebar-collapsed" : ""}`;

  return (
    <div className={barClass}>
      <div className="cms-action-bar-status">
        <span className="cms-action-bar-dot" />
        Unsaved changes
      </div>
      <div className="cms-action-bar-btns">
        <button className="cms-btn-discard" onClick={onDiscard} disabled={saving}>
          Discard changes
        </button>
        <button className="cms-btn-save" onClick={onSave} disabled={saving}>
          {saving ? (
            <>
              Publishing
              <span className="cms-publishing-dots">
                <span /><span /><span />
              </span>
            </>
          ) : "Save & Publish"}
        </button>
      </div>
    </div>
  );
}
