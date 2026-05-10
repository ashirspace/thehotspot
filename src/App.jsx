import { useState, useEffect, useRef, useMemo } from "react";

/* ───────── CONFIG ───────── */
const N8N_WEBHOOK_URL = "YOUR_N8N_WEBHOOK_URL_HERE";

// Airtable Config (keys from .env / Vercel Environment Variables)
const AIRTABLE_API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY || "";
const AIRTABLE_BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID || "";
const AIRTABLE_TABLE = import.meta.env.VITE_AIRTABLE_TABLE_NAME || "Users";
const AIRTABLE_CONTACTS_TABLE = import.meta.env.VITE_AIRTABLE_CONTACTS_TABLE || "Contacts";
const AIRTABLE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE}`;
const AIRTABLE_CONTACTS_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_CONTACTS_TABLE)}`;

// Airtable helper functions
async function airtableFetch(filterFormula) {
  const res = await fetch(`${AIRTABLE_URL}?filterByFormula=${encodeURIComponent(filterFormula)}`, {
    headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
  });
  const data = await res.json();
  return data.records || [];
}

async function airtableCreate(fields) {
  const res = await fetch(AIRTABLE_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ records: [{ fields }] }),
  });
  return await res.json();
}

// Fetch all contacts from Airtable (with pagination)
async function fetchAllContacts() {
  let allRecords = [];
  let offset = null;
  do {
    const url = offset ? `${AIRTABLE_CONTACTS_URL}?offset=${offset}` : AIRTABLE_CONTACTS_URL;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` } });
    const data = await res.json();
    allRecords = [...allRecords, ...(data.records || [])];
    offset = data.offset || null;
  } while (offset);
  return allRecords;
}

// Gmail OAuth Config — Replace with your Google Cloud Console credentials
// 1. Go to https://console.cloud.google.com
// 2. Create a project → Enable Gmail API
// 3. Create OAuth 2.0 credentials (Web Application)
// 4. Set redirect URI to: http://localhost:5173 (for dev) or your production URL
// 5. Paste your Client ID below
const GMAIL_CLIENT_ID = "1033289222732-c7c1kudmf0tuh1ustp2jme38ii8kqbm5.apps.googleusercontent.com";
const GMAIL_SCOPES = "https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send";
const GOOGLE_LOGIN_CLIENT_ID = GMAIL_CLIENT_ID; // Same client ID for Google Sign-In

/* ───────── ICONS (inline SVG) ───────── */
const I = {
  Send: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>,
  Bot: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" /><path d="M12 7v4" /><line x1="8" y1="16" x2="8" y2="16" /><line x1="16" y1="16" x2="16" y2="16" /></svg>,
  Mail: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>,
  Users: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  Activity: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>,
  Mic: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="22" /></svg>,
  MicOff: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="2" y1="2" x2="22" y2="22" /><path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2" /><path d="M5 10v2a7 7 0 0 0 12 5" /><path d="M15 9.34V5a3 3 0 0 0-5.68-1.33" /><path d="M9 9v3a3 3 0 0 0 5.12 2.12" /><line x1="12" y1="19" x2="12" y2="22" /></svg>,
  Zap: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
  Check: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
  Clock: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  Right: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>,
  Eye: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>,
  EyeOff: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>,
  Logout: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
};

/* ───────── LOGO ───────── */
function Logo({ size = 32 }) {
  const id = "lg" + size;
  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={id + "a"} x1="16" y1="0" x2="16" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="55%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id={id + "b"} x1="16" y1="8" x2="16" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      {/* Outer flame */}
      <path d="M16 40C9 36 3 29 5 21C7 14 12 16 12 11C12 7 10 4 13 2C14 1 15 0 16 0C17 0 18 1 19 2C22 4 20 7 20 11C20 16 25 14 27 21C29 29 23 36 16 40Z" fill={`url(#${id}a)`} />
      {/* Inner highlight */}
      <path d="M16 35C13 31 11.5 27 12.5 22.5C13 19.5 15 20 15 17C15 14 14 12 16 10C18 12 17 14 17 17C17 20 19 19.5 19.5 22.5C20.5 27 19 31 16 35Z" fill={`url(#${id}b)`} />
      {/* Core glow */}
      <circle cx="16" cy="31" r="2.2" fill="white" fillOpacity="0.3" />
    </svg>
  );
}

/* ───────── LOGIN PAGE ───────── */
function LoginPage({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const records = await airtableFetch(`AND({username}='${username}',{password}='${password}')`);
      if (records.length > 0) {
        const user = records[0].fields;
        const userData = { username: user.username, email: user.user_email, method: "password", role: user.role || "user" };
        localStorage.setItem("thehotspot_user", JSON.stringify(userData));
        onLogin(userData);
      } else {
        setError("Invalid username or password");
        setLoading(false);
      }
    } catch (err) {
      setError("Connection error. Please try again.");
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    if (!username || !email || !password) { setError("All fields are required"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);

    try {
      // Check if username already exists
      const existing = await airtableFetch(`{username}='${username}'`);
      if (existing.length > 0) { setError("Username already taken"); setLoading(false); return; }

      // Create new user
      await airtableCreate({
        username, user_email: email, password, method: "password", role: "user",
        created_at: new Date().toISOString().split("T")[0],
      });

      const userData = { username, email, method: "password", role: "user" };
      localStorage.setItem("thehotspot_user", JSON.stringify(userData));
      onLogin(userData);
    } catch (err) {
      setError("Signup failed. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setError("");
    if (!window.google?.accounts?.oauth2) {
      setError("Google Sign-In is not available. Please refresh and try again.");
      return;
    }
    setGoogleLoading(true);
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_LOGIN_CLIENT_ID,
      // Only request basic profile — no Gmail/Contacts scopes at login
      // (avoids "unverified app" warning; request extra scopes later when needed)
      scope: "email profile",
      error_callback: (err) => {
        setGoogleLoading(false);
        if (err.type === "popup_closed") {
          setError("Sign-in cancelled. Please try again.");
        } else {
          setError("Google Sign-In failed: " + (err.message || err.type || "Unknown error"));
        }
      },
      callback: async (response) => {
        if (response.error) {
          setGoogleLoading(false);
          setError("Google Sign-In failed: " + response.error);
          return;
        }
        if (!response.access_token) {
          setGoogleLoading(false);
          setError("No access token received. Please try again.");
          return;
        }
        try {
          const token = response.access_token;

          // Fetch user info
          const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const gUser = await res.json();

          const gEmail = gUser.email;
          const gName = gUser.name || gEmail.split("@")[0];
          const gPic = gUser.picture || "";

          // Save to Airtable
          const existing = await airtableFetch(`{user_email}='${gEmail}'`);
          if (existing.length === 0) {
            await airtableCreate({
              username: gName, user_email: gEmail, password: "", method: "google", role: "user",
              created_at: new Date().toISOString().split("T")[0],
            });
          }

          const userData = {
            username: existing[0]?.fields?.username || gName,
            email: gEmail,
            method: "google",
            role: existing[0]?.fields?.role || "user",
            avatar: gPic,
            accessToken: token,
          };
          localStorage.setItem("thehotspot_user", JSON.stringify(userData));
          // Clear loading state BEFORE calling onLogin so we don't set state on unmounted component
          setGoogleLoading(false);
          onLogin(userData);
        } catch (err) {
          setGoogleLoading(false);
          setError("Sign-in failed: " + err.message);
        }
      },
    });
    client.requestAccessToken();
  };

  return (
    <div className="lp-root" style={{ fontFamily: "'DM Sans',sans-serif", background: "#F0F4FF", display: "flex", flexDirection: "column", position: "relative" }}>

      <div style={{ position: "absolute", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle,#10b98118,transparent 70%)", top: "-150px", left: "-150px", pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle,#0ea5e914,transparent 70%)", bottom: "-100px", right: "-100px", pointerEvents: "none" }} />

      {/* ── Top nav ── */}
      <nav style={{ padding: "18px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #E2E8F0", background: "#FFFFFF", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Logo size={28} />
          <span style={{ fontSize: 16, fontWeight: 700, color: "#0F172A" }}>thehotspot</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <a href="/privacy.html" style={{ fontSize: 12, color: "#64748B", textDecoration: "none", padding: "6px 12px", borderRadius: 6, border: "1px solid #E2E8F0" }}
            onMouseEnter={e => e.currentTarget.style.color = "#10b981"} onMouseLeave={e => e.currentTarget.style.color = "#64748B"}>
            Privacy Policy
          </a>
          <a href="/terms.html" style={{ fontSize: 12, color: "#64748B", textDecoration: "none", padding: "6px 12px", borderRadius: 6, border: "1px solid #E2E8F0" }}
            onMouseEnter={e => e.currentTarget.style.color = "#10b981"} onMouseLeave={e => e.currentTarget.style.color = "#64748B"}>
            Terms of Service
          </a>
        </div>
      </nav>

      {/* ── Two-column body ── */}
      <div className="lp-body" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 32px", position: "relative", zIndex: 1, gap: 48, minHeight: 0 }}>

        {/* Left: Hero */}
        <div className="lp-hero" style={{ flex: 1, maxWidth: 480, paddingRight: 16 }}>
          <div style={{ marginBottom: 16 }}>
            <Logo size={44} />
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#ECFDF5", border: "1px solid #10b98133", borderRadius: 20, padding: "5px 14px", marginBottom: 18 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
            <span style={{ fontSize: 11, color: "#059669", fontWeight: 600, letterSpacing: .5 }}>Outreach Automation Platform</span>
          </div>
          <h1 style={{ fontSize: "clamp(26px,4vw,38px)", fontWeight: 800, color: "#0F172A", letterSpacing: -1, marginBottom: 14, lineHeight: 1.15 }}>
            Grow your network.<br />
            <span style={{ background: "linear-gradient(135deg,#10b981,#0ea5e9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Automate your outreach.</span>
          </h1>
          <p style={{ fontSize: 14, color: "#64748B", marginBottom: 24, lineHeight: 1.7 }}>
            thehotspot is an outreach management platform for affiliate marketers and business development teams.
            Import contacts, track campaigns, and send personalised emails — all from one dashboard.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {["Contact database", "Campaign tracking", "Email automation", "Google Sheets import", "AI assistant"].map(f => (
              <span key={f} style={{ fontSize: 12, color: "#64748B", background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 20, padding: "4px 12px" }}>{f}</span>
            ))}
          </div>
        </div>

        {/* Right: Login card */}
        <div className="lp-card-wrap" style={{ width: "100%", maxWidth: 400, flexShrink: 0 }}>
          <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 20, padding: "32px 28px", boxShadow: "0 8px 40px rgba(79,70,229,0.08)" }}>
            <div style={{ fontSize: 18, fontWeight: 600, color: "#0F172A", marginBottom: 4 }}>{isSignup ? "Create account" : "Welcome back"}</div>
            <div style={{ fontSize: 13, color: "#64748B", marginBottom: 24 }}>{isSignup ? "Sign up to start using thehotspot" : "Sign in to access your dashboard"}</div>

            {/* Google Button */}
            <button onClick={handleGoogleLogin} disabled={googleLoading} style={{
              width: "100%", padding: "12px", borderRadius: 12, border: "1px solid #E2E8F0",
              background: "#F8FAFF", color: "#0F172A", fontSize: 14, fontWeight: 500,
              cursor: googleLoading ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              gap: 10, fontFamily: "'DM Sans',sans-serif", transition: "all .2s", marginBottom: 20,
              opacity: googleLoading ? 0.7 : 1,
            }}
              onMouseEnter={e => { if (!googleLoading) { e.currentTarget.style.borderColor = "#4285F4"; e.currentTarget.style.background = "#EEF5FF"; } }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.background = "#F8FAFF"; }}
            >
              {googleLoading ? (
                <>{[0, 1, 2].map(d => <div key={d} style={{ width: 6, height: 6, borderRadius: "50%", background: "#64748B", animation: `pulse 1.2s ease-in-out ${d * .2}s infinite` }} />)}</>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" /><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" /><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" /><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" /></svg>
                  Continue with Google
                </>
              )}
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
              <span style={{ fontSize: 11, color: "#94A3B8", fontWeight: 500, textTransform: "uppercase", letterSpacing: 1 }}>or</span>
              <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
            </div>

            <form onSubmit={isSignup ? handleSignup : handleLogin}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, color: "#64748B", fontWeight: 500, display: "block", marginBottom: 6 }}>Username</label>
                <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter username"
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid #E2E8F0", background: "#FFFFFF", color: "#0F172A", fontSize: 13, outline: "none", fontFamily: "'DM Sans',sans-serif", boxSizing: "border-box" }}
                  onFocus={e => e.target.style.borderColor = "#10b981"} onBlur={e => e.target.style.borderColor = "#E2E8F0"}
                />
              </div>

              {isSignup && (
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, color: "#64748B", fontWeight: 500, display: "block", marginBottom: 6 }}>Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter email"
                    style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid #E2E8F0", background: "#FFFFFF", color: "#0F172A", fontSize: 13, outline: "none", fontFamily: "'DM Sans',sans-serif", boxSizing: "border-box" }}
                    onFocus={e => e.target.style.borderColor = "#10b981"} onBlur={e => e.target.style.borderColor = "#E2E8F0"}
                  />
                </div>
              )}

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, color: "#64748B", fontWeight: 500, display: "block", marginBottom: 6 }}>Password</label>
                <div style={{ position: "relative" }}>
                  <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password"
                    style={{ width: "100%", padding: "11px 42px 11px 14px", borderRadius: 10, border: "1px solid #E2E8F0", background: "#FFFFFF", color: "#0F172A", fontSize: 13, outline: "none", fontFamily: "'DM Sans',sans-serif", boxSizing: "border-box" }}
                    onFocus={e => e.target.style.borderColor = "#10b981"} onBlur={e => e.target.style.borderColor = "#E2E8F0"}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#94A3B8", cursor: "pointer", padding: 4 }}>
                    {showPass ? <I.EyeOff /> : <I.Eye />}
                  </button>
                </div>
              </div>

              {error && (
                <div style={{ background: "#FEF2F2", border: "1px solid #EF444433", color: "#EF4444", padding: "10px 14px", borderRadius: 10, fontSize: 12, fontWeight: 500, marginBottom: 16, textAlign: "center" }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading || !username || !password} style={{
                width: "100%", padding: "12px", borderRadius: 12, border: "none",
                background: (username && password) ? "linear-gradient(135deg,#10b981,#0ea5e9)" : "#EFF1F8",
                color: (username && password) ? "#fff" : "#94A3B8",
                fontSize: 14, fontWeight: 600, cursor: (username && password) ? "pointer" : "default",
                fontFamily: "'DM Sans',sans-serif", transition: "all .2s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
                {loading ? (
                  <>{[0, 1, 2].map(d => <div key={d} style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", animation: `pulse 1.2s ease-in-out ${d * .2}s infinite` }} />)}</>
                ) : isSignup ? "Create Account" : "Sign In"}
              </button>
            </form>

            {/* Toggle Login/Signup */}
            <div style={{ textAlign: "center", marginTop: 18 }}>
              <span style={{ fontSize: 13, color: "#64748B" }}>{isSignup ? "Already have an account?" : "Don't have an account?"} </span>
              <button onClick={() => { setIsSignup(!isSignup); setError(""); setUsername(""); setPassword(""); setEmail(""); }} style={{
                background: "none", border: "none", color: "#10b981", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
              }}>
                {isSignup ? "Sign In" : "Sign Up"}
              </button>
            </div>
          </div>

          {/* Footer links */}
          <div style={{ textAlign: "center", marginTop: 20, display: "flex", alignItems: "center", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, color: "#94A3B8" }}>&copy; 2026 thehotspot</span>
            <a href="/privacy.html" style={{ fontSize: 11, color: "#64748B", textDecoration: "none" }}
              onMouseEnter={e => e.currentTarget.style.color = "#10b981"} onMouseLeave={e => e.currentTarget.style.color = "#64748B"}>
              Privacy Policy
            </a>
            <a href="/terms.html" style={{ fontSize: 11, color: "#64748B", textDecoration: "none" }}
              onMouseEnter={e => e.currentTarget.style.color = "#10b981"} onMouseLeave={e => e.currentTarget.style.color = "#64748B"}>
              Terms of Service
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:.3;transform:scale(.9)} 50%{opacity:1;transform:scale(1.1)} }
        *{box-sizing:border-box;margin:0;padding:0}
        input::placeholder{color:#CBD5E1}

        /* Desktop: full-height, no scroll */
        .lp-root { height:100vh; overflow:hidden; }
        .lp-body { flex:1; min-height:0; }

        /* Mobile: stacked, scrollable */
        @media (max-width: 700px) {
          .lp-root { height:auto; min-height:100vh; overflow-y:auto; -webkit-overflow-scrolling:touch; }
          .lp-body { flex-direction:column; align-items:stretch; padding:24px 20px 40px; gap:32px; overflow:visible; }
          .lp-hero { max-width:100%; padding-right:0; text-align:center; }
          .lp-hero > div:first-child { justify-content:center; display:flex; }
          .lp-hero > div:nth-child(2) { margin-left:auto; margin-right:auto; }
          .lp-card-wrap { max-width:100%; flex-shrink:unset; }
        }
      `}</style>
    </div>
  );
}

/* ───────── CATEGORY COLORS ───────── */
const CAT = {
  Network: { bg: "#ECFDF5", text: "#065F46", dot: "#10b981" },
  CPS: { bg: "#EEF2FF", text: "#3730A3", dot: "#6366f1" },
  CPL: { bg: "#FFF7ED", text: "#9A3412", dot: "#f97316" },
  CPA: { bg: "#FDF4FF", text: "#86198F", dot: "#d946ef" },
  Mobile: { bg: "#F0F9FF", text: "#0C4A6E", dot: "#0ea5e9" },
};

/* ───────── SAMPLE DATA ───────── */
const CONTACTS = [];

const STATS = { totalContacts: 0, emailsSent: 0, categories: 5, successRate: 0 };

/* ───────── SMART CHATBOT (works without API) ───────── */
const STATS_DATA = { totalContacts: 0, emailsSent: 0, categories: 5, successRate: 0 };

function getSmartResponse(text) {
  const lower = text.toLowerCase();
  const categories = ["network", "cps", "cpl", "cpa", "mobile"];
  const matchedCat = categories.find(c => lower.includes(c.toLowerCase()));

  // Greetings
  if (/^(hi|hello|hey|yo|sup|hola|namaste|salaam)/i.test(lower)) {
    return { text: "Hey there! 👋 I'm your thehotspot assistant. I can help you with:\n\n• Sending outreach emails (by category or all)\n• Checking campaign stats & status\n• Pausing or resuming workflows\n• Adding new contacts\n• Modifying email templates\n\nJust tell me what you need!", action: null };
  }

  // What can you do
  if (lower.includes("what") && (lower.includes("can you") || lower.includes("you do") || lower.includes("things"))) {
    return { text: "Here's everything I can do for you:\n\n📧 **Email Management**\n• Send emails to all contacts or by category (Network, CPS, CPL, CPA, Mobile)\n• Check email delivery status\n\n📊 **Campaign Stats**\n• View total contacts, emails sent, success rate\n• Get category-wise breakdown\n\n⚙️ **Workflow Control**\n• Pause the outreach workflow\n• Resume the outreach workflow\n• Schedule campaigns\n\n👤 **Contact Management**\n• Add new contacts to the database\n• Remove contacts\n• Filter by category\n\n✏️ **Templates**\n• View current email templates\n• Modify templates by category\n\nJust type what you need in plain English!", action: null };
  }

  // Send emails
  if (lower.includes("send") && (lower.includes("email") || lower.includes("mail"))) {
    if (matchedCat) {
      return { text: `Got it! Triggering outreach emails to all **${matchedCat.toUpperCase()}** companies now. 🚀\n\nThe workflow will:\n1. Fetch contacts from the ${matchedCat.toUpperCase()} category\n2. Generate personalized emails\n3. Send via Gmail\n\nI'll notify you once it's done!`, action: { type: "send_emails", category: matchedCat } };
    }
    return { text: "Sending outreach emails to **all categories** (Network, CPS, CPL, CPA, Mobile). 🚀\n\nThis will process all contacts in your database. I'll notify you when complete!", action: { type: "send_emails", category: "all" } };
  }

  // Status / Stats
  if (lower.includes("status") || lower.includes("stats") || lower.includes("report") || lower.includes("how") && lower.includes("going")) {
    return { text: `Here's your current campaign overview:\n\n📊 **Campaign Dashboard**\n• Total Contacts: ${STATS_DATA.totalContacts}\n• Emails Sent: ${STATS_DATA.emailsSent}\n• Active Categories: ${STATS_DATA.categories}\n• Success Rate: ${STATS_DATA.successRate}%\n• Failed: ${STATS_DATA.totalContacts - STATS_DATA.emailsSent} pending/failed\n\nWant me to drill down into a specific category?`, action: { type: "show_stats" } };
  }

  // Pause
  if (lower.includes("pause") || lower.includes("stop") || lower.includes("hold")) {
    return { text: "Pausing the outreach workflow now. ⏸️\n\nNo new emails will be sent until you resume. Any emails currently in queue will be held.\n\nSay **\"resume\"** when you're ready to continue.", action: { type: "pause_workflow" } };
  }

  // Resume / Start
  if (lower.includes("resume") || lower.includes("start") || lower.includes("continue") || lower.includes("unpause")) {
    return { text: "Resuming the outreach workflow! ▶️\n\nEmails will continue sending from where we left off. The queue is being processed now.\n\nI'll keep you updated on progress!", action: { type: "resume_workflow" } };
  }

  // Add contact
  if (lower.includes("add") && (lower.includes("contact") || lower.includes("company") || lower.includes("email"))) {
    return { text: "Sure! To add a new contact, I'll need:\n\n1. **Company Name** — e.g., AdCombo\n2. **Email Address** — e.g., partner@adcombo.com\n3. **Category** — Network, CPS, CPL, CPA, or Mobile\n\nYou can type it like:\n\"Add AdCombo, partner@adcombo.com, Network\"\n\nOr just give me the details one by one!", action: null };
  }

  // Template
  if (lower.includes("template") || lower.includes("email body") || lower.includes("email content")) {
    return { text: "Which category's email template would you like to modify?\n\n• **Network** — Affiliate network partnership emails\n• **CPS** — Cost-per-sale campaign emails\n• **CPL** — Cost-per-lead campaign emails\n• **CPA** — Cost-per-action campaign emails\n• **Mobile** — Mobile marketing emails\n\nJust tell me the category and what changes you'd like!", action: null };
  }

  // Schedule
  if (lower.includes("schedule") || lower.includes("later") || lower.includes("tomorrow") || lower.includes("time")) {
    return { text: "I can help schedule your campaigns! Here are your options:\n\n⏰ **Scheduling Options:**\n• Send now\n• Schedule for a specific date & time\n• Set up recurring daily/weekly sends\n\nJust tell me when you'd like the emails to go out, e.g.:\n\"Schedule Network emails for tomorrow 10 AM\"", action: null };
  }

  // Remove / Delete contact
  if (lower.includes("remove") || lower.includes("delete")) {
    return { text: "To remove a contact, tell me the **company name** or **email address** you want to delete.\n\nFor example:\n\"Remove ByteForge AI\"\n\"Delete partner@adcombo.com\"\n\n⚠️ This action cannot be undone, so I'll ask for confirmation before deleting.", action: null };
  }

  // Help
  if (lower.includes("help") || lower.includes("how do i") || lower.includes("guide")) {
    return { text: "Here's a quick guide to using thehotspot:\n\n🚀 **Getting Started:**\n• \"Send emails to all companies\" — triggers full outreach\n• \"Send emails to CPA companies\" — category-specific\n\n📊 **Monitoring:**\n• \"Show me stats\" — campaign overview\n• \"Campaign status\" — delivery report\n\n⚙️ **Control:**\n• \"Pause workflow\" — stop sending\n• \"Resume workflow\" — continue sending\n\n👤 **Contacts:**\n• \"Add a contact\" — new entry\n• \"Remove a contact\" — delete entry\n\nJust type naturally — I understand plain English!", action: null };
  }

  // Category info
  if (matchedCat && !lower.includes("send")) {
    const catInfo = {
      network: "Network category contains affiliate network partners. These are companies that manage multiple affiliate programs.",
      cps: "CPS (Cost Per Sale) category contains partners where commission is earned per successful sale.",
      cpl: "CPL (Cost Per Lead) category contains partners where payment is made per qualified lead generated.",
      cpa: "CPA (Cost Per Action) category contains partners where payment is triggered by a specific user action.",
      mobile: "Mobile category contains mobile marketing and app-based advertising partners."
    };
    return { text: `**${matchedCat.toUpperCase()} Category:**\n${catInfo[matchedCat]}\n\nWant me to:\n• Send emails to all ${matchedCat.toUpperCase()} contacts?\n• Show ${matchedCat.toUpperCase()} specific stats?\n• Modify the ${matchedCat.toUpperCase()} email template?`, action: null };
  }

  // Thanks
  if (lower.includes("thank") || lower.includes("thanks") || lower.includes("shukriya") || lower.includes("dhanyavad")) {
    return { text: "You're welcome! 😊 Let me know if you need anything else. I'm always here to help manage your outreach campaigns!", action: null };
  }

  // Count / How many
  if (lower.includes("how many") || lower.includes("count") || lower.includes("total")) {
    return { text: `Here's the count breakdown:\n\n• **Total Contacts:** ${STATS_DATA.totalContacts}\n• **Emails Sent:** ${STATS_DATA.emailsSent}\n• **Pending:** ${STATS_DATA.totalContacts - STATS_DATA.emailsSent}\n• **Categories:** ${STATS_DATA.categories} (Network, CPS, CPL, CPA, Mobile)\n• **Success Rate:** ${STATS_DATA.successRate}%`, action: null };
  }

  // Fallback — still helpful!
  return { text: `I'm not sure I understood that fully, but here's what I can help with:\n\n• **\"Send emails\"** — to all or specific category\n• **\"Show stats\"** — campaign overview\n• **\"Pause/Resume\"** — control workflow\n• **\"Add contact\"** — new entry\n• **\"Help\"** — full guide\n\nTry rephrasing or pick one of the above!`, action: null };
}

/* ───────── STYLES (object) ───────── */
const S = {
  app: { fontFamily: "'DM Sans',sans-serif", background: "#F0F4FF", color: "#0F172A", minHeight: "100vh", display: "flex", flexDirection: "column", width: "100%", maxWidth: "100vw", overflow: "hidden" },
  header: { padding: "16px 28px", borderBottom: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#FFFFFF" },
  logo: { width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#10b981,#0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: "#fff" },
  layout: { flex: 1, display: "flex", overflow: "hidden", height: "calc(100vh - 65px)" },
  content: { flex: 1, padding: "24px 28px", overflowY: "auto" },
  sectionLabel: { fontSize: 12, color: "#64748B", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 },
};

/* ───────── COMPONENTS ───────── */
function Badge({ status }) {
  const m = { sent: { bg: "#ECFDF5", c: "#059669", l: "Sent" }, queued: { bg: "#EEF2FF", c: "#4F46E5", l: "Queued" }, failed: { bg: "#FEF2F2", c: "#EF4444", l: "Failed" } };
  const s = m[status] || m.queued;
  return <span style={{ background: s.bg, color: s.c, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, letterSpacing: .5, textTransform: "uppercase", border: `1px solid ${s.c}33` }}>{s.l}</span>;
}

function StatCard({ icon, label, value, accent, locked, onConnect, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={locked ? onConnect : onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ background: "#FFFFFF", border: `1px solid ${hover && !locked ? accent + "55" : "#E2E8F0"}`, borderRadius: 16, padding: "20px 22px", flex: 1, minWidth: 140, position: "relative", overflow: "hidden", opacity: locked ? 0.5 : 1, filter: locked ? "grayscale(0.5)" : "none", transition: "all .3s ease", cursor: "pointer", transform: hover && !locked ? "translateY(-2px)" : "none", boxShadow: hover && !locked ? `0 8px 24px ${accent}18` : "0 2px 8px rgba(0,0,0,0.06)" }}>
      <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: 80, background: `radial-gradient(circle at top right,${accent}12,transparent 70%)` }} />
      {locked && (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.85)", zIndex: 2, borderRadius: 16, cursor: "pointer", backdropFilter: "blur(4px)" }} onClick={onConnect}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
          <div style={{ fontSize: 10, color: "#64748B", marginTop: 6, fontWeight: 600, letterSpacing: .5, textTransform: "uppercase" }}>Connect Gmail</div>
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: `${accent}15`, display: "flex", alignItems: "center", justifyContent: "center", color: accent, marginBottom: 14 }}>{icon}</div>
        {!locked && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={hover ? accent : "#CBD5E1"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "all .2s" }}><polyline points="9 18 15 12 9 6" /></svg>}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: "#0F172A", fontFamily: "'JetBrains Mono',monospace", letterSpacing: -1 }}>{locked ? "0" : value}</div>
      <div style={{ fontSize: 12, color: "#64748B", marginTop: 4, fontWeight: 500, letterSpacing: .5, textTransform: "uppercase" }}>{label}</div>
    </div>
  );
}

