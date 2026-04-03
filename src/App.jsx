import { useState, useEffect, useRef } from "react";

/* ───────── CONFIG ───────── */
const N8N_WEBHOOK_URL = "YOUR_N8N_WEBHOOK_URL_HERE";

// Gmail OAuth Config — Replace with your Google Cloud Console credentials
// 1. Go to https://console.cloud.google.com
// 2. Create a project → Enable Gmail API
// 3. Create OAuth 2.0 credentials (Web Application)
// 4. Set redirect URI to: http://localhost:5173 (for dev) or your production URL
// 5. Paste your Client ID below
const GMAIL_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID_HERE";
const GMAIL_SCOPES = "https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send";

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
};

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
  app: { fontFamily:"'DM Sans',sans-serif", background:"#09090d", color:"#e0e0e8", minHeight:"100vh", display:"flex", flexDirection:"column" },
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

function StatCard({ icon, label, value, accent, locked, onConnect }) {
  return (
    <div style={{ background:"#111116", border:`1px solid ${locked ? "#1e1e28" : "#1e1e28"}`, borderRadius:16, padding:"20px 22px", flex:1, minWidth:140, position:"relative", overflow:"hidden", opacity: locked ? 0.5 : 1, filter: locked ? "grayscale(0.5)" : "none", transition:"all .3s ease" }}>
      <div style={{ position:"absolute", top:0, right:0, width:80, height:80, background:`radial-gradient(circle at top right,${accent}15,transparent 70%)` }} />
      {locked && (
        <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"rgba(9,9,13,0.75)", zIndex:2, borderRadius:16, cursor:"pointer", backdropFilter:"blur(4px)" }} onClick={onConnect}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6b6b80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <div style={{ fontSize:10, color:"#6b6b80", marginTop:6, fontWeight:600, letterSpacing:.5, textTransform:"uppercase" }}>Connect Gmail</div>
        </div>
      )}
      <div style={{ color:accent, marginBottom:10, opacity:.9 }}>{icon}</div>
      <div style={{ fontSize:28, fontWeight:700, color:"#f0f0f5", fontFamily:"'JetBrains Mono',monospace", letterSpacing:-1 }}>{locked ? "—" : value}</div>
      <div style={{ fontSize:12, color:"#6b6b80", marginTop:4, fontWeight:500, letterSpacing:.5, textTransform:"uppercase" }}>{label}</div>
    </div>
  );
}

