import "./agents.css";
import { lazy, Suspense, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MessageSquareText, Users,
  LayoutDashboard, House, Radio, FilePen, Settings,
  Sparkles, Menu, X, ChevronLeft,
} from "lucide-react";

// ─── Agent registry ───────────────────────────────────────────────────────────

const AGENTS = [
  { id: "linkedin-dm-outreach", label: "LinkedIn DM Outreach", tagline: "Categorize prospects and draft personal DMs", Icon: MessageSquareText, accent: "#0ea5e9", page: "LinkedInDMOutreach", gradientFrom: "rgba(14,165,233,0.18)", gradientMid: "rgba(14,165,233,0.06)" },
];

const AGENT_MAP = Object.fromEntries(AGENTS.map(a => [a.id, a]));

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

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ currentAgentId, open, onClose }) {
  const navigate = useNavigate();

  const handleAgentClick = (id) => {
    navigate(`/agents/${id}`);
    onClose();
  };

  return (
    <aside
      className={open ? "al-sidebar al-sidebar--open" : "al-sidebar"}
      style={{
        width: 224, flexShrink: 0, display: "flex", flexDirection: "column",
        background: "rgba(248,250,252,0.94)", borderRight: `1px solid ${AGENT_THEME.line}`,
        height: "100vh", position: "sticky", top: 0, overflowY: "auto",
        backdropFilter: "blur(18px)",
      }}
    >
      {/* Brand */}
      <div style={{ padding: "18px 16px 14px", borderBottom: `1px solid ${AGENT_THEME.line}` }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: AGENT_THEME.ink, fontFamily: AGENT_THEME.displayFont, letterSpacing: 0 }}>thehotspot</div>
        <div style={{ fontSize: 10, color: AGENT_THEME.soft, marginTop: 1, letterSpacing: "0.06em" }}>outreach platform</div>
      </div>

      {/* Main nav */}
      <div style={{ padding: "8px 8px 0" }}>
        <p style={{ fontSize: 9, fontWeight: 700, color: AGENT_THEME.faint, letterSpacing: "0.1em", textTransform: "uppercase", padding: "8px 8px 4px" }}>Platform</p>
        {MAIN_NAV.map(({ label, href, Icon }) => (
          <a
            key={href}
            href={href}
            style={{
              display: "flex", alignItems: "center", gap: 9, width: "100%",
              padding: "8px 10px", marginBottom: 1, borderRadius: 7,
              color: AGENT_THEME.soft, fontSize: 13, fontWeight: 500,
              textDecoration: "none", transition: "all .12s",
              borderLeft: "2px solid transparent",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = AGENT_THEME.tealTint; e.currentTarget.style.color = AGENT_THEME.tealDark; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = AGENT_THEME.soft; }}
          >
            <Icon size={14} style={{ flexShrink: 0 }} />
            {label}
          </a>
        ))}
      </div>

      {/* Divider */}
      <div style={{ borderTop: `1px solid ${AGENT_THEME.line}`, margin: "10px 0 0" }} />

      {/* Agent list */}
      <div style={{ padding: "8px 8px", flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 8px 6px" }}>
          <Sparkles size={11} style={{ color: AGENT_THEME.teal }} />
          <p style={{ fontSize: 9, fontWeight: 700, color: AGENT_THEME.faint, letterSpacing: "0.1em", textTransform: "uppercase" }}>Intelligence</p>
        </div>
        {AGENTS.map(({ id, label, Icon, accent }) => {
          const isActive = id === currentAgentId;
          return (
            <button
              key={id}
              onClick={() => handleAgentClick(id)}
              style={{
                display: "flex", alignItems: "center", gap: 8, width: "100%",
                padding: "7px 10px", marginBottom: 1, borderRadius: 7,
                background: isActive ? AGENT_THEME.tealTint : "transparent",
                borderLeft: isActive ? `2px solid ${accent}` : "2px solid transparent",
                color: isActive ? AGENT_THEME.ink : AGENT_THEME.soft,
                fontWeight: isActive ? 600 : 400,
                fontSize: 12, fontFamily: AGENT_THEME.font,
                border: "none", cursor: "pointer", textAlign: "left",
                transition: "all .12s",
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = AGENT_THEME.tealTint; e.currentTarget.style.color = AGENT_THEME.tealDark; } }}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = AGENT_THEME.soft; } }}
            >
              <Icon size={13} style={{ color: isActive ? accent : "inherit", flexShrink: 0 }} />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ borderTop: `1px solid ${AGENT_THEME.line}`, padding: "10px 16px 14px" }}>
        <span style={{ fontSize: 10, color: AGENT_THEME.faint }}>© 2026 thehotspot</span>
      </div>
    </aside>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function AgentsLayout() {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const [splashDone, setSplashDone] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const cfg = AGENT_MAP[agentId];

  // New splash on every agent switch
  useEffect(() => {
    setSplashDone(false);
    setSidebarOpen(false);
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

  const { Icon: AgentIcon, accent } = cfg;

  return (
    <div className="al-root" style={{ display: "flex", height: "100vh", background: AGENT_THEME.pageBg, color: AGENT_THEME.ink, fontFamily: AGENT_THEME.font, overflow: "hidden" }}>
      {/* Splash */}
      {!splashDone && <SplashScreen cfg={cfg} onDone={() => setSplashDone(true)} />}

      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          className="al-overlay"
          onClick={() => setSidebarOpen(false)}
          style={{ position: "fixed", inset: 0, zIndex: 9600, background: "rgba(15,23,42,0.32)" }}
        />
      )}

      {/* Sidebar */}
      <Sidebar currentAgentId={agentId} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="al-content" style={{ flex: 1, overflowY: "auto", opacity: splashDone ? 1 : 0, transition: "opacity 0.3s ease", display: "flex", flexDirection: "column" }}>
        {/* Mobile top bar */}
        <div
          className="al-topbar"
          style={{ display: "none", alignItems: "center", gap: 10, padding: "0 14px", height: 52, borderBottom: `1px solid ${AGENT_THEME.line}`, background: "rgba(255,255,255,0.94)", backdropFilter: "blur(14px)", flexShrink: 0, position: "sticky", top: 0, zIndex: 100 }}
        >
          <button
            onClick={() => setSidebarOpen(v => !v)}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, borderRadius: 8, background: AGENT_THEME.card, border: `1px solid ${AGENT_THEME.line}`, color: AGENT_THEME.soft, cursor: "pointer", flexShrink: 0 }}
          >
            {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: 7, background: `${accent}18`, border: `1px solid ${accent}30`, flexShrink: 0 }}>
              <AgentIcon size={13} style={{ color: accent }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: AGENT_THEME.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cfg.label}</span>
          </div>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: AGENT_THEME.soft, textDecoration: "none", flexShrink: 0 }}>
            <ChevronLeft size={14} />
            <span>Dashboard</span>
          </a>
        </div>

        <main style={{ maxWidth: 1060, margin: "0 auto", padding: "36px 28px 80px", width: "100%" }}>
          <LazyPage name={cfg.page} />
        </main>
      </div>

      <style>{`
        @keyframes splashRing { from { transform: scale(0.6); opacity: 0.8; } to { transform: scale(1.1); opacity: 0; } }
        @keyframes splashIcon { from { transform: scale(0.5) translateY(10px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
        @keyframes splashText { from { transform: translateY(8px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes splashDot  { 0%,100% { transform: translateY(0); opacity: 0.3; } 50% { transform: translateY(-6px); opacity: 1; } }

        /* Tablet: 768–1024px — sidebar slightly narrower, content padding reduced */
        @media (max-width: 1024px) {
          .al-sidebar {
            width: 200px !important;
          }
          .al-content main {
            padding: 24px 20px 60px !important;
          }
        }

        /* Mobile: 320–767px — overlay sidebar, top bar visible */
        @media (max-width: 767px) {
          .al-sidebar {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            bottom: 0 !important;
            height: 100dvh !important;
            width: 260px !important;
            z-index: 9700 !important;
            transform: translateX(-100%) !important;
            transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
            box-shadow: 6px 0 26px rgba(15,23,42,0.12) !important;
          }
          .al-sidebar--open {
            transform: translateX(0) !important;
          }
          .al-topbar {
            display: flex !important;
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
