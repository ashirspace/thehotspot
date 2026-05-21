import { useState } from "react";

const TABS = ["landing", "login", "signup"];

// Live, compressed dark replica of the login modal — updates as the form changes.
export default function LoginPreview({ form }) {
  const [view, setView] = useState("login");
  const f = (k) => form[k] || "";

  const title = view === "landing" ? f("landing_title") : view === "login" ? f("login_title") : f("signup_title");
  const sub = view === "landing" ? f("landing_subtitle") : view === "login" ? f("login_subtitle") : f("signup_subtitle");

  return (
    <div className="login-preview">
      <div className="login-preview-head">
        <span className="dash-eyebrow">Preview</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--green)" }}>
          <span className="dash-dot is-green" /> Live
        </span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 2, background: "var(--bg-hover)", borderRadius: 6, padding: 2 }}>
          {TABS.map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              border: "none", cursor: "pointer", padding: "3px 8px", borderRadius: 4,
              fontSize: 11, fontFamily: "var(--font-sans)", textTransform: "capitalize",
              background: view === v ? "var(--bg)" : "transparent",
              color: view === v ? "var(--text)" : "var(--text-soft)",
              fontWeight: view === v ? 600 : 500,
            }}>{v}</button>
          ))}
        </div>
      </div>

      <div className="login-preview-frame">
        <div className="lp-mini-logo">TH</div>
        <div className="lp-mini-brand">thehotspot</div>
        <div className="lp-mini-tagline">{sub}</div>

        <div className="lp-mini-card">
          <div className="lp-mini-title">{title}</div>
          <div className="lp-mini-gbtn">{f("google_btn")}</div>
          <div className="lp-mini-divider">{f("divider_text")}</div>

          {view === "landing" && (
            <>
              <div className="lp-mini-btn">{f("landing_signin_btn")}</div>
              <div className="lp-mini-btn" style={{ background: "#1a1a24" }}>{f("landing_getstarted_btn")}</div>
            </>
          )}
          {view === "login" && (
            <>
              <div className="lp-mini-label">{f("username_label")}</div>
              <div className="lp-mini-input">{f("username_ph_login")}</div>
              <div className="lp-mini-label">{f("password_label")}</div>
              <div className="lp-mini-input">{f("password_ph_login")}</div>
              <div className="lp-mini-btn">{f("signin_btn")}</div>
            </>
          )}
          {view === "signup" && (
            <>
              <div className="lp-mini-label">{f("username_label")}</div>
              <div className="lp-mini-input">{f("username_ph_signup")}</div>
              <div className="lp-mini-label">{f("email_label")}</div>
              <div className="lp-mini-input">{f("email_ph")}</div>
              <div className="lp-mini-label">{f("password_label")}</div>
              <div className="lp-mini-input">{f("password_ph_signup")}</div>
              <div className="lp-mini-btn">{f("signup_btn")}</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
