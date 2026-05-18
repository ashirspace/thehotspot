import "./agents.css";
import { lazy, Suspense, useState, useEffect } from "react";
import { useParams, useNavigate, NavLink } from "react-router-dom";
import {
  Search, Target, Globe, Mail, FlaskConical, Inbox, FileText,
  Swords, Link2, BarChart3, Users, ArrowUpDown,
  LayoutDashboard, House, Radio, FilePen, Settings,
  Sparkles,
} from "lucide-react";

// ─── Agent registry ───────────────────────────────────────────────────────────

const AGENTS = [
  { id: "lead-finder",            label: "Lead Finder",            tagline: "Discover B2B companies at scale",     Icon: Search,       accent: "#10b981", page: "LeadFinder",            gradientFrom: "rgba(16,185,129,0.18)",  gradientMid: "rgba(16,185,129,0.06)" },
  { id: "lead-scoring",           label: "Lead Scoring",           tagline: "Qualify every prospect with AI",      Icon: Target,       accent: "#f59e0b", page: "LeadScoring",           gradientFrom: "rgba(245,158,11,0.18)",  gradientMid: "rgba(245,158,11,0.06)" },
  { id: "landing-page-analyzer",  label: "Landing Page Analyzer",  tagline: "CRO audits in seconds",               Icon: Globe,        accent: "#0ea5e9", page: "LandingPageAnalyzer",   gradientFrom: "rgba(14,165,233,0.18)",  gradientMid: "rgba(14,165,233,0.06)" },
  { id: "email-sequence-builder", label: "Email Sequence Builder", tagline: "Multi-step outreach, crafted by AI",  Icon: Mail,         accent: "#8b5cf6", page: "EmailSequenceBuilder",  gradientFrom: "rgba(139,92,246,0.18)",  gradientMid: "rgba(139,92,246,0.06)" },
  { id: "ab-email-tester",        label: "A/B Email Tester",       tagline: "Pick the winner before you send",    Icon: FlaskConical, accent: "#ec4899", page: "ABEmailTester",         gradientFrom: "rgba(236,72,153,0.18)",  gradientMid: "rgba(236,72,153,0.06)" },
  { id: "reply-detector",         label: "Reply Detector",         tagline: "Classify intent. Respond instantly.", Icon: Inbox,        accent: "#f97316", page: "ReplyDetector",         gradientFrom: "rgba(249,115,22,0.18)",  gradientMid: "rgba(249,115,22,0.06)" },
  { id: "blog-generator",         label: "Blog Generator",         tagline: "SEO-ready content, on demand",        Icon: FileText,     accent: "#14b8a6", page: "BlogGenerator",         gradientFrom: "rgba(20,184,166,0.18)",  gradientMid: "rgba(20,184,166,0.06)" },
  { id: "competitor-analyzer",    label: "Competitor Analyzer",    tagline: "Full SWOT. Clear positioning.",       Icon: Swords,       accent: "#6366f1", page: "CompetitorAnalyzer",    gradientFrom: "rgba(99,102,241,0.18)",  gradientMid: "rgba(99,102,241,0.06)" },
  { id: "backlink-outreach",      label: "Backlink Outreach",      tagline: "Find prospects. Write the email.",   Icon: Link2,        accent: "#10b981", page: "BacklinkOutreach",      gradientFrom: "rgba(16,185,129,0.18)",  gradientMid: "rgba(16,185,129,0.06)" },
  { id: "campaign-dashboard",     label: "Campaign Dashboard",     tagline: "Live metrics for every send",         Icon: BarChart3,    accent: "#0ea5e9", page: "CampaignDashboard",     gradientFrom: "rgba(14,165,233,0.18)",  gradientMid: "rgba(14,165,233,0.06)" },
  { id: "crm-lite",               label: "CRM Lite",               tagline: "Your contacts, always in reach",     Icon: Users,        accent: "#8b5cf6", page: "CRMLite",               gradientFrom: "rgba(139,92,246,0.18)",  gradientMid: "rgba(139,92,246,0.06)" },
  { id: "csv-import-export",      label: "CSV Import / Export",    tagline: "Bulk contacts in, data out",          Icon: ArrowUpDown,  accent: "#f59e0b", page: "CSVImportExport",       gradientFrom: "rgba(245,158,11,0.18)",  gradientMid: "rgba(245,158,11,0.06)" },
];

