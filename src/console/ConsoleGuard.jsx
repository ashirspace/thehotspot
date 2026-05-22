import { useEffect, useState } from "react";

const CONSOLE_SESSION_KEY = "thehotspot_console_user";

export function getConsoleUser() {
  try {
    const u = JSON.parse(localStorage.getItem(CONSOLE_SESSION_KEY) || "null");
    if (u && (u.role === "admin" || u.role === "manager")) return u;
    return null;
  } catch {
    return null;
  }
}

async function attemptLogin(username, password) {
  const res = await fetch("/api/db", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "login", username, password }),
  });
  const data = await res.json();
  if (!data.found) return null;
  if (data.user?.role !== "admin" && data.user?.role !== "manager") return null;
  return data.user;
}

function ConsoleLogin({ onSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const inp = {
    width: "100%", boxSizing: "border-box", padding: "13px 16px",
    border: "1.5px solid rgba(0,0,0,0.12)", borderRadius: 10,
    fontSize: 15, background: "#f8fafc", fontFamily: "'Plus Jakarta Sans', sans-serif",
    outline: "none", color: "#0f172a",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) { setError("Enter your username and password."); return; }
    setLoading(true);
    setError("");
    try {
      const user = await attemptLogin(username, password);
      if (!user) { setError("Invalid credentials or insufficient permissions."); }
      else {
        localStorage.setItem(CONSOLE_SESSION_KEY, JSON.stringify(user));
        onSuccess(user);
      }
    } catch {
      setError("Connection error. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(145deg, #f8fffe 0%, #f0fdf9 50%, #f0f9ff 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Plus Jakarta Sans', sans-serif", position: "relative", overflow: "hidden" }}>
      {/* Decorative blobs */}
      <div style={{ position: "absolute", top: -100, left: -100, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -80, right: -60, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(14,165,233,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 4px 40px rgba(0,0,0,0.10)", padding: "48px 44px", width: "100%", maxWidth: 420, position: "relative", zIndex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#10b981", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 28 }}>thehotspot</div>
        <div style={{ fontSize: 26, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>Admin Console</div>
        <div style={{ fontSize: 14, color: "#64748b", marginBottom: 36 }}>Sign in with your admin credentials.</div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>Username</label>
            <input
              autoFocus type="text" value={username}
              onChange={e => setUsername(e.target.value)} placeholder="admin username"
              style={inp}
              onFocus={e => e.target.style.borderColor = "#10b981"}
              onBlur={e => e.target.style.borderColor = "rgba(0,0,0,0.12)"}
            />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>Password</label>
            <input
              type="password" value={password}
              onChange={e => setPassword(e.target.value)} placeholder="password"
              style={inp}
              onFocus={e => e.target.style.borderColor = "#10b981"}
              onBlur={e => e.target.style.borderColor = "rgba(0,0,0,0.12)"}
            />
          </div>

          {error && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#dc2626" }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{ padding: "14px", borderRadius: 10, border: "none", background: loading ? "#94a3b8" : "#0f172a", color: "#fff", fontSize: 15, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", marginTop: 4 }}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid #f1f5f9", fontSize: 13, color: "#94a3b8", textAlign: "center" }}>
          <a href="/" style={{ color: "#64748b", textDecoration: "none", fontWeight: 500 }}>Back to main site</a>
        </div>
      </div>
    </div>
  );
}

export default function ConsoleGuard({ children }) {
  const [state, setState] = useState("checking");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const u = getConsoleUser();
    if (u) { setUser(u); setState("ok"); }
    else { setState("login"); }
  }, []);

  if (state === "checking") return null;

  if (state === "login") {
    return <ConsoleLogin onSuccess={(u) => { setUser(u); setState("ok"); }} />;
  }

  return typeof children === "function" ? children(user) : children;
}
