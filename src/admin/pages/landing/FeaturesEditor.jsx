import { useOutletContext } from "react-router-dom";
import { useEditor } from "../../hooks/useEditor.js";
import { fetchLandingContent, LANDING_DEFAULTS } from "../../api/siteContentApi.js";
import CmsSection from "../../components/CmsSection.jsx";
import CmsField from "../../components/CmsField.jsx";
import PreviewPane from "../../components/PreviewPane.jsx";
import ActionBar from "../../components/ActionBar.jsx";

const CARDS = [1,2,3,4,5,6];

function FeaturesPreview({ c }) {
  return (
    <div style={{background:"var(--bg-alt)",padding:16,minHeight:240}}>
      <div style={{fontSize:9,letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--text-faint)",marginBottom:4,fontFamily:"var(--font-mono)"}}>
        {c.features_eyebrow||"FEATURES"}
      </div>
      <div style={{fontSize:13,fontWeight:700,color:"var(--text)",marginBottom:12}}>{c.features_headline||"Features headline"}</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        {CARDS.map(n => (
          <div key={n} style={{background:"#fff",border:"1px solid var(--border)",borderRadius:6,padding:"8px 10px"}}>
            <div style={{fontSize:10,fontWeight:600,color:"var(--text)",marginBottom:2}}>{c[`feature_0${n}_title`]||`Feature ${n}`}</div>
            <div style={{fontSize:9,color:"var(--text-faint)",lineHeight:1.4}}>{c[`feature_0${n}_desc`]||""}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FeaturesEditor({ user }) {
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
        <div className="cms-editor-eyebrow">Landing Page · Features</div>
        <h1 className="cms-editor-title">Features Section</h1>
        <p className="cms-editor-subtitle">The 6-card features grid on the landing page.</p>
        {lastSaved && <div className="cms-editor-meta">Last saved {lastSaved}</div>}
      </div>

      <div className="cms-editor-body">
        <div>
          <CmsSection number={1} title="Section header" desc="Above the cards">
            <CmsField id="features_eyebrow" label="Eyebrow" value={local.features_eyebrow||""} onChange={v=>update("features_eyebrow",v)} maxChars={20} context="features section" />
            <CmsField id="features_headline" label="Headline" value={local.features_headline||""} onChange={v=>update("features_headline",v)} maxChars={60} context="features section" required />
            <CmsField id="features_subheadline" label="Sub-headline" value={local.features_subheadline||""} onChange={v=>update("features_subheadline",v)} maxChars={100} context="features section" multiline />
          </CmsSection>
          {CARDS.map(n => (
            <CmsSection key={n} number={n+1} title={`Feature card ${n}`} desc={`Card ${n} of 6`}>
              <CmsField id={`feature_0${n}_title`} label="Title" value={local[`feature_0${n}_title`]||""} onChange={v=>update(`feature_0${n}_title`,v)} maxChars={50} context={`feature card ${n}`} required />
              <CmsField id={`feature_0${n}_desc`} label="Description" value={local[`feature_0${n}_desc`]||""} onChange={v=>update(`feature_0${n}_desc`,v)} maxChars={120} context={`feature card ${n}`} multiline />
            </CmsSection>
          ))}
        </div>
        <PreviewPane><FeaturesPreview c={local} /></PreviewPane>
      </div>

      <ActionBar isDirty={isDirty} saving={saving} onDiscard={discard} onSave={save} sidebarCollapsed={ctx.sidebarCollapsed} />
    </div>
  );
}