const AGENT_MAP = Object.fromEntries(AGENTS.map(a => [a.id, a]));

// ─── Main nav items (mirrors dashboard sidebar) ────────────────────────────────

const MAIN_NAV = [
  { label: "Home",      href: "/",                Icon: House },
  { label: "Dashboard", href: "/dashboard",        Icon: LayoutDashboard },
  { label: "Contacts",  href: "/contacts",         Icon: Users  },
  { label: "Campaigns", href: "/campaign-status",  Icon: Radio },
  { label: "Templates", href: "/email-templates",  Icon: FilePen },
  { label: "Settings",  href: "/settings",         Icon: Settings },
];

// ─── Lazy page loader ─────────────────────────────────────────────────────────

const pageCache = {};
function LazyPage({ name }) {
  if (!pageCache[name]) {
    pageCache[name] = lazy(() => import(`./pages/${name}.jsx`));
  }
  const Page = pageCache[name];
  return (
    <Suspense fallback={<div className="text-muted text-sm py-12 text-center">Loading agent...</div>}>
      <Page />
    </Suspense>
  );
}

// ─── Splash screen ────────────────────────────────────────────────────────────

function SplashScreen({ cfg, onDone }) {
  const [phase, setPhase] = useState("in");
  const { Icon, label, tagline, accent, gradientFrom, gradientMid } = cfg;

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("out"), 1600);
    const t2 = setTimeout(() => onDone(), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9800,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        background: `radial-gradient(ellipse at 50% 40%, ${gradientFrom} 0%, ${gradientMid} 45%, #09090d 75%)`,
        transition: "opacity 0.55s ease",
        opacity: phase === "out" ? 0 : 1,
        pointerEvents: phase === "out" ? "none" : "all",
      }}
    >
      <div style={{ position: "absolute", width: 320, height: 320, borderRadius: "50%", border: `1px solid ${accent}30`, animation: "splashRing 2s ease-out forwards" }} />
      <div style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", border: `1px solid ${accent}20`, animation: "splashRing 2s ease-out 0.2s forwards" }} />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 80, height: 80, borderRadius: 20, background: `${accent}18`, border: `1.5px solid ${accent}35`, marginBottom: 24, animation: "splashIcon 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards", opacity: 0 }}>
        <Icon size={36} style={{ color: accent }} />
      </div>
      <p style={{ fontSize: 28, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.5px", animation: "splashText 0.5s ease 0.25s forwards", opacity: 0 }}>{label}</p>
      <p style={{ fontSize: 13, color: "#6b7280", marginTop: 8, animation: "splashText 0.5s ease 0.4s forwards", opacity: 0 }}>{tagline}</p>
      <div style={{ display: "flex", gap: 6, marginTop: 36, animation: "splashText 0.5s ease 0.55s forwards", opacity: 0 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: accent, animation: `splashDot 1.2s ease ${i * 0.2}s infinite` }} />
        ))}
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ currentAgentId }) {
  const navigate = useNavigate();

  return (
    <aside style={{
      width: 224, flexShrink: 0, display: "flex", flexDirection: "column",
      background: "#0d0d12", borderRight: "1px solid #1e1e26",
      height: "100vh", position: "sticky", top: 0, overflowY: "auto",
    }}>
      {/* Brand */}
      <div style={{ padding: "18px 16px 14px", borderBottom: "1px solid #1e1e26" }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.3px" }}>thehotspot</div>
        <div style={{ fontSize: 10, color: "#475569", marginTop: 1, letterSpacing: "0.06em" }}>outreach platform</div>
      </div>

      {/* Main nav */}
      <div style={{ padding: "8px 8px 0" }}>
        <p style={{ fontSize: 9, fontWeight: 700, color: "#334155", letterSpacing: "0.1em", textTransform: "uppercase", padding: "8px 8px 4px" }}>Platform</p>
        {MAIN_NAV.map(({ label, href, Icon }) => (
          <a
            key={href}
            href={href}
            style={{
              display: "flex", alignItems: "center", gap: 9, width: "100%",
              padding: "8px 10px", marginBottom: 1, borderRadius: 7,
              color: "#64748b", fontSize: 13, fontWeight: 400,
              textDecoration: "none", transition: "all .12s",
              borderLeft: "2px solid transparent",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#ffffff06"; e.currentTarget.style.color = "#94a3b8"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#64748b"; }}
          >
            <Icon size={14} style={{ flexShrink: 0 }} />
            {label}
          </a>
        ))}
      </div>

      {/* Divider */}
      <div style={{ borderTop: "1px solid #1e1e26", margin: "10px 0 0" }} />

      {/* Agent list */}
      <div style={{ padding: "8px 8px", flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 8px 6px" }}>
          <Sparkles size={11} style={{ color: "#6366f1" }} />
          <p style={{ fontSize: 9, fontWeight: 700, color: "#334155", letterSpacing: "0.1em", textTransform: "uppercase" }}>AI Agents</p>
        </div>
        {AGENTS.map(({ id, label, Icon, accent }) => {
          const isActive = id === currentAgentId;
          return (
            <button
              key={id}
              onClick={() => navigate(`/agents/${id}`)}
              style={{
                display: "flex", alignItems: "center", gap: 8, width: "100%",
                padding: "7px 10px", marginBottom: 1, borderRadius: 7,
                background: isActive ? `${accent}12` : "transparent",
                borderLeft: isActive ? `2px solid ${accent}` : "2px solid transparent",
                color: isActive ? "#f1f5f9" : "#64748b",
                fontWeight: isActive ? 600 : 400,
                fontSize: 12, fontFamily: "ui-sans-serif, system-ui, sans-serif",
                border: "none", cursor: "pointer", textAlign: "left",
                transition: "all .12s",
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = "#ffffff06"; e.currentTarget.style.color = "#94a3b8"; } }}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#64748b"; } }}
            >
              <Icon size={13} style={{ color: isActive ? accent : "inherit", flexShrink: 0 }} />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid #1e1e26", padding: "10px 16px 14px" }}>
        <span style={{ fontSize: 10, color: "#334155" }}>© 2026 thehotspot</span>
      </div>
    </aside>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function AgentsLayout() {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const [splashDone, setSplashDone] = useState(false);

  const cfg = AGENT_MAP[agentId];

  // New splash on every agent switch
  useEffect(() => {
    setSplashDone(false);
  }, [agentId]);

  if (!cfg) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#09090d" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#f1f5f9", marginBottom: 12 }}>Agent not found.</p>
          <button onClick={() => navigate("/")} style={{ fontSize: 13, color: "#10b981", background: "none", border: "none", cursor: "pointer" }}>Back to dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", background: "#09090d", color: "#f1f5f9", fontFamily: "ui-sans-serif, system-ui, sans-serif", overflow: "hidden" }}>
      {/* Splash */}
      {!splashDone && <SplashScreen cfg={cfg} onDone={() => setSplashDone(true)} />}

      {/* Sidebar */}
      <Sidebar currentAgentId={agentId} />

      {/* Main content */}
      <div style={{ flex: 1, overflowY: "auto", opacity: splashDone ? 1 : 0, transition: "opacity 0.3s ease" }}>
        <main style={{ maxWidth: 1060, margin: "0 auto", padding: "36px 28px 80px" }}>
          <LazyPage name={cfg.page} />
        </main>
      </div>

      <style>{`
        @keyframes splashRing { from { transform: scale(0.6); opacity: 0.8; } to { transform: scale(1.1); opacity: 0; } }
        @keyframes splashIcon { from { transform: scale(0.5) translateY(10px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
        @keyframes splashText { from { transform: translateY(8px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes splashDot  { 0%,100% { transform: translateY(0); opacity: 0.3; } 50% { transform: translateY(-6px); opacity: 1; } }
      `}</style>
    </div>
  );
}