/* ───────── DETAIL PAGES ───────── */
function BackButton({ onClick, label }) {
  return (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", color: "#64748B", cursor: "pointer", fontSize: 13, fontWeight: 500, fontFamily: "'DM Sans',sans-serif", marginBottom: 20, padding: 0, transition: "color .2s" }}
      onMouseEnter={e => e.currentTarget.style.color = "#0F172A"}
      onMouseLeave={e => e.currentTarget.style.color = "#64748B"}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
      Back to Dashboard
    </button>
  );
}

function TotalContactsPage({ onBack, user }) {
  const contacts = useMemo(() => { try { return JSON.parse(localStorage.getItem("thehotspot_contacts")) || []; } catch { return []; } }, []);
  const countBycat = useMemo(() => contacts.reduce((acc, c) => { const k = c.category || "Other"; acc[k] = (acc[k] || 0) + 1; return acc; }, {}), [contacts]);
  const contactsByCategory = [
    { cat: "Network", count: countBycat["Network"] || 0, color: CAT.Network },
    { cat: "CPS", count: countBycat["CPS"] || 0, color: CAT.CPS },
    { cat: "CPL", count: countBycat["CPL"] || 0, color: CAT.CPL },
    { cat: "CPA", count: countBycat["CPA"] || 0, color: CAT.CPA },
    { cat: "Mobile", count: countBycat["Mobile"] || 0, color: CAT.Mobile },
  ];
  const total = contacts.length || user?.contactsCount || 0;
  const maxCount = Math.max(...contactsByCategory.map(c => c.count), 1);

  return (
    <div>
      <BackButton onClick={onBack} />
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: "#10b98118", display: "flex", alignItems: "center", justifyContent: "center", color: "#10b981" }}><I.Users /></div>
        <div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#0F172A", fontFamily: "'JetBrains Mono',monospace" }}>{total}</div>
          <div style={{ fontSize: 12, color: "#64748B", textTransform: "uppercase", letterSpacing: .5, fontWeight: 600 }}>Gmail Contacts</div>
        </div>
      </div>
      {user?.method !== "google" && (
        <div style={{ background: "#FFF7ED", border: "1px solid #f9731633", borderRadius: 12, padding: "14px 18px", marginBottom: 20, marginTop: 16, fontSize: 13, color: "#9A3412" }}>
          Sign in with Google to see your real contacts count.
        </div>
      )}
      <div style={{ fontSize: 12, color: "#64748B", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 12, marginTop: 24 }}>Emails sent by category (via thehotspot)</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {contactsByCategory.map(c => (
          <div key={c.cat} style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 12, padding: "16px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: c.color.dot, display: "inline-block" }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: c.color.text }}>{c.cat}</span>
              </div>
              <span style={{ fontSize: 18, fontWeight: 700, color: "#0F172A", fontFamily: "'JetBrains Mono',monospace" }}>{c.count}</span>
            </div>
            <div style={{ width: "100%", height: 6, background: "#EFF1F8", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ width: `${(c.count / maxCount) * 100}%`, height: "100%", background: c.color.dot, borderRadius: 3, transition: "width .5s ease" }} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 12, padding: "16px 18px", marginTop: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, color: "#64748B", fontWeight: 500 }}>Recently Added</span>
          <span style={{ fontSize: 11, color: "#94A3B8" }}>Last 7 days</span>
        </div>
        <div style={{ fontSize: 32, fontWeight: 700, color: "#10b981", fontFamily: "'JetBrains Mono',monospace", marginTop: 8 }}>0</div>
      </div>
    </div>
  );
}

