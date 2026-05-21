import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { LuCheck, LuTriangleAlert } from "react-icons/lu";
import { fetchContent, saveContent } from "./api/contentApi.js";
import { logAudit } from "./api/consoleApi.js";

const MAX_SINGLE = 120;
const MAX_MULTI = 400;
const labelStyle = { fontSize: 12, fontWeight: 500, color: "var(--text-soft)" };

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
        : <span className="console-field-meta">{value.length}/{max} chars{f.context ? ` · ${f.context}` : ""}</span>}
    </div>
  );
}

// Generic sectioned content editor — used by the Login and Site editors.
export default function ContentEditor({ contentKey, defaults, sections, eyebrow, title, titleEm, blurb, preview }) {
  const { user } = useOutletContext();
  const [form, setForm] = useState(defaults);
  const [saved, setSaved] = useState(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [meta, setMeta] = useState({ at: null, by: null });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchContent(contentKey).then(res => {
      if (!alive) return;
      if (res && res.data && Object.keys(res.data).length) {
        const merged = { ...defaults, ...res.data };
        setForm(merged);
        setSaved(merged);
        setMeta({ at: res.updated_at, by: res.updated_by });
      } else {
        setForm(defaults);
        setSaved(defaults);
      }
      setLoading(false);
    });
    return () => { alive = false; };
  }, [contentKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const dirty = JSON.stringify(form) !== JSON.stringify(saved);

  const errors = {};
  sections.forEach(s => s.fields.forEach(f => {
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
    const tm = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(tm);
  }, [toast]);

  const setField = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const onCancel = () => setForm(saved);

  const onSave = async () => {
    if (hasErrors || saving) return;
    setSaving(true);
    try {
      await saveContent(contentKey, form, user?.username || "admin");
      logAudit(user?.username || "admin", "content.save", contentKey, `Updated ${contentKey} copy`);
      console.log("[ADMIN]", user?.username, "saved content:", contentKey);
      setSaved(form);
      setMeta({ at: new Date().toISOString(), by: user?.username || "admin" });
      setToast({ ok: true, msg: "Published. Live for users now." });
    } catch {
      setToast({ ok: false, msg: "Couldn't save. Try again." });
    }
    setSaving(false);
  };

  const head = (
    <header className="dash-page-head">
      <span className="dash-eyebrow">{eyebrow}</span>
      <h1 className="dash-page-title">{title}{titleEm && <> <em>{titleEm}</em></>}</h1>
      {blurb && <p style={{ fontSize: 14, color: "var(--text-muted)", maxWidth: 600 }}>{blurb}</p>}
    </header>
  );

  if (loading) {
    return (
      <div>
        {head}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 720 }}>
          {[...Array(6)].map((_, i) => <div key={i} className="dash-skeleton" style={{ height: 56 }} />)}
        </div>
      </div>
    );
  }

  const formCol = (
    <div>
      {sections.map(section => (
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
  );

  return (
    <div>
      {head}
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
      {preview ? (
        <div className="console-form">
          {formCol}
          {preview(form)}
        </div>
      ) : (
        <div style={{ maxWidth: 720 }}>{formCol}</div>
      )}
    </div>
  );
}
