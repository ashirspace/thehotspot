import { useOutletContext } from "react-router-dom";
import { useEditor } from "../../hooks/useEditor.js";
import { fetchLandingContent, LANDING_DEFAULTS } from "../../api/siteContentApi.js";
import CmsSection from "../../components/CmsSection.jsx";
import CmsField from "../../components/CmsField.jsx";
import PreviewPane from "../../components/PreviewPane.jsx";
import ActionBar from "../../components/ActionBar.jsx";

const STATS = [1,2,3,4];

function StatsPreview({ c }) {
  return (
    <div style={{background:"var(--bg-alt)",padding:20,display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      {STATS.map(n => (
        <div key={n} style={{textAlign:"center"}}>
          <div style={{fontSize:22,fontWeight:700,color:"var(--teal)",fontFamily:"var(--font-display)"}}>{c[`stat_0${n}_number`]||"—"}</div>
          <div style={{fontSize:10,color:"var(--text-soft)"}}>{c[`stat_0${n}_label`]||`Stat ${n}`}</div>
        </div>
      ))}
    </div>
  );
}

export default function StatsEditor({ user }) {
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
        <div className="cms-editor-eyebrow">Landing Page · Stats</div>
        <h1 className="cms-editor-title">Stats Section</h1>
        <p className="cms-editor-subtitle">4 social proof numbers on the landing page.</p>
        {lastSaved && <div className="cms-editor-meta">Last saved {lastSaved}</div>}
      </div>

      <div className="cms-editor-body">
        <div>
          {STATS.map(n => (
            <CmsSection key={n} number={n} title={`Stat ${n}`}>
              <CmsField id={`stat_0${n}_number`} label="Number / value" value={local[`stat_0${n}_number`]||""} onChange={v=>update(`stat_0${n}_number`,v)} maxChars={10} context="stats section" required />
              <CmsField id={`stat_0${n}_label`} label="Label" value={local[`stat_0${n}_label`]||""} onChange={v=>update(`stat_0${n}_label`,v)} maxChars={30} context="stats section" />
            </CmsSection>
          ))}
        </div>
        <PreviewPane><StatsPreview c={local} /></PreviewPane>
      </div>

      <ActionBar isDirty={isDirty} saving={saving} onDiscard={discard} onSave={save} sidebarCollapsed={ctx.sidebarCollapsed} />
    </div>
  );
}
