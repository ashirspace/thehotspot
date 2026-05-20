import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LuCheck, LuX, LuChevronLeft, LuGlobe, LuLayoutDashboard, LuStar, LuZap, LuUsers, LuFileText, LuMessageSquare, LuAlignLeft, LuUser, LuSettings, LuRadio, LuMail } from "react-icons/lu";

const FF = "'DM Sans', sans-serif";
const C = { card: "#111116", border: "#ffffff12", text: "#F1F5F9", muted: "#64748B", purple: "#6366f1", green: "#10b981", red: "#ef4444", blue: "#0ea5e9", bg2: "#0d0d12", bg: "#09090d" };

// ── All CMS defaults ─────────────────────────────────────────────────────────
const D = {
  // Login / Landing
  nav_brand: "thehotspot", hero_cta_secondary: "Sign In",
  hero_badge: "AI-Powered Outreach Platform",
  hero_title_line1: "Stop chasing clients.", hero_title_line2: "Let AI do the work.",
  hero_subtitle: "thehotspot is your always-on outbound engine. It finds leads, writes personalised emails, sends campaigns, follows up automatically, and tracks every open — while you focus on closing.",
  hero_cta_primary: "Get Started Free",
  stats_1_value: "12", stats_1_label: "AI Agents",
  stats_2_value: "50+", stats_2_label: "Emails / Day",
  stats_3_value: "3-Step", stats_3_label: "Auto Follow-ups",
  stats_4_value: "Live", stats_4_label: "Open Tracking",
  features_eyebrow: "What We Provide", features_title: "Everything you need to scale outreach", features_subtitle: "Six modules working together so you never have to touch the pipeline manually.",
  feat1_title: "Lead Generation", feat1_desc: "AI finds qualified prospects in any industry or region and adds them to your contacts instantly.",
  feat2_title: "Cold Email Campaigns", feat2_desc: "Unique, personalised emails for every contact — written by AI, never copy-paste.",
  feat3_title: "Follow-up Sequences", feat3_desc: "3-step automated drip at Day 0, 3, and 7. Stops the moment a prospect replies.",
  feat4_title: "Campaign Analytics", feat4_desc: "Real-time open and click tracking embedded in every email you send.",
  feat5_title: "Contact Database", feat5_desc: "Organise hundreds of contacts across Network, CPS, CPL, CPA, and Mobile.",
  feat6_title: "Gmail Integration", feat6_desc: "Emails send from your own Gmail. Better deliverability, real sender trust.",
  agents_eyebrow: "Meet the Team", agents_title: "12 AI agents working for you 24/7", agents_subtitle: "Each agent has one job and does it better than any human could — at any scale.",
  agent1_name: "Email Sequence Builder", agent1_role: "Email Automation", agent1_desc: "Generate a full 2-5 email cold outreach sequence with follow-up timing built in — ready to copy and send.",
  agent2_name: "Lead Finder", agent2_role: "Prospect Discovery", agent2_desc: "Search for qualified B2B companies by industry, location, and size. Returns a ready-to-outreach prospect table.",
  agent3_name: "Campaign Dashboard", agent3_role: "Analytics & Reporting", agent3_desc: "Live charts of opens, clicks, and delivery stats across all your email campaigns at a glance.",
  agent4_name: "CRM Lite", agent4_role: "Contact Management", agent4_desc: "Browse and inline-edit your entire contact database. Click any cell to update it in real time.",
  agent5_name: "Email Writer Agent", agent5_role: "Content Generation", agent5_desc: "Writes a unique, personalised cold email for every single contact — never the same email twice.",
  agent6_name: "Follow-up Agent", agent6_role: "Reply Detection & Drip", agent6_desc: "Monitors Gmail threads, detects replies, and sends follow-ups only to contacts who haven't responded.",
  outcomes_eyebrow: "The Outcome", outcomes_title: "How thehotspot grows your business", outcomes_subtitle: "Real results, not vanity metrics — what you'll see in your pipeline after week one.",
  outcome1_title: "Consistent pipeline at scale", outcome1_desc: "Your AI agent runs outreach daily so your pipeline never dries up — even when you're offline.",
  outcome2_title: "Zero missed follow-ups", outcome2_desc: "Most deals close on the 2nd or 3rd touch. The follow-up agent handles every sequence automatically.",
  outcome3_title: "Hyper-personalised at volume", outcome3_desc: "Every email is written for that specific company — not a blast. Higher reply rates, more conversions.",
  outcome4_title: "Know what's working", outcome4_desc: "Open and click data tells you exactly which campaigns and subject lines get the best response.",
  cta_title: "Ready to automate your outreach?", cta_subtitle: "Join businesses using AI to fill their pipeline on autopilot.", cta_button: "Start for Free",
  footer_tagline: "We build AI systems and web products that help businesses move faster and scale smarter.", footer_copyright: "© 2026 thehotspot. All rights reserved.",
  // Home page
  hp_subtitle: "Your B2B outreach platform — find leads, write emails, run campaigns, and detect replies at scale.",
  hp_p1_title: "Lead Input", hp_p1_desc: "Import leads from spreadsheets, connect CRM tools, or add contacts manually.", hp_p1_cta: "Manage Contacts",
  hp_p2_title: "AI Engine", hp_p2_desc: "GPT-4o-mini writes personalized outreach using templates and contact variables.", hp_p2_cta: "Open Templates",
  hp_p3_title: "Outreach Channels", hp_p3_desc: "Send emails via Gmail today. LinkedIn, WhatsApp, and SMS are on the roadmap.", hp_p3_cta: "Send Emails",
  hp_p4_title: "Sequence / Campaign Manager", hp_p4_desc: "Multi-step follow-up sequences that stop automatically when a reply is detected.", hp_p4_cta: "View Campaigns",
  hp_p5_title: "Reply Detection & Inbox", hp_p5_desc: "Detect and classify replies as interested, not interested, or out of office — automatically.", hp_p5_cta: "Check Replies",
  // Dashboard page
  dp_tagline: "Here's your outreach hub.",
  dp_stat1_label: "Contacts", dp_stat1_sub: "in database",
  dp_stat2_label: "Emails Sent", dp_stat2_sub: "total delivered",
  dp_stat3_label: "Categories", dp_stat3_sub: "active groups",
  dp_stat4_label: "Success Rate", dp_stat4_sub: "delivery rate",
  // Contacts page
  cp_title: "Contacts Database", cp_subtitle: "Connect an existing data source or build your database from scratch.",
  cp_card1_title: "Connect Data Source", cp_card1_desc: "Import contacts from Google Sheets, Airtable, or CSV files you already have.",
  cp_card2_title: "Create New Database", cp_card2_desc: "Start fresh — define custom fields, add contacts manually, build your list from scratch.",
  // Campaigns page
  camp_title: "Campaign Status",
  // Templates page
  tp_title: "Email Templates",
  // Settings page
  sp_title: "Settings",
  // Profile page
  pp_section1_label: "Account Info", pp_section2_label: "Platform Stats",
};

