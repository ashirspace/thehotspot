import { useOutletContext } from "react-router-dom";
import { useEditor } from "../../hooks/useEditor.js";
import { fetchLoginContent, saveLoginContent, LOGIN_DEFAULTS } from "../../api/siteContentApi.js";
import CmsSection from "../../components/CmsSection.jsx";
import CmsField from "../../components/CmsField.jsx";
import PreviewPane from "../../components/PreviewPane.jsx";
import ActionBar from "../../components/ActionBar.jsx";

function LoginMiniPreview({ c }) {
  return (
    <div className="cms-login-preview">
      <div className="cms-login-preview-tagline">{c.login_tagline || "Tagline"}</div>
      <div className="cms-login-preview-card">
        <div className="cms-login-preview-title">{c.login_title || "Welcome back"}</div>
        <div className="cms-login-preview-sub">{c.login_subtitle || "Sign in to your dashboard"}</div>
        <div className="cms-login-preview-submit">{c.signin_btn || "Sign In"}</div>
      </div>
    </div>
  );
}

export default function BrandingEditor({ user }) {
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
        <div className="cms-editor-eyebrow">Login Page · Branding</div>
        <h1 className="cms-editor-title">Branding &amp; Tagline</h1>
        <p className="cms-editor-subtitle">Edit the brand tagline shown on the login page.</p>
        {lastSaved && <div className="cms-editor-meta">Last saved {lastSaved}</div>}
      </div>

      <div className="cms-editor-body">
        <div>
          <CmsSection number={1} title="Brand Tagline" desc="Shown below the logo">
            <CmsField
              id="login_tagline"
              label="Tagline"
              value={local.login_tagline || ""}
              onChange={v => update("login_tagline", v)}
              maxChars={50}
              context="login page"
              required
            />
          </CmsSection>
        </div>
        <PreviewPane><LoginMiniPreview c={local} /></PreviewPane>
      </div>

      <ActionBar
        isDirty={isDirty}
        saving={saving}
        onDiscard={discard}
        onSave={save}
        sidebarCollapsed={ctx.sidebarCollapsed}
      />
    </div>
  );
}
