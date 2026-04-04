import { useState, useEffect, useRef } from "react";

/* ───────── CONFIG ───────── */
const N8N_WEBHOOK_URL = "YOUR_N8N_WEBHOOK_URL_HERE";

// Login credentials — change these!
const LOGIN_USERS = [
  { username: "admin", password: "thehotspot2026" },
  { username: "ashir", password: "ibra@123" },
];

// Gmail OAuth Config — Replace with your Google Cloud Console credentials
// 1. Go to https://console.cloud.google.com
// 2. Create a project → Enable Gmail API
// 3. Create OAuth 2.0 credentials (Web Application)
// 4. Set redirect URI to: http://localhost:5173 (for dev) or your production URL
// 5. Paste your Client ID below
const GMAIL_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID_HERE";
const GMAIL_SCOPES = "https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send";
const GOOGLE_LOGIN_CLIENT_ID = GMAIL_CLIENT_ID; // Same client ID for Google Sign-In

/* ───────── ICONS (inline SVG) ───────── */
const I = {
  Send: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  Bot: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>,
  Mail: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>,
  Users: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Activity: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  Mic: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>,
  MicOff: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="2" y1="2" x2="22" y2="22"/><path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"/><path d="M5 10v2a7 7 0 0 0 12 5"/><path d="M15 9.34V5a3 3 0 0 0-5.68-1.33"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12"/><line x1="12" y1="19" x2="12" y2="22"/></svg>,
  Zap: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  Check: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Clock: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Right: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  Eye: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  EyeOff: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
  Logout: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
};

