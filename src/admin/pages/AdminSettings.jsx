import { useState, useEffect } from "react";
import { LuShield, LuMegaphone, LuWrench, LuCheck, LuX } from "react-icons/lu";

const FF = "'DM Sans', sans-serif";
const C = { card: "#111116", border: "#ffffff12", text: "#F1F5F9", muted: "#64748B", purple: "#6366f1", green: "#10b981", red: "#ef4444", yellow: "#f59e0b" };

async function api(body) {
  const r = await fetch("/api/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return r.json();
}

const inp = { width: "100%", background: "#0d0d12", border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 12px", fontSize: 13, color: C.text, fontFamily: FF, outline: "none", boxSizing: "border-box" };
const lbl = { fontSize: 11, fontWeight: 700, color: C.muted, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 };

function SectionCard({ icon: Icon, title, desc, children }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 22, marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <Icon size={16} color={C.purple} />
        <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{title}</div>
      </div>
      <div style={{ fontSize: 12, color: C.muted, marginBottom: 20 }}>{desc}</div>
      {children}
    </div>
  );
}

function StatusMsg({ msg }) {
  if (!msg) return null;
  const isErr = msg.startsWith("error:");
  return (
    <div style={{ background: isErr ? "#ef444414" : "#10b98114", border: `1px solid ${isErr ? "#ef444430" : "#10b98130"}`, borderRadius: 8, padding: "9px 14px", fontSize: 12, color: isErr ? C.red : C.green, marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
      {isErr ? <LuX size={13} /> : <LuCheck size={13} />}
      {isErr ? msg.replace("error:", "") : msg}
    </div>
  );
}

function ChangePasswordCard({ admin }) {
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    if (!form.current || !form.next || !form.confirm) { setMsg("error:All fields are required."); return; }
    if (form.next !== form.confirm) { setMsg("error:New passwords do not match."); return; }
    if (form.next.length < 6) { setMsg("error:Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      const d = await api({ action: "changePassword", adminId: admin?.id, currentPassword: form.current, newPassword: form.next });
      if (d.ok) { setMsg("Password updated successfully."); setForm({ current: "", next: "", confirm: "" }); }
      else setMsg("error:" + (d.error || "Failed."));
    } catch { setMsg("error:Network error."); }
    finally { setLoading(false); }
  }

  const field = (key, label) => (
    <div style={{ marginBottom: 14 }}>
      <label style={lbl}>{label}</label>
      <input type="password" value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder="••••••••" autoComplete="new-password" style={inp} />
    </div>
  );

  return (
    <SectionCard icon={LuShield} title="Change Password" desc="Update your admin account password. Minimum 6 characters.">
      <StatusMsg msg={msg} />
      <form onSubmit={submit}>
        {field("current", "Current Password")}
        {field("next", "New Password")}
        {field("confirm", "Confirm New Password")}
        <button type="submit" disabled={loading} style={{ padding: "10px 20px", borderRadius: 9, border: "none", background: C.purple, color: "#fff", fontSize: 13, fontWeight: 700, cursor: loading ? "default" : "pointer", fontFamily: FF, opacity: loading ? 0.7 : 1 }}>
          {loading ? "Saving…" : "Update password"}
        </button>
      </form>
    </SectionCard>
  );
}

function BannerCard() {
  const [banner, setBanner] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api({ action: "getBanner" }).then(d => { setBanner(d.banner || ""); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  async function submit(e) {
    e.preventDefault();
    setMsg(""); setSaving(true);
    try {
      const d = await api({ action: "setBanner", message: banner });
      if (d.ok) setMsg(banner ? "Banner saved. Visible to all users." : "Banner cleared.");
      else setMsg("error:" + (d.error || "Failed."));
    } catch { setMsg("error:Network error."); }
    finally { setSaving(false); }
  }

  return (
    <SectionCard icon={LuMegaphone} title="Announcement Banner" desc="Set a message shown to all users on their dashboard. Leave empty to hide it.">
      {loading ? <div style={{ color: C.muted, fontSize: 13 }}>Loading…</div> : (
        <>
          <StatusMsg msg={msg} />
          <form onSubmit={submit}>
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Banner message</label>
              <textarea value={banner} onChange={e => setBanner(e.target.value)} placeholder="e.g. Maintenance window on Sunday 2am–4am IST. Brief downtime expected." rows={4} style={{ ...inp, resize: "vertical" }} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button type="submit" disabled={saving} style={{ padding: "10px 20px", borderRadius: 9, border: "none", background: C.purple, color: "#fff", fontSize: 13, fontWeight: 700, cursor: saving ? "default" : "pointer", fontFamily: FF, opacity: saving ? 0.7 : 1 }}>
                {saving ? "Saving…" : "Save banner"}
              </button>
              {banner && (
                <button type="button" onClick={() => { setBanner(""); setMsg(""); }} style={{ padding: "10px 16px", borderRadius: 9, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: FF }}>
                  Clear
                </button>
              )}
            </div>
          </form>
        </>
      )}
    </SectionCard>
  );
}

function MaintenanceCard() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api({ action: "getBanner" }).then(d => { setEnabled(!!d.maintenance); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  async function toggle() {
    setSaving(true); setMsg("");
    try {
      const next = !enabled;
      const d = await api({ action: "setMaintenance", enabled: next });
      if (d.ok) { setEnabled(next); setMsg(next ? "Maintenance mode ON — users see a maintenance page." : "Maintenance mode OFF — platform is live."); }
      else setMsg("error:" + (d.error || "Failed."));
    } catch { setMsg("error:Network error."); }
    finally { setSaving(false); }
  }

  return (
    <SectionCard icon={LuWrench} title="Maintenance Mode" desc="When ON, users see a maintenance page and cannot access the dashboard.">
      {loading ? <div style={{ color: C.muted, fontSize: 13 }}>Loading…</div> : (
        <>
          <StatusMsg msg={msg} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0d0d12", border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Maintenance mode</div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Currently: <span style={{ fontWeight: 700, color: enabled ? C.yellow : C.green }}>{enabled ? "ON — Platform offline" : "OFF — Platform live"}</span></div>
            </div>
            <button onClick={toggle} disabled={saving} style={{ padding: "10px 20px", borderRadius: 9, border: "none", background: enabled ? C.red : C.green, color: "#fff", fontSize: 13, fontWeight: 700, cursor: saving ? "default" : "pointer", fontFamily: FF, opacity: saving ? 0.7 : 1 }}>
              {saving ? "…" : enabled ? "Disable" : "Enable"}
            </button>
          </div>
        </>
      )}
    </SectionCard>
  );
}

export default function AdminSettings({ admin }) {
  return (
    <div style={{ fontFamily: FF }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: -0.5 }}>Settings</div>
        <div style={{ fontSize: 13, color: C.muted, marginTop: 3 }}>Admin account and platform configuration</div>
      </div>
      <ChangePasswordCard admin={admin} />
      <BannerCard />
      <MaintenanceCard />
    </div>
  );
}