// ── Page definitions ─────────────────────────────────────────────────────────
const PAGES = [
  { id: "login",     label: "Login Page",     url: "thehotspot.in/",                  color: "#10b981", Icon: LuGlobe,         desc: "Public landing page for new visitors" },
  { id: "home",      label: "Home Page",       url: "thehotspot.in/ (logged in)",      color: "#6366f1", Icon: LuLayoutDashboard, desc: "Dashboard home shown after login" },
  { id: "dashboard", label: "Dashboard Page",  url: "thehotspot.in/dashboard",         color: "#0ea5e9", Icon: LuStar,          desc: "Analytics, stats, and tool shortcuts" },
  { id: "contacts",  label: "Contacts Page",   url: "thehotspot.in/contacts",          color: "#f59e0b", Icon: LuUsers,         desc: "Contact database hub" },
  { id: "campaigns", label: "Campaigns Page",  url: "thehotspot.in/campaign-status",   color: "#ec4899", Icon: LuRadio,         desc: "Campaign tracking and history" },
  { id: "templates", label: "Template Page",   url: "thehotspot.in/email-templates",   color: "#14b8a6", Icon: LuMail,          desc: "Email template picker and generator" },
  { id: "settings",  label: "Settings Page",   url: "thehotspot.in/settings",          color: "#64748B", Icon: LuSettings,      desc: "Account preferences and integrations" },
  { id: "profile",   label: "Profile Page",    url: "thehotspot.in/profile",           color: "#f97316", Icon: LuUser,          desc: "User profile and account info" },
];

