import { useOutletContext } from "react-router-dom";
import { useEditor } from "../../hooks/useEditor.js";
import { fetchLoginContent, LOGIN_DEFAULTS } from "../../api/siteContentApi.js";
import { saveContent } from "../../api/siteContentApi.js";
import CmsSection from "../../components/CmsSection.jsx";
import CmsField from "../../components/CmsField.jsx";
import PreviewPane from "../../components/PreviewPane.jsx";
import ActionBar from "../../components/ActionBar.jsx";

function LoginMiniPreview({ c }) {
  return (
    <div className="cms-login-preview">
      <div className="cms-login-preview-card">
        <div className="cms-login-preview-title">{c.login_title || "Welcome back"}</div>
        <div className="cms-login-preview-sub">{c.login_subtitle || ""}</div>
        <div className="cms-login-preview-submit">{c.signin_btn || "Sign In"}</div>
        <div className="cms-login-preview-toggle">{c.signup_title || "Create your account"}</div>
      </div>
    </div>
  );
}

export default function WelcomeEditor({ user }) {
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
        <div className="cms-editor-eyebrow">Login Page · Welcome Text</div>
        <h1 className="cms-editor-title">Welcome Text</h1>
        <p className="cms-editor-subtitle">Headings and subtitles for sign-in and sign-up forms.</p>
        {lastSaved && <div className="cms-editor-meta">Last saved {lastSaved}</div>}
      </div>

      <div className="cms-editor-body">
        <div>
          <CmsSection number={1} title="Sign-in view" desc="Shown when returning users sign in">
            <CmsField id="login_title" label="Heading" value={local.login_title || ""} onChange={v => update("login_title", v)} maxChars={30} context="sign-in form" required />
            <CmsField id="login_subtitle" label="Subtitle" value={local.login_subtitle || ""} onChange={v => update("login_subtitle", v)} maxChars={80} context="sign-in form" multiline />
          </CmsSection>
          <CmsSection number={2} title="Sign-up view" desc="Shown on the create account form">
            <CmsField id="signup_title" label="Heading" value={local.signup_title || ""} onChange={v => update("signup_title", v)} maxChars={30} context="sign-up form" required />
            <CmsField id="signup_subtitle" label="Subtitle" value={local.signup_subtitle || ""} onChange={v => update("signup_subtitle", v)} maxChars={80} context="sign-up form" multiline />
          </CmsSection>
        </div>
        <PreviewPane><LoginMiniPreview c={local} /></PreviewPane>
      </div>

      <ActionBar isDirty={isDirty} saving={saving} onDiscard={discard} onSave={save} sidebarCollapsed={ctx.sidebarCollapsed} />
    </div>
  );
}
