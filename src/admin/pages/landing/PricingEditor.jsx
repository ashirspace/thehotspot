import { useOutletContext } from "react-router-dom";
import { useEditor } from "../../hooks/useEditor.js";
import { fetchLandingContent, LANDING_DEFAULTS } from "../../api/siteContentApi.js";
import CmsSection from "../../components/CmsSection.jsx";
import CmsField from "../../components/CmsField.jsx";
import PreviewPane from "../../components/PreviewPane.jsx";
import ActionBar from "../../components/ActionBar.jsx";

const PLANS = [
  { n: "01", label: "Plan 1 (Free)" },
  { n: "02", label: "Plan 2 (Growth)" },
  { n: "03", label: "Plan 3 (Scale)" },
];

function PricingPreview({ c }) {
  return (
    <div style={{background:"var(--bg-alt)",padding:12,minHeight:240}}>
      <div style={{display:"flex",gap:8}}>
        {PLANS.map(({n,label}) => (
          <div key={n} style={{flex:1,background:"#fff",border:"1px solid var(--border)",borderRadius:8,padding:"10px 8px"}}>
            <div style={{fontSize:10,fontWeight:700,color:"var(--text)",marginBottom:2}}>{c[`plan_${n}_name`]||label}</div>
            <div style={{fontSize:14,fontWeight:700,color:"var(--teal)",marginBottom:2}}>${c[`plan_${n}_price`]||"0"}<span style={{fontSize:8,color:"var(--text-faint)"}}>/mo</span></div>
            <div style={{fontSize:8,color:"var(--text-faint)",marginBottom:6}}>{c[`plan_${n}_desc`]||""}</div>
            <div style={{fontSize:8,padding:"4px 8px",borderRadius:4,background:"var(--teal)",color:"#fff",textAlign:"center"}}>{c[`plan_${n}_cta`]||"Get started"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PricingEditor({ user }) {
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
        <div className="cms-editor-eyebrow">Landing Page · Pricing</div>
        <h1 className="cms-editor-title">Pricing Section</h1>
        <p className="cms-editor-subtitle">3 pricing plans with features and CTA buttons.</p>
        {lastSaved && <div className="cms-editor-meta">Last saved {lastSaved}</div>}
      </div>

      <div className="cms-editor-body">
        <div>
          {PLANS.map(({n, label}, idx) => (
            <CmsSection key={n} number={idx+1} title={label} desc={`Plan ${idx+1} of 3`}>
              <CmsField id={`plan_${n}_name`} label="Plan name" value={local[`plan_${n}_name`]||""} onChange={v=>update(`plan_${n}_name`,v)} maxChars={20} context="pricing" required />
              <CmsField id={`plan_${n}_price`} label="Price ($/mo)" value={local[`plan_${n}_price`]||""} onChange={v=>update(`plan_${n}_price`,v)} maxChars={10} context="pricing" hint="number only" />
              <CmsField id={`plan_${n}_desc`} label="Plan description" value={local[`plan_${n}_desc`]||""} onChange={v=>update(`plan_${n}_desc`,v)} maxChars={80} context="pricing" />
              <CmsField id={`plan_${n}_features`} label="Features (one per line)" value={local[`plan_${n}_features`]||""} onChange={v=>update(`plan_${n}_features`,v)} maxChars={400} context="pricing" multiline rows={5} hint="newline-separated" />
              <CmsField id={`plan_${n}_cta`} label="CTA button text" value={local[`plan_${n}_cta`]||""} onChange={v=>update(`plan_${n}_cta`,v)} maxChars={30} context="pricing" required />
            </CmsSection>
          ))}
        </div>
        <PreviewPane><PricingPreview c={local} /></PreviewPane>
      </div>

      <ActionBar isDirty={isDirty} saving={saving} onDiscard={discard} onSave={save} sidebarCollapsed={ctx.sidebarCollapsed} />
    </div>
  );
}
