import "./agents.css";
import { lazy, Suspense, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MessageSquareText, Search, Mail, House, LayoutDashboard, Users, Radio,
  Send, FilePen, Inbox, Settings,
} from "lucide-react";

// ─── Agent registry ───────────────────────────────────────────────────────────

const AGENTS = [
  { id: "linkedin-dm-outreach", label: "LinkedIn DM Outreach", tagline: "Categorize prospects and draft personal DMs", Icon: MessageSquareText, accent: "#0ea5e9", page: "LinkedInDMOutreach", gradientFrom: "rgba(14,165,233,0.18)", gradientMid: "rgba(14,165,233,0.06)" },
];

const AGENT_MAP = Object.fromEntries(AGENTS.map(a => [a.id, a]));

const DASHBOARD_NAV = [
  { label: "Home", href: "/", Icon: House },
  { label: "Dashboard", href: "/dashboard", Icon: LayoutDashboard },
  { label: "Contacts", href: "/contacts", Icon: Users },
  { label: "Campaigns", href: "/campaign-status", Icon: Radio },
  { label: "LinkedIn DM", href: "/agents/linkedin-dm-outreach", Icon: MessageSquareText, active: true },
  { label: "Email Sender", href: "/email-sender", Icon: Send },
  { label: "Templates", href: "/email-templates", Icon: FilePen },
  { label: "Inbox", href: "/inbox", Icon: Inbox },
  { label: "Settings", href: "/settings", Icon: Settings },
];

const AGENT_THEME = {
  ink: "#0f172a",
  soft: "#64748b",
  faint: "#94a3b8",
  line: "#e2e8f0",
  surface: "#f8fafc",
  card: "#ffffff",
  teal: "#0d9488",
  tealDark: "#0f766e",
  tealTint: "#f0fdfa",
  tealLight: "#ccfbf1",
  pageBg: "radial-gradient(ellipse 84% 40% at 8% 2%, rgba(204,251,241,0.58) 0%, transparent 56%), radial-gradient(ellipse 60% 32% at 92% 10%, rgba(224,242,254,0.62) 0%, transparent 58%), #ffffff",
  font: "var(--font-sans, 'Roboto', ui-sans-serif, system-ui, sans-serif)",
  displayFont: "var(--font-display, 'Roboto', ui-sans-serif, system-ui, sans-serif)",
};

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

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("thehotspot_user") || "null");
  } catch {
    return null;
  }
}

function DashboardTopbar({ cfg, user }) {
  const initial = user?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U";

  return (
    <div className="dash-topbar">
      <button
        onClick={() => { window.location.href = "/dashboard"; }}
        className="dash-wordmark"
        style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
      >
        <img className="dash-wordmark-mark" src="/logo.png" alt="" aria-hidden="true" />
        thehotspot
      </button>
      <span className="dash-breadcrumb rsp-breadcrumb">
        <span className="dash-breadcrumb-sep">/</span>
        Intelligence
        <span className="dash-breadcrumb-sep">/</span>
        {cfg.label}
      </span>
      <div className="dash-topbar-right">
        <label className="dash-search rsp-gmail-badge">
          <Search size={14} style={{ flexShrink: 0 }} />
          <input placeholder="Search campaigns, contacts..." readOnly />
          <span className="dash-kbd">⌘K</span>
        </label>
        <button
          className="dash-icon-btn"
          onClick={() => { window.location.href = "/settings"; }}
          title={user?.gmailToken ? "Gmail connected" : "Connect Gmail"}
        >
          <Mail size={17} style={{ color: user?.gmailToken ? "var(--teal)" : "var(--text-soft)" }} />
        </button>
        <button
          className="dash-avatar"
          onClick={() => { window.location.href = "/profile"; }}
          title="Profile"
        >
          {initial}
        </button>
      </div>
    </div>
  );
}

