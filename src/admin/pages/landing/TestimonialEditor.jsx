import { useOutletContext } from "react-router-dom";
import { useEditor } from "../../hooks/useEditor.js";
import { fetchLandingContent, LANDING_DEFAULTS } from "../../api/siteContentApi.js";
import CmsSection from "../../components/CmsSection.jsx";
import CmsField from "../../components/CmsField.jsx";
import PreviewPane from "../../components/PreviewPane.jsx";
import ActionBar from "../../components/ActionBar.jsx";

function TestimonialPreview({ c }) {
  return (
    <div style={{background:"var(--bg-alt)",padding:20,minHeight:200}}>
      <div style={{fontSize:14,fontStyle:"italic",color:"var(--text)",lineHeight:1.6,marginBottom:12,borderLeft:"3px solid var(--teal)",paddingLeft:12}}>
        "{c.testimonial_quote||"Testimonial quote here"}"
      </div>
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        <div style={{width:28,height:28,borderRadius:6,background:"var(--teal)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:11,fontWeight:700}}>
          {(c.testimonial_name||"P")[0]}
        </div>
        <div>
          <div style={{fontSize:11,fontWeight:600,color:"var(--text)"}}>{c.testimonial_name||"Name"}</div>
          <div style={{fontSize:10,color:"var(--text-faint)"}}>{c.testimonial_role||"Role"} · {c.testimonial_company||"Company"}</div>
        </div>
      </div>
    </div>
  );
}

export default function TestimonialEditor({ user }) {
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
        <div className="cms-editor-eyebrow">Landing Page · Testimonial</div>
        <h1 className="cms-editor-title">Testimonial</h1>
        <p className="cms-editor-subtitle">The pull quote from a customer on the landing page.</p>
        {lastSaved && <div className="cms-editor-meta">Last saved {lastSaved}</div>}
      </div>

      <div className="cms-editor-body">
        <div>
          <CmsSection number={1} title="Quote" desc="The customer's words">
            <CmsField id="testimonial_quote" label="Quote text" value={local.testimonial_quote||""} onChange={v=>update("testimonial_quote",v)} maxChars={300} context="testimonial" multiline rows={5} required />
          </CmsSection>
          <CmsSection number={2} title="Attribution" desc="Who said it">
            <CmsField id="testimonial_name" label="Full name" value={local.testimonial_name||""} onChange={v=>update("testimonial_name",v)} maxChars={40} context="testimonial" required />
            <CmsField id="testimonial_role" label="Job title" value={local.testimonial_role||""} onChange={v=>update("testimonial_role",v)} maxChars={40} context="testimonial" />
            <CmsField id="testimonial_company" label="Company" value={local.testimonial_company||""} onChange={v=>update("testimonial_company",v)} maxChars={40} context="testimonial" />
          </CmsSection>
        </div>
        <PreviewPane><TestimonialPreview c={local} /></PreviewPane>
      </div>

      <ActionBar isDirty={isDirty} saving={saving} onDiscard={discard} onSave={save} sidebarCollapsed={ctx.sidebarCollapsed} />
    </div>
  );
}