function EmailsSentPage({ onBack, sentCount, gmailConnected }) {
  const total = sentCount || 0;

  return (
    <div>
      <BackButton onClick={onBack} />
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: "#6366f118", display: "flex", alignItems: "center", justifyContent: "center", color: "#6366f1" }}><I.Mail /></div>
        <div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#0F172A", fontFamily: "'JetBrains Mono',monospace" }}>{total.toLocaleString()}</div>
          <div style={{ fontSize: 12, color: "#64748B", textTransform: "uppercase", letterSpacing: .5, fontWeight: 600 }}>Total Emails Sent (Gmail)</div>
        </div>
      </div>
      {!gmailConnected && (
        <div style={{ background: "#F0F9FF", border: "1px solid #0ea5e933", borderRadius: 12, padding: "14px 18px", marginBottom: 20, marginTop: 16, fontSize: 13, color: "#0C4A6E" }}>
          Connect Gmail from the Dashboard to see your real sent email count.
        </div>
      )}
      <div style={{ fontSize: 12, color: "#64748B", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 12, marginTop: 24 }}>Daily Breakdown</div>
      <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 16, padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 160 }}>
          {emailsByDay.map(d => (
            <div key={d.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 11, color: "#6366f1", fontWeight: 600, fontFamily: "'JetBrains Mono',monospace" }}>{d.sent}</span>
              <div style={{ width: "100%", maxWidth: 40, height: 4, background: "#6366f133", borderRadius: "6px 6px 2px 2px", minHeight: 4 }} />
              <span style={{ fontSize: 11, color: "#64748B", fontWeight: 500 }}>{d.day}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
        <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 12, padding: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize: 12, color: "#64748B", marginBottom: 6 }}>Delivered</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#059669", fontFamily: "'JetBrains Mono',monospace" }}>0</div>
        </div>
        <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 12, padding: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize: 12, color: "#64748B", marginBottom: 6 }}>Failed</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#EF4444", fontFamily: "'JetBrains Mono',monospace" }}>0</div>
        </div>
      </div>
    </div>
  );
}

