import { useOutletContext } from "react-router-dom";
import { useEditor } from "../../hooks/useEditor.js";
import { fetchLandingContent, LANDING_DEFAULTS } from "../../api/siteContentApi.js";
import { saveContent } from "../../api/siteContentApi.js";
import CmsSection from "../../components/CmsSection.jsx";
import CmsField from "../../components/CmsField.jsx";
import PreviewPane from "../../components/PreviewPane.jsx";
import ActionBar from "../../components/ActionBar.jsx";

function AnnouncementPreview({ c }) {
  const show = c.show_announcement !== "false";
  return (
    <div style={{background:"#0d9488",padding:"10px 16px",minHeight:60,display:"flex",alignItems:"center",justifyContent:"center"}}>
      {show
        ? <span style={{fontSize:12,color:"#fff",textAlign:"center"}}>{c.announcement_text||"Announcement text"}</span>
        : <span style={{fontSize:11,color:"rgba(255,255,255,0.4)"}}>Announcement bar hidden</span>
      }
    </div>
  );
}

export default function AnnouncementEditor({ user }) {
  const ctx = useOutletContext() || {};
  const { local, update, isDirty, saving, discard, save, lastSaved } = useEditor({
    fetchFn: fetchLandingContent,
    saveKey: "landing",
    defaults: LANDING_DEFAULTS,
    username: user?.username,
  });

  return (
    <div className="cms-editor">
      <div className="cms-editor-header">
        <div className="cms-editor-eyebrow">Landing Page · Announcement</div>
        <h1 className="cms-editor-title">Announcement Bar</h1>
        <p className="cms-editor-subtitle">The teal bar at the top of the landing page.</p>
        {lastSaved && <div className="cms-editor-meta">Last saved {lastSaved}</div>}
      </div>

      <div className="cms-editor-body">
        <div>
          <CmsSection number={1} title="Bar content" desc="Top of landing page">
            <CmsField id="announcement_text" label="Announcement text" value={local.announcement_text||""} onChange={v=>update("announcement_text",v)} maxChars={120} context="announcement bar" required />
            <CmsField id="announcement_link" label="Link URL" value={local.announcement_link||""} onChange={v=>update("announcement_link",v)} maxChars={80} context="announcement bar" hint="URL" />
          </CmsSection>
          <CmsSection number={2} title="Visibility" desc="Show or hide the bar">
            <div className="cms-toggle-row">
              <label className="cms-toggle">
                <input
                  type="checkbox"
                  checked={local.show_announcement !== "false"}
                  onChange={e => update("show_announcement", e.target.checked ? "true" : "false")}
                />
                <span className="cms-toggle-track" />
              </label>
              <span className="cms-toggle-label">Show announcement bar</span>
            </div>
          </CmsSection>
        </div>
        <PreviewPane><AnnouncementPreview c={local} /></PreviewPane>
      </div>

      <ActionBar isDirty={isDirty} saving={saving} onDiscard={discard} onSave={save} sidebarCollapsed={ctx.sidebarCollapsed} />
    </div>
  );
}