// ── Section configs per page ─────────────────────────────────────────────────
const SECTIONS = {
  login: {
    header: {
      label: "Header & Nav",
      groups: [{ title: "Navigation Bar", keys: [["nav_brand","Brand Name"],["hero_cta_secondary","Sign In Button Text"]] }],
    },
    body: {
      label: "Body",
      groups: [
        { title: "Hero Section", keys: [["hero_badge","Badge Text"],["hero_title_line1","Title Line 1"],["hero_title_line2","Title Line 2 (gradient)"],["hero_subtitle","Subtitle",true],["hero_cta_primary","Primary CTA Button"]] },
        { title: "Stats Bar", keys: [["stats_1_value","Stat 1 Value"],["stats_1_label","Stat 1 Label"],["stats_2_value","Stat 2 Value"],["stats_2_label","Stat 2 Label"],["stats_3_value","Stat 3 Value"],["stats_3_label","Stat 3 Label"],["stats_4_value","Stat 4 Value"],["stats_4_label","Stat 4 Label"]] },
        { title: "Features Section", keys: [["features_eyebrow","Eyebrow Label"],["features_title","Section Title"],["features_subtitle","Section Subtitle",true],["feat1_title","Feature 1 Title"],["feat1_desc","Feature 1 Desc"],["feat2_title","Feature 2 Title"],["feat2_desc","Feature 2 Desc"],["feat3_title","Feature 3 Title"],["feat3_desc","Feature 3 Desc"],["feat4_title","Feature 4 Title"],["feat4_desc","Feature 4 Desc"],["feat5_title","Feature 5 Title"],["feat5_desc","Feature 5 Desc"],["feat6_title","Feature 6 Title"],["feat6_desc","Feature 6 Desc"]] },
        { title: "AI Agents Section", keys: [["agents_eyebrow","Eyebrow Label"],["agents_title","Section Title"],["agents_subtitle","Section Subtitle",true],["agent1_name","Agent 1 Name"],["agent1_role","Agent 1 Role"],["agent1_desc","Agent 1 Desc",true],["agent2_name","Agent 2 Name"],["agent2_role","Agent 2 Role"],["agent2_desc","Agent 2 Desc",true],["agent3_name","Agent 3 Name"],["agent3_role","Agent 3 Role"],["agent3_desc","Agent 3 Desc",true],["agent4_name","Agent 4 Name"],["agent4_role","Agent 4 Role"],["agent4_desc","Agent 4 Desc",true],["agent5_name","Agent 5 Name"],["agent5_role","Agent 5 Role"],["agent5_desc","Agent 5 Desc",true],["agent6_name","Agent 6 Name"],["agent6_role","Agent 6 Role"],["agent6_desc","Agent 6 Desc",true]] },
        { title: "Outcomes Section", keys: [["outcomes_eyebrow","Eyebrow Label"],["outcomes_title","Section Title"],["outcomes_subtitle","Section Subtitle",true],["outcome1_title","Outcome 1 Title"],["outcome1_desc","Outcome 1 Desc"],["outcome2_title","Outcome 2 Title"],["outcome2_desc","Outcome 2 Desc"],["outcome3_title","Outcome 3 Title"],["outcome3_desc","Outcome 3 Desc"],["outcome4_title","Outcome 4 Title"],["outcome4_desc","Outcome 4 Desc"]] },
        { title: "Final CTA Section", keys: [["cta_title","Heading"],["cta_subtitle","Subtext"],["cta_button","Button Text"]] },
      ],
    },
    footer: {
      label: "Footer",
      groups: [{ title: "Footer Content", keys: [["footer_tagline","Brand Tagline",true],["footer_copyright","Copyright Text"]] }],
    },
  },
  home: {
    header: {
      label: "Header",
      groups: [{ title: "Page Header", keys: [["hp_subtitle","Header Subtitle",true]] }],
    },
    body: {
      label: "Body",
      groups: [
        { title: "Pillar 1 — Lead Input", keys: [["hp_p1_title","Title"],["hp_p1_desc","Description"],["hp_p1_cta","CTA Button"]] },
        { title: "Pillar 2 — AI Engine", keys: [["hp_p2_title","Title"],["hp_p2_desc","Description"],["hp_p2_cta","CTA Button"]] },
        { title: "Pillar 3 — Outreach Channels", keys: [["hp_p3_title","Title"],["hp_p3_desc","Description"],["hp_p3_cta","CTA Button"]] },
        { title: "Pillar 4 — Campaign Manager", keys: [["hp_p4_title","Title"],["hp_p4_desc","Description"],["hp_p4_cta","CTA Button"]] },
        { title: "Pillar 5 — Reply Detection", keys: [["hp_p5_title","Title"],["hp_p5_desc","Description"],["hp_p5_cta","CTA Button"]] },
      ],
    },
    footer: { label: "Footer", groups: [{ title: "Not Applicable", keys: [] }] },
  },
  dashboard: {
    header: {
      label: "Header",
      groups: [{ title: "Page Header", keys: [["dp_tagline","Greeting Tagline"]] }],
    },
    body: {
      label: "Body",
      groups: [
        { title: "Stat Cards", keys: [["dp_stat1_label","Stat 1 Label"],["dp_stat1_sub","Stat 1 Sub-label"],["dp_stat2_label","Stat 2 Label"],["dp_stat2_sub","Stat 2 Sub-label"],["dp_stat3_label","Stat 3 Label"],["dp_stat3_sub","Stat 3 Sub-label"],["dp_stat4_label","Stat 4 Label"],["dp_stat4_sub","Stat 4 Sub-label"]] },
      ],
    },
    footer: { label: "Footer", groups: [{ title: "Not Applicable", keys: [] }] },
  },
  contacts: {
    header: {
      label: "Header",
      groups: [{ title: "Page Header", keys: [["cp_title","Page Title"],["cp_subtitle","Page Subtitle",true]] }],
    },
    body: {
      label: "Body",
      groups: [
        { title: "Connect Data Source Card", keys: [["cp_card1_title","Card Title"],["cp_card1_desc","Card Description",true]] },
        { title: "Create New Database Card", keys: [["cp_card2_title","Card Title"],["cp_card2_desc","Card Description",true]] },
      ],
    },
    footer: { label: "Footer", groups: [{ title: "Not Applicable", keys: [] }] },
  },
  campaigns: {
    header: {
      label: "Header",
      groups: [{ title: "Page Header", keys: [["camp_title","Page Title"]] }],
    },
    body: { label: "Body", groups: [{ title: "No editable static body content", keys: [] }] },
    footer: { label: "Footer", groups: [{ title: "Not Applicable", keys: [] }] },
  },
  templates: {
    header: {
      label: "Header",
      groups: [{ title: "Page Header", keys: [["tp_title","Page Title"]] }],
    },
    body: { label: "Body", groups: [{ title: "No editable static body content", keys: [] }] },
    footer: { label: "Footer", groups: [{ title: "Not Applicable", keys: [] }] },
  },
  settings: {
    header: {
      label: "Header",
      groups: [{ title: "Page Header", keys: [["sp_title","Page Title"]] }],
    },
    body: { label: "Body", groups: [{ title: "No editable static body content", keys: [] }] },
    footer: { label: "Footer", groups: [{ title: "Not Applicable", keys: [] }] },
  },
  profile: {
    header: {
      label: "Header",
      groups: [{ title: "No editable header text (shows user's name)", keys: [] }],
    },
    body: {
      label: "Body",
      groups: [{ title: "Section Labels", keys: [["pp_section1_label","Section 1 Label"],["pp_section2_label","Section 2 Label"]] }],
    },
    footer: { label: "Footer", groups: [{ title: "Not Applicable", keys: [] }] },
  },
};