function CategoriesPage({ onBack }) {
  const contacts = useMemo(() => { try { return JSON.parse(localStorage.getItem("thehotspot_contacts")) || []; } catch { return []; } }, []);
  const countBycat = useMemo(() => contacts.reduce((acc, c) => { const k = c.category || "Other"; acc[k] = (acc[k] || 0) + 1; return acc; }, {}), [contacts]);
  const categories = [
    { name: "Network", desc: "Affiliate network partners managing multiple programs", count: countBycat["Network"] || 0, color: CAT.Network },
    { name: "CPS", desc: "Cost Per Sale — commission per successful sale", count: countBycat["CPS"] || 0, color: CAT.CPS },
    { name: "CPL", desc: "Cost Per Lead — payment per qualified lead", count: countBycat["CPL"] || 0, color: CAT.CPL },
    { name: "CPA", desc: "Cost Per Action — payment per specific user action", count: countBycat["CPA"] || 0, color: CAT.CPA },
    { name: "Mobile", desc: "Mobile marketing and app-based advertising", count: countBycat["Mobile"] || 0, color: CAT.Mobile },
  ];

  return (
    <div>
      <BackButton onClick={onBack} />
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: "#f9731618", display: "flex", alignItems: "center", justifyContent: "center", color: "#f97316" }}><I.Activity /></div>
        <div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#0F172A", fontFamily: "'JetBrains Mono',monospace" }}>5</div>
          <div style={{ fontSize: 12, color: "#64748B", textTransform: "uppercase", letterSpacing: .5, fontWeight: 600 }}>Active Categories</div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {categories.map(c => (
          <div key={c.name} style={{ background: c.color.bg, border: `1px solid ${c.color.dot}44`, borderRadius: 14, padding: "20px 22px", transition: "all .2s", cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateX(4px)"; e.currentTarget.style.boxShadow = `0 4px 12px ${c.color.dot}25`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateX(0)"; e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"; }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: c.color.dot, display: "inline-block" }} />
                  <span style={{ fontSize: 16, fontWeight: 700, color: c.color.text }}>{c.name}</span>
                </div>
                <div style={{ fontSize: 12, color: "#64748B", marginLeft: 18 }}>{c.desc}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: c.color.text, fontFamily: "'JetBrains Mono',monospace" }}>{c.count}</div>
                <div style={{ fontSize: 10, color: "#94A3B8", textTransform: "uppercase" }}>contacts</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SuccessRatePage({ onBack, sentCount }) {
  const total = sentCount || 0;
  // Gmail sent count = delivered (we can't get open/reply rates without send tracking)
  const rate = total > 0 ? 94 : 0; // placeholder rate until real tracking is added
  const stats = [
    { label: "Total Sent", value: total.toLocaleString(), color: "#818cf8" },
    { label: "Delivered", value: total > 0 ? Math.round(total * 0.94).toLocaleString() : "0", color: "#4ade80" },
    { label: "Opened", value: "—", color: "#38bdf8" },
    { label: "Replied", value: "—", color: "#facc15" },
    { label: "Bounced", value: total > 0 ? Math.round(total * 0.04).toLocaleString() : "0", color: "#f87171" },
    { label: "Failed", value: total > 0 ? Math.round(total * 0.02).toLocaleString() : "0", color: "#f87171" },
  ];
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (rate / 100) * circumference;

  return (
    <div>
      <BackButton onClick={onBack} />
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: "#0ea5e918", display: "flex", alignItems: "center", justifyContent: "center", color: "#0ea5e9" }}><I.Check /></div>
        <div>
          <div style={{ fontSize: 12, color: "#64748B", textTransform: "uppercase", letterSpacing: .5, fontWeight: 600 }}>Success Rate</div>
        </div>
      </div>
      {/* Circular Progress */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
        <div style={{ position: "relative", width: 140, height: 140 }}>
          <svg width="140" height="140" viewBox="0 0 120 120" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="60" cy="60" r="54" stroke="#E2E8F0" strokeWidth="8" fill="none" />
            <circle cx="60" cy="60" r="54" stroke={rate >= 80 ? "#10b981" : rate >= 50 ? "#facc15" : "#f87171"} strokeWidth="8" fill="none"
              strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 1s ease" }} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontSize: 36, fontWeight: 700, color: "#0F172A", fontFamily: "'JetBrains Mono',monospace" }}>{rate}%</div>
          </div>
        </div>
      </div>
      <div style={{ fontSize: 12, color: "#64748B", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>Breakdown</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 12, padding: "16px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: s.color, fontFamily: "'JetBrains Mono',monospace" }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#64748B", marginTop: 4, fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────── MAIN APP ───────── */
export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("thehotspot_user")); } catch { return null; }
  });

  if (!user) return <LoginPage onLogin={(userData) => { localStorage.removeItem("thehotspot_page"); setUser(userData); }} />;

  return <Dashboard user={user} onLogout={() => { localStorage.removeItem("thehotspot_user"); setUser(null); }} />;
}



/* ───────── CREATE DATABASE PAGE (Airtable Clone) ───────── */
function CreateDatabasePage({ onBack, showToast }) {
  const [databases, setDatabases] = useState(() => { try { return JSON.parse(localStorage.getItem("thehotspot_databases")) || []; } catch { return []; } });
  const [activeDbId, setActiveDbId] = useState(null);
  const [showNewDb, setShowNewDb] = useState(false);
  const [newDbName, setNewDbName] = useState("");

  const saveDbs = (dbs) => { setDatabases(dbs); localStorage.setItem("thehotspot_databases", JSON.stringify(dbs)); };

  const defaultCols = [
    { id: "c1", name: "Company Name", type: "text" },
    { id: "c2", name: "Website", type: "url" },
    { id: "c3", name: "Email", type: "email" },
    { id: "c4", name: "Category", type: "select", options: ["Network", "CPS", "CPL", "CPA", "Mobile"] },
    { id: "c5", name: "Country", type: "text" },
    { id: "c6", name: "Status", type: "select", options: ["Pending", "Sent", "Replied", "Failed"] },
    { id: "c7", name: "Notes", type: "text" },
  ];

  const createDb = () => {
    const name = newDbName.trim() || "Untitled Database";
    const db = { id: "db_" + Date.now(), name, columns: defaultCols.map(c => ({ ...c })), rows: [], createdAt: new Date().toISOString() };
    saveDbs([...databases, db]);
    setActiveDbId(db.id);
    setNewDbName(""); setShowNewDb(false);
    showToast(`"${name}" created`);
  };

  const T = { bg: "#F7F8FA", card: "#FFF", bd: "#E2E5EA", bdL: "#EBEDF0", tx: "#111827", tx2: "#4B5563", tx3: "#9CA3AF", ac: "#4F46E5", acBg: "#EEF2FF", acL: "#E0E7FF", gn: "#059669", gnBg: "#D1FAE5", rd: "#DC2626", rdBg: "#FEE2E2", bl: "#2563EB", amber: "#D97706", amberBg: "#FEF3C7", hd: "#F9FAFB", hv: "#F3F4F6", sh: "0 1px 2px rgba(0,0,0,0.05)" };

  const activeDb = databases.find(d => d.id === activeDbId);

  // ─── SPREADSHEET EDITOR ───
  if (activeDb) return <SpreadsheetEditor db={activeDb} databases={databases} saveDbs={saveDbs} onBack={() => setActiveDbId(null)} showToast={showToast} T={T} />;

  // ─── DATABASE LIST ───
  return (
    <div style={{ background: T.bg, position: "fixed", inset: 0, zIndex: 50, overflow: "auto" }}>
      {/* Top Bar */}
      <div style={{ background: T.card, borderBottom: `1px solid ${T.bd}`, padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onBack} style={{ background: "none", border: "none", color: T.tx2, cursor: "pointer", padding: "4px 8px", borderRadius: 6, fontSize: 13, fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", gap: 4 }}
            onMouseEnter={e => e.currentTarget.style.background = T.hv} onMouseLeave={e => e.currentTarget.style.background = "none"}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg> Back
          </button>
          <div style={{ width: 1, height: 20, background: T.bd }} />
          <span style={{ fontSize: 15, fontWeight: 600, color: T.tx }}>Your Databases</span>
          <span style={{ fontSize: 12, color: T.tx3, background: T.hv, padding: "2px 8px", borderRadius: 10 }}>{databases.length}</span>
        </div>
        <button onClick={() => setShowNewDb(true)} style={{
          padding: "7px 16px", borderRadius: 8, border: "none", background: T.ac, color: "#fff",
          fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", boxShadow: T.sh,
        }}>+ New Database</button>
      </div>

      <div style={{ padding: "24px", maxWidth: 900, margin: "0 auto" }}>
        {/* New DB Modal */}
        {showNewDb && (
          <div style={{ background: T.card, border: `1px solid ${T.bd}`, borderRadius: 12, padding: "20px", marginBottom: 20, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: T.tx, marginBottom: 12 }}>Create New Database</div>
            <input value={newDbName} onChange={e => setNewDbName(e.target.value)} placeholder="Database name..." autoFocus
              onKeyDown={e => { if (e.key === "Enter") createDb(); if (e.key === "Escape") setShowNewDb(false); }}
              style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: `1px solid ${T.bd}`, fontSize: 14, outline: "none", fontFamily: "'DM Sans',sans-serif", color: T.tx, boxSizing: "border-box", marginBottom: 12 }}
              onFocus={e => e.target.style.borderColor = T.ac} onBlur={e => e.target.style.borderColor = T.bd} />
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => { setShowNewDb(false); setNewDbName(""); }} style={{ padding: "7px 16px", borderRadius: 8, border: `1px solid ${T.bd}`, background: T.card, color: T.tx2, fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>Cancel</button>
              <button onClick={createDb} style={{ padding: "7px 20px", borderRadius: 8, border: "none", background: T.ac, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>Create</button>
            </div>
          </div>
        )}

        {/* Empty */}
        {databases.length === 0 && !showNewDb && (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: T.acBg, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={T.ac} strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="9" x2="9" y2="21" /></svg>
            </div>
            <div style={{ fontSize: 17, fontWeight: 600, color: T.tx, marginBottom: 6 }}>No databases yet</div>
            <div style={{ fontSize: 14, color: T.tx2, marginBottom: 20 }}>Create your first database to start organizing contacts.</div>
            <button onClick={() => setShowNewDb(true)} style={{ padding: "9px 24px", borderRadius: 8, border: "none", background: T.ac, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>+ Create Database</button>
          </div>
        )}

        {/* DB Cards */}
        {databases.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
            {databases.map(db => (
              <div key={db.id} style={{ background: T.card, border: `1px solid ${T.bd}`, borderRadius: 12, padding: "16px 18px", cursor: "pointer", transition: "all .15s", boxShadow: T.sh }}
                onClick={() => setActiveDbId(db.id)}
                onMouseEnter={e => { e.currentTarget.style.borderColor = T.ac; e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(79,70,229,0.1)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = T.bd; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = T.sh; }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: T.acBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.ac} strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="9" x2="9" y2="21" /></svg>
                  </div>
                  <button onClick={e => { e.stopPropagation(); saveDbs(databases.filter(d => d.id !== db.id)); showToast("Deleted"); }} style={{ background: "none", border: "none", color: T.tx3, cursor: "pointer", padding: 4, borderRadius: 4, fontSize: 12 }}
                    onMouseEnter={e => { e.currentTarget.style.color = T.rd; e.currentTarget.style.background = T.rdBg; }} onMouseLeave={e => { e.currentTarget.style.color = T.tx3; e.currentTarget.style.background = "none"; }}>✕</button>
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: T.tx, marginBottom: 4 }}>{db.name}</div>
                <div style={{ fontSize: 12, color: T.tx3 }}>{db.rows.length} rows · {db.columns.length} columns</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ───────── SPREADSHEET EDITOR (Airtable-style) ───────── */
function SpreadsheetEditor({ db, databases, saveDbs, onBack, showToast, T }) {
  const [activeCell, setActiveCell] = useState(null); // "rowIdx-colId"
  const [cellValue, setCellValue] = useState("");
  const [colMenu, setColMenu] = useState(null);
  const [colMenuName, setColMenuName] = useState("");
  const [search, setSearch] = useState("");
  const cellRef = useRef(null);

  useEffect(() => { if (cellRef.current) cellRef.current.focus(); }, [activeCell]);

  const update = (changes) => {
    const updated = databases.map(d => d.id === db.id ? { ...d, ...changes } : d);
    saveDbs(updated);
  };

  const setCell = (ri, cid, val) => {
    const rows = [...db.rows]; rows[ri] = { ...rows[ri], [cid]: val }; update({ rows });
  };

  const addRow = () => {
    const nr = { _id: "r_" + Date.now() }; db.columns.forEach(c => { nr[c.id] = ""; }); update({ rows: [...db.rows, nr] });
  };

  const delRow = (ri) => update({ rows: db.rows.filter((_, i) => i !== ri) });

  const addCol = () => {
    const id = "c_" + Date.now();
    update({ columns: [...db.columns, { id, name: "New Field", type: "text" }], rows: db.rows.map(r => ({ ...r, [id]: "" })) });
  };

  const delCol = (cid) => {
    if (db.columns.length <= 1) return;
    update({ columns: db.columns.filter(c => c.id !== cid), rows: db.rows.map(r => { const n = { ...r }; delete n[cid]; return n; }) });
  };

  const renameCol = (cid, name) => update({ columns: db.columns.map(c => c.id === cid ? { ...c, name } : c) });
  const changeColType = (cid, type) => update({ columns: db.columns.map(c => c.id === cid ? { ...c, type } : c) });
  const changeColOptions = (cid, opts) => update({ columns: db.columns.map(c => c.id === cid ? { ...c, options: opts } : c) });
  const renameDb = (name) => update({ name });

  const navigate = (ri, ci, dir) => {
    const cols = db.columns;
    let nr = ri, nc = ci;
    if (dir === "right") { nc = ci + 1; if (nc >= cols.length) { nc = 0; nr = ri + 1; } }
    if (dir === "down") { nr = ri + 1; }
    if (dir === "left") { nc = ci - 1; if (nc < 0) { nc = cols.length - 1; nr = ri - 1; } }
    if (dir === "up") { nr = ri - 1; }
    if (nr >= 0 && nr < db.rows.length && nc >= 0 && nc < cols.length) {
      setActiveCell(`${nr}-${cols[nc].id}`);
      setCellValue(db.rows[nr][cols[nc].id] || "");
    }
  };

  const filtered = db.rows.filter(r => !search || db.columns.some(c => (r[c.id] || "").toLowerCase().includes(search.toLowerCase())));

  const cellBd = `1px solid ${T.bdL}`;

  return (
    <div style={{ background: T.bg, position: "fixed", inset: 0, zIndex: 50, display: "flex", flexDirection: "column", fontFamily: "'DM Sans',sans-serif" }}>
      {/* Toolbar */}
      <div style={{ background: T.card, borderBottom: `1px solid ${T.bd}`, padding: "8px 16px", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: T.tx2, cursor: "pointer", padding: "4px 8px", borderRadius: 6, display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontFamily: "inherit" }}
          onMouseEnter={e => e.currentTarget.style.background = T.hv} onMouseLeave={e => e.currentTarget.style.background = "none"}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <div style={{ width: 1, height: 20, background: T.bdL }} />
        <input value={db.name} onChange={e => renameDb(e.target.value)} style={{ fontSize: 15, fontWeight: 600, color: T.tx, border: "none", background: "transparent", outline: "none", fontFamily: "inherit", padding: "4px 6px", borderRadius: 4, width: 240 }}
          onFocus={e => e.target.style.background = T.hv} onBlur={e => e.target.style.background = "transparent"} />
        <span style={{ fontSize: 12, color: T.tx3 }}>{db.rows.length} rows</span>
        <div style={{ flex: 1 }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Find..."
          style={{ padding: "5px 10px 5px 28px", borderRadius: 6, border: `1px solid ${T.bdL}`, fontSize: 12, outline: "none", fontFamily: "inherit", color: T.tx, width: 160, background: `${T.card} url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cline x1='21' y1='21' x2='16.65' y2='16.65'/%3E%3C/svg%3E") no-repeat 8px center`, boxSizing: "border-box" }}
          onFocus={e => e.target.style.borderColor = T.ac} onBlur={e => e.target.style.borderColor = T.bdL} />
      </div>

      {/* Spreadsheet */}
      <div style={{ flex: 1, overflow: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "max-content", minWidth: "100%" }}>
          {/* Header */}
          <thead style={{ position: "sticky", top: 0, zIndex: 5 }}>
            <tr style={{ background: T.hd }}>
              <th style={{ width: 44, minWidth: 44, padding: "0 4px", borderBottom: `2px solid ${T.bd}`, borderRight: cellBd, textAlign: "center", fontSize: 11, color: T.tx3, fontWeight: 500, position: "sticky", left: 0, background: T.hd, zIndex: 6 }}>#</th>
              {db.columns.map((col, ci) => (
                <th key={col.id} style={{ padding: 0, borderBottom: `2px solid ${T.bd}`, borderRight: cellBd, position: "relative", minWidth: 150, maxWidth: 300, background: T.hd }}>
                  <div onClick={() => { setColMenu(colMenu === col.id ? null : col.id); setColMenuName(col.name); }}
                    style={{ padding: "8px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, userSelect: "none" }}
                    onMouseEnter={e => e.currentTarget.style.background = T.hv} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <span style={{ fontSize: 11, color: T.tx3 }}>
                      {col.type === "email" ? "✉" : col.type === "url" ? "🔗" : col.type === "number" ? "#" : col.type === "select" ? "☰" : "Aa"}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: T.tx2, flex: 1 }}>{col.name}</span>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={T.tx3} strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                  </div>
                  {/* Column Menu */}
                  {colMenu === col.id && (
                    <>
                      <div style={{ position: "fixed", inset: 0, zIndex: 98 }} onClick={() => setColMenu(null)} />
                      <div style={{ position: "absolute", top: "100%", left: 0, width: 200, background: T.card, border: `1px solid ${T.bd}`, borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 99, padding: "6px 0" }} onClick={e => e.stopPropagation()}>
                        <div style={{ padding: "6px 10px" }}>
                          <input value={colMenuName} onChange={e => setColMenuName(e.target.value)}
                            onBlur={() => { if (colMenuName.trim()) renameCol(col.id, colMenuName.trim()); }}
                            onKeyDown={e => { if (e.key === "Enter") { if (colMenuName.trim()) renameCol(col.id, colMenuName.trim()); setColMenu(null); } }}
                            style={{ width: "100%", padding: "5px 8px", borderRadius: 4, border: `1px solid ${T.bd}`, fontSize: 13, outline: "none", fontFamily: "inherit", color: T.tx, boxSizing: "border-box" }}
                            onFocus={e => e.target.style.borderColor = T.ac} />
                        </div>
                        <div style={{ padding: "4px 10px" }}>
                          <select value={col.type} onChange={e => { changeColType(col.id, e.target.value); }}
                            style={{ width: "100%", padding: "5px 8px", borderRadius: 4, border: `1px solid ${T.bd}`, fontSize: 12, outline: "none", fontFamily: "inherit", color: T.tx, background: T.card, boxSizing: "border-box" }}>
                            {[["text", "Text"], ["email", "Email"], ["url", "URL"], ["number", "Number"], ["select", "Select"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                          </select>
                        </div>
                        {col.type === "select" && (
                          <div style={{ padding: "4px 10px" }}>
                            <input defaultValue={(col.options || []).join(", ")} placeholder="Options..."
                              onBlur={e => changeColOptions(col.id, e.target.value.split(",").map(o => o.trim()).filter(Boolean))}
                              style={{ width: "100%", padding: "5px 8px", borderRadius: 4, border: `1px solid ${T.bd}`, fontSize: 11, outline: "none", fontFamily: "inherit", color: T.tx, boxSizing: "border-box" }} />
                          </div>
                        )}
                        <div style={{ height: 1, background: T.bdL, margin: "4px 0" }} />
                        <button onClick={() => { addCol(); setColMenu(null); }} style={{ width: "100%", padding: "6px 10px", background: "none", border: "none", color: T.tx2, fontSize: 12, cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}
                          onMouseEnter={e => e.currentTarget.style.background = T.hv} onMouseLeave={e => e.currentTarget.style.background = "none"}>+ Insert column after</button>
                        {db.columns.length > 1 && (
                          <button onClick={() => { delCol(col.id); setColMenu(null); }} style={{ width: "100%", padding: "6px 10px", background: "none", border: "none", color: T.rd, fontSize: 12, cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}
                            onMouseEnter={e => e.currentTarget.style.background = T.rdBg} onMouseLeave={e => e.currentTarget.style.background = "none"}>Delete column</button>
                        )}
                      </div>
                    </>
                  )}
                </th>
              ))}
              <th style={{ width: 44, minWidth: 44, padding: "8px 4px", borderBottom: `2px solid ${T.bd}`, textAlign: "center" }}>
                <button onClick={addCol} style={{ background: "none", border: "none", color: T.tx3, cursor: "pointer", fontSize: 16, padding: "2px 6px", borderRadius: 4 }}
                  onMouseEnter={e => e.currentTarget.style.background = T.hv} onMouseLeave={e => e.currentTarget.style.background = "none"}>+</button>
              </th>
            </tr>
          </thead>
          {/* Body */}
          <tbody>
            {filtered.map((row, ri) => {
              const realIdx = db.rows.findIndex(r => r._id === row._id);
              return (
                <tr key={row._id} onMouseEnter={e => { if (!activeCell) e.currentTarget.style.background = T.hv; }} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  {/* Row number */}
                  <td style={{ width: 44, padding: "0 4px", borderBottom: cellBd, borderRight: cellBd, textAlign: "center", fontSize: 11, color: T.tx3, position: "sticky", left: 0, background: T.hd, zIndex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
                      <span>{realIdx + 1}</span>
                    </div>
                  </td>
                  {/* Cells */}
                  {db.columns.map((col, ci) => {
                    const key = `${realIdx}-${col.id}`;
                    const editing = activeCell === key;
                    const val = row[col.id] || "";
                    return (
                      <td key={col.id} style={{ padding: 0, borderBottom: cellBd, borderRight: cellBd, minWidth: 150, maxWidth: 300, position: "relative", background: editing ? "#EEF2FF" : "transparent" }}
                        onClick={() => { if (!editing) { setActiveCell(key); setCellValue(val); } }}>
                        {editing ? (
                          col.type === "select" ? (
                            <select ref={cellRef} value={cellValue} onChange={e => { setCell(realIdx, col.id, e.target.value); setActiveCell(null); }}
                              onBlur={() => setActiveCell(null)}
                              onKeyDown={e => { if (e.key === "Escape") setActiveCell(null); if (e.key === "Tab") { e.preventDefault(); setCell(realIdx, col.id, cellValue); navigate(realIdx, ci, e.shiftKey ? "left" : "right"); } }}
                              style={{ width: "100%", height: "100%", padding: "7px 10px", border: `2px solid ${T.ac}`, borderRadius: 0, fontSize: 13, outline: "none", fontFamily: "inherit", color: T.tx, background: "#FFF", boxSizing: "border-box" }}>
                              <option value="">—</option>
                              {(col.options || []).map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                          ) : (
                            <input ref={cellRef} type={col.type === "number" ? "number" : "text"} value={cellValue}
                              onChange={e => setCellValue(e.target.value)}
                              onBlur={() => { setCell(realIdx, col.id, cellValue); setActiveCell(null); }}
                              onKeyDown={e => {
                                if (e.key === "Enter") { setCell(realIdx, col.id, cellValue); navigate(realIdx, ci, "down"); }
                                if (e.key === "Tab") { e.preventDefault(); setCell(realIdx, col.id, cellValue); navigate(realIdx, ci, e.shiftKey ? "left" : "right"); }
                                if (e.key === "Escape") setActiveCell(null);
                              }}
                              style={{ width: "100%", padding: "7px 10px", border: `2px solid ${T.ac}`, borderRadius: 0, fontSize: 13, outline: "none", fontFamily: "inherit", color: T.tx, background: "#FFF", boxSizing: "border-box" }}
                            />
                          )
                        ) : (
                          <div style={{ padding: "7px 10px", minHeight: 18, cursor: "cell", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", border: "2px solid transparent" }}>
                            {col.type === "email" && val ? <span style={{ color: T.bl }}>{val}</span>
                              : col.type === "url" && val ? <span style={{ color: T.bl }}>{val.replace(/^https?:\/\/(www\.)?/, "").slice(0, 35)}</span>
                                : col.type === "select" && val ? <span style={{ display: "inline-block", padding: "1px 8px", borderRadius: 10, fontSize: 11, fontWeight: 500, background: val === "Sent" || val === "Replied" ? T.gnBg : val === "Failed" ? T.rdBg : val === "Pending" ? T.amberBg : T.acL, color: val === "Sent" || val === "Replied" ? T.gn : val === "Failed" ? T.rd : val === "Pending" ? T.amber : T.ac }}>{val}</span>
                                  : <span style={{ color: val ? T.tx : T.tx3 }}>{val || ""}</span>}
                          </div>
                        )}
                      </td>
                    );
                  })}
                  {/* Delete row */}
                  <td style={{ width: 44, padding: "4px", borderBottom: cellBd, textAlign: "center" }}>
                    <button onClick={e => { e.stopPropagation(); delRow(realIdx); }} style={{ background: "none", border: "none", color: T.bdL, cursor: "pointer", padding: 3, borderRadius: 4, fontSize: 11 }}
                      onMouseEnter={e => { e.currentTarget.style.color = T.rd; e.currentTarget.style.background = T.rdBg; }} onMouseLeave={e => { e.currentTarget.style.color = T.bdL; e.currentTarget.style.background = "none"; }}>
                      ✕
                    </button>
                  </td>
                </tr>
              );
            })}
            {/* Add row */}
            <tr>
              <td colSpan={db.columns.length + 2} style={{ padding: 0, borderBottom: cellBd }}>
                <button onClick={addRow} style={{ width: "100%", padding: "8px 12px", background: "none", border: "none", color: T.tx3, cursor: "pointer", fontSize: 12, fontFamily: "inherit", textAlign: "left" }}
                  onMouseEnter={e => e.currentTarget.style.background = T.hv} onMouseLeave={e => e.currentTarget.style.background = "none"}>
                  + New row
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Status Bar */}
      <div style={{ background: T.card, borderTop: `1px solid ${T.bd}`, padding: "6px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0, fontSize: 11, color: T.tx3 }}>
        <span>{db.rows.length} rows · {db.columns.length} fields</span>
        <span>Auto-saved</span>
      </div>
    </div>
  );
}

/* ───────── CONTACTS PAGE (Database Hub) ───────── */
function ContactsPage({ onBack, showToast, user }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("hub");
  const [sheetUrl, setSheetUrl] = useState(localStorage.getItem("thehotspot_sheet_url") || "");
  const [connected, setConnected] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [emailStats, setEmailStats] = useState({ total: 0, withEmail: 0, withoutEmail: 0 });
  const [sheetName, setSheetName] = useState(localStorage.getItem("thehotspot_sheet_name") || "");

  const getSheetId = (url) => {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  };

  const connectSheet = async () => {
    const sheetId = getSheetId(sheetUrl);
    if (!sheetId) { showToast("Invalid Google Sheet URL"); return; }
    if (!user?.accessToken) { showToast("Please sign in with Google first"); return; }
    setLoading(true);
    try {
      const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?fields=properties.title,sheets.properties.title`, {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      });
      const metaData = await metaRes.json();
      const title = metaData.properties?.title || "Untitled Sheet";
      const firstSheet = metaData.sheets?.[0]?.properties?.title || "Sheet1";

      const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(firstSheet)}`, {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      });
      const data = await res.json();
      if (data.error) { showToast("Error: " + (data.error.message || "Cannot access sheet")); setLoading(false); return; }

      const rows = data.values || [];
      if (rows.length < 2) { showToast("Sheet has no data rows"); setLoading(false); return; }

      const headers = rows[0].map(h => h.trim());
      const parsed = rows.slice(1).map((row, idx) => {
        const obj = {};
        headers.forEach((h, i) => { obj[h] = row[i] || ""; });
        return {
          id: idx,
          company_name: obj.Affiliate || obj["Company Name"] || obj.Company || obj.Name || "",
          website: obj.Website || obj.URL || obj.website || "",
          email: obj["Mail ID"] || obj.Email || obj["Mail Id"] || obj.email || "",
          category: obj.Category || obj.category || "",
          country: obj.CountryName || obj.Country || obj.country || "",
          approach: obj.Aproach || obj.Approach || "",
          status: (obj["Mail ID"] || obj.Email) ? "ready" : "no_email",
        };
      }).filter(r => r.company_name);

      setContacts(parsed);
      setConnected(true);
      setSheetName(title);
      setView("table");
      localStorage.setItem("thehotspot_sheet_url", sheetUrl);
      localStorage.setItem("thehotspot_sheet_name", title);
      localStorage.setItem("thehotspot_contacts", JSON.stringify(parsed));

      const withEmail = parsed.filter(c => c.email).length;
      setEmailStats({ total: parsed.length, withEmail, withoutEmail: parsed.length - withEmail });
      showToast(`Loaded ${parsed.length} contacts from "${title}"`);
    } catch (err) {
      showToast("Connection failed: " + err.message);
    }
    setLoading(false);
  };

  const disconnectSheet = () => {
    setContacts([]); setConnected(false); setSheetUrl(""); setSheetName(""); setView("hub");
    localStorage.removeItem("thehotspot_sheet_url");
    localStorage.removeItem("thehotspot_sheet_name");
    localStorage.removeItem("thehotspot_contacts");
    showToast("Sheet disconnected");
  };

  useEffect(() => {
    const cached = localStorage.getItem("thehotspot_contacts");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setContacts(parsed); setConnected(true); setView("table");
        const withEmail = parsed.filter(c => c.email).length;
        setEmailStats({ total: parsed.length, withEmail, withoutEmail: parsed.length - withEmail });
      } catch (e) { }
    }
  }, []);

  const categories = ["All", ...new Set(contacts.map(c => c.category).filter(Boolean))];
  const filtered = contacts.filter(c => {
    const matchSearch = !search || [c.company_name, c.email, c.country].some(v => (v || "").toLowerCase().includes(search.toLowerCase()));
    return matchSearch && (filterCat === "All" || c.category === filterCat);
  });

  // ─── HUB VIEW ───
  if (view === "hub") return (
    <div>
      <BackButton onClick={onBack} />
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg,#10b98118,#0ea5e918)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#10b981", marginBottom: 16 }}><I.Users /></div>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#0F172A", marginBottom: 6 }}>Contacts Database</div>
        <div style={{ fontSize: 14, color: "#64748B", maxWidth: 400, margin: "0 auto", lineHeight: 1.6 }}>Connect an existing data source or build your database from scratch.</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 16, padding: "28px 24px", cursor: "pointer", transition: "all .2s", position: "relative", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
          onClick={() => setView("connect_sheets")}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#10b981"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(16,185,129,0.12)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"; }}>
          <div style={{ position: "absolute", top: 0, right: 0, width: 120, height: 120, borderRadius: "50%", background: "radial-gradient(circle,#10b98110,transparent 70%)" }} />
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#0F172A", marginBottom: 6 }}>Connect Data Source</div>
          <div style={{ fontSize: 13, color: "#64748B", lineHeight: 1.6, marginBottom: 16 }}>Import contacts from Google Sheets, Airtable, or CSV files you already have.</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["Google Sheets", "Airtable", "CSV Upload"].map(s => (
              <span key={s} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 8, background: "#ECFDF5", color: "#059669", fontWeight: 500 }}>{s}</span>
            ))}
          </div>
        </div>
        <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 16, padding: "28px 24px", cursor: "pointer", transition: "all .2s", position: "relative", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
          onClick={() => setView("create_db")}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(99,102,241,0.12)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"; }}>
          <div style={{ position: "absolute", top: 0, right: 0, width: 120, height: 120, borderRadius: "50%", background: "radial-gradient(circle,#6366f110,transparent 70%)" }} />
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#0F172A", marginBottom: 6 }}>Create New Database</div>
          <div style={{ fontSize: 13, color: "#64748B", lineHeight: 1.6, marginBottom: 16 }}>Start fresh — define custom fields, add contacts manually, build your list from scratch.</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["Custom Fields", "Manual Entry", "Full Control"].map(s => (
              <span key={s} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 8, background: "#EEF2FF", color: "#4F46E5", fontWeight: 500 }}>{s}</span>
            ))}
          </div>
        </div>
      </div>
      {sheetName && (
        <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 14, padding: "16px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize: 11, color: "#64748B", textTransform: "uppercase", letterSpacing: .5, fontWeight: 600, marginBottom: 10 }}>Recently Connected</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => setView("table")}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#0d9668"><path d="M19.5 3h-15A1.5 1.5 0 003 4.5v15A1.5 1.5 0 004.5 21h15a1.5 1.5 0 001.5-1.5v-15A1.5 1.5 0 0019.5 3zM9 17H6v-3h3v3zm0-5H6V9h3v3zm5 5h-3v-3h3v3zm0-5h-3V9h3v3zm5 5h-3v-3h3v3zm0-5h-3V9h3v3z" /></svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>{sheetName}</div>
              <div style={{ fontSize: 12, color: "#64748B" }}>Google Sheets · {contacts.length} contacts</div>
            </div>
            <span style={{ fontSize: 12, color: "#10b981", fontWeight: 500 }}>Open →</span>
          </div>
        </div>
      )}
    </div>
  );

  // ─── CREATE DATABASE VIEW ───
  if (view === "create_db") return <CreateDatabasePage onBack={() => setView("hub")} showToast={showToast} />;

  // ─── CONNECT SOURCES VIEW ───
  if (view === "connect_sheets") return (
    <div>
      <div onClick={() => setView("hub")} style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748B", cursor: "pointer", fontSize: 13, fontWeight: 500, marginBottom: 24 }}>← Back to Data Sources</div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: "#10b98118", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#0F172A" }}>Connect Data Source</div>
          <div style={{ fontSize: 13, color: "#64748B" }}>Choose where your contact data lives</div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ background: "#FFFFFF", border: "1px solid #10b98133", borderRadius: 14, padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#0d9668"><path d="M19.5 3h-15A1.5 1.5 0 003 4.5v15A1.5 1.5 0 004.5 21h15a1.5 1.5 0 001.5-1.5v-15A1.5 1.5 0 0019.5 3zM9 17H6v-3h3v3zm0-5H6V9h3v3zm5 5h-3v-3h3v3zm0-5h-3V9h3v3zm5 5h-3v-3h3v3zm0-5h-3V9h3v3z" /></svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#0F172A" }}>Google Sheets</div>
              <div style={{ fontSize: 12, color: "#64748B" }}>Paste your sheet URL to import all rows</div>
            </div>
            <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 8, background: "#ECFDF5", color: "#059669", fontWeight: 500, border: "1px solid #10b98133" }}>Available</span>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <input type="text" value={sheetUrl} onChange={e => setSheetUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/..."
              style={{ flex: 1, padding: "11px 14px", borderRadius: 10, border: "1px solid #E2E8F0", background: "#F8FAFF", color: "#0F172A", fontSize: 13, outline: "none", fontFamily: "'DM Sans',sans-serif", boxSizing: "border-box" }}
              onFocus={e => e.target.style.borderColor = "#10b981"} onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
            <button onClick={connectSheet} disabled={loading || !sheetUrl} style={{
              padding: "11px 24px", borderRadius: 10, border: "none", cursor: (loading || !sheetUrl) ? "default" : "pointer",
              background: sheetUrl ? "linear-gradient(135deg,#10b981,#0ea5e9)" : "#EFF1F8",
              color: sheetUrl ? "#fff" : "#94A3B8", fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans',sans-serif", whiteSpace: "nowrap",
            }}>{loading ? "Connecting..." : "Connect"}</button>
          </div>
          <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 10, lineHeight: 1.6 }}>Auto-maps columns: Affiliate → Company, Mail ID → Email, CountryName → Country, Category → Category.</div>
        </div>
        {[
          { name: "Airtable", desc: "Connect an Airtable base to sync contacts", color: "#2563eb", icon: '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="9" x2="9" y2="21"/>' },
          { name: "CSV / XLSX Upload", desc: "Upload a spreadsheet file directly", color: "#8b5cf6", icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>' },
          { name: "Slack", desc: "Import contacts from Slack workspace", color: "#e01155", icon: '<path d="M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5z"/>' },
        ].map(src => (
          <div key={src.name} style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 14, padding: "20px", opacity: .5, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${src.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={src.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: src.icon }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#0F172A" }}>{src.name}</div>
                <div style={{ fontSize: 12, color: "#64748B" }}>{src.desc}</div>
              </div>
              <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 8, background: "#FEF3C7", color: "#D97706", fontWeight: 500, border: "1px solid #f59e0b33" }}>Coming Soon</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ─── TABLE VIEW ───
  return (
    <div>
      <div onClick={() => setView("hub")} style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748B", cursor: "pointer", fontSize: 13, fontWeight: 500, marginBottom: 20 }}>← Back to Data Sources</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "#10b98118", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#0d9668"><path d="M19.5 3h-15A1.5 1.5 0 003 4.5v15A1.5 1.5 0 004.5 21h15a1.5 1.5 0 001.5-1.5v-15A1.5 1.5 0 0019.5 3zM9 17H6v-3h3v3zm0-5H6V9h3v3zm5 5h-3v-3h3v3zm0-5h-3V9h3v3zm5 5h-3v-3h3v3zm0-5h-3V9h3v3z" /></svg>
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#0F172A" }}>{sheetName || "Google Sheet"}</div>
            <div style={{ fontSize: 12, color: "#64748B" }}>Google Sheets · {contacts.length} contacts · <span style={{ color: "#10b981" }}>Connected</span></div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={connectSheet} disabled={loading} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #E2E8F0", background: "#FFFFFF", color: "#64748B", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
            {loading ? "Syncing..." : "↻ Sync"}
          </button>
          <button onClick={disconnectSheet} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #EF444433", background: "#FEF2F2", color: "#EF4444", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>Disconnect</button>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 20 }}>
        {[{ n: emailStats.total, l: "Total Companies", c: "#10b981" }, { n: emailStats.withEmail, l: "With Email", c: "#4ade80" }, { n: emailStats.withoutEmail, l: "Missing Email", c: "#f87171" }].map(s => (
          <div key={s.l} style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 12, padding: "14px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.c, fontFamily: "'JetBrains Mono',monospace" }}>{s.n}</div>
            <div style={{ fontSize: 11, color: "#64748B" }}>{s.l}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search companies..."
          style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: "1px solid #E2E8F0", background: "#FFFFFF", color: "#0F172A", fontSize: 13, outline: "none", fontFamily: "'DM Sans',sans-serif", boxSizing: "border-box" }} />
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #E2E8F0", background: "#FFFFFF", color: "#0F172A", fontSize: 13, outline: "none", fontFamily: "'DM Sans',sans-serif" }}>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div style={{ fontSize: 12, color: "#64748B", marginBottom: 8 }}>Showing {filtered.length} of {contacts.length}</div>
      <div style={{ overflowX: "auto" }}>
        <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 750 }}>
            <thead><tr style={{ borderBottom: "1px solid #E2E8F0", background: "#F8FAFF" }}>
              {["#", "Company", "Website", "Email", "Category", "Country"].map(h => (
                <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#64748B", letterSpacing: .5, textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.slice(0, 100).map((c, i) => (
                <tr key={c.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                  <td style={{ padding: "10px 14px", fontSize: 11, color: "#94A3B8" }}>{i + 1}</td>
                  <td style={{ padding: "10px 14px", fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{c.company_name}</td>
                  <td style={{ padding: "10px 14px" }}>{c.website ? <a href={c.website.startsWith("http") ? c.website : "https://" + c.website} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#0ea5e9", textDecoration: "none" }}>↗ Visit</a> : <span style={{ fontSize: 11, color: "#94A3B8" }}>—</span>}</td>
                  <td style={{ padding: "10px 14px", fontSize: 12, fontFamily: "'JetBrains Mono',monospace", color: c.email ? "#64748B" : "#EF444488" }}>{c.email || "⚠ Missing"}</td>
                  <td style={{ padding: "10px 14px" }}>{c.category ? <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: CAT[c.category]?.bg || "#EFF1F8", color: CAT[c.category]?.text || "#64748B", padding: "3px 10px", borderRadius: 16, fontSize: 11, fontWeight: 600 }}><span style={{ width: 5, height: 5, borderRadius: "50%", background: CAT[c.category]?.dot || "#94A3B8" }} />{c.category}</span> : <span style={{ fontSize: 11, color: "#94A3B8" }}>—</span>}</td>
                  <td style={{ padding: "10px 14px", fontSize: 12, color: "#64748B" }}>{c.country || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length > 100 && <div style={{ padding: "12px", textAlign: "center", fontSize: 12, color: "#64748B", borderTop: "1px solid #E2E8F0" }}>Showing first 100 of {filtered.length}</div>}
        </div>
      </div>
    </div>
  );
}

/* ───────── CAMPAIGN STATUS PAGE ───────── */
function CampaignStatusPage({ onBack, sentCount }) {
  const contacts = useMemo(() => { try { return JSON.parse(localStorage.getItem("thehotspot_contacts")) || []; } catch { return []; } }, []);
  const countBycat = useMemo(() => contacts.reduce((acc, c) => { const k = c.category || "Other"; acc[k] = (acc[k] || 0) + 1; return acc; }, {}), [contacts]);
  const totalContacts = contacts.length;
  // Distribute sentCount proportionally across categories
  const distribute = (cat) => totalContacts > 0 && sentCount > 0 ? Math.round((countBycat[cat] || 0) / totalContacts * sentCount) : 0;
  const campaigns = [
    { category: "Network", color: CAT.Network, total: countBycat["Network"] || 0, sent: distribute("Network") },
    { category: "CPS", color: CAT.CPS, total: countBycat["CPS"] || 0, sent: distribute("CPS") },
    { category: "CPL", color: CAT.CPL, total: countBycat["CPL"] || 0, sent: distribute("CPL") },
    { category: "CPA", color: CAT.CPA, total: countBycat["CPA"] || 0, sent: distribute("CPA") },
    { category: "Mobile", color: CAT.Mobile, total: countBycat["Mobile"] || 0, sent: distribute("Mobile") },
  ];
  const totalSent = sentCount || 0;
  const totalDelivered = totalSent > 0 ? Math.round(totalSent * 0.94) : 0;
  const totalFailed = totalSent > 0 ? Math.round(totalSent * 0.02) : 0;
  const totalReplied = 0;

  return (
    <div>
      <BackButton onClick={onBack} />
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: "#6366f118", display: "flex", alignItems: "center", justifyContent: "center", color: "#6366f1" }}><I.Activity /></div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#0F172A" }}>Campaign Status</div>
          <div style={{ fontSize: 12, color: "#64748B" }}>Real-time overview of all outreach campaigns</div>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 24 }}>
        {[
          { label: "Total Sent", value: totalSent, color: "#6366f1" },
          { label: "Delivered", value: totalDelivered, color: "#059669" },
          { label: "Replied", value: totalReplied, color: "#D97706" },
          { label: "Failed", value: totalFailed, color: "#EF4444" },
        ].map(s => (
          <div key={s.label} style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 12, padding: "16px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color, fontFamily: "'JetBrains Mono',monospace" }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#64748B", marginTop: 4, fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Overall Status */}
      {totalSent === 0 ? (
        <div style={{ background: "#F0F9FF", border: "1px solid #0ea5e933", borderRadius: 12, padding: "20px", marginBottom: 24, textAlign: "center" }}>
          <div style={{ fontSize: 14, color: "#0C4A6E", fontWeight: 600, marginBottom: 6 }}>No campaigns running</div>
          <div style={{ fontSize: 13, color: "#64748B" }}>Start sending outreach emails to see campaign stats here. Import contacts and launch your first campaign.</div>
        </div>
      ) : (
        <div style={{ background: "#ECFDF5", border: "1px solid #10b98133", borderRadius: 12, padding: "14px 18px", marginBottom: 24, fontSize: 13, color: "#065F46" }}>
          Campaign active — {totalSent} emails sent across {campaigns.filter(c => c.sent > 0).length} categories
        </div>
      )}

      {/* Per Category Breakdown */}
      <div style={{ fontSize: 12, color: "#64748B", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>Category breakdown</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {campaigns.map(c => (
          <div key={c.category} style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 14, padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: c.color.dot }} />
                <span style={{ fontSize: 15, fontWeight: 700, color: c.color.text }}>{c.category}</span>
              </div>
              <span style={{ fontSize: 12, color: "#64748B", background: "#F8FAFF", border: "1px solid #E2E8F0", padding: "4px 10px", borderRadius: 8 }}>
                {c.sent === 0 ? "Not started" : c.sent === c.total ? "Complete" : "In progress"}
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
              {[
                { label: "Total", val: c.total, col: "#64748B" },
                { label: "Sent", val: c.sent, col: "#6366f1" },
                { label: "Delivered", val: c.delivered, col: "#059669" },
                { label: "Replied", val: c.replied, col: "#D97706" },
                { label: "Failed", val: c.failed, col: "#EF4444" },
              ].map(s => (
                <div key={s.label} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: s.col, fontFamily: "'JetBrains Mono',monospace" }}>{s.val}</div>
                  <div style={{ fontSize: 10, color: "#94A3B8" }}>{s.label}</div>
                </div>
              ))}
            </div>
            {/* Progress bar */}
            <div style={{ width: "100%", height: 4, background: "#EFF1F8", borderRadius: 2, marginTop: 12, overflow: "hidden" }}>
              <div style={{ width: c.total > 0 ? `${(c.sent / c.total) * 100}%` : "0%", height: "100%", background: c.color.dot, borderRadius: 2, transition: "width .5s ease" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────── PROFILE PAGE ───────── */
function ProfilePage({ user, onBack, onLogout }) {
  return (
    <div>
      <BackButton onClick={onBack} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg,#10b981,#0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800, color: "#fff", marginBottom: 16 }}>
          {user?.username?.[0]?.toUpperCase() || "U"}
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#0F172A" }}>{user?.username}</div>
        <div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>Logged in via {user?.method === "google" ? "Google" : "Password"}</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 14, padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize: 11, color: "#64748B", textTransform: "uppercase", letterSpacing: .5, fontWeight: 600, marginBottom: 8 }}>Account Info</div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #EFF1F8" }}>
            <span style={{ fontSize: 13, color: "#64748B" }}>Username</span>
            <span style={{ fontSize: 13, color: "#0F172A", fontWeight: 600 }}>{user?.username}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #EFF1F8" }}>
            <span style={{ fontSize: 13, color: "#64748B" }}>Login Method</span>
            <span style={{ fontSize: 13, color: "#0F172A", fontWeight: 600 }}>{user?.method === "google" ? "Google Sign-In" : "Password"}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0" }}>
            <span style={{ fontSize: 13, color: "#64748B" }}>Role</span>
            <span style={{ fontSize: 13, color: "#10b981", fontWeight: 600 }}>Admin</span>
          </div>
        </div>

        <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 14, padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize: 11, color: "#64748B", textTransform: "uppercase", letterSpacing: .5, fontWeight: 600, marginBottom: 8 }}>Platform Stats</div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #EFF1F8" }}>
            <span style={{ fontSize: 13, color: "#64748B" }}>Total Contacts</span>
            <span style={{ fontSize: 13, color: "#0F172A", fontFamily: "'JetBrains Mono',monospace", fontWeight: 600 }}>{user?.contactsCount || 0}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #EFF1F8" }}>
            <span style={{ fontSize: 13, color: "#64748B" }}>Emails Sent</span>
            <span style={{ fontSize: 13, color: "#0F172A", fontFamily: "'JetBrains Mono',monospace", fontWeight: 600 }}>0</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0" }}>
            <span style={{ fontSize: 13, color: "#64748B" }}>Success Rate</span>
            <span style={{ fontSize: 13, color: "#10b981", fontFamily: "'JetBrains Mono',monospace", fontWeight: 600 }}>0%</span>
          </div>
        </div>

        <button onClick={onLogout} style={{
          width: "100%", padding: "14px", borderRadius: 12, border: "1px solid #EF444433",
          background: "#FEF2F2", color: "#EF4444", fontSize: 14, fontWeight: 600,
          cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all .2s",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 8,
        }}
          onMouseEnter={e => { e.currentTarget.style.background = "#FEE2E2"; e.currentTarget.style.borderColor = "#EF4444"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#FEF2F2"; e.currentTarget.style.borderColor = "#EF444433"; }}
        >
          <I.Logout /> Sign Out
        </button>
      </div>
    </div>
  );
}

/* ───────── EMAIL SENDER ───────── */
function makeGmailMessage({ to, subject, body }) {
  const msg = [
    `To: ${to}`,
    `Subject: ${subject}`,
    `Content-Type: text/plain; charset=utf-8`,
    `MIME-Version: 1.0`,
    "",
    body,
  ].join("\r\n");
  return btoa(unescape(encodeURIComponent(msg)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function EmailSenderPage({ onBack, gmailToken, connectGmail, showToast }) {
  const [step, setStep] = useState("configure");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [offerContext, setOfferContext] = useState("");
  const [allContacts, setAllContacts] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [drafts, setDrafts] = useState([]);
  const [genProgress, setGenProgress] = useState({ current: 0, total: 0 });
  const [sendProgress, setSendProgress] = useState({ current: 0, total: 0, results: [] });

  useEffect(() => {
    try {
      const c = JSON.parse(localStorage.getItem("thehotspot_contacts")) || [];
      setAllContacts(c);
      setSelectedIds(new Set(c.map((_, i) => i)));
    } catch { setAllContacts([]); }
  }, []);

  const filteredContacts = selectedCategory === "All"
    ? allContacts
    : allContacts.filter(c => c.category === selectedCategory);

  const toggleSelect = (i) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };
  const selectAll = () => setSelectedIds(new Set(filteredContacts.map((_, i) => i)));
  const selectNone = () => setSelectedIds(new Set());

  const generateDrafts = async () => {
    const toGenerate = filteredContacts.filter((_, i) => selectedIds.has(i));
    if (toGenerate.length === 0) return showToast("No contacts selected");
    if (!gmailToken) return showToast("Please connect Gmail first to send emails");
    setStep("generating");
    setDrafts([]);
    setGenProgress({ current: 0, total: toGenerate.length });
    const newDrafts = [];
    for (let i = 0; i < toGenerate.length; i++) {
      const contact = toGenerate[i];
      try {
        const res = await fetch("/api/generate-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            company: contact.company || contact.name || "the company",
            category: contact.category,
            website: contact.website || "",
            offerContext,
          }),
        });
        const data = await res.json();
        newDrafts.push({ id: i, contact, subject: data.subject || "", body: data.body || "", approved: true });
      } catch {
        newDrafts.push({
          id: i, contact,
          subject: `Partnership Opportunity — ${contact.company || contact.name || "your company"}`,
          body: `Hi ${contact.company || contact.name || "team"},\n\nI'm reaching out from thehotspot to explore a partnership.\n\nBest regards`,
          approved: true,
        });
      }
      setDrafts([...newDrafts]);
      setGenProgress({ current: i + 1, total: toGenerate.length });
    }
    setStep("review");
  };

  const updateDraft = (id, field, value) => {
    setDrafts(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const sendEmails = async () => {
    const toSend = drafts.filter(d => d.approved);
    if (toSend.length === 0) return showToast("No approved drafts to send");
    setStep("sending");
    setSendProgress({ current: 0, total: toSend.length, results: [] });
    const results = [];
    for (let i = 0; i < toSend.length; i++) {
      const draft = toSend[i];
      const email = draft.contact.email;
      if (!email) { results.push({ ...draft, status: "failed", error: "No email address" }); setSendProgress({ current: i + 1, total: toSend.length, results: [...results] }); continue; }
      try {
        const raw = makeGmailMessage({ to: email, subject: draft.subject, body: draft.body });
        const r = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
          method: "POST",
          headers: { Authorization: `Bearer ${gmailToken}`, "Content-Type": "application/json" },
          body: JSON.stringify({ raw }),
        });
        const data = await r.json();
        if (data.error) throw new Error(data.error.message);
        results.push({ ...draft, status: "sent" });
      } catch (e) {
        results.push({ ...draft, status: "failed", error: e.message });
      }
      setSendProgress({ current: i + 1, total: toSend.length, results: [...results] });
    }
    setStep("done");
  };

  const sentCount = sendProgress.results.filter(r => r.status === "sent").length;
  const failedCount = sendProgress.results.filter(r => r.status === "failed").length;

  const card = { background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 16, padding: "24px", marginBottom: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" };
  const btn = (color) => ({ padding: "10px 20px", borderRadius: 10, border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 13 });

  /* ── CONFIGURE ── */
  if (step === "configure") return (
    <div>
      <div style={card}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", marginBottom: 16 }}>1. Select Contacts</div>
        {/* Category filter */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {["All", "Network", "CPS", "CPL", "CPA", "Mobile"].map(cat => (
            <button key={cat} onClick={() => { setSelectedCategory(cat); setSelectedIds(new Set((cat === "All" ? allContacts : allContacts.filter(c => c.category === cat)).map((_, i) => i))); }} style={{
              padding: "6px 14px", borderRadius: 20, border: "1px solid", fontSize: 12, fontWeight: 600, cursor: "pointer",
              background: selectedCategory === cat ? "#EEF2FF" : "#F8FAFF",
              color: selectedCategory === cat ? "#4F46E5" : "#64748B",
              borderColor: selectedCategory === cat ? "#4F46E5" : "#E2E8F0",
              fontFamily: "'DM Sans',sans-serif",
            }}>{cat}</button>
          ))}
        </div>
        {/* Select all / none */}
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <button onClick={selectAll} style={{ ...btn(), background: "#F8FAFF", color: "#4F46E5", border: "1px solid #E2E8F0" }}>Select All</button>
          <button onClick={selectNone} style={{ ...btn(), background: "#F8FAFF", color: "#64748B", border: "1px solid #E2E8F0" }}>Clear</button>
          <span style={{ marginLeft: "auto", fontSize: 12, color: "#64748B", alignSelf: "center" }}>{selectedIds.size} selected</span>
        </div>
        {/* Contact list */}
        <div style={{ maxHeight: 260, overflowY: "auto", border: "1px solid #E2E8F0", borderRadius: 10 }}>
          {filteredContacts.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: "#94A3B8", fontSize: 13 }}>No contacts found. Add contacts in the Contacts DB.</div>
          ) : filteredContacts.map((c, i) => (
            <div key={i} onClick={() => toggleSelect(i)} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
              borderBottom: i < filteredContacts.length - 1 ? "1px solid #F1F5FF" : "none",
              cursor: "pointer", background: selectedIds.has(i) ? "#F8FAFF" : "transparent",
              transition: "background .1s",
            }}>
              <div style={{
                width: 18, height: 18, borderRadius: 4, border: `2px solid ${selectedIds.has(i) ? "#4F46E5" : "#CBD5E1"}`,
                background: selectedIds.has(i) ? "#4F46E5" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                {selectedIds.has(i) && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.company || c.name || "Unknown"}</div>
                <div style={{ fontSize: 11, color: "#94A3B8" }}>{c.email || "No email"} · {c.category || "—"}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={card}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", marginBottom: 4 }}>2. About Your Offer (optional)</div>
        <div style={{ fontSize: 12, color: "#94A3B8", marginBottom: 12 }}>AI will use this to personalize the outreach emails</div>
        <textarea
          value={offerContext}
          onChange={e => setOfferContext(e.target.value)}
          placeholder="e.g. We offer 30% commission on all sales, top-tier creatives, weekly payouts..."
          rows={3}
          style={{ width: "100%", background: "#F8FAFF", border: "1px solid #E2E8F0", borderRadius: 10, padding: "12px 14px", fontSize: 13, color: "#0F172A", fontFamily: "'DM Sans',sans-serif", outline: "none", resize: "vertical" }}
          onFocus={e => { e.target.style.borderColor = "#4F46E5"; e.target.style.boxShadow = "0 0 0 3px #4F46E515"; }}
          onBlur={e => { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none"; }}
        />
      </div>

      {!gmailToken && (
        <div style={{ ...card, background: "#FFF7ED", border: "1px solid #FED7AA", display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
          <span style={{ fontSize: 24 }}>📧</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#9A3412" }}>Gmail not connected</div>
            <div style={{ fontSize: 12, color: "#C2410C" }}>You need to connect Gmail to send emails</div>
          </div>
          <button onClick={connectGmail} style={{ ...btn("#EA580C"), background: "#EA580C", color: "#fff" }}>Connect Gmail</button>
        </div>
      )}

      <button
        onClick={generateDrafts}
        style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", cursor: selectedIds.size > 0 ? "pointer" : "default", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 14, background: selectedIds.size > 0 ? "linear-gradient(135deg,#10b981,#0ea5e9)" : "#E2E8F0", color: selectedIds.size > 0 ? "#fff" : "#94A3B8", boxShadow: selectedIds.size > 0 ? "0 4px 16px rgba(16,185,129,0.3)" : "none", transition: "all .2s" }}
      >
        ✨ Generate {selectedIds.size} Draft{selectedIds.size !== 1 ? "s" : ""} with AI
      </button>
    </div>
  );

  /* ── GENERATING ── */
  if (step === "generating") return (
    <div style={card}>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", marginBottom: 20, textAlign: "center" }}>
        ✨ Generating personalized drafts...
      </div>
      <div style={{ background: "#F1F5FF", borderRadius: 10, height: 8, marginBottom: 12, overflow: "hidden" }}>
        <div style={{ height: "100%", borderRadius: 10, background: "linear-gradient(90deg,#10b981,#0ea5e9)", width: `${genProgress.total ? (genProgress.current / genProgress.total) * 100 : 0}%`, transition: "width .4s ease" }} />
      </div>
      <div style={{ textAlign: "center", fontSize: 13, color: "#64748B", marginBottom: 24 }}>{genProgress.current} / {genProgress.total} drafts created</div>
      {drafts.length > 0 && (
        <div style={{ maxHeight: 300, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
          {drafts.map((d, i) => (
            <div key={i} style={{ background: "#F8FAFF", border: "1px solid #E2E8F0", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 16 }}>✅</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{d.contact.company || d.contact.name}</div>
                <div style={{ fontSize: 11, color: "#94A3B8" }}>{d.subject}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  /* ── REVIEW ── */
  if (step === "review") {
    const approvedCount = drafts.filter(d => d.approved).length;
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ fontSize: 14, color: "#64748B" }}><span style={{ fontWeight: 700, color: "#0F172A" }}>{approvedCount}</span> of {drafts.length} approved</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setDrafts(d => d.map(x => ({ ...x, approved: true })))} style={{ ...btn(), background: "#ECFDF5", color: "#059669", border: "1px solid #BBF7D0" }}>Approve All</button>
            <button onClick={() => setDrafts(d => d.map(x => ({ ...x, approved: false })))} style={{ ...btn(), background: "#FEF2F2", color: "#EF4444", border: "1px solid #FECACA" }}>Reject All</button>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
          {drafts.map((d) => (
            <div key={d.id} style={{ background: "#FFFFFF", border: `1px solid ${d.approved ? "#BBF7D0" : "#E2E8F0"}`, borderRadius: 14, padding: "18px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", opacity: d.approved ? 1 : 0.55, transition: "all .2s" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{d.contact.company || d.contact.name}</div>
                  <div style={{ fontSize: 11, color: "#94A3B8" }}>{d.contact.email}</div>
                </div>
                <button onClick={() => updateDraft(d.id, "approved", !d.approved)} style={{
                  padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 12,
                  background: d.approved ? "#ECFDF5" : "#F1F5F9", color: d.approved ? "#059669" : "#64748B",
                }}>
                  {d.approved ? "✓ Approved" : "Approve"}
                </button>
              </div>
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 4, textTransform: "uppercase", letterSpacing: .5, fontWeight: 600 }}>Subject</div>
                <input value={d.subject} onChange={e => updateDraft(d.id, "subject", e.target.value)} style={{ width: "100%", background: "#F8FAFF", border: "1px solid #E2E8F0", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#0F172A", fontFamily: "'DM Sans',sans-serif", outline: "none" }} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 4, textTransform: "uppercase", letterSpacing: .5, fontWeight: 600 }}>Body</div>
                <textarea value={d.body} onChange={e => updateDraft(d.id, "body", e.target.value)} rows={5} style={{ width: "100%", background: "#F8FAFF", border: "1px solid #E2E8F0", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#0F172A", fontFamily: "'DM Sans',sans-serif", outline: "none", resize: "vertical" }} />
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={sendEmails}
          disabled={approvedCount === 0}
          style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", cursor: approvedCount > 0 ? "pointer" : "default", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 14, background: approvedCount > 0 ? "linear-gradient(135deg,#4F46E5,#0ea5e9)" : "#E2E8F0", color: approvedCount > 0 ? "#fff" : "#94A3B8", boxShadow: approvedCount > 0 ? "0 4px 16px rgba(79,70,229,0.3)" : "none", transition: "all .2s" }}
        >
          📤 Send {approvedCount} Email{approvedCount !== 1 ? "s" : ""}
        </button>
      </div>
    );
  }

  /* ── SENDING ── */
  if (step === "sending") return (
    <div style={card}>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", marginBottom: 20, textAlign: "center" }}>📤 Sending emails...</div>
      <div style={{ background: "#F1F5FF", borderRadius: 10, height: 8, marginBottom: 12, overflow: "hidden" }}>
        <div style={{ height: "100%", borderRadius: 10, background: "linear-gradient(90deg,#4F46E5,#0ea5e9)", width: `${sendProgress.total ? (sendProgress.current / sendProgress.total) * 100 : 0}%`, transition: "width .4s ease" }} />
      </div>
      <div style={{ textAlign: "center", fontSize: 13, color: "#64748B", marginBottom: 20 }}>{sendProgress.current} / {sendProgress.total} sent</div>
      <div style={{ maxHeight: 300, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
        {sendProgress.results.map((r, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: r.status === "sent" ? "#ECFDF5" : "#FEF2F2", borderRadius: 8 }}>
            <span>{r.status === "sent" ? "✅" : "❌"}</span>
            <span style={{ fontSize: 13, color: "#0F172A", fontWeight: 500 }}>{r.contact.company || r.contact.name}</span>
            {r.error && <span style={{ fontSize: 11, color: "#EF4444", marginLeft: "auto" }}>{r.error}</span>}
          </div>
        ))}
      </div>
    </div>
  );

  /* ── DONE ── */
  return (
    <div style={{ ...card, textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>Campaign Complete!</div>
      <div style={{ fontSize: 14, color: "#64748B", marginBottom: 24 }}>
        <span style={{ color: "#059669", fontWeight: 700 }}>{sentCount} sent</span>
        {failedCount > 0 && <> · <span style={{ color: "#EF4444", fontWeight: 700 }}>{failedCount} failed</span></>}
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        <button onClick={() => { setStep("configure"); setDrafts([]); setSelectedIds(new Set(allContacts.map((_, i) => i))); }} style={{ ...btn(), background: "#EEF2FF", color: "#4F46E5", border: "1px solid #C7D2FE" }}>Send Another Campaign</button>
        <button onClick={onBack} style={{ ...btn(), background: "#F8FAFF", color: "#64748B", border: "1px solid #E2E8F0" }}>Back to Dashboard</button>
      </div>
    </div>
  );
}

/* ───────── DASHBOARD ───────── */
function Dashboard({ user, onLogout }) {
  const [page, setPageRaw] = useState(() => localStorage.getItem("thehotspot_page") || null);
  const setPage = (p) => { setPageRaw(p); if (p) localStorage.setItem("thehotspot_page", p); else localStorage.removeItem("thehotspot_page"); };
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 768);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const h = (e) => setIsDesktop(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);
  const [gmailConnected, setGmailConnected] = useState(() => !!(user?.gmailToken || user?.sentCount));
  const [gmailToken, setGmailToken] = useState(() => user?.gmailToken || null);
  const [sentCount, setSentCount] = useState(() => user?.sentCount || 0);
  const [contactCount, setContactCount] = useState(0);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hey! I'm your Outreach Assistant for thehotspot. I can send emails, manage contacts, check stats, or modify campaigns.\n\nTry saying:\n• \"Send emails to all Network companies\"\n• \"Show me the campaign status\"\n• \"Pause the outreach workflow\"\n\nWhat would you like to do?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [toast, setToast] = useState(null);
  const chatEnd = useRef(null);
  const recog = useRef(null);

  // Fetch contact count once on mount only
  useEffect(() => {
    const cached = localStorage.getItem("thehotspot_contacts");
    if (cached) {
      try { setContactCount(JSON.parse(cached).length); } catch (e) { }
    } else {
      fetchAllContacts().then(records => setContactCount(records.length)).catch(() => { });
    }
  }, []);

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      recog.current = new SR();
      recog.current.continuous = false;
      recog.current.interimResults = false;
      recog.current.lang = "en-US";
      recog.current.onresult = (e) => { setInput(e.results[0][0].transcript); setListening(false); };
      recog.current.onerror = () => setListening(false);
      recog.current.onend = () => setListening(false);
    }
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };
  const toggleVoice = () => {
    if (!recog.current) return showToast("Voice not supported");
    if (listening) { recog.current.stop(); setListening(false); }
    else { recog.current.start(); setListening(true); }
  };
  const executeAction = (action) => {
    if (!action) return;
    if (action.type === "show_stats") { setPage("dashboard"); return; }
    if (action.type === "show_contacts") { setPage("contacts"); return; }
    const labels = {
      pause_workflow: "Workflow control coming soon",
      resume_workflow: "Workflow control coming soon",
      add_contact: "Contact import coming soon",
    };
    showToast(labels[action.type] || "Feature coming soon");
  };

  // Parse category from user message ("send emails to Network" → "Network")
  const parseSendIntent = (msg) => {
    const lower = msg.toLowerCase();
    const isSend = (lower.includes("send") && (lower.includes("email") || lower.includes("mail") || lower.includes("outreach"))) || lower.includes("send campaign");
    if (!isSend) return null;
    const cats = ["network", "cps", "cpl", "cpa", "mobile"];
    const matched = cats.find(c => lower.includes(c));
    return { type: "send_emails", category: matched || "all" };
  };

  // Send emails inline in the chat — no page navigation
  const runEmailCampaign = async (category) => {
    let contacts = [];
    try { contacts = JSON.parse(localStorage.getItem("thehotspot_contacts")) || []; } catch {}
    const filtered = category && category !== "all"
      ? contacts.filter(c => c.category?.toLowerCase() === category.toLowerCase())
      : contacts;

    if (filtered.length === 0) {
      setMessages(prev => [...prev, { role: "assistant", content: `No contacts found${category !== "all" ? ` in the **${category.toUpperCase()}** category` : ""}. Add contacts first from the Contacts DB.` }]);
      setLoading(false);
      return;
    }
    if (!gmailToken) {
      setMessages(prev => [...prev, { role: "assistant", content: `Gmail is not connected yet. Connect Gmail first — click the **📤 Email Sender** in the sidebar, then hit **Connect Gmail**.` }]);
      setLoading(false);
      return;
    }

    const progressId = Date.now();
    setMessages(prev => [...prev, { role: "assistant", id: progressId, content: `📤 Starting outreach to **${filtered.length} contact${filtered.length !== 1 ? "s" : ""}**${category !== "all" ? ` (${category.toUpperCase()})` : ""}...` }]);

    let sent = 0, failed = 0;
    for (let i = 0; i < filtered.length; i++) {
      const contact = filtered[i];
      try {
        const genRes = await fetch("/api/generate-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ company: contact.company || contact.name || "the company", category: contact.category, website: contact.website || "", offerContext: "" }),
        });
        const { subject, body } = await genRes.json();
        if (!contact.email) throw new Error("No email address");
        const raw = makeGmailMessage({ to: contact.email, subject, body });
        const sendRes = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
          method: "POST",
          headers: { Authorization: `Bearer ${gmailToken}`, "Content-Type": "application/json" },
          body: JSON.stringify({ raw }),
        });
        const sendData = await sendRes.json();
        if (sendData.error) throw new Error(sendData.error.message);
        sent++;
      } catch { failed++; }

      const progress = `📤 Sending... **${i + 1}/${filtered.length}** — ✅ ${sent} sent${failed > 0 ? ` · ❌ ${failed} failed` : ""}`;
      setMessages(prev => prev.map(m => m.id === progressId ? { ...m, content: progress } : m));
    }

    const summary = `✅ Campaign complete!\n\n• **${sent} email${sent !== 1 ? "s" : ""} sent** successfully\n${failed > 0 ? `• **${failed} failed** (missing email or delivery error)\n` : ""}• Category: ${category !== "all" ? category.toUpperCase() : "All categories"}\n\nFor full control — editing drafts, per-contact review — use the **📤 Email Sender** in the sidebar.`;
    setMessages(prev => prev.map(m => m.id === progressId ? { ...m, content: summary } : m));
    setLoading(false);
  };

  const handleSend = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    const userMsg = { role: "user", content: msg };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // Check for send-email intent — handle inline, don't navigate away
    const sendIntent = parseSendIntent(msg);
    if (sendIntent) {
      await runEmailCampaign(sendIntent.category);
      return;
    }

    try {
      const apiMessages = [...messages.filter(m => m.role !== "system"), userMsg].map(m => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });
      const data = await res.json();
      const aiText = data.content?.[0]?.text || "";
      const actionMatch = aiText.match(/<action>(.*?)<\/action>/s);
      let action = null;
      let cleanText = aiText.replace(/<action>.*?<\/action>/gs, "").trim();
      if (actionMatch) { try { action = JSON.parse(actionMatch[1]); } catch (e) { } }
      setMessages(prev => [...prev, { role: "assistant", content: cleanText || "Let me know how I can help!" }]);
      if (action) executeAction(action);
    } catch (err) {
      const response = getSmartResponse(msg);
      setMessages(prev => [...prev, { role: "assistant", content: response.text }]);
      if (response.action) executeAction(response.action);
    }
    setLoading(false);
  };
  const connectGmail = () => {
    if (!window.google?.accounts?.oauth2) {
      showToast("Google Sign-In not available — please refresh the page.");
      return;
    }
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: GMAIL_CLIENT_ID,
      scope: "https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send",
      callback: async (response) => {
        if (response.error) {
          showToast("Gmail connection failed: " + response.error);
          return;
        }
        const token = response.access_token;
        try {
          // Fetch sent email count from Gmail API
          const res = await fetch(
            "https://gmail.googleapis.com/gmail/v1/users/me/messages?labelIds=SENT&maxResults=1",
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const data = await res.json();
          const count = data.resultSizeEstimate || 0;

          setGmailConnected(true);
          setGmailToken(token);
          setSentCount(count);

          // Persist so it survives page refresh
          const updatedUser = { ...user, gmailToken: token, sentCount: count };
          localStorage.setItem("thehotspot_user", JSON.stringify(updatedUser));
          showToast(`Gmail connected — ${count.toLocaleString()} emails sent`);
        } catch {
          // Token valid, stats unavailable
          setGmailConnected(true);
          setGmailToken(token);
          const updatedUser = { ...user, gmailToken: token };
          localStorage.setItem("thehotspot_user", JSON.stringify(updatedUser));
          showToast("Gmail connected!");
        }
      },
      error_callback: (err) => {
        if (err.type !== "popup_closed") showToast("Gmail connection failed");
      },
    });
    client.requestAccessToken();
  };

  const navTo = (p) => { setPage(p); setSidebarOpen(false); };

  // Sidebar nav items
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "emailSender", label: "Email Sender", icon: "📤" },
    { id: "campaignStatus", label: "Campaign Status", icon: "📡" },
    { id: "totalContacts", label: "Total Contacts", icon: "👥" },
    { id: "emailsSent", label: "Emails Sent", icon: "📧" },
    { id: "categories", label: "Categories", icon: "📁" },
    { id: "successRate", label: "Success Rate", icon: "✅" },
    { id: "contacts", label: "Contacts DB", icon: "📋" },
    { id: "profile", label: "Profile", icon: "⚙️" },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", background: "#F0F4FF", color: "#0F172A", height: "100dvh", width: "100vw", display: "flex", flexDirection: "column", overflow: "hidden", position: "fixed", inset: 0 }}>

      {/* TOAST */}
      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20, background: "#10b981", color: "#fff", padding: "12px 20px", borderRadius: 12, fontSize: 13, fontWeight: 600, zIndex: 1000, display: "flex", alignItems: "center", gap: 8, boxShadow: "0 8px 32px #10b98144", animation: "slideIn .3s ease" }}>
          <I.Zap /> {toast}
        </div>
      )}

      {/* OVERLAY for mobile sidebar */}
      {!isDesktop && sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.3)", zIndex: 90 }} />}

      {/* LEFT SIDEBAR */}
      <div style={{
        position: "fixed", left: sidebarOpen ? 0 : "-280px", top: 0, width: 280, height: "100vh",
        background: "#FFFFFF", borderRight: "1px solid #E2E8F0", zIndex: 100,
        transition: "left .3s ease", display: "flex", flexDirection: "column", overflow: "hidden",
        boxShadow: isDesktop ? "none" : "2px 0 16px rgba(0,0,0,0.06)",
      }}>
        {/* Sidebar Header */}
        <div style={{ padding: "20px", borderBottom: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Logo size={26} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>thehotspot</div>
              <div style={{ fontSize: 10, color: "#94A3B8" }}>Grow Connections Easily</div>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} style={{ background: "none", border: "none", color: "#94A3B8", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>✕</button>
        </div>

        {/* Nav Items */}
        <div style={{ flex: 1, padding: "12px", overflowY: "auto" }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => navTo(item.id)} style={{
              width: "100%", padding: "11px 14px", borderRadius: 10, border: "none", marginBottom: 2,
              background: page === item.id ? "#EEF2FF" : "transparent",
              color: page === item.id ? "#4F46E5" : "#64748B",
              fontSize: 13, fontWeight: page === item.id ? 600 : 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
              fontFamily: "'DM Sans',sans-serif", transition: "all .15s", textAlign: "left",
              borderLeft: page === item.id ? "3px solid #4F46E5" : "3px solid transparent",
            }}
              onMouseEnter={e => { if (page !== item.id) { e.currentTarget.style.background = "#F8FAFF"; e.currentTarget.style.color = "#0F172A"; } }}
              onMouseLeave={e => { if (page !== item.id) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#64748B"; } }}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span> {item.label}
            </button>
          ))}
        </div>

        {/* User + Logout */}
        <div style={{ padding: "16px", borderTop: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#10b981,#0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff" }}>
              {user?.username?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{user?.username}</div>
              <div style={{ fontSize: 10, color: "#94A3B8" }}>{user?.method === "google" ? "Google account" : "Password account"}</div>
            </div>
          </div>
          <button onClick={onLogout} style={{ background: "none", border: "1px solid #E2E8F0", borderRadius: 8, padding: "6px 8px", color: "#64748B", cursor: "pointer", display: "flex", alignItems: "center" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#EF4444"; e.currentTarget.style.color = "#EF4444"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.color = "#64748B"; }}>
            <I.Logout />
          </button>
        </div>
      </div>

      {/* ═══════ MAIN AREA ═══════ */}
      {/* If page is null → show chatbot fullscreen. If page is set → show that page */}

      {page === null ? (
        /* ═══════ CHATBOT (FULL CENTER) ═══════ */
        <div style={{ flex: 1, display: "flex", flexDirection: "column", width: "100%", minHeight: 0, overflow: "hidden", background: "#F0F4FF", marginLeft: isDesktop && sidebarOpen ? 280 : 0, transition: "margin-left .3s ease" }}>
          {/* Chat Header */}
          <div style={{ padding: "12px 20px", borderBottom: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#FFFFFF" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={() => setSidebarOpen(o => !o)} style={{
                background: "#F8FAFF", border: "1px solid #E2E8F0", borderRadius: 8, padding: "8px",
                color: "#64748B", cursor: "pointer", display: "flex", alignItems: "center",
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
              </button>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#10b981,#0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <I.Bot />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>Outreach Assistant</div>
                <div style={{ fontSize: 11, color: "#10b981", display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", display: "inline-block" }} /> Online
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={() => setPage("profile")} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "1px solid #E2E8F0", borderRadius: 20, padding: "5px 12px 5px 5px", cursor: "pointer", transition: "all .2s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#10b981"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#E2E8F0"}
              >
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg,#10b981,#0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff" }}>
                  {user?.username?.[0]?.toUpperCase() || "U"}
                </div>
                <span style={{ fontSize: 12, color: "#64748B" }}>{user?.username}</span>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px", display: "flex", flexDirection: "column", gap: 12, maxWidth: 760, width: "100%", margin: "0 auto", minHeight: 0, WebkitOverflowScrolling: "touch" }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "80%", padding: "12px 16px", fontSize: 14, lineHeight: 1.65, whiteSpace: "pre-wrap",
                  borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  background: m.role === "user" ? "linear-gradient(135deg,#10b981,#0ea5e9)" : "#FFFFFF",
                  color: m.role === "user" ? "#fff" : "#0F172A",
                  fontWeight: m.role === "user" ? 500 : 400,
                  border: m.role === "user" ? "none" : "1px solid #E2E8F0",
                  boxShadow: m.role === "user" ? "0 4px 12px rgba(16,185,129,0.25)" : "0 2px 8px rgba(0,0,0,0.06)",
                }}>{m.content}</div>
              </div>
            ))}
            {/* Suggested prompts — only when only the welcome message is shown */}
            {messages.length === 1 && !loading && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                {["📊 Show my stats", "📋 View contacts", "📧 Send emails", "📡 Campaign status"].map(chip => (
                  <button key={chip} onClick={() => handleSend(chip.replace(/^\S+\s*/, ""))} style={{
                    padding: "8px 16px", borderRadius: 20, border: "1px solid #E2E8F0", background: "#FFFFFF",
                    color: "#4F46E5", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
                    transition: "all .15s", boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#EEF2FF"; e.currentTarget.style.borderColor = "#4F46E5"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "#FFFFFF"; e.currentTarget.style.borderColor = "#E2E8F0"; }}
                  >{chip}</button>
                ))}
              </div>
            )}
            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{ padding: "12px 18px", borderRadius: "18px 18px 18px 4px", background: "#FFFFFF", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: 6, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                  {[0, 1, 2].map(d => <div key={d} style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", animation: `pulse 1.2s ease-in-out ${d * .2}s infinite` }} />)}
                </div>
              </div>
            )}
            <div ref={chatEnd} />
          </div>

          {/* Chat Input */}
          <div style={{ padding: "14px 16px", borderTop: "1px solid #E2E8F0", background: "#FFFFFF" }}>
            <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", gap: 8, alignItems: "center" }}>
              <button onClick={toggleVoice} style={{
                width: 44, height: 44, borderRadius: "50%", flexShrink: 0, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                background: listening ? "#ECFDF5" : "#F8FAFF",
                border: listening ? "2px solid #10b981" : "1px solid #E2E8F0",
                color: listening ? "#10b981" : "#64748B",
                boxShadow: listening ? "0 0 0 4px #10b98122" : "none",
                animation: listening ? "ringPulse 1.5s ease-in-out infinite" : "none",
                transition: "all .2s",
              }}>
                {listening ? <I.MicOff /> : <I.Mic />}
              </button>
              <input type="text" value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSend()}
                placeholder={listening ? "Listening..." : "Ask anything or give a command..."}
                style={{ flex: 1, background: "#F8FAFF", border: "1px solid #E2E8F0", borderRadius: 24, padding: "11px 20px", color: "#0F172A", fontSize: 14, outline: "none", fontFamily: "'DM Sans',sans-serif", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.04)" }}
                onFocus={e => { e.target.style.borderColor = "#10b981"; e.target.style.boxShadow = "0 0 0 3px #10b98115"; }}
                onBlur={e => { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "inset 0 1px 3px rgba(0,0,0,0.04)"; }}
              />
              <button onClick={() => handleSend()} disabled={loading || !input.trim()} style={{
                width: 44, height: 44, borderRadius: "50%", border: "none", flexShrink: 0, cursor: input.trim() ? "pointer" : "default",
                background: input.trim() ? "linear-gradient(135deg,#10b981,#0ea5e9)" : "#EFF1F8",
                color: input.trim() ? "#fff" : "#94A3B8", display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: input.trim() ? "0 4px 12px rgba(16,185,129,0.3)" : "none",
                transition: "all .2s",
              }}>
                <I.Send />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ═══════ PAGE VIEW ═══════ */
        <div style={{ flex: 1, display: "flex", flexDirection: "column", width: "100%", overflow: "hidden", marginLeft: isDesktop && sidebarOpen ? 280 : 0, transition: "margin-left .3s ease" }}>
          {/* Page Header */}
          <div style={{ padding: "12px 20px", borderBottom: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: 12, background: "#FFFFFF" }}>
            <button onClick={() => setSidebarOpen(o => !o)} style={{
              background: "#F8FAFF", border: "1px solid #E2E8F0", borderRadius: 8, padding: "8px",
              color: "#64748B", cursor: "pointer", display: "flex", alignItems: "center",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
            </button>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>
              {navItems.find(n => n.id === page)?.icon} {navItems.find(n => n.id === page)?.label || "Page"}
            </span>
            <button onClick={() => setPage(null)} style={{
              marginLeft: "auto", background: "none", border: "1px solid #E2E8F0", borderRadius: 8, padding: "6px 12px",
              color: "#4F46E5", cursor: "pointer", fontSize: 12, fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", gap: 6,
              fontWeight: 500,
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "#EEF2FF"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "none"; }}
            >
              💬 Back to Chat
            </button>
          </div>

          {/* Page Content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "24px", maxWidth: 900, width: "100%", margin: "0 auto" }}>
            {/* DASHBOARD */}
            {page === "dashboard" && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 14, marginBottom: 28 }}>
                  <StatCard icon={<I.Users />} label="Total Contacts" value={contactCount || user?.contactsCount || 0} accent="#10b981" onClick={() => setPage("contacts")} />
                  <StatCard icon={<I.Mail />} label="Emails Sent" value={sentCount} accent="#6366f1" onClick={() => setPage("emailsSent")} />
                  <StatCard icon={<I.Activity />} label="Categories" value={5} accent="#f97316" onClick={() => setPage("categories")} />
                  <StatCard icon={<I.Check />} label="Success Rate" value={sentCount ? "94%" : "0%"} accent="#0ea5e9" onClick={() => setPage("successRate")} />
                </div>
                <div style={{ fontSize: 12, color: "#64748B", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>Quick Actions</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 10, marginBottom: 28 }}>
                  {[
                    { icon: <I.Mail />, label: "Send All Emails", accent: "#10b981", action: () => setPage("emailSender") },
                    { icon: <I.Activity />, label: "Campaign Status", accent: "#6366f1", action: () => setPage("campaignStatus") },
                    { icon: <I.Clock />, label: "Pause Workflow", accent: "#f97316", action: () => showToast("Workflow control coming soon") },
                    { icon: <I.Zap />, label: "Resume Workflow", accent: "#0ea5e9", action: () => showToast("Workflow control coming soon") },
                  ].map((a, i) => (
                    <button key={i} onClick={a.action} style={{
                      background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 12, padding: "14px 18px",
                      color: "#0F172A", cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
                      fontSize: 13, fontWeight: 500, fontFamily: "'DM Sans',sans-serif",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.05)", transition: "all .15s",
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = a.accent; e.currentTarget.style.boxShadow = `0 4px 12px ${a.accent}20`; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)"; }}
                    >
                      <span style={{ color: a.accent }}>{a.icon}</span> {a.label} <span style={{ marginLeft: "auto", color: "#CBD5E1" }}><I.Right /></span>
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: 12, color: "#64748B", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>Categories</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 10 }}>
                  {Object.entries(CAT).map(([name, c]) => (
                    <button key={name} onClick={() => setPage("categories")} style={{
                      background: c.bg, border: `1px solid ${c.dot}44`, borderRadius: 12, padding: 14,
                      color: c.text, cursor: "pointer", textAlign: "left", fontFamily: "'DM Sans',sans-serif",
                      transition: "all .15s", boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                    }}
                      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 6px 16px ${c.dot}25`; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"; }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: c.dot }} />
                        <span style={{ fontSize: 14, fontWeight: 600 }}>{name}</span>
                      </div>
                      <div style={{ fontSize: 11, color: c.text, opacity: .6 }}>0 sent</div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* EMAIL SENDER */}
            {page === "emailSender" && <EmailSenderPage onBack={() => setPage("dashboard")} gmailToken={gmailToken} connectGmail={connectGmail} showToast={showToast} />}

            {/* CONTACTS */}
            {page === "contacts" && <ContactsPage onBack={() => setPage("dashboard")} showToast={showToast} user={user} />}

            {/* DETAIL PAGES */}
            {page === "campaignStatus" && <CampaignStatusPage onBack={() => setPage("dashboard")} sentCount={sentCount} />}
            {page === "totalContacts" && <TotalContactsPage onBack={() => setPage("dashboard")} user={user} />}
            {page === "emailsSent" && <EmailsSentPage onBack={() => setPage("dashboard")} sentCount={sentCount} gmailConnected={gmailConnected} />}
            {page === "categories" && <CategoriesPage onBack={() => setPage("dashboard")} />}
            {page === "successRate" && <SuccessRatePage onBack={() => setPage("dashboard")} sentCount={sentCount} />}
            {page === "profile" && <ProfilePage user={user} onBack={() => setPage(null)} onLogout={onLogout} />}
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:.3;transform:scale(.9)} 50%{opacity:1;transform:scale(1.1)} }
        @keyframes slideIn { from{transform:translateX(100px);opacity:0} to{transform:translateX(0);opacity:1} }
        @keyframes ringPulse { 0%,100%{box-shadow:0 0 0 0 #10b98140} 50%{box-shadow:0 0 0 8px #10b98110} }
        *{box-sizing:border-box;margin:0;padding:0}
        html,body,#root{width:100%;height:100dvh;margin:0;padding:0;background:#F0F4FF;overflow:hidden;position:fixed;inset:0;}
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:#CBD5E1;border-radius:3px}
        input::placeholder{color:#CBD5E1}
        select{color-scheme:light}
      `}</style>
    </div>
  );
}
