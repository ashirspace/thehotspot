import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { LuCheck, LuTriangleAlert } from "react-icons/lu";
import { fetchLoginContent, saveLoginContent } from "../api/contentApi.js";
import { LOGIN_DEFAULTS, LOGIN_SECTIONS, MAX_SINGLE, MAX_MULTI } from "../loginFields.js";
import LoginPreview from "../LoginPreview.jsx";

function timeAgo(iso) {
  if (!iso) return null;
  const diff = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diff)) return null;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} minute${m !== 1 ? "s" : ""} ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h !== 1 ? "s" : ""} ago`;
  const d = Math.floor(h / 24);
  return `${d} day${d !== 1 ? "s" : ""} ago`;
}

const labelStyle = { fontSize: 12, fontWeight: 500, color: "var(--text-soft)" };

function Field({ f, value, err, onChange }) {
  const max = f.multiline ? MAX_MULTI : MAX_SINGLE;
  return (
    <div className="console-field">
      <label htmlFor={f.key} style={labelStyle}>
        {f.label}{f.required && <span className="console-field-req">*</span>}
      </label>
      {f.multiline ? (
        <textarea id={f.key} className="dash-textarea" rows={2} value={value}
          style={{ minHeight: 60 }} onChange={e => onChange(e.target.value)} />
      ) : (
        <input id={f.key} className="dash-input" type="text" value={value}
          onChange={e => onChange(e.target.value)} />
      )}
      {err
        ? <span className="console-field-error">{err}</span>
        : <span className="console-field-meta">{value.length}/{max} chars · {f.context}</span>}
    </div>
  );
}

export default function LoginEditor() {
  const { user } = useOutletContext();
  const [form, setForm] = useState(LOGIN_DEFAULTS);
  const [saved, setSaved] = useState(LOGIN_DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [meta, setMeta] = useState({ at: null, by: null });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchLoginContent().then(res => {
      if (res && res.data && Object.keys(res.data).length) {
        const merged = { ...LOGIN_DEFAULTS, ...res.data };
        setForm(merged);
        setSaved(merged);
        setMeta({ at: res.updated_at, by: res.updated_by });
      }
      setLoading(false);
    });
  }, []);

  const dirty = JSON.stringify(form) !== JSON.stringify(saved);

  const errors = {};
  LOGIN_SECTIONS.forEach(s => s.fields.forEach(f => {
    const raw = form[f.key] || "";
    const max = f.multiline ? MAX_MULTI : MAX_SINGLE;
    if (f.required && !raw.trim()) errors[f.key] = "This field is required";
    else if (raw.length > max) errors[f.key] = `Max ${max} characters`;
  }));
  const hasErrors = Object.keys(errors).length > 0;

  useEffect(() => {
    if (!dirty) return;
    const h = (e) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const setField = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const onCancel = () => setForm(saved);

  const onSave = async () => {
    if (hasErrors || saving) return;
    setSaving(true);
    try {
      await saveLoginContent(form, user?.username || "admin");
      console.log("[ADMIN]", user?.username, "saved login content");
      setSaved(form);
      setMeta({ at: new Date().toISOString(), by: user?.username || "admin" });
      setToast({ ok: true, msg: "Published. Live for users now." });
    } catch {
      setToast({ ok: false, msg: "Couldn't save. Try again." });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div>
        <header className="dash-page-head">
          <span className="dash-eyebrow">Content · Login</span>
          <h1 className="dash-page-title">Login Page <em>Editor</em></h1>
        </header>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 720 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="dash-skeleton" style={{ height: 56 }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <header className="dash-page-head">
        <span className="dash-eyebrow">Content · Login</span>
        <h1 className="dash-page-title">Login Page <em>Editor</em></h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)", maxWidth: 600 }}>
          Edit the text shown to users on the public sign-in screen. Changes go live immediately on save.
        </p>
      </header>

      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 1000, animation: "slideIn .3s ease" }}>
          <div className={`dash-toast ${toast.ok ? "is-green" : "is-red"}`}>
            {toast.ok
              ? <LuCheck size={15} style={{ color: "var(--green)", flexShrink: 0, marginTop: 1 }} />
              : <LuTriangleAlert size={15} style={{ color: "var(--red)", flexShrink: 0, marginTop: 1 }} />}
            <span>{toast.msg}</span>
          </div>
        </div>
      )}

      <div className="console-form">
        <div>
        {LOGIN_SECTIONS.map(section => (
          <div key={section.eyebrow} className="console-section">
            <span className="dash-eyebrow">{section.eyebrow}</span>
            <div className="console-fields">
              {section.fields.map(f => (
                <Field key={f.key} f={f} value={form[f.key] ?? ""} err={errors[f.key]}
                  onChange={v => setField(f.key, v)} />
              ))}
            </div>
          </div>
        ))}

        <div className="console-actions">
          <span className="dash-savestate">
            {meta.at ? `Last saved ${timeAgo(meta.at)}${meta.by ? ` by ${meta.by}` : ""}.` : "Not published yet."}
            {dirty && " Unsaved changes."}
          </span>
          <div className="console-actions-btns">
            <button className="dash-btn dash-btn-outline" onClick={onCancel} disabled={!dirty || saving}>
              Cancel
            </button>
            <button className="dash-btn dash-btn-primary" onClick={onSave} disabled={!dirty || hasErrors || saving}>
              {saving ? "Saving…" : "Save & Publish"}
            </button>
          </div>
        </div>
        </div>
        <LoginPreview form={form} />
      </div>
    </div>
  );
}
