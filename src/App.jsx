// v2
import React, { useState, useEffect, useRef, useMemo } from "react";
import Home from "./pages/Home";
import {
  LuLayoutDashboard, LuUsers, LuFilePen, LuClipboardList, LuSettings,
  LuSend, LuRadio, LuMail, LuFolder, LuTrendingUp, LuHouse,
  LuChartBar, LuZap, LuDollarSign, LuGlobe, LuLink, LuCheck, LuX,
  LuTarget, LuTriangleAlert, LuMailbox, LuSparkles, LuPartyPopper,
  LuClock, LuChevronRight, LuSearch, LuFlaskConical, LuDatabase,
  LuMenu, LuInbox, LuCreditCard, LuCircleHelp, LuBookOpen,
  LuMessageCircle, LuStar, LuArchive, LuReply, LuShield,
} from "react-icons/lu";
import { useLoginContent } from "./hooks/useLoginContent.js";

/* ───────── CONFIG ───────── */
const N8N_WEBHOOK_URL = "YOUR_N8N_WEBHOOK_URL_HERE";

// ── Neon PostgreSQL helpers (all DB ops go through /api/db) ──

async function dbUsers(body) {
  const res = await fetch("/api/db", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Database request failed");
  return data;
}

async function dbContacts(body) {
  const res = await fetch("/api/db", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ entity: "contact", ...body }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Database request failed");
  return data;
}

// Legacy-compatible wrappers used throughout the app
async function fetchAllContacts() {
  const res = await fetch("/api/db?entity=contact");
  const data = await res.json();
  return (data.records || []).map(r => ({
    id: r.id,
    fields: { Name: r.name, Email: r.email, Company: r.company, Website: r.website, Category: r.category, Country: r.country, Notes: r.notes },
  }));
}

async function manualContactCreate(fields) {
  try {
    const data = await dbContacts({ action: "create", fields });
    return data.id || null;
  } catch { return null; }
}

async function manualContactUpdate(id, fields) {
  if (!id) return;
  try { await dbContacts({ action: "update", id, fields }); } catch { /* silent */ }
}

async function manualContactDelete(id) {
  if (!id) return;
  try { await dbContacts({ action: "delete", id }); } catch { /* silent */ }
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
// ─── Shared CMS hook — fetches once, cached at module level ───────────────────
let __cmsCache = null;
let __cmsPromise = null;
function useCms() {
  const [cms, setCms] = useState(() => __cmsCache || {});
  useEffect(() => {
    if (__cmsCache) { setCms(__cmsCache); return; }
    if (!__cmsPromise) {
      __cmsPromise = fetch("/api/db?entity=content&key=site").then(r => r.json()).then(d => { __cmsCache = d.data || {}; return __cmsCache; }).catch(() => { __cmsCache = {}; return {}; });
    }
    __cmsPromise.then(c => setCms(c));
  }, []);
  return (key, fallback) => cms[key] || fallback;
}

function useExternalLinkTransition() {
  useEffect(() => {
    const handler = (e) => {
      const a = e.target.closest('a[href]');
      if (!a) return;
      const h = a.getAttribute('href');
      if (!h || h.startsWith('#') || h.startsWith('/') || h.startsWith('mailto:')) return;
      e.preventDefault();
      const o = document.createElement('div');
      o.style.cssText = 'position:fixed;inset:0;z-index:9999;background:var(--bg);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;opacity:0;transition:opacity .3s ease';
      o.innerHTML = '<img src="/logo.png" style="width:72px;height:72px;object-fit:contain;animation:splashFloat 1.4s ease-in-out infinite alternate"/><div style="color:#fff;font-family:DM Sans,sans-serif;font-size:22px;font-weight:700;letter-spacing:0.04em;opacity:.85">thehotspot</div>';
      document.body.appendChild(o);
      requestAnimationFrame(() => { o.style.opacity = '1'; });
      setTimeout(() => { window.open(h, a.getAttribute('target') || '_self'); }, 400);
      setTimeout(() => { o.style.opacity = '0'; setTimeout(() => o.remove(), 300); }, 700);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);
}

function useReveal(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function LoginPage({ onLogin }) {
  useExternalLinkTransition();
  const [featRef, featVisible] = useReveal();
  const [agentsRef, agentsVisible] = useReveal();
  const [outcomeRef, outcomeVisible] = useReveal();
  // "landing" | "login" | "signup"
  const [authMode, setAuthMode] = useState("landing");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [signupStep, setSignupStep] = useState(0);
  const [slideDir, setSlideDir] = useState("right");
  const [usernameStatus, setUsernameStatus] = useState("idle"); // idle | checking | available | taken
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  const isSignup = authMode === "signup";
  const c = useCms();
  // Editable login copy (admin console). Always falls back to the defaults.
  const lc = useLoginContent();
  const t = (k, fb) => lc[k] || fb;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await dbUsers({ action: "login", username, password });
      if (data.found) {
        const u = data.user;
        const userData = { ...u, dbId: u.id, profileComplete: u.profileComplete };
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
    const fullName = [firstName, middleName, lastName].filter(Boolean).join(" ");
    if (!firstName || !lastName || !email || !phone || !company || !username || !password) { setError("Please fill in all required fields"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);

    try {
      const data = await dbUsers({ action: "signup", username, email, password, name: fullName, phone, company, role_title: jobRole });
      if (!data.created) { setError(data.error || "Signup failed. Please try again."); setLoading(false); return; }
      const userData = { username, email, name: fullName, phone, company, role_title: jobRole, dbId: data.id, profileComplete: false };
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
      scope: "email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send",
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

          // Fetch sent count while we have the token
          let sentCount = 0;
          try {
            const sentRes = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages?labelIds=SENT&maxResults=1", {
              headers: { Authorization: `Bearer ${token}` },
            });
            const sentData = await sentRes.json();
            sentCount = sentData.resultSizeEstimate || 0;
          } catch { /* non-fatal */ }

          // Find or create user in Neon DB
          let findData = await dbUsers({ action: "find", email: gEmail });
          let dbId = findData.user?.id || null;
          let existingUser = findData.user || null;
          if (!dbId) {
            // Try signup with Google display name as username
            let signupResult = await dbUsers({ action: "signup", username: gName, email: gEmail, password: "" });
            if (!signupResult.created) {
              // Username taken — fall back to email-prefix username with random suffix
              const base = gEmail.split("@")[0].replace(/[^a-z0-9_]/gi, "_");
              const fallback = base + "_" + Math.random().toString(36).slice(2, 5);
              signupResult = await dbUsers({ action: "signup", username: fallback, email: gEmail, password: "" });
            }
            dbId = signupResult.id || null;
          }

          const userData = {
            username:    existingUser?.username || gName,
            email:       gEmail,
            gmailEmail:  gEmail,
            avatar:      gPic,
            accessToken: token,
            gmailToken:  token,
            sentCount,
            dbId,
            name:        existingUser?.name || gName,
            company:     existingUser?.company || "",
            role_title:  existingUser?.role_title || "",
            role:        existingUser?.role || "user",
            website:     existingUser?.website || "",
            phone:       existingUser?.phone || "",
            profileComplete: existingUser?.profileComplete || false,
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

  const resetForm = () => { setUsername(""); setEmail(""); setPassword(""); setFirstName(""); setMiddleName(""); setLastName(""); setPhone(""); setCompany(""); setJobRole(""); setSignupStep(0); setSlideDir("right"); setForgotEmail(""); setForgotSent(false); setError(""); setShowPass(false); setUsernameStatus("idle"); };
  const goBack = () => { setAuthMode("landing"); resetForm(); };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) { setError("Please enter your email address"); return; }
    setLoading(true);
    try {
      await dbUsers({ action: "forgotPassword", email: forgotEmail });
      setForgotSent(true);
      setError("");
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const lightInp = { width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid rgba(0,0,0,0.12)", background: "#f8fafc", color: "#0f172a", fontSize: 14, outline: "none", fontFamily: "'Plus Jakarta Sans', sans-serif", boxSizing: "border-box" };
  const lightLbl = { fontSize: 12, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 6, letterSpacing: 0.3 };

  const GBtn = () => (
    <button onClick={handleGoogleLogin} disabled={googleLoading} style={{
      width: "100%", padding: "12px", borderRadius: 10, border: "1.5px solid rgba(0,0,0,0.1)",
      background: "#fff", color: "#0f172a", fontSize: 14, fontWeight: 500,
      cursor: googleLoading ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center",
      gap: 10, fontFamily: "'Plus Jakarta Sans', sans-serif", transition: "background .15s", opacity: googleLoading ? 0.6 : 1,
    }}
      onMouseEnter={e => { if (!googleLoading) e.currentTarget.style.background = "#f1f5f9"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "#fff"; }}
    >
      {googleLoading
        ? <>{[0,1,2].map(d => <div key={d} style={{ width: 6, height: 6, borderRadius: "50%", background: "#94a3b8", animation: `pulse 1.2s ease-in-out ${d*.2}s infinite` }} />)}</>
        : <><svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>{t("google_btn", "Continue with Google")}</>
      }
    </button>
  );

  const OR = () => (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0" }}>
      <div style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.08)" }} />
      <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.2 }}>or</span>
      <div style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.08)" }} />
    </div>
  );

  const MODAL_FEATURES = [
    { icon: <LuUsers size={15} />, text: "Import leads from any CSV in seconds" },
    { icon: <LuSparkles size={15} />, text: "AI writes a personalised email per contact" },
    { icon: <LuInbox size={15} />, text: "All replies land in one unified inbox" },
    { icon: <LuTrendingUp size={15} />, text: "Live campaign analytics from day one" },
  ];

  const overlay = { position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", zIndex: 100, backdropFilter: "blur(8px)", animation: "fadeIn .2s ease" };

  const loginPanelRight = (
    <div style={{ background: "linear-gradient(160deg, #f0fdf9 0%, #e0f2fe 100%)", borderRadius: "0 20px 20px 0", padding: "44px 32px", display: "flex", flexDirection: "column", justifyContent: "center", borderLeft: "1px solid rgba(16,185,129,0.12)" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#10b981", textTransform: "uppercase", letterSpacing: 1.5, fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 10 }}>thehotspot</div>
      <div style={{ fontSize: 19, fontWeight: 700, color: "#0f172a", fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.35, marginBottom: 28 }}>Cold outreach<br />that gets replies.</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {MODAL_FEATURES.map((f, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(16,185,129,0.13)", display: "flex", alignItems: "center", justifyContent: "center", color: "#10b981", flexShrink: 0 }}>{f.icon}</div>
            <span style={{ fontSize: 13, color: "#334155", lineHeight: 1.5, fontFamily: "'Plus Jakarta Sans', sans-serif", paddingTop: 6 }}>{f.text}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 28, padding: "14px 16px", background: "rgba(255,255,255,0.75)", borderRadius: 10, border: "1px solid rgba(16,185,129,0.15)" }}>
        <div style={{ fontSize: 12, color: "#475569", fontStyle: "italic", lineHeight: 1.55, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>"First campaign was live in under five minutes. The replies proved it wasn't templated."</div>
        <div style={{ fontSize: 11, color: "#10b981", fontWeight: 600, marginTop: 8, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>— Verified user</div>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Login / Forgot password modal ── */}
      {showLogin && (authMode === "login" || authMode === "forgot") && (
        <>
          <div onClick={() => { setShowLogin(false); goBack(); }} style={overlay} />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 101 }}>
            <div style={{ width: isMobile ? "min(480px, 96vw)" : "min(860px, 96vw)", maxHeight: "92vh", overflowY: "auto", background: "#fff", borderRadius: 20, boxShadow: "0 32px 80px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.06)", animation: "modalIn .3s cubic-bezier(.34,1.1,.64,1)", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 340px" }}>
          {/* Left: form */}
          <div style={{ padding: isMobile ? "28px 24px 32px" : "44px 48px 48px", display: "flex", flexDirection: "column" }}>
            <button onClick={() => { setShowLogin(false); goBack(); }} style={{ alignSelf: "flex-end", background: "none", border: "none", cursor: "pointer", color: "#cbd5e1", padding: 4, marginBottom: 16, lineHeight: 1 }}>
              <LuX size={18} />
            </button>

            {/* ── Forgot password view ── */}
            {authMode === "forgot" && (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                {forgotSent ? (
                  <div style={{ textAlign: "center", padding: "20px 0" }}>
                    <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "#10b981" }}>
                      <LuCheck size={24} />
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 8 }}>Check your inbox</div>
                    <div style={{ fontSize: 14, color: "#64748b", fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.5, marginBottom: 24 }}>
                      If an account exists for <strong>{forgotEmail}</strong>, a reset link is on its way.
                    </div>
                    <button onClick={() => { setAuthMode("login"); setForgotSent(false); setForgotEmail(""); setError(""); }} style={{ background: "none", border: "none", color: "#10b981", fontWeight: 600, cursor: "pointer", fontSize: 13, fontFamily: "'Plus Jakarta Sans', sans-serif", padding: 0 }}>
                      Back to sign in
                    </button>
                  </div>
                ) : (
                  <>
                    <button onClick={() => { setAuthMode("login"); setError(""); setForgotEmail(""); }} style={{ background: "none", border: "none", color: "#94a3b8", fontSize: 13, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 20, padding: 0, display: "flex", alignItems: "center", gap: 6, alignSelf: "flex-start" }}>
                      ← Back
                    </button>
                    <div style={{ marginBottom: 26 }}>
                      <div style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 5 }}>Reset your password</div>
                      <div style={{ fontSize: 14, color: "#64748b", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Enter the email on your account and we'll send a reset link.</div>
                    </div>
                    <form onSubmit={handleForgotPassword}>
                      <div style={{ marginBottom: 20 }}>
                        <label style={lightLbl}>Email address</label>
                        <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="you@company.com" style={lightInp}
                          onFocus={e => e.target.style.borderColor = "#10b981"} onBlur={e => e.target.style.borderColor = "rgba(0,0,0,0.12)"} />
                      </div>
                      {error && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#ef4444", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 14 }}>{error}</div>}
                      <button type="submit" disabled={loading || !forgotEmail} style={{
                        width: "100%", padding: "13px", borderRadius: 10, border: "none",
                        background: forgotEmail ? "#10b981" : "#e2e8f0",
                        color: forgotEmail ? "#fff" : "#94a3b8",
                        fontSize: 14, fontWeight: 600, cursor: forgotEmail ? "pointer" : "default",
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background .15s",
                      }}>
                        {loading ? <>{[0,1,2].map(d => <div key={d} style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", animation: `pulse 1.2s ease-in-out ${d*.2}s infinite` }} />)}</> : "Send reset link"}
                      </button>
                    </form>
                  </>
                )}
              </div>
            )}

            {/* ── Sign in view ── */}
            {authMode === "login" && (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div style={{ marginBottom: 26 }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 5 }}>{t("login_title", "Welcome back")}</div>
                  <div style={{ fontSize: 14, color: "#64748b", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{t("login_subtitle", "Sign in to your outreach dashboard")}</div>
                </div>
                <GBtn />
                <OR />
                <form onSubmit={handleLogin}>
                  <div style={{ marginBottom: 14 }}>
                    <label style={lightLbl}>{t("username_label", "Username")}</label>
                    <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter your username" style={lightInp}
                      onFocus={e => e.target.style.borderColor = "#10b981"} onBlur={e => e.target.style.borderColor = "rgba(0,0,0,0.12)"} />
                  </div>
                  <div style={{ marginBottom: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                      <label style={lightLbl}>{t("password_label", "Password")}</label>
                      <button type="button" onClick={() => { setAuthMode("forgot"); setError(""); }} style={{ background: "none", border: "none", color: "#10b981", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", padding: 0 }}>
                        Forgot password?
                      </button>
                    </div>
                    <div style={{ position: "relative" }}>
                      <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password"
                        style={{ ...lightInp, padding: "11px 42px 11px 14px" }}
                        onFocus={e => e.target.style.borderColor = "#10b981"} onBlur={e => e.target.style.borderColor = "rgba(0,0,0,0.12)"} />
                      <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: 2, lineHeight: 1 }}>
                        {showPass ? <I.EyeOff /> : <I.Eye />}
                      </button>
                    </div>
                  </div>
                  {error && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#ef4444", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 14, marginTop: 8 }}>{error}</div>}
                  <button type="submit" disabled={loading || !username || !password} style={{
                    width: "100%", padding: "13px", borderRadius: 10, border: "none",
                    background: (username && password) ? "#10b981" : "#e2e8f0",
                    color: (username && password) ? "#fff" : "#94a3b8",
                    fontSize: 14, fontWeight: 600, cursor: (username && password) ? "pointer" : "default",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background .15s",
                    marginTop: 20,
                  }}>
                    {loading ? <>{[0,1,2].map(d => <div key={d} style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", animation: `pulse 1.2s ease-in-out ${d*.2}s infinite` }} />)}</> : t("signin_btn", "Sign In")}
                  </button>
                </form>
                <div style={{ marginTop: 20, textAlign: "center", fontSize: 13, color: "#64748b", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  No account?{" "}
                  <button onClick={() => { setAuthMode("signup"); setError(""); resetForm(); }} style={{ background: "none", border: "none", color: "#10b981", fontWeight: 600, cursor: "pointer", fontSize: 13, fontFamily: "'Plus Jakarta Sans', sans-serif", padding: 0 }}>
                    Get started free
                  </button>
                </div>
              </div>
            )}
          </div>
          {!isMobile && loginPanelRight}
            </div>
          </div>
        </>
      )}

      {/* ── Signup — full-page slide wizard ── */}
      {showLogin && authMode === "signup" && (() => {
        const STEPS = [
          { q: "What's your name?",            hint: "First and last are required — middle name is optional." },
          { q: "What's your email address?",    hint: "You'll use this to sign in and receive updates." },
          { q: "What's your phone number?",     hint: "For account security and important notices." },
          { q: "What company are you with?",    hint: "Helps us personalise your outreach experience." },
          { q: "Choose a username",             hint: "This is how you'll sign in every time." },
          { q: "Create a password",             hint: "Minimum 6 characters. Keep it secure." },
          { q: "What's your job role?",         hint: "Optional — press Next to skip." },
        ];
        const stepValid = [
          !!(firstName.trim() && lastName.trim()),
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
          phone.trim().length >= 6,
          !!company.trim(),
          username.trim().length >= 3 && /^[a-zA-Z0-9_]+$/.test(username) && usernameStatus === "available",
          password.length >= 6,
          true,
        ];
        const isLast = signupStep === STEPS.length - 1;
        const canNext = stepValid[signupStep];

        const advance = () => {
          if (!canNext && !isLast) { setError("Please fill in the required field(s)"); return; }
          setError("");
          if (isLast) { handleSignup({ preventDefault: () => {} }); return; }
          setSlideDir("right");
          setSignupStep(s => s + 1);
        };
        const retreat = () => { setError(""); setSlideDir("left"); setSignupStep(s => s - 1); };

        const inp = { ...lightInp, fontSize: 16, padding: "14px 16px", borderRadius: 12, border: "1.5px solid rgba(0,0,0,0.12)", background: "#f8fafc" };
        const handleKey = (e) => { if (e.key === "Enter") { e.preventDefault(); advance(); } };

        return (
          <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 380px", animation: "fadeIn .25s ease" }}>
            {/* Left — question panel */}
            <div style={{ background: "linear-gradient(145deg, #f8fffe 0%, #f0fdf9 50%, #f0f9ff 100%)", display: "flex", flexDirection: "column", alignItems: "center", padding: isMobile ? "24px 20px 32px" : "32px 48px 40px", overflow: "hidden", position: "relative" }}>
              {/* Decorative background blobs */}
              <div style={{ position: "absolute", top: -80, left: -80, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
              <div style={{ position: "absolute", bottom: -60, right: -40, width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle, rgba(14,165,233,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
              <div style={{ position: "absolute", top: "45%", left: "60%", width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />
              {/* Top bar */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 0, width: "100%" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#10b981", textTransform: "uppercase", letterSpacing: 1.5, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>thehotspot</div>
                <button onClick={() => { setShowLogin(false); goBack(); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#cbd5e1", padding: 4, lineHeight: 1 }}>
                  <LuX size={18} />
                </button>
              </div>

              {/* Slide content — key forces remount & animation replay on step change */}
              <div key={signupStep} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", animation: `${slideDir === "right" ? "slideInFromRight" : "slideInFromLeft"} .32s cubic-bezier(.4,0,.2,1)`, width: "100%", maxWidth: 480, paddingTop: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 12, letterSpacing: 0.5 }}>
                  Step {signupStep + 1} of {STEPS.length}
                </div>
                <div style={{ fontSize: 32, fontWeight: 700, color: "#0f172a", fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.2, marginBottom: 8 }}>
                  {STEPS[signupStep].q}
                </div>
                <div style={{ fontSize: 14, color: "#64748b", fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 36, lineHeight: 1.5 }}>
                  {STEPS[signupStep].hint}
                </div>

                {/* Step 0: Name */}
                {signupStep === 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div>
                        <label style={{ ...lightLbl, marginBottom: 8 }}>First Name <span style={{ color: "#ef4444" }}>*</span></label>
                        <input autoFocus type="text" value={firstName} onChange={e => setFirstName(e.target.value)} onKeyDown={handleKey} placeholder="First name" style={inp}
                          onFocus={e => e.target.style.borderColor = "#10b981"} onBlur={e => e.target.style.borderColor = "rgba(0,0,0,0.12)"} />
                      </div>
                      <div>
                        <label style={{ ...lightLbl, marginBottom: 8 }}>Surname <span style={{ color: "#ef4444" }}>*</span></label>
                        <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} onKeyDown={handleKey} placeholder="Last name" style={inp}
                          onFocus={e => e.target.style.borderColor = "#10b981"} onBlur={e => e.target.style.borderColor = "rgba(0,0,0,0.12)"} />
                      </div>
                    </div>
                    <div>
                      <label style={{ ...lightLbl, marginBottom: 8 }}>Middle Name <span style={{ color: "#94a3b8", fontWeight: 400 }}>(optional)</span></label>
                      <input type="text" value={middleName} onChange={e => setMiddleName(e.target.value)} onKeyDown={handleKey} placeholder="Middle name" style={inp}
                        onFocus={e => e.target.style.borderColor = "#10b981"} onBlur={e => e.target.style.borderColor = "rgba(0,0,0,0.12)"} />
                    </div>
                  </div>
                )}

                {/* Step 1: Email */}
                {signupStep === 1 && (
                  <input autoFocus type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={handleKey} placeholder="you@company.com" style={inp}
                    onFocus={e => e.target.style.borderColor = "#10b981"} onBlur={e => e.target.style.borderColor = "rgba(0,0,0,0.12)"} />
                )}

                {/* Step 2: Phone */}
                {signupStep === 2 && (
                  <input autoFocus type="tel" value={phone} onChange={e => setPhone(e.target.value)} onKeyDown={handleKey} placeholder="+1 555 000 0000" style={inp}
                    onFocus={e => e.target.style.borderColor = "#10b981"} onBlur={e => e.target.style.borderColor = "rgba(0,0,0,0.12)"} />
                )}

                {/* Step 3: Company */}
                {signupStep === 3 && (
                  <input autoFocus type="text" value={company} onChange={e => setCompany(e.target.value)} onKeyDown={handleKey} placeholder="Your company name" style={inp}
                    onFocus={e => e.target.style.borderColor = "#10b981"} onBlur={e => e.target.style.borderColor = "rgba(0,0,0,0.12)"} />
                )}

                {/* Step 4: Username */}
                {signupStep === 4 && (() => {
                  const handleUsernameChange = (e) => {
                    const clean = e.target.value.replace(/[^a-zA-Z0-9_]/g, "");
                    setUsername(clean);
                    setUsernameStatus("idle");
                    if (clean.length < 3) return;
                    setUsernameStatus("checking");
                    clearTimeout(window.__uCheck);
                    window.__uCheck = setTimeout(async () => {
                      try {
                        const res = await fetch("/api/db", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "find", username: clean }) });
                        const d = await res.json();
                        setUsernameStatus(d.found ? "taken" : "available");
                      } catch { setUsernameStatus("idle"); }
                    }, 500);
                  };
                  const borderColor = usernameStatus === "available" ? "#10b981" : usernameStatus === "taken" ? "#ef4444" : "rgba(0,0,0,0.12)";
                  return (
                    <div>
                      <input autoFocus type="text" value={username} onChange={handleUsernameChange} onKeyDown={handleKey} placeholder="Pick a username (letters, numbers, _)"
                        style={{ ...inp, borderColor }}
                        onFocus={e => e.target.style.borderColor = borderColor}
                        onBlur={e => e.target.style.borderColor = borderColor} />
                      {username.length > 0 && (
                        <div style={{ marginTop: 8, fontSize: 13, fontFamily: "'Plus Jakarta Sans', sans-serif", color: usernameStatus === "available" ? "#10b981" : usernameStatus === "taken" ? "#ef4444" : "#94a3b8" }}>
                          {usernameStatus === "checking" && "Checking availability…"}
                          {usernameStatus === "available" && "Username is available"}
                          {usernameStatus === "taken" && "Username is already taken"}
                          {usernameStatus === "idle" && username.length < 3 && "Must be at least 3 characters"}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Step 5: Password */}
                {signupStep === 5 && (
                  <div style={{ position: "relative" }}>
                    <input autoFocus type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} onKeyDown={handleKey} placeholder="Minimum 6 characters"
                      style={{ ...inp, padding: "14px 48px 14px 16px" }}
                      onFocus={e => e.target.style.borderColor = "#10b981"} onBlur={e => e.target.style.borderColor = "rgba(0,0,0,0.12)"} />
                    <button type="button" onClick={() => setShowPass(v => !v)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: 2, lineHeight: 1 }}>
                      {showPass ? <I.EyeOff /> : <I.Eye />}
                    </button>
                  </div>
                )}

                {/* Step 6: Job Role */}
                {signupStep === 6 && (
                  <input autoFocus type="text" value={jobRole} onChange={e => setJobRole(e.target.value)} onKeyDown={handleKey} placeholder="e.g. Founder, SDR, Marketing Manager" style={inp}
                    onFocus={e => e.target.style.borderColor = "#10b981"} onBlur={e => e.target.style.borderColor = "rgba(0,0,0,0.12)"} />
                )}

                {error && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#ef4444", padding: "11px 14px", borderRadius: 10, fontSize: 13, marginTop: 16, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{error}</div>}

                {/* Nav buttons */}
                <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
                  {signupStep > 0 && (
                    <button onClick={retreat} style={{ padding: "13px 24px", borderRadius: 10, border: "1.5px solid rgba(0,0,0,0.1)", background: "#fff", color: "#64748b", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", transition: "border-color .15s" }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = "#10b981"} onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(0,0,0,0.1)"}>
                      Back
                    </button>
                  )}
                  <button onClick={advance} disabled={loading} style={{
                    flex: 1, padding: "13px 24px", borderRadius: 10, border: "none",
                    background: (canNext || isLast) ? "#10b981" : "#e2e8f0",
                    color: (canNext || isLast) ? "#fff" : "#94a3b8",
                    fontSize: 14, fontWeight: 600, cursor: "pointer",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background .15s",
                  }}>
                    {loading
                      ? <>{[0,1,2].map(d => <div key={d} style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", animation: `pulse 1.2s ease-in-out ${d*.2}s infinite` }} />)}</>
                      : isLast ? "Create Account" : "Next →"
                    }
                  </button>
                </div>

                <div style={{ marginTop: 24, fontSize: 13, color: "#64748b", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Already have an account?{" "}
                  <button onClick={() => { setAuthMode("login"); setError(""); resetForm(); }} style={{ background: "none", border: "none", color: "#10b981", fontWeight: 600, cursor: "pointer", fontSize: 13, fontFamily: "'Plus Jakarta Sans', sans-serif", padding: 0 }}>
                    Sign in
                  </button>
                </div>
              </div>
            </div>

            {/* Right — branding + progress */}
            {!isMobile && <div style={{ background: "linear-gradient(160deg, #f0fdf9 0%, #e0f2fe 100%)", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "40px 36px 48px", borderLeft: "1px solid rgba(16,185,129,0.12)" }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#10b981", textTransform: "uppercase", letterSpacing: 1.5, fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 32 }}>thehotspot</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.3, marginBottom: 12 }}>Set up your account.</div>
                <div style={{ fontSize: 14, color: "#64748b", fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.6 }}>Takes about 2 minutes. No credit card needed.</div>
              </div>

              {/* Progress dots */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {STEPS.map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: i < signupStep ? "#10b981" : i === signupStep ? "#0f172a" : "rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background .3s" }}>
                      {i < signupStep
                        ? <LuCheck size={13} color="#fff" />
                        : <span style={{ fontSize: 11, fontWeight: 700, color: i === signupStep ? "#fff" : "#94a3b8", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{i + 1}</span>
                      }
                    </div>
                    <span style={{ fontSize: 13, color: i === signupStep ? "#0f172a" : i < signupStep ? "#10b981" : "#94a3b8", fontWeight: i === signupStep ? 600 : 400, fontFamily: "'Plus Jakarta Sans', sans-serif", transition: "color .3s" }}>
                      {s.q.replace(/\?$/, "")}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ fontSize: 12, color: "#94a3b8", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Trusted by 500+ teams
              </div>
            </div>}
          </div>
        );
      })()}

      <Home
        onSignIn={() => { setAuthMode("login"); setShowLogin(true); }}
        onGetStarted={() => { setAuthMode("signup"); setShowLogin(true); }}
      />
    </>
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
const getStatsData = () => {
  try {
    const campaigns = JSON.parse(localStorage.getItem("thehotspot_campaigns") || "[]");
    const contacts = JSON.parse(localStorage.getItem("thehotspot_contacts") || "[]");
    const manual = JSON.parse(localStorage.getItem("thehotspot_manual_contacts") || "[]");
    const sent = campaigns.reduce((s, h) => s + (h.sent || 0), 0);
    const failed = campaigns.reduce((s, h) => s + (h.failed || 0), 0);
    const rate = sent + failed > 0 ? Math.round(sent / (sent + failed) * 100) : 0;
    return { totalContacts: contacts.length + manual.length, emailsSent: sent, categories: 5, successRate: rate };
  } catch { return { totalContacts: 0, emailsSent: 0, categories: 5, successRate: 0 }; }
};
const STATS_DATA = getStatsData();

/* ───────── STYLES (object) ───────── */
const S = {
  app: { fontFamily: "var(--font-sans)", background: "var(--bg)", color: "var(--text)", minHeight: "100vh", display: "flex", flexDirection: "column", width: "100%", maxWidth: "100vw", overflow: "hidden" },
  header: { padding: "16px 28px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg)" },
  logo: { width: 36, height: 36, borderRadius: 10, background: "var(--teal)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: "#fff" },
  layout: { flex: 1, display: "flex", overflow: "hidden", height: "calc(100vh - 65px)" },
  content: { flex: 1, padding: "24px 28px", overflowY: "auto" },
  sectionLabel: { fontSize: 12, color: "var(--text-soft)", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 },
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
      style={{ background: "var(--bg)", border: `1px solid ${hover && !locked ? accent + "55" : "var(--border)"}`, borderRadius: 16, padding: "20px 22px", flex: 1, minWidth: 140, position: "relative", overflow: "hidden", opacity: locked ? 0.5 : 1, filter: locked ? "grayscale(0.5)" : "none", transition: "all .3s ease", cursor: "pointer", transform: hover && !locked ? "translateY(-2px)" : "none", boxShadow: hover && !locked ? `0 8px 24px ${accent}18` : "0 2px 8px rgba(15,23,42,0.05)" }}>
      <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: 80, background: `radial-gradient(circle at top right,${accent}12,transparent 70%)` }} />
      {locked && (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(9,9,13,0.85)", zIndex: 2, borderRadius: 16, cursor: "pointer", backdropFilter: "blur(4px)" }} onClick={onConnect}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
          <div style={{ fontSize: 10, color: "#64748B", marginTop: 6, fontWeight: 600, letterSpacing: .5, textTransform: "uppercase" }}>Connect Gmail</div>
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ color: "var(--text-soft)", display: "flex", marginBottom: 14 }}>{icon}</span>
        {!locked && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={hover ? accent : "var(--text-muted)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "all .2s" }}><polyline points="9 18 15 12 9 6" /></svg>}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: "var(--text)", fontFamily: "'JetBrains Mono',monospace", letterSpacing: -1 }}>{locked ? "0" : value}</div>
      <div style={{ fontSize: 12, color: "#64748B", marginTop: 4, fontWeight: 500, letterSpacing: .5, textTransform: "uppercase" }}>{label}</div>
    </div>
  );
}

/* ───────── DETAIL PAGES ───────── */
function BackButton({ onClick, label }) {
  return (
    <button onClick={onClick} className="dash-back">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
      {label || "Back to home"}
    </button>
  );
}

/* ───────── SHARED EMAIL PREVIEW MODAL ───────── */
function EmailPreviewModal({ email: e, onClose }) {
  const cat = CAT[e.category] || { dot: "#94A3B8", text: "#64748B", bg: "#F8FAFF" };
  const sentDate = e.sentAt || e.campaignDate
    ? new Date(e.sentAt || e.campaignDate).toLocaleString("en", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={ev => ev.stopPropagation()} style={{ background: "var(--bg)", borderRadius: 20, width: "100%", maxWidth: 540, maxHeight: "88vh", display: "flex", flexDirection: "column", boxShadow: "0 24px 64px rgba(15,23,42,0.08)", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: `${cat.dot}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: cat.dot, flexShrink: 0 }}>
                {(e.company || e.email || "?")[0].toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>{e.company || e.email}</div>
                <div style={{ fontSize: 12, color: "#64748B" }}>To: {e.email}</div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, color: "#94A3B8", cursor: "pointer", lineHeight: 1, padding: 4 }}>✕</button>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {sentDate && <span style={{ fontSize: 11, color: "#94A3B8" }}>{sentDate}</span>}
            {e.category && e.category !== "all" && (
              <span style={{ fontSize: 10, fontWeight: 600, color: cat.text || cat.dot, background: cat.bg || `${cat.dot}15`, padding: "2px 8px", borderRadius: 20 }}>{e.category}</span>
            )}
            <span style={{ fontSize: 11, background: "#ECFDF5", color: "#059669", padding: "2px 8px", borderRadius: 20, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}><LuCheck size={11} /> Sent</span>
          </div>
        </div>

        {/* Subject */}
        <div style={{ padding: "14px 24px 0", flexShrink: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: .5, marginBottom: 4 }}>Subject</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>{e.subject || "—"}</div>
        </div>

        {/* Body */}
        <div style={{ padding: "14px 24px 24px", overflowY: "auto", flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: .5, marginBottom: 10 }}>Message</div>
          {e.body ? (
            <div style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.75, whiteSpace: "pre-wrap", background: "var(--bg-alt)", borderRadius: 12, padding: "16px 18px", border: "1px solid var(--border)", fontFamily: "'DM Sans',sans-serif" }}>
              {e.body}
            </div>
          ) : (
            <div style={{ fontSize: 13, color: "#94A3B8", fontStyle: "italic", background: "var(--bg-alt)", borderRadius: 12, padding: "16px 18px", border: "1px solid var(--border)" }}>
              Email body not stored for this email — full body is saved for all emails sent going forward.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TotalContactsPage({ onBack, user }) {
  const CATS = ["Network", "CPS", "CPL", "CPA", "Mobile"];
  const emptyForm = { name: "", email: "", company: "", website: "", category: "Network", country: "", notes: "" };

  const [contacts, setContacts] = useState(() => {
    try {
      const manual = JSON.parse(localStorage.getItem("thehotspot_manual_contacts") || "[]");
      // Also migrate any manually-added contacts (have an "id" field) from the old shared key
      const old = JSON.parse(localStorage.getItem("thehotspot_contacts") || "[]").filter(c => c.id && c.id.startsWith("c_"));
      if (old.length === 0) return manual;
      const merged = [...manual, ...old.filter(o => !manual.find(m => m.email === o.email))];
      localStorage.setItem("thehotspot_manual_contacts", JSON.stringify(merged));
      return merged;
    } catch { return []; }
  });
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  // Sync with server on mount — contacts are stored in PostgreSQL across devices
  useEffect(() => {
    fetch("/api/db?entity=contact&limit=2000")
      .then(r => r.json())
      .then(data => {
        const rows = data.records || [];
        if (rows.length === 0) return;
        const serverContacts = rows.map(r => ({
          id: String(r.id),
          airtableId: String(r.id),
          name: r.name || "",
          email: r.email || "",
          company: r.company || "",
          website: r.website || "",
          category: r.category || "Network",
          country: r.country || "",
          notes: r.notes || "",
          status: "Pending",
          createdAt: r.created_at,
        }));
        setContacts(serverContacts);
        localStorage.setItem("thehotspot_manual_contacts", JSON.stringify(serverContacts));
      })
      .catch(() => {});
  }, []);

  const save = (list) => { setContacts(list); localStorage.setItem("thehotspot_manual_contacts", JSON.stringify(list)); };

  const filtered = useMemo(() => contacts.filter(c => {
    const matchCat = filterCat === "All" || c.category === filterCat;
    const q = search.toLowerCase();
    const matchSearch = !q || [c.name, c.email, c.company, c.country].some(f => (f || "").toLowerCase().includes(q));
    return matchCat && matchSearch;
  }), [contacts, search, filterCat]);

  const countByCat = useMemo(() => contacts.reduce((acc, c) => { const k = c.category || "Other"; acc[k] = (acc[k] || 0) + 1; return acc; }, {}), [contacts]);
  const maxCount = Math.max(...CATS.map(k => countByCat[k] || 0), 1);

  const openAdd = () => { setForm(emptyForm); setEditId(null); setFormError(""); setShowModal(true); };
  const openEdit = (c) => { setForm({ name: c.name || "", email: c.email || "", company: c.company || "", website: c.website || "", category: c.category || "Network", country: c.country || "", notes: c.notes || "" }); setEditId(c.id); setFormError(""); setShowModal(true); };

  const submitForm = async () => {
    if (!form.email.trim()) { setFormError("Email is required"); return; }
    if (!/\S+@\S+\.\S+/.test(form.email)) { setFormError("Enter a valid email address"); return; }
    if (!editId && contacts.find(c => c.email === form.email.trim())) { setFormError("This email already exists"); return; }
    setShowModal(false);
    if (editId) {
      const existing = contacts.find(c => c.id === editId);
      const updated = { ...existing, ...form, email: form.email.trim() };
      save(contacts.map(c => c.id === editId ? updated : c));
      if (existing?.airtableId) manualContactUpdate(existing.airtableId, updated);
    } else {
      const newContact = { ...form, email: form.email.trim(), id: "c_" + Date.now(), status: "Pending", createdAt: new Date().toISOString() };
      // Save to localStorage first, then get Airtable ID and update
      const withAirtable = { ...newContact };
      manualContactCreate(newContact).then(airtableId => {
        if (airtableId) {
          setContacts(prev => {
            const updated = prev.map(c => c.id === newContact.id ? { ...c, airtableId } : c);
            localStorage.setItem("thehotspot_manual_contacts", JSON.stringify(updated));
            return updated;
          });
        }
      });
      save([...contacts, withAirtable]);
    }
  };

  const deleteContact = (id) => {
    if (!window.confirm("Delete this contact?")) return;
    const contact = contacts.find(c => c.id === id);
    save(contacts.filter(c => c.id !== id));
    if (contact?.airtableId) manualContactDelete(contact.airtableId);
  };

  const inp = { background: "var(--bg-alt)", border: "1px solid var(--border)", borderRadius: 8, padding: "9px 12px", fontSize: 13, color: "var(--text)", outline: "none", width: "100%", fontFamily: "'DM Sans',sans-serif", boxSizing: "border-box" };
  const lbl = { fontSize: 11, fontWeight: 600, color: "#64748B", marginBottom: 5, display: "block", textTransform: "uppercase", letterSpacing: .5 };
  const focusStyle = (e) => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 3px #6366f115"; };
  const blurStyle  = (e) => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; };

  return (
    <div>
      {/* Header */}
      <div className="rsp-tc-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <header className="dash-page-head" style={{ marginBottom: 0 }}>
          <span className="dash-eyebrow">03 — Contacts</span>
          <h1 className="dash-page-title">Total <em>contacts</em></h1>
          <p className="dash-page-stats"><strong>{contacts.length}</strong>&nbsp;{contacts.length !== 1 ? "contacts" : "contact"} total</p>
        </header>
        <button onClick={openAdd} className="dash-btn dash-btn-primary" style={{ flexShrink: 0 }}>
          Add contact
        </button>
      </div>

      {/* Category bar */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
        {CATS.map(cat => {
          const c = CAT[cat] || { dot: "#94A3B8", text: "#64748B", bg: "#F8FAFF" };
          const count = countByCat[cat] || 0;
          return (
            <button key={cat} onClick={() => setFilterCat(filterCat === cat ? "All" : cat)} style={{
              background: "var(--bg)", border: filterCat === cat ? `2px solid ${c.dot}` : "1px solid var(--border)",
              borderRadius: 12, padding: "12px 16px", cursor: "pointer", textAlign: "left", fontFamily: "'DM Sans',sans-serif", transition: "all .15s",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: c.dot, display: "inline-block" }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: c.text || "var(--text)" }}>{cat}</span>
                </div>
                <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", fontFamily: "'JetBrains Mono',monospace" }}>{count}</span>
              </div>
              <div style={{ width: "100%", height: 5, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ width: `${(count / maxCount) * 100}%`, height: "100%", background: c.dot, borderRadius: 3, transition: "width .6s ease" }} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Search + filter row */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <input style={{ ...inp, flex: 1 }} placeholder="Search by name, email, company..." value={search} onChange={e => setSearch(e.target.value)} onFocus={focusStyle} onBlur={blurStyle} />
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ ...inp, width: "auto", paddingRight: 28, cursor: "pointer" }}>
          <option value="All">All Categories</option>
          {CATS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Contact list */}
      {filtered.length === 0 ? (
        <div className="dash-empty">
          <div className="dash-empty-title">{contacts.length === 0 ? "No contacts yet" : "No results"}</div>
          <div className="dash-empty-text">{contacts.length === 0 ? "Add your first contact to get started." : "Try a different search or filter."}</div>
          {contacts.length === 0 && <button onClick={openAdd} className="dash-btn dash-btn-primary dash-btn-sm">Add contact</button>}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600, letterSpacing: .5, textTransform: "uppercase", marginBottom: 4 }}>{filtered.length} contact{filtered.length !== 1 ? "s" : ""}</div>
          {filtered.map(c => {
            const cat = CAT[c.category] || { dot: "#94A3B8", text: "#64748B", bg: "#F8FAFF" };
            return (
              <div key={c.id} className="rsp-tc-card" style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, boxShadow: "0 1px 3px rgba(15,23,42,0.05)", transition: "box-shadow .15s" }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 12px rgba(15,23,42,0.08)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "0 1px 3px rgba(15,23,42,0.05)"}
              >
                {/* Avatar */}
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: `${cat.dot}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: cat.dot, flexShrink: 0 }}>
                  {(c.company || c.name || c.email || "?")[0].toUpperCase()}
                </div>
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>{c.company || c.name || "—"}</div>
                  <div style={{ fontSize: 12, color: "#64748B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.email}</div>
                </div>
                {/* Category badge */}
                <span style={{ padding: "3px 10px", borderRadius: 20, background: cat.bg || `${cat.dot}15`, color: cat.text || cat.dot, fontSize: 11, fontWeight: 600, flexShrink: 0 }}>{c.category}</span>
                {/* Country */}
                {c.country && <span style={{ fontSize: 12, color: "#94A3B8", flexShrink: 0 }}>{c.country}</span>}
                {/* Actions */}
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button onClick={() => openEdit(c)} style={{ padding: "5px 10px", borderRadius: 7, border: "1px solid var(--border)", background: "var(--bg-alt)", color: "#64748B", fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>Edit</button>
                  <button onClick={() => deleteContact(c.id)} style={{ padding: "5px 10px", borderRadius: 7, border: "1px solid #fee2e2", background: "#fef2f2", color: "#ef4444", fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>✕</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.4)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div style={{ background: "var(--bg)", borderRadius: 18, padding: 28, width: "100%", maxWidth: 480, boxShadow: "0 20px 60px rgba(15,23,42,0.08)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text)" }}>{editId ? "Edit Contact" : "Add Contact"}</div>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", fontSize: 20, color: "#94A3B8", cursor: "pointer", lineHeight: 1 }}>✕</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="rsp-tc-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={lbl}>Company</label>
                  <input style={inp} placeholder="AdCombo Ltd" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} onFocus={focusStyle} onBlur={blurStyle} />
                </div>
                <div>
                  <label style={lbl}>Contact Name</label>
                  <input style={inp} placeholder="John Smith" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} onFocus={focusStyle} onBlur={blurStyle} />
                </div>
              </div>

              <div>
                <label style={lbl}>Email Address *</label>
                <input style={inp} placeholder="partner@company.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} onFocus={focusStyle} onBlur={blurStyle} />
              </div>

              <div className="rsp-tc-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={lbl}>Website</label>
                  <input style={inp} placeholder="company.com" value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} onFocus={focusStyle} onBlur={blurStyle} />
                </div>
                <div>
                  <label style={lbl}>Country</label>
                  <input style={inp} placeholder="UAE, UK, India…" value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} onFocus={focusStyle} onBlur={blurStyle} />
                </div>
              </div>

              <div>
                <label style={lbl}>Category</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {CATS.map(cat => {
                    const c = CAT[cat] || {};
                    return (
                      <button key={cat} onClick={() => setForm(f => ({ ...f, category: cat }))} style={{
                        padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all .15s",
                        border: form.category === cat ? `2px solid ${c.dot || "#6366f1"}` : "1px solid var(--border)",
                        background: form.category === cat ? (c.bg || "#EEF2FF") : "var(--bg-alt)",
                        color: form.category === cat ? (c.text || "#4F46E5") : "#64748B",
                      }}>{cat}</button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={lbl}>Notes <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, color: "#94A3B8" }}>(optional)</span></label>
                <textarea style={{ ...inp, minHeight: 70, resize: "vertical", lineHeight: 1.6 }} placeholder="Any context about this contact…" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} onFocus={focusStyle} onBlur={blurStyle} />
              </div>

              {formError && <div style={{ fontSize: 12, color: "#ef4444", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "8px 12px" }}>{formError}</div>}

              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button onClick={submitForm} style={{
                  flex: 1, padding: "12px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#6366f1,#4f46e5)", color: "#fff",
                  fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", boxShadow: "0 4px 12px #6366f140",
                }}>
                  {editId ? "Save Changes" : "Add Contact"}
                </button>
                <button onClick={() => setShowModal(false)} style={{ padding: "12px 18px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-alt)", color: "#64748B", fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EmailsSentPage({ onBack, sentCount, gmailConnected, user }) {
  const [tab, setTab] = useState("overview");
  const [expandedId, setExpandedId] = useState(null);
  const [openEmail, setOpenEmail] = useState(null);

  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem("thehotspot_campaigns") || "[]"); } catch { return []; }
  });

  useEffect(() => {
    const uid = encodeURIComponent(user?.username || user?.email || "");
    fetch(`/api/campaigns${uid ? `?userId=${uid}` : ""}`)
      .then(r => r.json())
      .then(data => {
        if (data.configured && data.campaigns?.length > 0) {
          setHistory(data.campaigns);
          localStorage.setItem("thehotspot_campaigns", JSON.stringify(data.campaigns));
        }
      })
      .catch(() => {});
  }, []);

  const totalSent     = useMemo(() => history.reduce((s, h) => s + (h.sent   || 0), 0), [history]);
  const totalFailed   = useMemo(() => history.reduce((s, h) => s + (h.failed || 0), 0), [history]);
  const totalCancelled = useMemo(() => history.filter(h => h.cancelled).length, [history]);
  const deliveryRate  = totalSent + totalFailed > 0 ? Math.round(totalSent / (totalSent + totalFailed) * 100) : 0;
  const rateColor     = deliveryRate >= 80 ? "#10b981" : deliveryRate >= 50 ? "#facc15" : deliveryRate > 0 ? "#f87171" : "var(--border-strong)";

  const last7 = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      return { label: d.toLocaleDateString("en", { weekday: "short" }), date: d.toDateString(), sent: 0 };
    });
    history.forEach(h => { const slot = days.find(d => d.date === new Date(h.date).toDateString()); if (slot) slot.sent += h.sent || 0; });
    return days;
  }, [history]);
  const maxBar = Math.max(...last7.map(d => d.sent), 1);

  const byCat = useMemo(() => history.reduce((acc, h) => { const k = h.category || "Other"; acc[k] = (acc[k] || 0) + (h.sent || 0); return acc; }, {}), [history]);

  const tabBtn = (id) => ({
    padding: "7px 18px", borderRadius: 8, border: "none", cursor: "pointer",
    fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600, transition: "all .15s",
    background: tab === id ? "#6366f1" : "transparent", color: tab === id ? "#fff" : "#64748B",
  });

  return (
    <div>
      {/* Header */}
      <div className="rsp-page-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <header className="dash-page-head" style={{ marginBottom: 0 }}>
          <span className="dash-eyebrow">04 — Activity</span>
          <h1 className="dash-page-title">Emails <em>sent</em></h1>
          <p className="dash-page-stats">
            <strong>{history.length}</strong>&nbsp;campaigns
            <span className="sep">·</span>
            <strong>{totalSent.toLocaleString()}</strong>&nbsp;delivered
            <span className="sep">·</span>
            <strong>{totalSent + totalFailed}</strong>&nbsp;attempted
          </p>
        </header>
        <div style={{ display: "flex", background: "var(--bg-hover)", borderRadius: 10, padding: 3, gap: 2, flexShrink: 0 }}>
          <button style={tabBtn("overview")} onClick={() => setTab("overview")}>Overview</button>
          <button style={tabBtn("history")} onClick={() => setTab("history")}>History</button>
        </div>
      </div>

      {gmailConnected
        ? <div style={{ background: "var(--teal-tint)", border: "1px solid var(--teal-light)", borderRadius: 10, padding: "11px 16px", marginBottom: 18, fontSize: 12, color: "#047857", display: "flex", alignItems: "center", gap: 8 }}>
            <LuCheck size={14} style={{ flexShrink: 0 }} />
            <span>Sending from <strong style={{ color: "#34d399" }}>{user?.email || "your Gmail"}</strong></span>
          </div>
        : <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "11px 14px", marginBottom: 18, fontSize: 12, color: "#b45309", display: "flex", alignItems: "center", gap: 8 }}>
            <LuTriangleAlert size={14} style={{ flexShrink: 0 }} /> Connect Gmail to sync your live sent count.
          </div>
      }

      {tab === "overview" && (
        <>
          {/* Stat cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 16 }}>
            {[
              { label: "Delivered", value: totalSent,       color: "#6366f1" },
              { label: "Failed",    value: totalFailed,     color: "#f87171" },
              { label: "Campaigns", value: history.length,  color: "#0ea5e9" },
              { label: "Cancelled", value: totalCancelled,  color: "#facc15" },
            ].map(s => (
              <div key={s.label} style={{ background: "var(--bg)", border: `1px solid ${s.color}18`, borderRadius: 12, padding: "14px 16px", textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: s.color, letterSpacing: -0.8, marginBottom: 3 }}>{s.value}</div>
                <div style={{ fontSize: 10, color: "#64748B", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {history.length === 0 ? (
            <div className="dash-empty">
              <div className="dash-empty-title">No emails sent yet</div>
              <div className="dash-empty-text">Sent campaigns appear here once you start sending.</div>
            </div>
          ) : (
            <>
              {/* Delivery rate */}
              <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 14, padding: "18px 20px", marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Delivery Rate</span>
                  <span style={{ fontSize: 18, fontWeight: 800, color: rateColor }}>{deliveryRate}%</span>
                </div>
                <div style={{ height: 8, background: "var(--border)", borderRadius: 4, overflow: "hidden", marginBottom: 8 }}>
                  <div style={{ width: `${deliveryRate}%`, height: "100%", background: `linear-gradient(90deg,#6366f1,${rateColor})`, borderRadius: 4, transition: "width .6s ease" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748B" }}>
                  <span style={{ color: "#10b981" }}>✓ {totalSent} delivered</span>
                  <span style={{ color: "#f87171" }}>✗ {totalFailed} failed</span>
                </div>
              </div>

              {/* 7-day chart */}
              <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 14, padding: "18px 20px", marginBottom: 14 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#64748B", letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 18 }}>Last 7 Days</div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 90 }}>
                  {last7.map(d => {
                    const h = Math.max((d.sent / maxBar) * 64, d.sent > 0 ? 8 : 3);
                    const isToday = d.date === new Date().toDateString();
                    return (
                      <div key={d.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                        {d.sent > 0 && <span style={{ fontSize: 10, fontWeight: 700, color: "#6366f1" }}>{d.sent}</span>}
                        <div style={{ width: "100%", display: "flex", alignItems: "flex-end", height: 64 }}>
                          <div style={{
                            width: "100%", height: `${h}px`,
                            background: d.sent > 0 ? "linear-gradient(180deg,#818cf8,#6366f1)" : "var(--border)",
                            borderRadius: "4px 4px 2px 2px", transition: "height .4s ease",
                            boxShadow: d.sent > 0 ? "0 0 10px #6366f130" : "none",
                          }} />
                        </div>
                        <span style={{ fontSize: 10, color: isToday ? "#6366f1" : "#475569", fontWeight: isToday ? 700 : 400 }}>{d.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* By category */}
              {Object.keys(byCat).length > 0 && (
                <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
                  <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", fontSize: 10, fontWeight: 700, color: "#64748B", letterSpacing: 1.2, textTransform: "uppercase" }}>By Category</div>
                  {Object.entries(byCat).sort((a, b) => b[1] - a[1]).map(([cat, count], i, arr) => {
                    const c = CAT[cat] || { dot: "#94A3B8" };
                    const pct = totalSent > 0 ? Math.round(count / totalSent * 100) : 0;
                    return (
                      <div key={cat} style={{ padding: "12px 18px", borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 7 }}>
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: c.dot, flexShrink: 0, boxShadow: `0 0 5px ${c.dot}80` }} />
                          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", flex: 1 }}>{cat}</span>
                          <span style={{ fontSize: 11, color: c.dot, fontWeight: 700 }}>{count}</span>
                          <span style={{ fontSize: 10, color: "#64748B", background: `${c.dot}15`, padding: "1px 7px", borderRadius: 10 }}>{pct}%</span>
                        </div>
                        <div style={{ height: 4, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: c.dot, borderRadius: 2, transition: "width .5s ease" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </>
      )}

      {tab === "history" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {history.length === 0 ? (
            <div className="dash-empty">
              <div className="dash-empty-title">No campaigns yet</div>
              <div className="dash-empty-text">Your sent campaigns will appear here.</div>
            </div>
          ) : [...history].reverse().map(h => {
            const isOpen = expandedId === h.id;
            const c = CAT[h.category] || { dot: "#94A3B8" };
            const total = (h.sent || 0) + (h.failed || 0);
            const pct = total > 0 ? Math.round((h.sent || 0) / total * 100) : 0;
            const pctColor = pct >= 80 ? "#10b981" : pct >= 50 ? "#facc15" : "#f87171";
            const dateStr = new Date(h.date).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" });
            return (
              <div key={h.id} style={{ background: "var(--bg)", border: `1px solid ${isOpen ? c.dot + "30" : "var(--border)"}`, borderRadius: 14, overflow: "hidden", transition: "border-color .15s" }}>
                <button onClick={() => setExpandedId(isOpen ? null : h.id)} style={{
                  width: "100%", padding: "14px 16px", display: "flex", alignItems: "center", gap: 12,
                  background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", textAlign: "left",
                }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: `${c.dot}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: c.dot }}>
                    <LuMail size={16} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{h.category || "Campaign"}</span>
                      {h.cancelled && <span style={{ fontSize: 10, fontWeight: 600, color: "#facc15", background: "#facc1518", border: "1px solid #facc1530", padding: "1px 7px", borderRadius: 10 }}>Cancelled</span>}
                    </div>
                    <div style={{ fontSize: 11, color: "#475569" }}>{dateStr}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#10b981" }}>{h.sent || 0} sent</span>
                      {(h.failed || 0) > 0 && <span style={{ fontSize: 12, color: "#f87171" }}>{h.failed} failed</span>}
                      <span style={{ color: "var(--text-faint)", fontSize: 13, transform: isOpen ? "rotate(90deg)" : "none", transition: "transform .2s", display: "inline-block" }}>›</span>
                    </div>
                    <div style={{ width: 80, height: 3, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: pctColor, borderRadius: 2 }} />
                    </div>
                  </div>
                </button>

                {isOpen && (
                  <div style={{ borderTop: "1px solid var(--border)", padding: "14px 16px", background: "var(--bg-alt)" }}>
                    {h.offerContext && (
                      <div style={{ fontSize: 12, color: "#94A3B8", marginBottom: 12, padding: "10px 12px", background: "var(--bg)", borderRadius: 8, border: "1px solid var(--border)", lineHeight: 1.6 }}>
                        <span style={{ color: "#64748B", fontWeight: 600 }}>Offer context: </span>{h.offerContext}
                      </div>
                    )}
                    {h.contacts && h.contacts.length > 0 ? (
                      <>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Recipients ({h.contacts.length})</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {h.contacts.map((ct, i) => (
                            <div key={i} onClick={() => setOpenEmail({ ...ct, category: h.category })}
                              style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", background: "var(--bg)", borderRadius: 10, border: "1px solid var(--border)", cursor: "pointer", transition: "all .15s" }}
                              onMouseEnter={e => { e.currentTarget.style.borderColor = "#6366f150"; e.currentTarget.style.background = "var(--bg-hover)"; }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--bg)"; }}
                            >
                              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", flexShrink: 0 }} />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{ct.company || ct.email}</div>
                                {ct.subject && <div style={{ fontSize: 11, color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ct.subject}</div>}
                              </div>
                              <span style={{ fontSize: 11, color: "#6366f1", fontWeight: 600, flexShrink: 0 }}>View →</span>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div style={{ fontSize: 12, color: "#475569" }}>No recipient details recorded.</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {openEmail && <EmailPreviewModal email={openEmail} onClose={() => setOpenEmail(null)} />}
    </div>
  );
}

function CategoriesPage({ onBack }) {
  const [contacts, setContacts] = useState(() => {
    try {
      const sheet = JSON.parse(localStorage.getItem("thehotspot_contacts") || "[]");
      const manual = JSON.parse(localStorage.getItem("thehotspot_manual_contacts") || "[]");
      return [...sheet, ...manual];
    } catch { return []; }
  });
  useEffect(() => {
    fetch("/api/db?entity=contact&limit=2000").then(r => r.json()).then(data => {
      const rows = data.records || [];
      if (rows.length > 0) setContacts(rows.map(r => ({ ...r, category: r.category || "Network" })));
    }).catch(() => {});
  }, []);
  const countBycat = useMemo(() => contacts.reduce((acc, c) => { const k = c.category || "Other"; acc[k] = (acc[k] || 0) + 1; return acc; }, {}), [contacts]);
  const categories = [
    { name: "Network", desc: "Affiliate network partners managing multiple programs", count: countBycat["Network"] || 0, dot: "#10b981" },
    { name: "CPS",     desc: "Cost Per Sale — commission per successful sale",        count: countBycat["CPS"]     || 0, dot: "#6366f1" },
    { name: "CPL",     desc: "Cost Per Lead — payment per qualified lead",            count: countBycat["CPL"]     || 0, dot: "#f97316" },
    { name: "CPA",     desc: "Cost Per Action — payment per specific user action",    count: countBycat["CPA"]     || 0, dot: "#d946ef" },
    { name: "Mobile",  desc: "Mobile marketing and app-based advertising",            count: countBycat["Mobile"]  || 0, dot: "#0ea5e9" },
  ];
  const total = contacts.length;

  return (
    <div>
      <BackButton onClick={onBack} />

      {/* Header */}
      <div className="rsp-page-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <header className="dash-page-head" style={{ marginBottom: 0 }}>
          <span className="dash-eyebrow">05 — Segments</span>
          <h1 className="dash-page-title">Contact <em>categories</em></h1>
          <p className="dash-page-stats"><strong>{total}</strong>&nbsp;contacts across&nbsp;<strong>5</strong>&nbsp;categories</p>
        </header>
      </div>

      {/* Distribution bar */}
      <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 14, padding: "18px 20px", marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#64748B", letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 14 }}>Contact Distribution</div>
        {total === 0 ? (
          <div style={{ height: 10, background: "var(--border)", borderRadius: 5 }} />
        ) : (
          <div style={{ display: "flex", height: 10, borderRadius: 5, overflow: "hidden", gap: 2 }}>
            {categories.map(c => (
              c.count > 0 && (
                <div key={c.name} title={`${c.name}: ${c.count}`} style={{ flex: c.count, background: c.dot, borderRadius: 3, transition: "flex .6s ease" }} />
              )
            ))}
          </div>
        )}
        {/* Legend */}
        <div style={{ display: "flex", gap: 14, marginTop: 12, flexWrap: "wrap" }}>
          {categories.map(c => (
            <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: c.dot, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: "#64748B" }}>{c.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Category cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {categories.map((c, i) => {
          const pct = total > 0 ? Math.round(c.count / total * 100) : 0;
          return (
            <div key={c.name} style={{ background: "var(--bg)", border: `1px solid ${c.dot}20`, borderRadius: 14, padding: "16px 18px", transition: "all .15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `${c.dot}50`; e.currentTarget.style.background = "var(--bg-hover)"; e.currentTarget.style.transform = "translateX(3px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = `${c.dot}20`; e.currentTarget.style.background = "var(--bg)"; e.currentTarget.style.transform = "none"; }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                {/* Rank */}
                <div style={{ width: 28, height: 28, borderRadius: 8, background: `${c.dot}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: c.dot }}>#{i + 1}</span>
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: c.dot, display: "inline-block", boxShadow: `0 0 6px ${c.dot}80` }} />
                    <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{c.name}</span>
                    <span style={{ fontSize: 10, color: c.dot, background: `${c.dot}18`, border: `1px solid ${c.dot}30`, padding: "1px 7px", borderRadius: 10, fontWeight: 600 }}>{pct}%</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#64748B", marginBottom: 8 }}>{c.desc}</div>
                  {/* Bar */}
                  <div style={{ height: 4, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: c.dot, borderRadius: 2, transition: "width .6s ease", opacity: 0.8 }} />
                  </div>
                </div>

                {/* Count */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: c.dot, letterSpacing: -0.8 }}>{c.count}</div>
                  <div style={{ fontSize: 10, color: "#64748B" }}>contacts</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SuccessRatePage({ onBack, user }) {
  const [history, setHistory] = useState(() => { try { return JSON.parse(localStorage.getItem("thehotspot_campaigns") || "[]"); } catch { return []; } });
  useEffect(() => {
    const uid = encodeURIComponent(user?.username || user?.email || "");
    fetch(`/api/campaigns${uid ? `?userId=${uid}` : ""}`)
      .then(r => r.json())
      .then(data => {
        if (data.configured && data.campaigns?.length > 0) {
          setHistory(data.campaigns);
          localStorage.setItem("thehotspot_campaigns", JSON.stringify(data.campaigns));
        }
      }).catch(() => {});
  }, []);
  const totalSent      = useMemo(() => history.reduce((s, h) => s + (h.sent   || 0), 0), [history]);
  const totalFailed    = useMemo(() => history.reduce((s, h) => s + (h.failed || 0), 0), [history]);
  const totalCampaigns = history.length;
  const cancelledCount = history.filter(h => h.cancelled).length;
  const totalAttempted = totalSent + totalFailed;
  const rate = totalAttempted > 0 ? Math.round(totalSent / totalAttempted * 100) : 0;
  const ringColor = rate >= 80 ? "#10b981" : rate >= 50 ? "#facc15" : rate > 0 ? "#f87171" : "var(--border-strong)";

  const Arrow = () => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0, flexShrink: 0 }}>
      <div style={{ width: 1, height: 28, background: "linear-gradient(180deg,var(--border-strong),var(--text-faint))" }} />
      <svg width="10" height="8" viewBox="0 0 10 8"><path d="M5 8L0 0h10z" fill="var(--border-strong)" /></svg>
    </div>
  );

  const FlowNode = ({ icon, label, value, sub, color, dim = false }) => (
    <div style={{ background: dim ? "var(--bg-alt)" : "var(--bg)", border: `1px solid ${color}25`, borderRadius: 14, padding: "16px 18px", textAlign: "center", minWidth: 120, opacity: dim ? 0.5 : 1 }}>
      <div style={{ color: "var(--text-soft)", display: "flex", justifyContent: "center", margin: "0 auto 10px" }}>{icon}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", letterSpacing: -0.8, marginBottom: 2 }}>{value}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 10, color: "#64748B" }}>{sub}</div>}
    </div>
  );

  return (
    <div>
      <BackButton onClick={onBack} />

      {/* Header */}
      <div className="rsp-page-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", letterSpacing: -0.5, marginBottom: 3 }}>Campaign Pipeline</div>
          <div style={{ fontSize: 12, color: "#64748B" }}>{totalCampaigns} campaign{totalCampaigns !== 1 ? "s" : ""} · {totalAttempted} emails attempted</div>
        </div>
        {/* Rate badge */}
        <div style={{ background: `${ringColor}15`, border: `1px solid ${ringColor}35`, borderRadius: 14, padding: "10px 18px", textAlign: "center" }}>
          <div style={{ fontSize: 26, fontWeight: 900, color: ringColor, letterSpacing: -1 }}>{rate}%</div>
          <div style={{ fontSize: 10, color: "#64748B", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>Success Rate</div>
        </div>
      </div>

      {totalCampaigns === 0 ? (
        <div className="dash-empty">
          <div className="dash-empty-title">No pipeline data yet</div>
          <div className="dash-empty-text">Run a campaign to see your outreach funnel here.</div>
        </div>
      ) : (
        <>
          {/* Flowchart */}
          <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 16, padding: "28px 24px", marginBottom: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#64748B", letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 20 }}>Outreach Flow</div>

            {/* Vertical pipeline */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>

              {/* Node 1 — Campaigns */}
              <FlowNode icon={<LuZap size={16} />} label="Campaigns Run" value={totalCampaigns} sub="outreach batches started" color="#6366f1" />
              <Arrow />

              {/* Node 2 — Attempted */}
              <FlowNode icon={<LuSend size={16} />} label="Emails Attempted" value={totalAttempted} sub={`${totalCampaigns} campaign${totalCampaigns !== 1 ? "s" : ""} × contacts`} color="#0ea5e9" />
              <Arrow />

              {/* Split node */}
              <div style={{ display: "flex", gap: 0, alignItems: "flex-start", width: "100%" }}>
                {/* Left line */}
                <div style={{ flex: 1, display: "flex", justifyContent: "flex-end", paddingRight: 0 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", width: "100%" }}>
                    <div style={{ height: 1, background: "var(--border-strong)", width: "50%" }} />
                    <div style={{ width: 1, height: 24, background: "#10b98130", marginRight: "calc(50% - 1px)" }} />
                  </div>
                </div>
                {/* Centre dot */}
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--border-strong)", flexShrink: 0, marginTop: -5, zIndex: 1 }} />
                {/* Right line */}
                <div style={{ flex: 1, paddingLeft: 0 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", width: "100%" }}>
                    <div style={{ height: 1, background: "var(--border-strong)", width: "50%" }} />
                    <div style={{ width: 1, height: 24, background: "#f8717130", marginLeft: "calc(50% - 1px)" }} />
                  </div>
                </div>
              </div>

              {/* Two outcome nodes */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, width: "100%" }}>
                <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 14, padding: "18px 16px", textAlign: "center" }}>
                  <LuCheck size={16} strokeWidth={1.5} style={{ color: "var(--text-soft)", margin: "0 auto 10px", display: "block" }} />
                  <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", fontFamily: "var(--font-display)", letterSpacing: -1, marginBottom: 2 }}>{totalSent}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-soft)", marginBottom: 4 }}>Delivered</div>
                  <div style={{ fontSize: 10, color: "#64748B" }}>{rate}% of attempted</div>
                  {/* Mini bar */}
                  <div style={{ height: 4, background: "var(--border)", borderRadius: 2, marginTop: 10, overflow: "hidden" }}>
                    <div style={{ width: `${rate}%`, height: "100%", background: "#10b981", borderRadius: 2 }} />
                  </div>
                </div>

                <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 14, padding: "18px 16px", textAlign: "center" }}>
                  <LuX size={16} strokeWidth={1.5} style={{ color: "var(--text-soft)", margin: "0 auto 10px", display: "block" }} />
                  <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", fontFamily: "var(--font-display)", letterSpacing: -1, marginBottom: 2 }}>{totalFailed}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-soft)", marginBottom: 4 }}>Failed</div>
                  <div style={{ fontSize: 10, color: "#64748B" }}>{totalAttempted > 0 ? 100 - rate : 0}% of attempted</div>
                  {/* Mini bar */}
                  <div style={{ height: 4, background: "var(--border)", borderRadius: 2, marginTop: 10, overflow: "hidden" }}>
                    <div style={{ width: `${totalAttempted > 0 ? 100 - rate : 0}%`, height: "100%", background: "#f87171", borderRadius: 2 }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary bar */}
          <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 14, padding: "16px 20px", marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#94A3B8" }}>Overall Delivery</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: ringColor }}>{rate}%</span>
            </div>
            <div style={{ height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ width: `${rate}%`, height: "100%", background: `linear-gradient(90deg,#6366f1,${ringColor})`, borderRadius: 3, transition: "width .8s ease" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
              {[
                { label: "Campaigns", value: totalCampaigns, color: "#6366f1" },
                { label: "Cancelled", value: cancelledCount, color: "#facc15" },
                { label: "Delivered", value: totalSent, color: "#10b981" },
                { label: "Failed", value: totalFailed, color: "#f87171" },
              ].map(s => (
                <div key={s.label} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: "#64748B" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Per-campaign breakdown */}
          {history.length > 0 && (
            <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", fontSize: 10, fontWeight: 700, color: "#64748B", letterSpacing: 1.2, textTransform: "uppercase" }}>Per Campaign</div>
              {history.slice(-6).reverse().map((h, i) => {
                const total = (h.sent || 0) + (h.failed || 0);
                const pct = total > 0 ? Math.round((h.sent || 0) / total * 100) : 0;
                const col = pct >= 80 ? "#10b981" : pct >= 50 ? "#facc15" : "#f87171";
                return (
                  <div key={i} style={{ padding: "12px 18px", borderBottom: i < Math.min(history.length, 6) - 1 ? "1px solid var(--border)" : "none" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{h.category || "Campaign"} · {h.date ? new Date(h.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "–"}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: col }}>{pct}%</div>
                    </div>
                    <div style={{ height: 4, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: col, borderRadius: 2 }} />
                    </div>
                    <div style={{ display: "flex", gap: 12, marginTop: 5, fontSize: 10, color: "#64748B" }}>
                      <span style={{ color: "#10b981" }}>✓ {h.sent || 0}</span>
                      <span style={{ color: "#f87171" }}>✗ {h.failed || 0}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ───────── ERROR BOUNDARY ───────── */
class AppErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ fontFamily: "'DM Sans',sans-serif", background: "var(--bg)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ background: "var(--bg)", borderRadius: 16, padding: 32, maxWidth: 500, width: "100%", boxShadow: "0 4px 24px rgba(15,23,42,0.08)", border: "1px solid var(--border)" }}>
            <LuTriangleAlert size={32} style={{ marginBottom: 12, color: "#F59E0B" }} />
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>Something went wrong</div>
            <div style={{ fontSize: 13, color: "#64748B", marginBottom: 20, background: "var(--bg-alt)", borderRadius: 8, padding: "12px 14px", fontFamily: "monospace", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
              {this.state.error?.message || String(this.state.error)}
            </div>
            <button onClick={() => { window.location.href = "/"; }} style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: "#4F46E5", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              Reload App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ───────── ONBOARDING MODAL ───────── */
function OnboardingModal({ user, onComplete, onDismiss }) {
  const [form, setForm] = useState({
    fullName:  user?.name     || "",
    username:  user?.username || "",
    email:     user?.email    || "",
    password:  "",
    company:   user?.company  || "",
    phone:     user?.phone    || "",
    role:      user?.role_title || "",
    website:   user?.website  || "",
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const canSubmit = form.fullName.trim() && form.username.trim() && form.email.trim() && form.password.trim() && form.company.trim() && form.phone.trim();

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    setSaveError("");

    try {
      const fields = {
        full_name:       form.fullName.trim(),
        username:        form.username.trim(),
        user_email:      form.email.trim(),
        password:        form.password.trim(),
        company:         form.company.trim(),
        phone:           form.phone.trim(),
        role_title:      form.role.trim(),
        profile_complete: true,
        ...(form.website.trim() ? { website: form.website.trim() } : {}),
      };

      // Resolve DB record ID
      let dbId = user?.dbId;
      if (!dbId) {
        const found = await dbUsers({ action: "find", email: user?.email });
        dbId = found.user?.id || null;
      }
      if (!dbId) {
        // Try signup first — handles fresh accounts correctly
        const signupResult = await dbUsers({ action: "signup", username: fields.username, email: fields.user_email, password: fields.password });
        dbId = signupResult.id || null;
        if (!dbId) {
          // Username taken — use create (upsert) as fallback
          const created = await dbUsers({ action: "create", fields });
          dbId = created.id || null;
        }
        if (!dbId) {
          // Last resort: find by username in case upsert hit a conflict
          const found2 = await dbUsers({ action: "find", username: fields.username });
          dbId = found2.user?.id || null;
        }
      }

      if (!dbId) throw new Error("Could not save your profile. Please try a different username.");

      await dbUsers({ action: "update", id: dbId, fields });

      const updated = {
        ...user,
        dbId,
        name:        form.fullName.trim(),
        username:    form.username.trim(),
        email:       form.email.trim(),
        company:     form.company.trim(),
        phone:       form.phone.trim(),
        role_title:  form.role.trim(),
        website:     form.website.trim(),
        profileComplete: true,
      };
      localStorage.setItem("thehotspot_user", JSON.stringify(updated));
      onComplete(updated);
    } catch (err) {
      setSaveError(err.message || "Failed to save. Please try again.");
      setSaving(false);
    }
  };

  const inp = { width: "100%", background: "var(--bg-alt)", border: "1px solid var(--border-strong)", borderRadius: 10, padding: "11px 14px", color: "#fff", fontSize: 14, fontFamily: "'DM Sans',sans-serif", outline: "none", boxSizing: "border-box" };
  const lbl = { display: "block", color: "#94A3B8", fontSize: 12, fontWeight: 600, marginBottom: 6, fontFamily: "'DM Sans',sans-serif" };
  const req  = <span style={{ color: "#10b981", marginLeft: 3 }}>*</span>;

  const fields = [
    { key: "fullName", label: "Full Name",       placeholder: "John Smith",           required: true, full: true },
    { key: "company",  label: "Company Name",    placeholder: "Acme Corp",            required: true },
    { key: "username", label: "Username",         placeholder: "johnsmith",            required: true },
    { key: "email",    label: "Email Address",   placeholder: "john@company.com",     required: true, type: "email" },
    { key: "password", label: "Password",        placeholder: "••••••••",             required: true, type: "password" },
    { key: "phone",    label: "Contact Number",  placeholder: "+1 555 000 0000",      required: true },
    { key: "role",     label: "Job Title",       placeholder: "Marketing Manager" },
    { key: "website",  label: "Website",         placeholder: "https://acme.com" },
  ];

  return (
    <div onClick={onDismiss} style={{ position: "fixed", inset: 0, zIndex: 9000, background: "rgba(0,0,0,0.78)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ position: "relative", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 22, padding: "36px 32px", width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,0.65)", animation: "fadeIn .3s ease" }}>
        {onDismiss && (
          <button onClick={onDismiss} style={{ position: "absolute", top: 16, right: 16, width: 32, height: 32, borderRadius: "50%", background: "var(--border)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748B", fontSize: 18, lineHeight: 1, fontFamily: "sans-serif", transition: "all .15s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--border-strong)"; e.currentTarget.style.color = "var(--text)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "var(--border)"; e.currentTarget.style.color = "#64748B"; }}
          >×</button>
        )}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <img src="/logo.png" alt="logo" style={{ width: 52, height: 52, objectFit: "contain", marginBottom: 14 }} />
          <div style={{ color: "var(--text)", fontSize: 20, fontWeight: 700, fontFamily: "var(--font-display)", marginBottom: 6 }}>Welcome to thehotspot</div>
          <div style={{ color: "#64748B", fontSize: 13, fontFamily: "'DM Sans',sans-serif", lineHeight: 1.55 }}>Fill in your details so every outreach email you send is signed with the right sender info.</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 12px", marginBottom: 24 }}>
          {fields.map(f => (
            <div key={f.key} style={f.full ? { gridColumn: "1 / -1" } : {}}>
              <label style={lbl}>{f.label}{f.required && req}</label>
              <input type={f.type || "text"} value={form[f.key]} onChange={e => set(f.key, e.target.value)} placeholder={f.placeholder} style={inp} onKeyDown={e => e.key === "Enter" && handleSubmit()} />
            </div>
          ))}
        </div>

        {saveError && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 14px", marginBottom: 14, color: "#b91c1c", fontSize: 13, fontFamily: "var(--font-sans)", wordBreak: "break-word" }}>
            {saveError}
          </div>
        )}

        <button onClick={handleSubmit} disabled={saving || !canSubmit} style={{ width: "100%", padding: "13px", borderRadius: 10, border: "none", background: canSubmit ? "var(--teal)" : "var(--bg-section)", color: canSubmit ? "#fff" : "var(--text-faint)", fontSize: 15, fontWeight: 700, fontFamily: "var(--font-sans)", cursor: canSubmit ? "pointer" : "default", transition: "all .2s" }}>
          {saving ? "Saving…" : "Save & Continue →"}
        </button>
      </div>
    </div>
  );
}

/* ───────── HOME PAGE ───────── */
/* ── HomePage bento visuals ── */

/* Card 01 (wide): outreach funnel — Contacts → Sent → Replies */
function HpFunnelVisual({ contactCount, emailsSent, campaigns }) {
  const replied = campaigns.reduce((s, c) => s + (c.replied || 0), 0);
  const steps = [
    { label: "Contacts", n: contactCount || 0, color: "var(--teal)" },
    { label: "Sent",     n: emailsSent,         color: "var(--teal)" },
    { label: "Replies",  n: replied,             color: "var(--green)" },
  ];
  const max = Math.max(...steps.map(s => s.n), 1);
  return (
    <div style={{ width: "100%", display: "flex", alignItems: "flex-end", gap: 12 }}>
      {steps.map((s, i) => (
        <div key={s.label} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--text)", letterSpacing: "-0.03em", lineHeight: 1 }}>
            {s.n.toLocaleString()}
          </div>
          <div style={{ height: 6, borderRadius: 3, background: "var(--bg-alt)", border: "1px solid var(--border)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.round((s.n / max) * 100)}%`, background: s.color, borderRadius: 3, transition: "width 800ms cubic-bezier(.4,0,.2,1)" }} />
          </div>
          <div style={{ fontSize: 11, color: "var(--text-faint)", fontFamily: "var(--font-mono)", letterSpacing: "0.08em" }}>{s.label.toUpperCase()}</div>
        </div>
      ))}
    </div>
  );
}

/* Card 02 (tall): contacts loaded + quick action rows */
function HpContactsVisual({ contactCount }) {
  const rows = ["Import CSV", "Connect Apollo", "Add manually", "View all contacts"];
  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontSize: 48, fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--text)", letterSpacing: "-0.04em", lineHeight: 1 }}>{(contactCount || 0).toLocaleString()}</span>
        <span style={{ fontSize: 13, color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>leads</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 4 }}>
        {rows.map((r, i) => (
          <div key={r} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 6, background: i === 0 ? "var(--teal-light)" : "var(--bg-alt)", border: "1px solid var(--border)" }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: i === 0 ? "var(--teal)" : "var(--border)", flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: i === 0 ? "var(--teal-dark)" : "var(--text-soft)", fontWeight: i === 0 ? 600 : 400 }}>{r}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Card 03: platform status checklist */
function HpStatusVisual({ gmailConnected }) {
  const items = [
    { label: "Gmail API",       ok: gmailConnected },
    { label: "Lead database",   ok: true },
    { label: "AI engine",       ok: true },
    { label: "Sequences",       ok: true },
  ];
  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map(item => (
        <div key={item.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", borderRadius: 7, border: "1px solid var(--border)", background: "#fff" }}>
          <span style={{ fontSize: 13, color: "var(--text)", fontWeight: 500 }}>{item.label}</span>
          <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: item.ok ? "var(--teal)" : "var(--text-faint)", display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: item.ok ? "var(--teal)" : "var(--border)", display: "inline-block" }} />
            {item.ok ? "live" : "idle"}
          </span>
        </div>
      ))}
    </div>
  );
}

/* Card 04: campaigns summary — count + success rate ring */
function HpCampaignSummaryVisual({ campaigns }) {
  const total = campaigns.length;
  const sent  = campaigns.reduce((s, c) => s + (c.sent || 0), 0);
  const fail  = campaigns.reduce((s, c) => s + (c.failed || 0), 0);
  const rate  = sent + fail > 0 ? Math.round(sent / (sent + fail) * 100) : 0;
  const circ  = 2 * Math.PI * 28; // r=28
  return (
    <div style={{ width: "100%", display: "flex", alignItems: "center", gap: 20 }}>
      <svg width={72} height={72} style={{ flexShrink: 0 }}>
        <circle cx={36} cy={36} r={28} fill="none" stroke="var(--border)" strokeWidth={6} />
        <circle cx={36} cy={36} r={28} fill="none" stroke="var(--teal)" strokeWidth={6}
          strokeDasharray={circ} strokeDashoffset={circ * (1 - rate / 100)}
          strokeLinecap="round" transform="rotate(-90 36 36)" style={{ transition: "stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)" }} />
        <text x={36} y={40} textAnchor="middle" fontSize={13} fontWeight={700} fill="var(--text)" fontFamily="var(--font-mono)">{rate}%</text>
      </svg>
      <div>
        <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--text)", letterSpacing: "-0.03em", lineHeight: 1 }}>{total}</div>
        <div style={{ fontSize: 11, color: "var(--text-faint)", fontFamily: "var(--font-mono)", letterSpacing: "0.08em", marginTop: 4 }}>CAMPAIGNS</div>
        <div style={{ fontSize: 11, color: "var(--text-soft)", marginTop: 6 }}>{sent.toLocaleString()} emails sent</div>
      </div>
    </div>
  );
}

/* Card 05 (wide): recent campaigns table */
function HpRecentCampaignsVisual({ campaigns }) {
  const CAT_COLOR = { Network: "var(--teal)", CPS: "#6366f1", CPL: "#f97316", CPA: "#d946ef", Mobile: "#0ea5e9" };
  const recent = [...campaigns].reverse().slice(0, 4);
  if (!recent.length) {
    return (
      <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8, color: "var(--text-faint)" }}>
        <LuRadio size={28} style={{ opacity: 0.3 }} />
        <span style={{ fontSize: 13, fontFamily: "var(--font-mono)" }}>No campaigns yet</span>
      </div>
    );
  }
  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 0, border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
      {recent.map((c, i) => (
        <div key={c.id || i} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", alignItems: "center", gap: 12, padding: "10px 14px", borderBottom: i < recent.length - 1 ? "1px solid var(--border)" : "none", background: "#fff" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: CAT_COLOR[c.category] || "var(--teal)", flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{c.category || "Campaign"}</span>
          </div>
          <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-soft)" }}>{(c.sent || 0).toLocaleString()} sent</span>
          <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: c.status === "running" ? "var(--teal)" : "var(--text-faint)", letterSpacing: "0.06em" }}>{c.status || "done"}</span>
        </div>
      ))}
    </div>
  );
}

/* Card 06: sequence step timeline */
function HpSequenceVisual() {
  const steps = [
    { day: "Day 1", label: "First touch",    note: "Intro + value prop" },
    { day: "Day 3", label: "Follow-up",      note: "Add context or case" },
    { day: "Day 7", label: "Last attempt",   note: "Short, direct ask" },
  ];
  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 0 }}>
      {steps.map((s, i) => (
        <div key={s.day} style={{ display: "flex", gap: 12, paddingBottom: i < steps.length - 1 ? 14 : 0, position: "relative" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: i === 0 ? "var(--teal)" : "var(--bg-alt)", border: `1.5px solid ${i === 0 ? "var(--teal)" : "var(--border)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 10, fontWeight: 700, fontFamily: "var(--font-mono)", color: i === 0 ? "#fff" : "var(--text-faint)" }}>{i + 1}</span>
            </div>
            {i < steps.length - 1 && <div style={{ width: 1, flex: 1, background: "var(--border)", marginTop: 4 }} />}
          </div>
          <div style={{ paddingTop: 4, paddingBottom: i < steps.length - 1 ? 14 : 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
              <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--teal)", letterSpacing: "0.06em" }}>{s.day}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{s.label}</span>
            </div>
            <span style={{ fontSize: 12, color: "var(--text-faint)" }}>{s.note}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function HpBentoCard({ num, cls, visual, title, desc, onClick }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } }, { threshold: 0.1 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <article ref={ref} className={`lp-bento-card lp-reveal${cls ? " " + cls : ""}${shown ? " in-view" : ""}`}
      onClick={onClick} style={{ cursor: onClick ? "pointer" : "default" }}>
      <span className="lp-bento-num">{num}</span>
      <div className="lp-bento-visual">{visual}</div>
      <div className="lp-bento-body">
        <h3 className="lp-h3">{title}</h3>
        <p className="lp-bento-desc">{desc}</p>
      </div>
    </article>
  );
}

function HomePage({ user, contactCount, setPage }) {
  const firstName = user?.name?.split(" ")[0] || user?.username || "there";
  const [campaigns, setCampaigns] = useState(() => { try { return JSON.parse(localStorage.getItem("thehotspot_campaigns") || "[]"); } catch { return []; } });
  const gmailConnected = !!(user?.gmailToken || user?.sentCount);

  useEffect(() => {
    const uid = encodeURIComponent(user?.username || user?.email || "");
    fetch(`/api/campaigns${uid ? `?userId=${uid}` : ""}`)
      .then(r => r.json())
      .then(d => { if (d.configured && d.campaigns?.length) { setCampaigns(d.campaigns); localStorage.setItem("thehotspot_campaigns", JSON.stringify(d.campaigns)); } })
      .catch(() => {});
  }, []);

  const emailsSent = campaigns.reduce((s, c) => s + (c.sent || 0), 0);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const CARDS = [
    { num: "01", cls: "lp-bento-card-wide", visual: <HpFunnelVisual contactCount={contactCount} emailsSent={emailsSent} campaigns={campaigns} />, title: "Your outreach at a glance",  desc: "Every contact you load, every email you send, every reply that lands — tracked in one place.",       onClick: () => setPage("dashboard") },
    { num: "02", cls: "lp-bento-card-tall", visual: <HpContactsVisual contactCount={contactCount} />,                                             title: "Lead database",              desc: "Import from CSV, sync Apollo, or add contacts one by one.",                                          onClick: () => setPage("contacts") },
    { num: "03", cls: "",                   visual: <HpStatusVisual gmailConnected={gmailConnected} />,                                            title: "Platform status",            desc: "Everything your outreach stack needs to run — checked and live.",                                    onClick: () => setPage("settings") },
    { num: "04", cls: "",                   visual: <HpCampaignSummaryVisual campaigns={campaigns} />,                                             title: "Campaigns",                  desc: "Track delivery rate across every cohort you've sent.",                                               onClick: () => setPage("campaignStatus") },
    { num: "05", cls: "lp-bento-card-wide", visual: <HpRecentCampaignsVisual campaigns={campaigns} />,                                            title: "Recent campaigns",           desc: "Your last runs — category, volume, and status at a glance.",                                        onClick: () => setPage("campaignStatus") },
    { num: "06", cls: "",                   visual: <HpSequenceVisual />,                                                                          title: "3-step follow-up",           desc: "Sequences stop the moment a reply is detected — no manual cleanup.",                                 onClick: () => setPage("emailSender") },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <section className="dash-home-hero">
        <div>
          <span className="dash-eyebrow">01 - Overview</span>
          <h1 className="dash-page-title" style={{ marginTop: 14 }}>
            {greeting}, <em>{firstName}</em>.
          </h1>
          <p className="dash-home-hero-copy">
            B2B outreach, leads, emails, sequences, and replies tracked in one calm workspace.
          </p>
        </div>
        <aside className="dash-home-hero-card" aria-label="Email activity summary">
          <span className="dash-eyebrow"><em>Today</em></span>
          <strong>{emailsSent.toLocaleString()}</strong>
          <span>emails sent from recent campaigns</span>
        </aside>
      </section>
      <div className="lp-bento">
        {CARDS.map(card => <HpBentoCard key={card.num} {...card} />)}
      </div>
    </div>
  );
}

/* ───────── DASHBOARD PAGE ───────── */
function DashboardPage({ user, contactCount, setPage }) {
  const c = useCms();
  const [campaigns, setCampaigns] = useState(() => { try { return JSON.parse(localStorage.getItem("thehotspot_campaigns") || "[]"); } catch { return []; } });

  useEffect(() => {
    const uid = encodeURIComponent(user?.username || user?.email || "");
    fetch(`/api/campaigns${uid ? `?userId=${uid}` : ""}`)
      .then(r => r.json())
      .then(data => {
        if (data.configured && data.campaigns?.length > 0) {
          setCampaigns(data.campaigns);
          localStorage.setItem("thehotspot_campaigns", JSON.stringify(data.campaigns));
        }
      })
      .catch(() => {});
  }, []);

  const emailsSent = campaigns.reduce((s, h) => s + (h.sent || 0), 0);
  const successRate = (() => { const s = campaigns.reduce((a, x) => a + (x.sent || 0), 0); const f = campaigns.reduce((a, x) => a + (x.failed || 0), 0); return s + f > 0 ? Math.round(s / (s + f) * 100) + "%" : "—"; })();
  const recentCampaigns = campaigns.slice(-3).reverse();

  const [statsRef, statsVisible] = useReveal(0.1);
  const [actRef, actVisible] = useReveal(0.1);

  const dateEyebrow = new Date().toLocaleDateString("en", { weekday: "long", day: "numeric", month: "long" }).toUpperCase();

  const revealStyle = (visible, delay = 0) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(36px)",
    transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
  });

  return (
    <>
      {/* Editorial header */}
      <header className="dash-page-head">
        <span className="dash-eyebrow">{dateEyebrow}</span>
        <h1 className="dash-page-title">Outreach <em>command center</em>.</h1>
        <p className="dash-page-stats">
          <strong>{emailsSent}</strong>&nbsp;emails sent
          <span className="sep">·</span>
          <strong>5</strong>&nbsp;categories
          <span className="sep">·</span>
          <strong>{successRate}</strong>&nbsp;delivery
        </p>
      </header>

      {/* Stat split — 60/40 asymmetric, mono numbers, one sparkline */}
      <section ref={statsRef} className="dash-stat-split" style={{ marginBottom: 20, ...revealStyle(statsVisible) }}>
        <button onClick={() => setPage("contacts")} className="dash-stat-hero" style={{ cursor: "pointer", textAlign: "left", font: "inherit" }}>
          <div className="dash-stat-hero-num">{(contactCount || user?.contactsCount || 0).toLocaleString()}</div>
          <div className="dash-sparkline" style={{ marginTop: 16, maxWidth: 200 }}>
            {[40, 52, 34, 61, 48, 72, 55, 80, 46, 68, 58, 90].map((h, j) => (
              <span key={j} className={h >= 80 ? "is-peak" : ""} style={{ height: `${h}%` }} />
            ))}
          </div>
          <span className="dash-stat-hero-label">contacts in database</span>
        </button>
        <div className="dash-stat-stack">
          {[
            { label: "Emails sent", value: emailsSent, page: "emailsSent" },
            { label: "Categories", value: 5, page: "categories" },
            { label: "Delivery rate", value: successRate, page: "successRate" },
          ].map(r => (
            <div key={r.label} className="dash-stat-row" onClick={() => setPage(r.page)} style={{ cursor: "pointer" }}>
              <span className="dash-stat-row-label">{r.label}</span>
              <span className="dash-stat-row-val">{r.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Bento — varied destinations, whole card clickable */}
      <section className="dash-bento" style={{ marginBottom: 20 }}>
        {[
          { id: "emailSender",    n: "01", cls: "wide", icon: <LuSend size={18} strokeWidth={1.5} />,          title: "Email Sender",    desc: "Bulk-send AI-generated campaigns to your whole list or one category." },
          { id: "emailTemplates", n: "02",              icon: <LuFilePen size={18} strokeWidth={1.5} />,       title: "Email Templates", desc: "Pick a template, enter a company, generate one targeted email." },
          { id: "contacts",       n: "03",              icon: <LuClipboardList size={18} strokeWidth={1.5} />, title: "Contacts DB",     desc: "Add, edit and import the contacts behind every campaign." },
          { id: "campaignStatus", n: "04",              icon: <LuRadio size={18} strokeWidth={1.5} />,         title: "Campaign Status", desc: "Watch active and completed campaigns update in real time." },
          { id: "categories",     n: "05",              icon: <LuFolder size={18} strokeWidth={1.5} />,        title: "Categories",      desc: "Browse contacts across Network, CPS, CPL, CPA and Mobile." },
          { id: "totalContacts",  n: "06",              icon: <LuUsers size={18} strokeWidth={1.5} />,         title: "Total Contacts",  desc: "A full overview of every contact and its current status." },
          { id: "emailsSent",     n: "07",              icon: <LuMail size={18} strokeWidth={1.5} />,          title: "Emails Sent",     desc: "The full history of delivered email, with dates and stats." },
          { id: "successRate",    n: "08",              icon: <LuTrendingUp size={18} strokeWidth={1.5} />,    title: "Success Rate",    desc: "Delivery, open and reply performance across campaigns." },
        ].map(card => (
          <button key={card.id} onClick={() => setPage(card.id)} className={`dash-bento-card${card.cls ? ` ${card.cls}` : ""}`}>
            <span className="dash-bento-num">{card.n}</span>
            {card.icon}
            <span className="dash-bento-title">{card.title}</span>
            <span className="dash-bento-desc">{card.desc}</span>
          </button>
        ))}
      </section>

      {/* AI Agents */}
      <div className="dash-card pad-lg" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16, marginBottom: 18 }}>
          <div>
            <span className="dash-eyebrow">Intelligence</span>
            <div className="dash-h2" style={{ marginTop: 4 }}>AI Agents</div>
          </div>
          <span style={{ fontSize: 12, color: "var(--text-faint)" }}>
            <span className="dash-num">12</span> autonomous agents
          </span>
        </div>
        <div className="rsp-agent-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
          {[
            { id: "lead-finder",            label: "Lead Finder",            tagline: "Discover B2B companies at scale",        Icon: LuSearch,       color: "#10b981" },
            { id: "lead-scoring",           label: "Lead Scoring",           tagline: "Qualify every prospect with AI",         Icon: LuTarget,       color: "#f59e0b" },
            { id: "email-sequence-builder", label: "Email Sequence Builder", tagline: "Multi-step outreach, crafted by AI",     Icon: LuMailbox,      color: "#0ea5e9" },
            { id: "ab-email-tester",        label: "A/B Email Tester",       tagline: "Pick the winner before you send",        Icon: LuFlaskConical, color: "#ec4899" },
            { id: "reply-detector",         label: "Reply Detector",         tagline: "Classify intent. Respond instantly.",    Icon: LuRadio,        color: "#14b8a6" },
            { id: "blog-generator",         label: "Blog Generator",         tagline: "SEO-ready content, on demand",           Icon: LuFilePen,      color: "#8b5cf6" },
            { id: "competitor-analyzer",    label: "Competitor Analyzer",    tagline: "Full SWOT. Clear positioning.",          Icon: LuChartBar,     color: "#f97316" },
            { id: "campaign-dashboard",     label: "Campaign Dashboard",     tagline: "Live metrics for every send",            Icon: LuTrendingUp,   color: "#6366f1" },
            { id: "landing-page-analyzer",  label: "Landing Page Analyzer",  tagline: "CRO audits in seconds",                 Icon: LuGlobe,        color: "#10b981" },
            { id: "backlink-outreach",      label: "Backlink Outreach",      tagline: "Find prospects. Write the email.",       Icon: LuLink,         color: "#0ea5e9" },
            { id: "crm-lite",               label: "CRM Lite",               tagline: "Your contacts, always in reach",         Icon: LuDatabase,     color: "#f59e0b" },
            { id: "csv-import-export",      label: "CSV Import / Export",    tagline: "Bulk contacts in, data out",             Icon: LuFolder,       color: "#64748B" },
          ].map(agent => (
            <a
              key={agent.id}
              href={`/agents/${agent.id}`}
              className="dash-card is-liftable"
              style={{ display: "flex", alignItems: "center", gap: 12, padding: 14, textDecoration: "none" }}
            >
              <div style={{ width: 34, height: 34, borderRadius: "var(--r)", background: "var(--bg-alt)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "var(--text-soft)" }}>
                <agent.Icon size={16} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text)", lineHeight: 1.3 }}>{agent.label}</div>
                <div style={{ fontSize: 10.5, color: "var(--text-faint)", marginTop: 2, lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{agent.tagline}</div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Recent campaigns */}
      {recentCampaigns.length > 0 && (
        <div ref={actRef} className="dash-card" style={{ ...revealStyle(actVisible, 0), marginBottom: 16 }}>
          <div className="dash-eyebrow" style={{ marginBottom: 14 }}>Recent Campaigns</div>
          <div>
            {recentCampaigns.map((c, i) => {
              const state = c.cancelled ? "red" : c.failed > 0 ? "amber" : "green";
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "11px 0", borderBottom: i < recentCampaigns.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span className={`dash-dot is-${state}`} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
                        {c.category || "All"} · <span className="dash-num">{c.sent || 0}</span> sent{c.failed ? <>, <span className="dash-num">{c.failed}</span> failed</> : ""}
                      </div>
                      <div className="dash-num" style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 2 }}>{c.date ? new Date(c.date).toLocaleDateString("en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}</div>
                    </div>
                  </div>
                  <span className={`dash-chip is-${state}`}>
                    {c.cancelled ? "Cancelled" : c.failed > 0 ? "Partial" : "Delivered"}
                  </span>
                </div>
              );
            })}
          </div>
          <button onClick={() => setPage("emailsSent")} style={{ marginTop: 12, background: "none", border: "none", color: "var(--teal)", fontSize: 12, fontWeight: 600, cursor: "pointer", padding: 0 }}>
            View all campaigns →
          </button>
        </div>
      )}

      {/* Settings link */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={() => setPage("settings")} style={{ background: "none", border: "none", color: "var(--text-soft)", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, padding: "6px 0" }}>
          <LuSettings size={14} /> Settings &amp; Account
        </button>
      </div>
    </>
  );
}

/* ───────── PET ASSISTANT ───────── */
/* ───────── PIXEL PET (Tamagotchi-style) ───────── */
// Pixel art color palette
const _X = null;          // transparent
const _B = '#FF7043';     // body orange/salmon
const _D = '#1A1A1A';     // dark square eyes
const _F = '#BF360C';     // feet (darker orange)
const _M = '#B71C1C';     // mouth red
const _H = '#FFAB91';     // highlight
const _S = '#90A4AE';     // laptop silver
const _K = '#546E7A';     // keyboard keys
const _G = '#00BCD4';     // screen glow cyan

const PP_SC = 6; // scale: 6px per pixel → 10×10 grid = 60×60px

// Sprite frames — 10 wide × 10 tall = 60×60px total
// rows 0-1: ears | rows 2-7: square body | rows 8-9: legs
const PP_HEAD = [
  [_B,_B,_X,_X,_X,_X,_X,_X,_B,_B], // ears top
  [_B,_B,_B,_B,_B,_B,_B,_B,_B,_B], // ears base + body top (square)
  [_B,_B,_B,_B,_B,_B,_B,_B,_B,_B],
  [_B,_B,_D,_D,_B,_B,_D,_D,_B,_B], // eyes open row A
  [_B,_B,_D,_D,_B,_B,_D,_D,_B,_B], // eyes open row B
  [_B,_B,_B,_B,_B,_B,_B,_B,_B,_B],
  [_B,_B,_X,_M,_M,_M,_M,_X,_B,_B], // mouth neutral
  [_B,_B,_B,_B,_B,_B,_B,_B,_B,_B], // body bottom (square)
];
const PP_EYE_CLOSED = [
  [_B,_B,_M,_M,_B,_B,_M,_M,_B,_B],
  [_B,_B,_B,_B,_B,_B,_B,_B,_B,_B],
];
const PP_MOUTH_HAPPY = [_B,_M,_M,_M,_M,_M,_M,_M,_M,_B];
const PP_BLUSH_L = [_H,_H,_X,_X,_X,_X,_X,_X,_H,_H]; // cheek blush on body sides
const PP_BLUSH_R = [_H,_H,_X,_X,_X,_X,_X,_X,_H,_H];
const PP_LEGS_STAND = [
  [_X,_X,_X,_B,_X,_X,_B,_X,_X,_X],
  [_X,_X,_X,_F,_X,_X,_F,_X,_X,_X],
];
const PP_LEGS_A = [   // left foot forward
  [_X,_X,_B,_B,_X,_X,_X,_B,_X,_X],
  [_X,_X,_F,_X,_X,_X,_X,_F,_X,_X],
];
const PP_LEGS_B = [   // right foot forward
  [_X,_X,_B,_X,_X,_X,_B,_B,_X,_X],
  [_X,_X,_F,_X,_X,_X,_X,_F,_X,_X],
];
const PP_LEGS_JUMP = [
  [_X,_B,_X,_X,_X,_X,_X,_X,_B,_X],
  [_X,_X,_B,_X,_X,_X,_X,_B,_X,_X],
];
// Laptop animation sprites (replaces legs rows when typing)
const PP_EYES_GLOW  = [
  [_B,_B,_G,_G,_B,_B,_G,_G,_B,_B],
  [_B,_B,_G,_G,_B,_B,_G,_G,_B,_B],
];
const PP_PAWS_UP    = [_B,_X,_B,_X,_X,_X,_X,_B,_X,_B]; // arms raised
const PP_PAWS_TAP_A = [_X,_X,_X,_B,_B,_B,_X,_B,_X,_X]; // paws toward keyboard area
const PP_PAWS_TAP_B = [_X,_X,_B,_B,_B,_X,_B,_B,_X,_X]; // alternate tap frame
// Sideways laptop: screen (2×2 block, cols 0-1) | gap | keyboard (5-wide, cols 4-8)
// Looks like an open laptop rotated 90° — screen and keyboard are separate visible faces
const PP_LAPTOP_SIDE = [
  [_S,_G,_X,_X,_S,_S,_S,_S,_S,_X], // screen frame+glow | gap | keyboard top
  [_S,_S,_X,_X,_S,_K,_K,_K,_S,_X], // screen base       | gap | keys
];

function ppDraw(ctx, rows, yOff, flipX, canvasW) {
  rows.forEach((row, ry) => {
    row.forEach((color, rx) => {
      if (!color) return;
      const px = flipX ? canvasW - (rx + 1) * PP_SC : rx * PP_SC;
      ctx.fillStyle = color;
      ctx.fillRect(px, yOff + ry * PP_SC, PP_SC, PP_SC);
    });
  });
}

const PET_SEED = [
  { role: "user", content: "You are Spot — a friendly AI assistant that lives on the thehotspot dashboard. Keep answers short (2-3 sentences), warm and casual. Help the user understand and use this B2B outreach platform. If asked about features, mention: contacts, campaigns, email templates, 12 AI agents, Gmail integration." },
  { role: "assistant", content: "Hi, I'm Spot. Ask me anything about thehotspot — campaigns, contacts, agents, you name it." },
];

function PixelPet() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const rafRef = useRef(null);
  const messagesEndRef = useRef(null);

  // drag refs
  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const dragMovedRef = useRef(0);
  const landPetRef = useRef(null); // stable land callback called from RAF

  // chat + smoke state
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([PET_SEED[1]]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [smoke, setSmoke] = useState(null); // { x, y } landing puff position
  // 'right' = pet on right half → panel floats to the left; 'left' = panel floats to the right
  const [panelSide, setPanelSide] = useState('right');

  const pet = useRef({
    x: window.innerWidth - 90,
    y: window.innerHeight - 80,
    vy: 0,
    groundY: window.innerHeight - 80,
    state: 'idle',    // idle | happy | typing | falling
    time: 0,
    lastTs: 0,
    blinking: false,
    blinkStart: 0,
    nextBlink: 4000,
    legFrame: 0,
    happyTimer: 0,
    breathPhase: 0,
    facingLeft: false,
    sparkles: [],
    nextTyping: 15000 + Math.random() * 5000, // 15-20s until laptop appears
    typingTimer: 0,
    typingDuration: 2000, // set fresh each time
    lastDrag: 0,           // Date.now() of last drag — for 10s return-home
  });

  const CW = 10 * PP_SC; // 60px
  const CH = 10 * PP_SC; // 60px
  const openRef = useRef(false);

  // ── draw ──────────────────────────────────────────────────
  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const p = pet.current;
    ctx.clearRect(0, 0, CW, CH);
    const fl = p.facingLeft;

    const head = PP_HEAD.map(r => r.slice());
    if (p.blinking) { head[3] = PP_EYE_CLOSED[0]; head[4] = PP_EYE_CLOSED[1]; }
    if (p.state === 'happy') head[6] = PP_MOUTH_HAPPY;

    // typing: glowing eyes + paws on keyboard
    const isTyping = p.state === 'typing';
    if (isTyping && !p.blinking) {
      head[3] = PP_EYES_GLOW[0];
      head[4] = PP_EYES_GLOW[1];
      head[6] = PP_MOUTH_HAPPY;
      const OPEN_MS = 250;
      const activeTyping = p.typingTimer > OPEN_MS && p.typingTimer < p.typingDuration - OPEN_MS;
      head[7] = activeTyping
        ? (Math.floor(p.time / 120) % 2 === 0 ? PP_PAWS_TAP_A : PP_PAWS_TAP_B)
        : PP_PAWS_UP;
    }

    const breathY = Math.round(Math.sin(p.breathPhase) * 1);
    ppDraw(ctx, head, breathY, fl, CW);

    if (p.state === 'happy') {
      ppDraw(ctx, [PP_BLUSH_L], 4 * PP_SC + breathY, fl, CW);
      ppDraw(ctx, [PP_BLUSH_R], 4 * PP_SC + breathY, fl, CW);
    }

    if (isTyping) {
      ppDraw(ctx, PP_LAPTOP_SIDE, 8 * PP_SC + breathY, fl, CW);
    } else {
      let legs;
      if (p.state === 'falling') legs = PP_LEGS_JUMP;
      else if (p.state === 'happy') legs = p.legFrame % 2 === 0 ? PP_LEGS_A : PP_LEGS_B;
      else legs = PP_LEGS_STAND;
      ppDraw(ctx, legs, 8 * PP_SC + breathY, fl, CW);
    }

    p.sparkles.forEach(sp => {
      const alpha = Math.max(0, 1 - sp.age / 40);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#FFD54F';
      ctx.fillRect(sp.x, sp.y, 3, 3);
      ctx.globalAlpha = 1;
    });
  }

  // ── update ────────────────────────────────────────────────
  function update(ts) {
    const p = pet.current;
    const dt = p.lastTs ? Math.min(ts - p.lastTs, 50) : 16;
    p.lastTs = ts;
    p.time += dt;
    p.breathPhase += dt * 0.0018;

    if (!p.blinking && p.time > p.nextBlink) {
      p.blinking = true;
      p.blinkStart = p.time;
      p.nextBlink = p.time + 3000 + Math.random() * 3000;
    }
    if (p.blinking && p.time - p.blinkStart > 150) p.blinking = false;

    p.sparkles = p.sparkles.map(s => ({ ...s, age: s.age + 1 })).filter(s => s.age < 40);

    if (p.state === 'idle') {
      // laptop trigger
      p.nextTyping -= dt;
      if (p.nextTyping <= 0 && !openRef.current) {
        p.state = 'typing';
        p.typingTimer = 0;
        p.typingDuration = 1800 + Math.random() * 800;
        p.nextTyping = 15000 + Math.random() * 5000;
        p.facingLeft = false;
      }
      // return to bottom-right after 10s of no drag
      if (!isDraggingRef.current && !openRef.current && p.lastDrag > 0) {
        const away = Date.now() - p.lastDrag;
        if (away > 10000) {
          const tx = window.innerWidth - 90;
          const ty = window.innerHeight - 80;
          const dx = tx - p.x;
          const dy = ty - p.y;
          if (Math.hypot(dx, dy) > 2) {
            p.x += dx * 0.04;
            p.y += dy * 0.04;
            p.groundY = p.y;
          } else {
            p.x = tx; p.y = ty; p.groundY = ty;
            p.lastDrag = 0;
          }
        }
      }
    } else if (p.state === 'happy') {
      p.happyTimer -= dt;
      p.y = p.groundY + Math.sin(p.time * 0.016) * 8;
      p.legFrame = Math.floor(p.time / 130) % 2;
      if (Math.random() < 0.18) p.sparkles.push({ x: Math.random() * CW, y: Math.random() * CH * 0.7, age: 0 });
      if (p.happyTimer <= 0) { p.y = p.groundY; p.state = 'idle'; }
    } else if (p.state === 'typing') {
      p.typingTimer += dt;
      if (p.typingTimer >= p.typingDuration) p.state = 'idle';
    } else if (p.state === 'falling') {
      p.vy = Math.min(p.vy + 0.9, 22); // gravity
      p.y += p.vy;
      const feetY = p.y + CH;
      const cx = p.x + CW / 2;
      let landed = false;
      // check viewport floor
      if (feetY >= window.innerHeight - 4) {
        p.y = window.innerHeight - CH - 4;
        landed = true;
      } else {
        // check DOM surfaces below feet — only land on elements whose top
        // is genuinely below the pet (avoids full-page containers starting at y=0)
        try {
          const hits = document.elementsFromPoint(cx, feetY + 4);
          const surface = hits.find(el =>
            containerRef.current && !containerRef.current.contains(el) &&
            el.tagName !== 'HTML' && el.tagName !== 'BODY'
          );
          if (surface) {
            const r = surface.getBoundingClientRect();
            // r.top must be below the pet's current top (genuine surface, not background)
            // and feet must have reached or passed that top edge
            if (r.top > p.y + CH * 0.5 && r.top <= feetY + 4) {
              p.y = r.top - CH;
              landed = true;
            }
          }
        } catch (_) { /* elementsFromPoint unavailable */ }
      }
      if (landed) {
        p.vy = 0;
        p.groundY = p.y;
        p.state = 'idle';
        if (landPetRef.current) landPetRef.current(cx, p.y + CH);
      }
    }

    const ctr = containerRef.current;
    if (ctr) {
      ctr.style.left = Math.round(p.x) + 'px';
      ctr.style.top = Math.round(p.y) + 'px';
    }
  }

  // keep landPetRef current every render so the RAF closure always calls the latest version
  landPetRef.current = (x, y) => {
    setSmoke({ x, y });
    setTimeout(() => setSmoke(null), 900);
    const p = pet.current;
    p.state = 'happy';
    p.happyTimer = 500;
    p.groundY = p.y;
  };

  // ── RAF loop ──────────────────────────────────────────────
  useEffect(() => {
    const loop = (ts) => { update(ts); draw(); rafRef.current = requestAnimationFrame(loop); };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── drag (window-level so mouse can move freely) ──────────
  useEffect(() => {
    const onMouseMove = (e) => {
      if (!isDraggingRef.current) return;
      dragMovedRef.current += Math.hypot(e.movementX, e.movementY);
      const p = pet.current;
      p.x = Math.max(8, Math.min(window.innerWidth - CW - 8, e.clientX - dragOffsetRef.current.x));
      p.y = Math.max(8, Math.min(window.innerHeight - CH - 8, e.clientY - dragOffsetRef.current.y));
      p.groundY = p.y;
      const ctr = containerRef.current;
      if (ctr) { ctr.style.left = Math.round(p.x) + 'px'; ctr.style.top = Math.round(p.y) + 'px'; }
    };

    const onMouseUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      const p = pet.current;
      p.lastDrag = Date.now();

      if (dragMovedRef.current < 5) {
        // treat as click → toggle chat
        if (p.state !== 'falling') {
          const nextOpen = !openRef.current;
          openRef.current = nextOpen;
          setOpen(nextOpen);
          if (nextOpen) { p.groundY = p.y; p.state = 'happy'; p.happyTimer = 1200; p.facingLeft = false; p.nextTyping = 15000 + Math.random() * 5000; }
        }
      } else {
        // drag release → fall with gravity onto whatever is below
        p.vy = 0;
        p.state = 'falling';
      }
      setPanelSide(p.x > window.innerWidth / 2 ? 'right' : 'left');
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => { window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── auto-scroll chat to bottom ───────────────────────────
  useEffect(() => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── send message ──────────────────────────────────────────
  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...PET_SEED, ...messages, userMsg] }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || data.message || 'Sorry, I could not reach the server.';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error — try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const panelPos = panelSide === 'right' ? { right: 0 } : { left: 0 };

  return (
    <div
      ref={containerRef}
      style={{ position: 'fixed', left: pet.current.x, top: pet.current.y, zIndex: 9500 }}
    >
      {/* chat panel — above pet, left or right anchored based on screen position */}
      {open && (
        <div className="rsp-pet-panel" style={{
          position: 'absolute',
          bottom: CH + 10,
          ...panelPos,
          width: 300,
          background: 'var(--bg-alt)',
          border: '1px solid var(--border-strong)',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'chatSlide .18s ease',
        }}>
          {/* header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
            <canvas
              width={CW} height={CH}
              style={{ width: 24, height: 24, imageRendering: 'pixelated', flexShrink: 0 }}
              ref={el => { if (el) { const ctx = el.getContext('2d'); ctx.clearRect(0,0,CW,CH); ppDraw(ctx, PP_HEAD, 0, false, CW); } }}
            />
            <span style={{ flex: 1, fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 13, color: '#f1f5f9' }}>Spot</span>
            <span style={{ fontSize: 11, color: '#10b981', background: '#10b98118', borderRadius: 20, padding: '2px 8px', fontFamily: "'DM Sans',sans-serif" }}>online</span>
            <button onClick={(e) => { e.stopPropagation(); openRef.current = false; setOpen(false); }} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center' }}>
              <LuX size={14} />
            </button>
          </div>

          {/* messages */}
          <div style={{ padding: '12px 12px 8px', overflowY: 'auto', maxHeight: 260, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '82%', padding: '7px 11px',
                  borderRadius: m.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                  background: m.role === 'user' ? 'var(--teal)' : 'var(--bg-alt)',
                  color: m.role === 'user' ? '#fff' : '#cbd5e1',
                  fontSize: 12.5, lineHeight: 1.5, fontFamily: "'DM Sans',sans-serif",
                }}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ padding: '7px 14px', borderRadius: '12px 12px 12px 2px', background: 'var(--bg-alt)', color: 'var(--text-soft)', fontSize: 12.5, fontFamily: "'DM Sans',sans-serif" }}>...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* input */}
          <div style={{ display: 'flex', gap: 6, padding: '8px 10px 10px', borderTop: '1px solid var(--border)', background: 'var(--bg)' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Ask Spot anything..."
              style={{ flex: 1, background: 'var(--bg-alt)', border: '1px solid var(--border)', borderRadius: 10, padding: '7px 11px', color: '#f1f5f9', fontSize: 12.5, fontFamily: "'DM Sans',sans-serif", outline: 'none' }}
            />
            <button onClick={sendMessage} disabled={!input.trim() || loading} style={{ background: '#10b981', border: 'none', borderRadius: 10, padding: '7px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', opacity: (!input.trim() || loading) ? 0.4 : 1 }}>
              <LuSend size={13} color="#fff" />
            </button>
          </div>
        </div>
      )}

      {/* pet canvas */}
      <canvas
        ref={canvasRef}
        width={CW}
        height={CH}
        onMouseDown={(e) => {
          e.preventDefault();
          isDraggingRef.current = true;
          dragMovedRef.current = 0;
          dragOffsetRef.current = { x: e.clientX - pet.current.x, y: e.clientY - pet.current.y };
        }}
        title="Drag to move · Click to chat"
        style={{ cursor: 'grab', imageRendering: 'pixelated', filter: 'drop-shadow(0 4px 12px rgba(255,112,67,0.35))', display: 'block', userSelect: 'none' }}
      />

      {/* smoke landing puff — fixed relative to screen, not container */}
      {smoke && (
        <div style={{ position: 'fixed', left: smoke.x, top: smoke.y, transform: 'translate(-50%,-100%)', zIndex: 9499, pointerEvents: 'none' }}>
          {[0,1,2,3,4].map(i => (
            <div key={i} style={{
              position: 'absolute',
              width: 10 + i,
              height: 10 + i,
              borderRadius: '50%',
              background: `rgba(190,190,190,${0.65 - i * 0.08})`,
              left: (i - 2) * 13,
              top: 0,
              animation: `smokeCloud 0.85s ease-out ${i * 50}ms forwards`,
            }} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ───────── MAIN APP ───────── */
export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("thehotspot_user")); } catch { return null; }
  });

  const handleLogin = (userData) => {
    window.history.replaceState({}, "", "/");
    setUser(userData);
  };

  if (!user) return <AppErrorBoundary><LoginPage onLogin={handleLogin} /></AppErrorBoundary>;

  return (
    <AppErrorBoundary>
      <Dashboard user={user} onLogout={() => { localStorage.removeItem("thehotspot_user"); setUser(null); }} onUserUpdate={(updated) => { setUser(updated); localStorage.setItem("thehotspot_user", JSON.stringify(updated)); }} />
    </AppErrorBoundary>
  );
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

  const T = { bg: "var(--bg)", card: "var(--bg)", bd: "var(--border-strong)", bdL: "var(--border)", tx: "var(--text)", tx2: "#94A3B8", tx3: "#64748B", ac: "#6366f1", acBg: "#6366f120", acL: "#6366f130", gn: "#059669", gnBg: "#05966920", rd: "#DC2626", rdBg: "#DC262620", bl: "#38bdf8", amber: "#D97706", amberBg: "#D9770620", hd: "var(--bg-alt)", hv: "var(--bg-hover)", sh: "0 1px 2px rgba(15,23,42,0.05)" };

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
          <div className="dash-empty">
            <div className="dash-empty-title">No databases yet</div>
            <div className="dash-empty-text">Create your first database to start organizing contacts.</div>
            <button onClick={() => setShowNewDb(true)} className="dash-btn dash-btn-primary dash-btn-sm">Create database</button>
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
                      {col.type === "email" ? "✉" : col.type === "url" ? <LuLink size={11} /> : col.type === "number" ? "#" : col.type === "select" ? "☰" : "Aa"}
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
                      <td key={col.id} style={{ padding: 0, borderBottom: cellBd, borderRight: cellBd, minWidth: 150, maxWidth: 300, position: "relative", background: editing ? "#6366f120" : "transparent" }}
                        onClick={() => { if (!editing) { setActiveCell(key); setCellValue(val); } }}>
                        {editing ? (
                          col.type === "select" ? (
                            <select ref={cellRef} value={cellValue} onChange={e => { setCell(realIdx, col.id, e.target.value); setActiveCell(null); }}
                              onBlur={() => setActiveCell(null)}
                              onKeyDown={e => { if (e.key === "Escape") setActiveCell(null); if (e.key === "Tab") { e.preventDefault(); setCell(realIdx, col.id, cellValue); navigate(realIdx, ci, e.shiftKey ? "left" : "right"); } }}
                              style={{ width: "100%", height: "100%", padding: "7px 10px", border: `2px solid ${T.ac}`, borderRadius: 0, fontSize: 13, outline: "none", fontFamily: "inherit", color: T.tx, background: T.card, boxSizing: "border-box" }}>
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
                              style={{ width: "100%", padding: "7px 10px", border: `2px solid ${T.ac}`, borderRadius: 0, fontSize: 13, outline: "none", fontFamily: "inherit", color: T.tx, background: T.card, boxSizing: "border-box" }}
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
  const c = useCms();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("hub");
  const [sheetUrl, setSheetUrl] = useState(localStorage.getItem("thehotspot_sheet_url") || "");
  const [connected, setConnected] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [emailStats, setEmailStats] = useState({ total: 0, withEmail: 0, withoutEmail: 0 });
  const [sheetName, setSheetName] = useState(localStorage.getItem("thehotspot_sheet_name") || "");
  // Always start at hub — never auto-redirect to table view

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


  const categories = ["All", ...new Set(contacts.map(c => c.category).filter(Boolean))];
  const filtered = contacts.filter(c => {
    const matchSearch = !search || [c.company_name, c.email, c.country].some(v => (v || "").toLowerCase().includes(search.toLowerCase()));
    return matchSearch && (filterCat === "All" || c.category === filterCat);
  });

  // ─── HUB VIEW ───
  if (view === "hub") return (
    <div>
      <BackButton onClick={onBack} />
      <header className="dash-page-head">
        <span className="dash-eyebrow">02 — Contacts</span>
        <h1 className="dash-page-title">{c("cp_title", "Contacts Database")}</h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)", maxWidth: 520 }}>
          {c("cp_subtitle", "Connect an existing data source or build your list from scratch.")}
        </p>
      </header>
      <section className="dash-action-grid">
        <article className="dash-card pad-lg" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <LuLink size={18} strokeWidth={1.5} style={{ color: "var(--text-soft)" }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--text)", margin: 0 }}>{c("cp_card1_title", "Connect Data Source")}</h3>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-soft)", lineHeight: 1.55, margin: 0, flex: 1 }}>
            {c("cp_card1_desc", "Import contacts from tools you already use.")}
          </p>
          <ul className="dash-action-list">
            <li onClick={() => setView("connect_sheets")}>→&nbsp;&nbsp;Google Sheets</li>
            <li onClick={() => setView("connect_sheets")}>→&nbsp;&nbsp;Airtable</li>
            <li onClick={() => setView("connect_sheets")}>→&nbsp;&nbsp;CSV upload</li>
          </ul>
          <button className="dash-btn dash-btn-primary" style={{ width: "100%" }} onClick={() => setView("connect_sheets")}>Connect →</button>
        </article>
        <article className="dash-card pad-lg" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <LuDatabase size={18} strokeWidth={1.5} style={{ color: "var(--text-soft)" }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--text)", margin: 0 }}>{c("cp_card2_title", "Create New Database")}</h3>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-soft)", lineHeight: 1.55, margin: 0, flex: 1 }}>
            {c("cp_card2_desc", "Start fresh with full control over your schema.")}
          </p>
          <ul className="dash-action-list">
            <li onClick={() => setView("create_db")}>→&nbsp;&nbsp;Custom fields</li>
            <li onClick={() => setView("create_db")}>→&nbsp;&nbsp;Manual entry</li>
            <li onClick={() => setView("create_db")}>→&nbsp;&nbsp;Full control</li>
          </ul>
          <button className="dash-btn dash-btn-outline" style={{ width: "100%" }} onClick={() => setView("create_db")}>Start fresh</button>
        </article>
      </section>
    </div>
  );

  // ─── CREATE DATABASE VIEW ───
  if (view === "create_db") return <CreateDatabasePage onBack={() => setView("hub")} showToast={showToast} />;

  // ─── CONNECT SOURCES VIEW ───
  if (view === "connect_sheets") return (
    <div>
      <div onClick={() => setView("hub")} style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748B", cursor: "pointer", fontSize: 13, fontWeight: 500, marginBottom: 24 }}>← Back to Data Sources</div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-soft)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text)" }}>Connect Data Source</div>
          <div style={{ fontSize: 13, color: "#64748B" }}>Choose where your contact data lives</div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ background: "var(--bg)", border: "1px solid #10b98133", borderRadius: 14, padding: "20px", boxShadow: "0 1px 4px rgba(15,23,42,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--text-soft)" style={{ flexShrink: 0 }}><path d="M19.5 3h-15A1.5 1.5 0 003 4.5v15A1.5 1.5 0 004.5 21h15a1.5 1.5 0 001.5-1.5v-15A1.5 1.5 0 0019.5 3zM9 17H6v-3h3v3zm0-5H6V9h3v3zm5 5h-3v-3h3v3zm0-5h-3V9h3v3zm5 5h-3v-3h3v3zm0-5h-3V9h3v3z" /></svg>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)" }}>Google Sheets</div>
              <div style={{ fontSize: 12, color: "#64748B" }}>Paste your sheet URL to import all rows</div>
            </div>
            <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 8, background: "#ECFDF5", color: "#059669", fontWeight: 500, border: "1px solid #10b98133" }}>Available</span>
          </div>
          <div className="rsp-sheet-row" style={{ display: "flex", gap: 10 }}>
            <input type="text" value={sheetUrl} onChange={e => setSheetUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/..."
              style={{ flex: 1, padding: "11px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-alt)", color: "var(--text)", fontSize: 13, outline: "none", fontFamily: "'DM Sans',sans-serif", boxSizing: "border-box" }}
              onFocus={e => e.target.style.borderColor = "#10b981"} onBlur={e => e.target.style.borderColor = "var(--border)"} />
            <button onClick={connectSheet} disabled={loading || !sheetUrl} style={{
              padding: "11px 24px", borderRadius: 10, border: "none", cursor: (loading || !sheetUrl) ? "default" : "pointer",
              background: sheetUrl ? "var(--teal)" : "var(--bg-hover)",
              color: sheetUrl ? "#fff" : "var(--text-faint)", fontSize: 13, fontWeight: 600, fontFamily: "var(--font-sans)", whiteSpace: "nowrap",
            }}>{loading ? "Connecting..." : "Connect"}</button>
          </div>
          <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 10, lineHeight: 1.6 }}>Auto-maps columns: Affiliate → Company, Mail ID → Email, CountryName → Country, Category → Category.</div>
        </div>
        {[
          { name: "Airtable", desc: "Connect an Airtable base to sync contacts", color: "#2563eb", icon: '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="9" x2="9" y2="21"/>' },
          { name: "CSV / XLSX Upload", desc: "Upload a spreadsheet file directly", color: "#8b5cf6", icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>' },
          { name: "Slack", desc: "Import contacts from Slack workspace", color: "#e01155", icon: '<path d="M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5z"/>' },
        ].map(src => (
          <div key={src.name} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px", opacity: .5, boxShadow: "0 1px 4px rgba(15,23,42,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-soft)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }} dangerouslySetInnerHTML={{ __html: src.icon }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)" }}>{src.name}</div>
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
      <div className="rsp-sheet-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "#10b98118", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#0d9668"><path d="M19.5 3h-15A1.5 1.5 0 003 4.5v15A1.5 1.5 0 004.5 21h15a1.5 1.5 0 001.5-1.5v-15A1.5 1.5 0 0019.5 3zM9 17H6v-3h3v3zm0-5H6V9h3v3zm5 5h-3v-3h3v3zm0-5h-3V9h3v3zm5 5h-3v-3h3v3zm0-5h-3V9h3v3z" /></svg>
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>{sheetName || "Google Sheet"}</div>
            <div style={{ fontSize: 12, color: "#64748B" }}>Google Sheets · {contacts.length} contacts · <span style={{ color: "#10b981" }}>Connected</span></div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={connectSheet} disabled={loading} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "#64748B", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
            {loading ? "Syncing..." : "↻ Sync"}
          </button>
          <button onClick={disconnectSheet} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #EF444433", background: "#FEF2F2", color: "#EF4444", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>Disconnect</button>
        </div>
      </div>
      <div className="rsp-contact-stats" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 20 }}>
        {[{ n: emailStats.total, l: "Total Companies", c: "#10b981" }, { n: emailStats.withEmail, l: "With Email", c: "#4ade80" }, { n: emailStats.withoutEmail, l: "Missing Email", c: "#f87171" }].map(s => (
          <div key={s.l} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 12, padding: "14px", textAlign: "center", boxShadow: "0 1px 4px rgba(15,23,42,0.05)" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-mono)" }}>{s.n}</div>
            <div style={{ fontSize: 11, color: "var(--text-soft)" }}>{s.l}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search companies..."
          style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-alt)", color: "var(--text)", fontSize: 13, outline: "none", fontFamily: "'DM Sans',sans-serif", boxSizing: "border-box" }} />
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-alt)", color: "var(--text)", fontSize: 13, outline: "none", fontFamily: "'DM Sans',sans-serif" }}>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div style={{ fontSize: 12, color: "#64748B", marginBottom: 8 }}>Showing {filtered.length} of {contacts.length}</div>
      <div style={{ overflowX: "auto" }}>
        <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 4px rgba(15,23,42,0.05)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 750 }}>
            <thead><tr style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-alt)" }}>
              {["#", "Company", "Website", "Email", "Category", "Country"].map(h => (
                <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#64748B", letterSpacing: .5, textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.slice(0, 100).map((c, i) => (
                <tr key={c.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "10px 14px", fontSize: 11, color: "#94A3B8" }}>{i + 1}</td>
                  <td style={{ padding: "10px 14px", fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{c.company_name}</td>
                  <td style={{ padding: "10px 14px" }}>{c.website ? <a href={c.website.startsWith("http") ? c.website : "https://" + c.website} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#0ea5e9", textDecoration: "none" }}>↗ Visit</a> : <span style={{ fontSize: 11, color: "#94A3B8" }}>—</span>}</td>
                  <td style={{ padding: "10px 14px", fontSize: 12, fontFamily: "'JetBrains Mono',monospace", color: c.email ? "#64748B" : "#EF444488" }}>{c.email || "⚠ Missing"}</td>
                  <td style={{ padding: "10px 14px" }}>{c.category ? <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: CAT[c.category]?.bg || "#EFF1F8", color: CAT[c.category]?.text || "#64748B", padding: "3px 10px", borderRadius: 16, fontSize: 11, fontWeight: 600 }}><span style={{ width: 5, height: 5, borderRadius: "50%", background: CAT[c.category]?.dot || "#94A3B8" }} />{c.category}</span> : <span style={{ fontSize: 11, color: "#94A3B8" }}>—</span>}</td>
                  <td style={{ padding: "10px 14px", fontSize: 12, color: "#64748B" }}>{c.country || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length > 100 && <div style={{ padding: "12px", textAlign: "center", fontSize: 12, color: "#64748B", borderTop: "1px solid var(--border)" }}>Showing first 100 of {filtered.length}</div>}
        </div>
      </div>
    </div>
  );
}

/* ───────── CAMPAIGN STATUS PAGE ───────── */
function CampaignStatusPage({ onBack, user }) {
  const c = useCms();
  const [now, setNow] = useState(() => Date.now());
  const [openEmail, setOpenEmail] = useState(null); // { company, email, subject, body, sentAt, category }

  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem("thehotspot_campaigns") || "[]"); } catch { return []; }
  });

  // Refresh the "X minutes ago" timestamps every minute
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const uid = encodeURIComponent(user?.username || user?.email || "");
    fetch(`/api/campaigns${uid ? `?userId=${uid}` : ""}`)
      .then(r => r.json())
      .then(data => {
        if (data.configured && data.campaigns?.length > 0) {
          setHistory(data.campaigns);
          localStorage.setItem("thehotspot_campaigns", JSON.stringify(data.campaigns));
        }
      })
      .catch(() => {});
  }, []);

  const cutoff24h = now - 24 * 60 * 60 * 1000;
  const last24    = useMemo(() => history.filter(h => new Date(h.date).getTime() >= cutoff24h), [history, cutoff24h]);
  const older     = useMemo(() => history.filter(h => new Date(h.date).getTime() <  cutoff24h), [history, cutoff24h]);

  const sent24    = useMemo(() => last24.reduce((s, h) => s + (h.sent   || 0), 0), [last24]);
  const failed24  = useMemo(() => last24.reduce((s, h) => s + (h.failed || 0), 0), [last24]);
  const totalSent = useMemo(() => history.reduce((s, h) => s + (h.sent  || 0), 0), [history]);

  // All individual emails sent in last 24h, flattened and sorted newest first
  const emails24 = useMemo(() => {
    const list = [];
    last24.forEach(h => {
      (h.contacts || []).forEach(c => {
        list.push({ ...c, campaignDate: h.date, category: h.category, failed: false });
      });
      // if failed contacts were tracked separately — currently they aren't, so just show count
    });
    list.sort((a, b) => new Date(b.campaignDate) - new Date(a.campaignDate));
    return list;
  }, [last24]);

  const timeAgo = (dateStr) => {
    const diff = now - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)  return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs}h ago`;
    return new Date(dateStr).toLocaleDateString("en", { day: "numeric", month: "short" });
  };

  const deliveryRate = sent24 + failed24 > 0 ? Math.round(sent24 / (sent24 + failed24) * 100) : 0;

  return (
    <div>
      <BackButton onClick={onBack} />

      {/* Editorial header — inline mono stats, no stat cards */}
      <header className="dash-page-head">
        <span className="dash-eyebrow">01 — Campaigns</span>
        <h1 className="dash-page-title">Campaign <em>status</em></h1>
        <p className="dash-page-stats">
          <span className="dash-dot is-green" /><strong>{sent24}</strong>&nbsp;sent&nbsp;(24h)
          <span className="sep">·</span>
          <span className="dash-dot is-red" /><strong>{failed24}</strong>&nbsp;failed
          <span className="sep">·</span>
          <strong>{totalSent}</strong>&nbsp;all time
        </p>
      </header>

      {/* Delivery rate — slim strip, only when there was activity */}
      {(sent24 + failed24) > 0 && (
        <div style={{ border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "14px 18px", marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Delivery rate <span style={{ color: "var(--text-faint)" }}>· 24h</span></span>
            <span className="dash-num" style={{ fontSize: 14, fontWeight: 700, color: deliveryRate === 0 ? "var(--text)" : deliveryRate >= 80 ? "var(--green)" : deliveryRate >= 50 ? "var(--amber)" : "var(--red)" }}>{deliveryRate}%</span>
          </div>
          <div style={{ height: 6, background: "var(--bg-section)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ width: `${deliveryRate}%`, height: "100%", background: deliveryRate >= 80 ? "var(--teal)" : deliveryRate >= 50 ? "var(--amber)" : "var(--red)", borderRadius: 3, transition: "width .6s ease" }} />
          </div>
          <div className="dash-num" style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: "var(--text-faint)" }}>
            <span>{sent24} delivered</span>
            <span>{failed24} failed</span>
          </div>
        </div>
      )}

      {/* Recent activity */}
      <div className="dash-eyebrow" style={{ marginBottom: 12 }}>Last 24 hours</div>

      {emails24.length === 0 ? (
        <div className="dash-empty">
          <div className="dash-empty-title">No activity in the last 24 hours</div>
          <div className="dash-empty-text">Emails sent from active campaigns appear here in real time, as they go out.</div>
          <button className="dash-link" onClick={onBack}>Start a campaign →</button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
          {emails24.map((e, i) => {
            const cat = CAT[e.category] || { dot: "#94A3B8", text: "#64748B", bg: "#F8FAFF" };
            return (
              <div key={i} onClick={() => setOpenEmail(e)} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 1px 3px rgba(15,23,42,0.05)", cursor: "pointer", transition: "all .15s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(99,102,241,0.1)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "0 1px 3px rgba(15,23,42,0.05)"; }}
              >
                {/* Status dot */}
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", flexShrink: 0 }} />
                {/* Avatar */}
                <div style={{ width: 34, height: 34, borderRadius: 9, background: `${cat.dot}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: cat.dot, flexShrink: 0 }}>
                  {(e.company || e.email || "?")[0].toUpperCase()}
                </div>
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 1 }}>{e.company || e.email}</div>
                  {e.subject && <div style={{ fontSize: 11, color: "#64748B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Subject: {e.subject}</div>}
                  {!e.subject && <div style={{ fontSize: 11, color: "#94A3B8" }}>{e.email}</div>}
                </div>
                {/* Category badge */}
                {e.category && e.category !== "all" && (
                  <span style={{ fontSize: 10, fontWeight: 600, color: cat.text || cat.dot, background: cat.bg || `${cat.dot}15`, padding: "2px 8px", borderRadius: 4, flexShrink: 0 }}>{e.category}</span>
                )}
                {/* Time + view hint */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2, flexShrink: 0 }}>
                  <span style={{ fontSize: 11, color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>{timeAgo(e.campaignDate)}</span>
                  <span style={{ fontSize: 10, color: "var(--text-faint)", fontWeight: 500 }}>View →</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Older campaigns — grouped table */}
      {older.length > 0 && (
        <div className="dash-section" style={{ marginTop: 28 }}>
          <div className="dash-section-head">
            <span className="dash-eyebrow">All time · {older.length + last24.length} campaigns</span>
            <span className="dash-num" style={{ fontSize: 12, color: "var(--text-faint)" }}>
              {older.reduce((s, h) => s + (h.sent || 0), 0)} sent
            </span>
          </div>
          <div className="dash-card" style={{ padding: 0, overflow: "hidden" }}>
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Campaign</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Sent</th>
                  <th style={{ textAlign: "right" }}>Failed</th>
                  <th style={{ textAlign: "right" }}>When</th>
                </tr>
              </thead>
              <tbody>
                {older.slice(0, 8).map((h, i) => {
                  const named = h.category && h.category !== "all";
                  return (
                    <tr key={h.id || `${h.date || "campaign"}-${i}`}>
                      <td>{named ? h.category : <em style={{ color: "var(--text-faint)" }}>Unnamed campaign</em>}</td>
                      <td>
                        {h.cancelled
                          ? <span style={{ background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a", fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4 }}>Cancelled</span>
                          : <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-soft)" }}><span className="dash-dot is-green" />Delivered</span>}
                      </td>
                      <td className="dash-td-num" style={{ textAlign: "right", color: "var(--text)" }}>{h.sent || 0}</td>
                      <td className="dash-td-num" style={{ textAlign: "right", color: h.failed ? "var(--red)" : "var(--text-faint)" }}>{h.failed || 0}</td>
                      <td className="dash-td-num" style={{ textAlign: "right" }}>{timeAgo(h.date)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {older.length > 8 && (
            <div style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 10 }}>
              +{older.length - 8} more — see full history in Emails Sent.
            </div>
          )}
        </div>
      )}

      {/* Email preview modal */}
      {openEmail && <EmailPreviewModal email={openEmail} onClose={() => setOpenEmail(null)} />}
    </div>
  );
}

/* ───────── PROFILE PAGE ───────── */
function ProfilePage({ user, onBack, onLogout }) {
  const c = useCms();
  return (
    <div>
      <BackButton onClick={onBack} />
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 32 }}>
        <div style={{ width: 64, height: 64, borderRadius: "var(--r-lg)", background: "var(--teal)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, fontFamily: "var(--font-display)", color: "#fff", flexShrink: 0 }}>
          {user?.username?.[0]?.toUpperCase() || "U"}
        </div>
        <div>
          <span className="dash-eyebrow">08 — Profile</span>
          <h1 className="dash-page-title" style={{ fontSize: 32 }}>{user?.username}</h1>
          <p className="dash-page-stats" style={{ marginTop: 2 }}>Signed in via&nbsp;<strong>{user?.method === "google" ? "Google" : "Password"}</strong></p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 14, padding: "18px 20px", boxShadow: "0 1px 4px rgba(15,23,42,0.05)" }}>
          <div style={{ fontSize: 11, color: "#64748B", textTransform: "uppercase", letterSpacing: .5, fontWeight: 600, marginBottom: 8 }}>{c("pp_section1_label", "Account Info")}</div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
            <span style={{ fontSize: 13, color: "#64748B" }}>Username</span>
            <span style={{ fontSize: 13, color: "var(--text)", fontWeight: 600 }}>{user?.username}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
            <span style={{ fontSize: 13, color: "#64748B" }}>Login Method</span>
            <span style={{ fontSize: 13, color: "var(--text)", fontWeight: 600 }}>{user?.method === "google" ? "Google Sign-In" : "Password"}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0" }}>
            <span style={{ fontSize: 13, color: "#64748B" }}>Role</span>
            <span style={{ fontSize: 13, color: "#10b981", fontWeight: 600 }}>Admin</span>
          </div>
        </div>

        <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 14, padding: "18px 20px", boxShadow: "0 1px 4px rgba(15,23,42,0.05)" }}>
          <div style={{ fontSize: 11, color: "#64748B", textTransform: "uppercase", letterSpacing: .5, fontWeight: 600, marginBottom: 8 }}>{c("pp_section2_label", "Platform Stats")}</div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
            <span style={{ fontSize: 13, color: "#64748B" }}>Total Contacts</span>
            <span style={{ fontSize: 13, color: "var(--text)", fontFamily: "'JetBrains Mono',monospace", fontWeight: 600 }}>{user?.contactsCount || 0}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
            <span style={{ fontSize: 13, color: "#64748B" }}>Emails Sent</span>
            <span style={{ fontSize: 13, color: "var(--text)", fontFamily: "'JetBrains Mono',monospace", fontWeight: 600 }}>0</span>
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

/* ───────── SETTINGS ───────── */
function SettingsPage({ onBack, gmailConnected, connectGmail, user }) {
  const c = useCms();
  const [defaultChars, setDefaultChars] = useState(() => parseInt(localStorage.getItem("thehotspot_default_chars") || "400"));
  const [sendDelay, setSendDelay] = useState(() => parseInt(localStorage.getItem("thehotspot_send_delay") || "2500"));

  const save = (key, val) => localStorage.setItem(key, String(val));

  const Row = ({ label, sub, children }) => (
    <div className="rsp-settings-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>{sub}</div>}
      </div>
      {children}
    </div>
  );

  const Card = ({ title, children }) => (
    <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 14, padding: "4px 20px 12px", boxShadow: "0 1px 4px rgba(15,23,42,0.05)", marginBottom: 16 }}>
      <div style={{ fontSize: 11, color: "#64748B", textTransform: "uppercase", letterSpacing: .5, fontWeight: 700, padding: "16px 0 4px" }}>{title}</div>
      {children}
    </div>
  );

  const weekNumber = () => {
    const created = parseInt(localStorage.getItem("thehotspot_account_created") || Date.now());
    return Math.min(4, Math.floor((Date.now() - created) / 604800000) + 1);
  };
  const dailyLimits = [10, 20, 35, 50];
  const week = weekNumber();

  return (
    <div>
      <BackButton onClick={onBack} />
      <header className="dash-page-head">
        <span className="dash-eyebrow">06 — Account</span>
        <h1 className="dash-page-title">{c("sp_title", "Settings")}</h1>
      </header>

      <Card title="Email Preferences">
        <Row label="Default email length" sub="Characters per email body">
          <select value={defaultChars} onChange={e => { setDefaultChars(+e.target.value); save("thehotspot_default_chars", e.target.value); }}
            style={{ border: "1px solid var(--border)", borderRadius: 8, padding: "6px 10px", fontSize: 13, color: "var(--text)", background: "var(--bg-alt)", cursor: "pointer" }}>
            <option value={200}>Short (200)</option>
            <option value={400}>Medium (400)</option>
            <option value={800}>Long (800)</option>
          </select>
        </Row>
        <Row label="Delay between sends" sub="Prevents spam flags — min 1s">
          <select value={sendDelay} onChange={e => { setSendDelay(+e.target.value); save("thehotspot_send_delay", e.target.value); }}
            style={{ border: "1px solid var(--border)", borderRadius: 8, padding: "6px 10px", fontSize: 13, color: "var(--text)", background: "var(--bg-alt)", cursor: "pointer" }}>
            <option value={1000}>1 second</option>
            <option value={2500}>2.5 seconds</option>
            <option value={5000}>5 seconds</option>
          </select>
        </Row>
      </Card>

      <Card title="Send Limits (Warm-Up)">
        <Row label="Current week" sub="Account warm-up schedule">
          <span style={{ fontSize: 13, fontWeight: 700, color: "#4F46E5" }}>Week {week}</span>
        </Row>
        {dailyLimits.map((limit, i) => (
          <Row key={i} label={`Week ${i + 1}`} sub={i + 1 === week ? "Current" : i + 1 < week ? "Completed" : "Upcoming"}>
            <span style={{ fontSize: 13, fontWeight: 600, color: i + 1 === week ? "#10b981" : i + 1 < week ? "#94A3B8" : "var(--text-muted)" }}>{limit} emails/day</span>
          </Row>
        ))}
      </Card>

      <Card title="Integrations">
        <Row label="Gmail" sub={gmailConnected ? (user?.gmailEmail || user?.email || "Connected via Google") : "Used to send outreach emails"}>
          {gmailConnected
            ? <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: "#ecfdf5", color: "#047857", border: "1px solid #a7f3d0" }}>
                <LuCheck size={12} /> Connected
              </span>
            : <button onClick={connectGmail} style={{ padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none", background: "#FFF7ED", color: "#ea580c" }}>
                Connect
              </button>
          }
        </Row>
        <Row label="Airtable" sub="Contact & campaign database">
          <span style={{ fontSize: 12, fontWeight: 600, color: "#94A3B8" }}>Via env vars</span>
        </Row>
        <Row label="AI Agent" sub="Claude claude-sonnet-4-6 via Anthropic API">
          <span style={{ fontSize: 12, fontWeight: 600, color: "#10b981", display: "inline-flex", alignItems: "center", gap: 4 }}><LuCheck size={12} /> Active</span>
        </Row>
      </Card>
    </div>
  );
}

/* ───────── EMAIL SENDER ───────── */
function escapeEmailHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function htmlToPlainText(value = "") {
  return String(value)
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/\s*(p|div|tr|table|li|h[1-6])\s*>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

function normalizeEmailBody(body = "") {
  return htmlToPlainText(body)
    .replace(/—/g, "-")
    .replace(/<img\b[^>]*>/gi, "")
    .replace(/^[-_]{2,}\s*$/gm, "")
    .replace(/^to unsubscribe,\s*reply\s+stop\.?$/gim, "")
    .replace(/^.*\/api\/track\?.*$/gim, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function parseEmailSignature(body = "", fallback = {}) {
  const lines = normalizeEmailBody(body).split("\n");
  let signoffIndex = -1;
  for (let i = lines.length - 1; i >= 0; i -= 1) {
    if (/^(best|regards|thanks|thank you|sincerely|cheers),?$/i.test(lines[i].trim())) {
      signoffIndex = i;
      break;
    }
  }

  if (signoffIndex === -1) {
    return {
      bodyText: lines.join("\n").trim(),
      signoff: "Best,",
      name: fallback.name || fallback.username || "Ashir Ayaan",
      title: fallback.role_title || fallback.role || "CEO",
      company: fallback.company || "thehotspot",
    };
  }

  const sigLines = lines.slice(signoffIndex).map(line => line.trim()).filter(Boolean);
  return {
    bodyText: lines.slice(0, signoffIndex).join("\n").trim(),
    signoff: sigLines[0] || "Best,",
    name: sigLines[1] || fallback.name || fallback.username || "Ashir Ayaan",
    title: sigLines[2] || fallback.role_title || fallback.role || "",
    company: sigLines[3] || fallback.company || "thehotspot",
  };
}

function renderStructuredSignature(signature) {
  const initials = (signature.name || "A")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join("") || "A";

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:24px 0 0 0;padding-top:18px;border-top:1px solid #e5e7eb;">
      <tr>
        <td style="width:44px;vertical-align:top;padding:2px 12px 0 0;">
          <div style="width:36px;height:36px;border-radius:8px;background:#0d9488;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;line-height:36px;text-align:center;">${escapeEmailHtml(initials)}</div>
        </td>
        <td style="vertical-align:top;padding:0;">
          <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.45;color:#111827;margin:0 0 2px 0;">${escapeEmailHtml(signature.signoff)}</div>
          <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.45;color:#111827;font-weight:700;margin:0;">${escapeEmailHtml(signature.name)}</div>
          ${signature.title ? `<div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.45;color:#475569;margin:1px 0 0 0;">${escapeEmailHtml(signature.title)}</div>` : ""}
          <div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.45;color:#0d9488;font-weight:700;margin:1px 0 0 0;">${escapeEmailHtml(signature.company)}</div>
        </td>
      </tr>
    </table>`;
}

function wrapEmailHtml(plainBody, pixelUrl = "", sender = {}) {
  const signature = parseEmailSignature(plainBody, sender);
  const paragraphs = signature.bodyText
    .split(/\n{2,}/)
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => {
      return `<p style="margin:0 0 16px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.75;color:#1a1a1a;">${escapeEmailHtml(p).replace(/\n/g, "<br>")}</p>`;
    })
    .join("");
  const pixel = pixelUrl
    ? `<img src="${escapeEmailHtml(pixelUrl)}" width="1" height="1" alt="" style="display:block;width:1px;height:1px;border:0;opacity:0;overflow:hidden;" />`
    : "";
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:0;background:#ffffff;"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;"><tr><td align="center" style="padding:24px 16px;"><table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;"><tr><td style="padding:0;">${paragraphs}${renderStructuredSignature(signature)}<p style="margin:22px 0 0 0;padding-top:14px;border-top:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#9ca3af;line-height:1.5;">To unsubscribe, reply <strong>STOP</strong> to this email.</p></td></tr>${pixel ? `<tr><td style="font-size:0;line-height:0;height:1px;">${pixel}</td></tr>` : ""}</table></td></tr></table></body></html>`;
}

function makeGmailMessage({ to, subject, body, html = false }) {
  const encodedSubject = `=?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;
  const msg = [
    `To: ${to}`,
    `Subject: ${encodedSubject}`,
    `Content-Type: ${html ? "text/html" : "text/plain"}; charset=utf-8`,
    `Content-Transfer-Encoding: 8bit`,
    `MIME-Version: 1.0`,
    "",
    body,
  ].join("\r\n");
  return btoa(unescape(encodeURIComponent(msg)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function EmailSenderPage({ onBack, gmailToken, connectGmail, showToast, user }) {
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
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            company: contact.company || "the company",
            contactName: contact.name || "",
            email: contact.email || "",
            category: contact.category,
            website: contact.website || "",
            offerContext,
            senderName: user?.name || user?.username || "",
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
        const raw = makeGmailMessage({ to: email, subject: draft.subject, body: wrapEmailHtml(draft.body, "", user), html: true });
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

  const card = { background: "rgba(255,255,255,0.8)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "24px", marginBottom: 20, boxShadow: "var(--shadow-sm)" };
  const btn = () => ({ padding: "10px 20px", borderRadius: "var(--r)", border: "none", cursor: "pointer", fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 13 });

  /* ── CONFIGURE ── */
  if (step === "configure") return (
    <div>
      <BackButton onClick={onBack} />
      <div className="dash-page-head">
        <span className="dash-eyebrow">03 - Send campaign</span>
        <h1 className="dash-page-title">Email <em>sender</em></h1>
        <div style={{ fontSize: 14, color: "var(--text-muted)" }}>Choose contacts, add offer context, and generate reviewable drafts.</div>
      </div>
      <div style={card}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 16 }}>1. Select Contacts</div>
        {/* Category filter */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {["All", "Network", "CPS", "CPL", "CPA", "Mobile"].map(cat => (
            <button key={cat} onClick={() => { setSelectedCategory(cat); setSelectedIds(new Set((cat === "All" ? allContacts : allContacts.filter(c => c.category === cat)).map((_, i) => i))); }} style={{
              padding: "6px 14px", borderRadius: "var(--r)", border: "1px solid", fontSize: 12, fontWeight: 600, cursor: "pointer",
              background: selectedCategory === cat ? "var(--teal-tint)" : "rgba(255,255,255,0.72)",
              color: selectedCategory === cat ? "var(--teal-dark)" : "var(--text-soft)",
              borderColor: selectedCategory === cat ? "var(--teal-light)" : "var(--border)",
              fontFamily: "var(--font-sans)",
            }}>{cat}</button>
          ))}
        </div>
        {/* Select all / none */}
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <button onClick={selectAll} style={{ ...btn(), background: "var(--teal-tint)", color: "var(--teal-dark)", border: "1px solid var(--teal-light)" }}>Select All</button>
          <button onClick={selectNone} style={{ ...btn(), background: "rgba(255,255,255,0.72)", color: "var(--text-soft)", border: "1px solid var(--border)" }}>Clear</button>
          <span style={{ marginLeft: "auto", fontSize: 12, color: "#64748B", alignSelf: "center" }}>{selectedIds.size} selected</span>
        </div>
        {/* Contact list */}
        <div style={{ maxHeight: 260, overflowY: "auto", border: "1px solid var(--border)", borderRadius: 10 }}>
          {filteredContacts.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: "#94A3B8", fontSize: 13 }}>No contacts found. Add contacts in the Contacts DB.</div>
          ) : filteredContacts.map((c, i) => (
            <div key={i} onClick={() => toggleSelect(i)} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
              borderBottom: i < filteredContacts.length - 1 ? "1px solid #F1F5FF" : "none",
              cursor: "pointer", background: selectedIds.has(i) ? "var(--bg-hover)" : "transparent",
              transition: "background .1s",
            }}>
              <div style={{
                width: 18, height: 18, borderRadius: 4, border: `2px solid ${selectedIds.has(i) ? "var(--teal)" : "var(--text-faint)"}`,
                background: selectedIds.has(i) ? "var(--teal)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                {selectedIds.has(i) && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.company || c.name || "Unknown"}</div>
                <div style={{ fontSize: 11, color: "#94A3B8" }}>{c.email || "No email"} · {c.category || "—"}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={card}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>2. About Your Offer (optional)</div>
        <div style={{ fontSize: 12, color: "#94A3B8", marginBottom: 12 }}>AI will use this to personalize the outreach emails</div>
        <textarea
          value={offerContext}
          onChange={e => setOfferContext(e.target.value)}
          placeholder="e.g. We offer 30% commission on all sales, top-tier creatives, weekly payouts..."
          rows={3}
          style={{ width: "100%", background: "rgba(255,255,255,0.78)", border: "1px solid var(--border)", borderRadius: "var(--r)", padding: "12px 14px", fontSize: 13, color: "var(--text)", fontFamily: "var(--font-sans)", outline: "none", resize: "vertical" }}
          onFocus={e => { e.target.style.borderColor = "var(--border-teal)"; e.target.style.boxShadow = "0 0 0 3px var(--teal-tint)"; }}
          onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
        />
      </div>

      {!gmailToken && (
        <div style={{ ...card, background: "#FFF7ED", border: "1px solid #FED7AA", display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
          <LuMail size={24} style={{ color: "#9A3412", flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#9A3412" }}>Gmail not connected</div>
            <div style={{ fontSize: 12, color: "#C2410C" }}>You need to connect Gmail to send emails</div>
          </div>
          <button onClick={connectGmail} style={{ ...btn(), background: "var(--teal)", color: "#fff" }}>Connect Gmail</button>
        </div>
      )}

      <button
        onClick={generateDrafts}
        style={{ width: "100%", padding: "14px", borderRadius: "var(--r)", border: "none", cursor: selectedIds.size > 0 ? "pointer" : "default", fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 14, background: selectedIds.size > 0 ? "var(--teal)" : "var(--bg-hover)", color: selectedIds.size > 0 ? "#fff" : "#94A3B8", boxShadow: selectedIds.size > 0 ? "0 8px 18px rgba(13,148,136,0.16)" : "none", transition: "all .2s" }}
      >
        <LuSparkles size={16} /> Generate {selectedIds.size} Draft{selectedIds.size !== 1 ? "s" : ""} with AI
      </button>
    </div>
  );

  /* ── GENERATING ── */
  if (step === "generating") return (
    <div style={card}>
      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 20, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <LuSparkles size={16} /> Generating personalized drafts...
      </div>
      <div style={{ background: "var(--border-strong)", borderRadius: 10, height: 8, marginBottom: 12, overflow: "hidden" }}>
        <div style={{ height: "100%", borderRadius: 10, background: "var(--teal)", width: `${genProgress.total ? (genProgress.current / genProgress.total) * 100 : 0}%`, transition: "width .4s ease" }} />
      </div>
      <div style={{ textAlign: "center", fontSize: 13, color: "#64748B", marginBottom: 24 }}>{genProgress.current} / {genProgress.total} drafts created</div>
      {drafts.length > 0 && (
        <div style={{ maxHeight: 300, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
          {drafts.map((d, i) => (
            <div key={i} style={{ background: "var(--bg-alt)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
              <LuCheck size={16} style={{ color: "#10b981", flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{d.contact.company || d.contact.name}</div>
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
          <div style={{ fontSize: 14, color: "#64748B" }}><span style={{ fontWeight: 700, color: "var(--text)" }}>{approvedCount}</span> of {drafts.length} approved</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setDrafts(d => d.map(x => ({ ...x, approved: true })))} style={{ ...btn(), background: "#ECFDF5", color: "#059669", border: "1px solid #BBF7D0" }}>Approve All</button>
            <button onClick={() => setDrafts(d => d.map(x => ({ ...x, approved: false })))} style={{ ...btn(), background: "#FEF2F2", color: "#EF4444", border: "1px solid #FECACA" }}>Reject All</button>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
          {drafts.map((d) => (
            <div key={d.id} style={{ background: "var(--bg)", border: `1px solid ${d.approved ? "#BBF7D0" : "var(--border)"}`, borderRadius: 14, padding: "18px", boxShadow: "0 2px 8px rgba(15,23,42,0.05)", opacity: d.approved ? 1 : 0.55, transition: "all .2s" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{d.contact.company || d.contact.name}</div>
                  <div style={{ fontSize: 11, color: "#94A3B8" }}>{d.contact.email}</div>
                </div>
                <button onClick={() => updateDraft(d.id, "approved", !d.approved)} style={{
                  padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 12,
                  background: d.approved ? "#ECFDF5" : "var(--bg-hover)", color: d.approved ? "#059669" : "#64748B",
                }}>
                  {d.approved ? "✓ Approved" : "Approve"}
                </button>
              </div>
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 4, textTransform: "uppercase", letterSpacing: .5, fontWeight: 600 }}>Subject</div>
                <input value={d.subject} onChange={e => updateDraft(d.id, "subject", e.target.value)} style={{ width: "100%", background: "var(--bg-alt)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "var(--text)", fontFamily: "'DM Sans',sans-serif", outline: "none" }} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 4, textTransform: "uppercase", letterSpacing: .5, fontWeight: 600 }}>Body</div>
                <textarea value={d.body} onChange={e => updateDraft(d.id, "body", e.target.value)} rows={5} style={{ width: "100%", background: "var(--bg-alt)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "var(--text)", fontFamily: "'DM Sans',sans-serif", outline: "none", resize: "vertical" }} />
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={sendEmails}
          disabled={approvedCount === 0}
          style={{ width: "100%", padding: "14px", borderRadius: "var(--r)", border: "none", cursor: approvedCount > 0 ? "pointer" : "default", fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 14, background: approvedCount > 0 ? "var(--teal)" : "var(--bg-hover)", color: approvedCount > 0 ? "#fff" : "#94A3B8", boxShadow: approvedCount > 0 ? "0 8px 18px rgba(13,148,136,0.16)" : "none", transition: "all .2s" }}
        >
          <LuSend size={15} /> Send {approvedCount} Email{approvedCount !== 1 ? "s" : ""}
        </button>
      </div>
    );
  }

  /* ── SENDING ── */
  if (step === "sending") return (
    <div style={card}>
      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 20, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><LuSend size={16} /> Sending emails...</div>
      <div style={{ background: "var(--border-strong)", borderRadius: 10, height: 8, marginBottom: 12, overflow: "hidden" }}>
        <div style={{ height: "100%", borderRadius: 10, background: "var(--teal)", width: `${sendProgress.total ? (sendProgress.current / sendProgress.total) * 100 : 0}%`, transition: "width .4s ease" }} />
      </div>
      <div style={{ textAlign: "center", fontSize: 13, color: "#64748B", marginBottom: 20 }}>{sendProgress.current} / {sendProgress.total} sent</div>
      <div style={{ maxHeight: 300, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
        {sendProgress.results.map((r, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: r.status === "sent" ? "#ECFDF5" : "#FEF2F2", borderRadius: 8 }}>
            {r.status === "sent" ? <LuCheck size={16} style={{ color: "#10b981" }} /> : <LuX size={16} style={{ color: "#EF4444" }} />}
            <span style={{ fontSize: 13, color: "var(--text)", fontWeight: 500 }}>{r.contact.company || r.contact.name}</span>
            {r.error && <span style={{ fontSize: 11, color: "#EF4444", marginLeft: "auto" }}>{r.error}</span>}
          </div>
        ))}
      </div>
    </div>
  );

  /* ── DONE ── */
  return (
    <div style={{ ...card, textAlign: "center" }}>
      <LuPartyPopper size={48} style={{ marginBottom: 12, color: "#10b981" }} />
      <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>Campaign Complete!</div>
      <div style={{ fontSize: 14, color: "#64748B", marginBottom: 24 }}>
        <span style={{ color: "#059669", fontWeight: 700 }}>{sentCount} sent</span>
        {failedCount > 0 && <> · <span style={{ color: "#EF4444", fontWeight: 700 }}>{failedCount} failed</span></>}
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        <button onClick={() => { setStep("configure"); setDrafts([]); setSelectedIds(new Set(allContacts.map((_, i) => i))); }} style={{ ...btn(), background: "var(--teal-tint)", color: "var(--teal-dark)", border: "1px solid var(--teal-light)" }}>Send Another Campaign</button>
        <button onClick={onBack} style={{ ...btn(), background: "var(--bg-hover)", color: "#64748B", border: "1px solid var(--border)" }}>Back to Dashboard</button>
      </div>
    </div>
  );
}

/* ───────── EMAIL TEMPLATES PAGE ───────── */
const TEMPLATE_ANGLES = {
  Partnership: [
    "I think there's a natural fit between what we do and what you've built — would love to explore.",
    "Both companies are operating in the same space — a partnership could unlock reach for both sides.",
    "I've been following your work and think there's a clear overlap between our audiences and goals.",
    "The way you've positioned your brand aligns closely with what our network is looking for in partners.",
    "There's a straightforward collaboration opportunity here — happy to walk through the details on a short call.",
  ],
  Revenue: [
    "We can drive qualified traffic and leads to your platform through our owned channels.",
    "Our media properties attract exactly the kind of audience your offers are built for.",
    "We've consistently delivered strong ROI for partners in your vertical — worth a quick conversation.",
    "Our performance network covers the geos and verticals where you're looking to grow revenue.",
    "We generate commission-based revenue for partners by sending targeted traffic from niche properties.",
  ],
  Integration: [
    "Our customers keep asking for a solution like yours — there could be a strong integration opportunity here.",
    "We've had multiple users request a native connection to your platform — the demand is already there.",
    "An integration between our tools would unlock a workflow our users are actively asking for.",
    "Your product fills a gap our customers encounter daily — a two-way integration makes sense.",
    "The overlap between our user bases makes a native integration a low-effort, high-impact move.",
  ],
  Agency: [
    "We specialise in amplifying great work — we've seen strong results taking campaigns like yours to a wider audience.",
    "We run paid distribution for agencies — taking great creative and making sure the right people see it.",
    "Your recent campaigns show exactly the kind of execution we help scale across new channels.",
    "We partner with agencies to extend campaign reach without adding headcount on your side.",
    "We've helped agencies turn award-winning work into measurable performance by expanding distribution.",
  ],
  Startup: [
    "We have an audience that maps perfectly to your ideal customer — interested in exploring a distribution play?",
    "We can get your product in front of an engaged, relevant audience faster than most paid channels.",
    "Early-stage growth is where we excel — our owned properties drive targeted signups for B2B startups.",
    "Our network has helped several startups at your stage build their first 10,000 users through content and SEO.",
    "The fastest path to your ICP right now might be through channels you haven't tested yet — let's talk.",
  ],
};

const pickAngle = (id) => {
  const angles = TEMPLATE_ANGLES[id] || [];
  return angles[Math.floor(Math.random() * angles.length)] || "";
};

const TEMPLATES = [
  { id: "Partnership", icon: <LuTarget size={22} />,      label: "Partnership", desc: "Natural fit between both companies",     color: "#6366f1", fields: ["recipientCompany", "contactName", "website", "angle"] },
  { id: "Revenue",     icon: <LuDollarSign size={22} />,  label: "Revenue",     desc: "Drive traffic, leads, or sales to them", color: "#10b981", fields: ["recipientCompany", "contactName", "website", "angle"] },
  { id: "Integration", icon: <LuLink size={22} />,        label: "Integration", desc: "Our users want their product",           color: "#0ea5e9", fields: ["recipientCompany", "contactName", "website", "angle"] },
  { id: "Agency",      icon: <LuGlobe size={22} />,       label: "Agency",      desc: "Client results & case study angle",      color: "#f97316", fields: ["recipientCompany", "contactName", "website", "angle"] },
  { id: "Startup",     icon: <LuZap size={22} />,         label: "Startup",     desc: "Growth & distribution angle",            color: "#ec4899", fields: ["recipientCompany", "contactName", "website", "angle"] },
];

function EmailTemplatesPage({ onBack, gmailToken, connectGmail, showToast, user }) {
  const c = useCms();
  const [step, setStep] = useState("pick"); // pick | fill | preview
  const [template, setTemplate] = useState(null);
  const [form, setForm] = useState({ recipientCompany: "", contactName: "", website: "", angle: "", maxChars: "560" });
  const [regeneratingAngle, setRegeneratingAngle] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [email, setEmail] = useState({ subject: "", body: "" });
  const [sending, setSending] = useState(false);

  const T = { bg: "var(--bg)", card: "var(--bg)", bd: "var(--border)", tx: "var(--text)", tx2: "#64748B", tx3: "#94A3B8", ac: "#4F46E5", acBg: "#6366f120" };
  const inp = { background: "var(--bg-alt)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 14px", fontSize: 14, color: T.tx, outline: "none", width: "100%", fontFamily: "'DM Sans',sans-serif", boxSizing: "border-box" };
  const lbl = { fontSize: 12, fontWeight: 600, color: T.tx2, marginBottom: 6, display: "block" };

  const generate = async () => {
    if (!form.recipientCompany.trim()) { showToast("Enter recipient company name"); return; }
    setGenerating(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: form.recipientCompany,
          contactName: form.contactName || "",
          category: template.id,
          website: form.website,
          offerContext: form.angle || pickAngle(template.id),
          senderName: user?.name || user?.username || "",
          senderCompany: user?.company || "",
          senderRole: user?.role_title || "",
          maxChars: parseInt(form.maxChars) || 600,
        }),
      });
      const data = await res.json();
      setEmail({ subject: data.subject || "", body: data.body || "" });
      setStep("preview");
    } catch {
      showToast("Failed to generate email — try again");
    }
    setGenerating(false);
  };

  const sendEmail = async () => {
    if (!gmailToken) { connectGmail(); showToast("Connect Gmail first"); return; }
    const toEmail = form.recipientEmail?.trim();
    if (!toEmail) { showToast("Enter recipient email address first"); return; }
    setSending(true);
    try {
      const raw = makeGmailMessage({ to: toEmail, subject: email.subject, body: wrapEmailHtml(email.body, "", user), html: true });
      const sendRes = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
        method: "POST",
        headers: { Authorization: `Bearer ${gmailToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ raw }),
      });
      const sendData = await sendRes.json();
      if (sendData.error) {
        // Token expired — reconnect automatically
        if (sendData.error.code === 401 || (sendData.error.message || "").toLowerCase().includes("auth")) {
          showToast("Gmail token expired — reconnecting...");
          setSending(false);
          connectGmail();
          return;
        }
        throw new Error(sendData.error.message);
      }
      showToast(`Sent to ${toEmail}`);
      setStep("pick");
      setTemplate(null);
      setForm({ recipientCompany: "", contactName: "", website: "", angle: "", maxChars: "560" });
      setEmail({ subject: "", body: "" });
    } catch (e) {
      showToast("Send failed: " + e.message);
    }
    setSending(false);
  };

  /* ── STEP 1: PICK TEMPLATE ── */
  if (step === "pick") return (
    <div>
      <header className="dash-page-head">
        <span className="dash-eyebrow">07 — Compose</span>
        <h1 className="dash-page-title">Email <em>templates</em></h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)", maxWidth: 520 }}>Pick a template category, fill in the details, and get a professional email ready to send.</p>
      </header>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 14 }}>
        {TEMPLATES.map(t => (
          <button key={t.id} onClick={() => { setTemplate(t); setForm(f => ({ ...f, angle: pickAngle(t.id) })); setStep("fill"); }} style={{
            background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 16, padding: "22px 20px",
            cursor: "pointer", textAlign: "left", fontFamily: "'DM Sans',sans-serif",
            boxShadow: "0 1px 4px rgba(15,23,42,0.05)", transition: "all .15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = t.color; e.currentTarget.style.boxShadow = `0 6px 24px ${t.color}22`; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "0 1px 4px rgba(15,23,42,0.05)"; e.currentTarget.style.transform = "none"; }}
          >
            <div style={{ color: "var(--text-soft)", display: "flex", marginBottom: 14 }}>{t.icon}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.tx, marginBottom: 5 }}>{t.label}</div>
            <div style={{ fontSize: 13, color: T.tx2, lineHeight: 1.5, marginBottom: 14 }}>{t.desc}</div>
            <div style={{ fontSize: 12, color: t.color, fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
              Use this template <span>→</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  /* ── STEP 2: FILL VARIABLES ── */
  if (step === "fill") return (
    <div style={{ maxWidth: 600 }}>
      <button onClick={() => setStep("pick")} style={{ background: "none", border: "none", color: T.ac, fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", marginBottom: 20, padding: 0, display: "flex", alignItems: "center", gap: 4 }}>
        ← Back to templates
      </button>
      {/* Template badge */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <div style={{ color: "var(--text-soft)", display: "flex" }}>{template.icon}</div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: T.tx }}>{template.label} Email</div>
          <div style={{ fontSize: 13, color: T.tx2 }}>{template.desc}</div>
        </div>
      </div>

      <div style={{ background: "var(--bg)", borderRadius: 16, border: "1px solid var(--border)", padding: 24, display: "flex", flexDirection: "column", gap: 18 }}>
        {/* Recipient info */}
        <div style={{ fontSize: 11, fontWeight: 700, color: T.tx3, letterSpacing: 1, textTransform: "uppercase", borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>Recipient</div>
        <div>
          <label style={lbl}>Company Name *</label>
          <input style={inp} placeholder="e.g. AdCombo, Notion, Shopify" value={form.recipientCompany} onChange={e => setForm(f => ({ ...f, recipientCompany: e.target.value }))}
            onFocus={e => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 3px #6366f115"; }}
            onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <label style={lbl}>Contact Name <span style={{ color: T.tx3, fontWeight: 400 }}>(optional)</span></label>
            <input style={inp} placeholder="e.g. John, Sarah" value={form.contactName} onChange={e => setForm(f => ({ ...f, contactName: e.target.value }))}
              onFocus={e => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 3px #6366f115"; }}
              onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }} />
          </div>
          <div>
            <label style={lbl}>Their Email <span style={{ color: T.tx3, fontWeight: 400 }}>(to send)</span></label>
            <input style={inp} placeholder="partner@company.com" value={form.recipientEmail || ""} onChange={e => setForm(f => ({ ...f, recipientEmail: e.target.value }))}
              onFocus={e => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 3px #6366f115"; }}
              onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }} />
          </div>
        </div>
        <div>
          <label style={lbl}>Their Website <span style={{ color: T.tx3, fontWeight: 400 }}>(helps personalize)</span></label>
          <input style={inp} placeholder="e.g. adcombo.com" value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
            onFocus={e => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 3px #6366f115"; }}
            onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }} />
        </div>

        {/* Angle / message */}
        <div style={{ fontSize: 11, fontWeight: 700, color: T.tx3, letterSpacing: 1, textTransform: "uppercase", borderBottom: "1px solid var(--border)", paddingBottom: 8, marginTop: 4 }}>Email Angle</div>
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <label style={{ ...lbl, marginBottom: 0 }}>What's your pitch? <span style={{ color: T.tx3, fontWeight: 400 }}>(edit freely)</span></label>
            <button
              type="button"
              disabled={regeneratingAngle}
              onClick={async () => {
                setRegeneratingAngle(true);
                try {
                  const res = await fetch("/api/generate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ type: "angle", category: template.id, current: form.angle }),
                  });
                  const data = await res.json();
                  if (data.angle) setForm(f => ({ ...f, angle: data.angle }));
                } catch { /* silent */ }
                setRegeneratingAngle(false);
              }}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-alt)", color: regeneratingAngle ? "#94A3B8" : "#6366f1", fontSize: 12, fontWeight: 600, cursor: regeneratingAngle ? "default" : "pointer", fontFamily: "'DM Sans',sans-serif", flexShrink: 0, transition: "all .15s" }}
              onMouseEnter={e => { if (!regeneratingAngle) { e.currentTarget.style.background = "#6366f120"; e.currentTarget.style.borderColor = "#6366f1"; } }}
              onMouseLeave={e => { e.currentTarget.style.background = "var(--bg-alt)"; e.currentTarget.style.borderColor = "var(--border)"; }}
            >
              {regeneratingAngle ? "Generating..." : "↻ Regenerate"}
            </button>
          </div>
          <textarea style={{ ...inp, minHeight: 90, resize: "vertical", lineHeight: 1.6 }} value={form.angle} onChange={e => setForm(f => ({ ...f, angle: e.target.value }))}
            onFocus={e => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 3px #6366f115"; }}
            onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }} />
          <div style={{ fontSize: 11, color: T.tx3, marginTop: 5 }}>Be specific — mention commission %, offer types, audience size, or any details that make this relevant to them.</div>
        </div>

        {/* Length */}
        <div style={{ fontSize: 11, fontWeight: 700, color: T.tx3, letterSpacing: 1, textTransform: "uppercase", borderBottom: "1px solid var(--border)", paddingBottom: 8, marginTop: 4 }}>Length</div>
        <div style={{ display: "flex", gap: 10 }}>
          {[["Short", "350", "4–6 lines"], ["Medium", "560", "6–8 lines"], ["Detailed", "850", "10–12 lines"]].map(([label, val, hint]) => (
            <button key={val} onClick={() => setForm(f => ({ ...f, maxChars: val }))} style={{
              flex: 1, padding: "10px 8px", borderRadius: 10, border: form.maxChars === val ? `2px solid ${template.color}` : "1px solid var(--border)",
              background: form.maxChars === val ? `${template.color}10` : "var(--bg-alt)",
              color: form.maxChars === val ? template.color : T.tx2,
              fontSize: 13, fontWeight: form.maxChars === val ? 600 : 400, cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
              transition: "all .15s",
            }}>
              {label}
              <div style={{ fontSize: 10, opacity: .7, marginTop: 2 }}>{hint}</div>
            </button>
          ))}
        </div>

        <button onClick={generate} disabled={generating || !form.recipientCompany.trim()} style={{
          marginTop: 8, padding: "13px 20px", borderRadius: 12, border: "none", cursor: form.recipientCompany.trim() ? "pointer" : "default",
          background: form.recipientCompany.trim() ? `linear-gradient(135deg, ${template.color}, ${template.color}cc)` : "var(--bg-hover)",
          color: form.recipientCompany.trim() ? "#fff" : "#94A3B8", fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans',sans-serif",
          boxShadow: form.recipientCompany.trim() ? `0 4px 14px ${template.color}40` : "none", transition: "all .2s",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}>
          {generating ? (
            <>{[0,1,2].map(d => <span key={d} style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff", animation: `pulse 1.2s ease-in-out ${d*.2}s infinite`, display: "inline-block" }} />)}</>
          ) : <><LuSparkles size={15} /> Generate Email</>}
        </button>
      </div>
    </div>
  );

  /* ── STEP 3: PREVIEW & SEND ── */
  return (
    <div style={{ maxWidth: 680 }}>
      <button onClick={() => setStep("fill")} style={{ background: "none", border: "none", color: T.ac, fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", marginBottom: 20, padding: 0, display: "flex", alignItems: "center", gap: 4 }}>
        ← Back to edit
      </button>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: T.tx }}>Your Email</div>
          <div style={{ fontSize: 13, color: T.tx2 }}>Edit below if needed, then send.</div>
        </div>
        <button onClick={generate} disabled={generating} style={{ padding: "8px 16px", borderRadius: 10, border: `1px solid ${template.color}`, background: "none", color: template.color, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
          {generating ? "Regenerating..." : "↻ Regenerate"}
        </button>
      </div>

      <div style={{ background: "var(--bg)", borderRadius: 16, border: "1px solid var(--border)", padding: 24, marginBottom: 16 }}>
        {/* Subject */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ ...lbl, color: template.color }}>Subject Line</label>
          <input style={{ ...inp, fontWeight: 600, fontSize: 15 }} value={email.subject} onChange={e => setEmail(em => ({ ...em, subject: e.target.value }))}
            onFocus={e => { e.target.style.borderColor = template.color; e.target.style.boxShadow = `0 0 0 3px ${template.color}15`; }}
            onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }} />
          <div style={{ fontSize: 11, color: email.subject.length > 50 ? "#ef4444" : T.tx3, marginTop: 4 }}>
            {email.subject.length} / 50 chars {email.subject.length > 50 ? <><LuTriangleAlert size={11} /> too long</> : <LuCheck size={11} />}
          </div>
        </div>
        {/* Divider */}
        <div style={{ height: 1, background: "var(--border)", margin: "4px 0 16px" }} />
        {/* Body */}
        <div>
          <label style={{ ...lbl, color: template.color }}>Email Body</label>
          <textarea style={{ ...inp, minHeight: 260, resize: "vertical", lineHeight: 1.8, whiteSpace: "pre-wrap" }}
            value={email.body} onChange={e => setEmail(em => ({ ...em, body: e.target.value }))}
            onFocus={e => { e.target.style.borderColor = template.color; e.target.style.boxShadow = `0 0 0 3px ${template.color}15`; }}
            onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }} />
          <div style={{ fontSize: 11, color: T.tx3, marginTop: 4 }}>{email.body.length} chars · {email.body.split(/\s+/).filter(Boolean).length} words</div>
        </div>
      </div>

      {/* Recipient email input if not provided */}
      {!form.recipientEmail && (
        <div style={{ background: "#FFF7ED", border: "1px solid #fed7aa", borderRadius: 12, padding: "14px 18px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
          <LuTriangleAlert size={16} style={{ color: "#92400e", flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#92400e", marginBottom: 6 }}>Add recipient email to send</div>
            <input style={{ ...inp, width: "100%", background: "#fff", fontSize: 13 }} placeholder="partner@company.com"
              value={form.recipientEmail || ""} onChange={e => setForm(f => ({ ...f, recipientEmail: e.target.value }))}
              onFocus={e => { e.target.style.borderColor = "#f97316"; e.target.style.boxShadow = "0 0 0 3px #f9731615"; }}
              onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }} />
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={sendEmail} disabled={sending} style={{
          flex: 1, padding: "13px 20px", borderRadius: 12, border: "none", cursor: "pointer",
          background: `linear-gradient(135deg, ${template.color}, ${template.color}cc)`,
          color: "#fff", fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans',sans-serif",
          boxShadow: `0 4px 14px ${template.color}40`, transition: "all .2s",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}>
          {sending ? "Sending..." : <><LuSend size={15} /> Send Email</>}
        </button>
        <button onClick={() => { navigator.clipboard.writeText(`Subject: ${email.subject}\n\n${email.body}`); showToast("Copied to clipboard"); }} style={{
          padding: "13px 18px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-alt)",
          color: T.tx2, fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontWeight: 500,
        }}>
          Copy
        </button>
      </div>
    </div>
  );
}

/* ───────── INBOX PAGE ───────── */
function InboxPage() {
  const folders = [
    { id: "inbox",   label: "Inbox",   icon: <LuInbox size={16} />,   count: 6 },
    { id: "starred", label: "Starred", icon: <LuStar size={16} />,    count: 2 },
    { id: "sent",    label: "Sent",    icon: <LuReply size={16} />,   count: 0 },
    { id: "archive", label: "Archive", icon: <LuArchive size={16} />, count: 0 },
  ];
  const threads = [
    { name: "Marcus Chen", company: "Brightpath Media", subject: "Re: Partnership proposal", snippet: "Thanks for reaching out — this genuinely looks like a strong fit for our Q3 roadmap. Could we set up a call next week to walk through the numbers?", time: "9:42 AM", state: "green", label: "Interested", unread: true },
    { name: "Priya Nair", company: "Northwind Labs", subject: "Re: Quick question on your campaigns", snippet: "Appreciate the note. We're not actively looking right now, but circle back in the autumn and we can revisit.", time: "8:15 AM", state: "amber", label: "Later", unread: true },
    { name: "Daniel Osei", company: "Coastline CPA", subject: "Re: Outreach for affiliate network", snippet: "Out of office until the 28th with limited access to email. I'll respond on my return.", time: "Yesterday", state: "amber", label: "Out of office", unread: false },
    { name: "Lena Hoff", company: "Vela Mobile", subject: "Re: Mobile CPA placements", snippet: "This isn't a priority for our team — please remove us from the list. Thanks for understanding.", time: "Yesterday", state: "red", label: "Not interested", unread: false },
    { name: "Tomás Reyes", company: "Aurora CPL", subject: "Re: Lead-gen partnership", snippet: "Numbers look reasonable. Send across the contract draft and we'll get legal to review it this week.", time: "Mon", state: "green", label: "Interested", unread: false },
    { name: "Sara Kovač", company: "Meridian Group", subject: "Re: Following up", snippet: "Got your message — forwarding internally to the person who owns this. Expect a reply shortly.", time: "Mon", state: "teal", label: "Forwarded", unread: false },
  ];
  const [folder, setFolder] = useState("inbox");
  const [sel, setSel] = useState(0);
  const t = threads[sel];

  return (
    <div style={{ display: "flex", height: "calc(100dvh - 160px)", minHeight: 460, border: "1px solid var(--border)", borderRadius: "var(--r-md)", overflow: "hidden", background: "var(--bg)" }}>
      {/* Column 1 — folders */}
      <div style={{ flex: "0 0 184px", borderRight: "1px solid var(--border)", background: "var(--bg-alt)", padding: "16px 0", display: "flex", flexDirection: "column" }}>
        <div className="dash-sidebar-section"><span className="dash-sidebar-eyebrow">Mailboxes</span></div>
        {folders.map(f => (
          <button key={f.id} onClick={() => setFolder(f.id)}
            className={`dash-nav-item${folder === f.id ? " is-active" : ""}`}>
            {f.icon}
            <span style={{ flex: 1 }}>{f.label}</span>
            {f.count > 0 && <span className="dash-num" style={{ fontSize: 11, color: "var(--text-faint)" }}>{f.count}</span>}
          </button>
        ))}
        <div className="dash-sidebar-footer" style={{ marginTop: "auto" }}>
          <div className="dash-eyebrow" style={{ marginBottom: 6 }}>Reply rate</div>
          <div className="dash-stat-value" style={{ fontSize: 24 }}>62%</div>
          <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 2 }}>last 30 days</div>
        </div>
      </div>

      {/* Column 2 — thread list */}
      <div style={{ flex: "0 0 320px", borderRight: "1px solid var(--border)", overflowY: "auto" }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <span style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--text)" }}>Inbox</span>
          <span className="dash-num" style={{ fontSize: 12, color: "var(--text-faint)" }}>{threads.length} threads</span>
        </div>
        {threads.map((th, i) => (
          <button key={i} onClick={() => setSel(i)} style={{
            display: "block", width: "100%", textAlign: "left", padding: "13px 16px",
            border: "none", borderBottom: "1px solid var(--border)", cursor: "pointer",
            background: i === sel ? "var(--teal-tint)" : "var(--bg)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
              <span className={`dash-dot is-${th.state}`} />
              <span style={{ fontSize: 13, fontWeight: th.unread ? 700 : 600, color: "var(--text)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{th.name}</span>
              <span className="dash-num" style={{ fontSize: 11, color: "var(--text-faint)" }}>{th.time}</span>
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{th.subject}</div>
            <div style={{ fontSize: 11.5, color: "var(--text-faint)", lineHeight: 1.45, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{th.snippet}</div>
          </button>
        ))}
      </div>

      {/* Column 3 — reading pane */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
            <span className={`dash-chip is-${t.state}`}>{t.label}</span>
            <span className="dash-num" style={{ fontSize: 12, color: "var(--text-faint)" }}>{t.time}</span>
          </div>
          <h2 className="dash-h2" style={{ marginBottom: 8 }}>{t.subject}</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="dash-avatar" style={{ width: 34, height: 34 }}>{t.name[0]}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{t.name}</div>
              <div style={{ fontSize: 12, color: "var(--text-faint)" }}>{t.company}</div>
            </div>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "24px", fontSize: 14, lineHeight: 1.7, color: "var(--text-muted)" }}>
          <p style={{ marginBottom: 14 }}>Hi,</p>
          <p style={{ marginBottom: 14 }}>{t.snippet}</p>
          <p>— {t.name.split(" ")[0]}</p>
        </div>
        <div style={{ padding: "14px 24px", borderTop: "1px solid var(--border)", display: "flex", gap: 10 }}>
          <button className="dash-btn dash-btn-primary"><LuReply size={14} /> Reply</button>
          <button className="dash-btn dash-btn-outline"><LuArchive size={14} /> Archive</button>
        </div>
      </div>
    </div>
  );
}

/* ───────── BILLING PAGE ───────── */
function BillingPage({ onBack }) {
  const invoices = [
    { id: "INV-0042", date: "May 01, 2026", amount: "$49.00", status: "Paid" },
    { id: "INV-0038", date: "Apr 01, 2026", amount: "$49.00", status: "Paid" },
    { id: "INV-0034", date: "Mar 01, 2026", amount: "$49.00", status: "Paid" },
    { id: "INV-0029", date: "Feb 01, 2026", amount: "$29.00", status: "Paid" },
  ];
  const usage = [
    { label: "Emails sent", used: 1280, cap: 2000 },
    { label: "Contacts stored", used: 640, cap: 5000 },
    { label: "AI generations", used: 410, cap: 1000 },
  ];
  return (
    <div style={{ maxWidth: 880, margin: "0 auto" }}>
      <BackButton onClick={onBack} />
      <div className="dash-page-head">
        <span className="dash-eyebrow">Account — Billing</span>
        <h1 className="dash-h1">Plan &amp; <span className="dash-h1-light">billing</span></h1>
        <div style={{ fontSize: 14, color: "var(--text-muted)" }}>Manage your subscription, usage, and payment history.</div>
      </div>

      {/* Plan + usage — asymmetric 60/40 */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16, marginBottom: 28 }}>
        <div className="dash-card is-feature pad-lg">
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
            <span className="dash-eyebrow"><em>Current plan</em></span>
            <span className="dash-chip is-teal">Active</span>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 38, fontWeight: 700, letterSpacing: "-0.03em", color: "var(--text)" }}>Pro</span>
            <span className="dash-num" style={{ fontSize: 15, color: "var(--text-soft)" }}>$49<span style={{ color: "var(--text-faint)" }}>/mo</span></span>
          </div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", margin: "8px 0 18px", lineHeight: 1.6 }}>
            Renews on <span className="dash-num">Jun 01, 2026</span>. Includes 2,000 sends/mo, unlimited campaigns, and all 12 AI agents.
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="dash-btn dash-btn-primary">Upgrade plan</button>
            <button className="dash-btn dash-btn-ghost">Cancel</button>
          </div>
        </div>
        <div className="dash-card pad-md">
          <div className="dash-eyebrow" style={{ marginBottom: 14 }}>Usage this cycle</div>
          {usage.map(u => {
            const pct = Math.round(u.used / u.cap * 100);
            return (
              <div key={u.label} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                  <span style={{ color: "var(--text-muted)" }}>{u.label}</span>
                  <span className="dash-num" style={{ color: "var(--text-soft)" }}>{u.used} / {u.cap}</span>
                </div>
                <div style={{ height: 6, background: "var(--bg-section)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: pct > 85 ? "var(--amber)" : "var(--teal)", borderRadius: 3 }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invoices */}
      <div className="dash-section">
        <div className="dash-section-head">
          <span className="dash-eyebrow">Payment history</span>
          <span className="dash-savestate">Synced just now</span>
        </div>
        <div className="dash-card" style={{ padding: 0, overflow: "hidden" }}>
          <table className="dash-table">
            <thead><tr><th>Invoice</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id}>
                  <td className="dash-num" style={{ fontWeight: 600 }}>{inv.id}</td>
                  <td className="dash-td-num">{inv.date}</td>
                  <td className="dash-td-num">{inv.amount}</td>
                  <td><span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-soft)" }}><span className="dash-dot is-green" />{inv.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ───────── HELP PAGE ───────── */
function HelpPage({ onBack }) {
  const topics = [
    { icon: <LuBookOpen size={18} />,       title: "Getting started", desc: "Set up your account, connect Gmail, and import your first contacts." },
    { icon: <LuRadio size={18} />,          title: "Running campaigns", desc: "Build sequences, schedule sends, and track delivery in real time." },
    { icon: <LuUsers size={18} />,          title: "Managing contacts", desc: "Import from Sheets, organize by category, and keep data clean." },
    { icon: <LuSparkles size={18} />,       title: "AI agents", desc: "How the 12 autonomous agents work and when to use each one." },
    { icon: <LuCreditCard size={18} />,     title: "Billing & plans", desc: "Change plan, read invoices, and understand usage limits." },
    { icon: <LuCircleHelp size={18} />,     title: "Troubleshooting", desc: "Fix Gmail token errors, sync issues, and delivery problems." },
  ];
  return (
    <div style={{ maxWidth: 880, margin: "0 auto" }}>
      <BackButton onClick={onBack} />
      <div className="dash-page-head">
        <span className="dash-eyebrow">Account — Help</span>
        <h1 className="dash-h1">How can we <span className="dash-h1-light">help?</span></h1>
        <div style={{ fontSize: 14, color: "var(--text-muted)" }}>Search the guides or browse a topic below.</div>
      </div>

      <label className="dash-search" style={{ width: "100%", height: 44, marginBottom: 28 }}>
        <LuSearch size={15} style={{ flexShrink: 0 }} />
        <input placeholder="Search help articles…" readOnly />
        <span className="dash-kbd">⌘K</span>
      </label>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14, marginBottom: 28 }}>
        {topics.map(t => (
          <div key={t.title} className="dash-card is-liftable" style={{ display: "flex", gap: 14, padding: 20, cursor: "pointer" }}>
            <div style={{ width: 38, height: 38, flexShrink: 0, borderRadius: "var(--r)", background: "var(--bg-alt)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-soft)" }}>{t.icon}</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--text)", marginBottom: 3 }}>{t.title}</div>
              <div style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.55 }}>{t.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="dash-card is-feature pad-lg" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--text)", marginBottom: 4 }}>Still stuck?</div>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Our team typically replies within a few hours on weekdays.</div>
        </div>
        <a href="mailto:support@thehotspot.app" className="dash-btn dash-btn-primary" style={{ textDecoration: "none" }}>
          <LuMessageCircle size={14} /> Contact support
        </a>
      </div>
    </div>
  );
}

/* ───────── DASHBOARD ───────── */
function Dashboard({ user, onLogout, onUserUpdate }) {
  // URL ↔ page mapping
  const PAGE_TO_PATH = {
    null:           "/",
    dashboard:      "/dashboard",
    emailSender:    "/email-sender",
    emailTemplates: "/email-templates",
    contacts:       "/contacts",
    campaignStatus: "/campaign-status",
    totalContacts:  "/total-contacts",
    emailsSent:     "/emails-sent",
    categories:     "/categories",
    successRate:    "/success-rate",
    inbox:          "/inbox",
    billing:        "/billing",
    help:           "/help",
    profile:        "/profile",
    settings:       "/settings",
  };
  const PATH_TO_PAGE = Object.fromEntries(Object.entries(PAGE_TO_PATH).map(([k, v]) => [v, k === "null" ? null : k]));

  const pageFromPath = () => {
    const p = window.location.pathname;
    return p in PATH_TO_PAGE ? PATH_TO_PAGE[p] : null;
  };

  const [page, setPageRaw] = useState(() => pageFromPath());
  const [pageLoading, setPageLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1025);

  const setPage = (p) => {
    const path = PAGE_TO_PATH[p] ?? "/";
    if (window.location.pathname !== path) window.history.pushState({ page: p }, "", path);
    setPageLoading(true);
    setTimeout(() => { setPageRaw(p); setPageLoading(false); }, 1000);
  };

  // Handle browser back/forward
  useEffect(() => {
    const onPop = () => {
      setPageLoading(true);
      setTimeout(() => { setPageRaw(pageFromPath()); setPageLoading(false); }, 2000);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  const [gmailConnected, setGmailConnected] = useState(() => !!(user?.gmailToken || user?.sentCount));
  const [gmailToken, setGmailToken] = useState(() => user?.gmailToken || null);
  const [sentCount, setSentCount] = useState(() => user?.sentCount || 0);
  const [contactCount, setContactCount] = useState(0);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const cancelCampaign = useRef(false);
  const [campaignRunning, setCampaignRunning] = useState(false);

  // Fetch contact count from server on mount — always use server for cross-device accuracy
  useEffect(() => {
    fetchAllContacts().then(records => setContactCount(records.length)).catch(() => {
      try { const cached = localStorage.getItem("thehotspot_manual_contacts"); if (cached) setContactCount(JSON.parse(cached).length); } catch {}
    });
  }, []);

  // Check for scheduled campaigns every minute
  useEffect(() => {
    const checkScheduled = () => {
      try {
        const scheduled = JSON.parse(localStorage.getItem("thehotspot_scheduled") || "[]");
        const now = Date.now();
        const due = scheduled.filter(s => new Date(s.scheduledFor).getTime() <= now);
        const remaining = scheduled.filter(s => new Date(s.scheduledFor).getTime() > now);
        if (due.length > 0) {
          localStorage.setItem("thehotspot_scheduled", JSON.stringify(remaining));
          due.forEach(s => {
            setToast("Scheduled campaign starting...");
            setTimeout(() => setToast(null), 3000);
            runEmailCampaign(s.category || "all", null, s.offerContext || "");
          });
        }
      } catch {}
    };
    checkScheduled();
    const interval = setInterval(checkScheduled, 60000);
    return () => clearInterval(interval);
  }, [gmailToken]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  // Daily send limits — warm-up schedule to protect Gmail account health
  const getDailyLimit = () => {
    const firstSend = localStorage.getItem("thehotspot_first_send");
    if (!firstSend) { localStorage.setItem("thehotspot_first_send", new Date().toISOString()); return 10; }
    const days = Math.floor((Date.now() - new Date(firstSend).getTime()) / 86400000);
    if (days < 7)  return 10;
    if (days < 14) return 20;
    if (days < 21) return 35;
    return 50;
  };
  const getTodaySentCount = () => {
    try {
      const d = JSON.parse(localStorage.getItem("thehotspot_daily_sends") || "{}");
      return d.date === new Date().toDateString() ? d.count : 0;
    } catch { return 0; }
  };
  const incrementDailySendCount = () => {
    try {
      const d = JSON.parse(localStorage.getItem("thehotspot_daily_sends") || "{}");
      const today = new Date().toDateString();
      localStorage.setItem("thehotspot_daily_sends", JSON.stringify({ date: today, count: d.date === today ? d.count + 1 : 1 }));
    } catch {}
  };

  // Save a campaign to history — localStorage (instant) + Airtable (background)
  const saveCampaignHistory = (entry) => {
    const record = { ...entry, id: Date.now(), date: new Date().toISOString() };
    try {
      const history = JSON.parse(localStorage.getItem("thehotspot_campaigns") || "[]");
      history.unshift(record);
      localStorage.setItem("thehotspot_campaigns", JSON.stringify(history.slice(0, 50)));
    } catch {}
    fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user?.username || user?.email || "unknown", ...record }),
    }).catch(() => {});
  };

  // Generate one email via API — returns { subject, body }
  const generateOneEmail = async (contact, offerContext, maxChars) => {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company: contact.company_name || contact.company || "the company",
        contactName: contact.name || "",
        email: contact.email || "",
        category: contact.category || "Network",
        website: contact.website || "",
        offerContext,
        senderName: user?.name || user?.username || "",
        senderCompany: user?.company || "",
        senderRole: user?.role_title || "",
        maxChars: maxChars || null,
      }),
    });
    return res.json();
  };

  // Send one pre-generated email via Gmail — returns { threadId }
  const sendOneEmail = async (to, subject, body) => {
    const trackId = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const origin = window.location.origin;
    const pixelUrl = `${origin}/api/track?type=open&id=${trackId}&e=${encodeURIComponent(to)}`;
    const raw = makeGmailMessage({ to, subject, body: wrapEmailHtml(body, pixelUrl, user), html: true });
    const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
      method: "POST",
      headers: { Authorization: `Bearer ${gmailToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ raw }),
    });
    const data = await res.json();
    if (data.error) {
      if (data.error.code === 401 || data.error.status === "UNAUTHENTICATED") {
        setGmailToken(null);
        setGmailConnected(false);
        throw new Error("TOKEN_EXPIRED");
      }
      throw new Error(data.error.message);
    }
    return { threadId: data.threadId || null };
  };

  // Send emails inline in the chat — no page navigation
  // preDrafts: optional array of { subject, body } to use instead of generating
  const runEmailCampaign = async (category, directEmails = null, offerContext = "", preDrafts = null, maxChars = null) => {
    if (!gmailToken) {
      setMessages(prev => [...prev, { role: "assistant", content: `Gmail is not connected. Click the **Connect Gmail** button in the top bar to connect, then try again.` }]);
      connectGmail();
      setLoading(false);
      return;
    }

    let targets = [];
    if (directEmails && directEmails.length > 0) {
      targets = directEmails.map(email => {
        const domain = email.split("@")[1] || "";
        const company = domain.split(".")[0] || email;
        return { email, company, name: company, category: "Network", website: domain };
      });
    } else {
      let contacts = [];
      try { contacts = JSON.parse(localStorage.getItem("thehotspot_contacts")) || []; } catch {}
      targets = category && category !== "all"
        ? contacts.filter(c => c.category?.toLowerCase() === category.toLowerCase())
        : contacts;
    }

    if (targets.length === 0) {
      setMessages(prev => [...prev, { role: "assistant", content: `No contacts found${category && category !== "all" ? ` in the **${category.toUpperCase()}** category` : ""}. Add contacts first from the Contacts DB, or type an email address directly.` }]);
      setLoading(false);
      return;
    }

    // Rate limit check — warm-up schedule protects Gmail account health
    const dailyLimit = getDailyLimit();
    const todaySent  = getTodaySentCount();
    const remaining  = dailyLimit - todaySent;
    if (remaining <= 0) {
      setMessages(prev => [...prev, { role: "assistant", content: `Daily limit reached (${dailyLimit}/day). This protects your Gmail account from spam flags. Resets at midnight — you have **${dailyLimit} sends** again tomorrow.` }]);
      setLoading(false);
      return;
    }
    if (targets.length > remaining) {
      setMessages(prev => [...prev, { role: "assistant", content: `Only **${remaining} sends** left today (daily limit: ${dailyLimit}). Sending to the first ${remaining} contacts.` }]);
      targets = targets.slice(0, remaining);
    }

    cancelCampaign.current = false;
    setCampaignRunning(true);
    const progressId = Date.now();
    setMessages(prev => [...prev, { role: "assistant", id: progressId, content: `Generating email...` }]);

    let sent = 0, failed = 0;
    const sentLog = [];

    for (let i = 0; i < targets.length; i++) {
      if (cancelCampaign.current) {
        const cancelMsg = `Campaign cancelled.\n\n• **${sent} sent** before stopping${failed > 0 ? `\n• ${failed} failed` : ""}`;
        setMessages(prev => prev.map(m => m.id === progressId ? { ...m, content: cancelMsg } : m));
        saveCampaignHistory({ category, offerContext, sent, failed, cancelled: true, contacts: sentLog });
        setCampaignRunning(false);
        setLoading(false);
        return;
      }

      const contact = targets[i];
      try {
        // Use pre-generated draft if available, otherwise generate now
        let subject, body;
        if (preDrafts && preDrafts[i]) {
          subject = preDrafts[i].subject;
          body = preDrafts[i].body;
        } else {
          const draft = await generateOneEmail(contact, offerContext, maxChars);
          subject = draft.subject;
          body = draft.body;
        }

        if (!contact.email) throw new Error("No email address");

        // Show the exact email being sent in the chat message
        if (targets.length === 1) {
          setMessages(prev => prev.map(m => m.id === progressId ? {
            ...m,
            content: `Sending to **${contact.email}**:\n\n**Subject:** ${subject}\n\n${body}\n\n_Sending..._`,
          } : m));
        } else {
          setMessages(prev => prev.map(m => m.id === progressId ? {
            ...m,
            content: `**${i + 1}/${targets.length}** — Sending to **${contact.email}**\nSubject: "${subject}"${failed > 0 ? ` · ${failed} failed` : ""} · say "stop" to cancel`,
          } : m));
        }

        const { threadId } = await sendOneEmail(contact.email, subject, body);
        sent++;
        incrementDailySendCount();
        sentLog.push({ email: contact.email, company: contact.company_name || contact.company || contact.name, subject, body, sentAt: new Date().toISOString(), threadId });

        // Human-like pacing between sends (reduces spam-flag risk)
        if (targets.length > 1) await new Promise(r => setTimeout(r, 2500));

        // Show final sent confirmation for single email
        if (targets.length === 1) {
          setMessages(prev => prev.map(m => m.id === progressId ? {
            ...m,
            content: `Sent to **${contact.email}**\n\n**Subject:** ${subject}\n\n${body}`,
          } : m));
        }
      } catch (err) {
        if (err.message === "TOKEN_EXPIRED") {
          const expiredMsg = `Gmail token expired.\n\n${sent > 0 ? `${sent} sent before expiry.\n\n` : ""}Reconnecting Gmail...`;
          setMessages(prev => prev.map(m => m.id === progressId ? { ...m, content: expiredMsg } : m));
          saveCampaignHistory({ category, offerContext, sent, failed, cancelled: true, contacts: sentLog });
          setCampaignRunning(false);
          setLoading(false);
          connectGmail();
          return;
        }
        failed++;
      }

      // Bulk progress after each email
      if (targets.length > 1 && i === targets.length - 1) {
        const summary = `Done!\n\n• **${sent} email${sent !== 1 ? "s" : ""} sent** successfully${failed > 0 ? `\n• **${failed} failed**` : ""}`;
        setMessages(prev => prev.map(m => m.id === progressId ? { ...m, content: summary } : m));
      }
    }

    if (sent > 0) {
      saveCampaignHistory({ category, offerContext, sent, failed, cancelled: false, contacts: sentLog });
      // Register follow-up sequences for all sent contacts (fire and forget)
      fetch("/api/sequences/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contacts: sentLog, step: 1 }),
      }).catch(() => {});
    }
    setCampaignRunning(false);
    setLoading(false);
  };

  const connectGmail = () => {
    if (!window.google?.accounts?.oauth2) {
      showToast("Google Sign-In not available — please refresh the page.");
      return;
    }

    const scope = "https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send";

    const applyToken = async (token, label) => {
      try {
        const [sentRes, profileRes] = await Promise.all([
          fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages?labelIds=SENT&maxResults=1", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("https://www.googleapis.com/oauth2/v2/userinfo", { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const sentData = await sentRes.json();
        const profileData = await profileRes.json();
        const count = sentData.resultSizeEstimate || 0;
        const gmailEmail = profileData.email || "";
        const updated = { ...user, gmailToken: token, sentCount: count, gmailEmail };
        setGmailConnected(true); setGmailToken(token); setSentCount(count);
        onUserUpdate?.(updated);
        showToast(label || `Gmail connected — ${gmailEmail || "account"}`);
      } catch {
        const updated = { ...user, gmailToken: token };
        setGmailConnected(true); setGmailToken(token);
        onUserUpdate?.(updated);
        showToast(label || "Gmail connected!");
      }
    };

    const useLegacyFlow = () => {
      const c = window.google.accounts.oauth2.initTokenClient({
        client_id: GMAIL_CLIENT_ID, scope,
        callback: async (r) => { if (r.error) { showToast("Gmail connection failed: " + r.error); return; } await applyToken(r.access_token); },
        error_callback: (e) => { if (e.type !== "popup_closed") showToast("Gmail connection failed"); },
      });
      c.requestAccessToken();
    };

    // Try Authorization Code flow (gets refresh token for background sending without browser)
    try {
      if (!window.google.accounts.oauth2.initCodeClient) { useLegacyFlow(); return; }
      const c = window.google.accounts.oauth2.initCodeClient({
        client_id: GMAIL_CLIENT_ID, scope, ux_mode: "popup",
        callback: async (r) => {
          if (r.error) { useLegacyFlow(); return; }
          try {
            const res = await fetch("/api/auth", {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ code: r.code, userId: user?.username || user?.email || "unknown" }),
            });
            const data = await res.json();
            if (data.access_token) {
              await applyToken(data.access_token, data.backgroundEnabled ? "Gmail connected + background sending enabled" : null);
            } else { useLegacyFlow(); }
          } catch { useLegacyFlow(); }
        },
      });
      c.requestCode();
    } catch { useLegacyFlow(); }
  };

  // All nav items shown as dashboard cards
  const navItems = [
    { id: "emailSender",    label: "Email Sender",      icon: <LuSend size={18} />,            desc: "Draft & send outreach",      accent: "#10b981" },
    { id: "emailTemplates", label: "Email Templates",   icon: <LuFilePen size={18} />,        desc: "Pick template & generate",   accent: "#6366f1" },
    { id: "contacts",       label: "Contacts DB",       icon: <LuClipboardList size={18} />,   desc: "Manage your contacts",       accent: "#f97316" },
    { id: "campaignStatus", label: "Campaign Status",   icon: <LuRadio size={18} />,           desc: "Track active campaigns",     accent: "#0ea5e9" },
    { id: "totalContacts",  label: "Total Contacts",    icon: <LuUsers size={18} />,           desc: "All contacts overview",      accent: "#8b5cf6" },
    { id: "emailsSent",     label: "Emails Sent",       icon: <LuMail size={18} />,            desc: "View sent emails",           accent: "#ec4899" },
    { id: "categories",     label: "Categories",        icon: <LuFolder size={18} />,          desc: "Network, CPS, CPL…",         accent: "#14b8a6" },
    { id: "successRate",    label: "Success Rate",      icon: <LuTrendingUp size={18} />,      desc: "Campaign performance",       accent: "#f59e0b" },
    { id: "inbox",          label: "Inbox",             icon: <LuInbox size={18} />,           desc: "Replies & threads",          accent: "#0d9488" },
    { id: "billing",        label: "Billing",           icon: <LuCreditCard size={18} />,      desc: "Plan & payment history",     accent: "#64748B" },
    { id: "help",           label: "Help",              icon: <LuCircleHelp size={18} />,      desc: "Guides & support",           accent: "#64748B" },
    { id: "profile",        label: "Settings",          icon: <LuSettings size={18} />,        desc: "Account & preferences",     accent: "#64748B" },
  ];

  // Breadcrumb titles — explicit per page, so home/dashboard never fall back to "Page"
  const PAGE_TITLES = {
    dashboard: "Dashboard", emailSender: "Email Sender", emailTemplates: "Templates",
    contacts: "Contacts", campaignStatus: "Campaigns", totalContacts: "Total Contacts",
    emailsSent: "Emails Sent", categories: "Categories", successRate: "Success Rate",
    inbox: "Inbox", billing: "Billing", help: "Help", profile: "Settings", settings: "Settings",
  };
  const pageLabel = PAGE_TITLES[page] || "Dashboard";
  const pageIcon  = navItems.find(n => n.id === page)?.icon  || "";

  return (
    <div className="dash-shell" style={{ width: "100vw", position: "fixed", inset: 0 }}>

      {/* TOAST — white card + colored left border, never a bright fill */}
      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 1000, animation: "slideIn .3s ease" }}>
          <div className="dash-toast is-green">
            <LuZap size={15} style={{ color: "var(--green)", flexShrink: 0, marginTop: 1 }} />
            <span>{toast}</span>
          </div>
        </div>
      )}

      <PixelPet />

      {/* ═══════ TOP NAV BAR ═══════ */}
      <div className="dash-topbar">
        <button className="dash-burger" onClick={() => setSidebarOpen(o => !o)}
          aria-label={sidebarOpen ? "Close menu" : "Open menu"}>
          {sidebarOpen ? <LuX size={18} /> : <LuMenu size={18} />}
        </button>
        <button onClick={() => setPage(null)} className="dash-wordmark"
          style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          <span className="dash-wordmark-dot" />
          thehotspot
        </button>
        {page !== null && (
          <span className="dash-breadcrumb rsp-breadcrumb">
            <span className="dash-breadcrumb-sep">/</span>
            {pageLabel}
          </span>
        )}
        <div className="dash-topbar-right">
          <label className="dash-search rsp-gmail-badge">
            <LuSearch size={14} style={{ flexShrink: 0 }} />
            <input placeholder="Search campaigns, contacts…" readOnly />
            <span className="dash-kbd">⌘K</span>
          </label>
          <button className="dash-icon-btn" onClick={() => connectGmail()}
            title={gmailConnected ? "Gmail connected" : "Connect Gmail"}>
            <LuMail size={17} style={{ color: gmailConnected ? "var(--teal)" : "var(--text-soft)" }} />
          </button>
          <button className="dash-avatar" onClick={() => setPage("profile")} title="Profile">
            {user?.username?.[0]?.toUpperCase() || "U"}
          </button>
        </div>
      </div>

      {/* ═══════ BODY: SIDEBAR + CONTENT ═══════ */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex" }}>

        {/* SIDEBAR BACKDROP */}
        {sidebarOpen && window.innerWidth <= 1024 && (
          <div className="dash-backdrop" onClick={() => setSidebarOpen(false)} />
        )}

        {/* LEFT SIDEBAR — persistent on desktop, drawer below 1024px */}
        <aside className={`dash-sidebar${sidebarOpen ? " is-open" : ""}`}>
          {[
            { eyebrow: "Workspace", items: [
              { id: null,             label: "Home",         icon: <LuHouse size={18} /> },
              { id: "dashboard",      label: "Dashboard",    icon: <LuLayoutDashboard size={18} /> },
              { id: "contacts",       label: "Contacts",     icon: <LuUsers size={18} /> },
              { id: "campaignStatus", label: "Campaigns",    icon: <LuRadio size={18} /> },
            ] },
            { eyebrow: "Intelligence", items: [
              { id: "emailSender",    label: "Email Sender", icon: <LuSend size={18} /> },
              { id: "emailTemplates", label: "Templates",    icon: <LuFilePen size={18} /> },
              { id: "inbox",          label: "Inbox",        icon: <LuInbox size={18} /> },
            ] },
            { eyebrow: "Account", items: [
              { id: "settings",       label: "Settings",     icon: <LuSettings size={18} /> },
              { id: "billing",        label: "Billing",      icon: <LuCreditCard size={18} /> },
              { id: "help",           label: "Help",         icon: <LuCircleHelp size={18} /> },
            ] },
          ].map(section => (
            <div key={section.eyebrow}>
              <div className="dash-sidebar-section">
                <span className="dash-sidebar-eyebrow">{section.eyebrow}</span>
              </div>
              {section.items.map(item => (
                <button key={String(item.id)}
                  className={`dash-nav-item${page === item.id ? " is-active" : ""}`}
                  onClick={() => { setPage(item.id); setSidebarOpen(false); }}>
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          ))}


          <div className="dash-sidebar-footer">
            <button className="dash-user-card"
              onClick={() => { setPage("profile"); setSidebarOpen(false); }}
              style={{ width: "100%", border: "none", cursor: "pointer" }}>
              <span className="dash-avatar">{user?.username?.[0]?.toUpperCase() || "U"}</span>
              <span style={{ minWidth: 0, textAlign: "left" }}>
                <span className="dash-user-name" style={{ display: "block" }}>{user?.username || "User"}</span>
                <span className="dash-user-mail" style={{ display: "block" }}>{user?.gmailEmail || user?.email || "Not connected"}</span>
              </span>
            </button>
            <button className="dash-nav-item" onClick={onLogout}
              style={{ width: "calc(100% - 16px)", marginTop: 4 }}>
              <I.Logout />
              Sign out
            </button>
            <div className="dash-version">v2.3 beta</div>
          </div>
        </aside>

        {/* RIGHT PANEL */}
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>

        {/* PAGE TRANSITION LOADER */}
        {pageLoading && (
          <div style={{ position: "fixed", inset: 0, background: "var(--bg)", zIndex: 9999, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18 }}>
            <img src="/logo.png" alt="thehotspot" style={{ width: 52, height: 52, objectFit: "contain" }} />
            <div className="dash-dots"><span /><span /><span /></div>
          </div>
        )}

        {/* MAIN CONTENT */}
        <div className="rsp-main-content" style={{ flex: 1, overflowY: "auto", padding: "32px", width: "100%", position: "relative", background: "transparent" }}>
          <div style={{ maxWidth: 1160, margin: "0 auto", filter: pageLoading ? "blur(2px)" : "none", transition: "filter .15s" }}>

            {/* ── HOME ── */}
            {page === null && <HomePage user={user} contactCount={contactCount} setPage={setPage} />}

            {/* ── DASHBOARD ── */}
            {page === "dashboard" && <DashboardPage user={user} contactCount={contactCount} setPage={setPage} />}

            {/* ── OTHER PAGES ── */}
            {page === "emailSender"    && <EmailSenderPage onBack={() => setPage(null)} gmailToken={gmailToken} connectGmail={connectGmail} showToast={showToast} user={user} />}
            {page === "emailTemplates" && <EmailTemplatesPage onBack={() => setPage(null)} gmailToken={gmailToken} connectGmail={connectGmail} showToast={showToast} user={user} />}
            {page === "contacts"       && <ContactsPage onBack={() => setPage(null)} showToast={showToast} user={user} />}
            {page === "campaignStatus" && <CampaignStatusPage onBack={() => setPage(null)} user={user} />}
            {page === "totalContacts"  && <TotalContactsPage onBack={() => setPage(null)} user={user} />}
            {page === "emailsSent"     && <EmailsSentPage onBack={() => setPage(null)} sentCount={sentCount} gmailConnected={gmailConnected} user={user} />}
            {page === "categories"     && <CategoriesPage onBack={() => setPage(null)} />}
            {page === "successRate"    && <SuccessRatePage onBack={() => setPage(null)} user={user} />}
            {page === "inbox"          && <InboxPage />}
            {page === "billing"        && <BillingPage onBack={() => setPage(null)} />}
            {page === "help"           && <HelpPage onBack={() => setPage(null)} />}
            {page === "profile"        && <ProfilePage user={user} onBack={() => setPage(null)} onLogout={onLogout} />}
            {page === "settings"       && <SettingsPage onBack={() => setPage(null)} gmailConnected={gmailConnected} connectGmail={connectGmail} user={user} />}
          </div>
        </div>
        </div>{/* end right panel */}
      </div>{/* end body */}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:.3;transform:scale(.9)} 50%{opacity:1;transform:scale(1.1)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{transform:translateX(-50%) translateY(100%);opacity:0} to{transform:translateX(-50%) translateY(0);opacity:1} }
        @keyframes modalIn { from{opacity:0;transform:scale(.96)} to{opacity:1;transform:scale(1)} }
        @keyframes slideFromRight { from{opacity:0;transform:translateY(-50%) translateX(60px)} to{opacity:1;transform:translateY(-50%) translateX(0)} }
        @keyframes slideInFromRight { from{opacity:0;transform:translateX(48px)} to{opacity:1;transform:translateX(0)} }
        @keyframes slideInFromLeft  { from{opacity:0;transform:translateX(-48px)} to{opacity:1;transform:translateX(0)} }
        @keyframes slideIn { from{transform:translateX(100px);opacity:0} to{transform:translateX(0);opacity:1} }
        @keyframes ringPulse { 0%,100%{box-shadow:0 0 0 0 #10b98140} 50%{box-shadow:0 0 0 8px #10b98110} }
        @keyframes splashFloat { from{transform:translateY(0px) scale(1);opacity:0.8} to{transform:translateY(-8px) scale(1.06);opacity:1} }
        @keyframes splashFadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:0.85;transform:translateY(0)} }
        @keyframes petFloat   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes petHappy   { 0%{transform:scale(1)} 40%{transform:scale(1.18)} 100%{transform:scale(1)} }
        @keyframes heartFloat { 0%{transform:translateY(0);opacity:1} 100%{transform:translateY(-44px);opacity:0} }
        @keyframes chatSlide  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes smokeCloud { 0%{transform:scale(.25) translateY(0);opacity:.75} 100%{transform:scale(3) translateY(-30px);opacity:0} }
        *{box-sizing:border-box;margin:0;padding:0}
        html,body,#root{width:100%;height:100dvh;margin:0;padding:0;background:#ffffff;overflow:hidden;position:fixed;inset:0;}
        ::-webkit-scrollbar{width:8px;height:8px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:4px} ::-webkit-scrollbar-thumb:hover{background:#94a3b8}
        input::placeholder,textarea::placeholder{color:#94a3b8}
        select{color-scheme:light}

        /* ── RESPONSIVE ─────────────────────────────────────── */

        /* Tablet: 768–1024px */
        @media (max-width:1024px) {
          .rsp-main-content { padding: 20px 16px !important; }
          .rsp-stat-grid    { grid-template-columns: repeat(2,1fr) !important; }
          .rsp-tool-grid    { grid-template-columns: 1fr !important; }
          .rsp-agent-grid   { grid-template-columns: repeat(2,1fr) !important; }
          .rsp-pillars-top  { grid-template-columns: 1fr 1fr !important; }
          .rsp-pillars-bot  { grid-template-columns: 1fr !important; }
          .rsp-features-grid{ grid-template-columns: repeat(2,1fr) !important; }
          .rsp-stats-bar    { grid-template-columns: repeat(2,1fr) !important; }
          .rsp-contacts-hub { grid-template-columns: 1fr !important; }
          .rsp-lp-nav       { padding: 14px 20px !important; }
          .rsp-hp-wrap      { padding: 20px 20px !important; }
          .rsp-camp-stats   { grid-template-columns: repeat(2,1fr) !important; }
        }

        /* Mobile large: 481–767px */
        @media (max-width:767px) {
          .rsp-main-content   { padding: 16px 14px !important; }
          .rsp-stat-grid      { grid-template-columns: repeat(2,1fr) !important; gap: 10px !important; }
          .rsp-tool-grid      { grid-template-columns: 1fr !important; gap: 12px !important; }
          .rsp-agent-grid     { grid-template-columns: repeat(2,1fr) !important; gap: 8px !important; }
          .rsp-pillars-top    { grid-template-columns: 1fr !important; gap: 12px !important; }
          .rsp-pillars-bot    { grid-template-columns: 1fr !important; gap: 12px !important; }
          .rsp-features-grid  { grid-template-columns: 1fr !important; gap: 12px !important; }
          .rsp-stats-bar      { grid-template-columns: repeat(2,1fr) !important; }
          .rsp-contact-stats  { grid-template-columns: repeat(3,1fr) !important; }
          .rsp-contacts-hub   { grid-template-columns: 1fr !important; }
          .rsp-breadcrumb     { display: none !important; }
          .rsp-lp-nav         { padding: 12px 16px !important; }
          /* Pet chat: full-width on mobile */
          .rsp-pet-panel      { position: fixed !important; left: 8px !important; right: 8px !important;
                                bottom: 80px !important; width: auto !important; }
          .rsp-hp-wrap        { padding: 16px 14px !important; }
          .rsp-camp-stats     { grid-template-columns: 1fr !important; }
          .rsp-tc-header      { flex-direction: column !important; align-items: flex-start !important; gap: 10px !important; }
          .rsp-tc-card        { flex-wrap: wrap !important; }
          .rsp-tc-form-grid   { grid-template-columns: 1fr !important; }
          .rsp-sheet-row      { flex-direction: column !important; }
          .rsp-sheet-row input{ width: 100% !important; }
          .rsp-sheet-header   { flex-direction: column !important; align-items: flex-start !important; gap: 10px !important; }
          .rsp-settings-row   { flex-wrap: wrap !important; gap: 8px !important; }
          .rsp-page-header    { flex-direction: column !important; align-items: flex-start !important; gap: 10px !important; }
        }

        /* Mobile small: 320–480px */
        @media (max-width:480px) {
          .rsp-main-content   { padding: 12px 10px !important; }
          .rsp-stat-grid      { grid-template-columns: repeat(2,1fr) !important; gap: 8px !important; }
          .rsp-agent-grid     { grid-template-columns: 1fr !important; gap: 8px !important; }
          .rsp-gmail-badge    { display: none !important; }
          .rsp-contact-stats  { grid-template-columns: 1fr !important; }
          .rsp-tool-grid      { gap: 10px !important; }
          .rsp-hp-wrap        { padding: 12px 10px !important; }
        }

        /* Landing page sections responsive */
        @media (max-width:767px) {
          .lp-body [style*="maxWidth: 1280"] { padding: 0 16px !important; }
        }
        @media (max-width:480px) {
          .lp-body [style*="maxWidth: 1280"] { padding: 0 12px !important; }
        }
      `}</style>
    </div>
  );
}
