import { useOutletContext } from "react-router-dom";
import { useEditor } from "../../hooks/useEditor.js";
import { fetchLoginContent, LOGIN_DEFAULTS } from "../../api/siteContentApi.js";
import CmsSection from "../../components/CmsSection.jsx";
import CmsField from "../../components/CmsField.jsx";
import PreviewPane from "../../components/PreviewPane.jsx";
import ActionBar from "../../components/ActionBar.jsx";

function LoginMiniPreview({ c }) {
  return (
    <div className="cms-login-preview">
      <div className="cms-login-preview-card">
        <div className="cms-login-preview-toggle">
          {c.login_no_account_q||"Don't have an account?"}{" "}
          <span style={{color:"#5eead4"}}>{c.login_no_account_a||"Sign Up"}</span>
        </div>
        <div className="cms-login-preview-toggle" style={{marginTop:4,color:"rgba(255,255,255,0.2)"}}>
          {c.login_footer||"Protected by thehotspot security"}
        </div>
      </div>
    </div>
  );
}

export default function ToggleLinksEditor({ user }) {
  const ctx = useOutletContext() || {};
  const { local, update, isDirty, saving, discard, save, lastSaved } = useEditor({
    fetchFn: fetchLoginContent,
    saveKey: "login",
    defaults: LOGIN_DEFAULTS,
    username: user?.username,
  });

  return (
    <div className="cms-editor">
      <div className="cms-editor-header">
        <div className="cms-editor-eyebrow">Login Page · Toggle Links</div>
        <h1 className="cms-editor-title">Toggle Links</h1>
        <p className="cms-editor-subtitle">Text for switching between sign-in and sign-up, plus footer text.</p>
        {lastSaved && <div className="cms-editor-meta">Last saved {lastSaved}</div>}
      </div>

      <div className="cms-editor-body">
        <div>
          <CmsSection number={1} title="Already have an account?" desc="Shown on sign-up form">
            <CmsField id="login_have_account_q" label="Question text" value={local.login_have_account_q||""} onChange={v=>update("login_have_account_q",v)} maxChars={40} context="sign-up form" />
            <CmsField id="login_have_account_a" label="Link text" value={local.login_have_account_a||""} onChange={v=>update("login_have_account_a",v)} maxChars={15} context="sign-up form" />
          </CmsSection>
          <CmsSection number={2} title="No account yet?" desc="Shown on sign-in form">
            <CmsField id="login_no_account_q" label="Question text" value={local.login_no_account_q||""} onChange={v=>update("login_no_account_q",v)} maxChars={40} context="sign-in form" />
            <CmsField id="login_no_account_a" label="Link text" value={local.login_no_account_a||""} onChange={v=>update("login_no_account_a",v)} maxChars={15} context="sign-in form" />
          </CmsSection>
          <CmsSection number={3} title="Footer text" desc="Bottom of the login card">
            <CmsField id="login_footer" label="Footer line" value={local.login_footer||""} onChange={v=>update("login_footer",v)} maxChars={50} context="login page" />
          </CmsSection>
        </div>
        <PreviewPane><LoginMiniPreview c={local} /></PreviewPane>
      </div>

      <ActionBar isDirty={isDirty} saving={saving} onDiscard={discard} onSave={save} sidebarCollapsed={ctx.sidebarCollapsed} />
    </div>
  );
}