// ── API helper ───────────────────────────────────────────────────────────────
async function adminApi(body) {
  const r = await fetch("/api/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return r.json();
}

const inpStyle = { width: "100%", background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 12px", fontSize: 13, color: C.text, fontFamily: FF, outline: "none", boxSizing: "border-box" };
const lblStyle = { fontSize: 11, fontWeight: 700, color: C.muted, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 };

function Field({ label, k, vals, set, multiline = false }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={lblStyle}>{label}</label>
      {multiline
        ? <textarea value={vals[k] ?? D[k] ?? ""} onChange={e => set(v => ({ ...v, [k]: e.target.value }))} rows={3} style={{ ...inpStyle, resize: "vertical" }} />
        : <input type="text" value={vals[k] ?? D[k] ?? ""} onChange={e => set(v => ({ ...v, [k]: e.target.value }))} style={inpStyle} />
      }
    </div>
  );
}

function GroupCard({ group, vals, set, onSave, saving, saved }) {
  const hasKeys = group.keys.length > 0;
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, marginBottom: 12, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", borderBottom: hasKeys ? `1px solid ${C.border}` : "none", background: "#0d0d1260" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.6 }}>{group.title}</div>
        {hasKeys && (
          <button onClick={onSave} disabled={saving} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 7, border: "none", background: saved ? C.green : C.purple, color: "#fff", fontSize: 11, fontWeight: 700, cursor: saving ? "default" : "pointer", fontFamily: FF, opacity: saving ? 0.7 : 1, transition: "background 0.3s" }}>
            {saved ? <><LuCheck size={11} /> Saved</> : saving ? "…" : "Save"}
          </button>
        )}
      </div>
      {hasKeys ? (
        <div style={{ padding: "16px 18px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
          {group.keys.map(([k, lbl, multi]) =>
            (multi
              ? <div key={k} style={{ gridColumn: "span 2" }}><Field label={lbl} k={k} vals={vals} set={set} multiline /></div>
              : <Field key={k} label={lbl} k={k} vals={vals} set={set} />
            )
          )}
        </div>
      ) : (
        <div style={{ padding: "14px 18px", fontSize: 12, color: C.muted, fontStyle: "italic" }}>Nothing to edit here — this section is fully dynamic.</div>
      )}
    </div>
  );
}

