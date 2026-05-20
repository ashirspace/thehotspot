import { useState } from "react";
import { LuShield, LuMail, LuLock, LuEye, LuEyeOff } from "react-icons/lu";

const FF = "'DM Sans', sans-serif";
const C = { bg: "#09090d", card: "#111116", border: "#ffffff12", text: "#F1F5F9", muted: "#64748B", purple: "#6366f1" };

async function api(body) {
  const r = await fetch("/api/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return r.json();
}

export default function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!email || !pw) { setErr("Enter email and password."); return; }
    setErr(""); setLoading(true);
    try {
      const d = await api({ action: "login", email, password: pw });
      if (d.ok) onLogin(d.admin);
      else setErr(d.error || "Invalid credentials.");
    } catch { setErr("Network error."); }
    finally { setLoading(false); }
  }

  const inp = { width: "100%", background: "#0d0d12", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px", fontSize: 13, color: C.text, fontFamily: FF, outline: "none", boxSizing: "border-box" };
  const lbl = { fontSize: 11, fontWeight: 700, color: C.muted, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 };

  return (
    <div style={{ minHeight: "100dvh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FF, padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: C.purple, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
            <LuShield size={24} color="#fff" />
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: -0.5 }}>thehotspot</div>
          <div style={{ fontSize: 11, color: C.muted, fontWeight: 700, letterSpacing: 1, marginTop: 2 }}>ADMIN PORTAL</div>
        </div>

        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 4 }}>Sign in to admin</div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 22 }}>Restricted access. Admin credentials only.</div>

          {err && (
            <div style={{ background: "#ef444414", border: "1px solid #ef444430", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#ef4444", marginBottom: 16 }}>{err}</div>
          )}

          <form onSubmit={submit}>
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Email</label>
              <div style={{ position: "relative" }}>
                <LuMail size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.muted, pointerEvents: "none" }} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@thehotspot.in" autoFocus style={{ ...inp, paddingLeft: 34 }} />
              </div>
            </div>

            <div style={{ marginBottom: 22 }}>
              <label style={lbl}>Password</label>
              <div style={{ position: "relative" }}>
                <LuLock size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.muted, pointerEvents: "none" }} />
                <input type={show ? "text" : "password"} value={pw} onChange={e => setPw(e.target.value)} placeholder="••••••••" style={{ ...inp, paddingLeft: 34, paddingRight: 36 }} />
                <button type="button" onClick={() => setShow(v => !v)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 2, display: "flex" }}>
                  {show ? <LuEyeOff size={14} /> : <LuEye size={14} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{ width: "100%", padding: 12, borderRadius: 10, border: "none", background: C.purple, color: "#fff", fontSize: 14, fontWeight: 700, cursor: loading ? "default" : "pointer", fontFamily: FF, opacity: loading ? 0.7 : 1 }}>
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <div style={{ textAlign: "center", marginTop: 18, fontSize: 11, color: C.muted }}>
          <LuShield size={11} style={{ verticalAlign: "middle", marginRight: 4 }} />
          Protected — unauthorized access prohibited
        </div>
      </div>
    </div>
  );
}
