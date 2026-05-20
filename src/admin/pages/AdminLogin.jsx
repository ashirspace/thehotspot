import { useState } from "react";
import { LuShield } from "react-icons/lu";
import "./AdminLogin.css";

async function adminApi(body) {
  const res = await fetch("/api/admin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

export default function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) { setError("Please enter email and password."); return; }
    setError("");
    setLoading(true);
    try {
      const data = await adminApi({ action: "login", email, password });
      if (data.ok) {
        onLogin(data.admin);
      } else {
        setError(data.error || "Invalid credentials.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-box">
        <div className="admin-login-brand">
          <div className="admin-login-logo">HS</div>
          <div className="admin-login-brand-text">
            <h1>thehotspot</h1>
            <p>Admin Portal</p>
          </div>
        </div>

        <div className="admin-login-card">
          <h2>Sign in to admin</h2>
          <p className="admin-login-desc">Restricted access. Admin credentials only.</p>

          {error && <div className="msg-error">{error}</div>}

          <form className="admin-login-form" onSubmit={handleSubmit}>
            <div className="admin-form-group">
              <label htmlFor="admin-email">Email address</label>
              <input
                id="admin-email"
                className="form-input"
                type="email"
                placeholder="admin@thehotspot.in"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="username"
                autoFocus
              />
            </div>
            <div className="admin-form-group">
              <label htmlFor="admin-password">Password</label>
              <input
                id="admin-password"
                className="form-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <button className="admin-login-submit" type="submit" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <div className="admin-login-footer">
          <LuShield size={12} style={{ verticalAlign: "middle", marginRight: 4 }} />
          Protected admin area — unauthorized access prohibited
        </div>
      </div>
    </div>
  );
}