function SectionBlock({ sectionDef, vals, set, showToast }) {
  const [states, setStates] = useState({});

  async function saveGroup(groupIdx, keys) {
    setStates(s => ({ ...s, [groupIdx]: "saving" }));
    try {
      const entries = keys.map(([k]) => ({ key: k, value: vals[k] ?? D[k] ?? "" }));
      const d = await adminApi({ action: "setContentBulk", entries });
      if (d.ok) {
        showToast("Saved.");
        setStates(s => ({ ...s, [groupIdx]: "saved" }));
        setTimeout(() => setStates(s => ({ ...s, [groupIdx]: null })), 2500);
      } else {
        showToast("Save failed.", "error");
        setStates(s => ({ ...s, [groupIdx]: null }));
      }
    } catch {
      showToast("Network error.", "error");
      setStates(s => ({ ...s, [groupIdx]: null }));
    }
  }

  return (
    <div>
      {sectionDef.groups.map((grp, i) => (
        <GroupCard
          key={i}
          group={grp}
          vals={vals}
          set={set}
          onSave={() => saveGroup(i, grp.keys)}
          saving={states[i] === "saving"}
          saved={states[i] === "saved"}
        />
      ))}
    </div>
  );
}

function PagePicker({ onSelect }) {
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: -0.5 }}>Main Pages</div>
        <div style={{ fontSize: 13, color: C.muted, marginTop: 3 }}>Select a page to edit its content</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
        {PAGES.map(({ id, label, url, color, Icon, desc }) => (
          <button key={id} onClick={() => onSelect(id)} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 20px", cursor: "pointer", textAlign: "left", fontFamily: FF, transition: "border-color 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = `${color}55`}
            onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
          >
            <div style={{ width: 40, height: 40, borderRadius: 11, background: `${color}18`, border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center", color, marginBottom: 12 }}>
              <Icon size={18} />
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 3 }}>{label}</div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 10, lineHeight: 1.5 }}>{desc}</div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, color, background: `${color}12`, border: `1px solid ${color}25`, borderRadius: 20, padding: "2px 10px" }}>
              <LuGlobe size={10} /> {url}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function PageEditor({ pageId, vals, set, loading, showToast }) {
  const navigate = useNavigate();
  const pageDef = PAGES.find(p => p.id === pageId);
  const sections = SECTIONS[pageId];
  if (!pageDef || !sections) return <div style={{ color: C.muted, padding: 40, textAlign: "center" }}>Unknown page.</div>;

  const [activeTab, setActiveTab] = useState("header");
  const tabs = ["header", "body", "footer"];

  const tabBtn = (tab) => {
    const isActive = activeTab === tab;
    const tabLabel = sections[tab]?.label || tab;
    return (
      <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: "8px 20px", borderRadius: 8, border: isActive ? `1px solid ${pageDef.color}40` : `1px solid ${C.border}`, background: isActive ? `${pageDef.color}18` : "transparent", color: isActive ? pageDef.color : C.muted, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: FF, transition: "all 0.15s" }}>
        {tabLabel}
      </button>
    );
  };

  return (
    <div>
      {/* Back + title */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 24 }}>
        <button onClick={() => navigate("/admin/pages")} style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: FF, flexShrink: 0, marginTop: 2 }}>
          <LuChevronLeft size={14} /> Back
        </button>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: `${pageDef.color}18`, border: `1px solid ${pageDef.color}30`, display: "flex", alignItems: "center", justifyContent: "center", color: pageDef.color, flexShrink: 0 }}>
              <pageDef.Icon size={15} />
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.text, letterSpacing: -0.4 }}>{pageDef.label}</div>
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, color: pageDef.color, background: `${pageDef.color}12`, border: `1px solid ${pageDef.color}25`, borderRadius: 20, padding: "2px 10px" }}>
            <LuGlobe size={10} /> {pageDef.url}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {tabs.map(tabBtn)}
      </div>

      {/* Section content */}
      {loading
        ? <div style={{ color: C.muted, fontSize: 13, textAlign: "center", padding: 40 }}>Loading content…</div>
        : <SectionBlock sectionDef={sections[activeTab]} vals={vals} set={set} showToast={showToast} />
      }
    </div>
  );
}

export default function AdminPages() {
  const { pageId } = useParams();
  const navigate = useNavigate();
  const [vals, setVals] = useState({});
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  function showToast(msg, type = "success") { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); }

  useEffect(() => {
    adminApi({ action: "getAllContent" })
      .then(d => { setVals(d.content || {}); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ fontFamily: FF }}>
      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, background: toast.type === "error" ? C.red : C.green, color: "#fff", padding: "12px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.4)", display: "flex", alignItems: "center", gap: 8 }}>
          {toast.type === "error" ? <LuX size={14} /> : <LuCheck size={14} />}
          {toast.msg}
        </div>
      )}

      {pageId
        ? <PageEditor pageId={pageId} vals={vals} set={setVals} loading={loading} showToast={showToast} />
        : <PagePicker onSelect={id => navigate(`/admin/pages/${id}`)} />
      }
    </div>
  );
}
