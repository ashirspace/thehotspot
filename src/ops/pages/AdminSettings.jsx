import { useState, useEffect } from "react";
import "./AdminSettings.css";

async function adminApi(body) {
  const res = await fetch("/api/admin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

function ChangePasswordCard({ adminId }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!current || !next || !confirm) { setError("All fields are required."); return; }
    if (next !== confirm) { setError("New passwords do not match."); return; }
    if (next.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      const d = await adminApi({ action: "changePassword", adminId, currentPassword: current, newPassword: next });
      if (d.ok) {
        setSuccess("Password updated successfully.");
        setCurrent(""); setNext(""); setConfirm("");
      } else {
        setError(d.error || "Failed to update password.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="settings-card">
      <h2>Change Password</h2>
      <p>Update your admin account password</p>
      {error && <div className="msg-error">{error}</div>}
      {success && <div className="msg-success">{success}</div>}
      <form className="settings-form" onSubmit={handleSubmit}>
        <div className="settings-form-group">
          <label>Current password</label>
          <input className="form-input" type="password" placeholder="••••••••" value={current} onChange={e => setCurrent(e.target.value)} autoComplete="current-password" />
        </div>
        <div className="settings-form-group">
          <label>New password</label>
          <input className="form-input" type="password" placeholder="••••••••" value={next} onChange={e => setNext(e.target.value)} autoComplete="new-password" />
        </div>
        <div className="settings-form-group">
          <label>Confirm new password</label>
          <input className="form-input" type="password" placeholder="••••••••" value={confirm} onChange={e => setConfirm(e.target.value)} autoComplete="new-password" />
        </div>
        <div className="settings-form-actions">
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Saving…" : "Update password"}
          </button>
        </div>
      </form>
    </div>
  );
}

function BannerCard({ adminId }) {
  const [banner, setBanner] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!adminId) return;
    adminApi({ action: "getBanner", adminId })
      .then(d => { if (d.banner !== undefined) setBanner(d.banner || ""); })
      .finally(() => setLoading(false));
  }, [adminId]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setSuccess("");
    setSaving(true);
    try {
      const d = await adminApi({ action: "setBanner", adminId, message: banner });
      if (d.ok) setSuccess("Banner saved. It will be visible to all users.");
      else setError(d.error || "Failed to save banner.");
    } catch {
      setError("Network error.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="settings-card">
      <h2>Announcement Banner</h2>
      <p>Set a message shown to all users on the dashboard. Leave empty to hide.</p>
      {error && <div className="msg-error">{error}</div>}
      {success && <div className="msg-success">{success}</div>}
      {loading ? (
        <div className="state-loading" />
      ) : (
        <form className="settings-form" onSubmit={handleSubmit}>
          <div className="settings-form-group">
            <label>Banner message</label>
            <textarea
              className="form-input settings-textarea"
              placeholder="e.g. We are upgrading our servers on Sunday 2am–4am IST. Brief downtime expected."
              value={banner}
              onChange={e => setBanner(e.target.value)}
              rows={4}
            />
          </div>
          <div className="settings-form-actions">
            <button className="btn-primary" type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save banner"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function AdminSettings({ admin }) {
  const adminId = admin?.id;

  return (
    <div>
      <div className="page-header">
        <div className="page-header__left">
          <h1>Settings</h1>
          <p>Admin account and platform configuration</p>
        </div>
      </div>

      <div className="settings-grid">
        <ChangePasswordCard adminId={adminId} />
        <BannerCard adminId={adminId} />
      </div>
    </div>
  );
}
