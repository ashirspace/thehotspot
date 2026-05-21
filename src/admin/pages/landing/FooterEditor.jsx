import { useOutletContext } from "react-router-dom";
import { useEditor } from "../../hooks/useEditor.js";
import { fetchLandingContent, LANDING_DEFAULTS } from "../../api/siteContentApi.js";
import CmsSection from "../../components/CmsSection.jsx";
import CmsField from "../../components/CmsField.jsx";
import PreviewPane from "../../components/PreviewPane.jsx";
import ActionBar from "../../components/ActionBar.jsx";

function FooterPreview({ c }) {
  return (
    <div style={{background:"var(--bg-alt)",padding:16,minHeight:200}}>
      <div style={{background:"var(--teal)",borderRadius:8,padding:"16px",marginBottom:12,textAlign:"center"}}>
        <div style={{fontSize:13,fontWeight:700,color:"#fff",marginBottom:6}}>{c.footer_cta_heading||"Ready to grow connections?"}</div>
        <div style={{display:"inline-block",padding:"5px 14px",background:"#fff",borderRadius:4,color:"var(--teal)",fontSize:11,fontWeight:600}}>{c.footer_cta_btn||"Start free trial →"}</div>
      </div>
      <div style={{fontSize:9,color:"var(--text-faint)",textAlign:"center"}}>{c.footer_tagline||""}</div>
      <div style={{fontSize:8,color:"var(--text-faint)",textAlign:"center",marginTop:8}}>{c.footer_copyright||"© 2026 Ibra Digitals"}</div>
      <div style={{fontSize:8,color:"var(--text-faint)",textAlign:"center"}}>{c.footer_made_in||""}</div>
    </div>
  );
}

export default function FooterEditor({ user }) {
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
        <div className="cms-editor-eyebrow">Landing Page · Footer</div>
        <h1 className="cms-editor-title">Footer</h1>
        <p className="cms-editor-subtitle">CTA section and footer copy at the bottom of the landing page.</p>
        {lastSaved && <div className="cms-editor-meta">Last saved {lastSaved}</div>}
      </div>

      <div className="cms-editor-body">
        <div>
          <CmsSection number={1} title="CTA block" desc="The closing call-to-action">
            <CmsField id="footer_cta_heading" label="CTA heading" value={local.footer_cta_heading||""} onChange={v=>update("footer_cta_heading",v)} maxChars={60} context="footer" required />
            <CmsField id="footer_cta_btn" label="CTA button text" value={local.footer_cta_btn||""} onChange={v=>update("footer_cta_btn",v)} maxChars={30} context="footer" />
          </CmsSection>
          <CmsSection number={2} title="Brand copy" desc="Tagline and legal">
            <CmsField id="footer_tagline" label="Brand tagline" value={local.footer_tagline||""} onChange={v=>update("footer_tagline",v)} maxChars={60} context="footer" />
            <CmsField id="footer_copyright" label="Copyright line" value={local.footer_copyright||""} onChange={v=>update("footer_copyright",v)} maxChars={80} context="footer" />
            <CmsField id="footer_made_in" label="Made in line" value={local.footer_made_in||""} onChange={v=>update("footer_made_in",v)} maxChars={40} context="footer" />
          </CmsSection>
        </div>
        <PreviewPane><FooterPreview c={local} /></PreviewPane>
      </div>

      <ActionBar isDirty={isDirty} saving={saving} onDiscard={discard} onSave={save} sidebarCollapsed={ctx.sidebarCollapsed} />
    </div>
  );
}
