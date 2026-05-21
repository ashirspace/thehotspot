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
        <div className="cms-login-preview-title">Sign in</div>
        <div style={{fontSize:9,color:"rgba(255,255,255,0.4)",marginBottom:2}}>{c.username_label||"Username"}</div>
        <div className="cms-login-preview-input">{c.username_ph_login||"Enter username"}</div>
        <div style={{fontSize:9,color:"rgba(255,255,255,0.4)",marginBottom:2}}>{c.password_label||"Password"}</div>
        <div className="cms-login-preview-input">{c.password_ph_login||"Enter password"}</div>
      </div>
    </div>
  );
}

export default function FormLabelsEditor({ user }) {
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
        <div className="cms-editor-eyebrow">Login Page · Form Labels</div>
        <h1 className="cms-editor-title">Form Labels</h1>
        <p className="cms-editor-subtitle">Labels and placeholder text for all form fields.</p>
        {lastSaved && <div className="cms-editor-meta">Last saved {lastSaved}</div>}
      </div>

      <div className="cms-editor-body">
        <div>
          <CmsSection number={1} title="Username field" desc="Sign-in and sign-up">
            <CmsField id="username_label" label="Label" value={local.username_label||""} onChange={v=>update("username_label",v)} maxChars={20} context="both forms" />
            <CmsField id="username_ph_login" label="Placeholder (sign-in)" value={local.username_ph_login||""} onChange={v=>update("username_ph_login",v)} maxChars={30} context="sign-in form" />
            <CmsField id="username_ph_signup" label="Placeholder (sign-up)" value={local.username_ph_signup||""} onChange={v=>update("username_ph_signup",v)} maxChars={30} context="sign-up form" />
          </CmsSection>
          <CmsSection number={2} title="Email field" desc="Sign-up form">
            <CmsField id="email_label" label="Label" value={local.email_label||""} onChange={v=>update("email_label",v)} maxChars={20} context="sign-up form" />
            <CmsField id="email_ph" label="Placeholder" value={local.email_ph||""} onChange={v=>update("email_ph",v)} maxChars={30} context="sign-up form" />
          </CmsSection>
          <CmsSection number={3} title="Password field" desc="Both forms">
            <CmsField id="password_label" label="Label" value={local.password_label||""} onChange={v=>update("password_label",v)} maxChars={20} context="both forms" />
            <CmsField id="password_ph_login" label="Placeholder (sign-in)" value={local.password_ph_login||""} onChange={v=>update("password_ph_login",v)} maxChars={30} context="sign-in form" />
            <CmsField id="password_ph_signup" label="Placeholder (sign-up)" value={local.password_ph_signup||""} onChange={v=>update("password_ph_signup",v)} maxChars={30} context="sign-up form" />
          </CmsSection>
        </div>
        <PreviewPane><LoginMiniPreview c={local} /></PreviewPane>
      </div>

      <ActionBar isDirty={isDirty} saving={saving} onDiscard={discard} onSave={save} sidebarCollapsed={ctx.sidebarCollapsed} />
    </div>
  );
}