/* ───────── MAIN APP ───────── */
export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [gmailConnected, setGmailConnected] = useState(false);
  const [messages, setMessages] = useState([
    { role:"assistant", content:"Hey! I'm your Outreach Assistant for thehotspot. I can send emails, manage contacts, check stats, or modify campaigns.\n\nTry saying:\n• \"Send emails to all Network companies\"\n• \"Show me the campaign status\"\n• \"Pause the outreach workflow\"\n\nWhat would you like to do?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [toast, setToast] = useState(null);
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
      <header style={S.header}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <div style={S.logo}>TH</div>
          <div>
            <div style={{ fontWeight:700, fontSize:15, letterSpacing:-.3, color:"#f0f0f5" }}>thehotspot</div>
            <div style={{ fontSize:11, color:"#6b6b80", letterSpacing:.5 }}>Grow Connections Easily</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:4 }}>
          {["dashboard","contacts","chat"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              background: tab===t ? "#1a1a28" : "transparent",
              border: tab===t ? "1px solid #2a2a3a" : "1px solid transparent",
              borderRadius:8, padding:"7px 16px", color: tab===t ? "#f0f0f5" : "#6b6b80",
              fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", textTransform:"capitalize", transition:"all .2s"
            }}>{t}</button>
          ))}
        </div>
      </header>

      <div style={S.layout}>
        {/* ───── CONTENT AREA ───── */}
        {tab !== "chat" && (
          <div style={S.content}>

            {/* DASHBOARD */}
            {tab === "dashboard" && <>
              {/* Stats */}
              <div style={{ display:"flex", gap:14, marginBottom:28, flexWrap:"wrap" }}>
                <StatCard icon={<I.Users/>} label="Total Contacts" value={STATS.totalContacts} accent="#10b981" locked={!gmailConnected} onConnect={connectGmail} />
                <StatCard icon={<I.Mail/>}  label="Emails Sent"    value={STATS.emailsSent}    accent="#6366f1" locked={!gmailConnected} onConnect={connectGmail} />
                <StatCard icon={<I.Activity/>} label="Categories"  value={STATS.categories}    accent="#f97316" />
                <StatCard icon={<I.Check/>} label="Success Rate"   value={`${STATS.successRate}%`} accent="#0ea5e9" />
              </div>

              {/* Quick Actions */}
              <div style={{ marginBottom:28 }}>
                <div style={S.sectionLabel}>Quick Actions</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:10 }}>
                  {[
                    { icon:<I.Mail/>,     label:"Send All Emails",  cmd:"Send outreach emails to all categories" },
                    { icon:<I.Activity/>,  label:"Campaign Status",  cmd:"Show me the campaign status" },
                    { icon:<I.Clock/>,     label:"Pause Workflow",   cmd:"Pause the outreach workflow" },
                    { icon:<I.Zap/>,       label:"Resume Workflow",  cmd:"Resume the outreach workflow" },
                  ].map((a,i) => (
                    <button key={i} onClick={() => handleSend(a.cmd)} style={{
                      background:"#111116", border:"1px solid #1e1e28", borderRadius:12, padding:"14px 18px",
                      color:"#a0a0b0", cursor:"pointer", display:"flex", alignItems:"center", gap:10,
                      fontSize:13, fontWeight:500, fontFamily:"'DM Sans',sans-serif", transition:"all .2s", whiteSpace:"nowrap"
                    }}>
                      {a.icon} {a.label} <span style={{ marginLeft:"auto", opacity:.4 }}><I.Right/></span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Buttons */}
              <div style={{ marginBottom:28 }}>
                <div style={S.sectionLabel}>Send by Category</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:10 }}>
                  {Object.entries(CAT).map(([name, c]) => (
                    <button key={name} onClick={() => handleSend(`Send outreach emails to all ${name} companies`)} style={{
                      background:c.bg, border:`1px solid ${c.dot}33`, borderRadius:12, padding:16,
                      color:c.text, cursor:"pointer", textAlign:"left", fontFamily:"'DM Sans',sans-serif", transition:"all .2s"
                    }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                        <span style={{ width:8, height:8, borderRadius:"50%", background:c.dot, display:"inline-block" }} />
                        <span style={{ fontSize:14, fontWeight:600 }}>{name}</span>
                      </div>
                      <div style={{ fontSize:11, opacity:.6 }}>Tap to send</div>
                    </button>
                  ))}
                </div>
              </div>
            </>}

            {/* CONTACTS */}
            {tab === "contacts" && (
              <div>
                <div style={S.sectionLabel}>Contact Database</div>
                <div style={{ background:"#111116", border:"1px solid #1e1e28", borderRadius:16, overflow:"hidden" }}>
                  <table style={{ width:"100%", borderCollapse:"collapse" }}>
                    <thead>
                      <tr style={{ borderBottom:"1px solid #1e1e28" }}>
                        {["Company","Email","Category","Status","Last Sent"].map(h => (
                          <th key={h} style={{ padding:"14px 18px", textAlign:"left", fontSize:11, fontWeight:600, color:"#6b6b80", letterSpacing:.5, textTransform:"uppercase" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {CONTACTS.map((c,i) => (
                        <tr key={c.id} style={{ borderBottom: i<CONTACTS.length-1 ? "1px solid #1a1a24" : "none" }}>
                          <td style={{ padding:"14px 18px", fontSize:13, fontWeight:600, color:"#f0f0f5" }}>{c.company}</td>
                          <td style={{ padding:"14px 18px", fontSize:12, color:"#8888a0", fontFamily:"'JetBrains Mono',monospace" }}>{c.email}</td>
                          <td style={{ padding:"14px 18px" }}>
                            <span style={{ display:"inline-flex", alignItems:"center", gap:6, background:CAT[c.category]?.bg, color:CAT[c.category]?.text, padding:"4px 12px", borderRadius:20, fontSize:11, fontWeight:600 }}>
                              <span style={{ width:6, height:6, borderRadius:"50%", background:CAT[c.category]?.dot }} />
                              {c.category}
                            </span>
                          </td>
                          <td style={{ padding:"14px 18px" }}><Badge status={c.status} /></td>
                          <td style={{ padding:"14px 18px", fontSize:12, color:"#6b6b80" }}>{c.lastSent || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ───── CHAT PANEL ───── */}
        <div style={{
          width: tab==="chat" ? "100%" : 380,
          borderLeft: tab==="chat" ? "none" : "1px solid #1a1a24",
          display:"flex", flexDirection:"column", background:"#0c0c12",
        }}>
          {/* Chat Header */}
          <div style={{ padding:"16px 20px", borderBottom:"1px solid #1a1a24", display:"flex", alignItems:"center", gap:10 }}>
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
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:.3;transform:scale(.9)} 50%{opacity:1;transform:scale(1.1)} }
        @keyframes slideIn { from{transform:translateX(100px);opacity:0} to{transform:translateX(0);opacity:1} }
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:6px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:#2a2a3a;border-radius:3px}
        input::placeholder{color:#4a4a5a}
      `}</style>
    </div>
  );
}