function DashboardNavBar() {
  return (
    <nav className="agent-dashboard-nav" aria-label="Dashboard navigation">
      <div className="agent-dashboard-nav-inner">
        {DASHBOARD_NAV.map(({ label, href, Icon, active }) => (
          <a
            key={href}
            href={href}
            className={`agent-dashboard-nav-item${active ? " is-active" : ""}`}
          >
            <Icon size={16} />
            <span>{label}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}

// ─── Splash screen ────────────────────────────────────────────────────────────

function SplashScreen({ cfg, onDone }) {
  const [phase, setPhase] = useState("in");
  const { Icon, label, tagline, accent } = cfg;

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
        background: `radial-gradient(ellipse at 50% 38%, ${accent}22 0%, rgba(240,253,250,0.9) 44%, #ffffff 76%)`,
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
      <p style={{ fontSize: 28, fontWeight: 700, color: AGENT_THEME.ink, letterSpacing: "-0.2px", fontFamily: AGENT_THEME.displayFont, animation: "splashText 0.5s ease 0.25s forwards", opacity: 0 }}>{label}</p>
      <p style={{ fontSize: 13, color: AGENT_THEME.soft, marginTop: 8, animation: "splashText 0.5s ease 0.4s forwards", opacity: 0 }}>{tagline}</p>
      <div style={{ display: "flex", gap: 6, marginTop: 36, animation: "splashText 0.5s ease 0.55s forwards", opacity: 0 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: accent, animation: `splashDot 1.2s ease ${i * 0.2}s infinite` }} />
        ))}
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function AgentsLayout() {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const [splashDone, setSplashDone] = useState(false);
  const [user] = useState(() => getStoredUser());

  const cfg = AGENT_MAP[agentId];

  // New splash on every agent switch
  useEffect(() => {
    setSplashDone(false);
  }, [agentId]);

  if (!cfg) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: AGENT_THEME.pageBg }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: AGENT_THEME.ink, marginBottom: 12 }}>Agent not found.</p>
          <button onClick={() => navigate("/")} style={{ fontSize: 13, color: AGENT_THEME.teal, background: "none", border: "none", cursor: "pointer" }}>Back to dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dash-shell al-root" style={{ width: "100vw", position: "fixed", inset: 0, background: AGENT_THEME.pageBg, color: AGENT_THEME.ink, fontFamily: AGENT_THEME.font }}>
      {/* Splash */}
      {!splashDone && <SplashScreen cfg={cfg} onDone={() => setSplashDone(true)} />}

      <DashboardTopbar cfg={cfg} user={user} />
      <DashboardNavBar />

      {/* Main content */}
      <div className="al-content" style={{ flex: 1, overflowY: "auto", opacity: splashDone ? 1 : 0, transition: "opacity 0.3s ease", display: "flex", flexDirection: "column" }}>
        <main style={{ maxWidth: 1060, margin: "0 auto", padding: "36px 28px 80px", width: "100%" }}>
          <LazyPage name={cfg.page} />
        </main>
      </div>

      <style>{`
        @keyframes splashRing { from { transform: scale(0.6); opacity: 0.8; } to { transform: scale(1.1); opacity: 0; } }
        @keyframes splashIcon { from { transform: scale(0.5) translateY(10px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
        @keyframes splashText { from { transform: translateY(8px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes splashDot  { 0%,100% { transform: translateY(0); opacity: 0.3; } 50% { transform: translateY(-6px); opacity: 1; } }

        .agent-dashboard-nav {
          flex: 0 0 auto;
          width: 100%;
          background: rgba(248, 250, 252, 0.88);
          border-bottom: 1px solid var(--border);
          backdrop-filter: blur(18px);
          overflow-x: auto;
          overflow-y: hidden;
          scrollbar-width: none;
        }

        .agent-dashboard-nav::-webkit-scrollbar {
          display: none;
        }

        .agent-dashboard-nav-inner {
          display: flex;
          align-items: center;
          gap: 4px;
          min-height: 48px;
          padding: 6px 20px;
        }

        .agent-dashboard-nav-item {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          flex: 0 0 auto;
          min-height: 36px;
          padding: 0 12px;
          border-radius: var(--r);
          color: var(--text-soft);
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          white-space: nowrap;
          transition: background-color 140ms ease, color 140ms ease, box-shadow 140ms ease;
        }

        .agent-dashboard-nav-item:hover {
          background: rgba(255, 255, 255, 0.84);
          color: var(--text);
        }

        .agent-dashboard-nav-item.is-active {
          background: #ffffff;
          color: var(--teal-dark);
          box-shadow: var(--shadow-sm);
        }

        @media (max-width: 1024px) {
          .al-content main {
            padding: 24px 20px 60px !important;
          }
        }

        @media (max-width: 767px) {
          .al-root .dash-topbar {
            gap: 12px;
            padding-inline: 14px;
          }
          .agent-dashboard-nav-inner {
            padding-inline: 14px;
          }
          .al-content main {
            padding: 16px 14px 80px !important;
            max-width: 100% !important;
          }
        }

        /* Mobile small: 320–480px */
        @media (max-width: 480px) {
          .al-content main {
            padding: 12px 10px 80px !important;
          }
        }
      `}</style>
    </div>
  );
}