/* ───────── LOGIN PAGE ───────── */
function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    setTimeout(() => {
      const user = LOGIN_USERS.find(u => u.username === username && u.password === password);
      if (user) {
        localStorage.setItem("thehotspot_user", JSON.stringify({ username: user.username, method: "password" }));
        onLogin({ username: user.username, method: "password" });
      } else {
        setError("Invalid username or password");
        setLoading(false);
      }
    }, 800);
  };

  const handleGoogleLogin = () => {
    if (GOOGLE_LOGIN_CLIENT_ID === "YOUR_GOOGLE_CLIENT_ID_HERE") {
      // Demo mode
      const popup = window.open("", "Google Login", "width=450,height=550,left=300,top=100");
      popup.document.write(`
        <!DOCTYPE html>
        <html>
        <head><title>Google Sign-In</title></head>
        <body style="font-family:-apple-system,sans-serif;background:#1a1a2e;color:#e0e0e8;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;">
          <div style="background:#111118;border-radius:16px;padding:40px;text-align:center;max-width:340px;border:1px solid #2a2a3a;">
            <svg width="48" height="48" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
            <h2 style="margin:20px 0 8px;font-size:18px;">Sign in with Google</h2>
            <p style="color:#6b6b80;font-size:13px;margin-bottom:20px;">Use your Google account to access thehotspot</p>
            <input id="em" type="email" placeholder="Enter your email" style="width:100%;padding:10px 14px;border-radius:8px;border:1px solid #2a2a3a;background:#0c0c12;color:#e0e0e8;font-size:13px;margin-bottom:12px;outline:none;box-sizing:border-box;" />
            <button onclick="var e=document.getElementById('em').value;if(e){window.opener.postMessage({type:'google-login',email:e},'*');window.close();}else{document.getElementById('em').style.borderColor='#f87171';}" style="background:#4285F4;color:#fff;border:none;padding:11px 28px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;width:100%;font-family:sans-serif;">
              Continue
            </button>
          </div>
        </body>
        </html>
      `);
    } else {
      const redirectUri = window.location.origin;
      const authUrl = "https://accounts.google.com/o/oauth2/v2/auth?client_id=" + GOOGLE_LOGIN_CLIENT_ID + "&redirect_uri=" + encodeURIComponent(redirectUri) + "&response_type=token&scope=email%20profile&prompt=select_account";
      window.open(authUrl, "Google Login", "width=450,height=550,left=300,top=100");
    }
  };

  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === "google-login" && e.data?.email) {
        const userData = { username: e.data.email, method: "google", avatar: e.data.email[0].toUpperCase() };
        localStorage.setItem("thehotspot_user", JSON.stringify(userData));
        onLogin(userData);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [onLogin]);

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", background:"#09090d", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
      
      {/* Background glow effects */}
      <div style={{ position:"absolute", width:"400px", height:"400px", borderRadius:"50%", background:"radial-gradient(circle,#10b98115,transparent 70%)", top:"-100px", left:"-100px" }} />
      <div style={{ position:"absolute", width:"300px", height:"300px", borderRadius:"50%", background:"radial-gradient(circle,#0ea5e915,transparent 70%)", bottom:"-50px", right:"-50px" }} />

      <div style={{ width:"100%", maxWidth:420, padding:"0 20px", zIndex:1 }}>
        {/* Logo + Brand */}
        <div style={{ textAlign:"center", marginBottom:36 }}>
          <div style={{ width:56, height:56, borderRadius:14, background:"linear-gradient(135deg,#10b981,#0ea5e9)", display:"inline-flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:20, color:"#000", marginBottom:16 }}>TH</div>
          <div style={{ fontSize:28, fontWeight:700, color:"#f0f0f5", letterSpacing:-0.5 }}>thehotspot</div>
          <div style={{ fontSize:13, color:"#6b6b80", marginTop:4 }}>Grow Connections Easily</div>
        </div>

        {/* Login Card */}
        <div style={{ background:"#111116", border:"1px solid #1e1e28", borderRadius:20, padding:"32px 28px", boxShadow:"0 20px 60px rgba(0,0,0,0.4)" }}>
          <div style={{ fontSize:18, fontWeight:600, color:"#f0f0f5", marginBottom:4 }}>Welcome back</div>
          <div style={{ fontSize:13, color:"#6b6b80", marginBottom:24 }}>Sign in to access your dashboard</div>

          {/* Google Sign-In Button */}
          <button onClick={handleGoogleLogin} style={{
            width:"100%", padding:"12px", borderRadius:12, border:"1px solid #2a2a3a",
            background:"#0c0c12", color:"#e0e0e8", fontSize:14, fontWeight:500,
            cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
            gap:10, fontFamily:"'DM Sans',sans-serif", transition:"all .2s", marginBottom:20,
          }}
          onMouseEnter={e => { e.target.style.borderColor="#4285F4"; e.target.style.background="#4285F411"; }}
          onMouseLeave={e => { e.target.style.borderColor="#2a2a3a"; e.target.style.background="#0c0c12"; }}
          >
            <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
            <div style={{ flex:1, height:1, background:"#1e1e28" }} />
            <span style={{ fontSize:11, color:"#4a4a5a", fontWeight:500, textTransform:"uppercase", letterSpacing:1 }}>or</span>
            <div style={{ flex:1, height:1, background:"#1e1e28" }} />
          </div>

          {/* Username/Password Form */}
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:12, color:"#6b6b80", fontWeight:500, display:"block", marginBottom:6 }}>Username</label>
              <input
                type="text" value={username} onChange={e => setUsername(e.target.value)}
                placeholder="Enter username"
                style={{ width:"100%", padding:"11px 14px", borderRadius:10, border:"1px solid #2a2a3a", background:"#0c0c12", color:"#e0e0e8", fontSize:13, outline:"none", fontFamily:"'DM Sans',sans-serif", transition:"border-color .2s", boxSizing:"border-box" }}
                onFocus={e => e.target.style.borderColor="#10b981"}
                onBlur={e => e.target.style.borderColor="#2a2a3a"}
              />
            </div>
            <div style={{ marginBottom:20 }}>
              <label style={{ fontSize:12, color:"#6b6b80", fontWeight:500, display:"block", marginBottom:6 }}>Password</label>
              <div style={{ position:"relative" }}>
                <input
                  type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password"
                  style={{ width:"100%", padding:"11px 42px 11px 14px", borderRadius:10, border:"1px solid #2a2a3a", background:"#0c0c12", color:"#e0e0e8", fontSize:13, outline:"none", fontFamily:"'DM Sans',sans-serif", transition:"border-color .2s", boxSizing:"border-box" }}
                  onFocus={e => e.target.style.borderColor="#10b981"}
                  onBlur={e => e.target.style.borderColor="#2a2a3a"}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                  position:"absolute", right:10, top:"50%", transform:"translateY(-50%)",
                  background:"none", border:"none", color:"#6b6b80", cursor:"pointer", padding:4,
                }}>
                  {showPass ? <I.EyeOff /> : <I.Eye />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ background:"#2a0a0a", border:"1px solid #f8717133", color:"#f87171", padding:"10px 14px", borderRadius:10, fontSize:12, fontWeight:500, marginBottom:16, textAlign:"center" }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading || !username || !password} style={{
              width:"100%", padding:"12px", borderRadius:12, border:"none",
              background: (username && password) ? "linear-gradient(135deg,#10b981,#0ea5e9)" : "#1a1a28",
              color: (username && password) ? "#000" : "#6b6b80",
              fontSize:14, fontWeight:600, cursor: (username && password) ? "pointer" : "default",
              fontFamily:"'DM Sans',sans-serif", transition:"all .2s",
              display:"flex", alignItems:"center", justifyContent:"center", gap:8,
            }}>
              {loading ? (
                <>{[0,1,2].map(d => <div key={d} style={{ width:6, height:6, borderRadius:"50%", background:"#000", animation:`pulse 1.2s ease-in-out ${d*.2}s infinite` }} />)}</>
              ) : "Sign In"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div style={{ textAlign:"center", marginTop:24, fontSize:11, color:"#4a4a5a" }}>
          Protected by thehotspot security
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:.3;transform:scale(.9)} 50%{opacity:1;transform:scale(1.1)} }
        *{box-sizing:border-box;margin:0;padding:0}
        input::placeholder{color:#4a4a5a}
      `}</style>
    </div>
  );
}

/* ───────── CATEGORY COLORS ───────── */
const CAT = {
  Network: { bg: "#0f2922", text: "#34d399", dot: "#10b981" },
  CPS:     { bg: "#1a1a2e", text: "#818cf8", dot: "#6366f1" },
  CPL:     { bg: "#2a1a0e", text: "#fb923c", dot: "#f97316" },
  CPA:     { bg: "#2a0e2a", text: "#e879f9", dot: "#d946ef" },
  Mobile:  { bg: "#0e1a2a", text: "#38bdf8", dot: "#0ea5e9" },
};

/* ───────── SAMPLE DATA ───────── */
const CONTACTS = [
  { id:1, company:"AdCombo",           email:"biz@adcombo.com",       category:"Network",  status:"sent",   lastSent:"2 hrs ago" },
  { id:2, company:"ShareASale",        email:"partners@shareasale.com",category:"CPS",     status:"sent",   lastSent:"2 hrs ago" },
  { id:3, company:"MaxBounty",         email:"hello@maxbounty.com",   category:"CPA",      status:"queued", lastSent:null },
  { id:4, company:"Leadpages",         email:"team@leadpages.com",    category:"CPL",      status:"sent",   lastSent:"1 hr ago" },
  { id:5, company:"AppFlyer",          email:"connect@appflyer.com",  category:"Mobile",   status:"failed", lastSent:null },
  { id:6, company:"ClickDealer",       email:"ops@clickdealer.com",   category:"CPA",      status:"queued", lastSent:null },
  { id:7, company:"Perform[cb]",       email:"hi@performcb.com",      category:"Network",  status:"sent",   lastSent:"3 hrs ago" },
  { id:8, company:"InMobi",            email:"biz@inmobi.com",        category:"Mobile",   status:"sent",   lastSent:"1 hr ago" },
];

const STATS = { totalContacts: 531, emailsSent: 412, categories: 5, successRate: 94 };

/* ───────── SMART CHATBOT (works without API) ───────── */
const STATS_DATA = { totalContacts: 531, emailsSent: 412, categories: 5, successRate: 94 };

function getSmartResponse(text) {
  const lower = text.toLowerCase();
  const categories = ["network","cps","cpl","cpa","mobile"];
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
  app: { fontFamily:"'DM Sans',sans-serif", background:"#09090d", color:"#e0e0e8", minHeight:"100vh", display:"flex", flexDirection:"column", width:"100%", maxWidth:"100vw", overflow:"hidden" },
  header: { padding:"16px 28px", borderBottom:"1px solid #1a1a24", display:"flex", alignItems:"center", justifyContent:"space-between", background:"#0c0c12" },
  logo: { width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,#10b981,#0ea5e9)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:14, color:"#000" },
  layout: { flex:1, display:"flex", overflow:"hidden", height:"calc(100vh - 65px)" },
  content: { flex:1, padding:"24px 28px", overflowY:"auto" },
  sectionLabel: { fontSize:12, color:"#6b6b80", fontWeight:600, letterSpacing:1, textTransform:"uppercase", marginBottom:12 },
};

/* ───────── COMPONENTS ───────── */
function Badge({ status }) {
  const m = { sent:{ bg:"#052e16",c:"#4ade80",l:"Sent" }, queued:{ bg:"#1a1a2e",c:"#a78bfa",l:"Queued" }, failed:{ bg:"#2a0a0a",c:"#f87171",l:"Failed" } };
  const s = m[status] || m.queued;
  return <span style={{ background:s.bg, color:s.c, padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600, letterSpacing:.5, textTransform:"uppercase", border:`1px solid ${s.c}22` }}>{s.l}</span>;
}

function StatCard({ icon, label, value, accent, locked, onConnect, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={locked ? onConnect : onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ background:"#111116", border:`1px solid ${hover && !locked ? accent+"44" : "#1e1e28"}`, borderRadius:16, padding:"20px 22px", flex:1, minWidth:140, position:"relative", overflow:"hidden", opacity: locked ? 0.5 : 1, filter: locked ? "grayscale(0.5)" : "none", transition:"all .3s ease", cursor:"pointer", transform: hover && !locked ? "translateY(-2px)" : "none" }}>
      <div style={{ position:"absolute", top:0, right:0, width:80, height:80, background:`radial-gradient(circle at top right,${accent}15,transparent 70%)` }} />
      {locked && (
        <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"rgba(9,9,13,0.75)", zIndex:2, borderRadius:16, cursor:"pointer", backdropFilter:"blur(4px)" }} onClick={onConnect}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6b6b80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <div style={{ fontSize:10, color:"#6b6b80", marginTop:6, fontWeight:600, letterSpacing:.5, textTransform:"uppercase" }}>Connect Gmail</div>
        </div>
      )}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div style={{ color:accent, marginBottom:10, opacity:.9 }}>{icon}</div>
        {!locked && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={hover ? accent : "#4a4a5a"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition:"all .2s" }}><polyline points="9 18 15 12 9 6"/></svg>}
      </div>
      <div style={{ fontSize:28, fontWeight:700, color:"#f0f0f5", fontFamily:"'JetBrains Mono',monospace", letterSpacing:-1 }}>{locked ? "0" : value}</div>
      <div style={{ fontSize:12, color:"#6b6b80", marginTop:4, fontWeight:500, letterSpacing:.5, textTransform:"uppercase" }}>{label}</div>
    </div>
  );
}

/* ───────── DETAIL PAGES ───────── */
function BackButton({ onClick, label }) {
  return (
    <button onClick={onClick} style={{ display:"flex", alignItems:"center", gap:8, background:"none", border:"none", color:"#6b6b80", cursor:"pointer", fontSize:13, fontWeight:500, fontFamily:"'DM Sans',sans-serif", marginBottom:20, padding:0, transition:"color .2s" }}
      onMouseEnter={e => e.currentTarget.style.color="#f0f0f5"}
      onMouseLeave={e => e.currentTarget.style.color="#6b6b80"}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      Back to Dashboard
    </button>
  );
}

function TotalContactsPage({ onBack, gmailConnected }) {
  const contactsByCategory = [
    { cat: "Network", count: gmailConnected ? 142 : 0, color: CAT.Network },
    { cat: "CPS", count: gmailConnected ? 98 : 0, color: CAT.CPS },
    { cat: "CPL", count: gmailConnected ? 87 : 0, color: CAT.CPL },
    { cat: "CPA", count: gmailConnected ? 121 : 0, color: CAT.CPA },
    { cat: "Mobile", count: gmailConnected ? 83 : 0, color: CAT.Mobile },
  ];
  const total = contactsByCategory.reduce((s, c) => s + c.count, 0);
  const maxCount = Math.max(...contactsByCategory.map(c => c.count), 1);

  return (
    <div>
      <BackButton onClick={onBack} />
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:8 }}>
        <div style={{ width:40, height:40, borderRadius:12, background:"#10b98118", display:"flex", alignItems:"center", justifyContent:"center", color:"#10b981" }}><I.Users /></div>
        <div>
          <div style={{ fontSize:24, fontWeight:700, color:"#f0f0f5", fontFamily:"'JetBrains Mono',monospace" }}>{total}</div>
          <div style={{ fontSize:12, color:"#6b6b80", textTransform:"uppercase", letterSpacing:.5, fontWeight:600 }}>Total Contacts</div>
        </div>
      </div>
      {!gmailConnected && (
        <div style={{ background:"#2a1a0e", border:"1px solid #f9731633", borderRadius:12, padding:"14px 18px", marginBottom:20, marginTop:16, fontSize:13, color:"#fb923c" }}>
          Connect your Gmail to see contact data. Currently showing 0 contacts.
        </div>
      )}
      <div style={{ fontSize:12, color:"#6b6b80", fontWeight:600, letterSpacing:1, textTransform:"uppercase", marginBottom:12, marginTop:24 }}>Contacts by Category</div>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {contactsByCategory.map(c => (
          <div key={c.cat} style={{ background:"#111116", border:"1px solid #1e1e28", borderRadius:12, padding:"16px 18px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ width:8, height:8, borderRadius:"50%", background:c.color.dot, display:"inline-block" }} />
                <span style={{ fontSize:14, fontWeight:600, color:c.color.text }}>{c.cat}</span>
              </div>
              <span style={{ fontSize:18, fontWeight:700, color:"#f0f0f5", fontFamily:"'JetBrains Mono',monospace" }}>{c.count}</span>
            </div>
            <div style={{ width:"100%", height:6, background:"#1a1a28", borderRadius:3, overflow:"hidden" }}>
              <div style={{ width:`${(c.count/maxCount)*100}%`, height:"100%", background:c.color.dot, borderRadius:3, transition:"width .5s ease" }} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ background:"#111116", border:"1px solid #1e1e28", borderRadius:12, padding:"16px 18px", marginTop:16 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:13, color:"#6b6b80", fontWeight:500 }}>Recently Added</span>
          <span style={{ fontSize:11, color:"#4a4a5a" }}>Last 7 days</span>
        </div>
        <div style={{ fontSize:32, fontWeight:700, color:"#10b981", fontFamily:"'JetBrains Mono',monospace", marginTop:8 }}>{gmailConnected ? "+24" : "0"}</div>
      </div>
    </div>
  );
}

function EmailsSentPage({ onBack, gmailConnected }) {
  const emailsByDay = [
    { day:"Mon", sent: gmailConnected ? 67 : 0 },
    { day:"Tue", sent: gmailConnected ? 82 : 0 },
    { day:"Wed", sent: gmailConnected ? 45 : 0 },
    { day:"Thu", sent: gmailConnected ? 93 : 0 },
    { day:"Fri", sent: gmailConnected ? 58 : 0 },
    { day:"Sat", sent: gmailConnected ? 34 : 0 },
    { day:"Sun", sent: gmailConnected ? 33 : 0 },
  ];
  const total = emailsByDay.reduce((s, d) => s + d.sent, 0);
  const maxSent = Math.max(...emailsByDay.map(d => d.sent), 1);

  return (
    <div>
      <BackButton onClick={onBack} />
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:8 }}>
        <div style={{ width:40, height:40, borderRadius:12, background:"#6366f118", display:"flex", alignItems:"center", justifyContent:"center", color:"#6366f1" }}><I.Mail /></div>
        <div>
          <div style={{ fontSize:24, fontWeight:700, color:"#f0f0f5", fontFamily:"'JetBrains Mono',monospace" }}>{total}</div>
          <div style={{ fontSize:12, color:"#6b6b80", textTransform:"uppercase", letterSpacing:.5, fontWeight:600 }}>Emails Sent This Week</div>
        </div>
      </div>
      {!gmailConnected && (
        <div style={{ background:"#2a1a0e", border:"1px solid #f9731633", borderRadius:12, padding:"14px 18px", marginBottom:20, marginTop:16, fontSize:13, color:"#fb923c" }}>
          Connect your Gmail to see email stats. Currently showing 0 emails.
        </div>
      )}
      <div style={{ fontSize:12, color:"#6b6b80", fontWeight:600, letterSpacing:1, textTransform:"uppercase", marginBottom:12, marginTop:24 }}>Daily Breakdown</div>
      <div style={{ background:"#111116", border:"1px solid #1e1e28", borderRadius:16, padding:"20px" }}>
        <div style={{ display:"flex", alignItems:"flex-end", gap:8, height:160 }}>
          {emailsByDay.map(d => (
            <div key={d.day} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
              <span style={{ fontSize:11, color:"#6366f1", fontWeight:600, fontFamily:"'JetBrains Mono',monospace" }}>{d.sent}</span>
              <div style={{ width:"100%", maxWidth:40, height:`${(d.sent/maxSent)*120}px`, background:"linear-gradient(180deg,#6366f1,#6366f144)", borderRadius:"6px 6px 2px 2px", transition:"height .5s ease", minHeight:4 }} />
              <span style={{ fontSize:11, color:"#6b6b80", fontWeight:500 }}>{d.day}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginTop:16 }}>
        <div style={{ background:"#111116", border:"1px solid #1e1e28", borderRadius:12, padding:"16px" }}>
          <div style={{ fontSize:12, color:"#6b6b80", marginBottom:6 }}>Delivered</div>
          <div style={{ fontSize:22, fontWeight:700, color:"#4ade80", fontFamily:"'JetBrains Mono',monospace" }}>{gmailConnected ? "387" : "0"}</div>
        </div>
        <div style={{ background:"#111116", border:"1px solid #1e1e28", borderRadius:12, padding:"16px" }}>
          <div style={{ fontSize:12, color:"#6b6b80", marginBottom:6 }}>Failed</div>
          <div style={{ fontSize:22, fontWeight:700, color:"#f87171", fontFamily:"'JetBrains Mono',monospace" }}>{gmailConnected ? "25" : "0"}</div>
        </div>
      </div>
    </div>
  );
}

function CategoriesPage({ onBack }) {
  const categories = [
    { name:"Network", desc:"Affiliate network partners managing multiple programs", count:142, color:CAT.Network },
    { name:"CPS", desc:"Cost Per Sale — commission per successful sale", count:98, color:CAT.CPS },
    { name:"CPL", desc:"Cost Per Lead — payment per qualified lead", count:87, color:CAT.CPL },
    { name:"CPA", desc:"Cost Per Action — payment per specific user action", count:121, color:CAT.CPA },
    { name:"Mobile", desc:"Mobile marketing and app-based advertising", count:83, color:CAT.Mobile },
  ];

  return (
    <div>
      <BackButton onClick={onBack} />
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:24 }}>
        <div style={{ width:40, height:40, borderRadius:12, background:"#f9731618", display:"flex", alignItems:"center", justifyContent:"center", color:"#f97316" }}><I.Activity /></div>
        <div>
          <div style={{ fontSize:24, fontWeight:700, color:"#f0f0f5", fontFamily:"'JetBrains Mono',monospace" }}>5</div>
          <div style={{ fontSize:12, color:"#6b6b80", textTransform:"uppercase", letterSpacing:.5, fontWeight:600 }}>Active Categories</div>
        </div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {categories.map(c => (
          <div key={c.name} style={{ background:c.color.bg, border:`1px solid ${c.color.dot}33`, borderRadius:14, padding:"20px 22px", transition:"transform .2s", cursor:"pointer" }}
            onMouseEnter={e => e.currentTarget.style.transform="translateX(4px)"}
            onMouseLeave={e => e.currentTarget.style.transform="translateX(0)"}
          >
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                  <span style={{ width:10, height:10, borderRadius:"50%", background:c.color.dot, display:"inline-block" }} />
                  <span style={{ fontSize:16, fontWeight:700, color:c.color.text }}>{c.name}</span>
                </div>
                <div style={{ fontSize:12, color:"#6b6b80", marginLeft:18 }}>{c.desc}</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:24, fontWeight:700, color:c.color.text, fontFamily:"'JetBrains Mono',monospace" }}>{c.count}</div>
                <div style={{ fontSize:10, color:"#6b6b80", textTransform:"uppercase" }}>contacts</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SuccessRatePage({ onBack, gmailConnected }) {
  const rate = gmailConnected ? 94 : 0;
  const stats = [
    { label:"Total Sent", value: gmailConnected ? "412" : "0", color:"#818cf8" },
    { label:"Delivered", value: gmailConnected ? "387" : "0", color:"#4ade80" },
    { label:"Opened", value: gmailConnected ? "231" : "0", color:"#38bdf8" },
    { label:"Replied", value: gmailConnected ? "67" : "0", color:"#facc15" },
    { label:"Bounced", value: gmailConnected ? "18" : "0", color:"#f87171" },
    { label:"Failed", value: gmailConnected ? "7" : "0", color:"#f87171" },
  ];
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (rate / 100) * circumference;

  return (
    <div>
      <BackButton onClick={onBack} />
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:24 }}>
        <div style={{ width:40, height:40, borderRadius:12, background:"#0ea5e918", display:"flex", alignItems:"center", justifyContent:"center", color:"#0ea5e9" }}><I.Check /></div>
        <div>
          <div style={{ fontSize:12, color:"#6b6b80", textTransform:"uppercase", letterSpacing:.5, fontWeight:600 }}>Success Rate</div>
        </div>
      </div>
      {/* Circular Progress */}
      <div style={{ display:"flex", justifyContent:"center", marginBottom:32 }}>
        <div style={{ position:"relative", width:140, height:140 }}>
          <svg width="140" height="140" viewBox="0 0 120 120" style={{ transform:"rotate(-90deg)" }}>
            <circle cx="60" cy="60" r="54" stroke="#1e1e28" strokeWidth="8" fill="none" />
            <circle cx="60" cy="60" r="54" stroke={rate >= 80 ? "#10b981" : rate >= 50 ? "#facc15" : "#f87171"} strokeWidth="8" fill="none"
              strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
              style={{ transition:"stroke-dashoffset 1s ease" }} />
          </svg>
          <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
            <div style={{ fontSize:36, fontWeight:700, color:"#f0f0f5", fontFamily:"'JetBrains Mono',monospace" }}>{rate}%</div>
          </div>
        </div>
      </div>
      <div style={{ fontSize:12, color:"#6b6b80", fontWeight:600, letterSpacing:1, textTransform:"uppercase", marginBottom:12 }}>Breakdown</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background:"#111116", border:"1px solid #1e1e28", borderRadius:12, padding:"16px", textAlign:"center" }}>
            <div style={{ fontSize:20, fontWeight:700, color:s.color, fontFamily:"'JetBrains Mono',monospace" }}>{s.value}</div>
            <div style={{ fontSize:11, color:"#6b6b80", marginTop:4, fontWeight:500 }}>{s.label}</div>
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

  if (!user) return <LoginPage onLogin={setUser} />;

  return <Dashboard user={user} onLogout={() => { localStorage.removeItem("thehotspot_user"); setUser(null); }} />;
}

/* ───────── DASHBOARD ───────── */
function Dashboard({ user, onLogout }) {
  const [tab, setTab] = useState("dashboard");
  const [gmailConnected, setGmailConnected] = useState(false);
  const [messages, setMessages] = useState([
    { role:"assistant", content:"Hey! I'm your Outreach Assistant for thehotspot. I can send emails, manage contacts, check stats, or modify campaigns.\n\nTry saying:\n• \"Send emails to all Network companies\"\n• \"Show me the campaign status\"\n• \"Pause the outreach workflow\"\n\nWhat would you like to do?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [toast, setToast] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const chatEnd = useRef(null);
  const recog = useRef(null);

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);

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

  const connectGmail = () => {
    if (GMAIL_CLIENT_ID === "YOUR_GOOGLE_CLIENT_ID_HERE") {
      // Demo mode — show a mock Gmail login popup
      const popup = window.open("", "Gmail Connect", "width=500,height=600,left=200,top=100");
      popup.document.write(`
        <!DOCTYPE html>
        <html>
        <head><title>Connect Gmail</title></head>
        <body style="font-family:sans-serif;background:#1a1a2e;color:#e0e0e8;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;">
          <div style="background:#111118;border-radius:16px;padding:40px;text-align:center;max-width:360px;border:1px solid #2a2a3a;">
            <svg width="48" height="48" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
            <h2 style="margin:20px 0 8px;font-size:20px;">Sign in with Google</h2>
            <p style="color:#6b6b80;font-size:13px;margin-bottom:24px;">Connect your Gmail to enable contact tracking and email stats</p>
            <button onclick="window.opener.postMessage('gmail-connected','*');window.close();" style="background:#4285F4;color:#fff;border:none;padding:12px 32px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;font-family:sans-serif;transition:background .2s;" onmouseover="this.style.background='#3367D6'" onmouseout="this.style.background='#4285F4'">
              Connect Gmail Account
            </button>
            <p style="color:#4a4a5a;font-size:11px;margin-top:16px;">This will allow thehotspot to read contact info and send emails on your behalf.</p>
          </div>
        </body>
        </html>
      `);
    } else {
      // Real OAuth flow
      const redirectUri = window.location.origin;
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GMAIL_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(GMAIL_SCOPES)}&prompt=consent`;
      window.open(authUrl, "Gmail Connect", "width=500,height=600,left=200,top=100");
    }
  };

  // Listen for Gmail connect message from popup
  useEffect(() => {
    const handler = (e) => {
      if (e.data === "gmail-connected") {
        setGmailConnected(true);
        showToast("Gmail connected successfully! 🎉");
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const toggleVoice = () => {
    if (!recog.current) return showToast("Voice not supported");
    if (listening) { recog.current.stop(); setListening(false); }
    else { recog.current.start(); setListening(true); }
  };

  const executeAction = (action) => {
    if (!action) return;
    const labels = { send_emails:`Triggering emails for ${action.category||"all"}...`, pause_workflow:"Workflow paused", resume_workflow:"Workflow resumed", show_stats:"Stats loaded" };
    showToast(labels[action.type] || "Action executed");
    // Production: fetch(N8N_WEBHOOK_URL, { method:"POST", body:JSON.stringify(action) })
  };

  const handleSend = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    const userMsg = { role:"user", content:msg };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // Small delay to feel natural
    await new Promise(r => setTimeout(r, 600 + Math.random() * 800));

    const response = getSmartResponse(msg);
    setMessages(prev => [...prev, { role:"assistant", content:response.text }]);
    if (response.action) executeAction(response.action);
    setLoading(false);
  };

  return (
    <div style={S.app}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* TOAST */}
      {toast && (
        <div style={{ position:"fixed", top:20, right:20, background:"#10b981", color:"#000", padding:"12px 20px", borderRadius:12, fontSize:13, fontWeight:600, zIndex:1000, display:"flex", alignItems:"center", gap:8, boxShadow:"0 8px 32px #10b98144", animation:"slideIn .3s ease" }}>
          <I.Zap /> {toast}
        </div>
      )}

      {/* HEADER */}
      <header className="header-inner" style={{ padding:"16px 28px", borderBottom:"1px solid #1a1a24", display:"flex", alignItems:"center", justifyContent:"space-between", background:"#0c0c12", width:"100%" }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <div style={S.logo}>TH</div>
          <div>
            <div style={{ fontWeight:700, fontSize:15, letterSpacing:-.3, color:"#f0f0f5" }}>thehotspot</div>
            <div style={{ fontSize:11, color:"#6b6b80", letterSpacing:.5 }}>Grow Connections Easily</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:4, alignItems:"center" }}>
          {/* Desktop Tabs */}
          <div className="desktop-tabs" style={{ display:"flex", gap:4 }}>
            {["dashboard","contacts","chat"].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                background: tab===t ? "#1a1a28" : "transparent",
                border: tab===t ? "1px solid #2a2a3a" : "1px solid transparent",
                borderRadius:8, padding:"7px 16px", color: tab===t ? "#f0f0f5" : "#6b6b80",
                fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", textTransform:"capitalize", transition:"all .2s"
              }}>{t}</button>
            ))}
          </div>
          {/* Mobile Menu Button */}
          <div className="mobile-menu-btn" style={{ display:"none", gap:4 }}>
            {["dashboard","contacts","chat"].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                background: tab===t ? "#1a1a28" : "transparent",
                border: tab===t ? "1px solid #2a2a3a" : "1px solid transparent",
                borderRadius:8, padding:"6px 10px", color: tab===t ? "#f0f0f5" : "#6b6b80",
                fontSize:11, fontWeight:500, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", textTransform:"capitalize",
              }}>{t === "dashboard" ? "📊" : t === "contacts" ? "👤" : "💬"}</button>
            ))}
          </div>
          <div style={{ width:1, height:24, background:"#2a2a3a", margin:"0 8px" }} />
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:28, height:28, borderRadius:"50%", background:"linear-gradient(135deg,#10b981,#0ea5e9)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"#000" }}>
              {user?.avatar || user?.username?.[0]?.toUpperCase() || "U"}
            </div>
            <span className="user-name-text" style={{ fontSize:12, color:"#8888a0", maxWidth:100, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user?.username}</span>
            <button onClick={onLogout} title="Logout" style={{
              background:"none", border:"1px solid #2a2a3a", borderRadius:8, padding:"6px 8px",
              color:"#6b6b80", cursor:"pointer", display:"flex", alignItems:"center", transition:"all .2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor="#f87171"; e.currentTarget.style.color="#f87171"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor="#2a2a3a"; e.currentTarget.style.color="#6b6b80"; }}
            >
              <I.Logout />
            </button>
          </div>
        </div>
      </header>

      <div className="main-layout" style={S.layout}>
        {/* ───── CHATBOT (PRIMARY) ───── */}
        <div className="chat-main" style={{
          flex:1, display:"flex", flexDirection:"column", background:"#0c0c12", minWidth:0,
        }}>
          {/* Chat Header */}
          <div style={{ padding:"16px 20px", borderBottom:"1px solid #1a1a24", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#10b981,#0ea5e9)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <I.Bot />
              </div>
              <div>
                <div style={{ fontSize:14, fontWeight:600, color:"#f0f0f5" }}>Outreach Assistant</div>
                <div style={{ fontSize:11, color:"#10b981", display:"flex", alignItems:"center", gap:4 }}>
                  <span style={{ width:6, height:6, borderRadius:"50%", background:"#10b981", display:"inline-block" }} /> Online
                </div>
              </div>
            </div>
            {/* Toggle sidebar button for mobile */}
            <button className="sidebar-toggle" onClick={() => setShowSidebar(!showSidebar)} style={{
              background:"#18182a", border:"1px solid #2a2a3a", borderRadius:8, padding:"6px 10px",
              color:"#6b6b80", cursor:"pointer", display:"none", alignItems:"center", gap:6, fontSize:12, fontFamily:"'DM Sans',sans-serif",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
              {showSidebar ? "Hide" : "Menu"}
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex:1, overflowY:"auto", padding:16, display:"flex", flexDirection:"column", gap:12 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display:"flex", justifyContent: m.role==="user" ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth:"85%", padding:"12px 16px", fontSize:13, lineHeight:1.6, whiteSpace:"pre-wrap",
                  borderRadius: m.role==="user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  background: m.role==="user" ? "linear-gradient(135deg,#10b981,#0ea5e9)" : "#18182a",
                  color: m.role==="user" ? "#000" : "#d0d0e0",
                  fontWeight: m.role==="user" ? 500 : 400,
                  border: m.role==="user" ? "none" : "1px solid #2a2a3a",
                }}>{m.content}</div>
              </div>
            ))}
            {loading && (
              <div style={{ display:"flex", justifyContent:"flex-start" }}>
                <div style={{ padding:"12px 18px", borderRadius:"16px 16px 16px 4px", background:"#18182a", border:"1px solid #2a2a3a", display:"flex", alignItems:"center", gap:6 }}>
                  {[0,1,2].map(d => <div key={d} style={{ width:7, height:7, borderRadius:"50%", background:"#10b981", animation:`pulse 1.2s ease-in-out ${d*.2}s infinite` }} />)}
                </div>
              </div>
            )}
            <div ref={chatEnd} />
          </div>

          {/* Input */}
          <div style={{ padding:"14px 16px", borderTop:"1px solid #1a1a24", display:"flex", gap:8, alignItems:"center" }}>
            <button onClick={toggleVoice} style={{
              width:40, height:40, borderRadius:"50%", flexShrink:0, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all .2s",
              background: listening ? "#10b98133" : "#18182a",
              border: listening ? "2px solid #10b981" : "1px solid #2a2a3a",
              color: listening ? "#10b981" : "#6b6b80",
              animation: listening ? "pulse 1.5s ease-in-out infinite" : "none",
            }}>
              {listening ? <I.MicOff /> : <I.Mic />}
            </button>
            <input
              type="text" value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key==="Enter" && handleSend()}
              placeholder={listening ? "Listening..." : "Type a command or ask anything..."}
              style={{
                flex:1, background:"#111118", border:"1px solid #2a2a3a", borderRadius:12,
                padding:"11px 16px", color:"#e0e0e8", fontSize:13, outline:"none",
                fontFamily:"'DM Sans',sans-serif", transition:"border-color .2s",
              }}
              onFocus={e => e.target.style.borderColor="#10b981"}
              onBlur={e => e.target.style.borderColor="#2a2a3a"}
            />
            <button onClick={() => handleSend()} disabled={loading || !input.trim()} style={{
              width:40, height:40, borderRadius:"50%", border:"none", cursor: input.trim() ? "pointer" : "default",
              background: input.trim() ? "linear-gradient(135deg,#10b981,#0ea5e9)" : "#18182a",
              color: input.trim() ? "#000" : "#6b6b80",
              display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all .2s",
            }}>
              <I.Send />
            </button>
          </div>
        </div>

        {/* ───── SIDEBAR (DASHBOARD/DETAILS) ───── */}
        <div className={`sidebar-panel ${showSidebar ? "open" : ""}`} style={{
          width: 400, borderLeft:"1px solid #1a1a24", overflowY:"auto", background:"#09090d",
          padding:"20px",
        }}>
          {/* Sidebar Tab Switcher */}
          <div style={{ display:"flex", gap:4, marginBottom:20 }}>
            {["dashboard","contacts"].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                background: tab===t || (tab !== "contacts" && t === "dashboard") ? "#1a1a28" : "transparent",
                border: tab===t || (tab !== "contacts" && t === "dashboard") ? "1px solid #2a2a3a" : "1px solid transparent",
                borderRadius:8, padding:"6px 14px", color: tab===t || (tab !== "contacts" && t === "dashboard") ? "#f0f0f5" : "#6b6b80",
                fontSize:12, fontWeight:500, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", textTransform:"capitalize",
              }}>{t}</button>
            ))}
          </div>

          {/* DASHBOARD VIEW */}
          {tab !== "contacts" && tab !== "totalContacts" && tab !== "emailsSent" && tab !== "categories" && tab !== "successRate" && (
            <>
              {/* Stats */}
              <div className="stat-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
                <StatCard icon={<I.Users/>} label="Total Contacts" value={gmailConnected ? STATS.totalContacts : 0} accent="#10b981" locked={!gmailConnected} onConnect={connectGmail} onClick={() => setTab("totalContacts")} />
                <StatCard icon={<I.Mail/>} label="Emails Sent" value={gmailConnected ? STATS.emailsSent : 0} accent="#6366f1" locked={!gmailConnected} onConnect={connectGmail} onClick={() => setTab("emailsSent")} />
                <StatCard icon={<I.Activity/>} label="Categories" value={STATS.categories} accent="#f97316" onClick={() => setTab("categories")} />
                <StatCard icon={<I.Check/>} label="Success Rate" value={`${STATS.successRate}%`} accent="#0ea5e9" onClick={() => setTab("successRate")} />
              </div>

              {/* Quick Actions */}
              <div style={{ marginBottom:20 }}>
                <div style={S.sectionLabel}>Quick Actions</div>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {[
                    { icon:<I.Mail/>, label:"Send All Emails", cmd:"Send outreach emails to all categories" },
                    { icon:<I.Activity/>, label:"Campaign Status", cmd:"Show me the campaign status" },
                    { icon:<I.Clock/>, label:"Pause Workflow", cmd:"Pause the outreach workflow" },
                    { icon:<I.Zap/>, label:"Resume Workflow", cmd:"Resume the outreach workflow" },
                  ].map((a,i) => (
                    <button key={i} onClick={() => handleSend(a.cmd)} style={{
                      background:"#111116", border:"1px solid #1e1e28", borderRadius:10, padding:"12px 14px",
                      color:"#a0a0b0", cursor:"pointer", display:"flex", alignItems:"center", gap:8,
                      fontSize:12, fontWeight:500, fontFamily:"'DM Sans',sans-serif", transition:"all .2s",
                    }}>
                      {a.icon} {a.label} <span style={{ marginLeft:"auto", opacity:.4 }}><I.Right/></span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Buttons */}
              <div style={{ marginBottom:20 }}>
                <div style={S.sectionLabel}>Send by Category</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  {Object.entries(CAT).map(([name, c]) => (
                    <button key={name} onClick={() => handleSend(`Send outreach emails to all ${name} companies`)} style={{
                      background:c.bg, border:`1px solid ${c.dot}33`, borderRadius:10, padding:12,
                      color:c.text, cursor:"pointer", textAlign:"left", fontFamily:"'DM Sans',sans-serif", transition:"all .2s",
                    }}>
                      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
                        <span style={{ width:6, height:6, borderRadius:"50%", background:c.dot, display:"inline-block" }} />
                        <span style={{ fontSize:13, fontWeight:600 }}>{name}</span>
                      </div>
                      <div style={{ fontSize:10, opacity:.6 }}>Tap to send</div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* CONTACTS VIEW */}
          {tab === "contacts" && (
            <div>
              <div style={S.sectionLabel}>Contact Database</div>
              <div style={{ overflowX:"auto" }}>
                <div className="table-wrapper" style={{ background:"#111116", border:"1px solid #1e1e28", borderRadius:12, overflow:"hidden" }}>
                  <table style={{ width:"100%", borderCollapse:"collapse", minWidth:500 }}>
                    <thead>
                      <tr style={{ borderBottom:"1px solid #1e1e28" }}>
                        {["Company","Email","Category","Status"].map(h => (
                          <th key={h} style={{ padding:"10px 12px", textAlign:"left", fontSize:10, fontWeight:600, color:"#6b6b80", letterSpacing:.5, textTransform:"uppercase" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {CONTACTS.map((c,i) => (
                        <tr key={c.id} style={{ borderBottom: i<CONTACTS.length-1 ? "1px solid #1a1a24" : "none" }}>
                          <td style={{ padding:"10px 12px", fontSize:12, fontWeight:600, color:"#f0f0f5" }}>{c.company}</td>
                          <td style={{ padding:"10px 12px", fontSize:11, color:"#8888a0", fontFamily:"'JetBrains Mono',monospace" }}>{c.email}</td>
                          <td style={{ padding:"10px 12px" }}>
                            <span style={{ display:"inline-flex", alignItems:"center", gap:4, background:CAT[c.category]?.bg, color:CAT[c.category]?.text, padding:"3px 8px", borderRadius:12, fontSize:10, fontWeight:600 }}>
                              <span style={{ width:5, height:5, borderRadius:"50%", background:CAT[c.category]?.dot }} />
                              {c.category}
                            </span>
                          </td>
                          <td style={{ padding:"10px 12px" }}><Badge status={c.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* DETAIL PAGES */}
          {tab === "totalContacts" && <TotalContactsPage onBack={() => setTab("dashboard")} gmailConnected={gmailConnected} />}
          {tab === "emailsSent" && <EmailsSentPage onBack={() => setTab("dashboard")} gmailConnected={gmailConnected} />}
          {tab === "categories" && <CategoriesPage onBack={() => setTab("dashboard")} />}
          {tab === "successRate" && <SuccessRatePage onBack={() => setTab("dashboard")} gmailConnected={gmailConnected} />}
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:.3;transform:scale(.9)} 50%{opacity:1;transform:scale(1.1)} }
        @keyframes slideIn { from{transform:translateX(100px);opacity:0} to{transform:translateX(0);opacity:1} }
        *{box-sizing:border-box;margin:0;padding:0}
        html,body,#root{width:100%;height:100%;margin:0;padding:0;background:#09090d;}
        ::-webkit-scrollbar{width:6px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:#2a2a3a;border-radius:3px}
        input::placeholder{color:#4a4a5a}

        .sidebar-toggle{display:none !important}

        @media(max-width:768px){
          .desktop-tabs{display:none !important}
          .mobile-menu-btn{display:flex !important}
          .sidebar-toggle{display:flex !important}
          .sidebar-panel{
            position:fixed !important;
            top:60px !important;
            right:0 !important;
            width:85vw !important;
            max-width:360px !important;
            height:calc(100vh - 60px) !important;
            z-index:100 !important;
            box-shadow:-8px 0 32px rgba(0,0,0,0.6) !important;
            transform:translateX(100%) !important;
            transition:transform .3s ease !important;
          }
          .sidebar-panel.open{
            transform:translateX(0) !important;
          }
          .chat-main{width:100% !important}
          .stat-grid{display:grid !important;grid-template-columns:1fr 1fr !important;gap:10px !important}
          .quick-grid{grid-template-columns:1fr !important}
          .cat-grid{grid-template-columns:1fr 1fr !important}
          .user-name-text{display:none !important}
          .table-wrapper{overflow-x:auto}
          table{min-width:600px}
        }
      `}</style>
    </div>
  );
}
