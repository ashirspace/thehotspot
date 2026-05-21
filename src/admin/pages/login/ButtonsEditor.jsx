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
        <div className="cms-login-preview-google-btn">{c.google_btn||"Continue with Google"}</div>
        <div className="cms-login-preview-divider">{c.divider_text||"OR"}</div>
        <div className="cms-login-preview-submit">{c.signin_btn||"Sign In"}</div>
      </div>
    </div>
  );
}

export default function ButtonsEditor({ user }) {
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
        <div className="cms-editor-eyebrow">Login Page · Buttons</div>
        <h1 className="cms-editor-title">Buttons &amp; CTAs</h1>
        <p className="cms-editor-subtitle">Text on all login page buttons.</p>
        {lastSaved && <div className="cms-editor-meta">Last saved {lastSaved}</div>}
      </div>

      <div className="cms-editor-body">
        <div>
          <CmsSection number={1} title="OAuth button" desc="All views">
            <CmsField id="google_btn" label="Google button text" value={local.google_btn||""} onChange={v=>update("google_btn",v)} maxChars={30} context="all views" required />
            <CmsField id="divider_text" label="Divider text" value={local.divider_text||""} onChange={v=>update("divider_text",v)} maxChars={5} context="all views" />
          </CmsSection>
          <CmsSection number={2} title="Submit buttons" desc="Form CTAs">
            <CmsField id="signin_btn" label="Sign-in submit" value={local.signin_btn||""} onChange={v=>update("signin_btn",v)} maxChars={20} context="sign-in form" required />
            <CmsField id="signup_btn" label="Sign-up submit" value={local.signup_btn||""} onChange={v=>update("signup_btn",v)} maxChars={20} context="sign-up form" required />
          </CmsSection>
        </div>
        <PreviewPane><LoginMiniPreview c={local} /></PreviewPane>
      </div>

      <ActionBar isDirty={isDirty} saving={saving} onDiscard={discard} onSave={save} sidebarCollapsed={ctx.sidebarCollapsed} />
    </div>
  );
}
