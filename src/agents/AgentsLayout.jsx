import "./agents.css";
import { lazy, Suspense, useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Search, Target, Globe, Mail, FlaskConical, Inbox, FileText,
  Swords, Link2, BarChart3, Users, ArrowUpDown, ChevronLeft, Zap,
} from "lucide-react";

// ─── Agent registry ───────────────────────────────────────────────────────────

const AGENTS = {
  "lead-finder": {
    label: "Lead Finder",
    tagline: "Discover B2B companies at scale",
    Icon: Search,
    page: "LeadFinder",
    accent: "#10b981",
    gradientFrom: "rgba(16,185,129,0.18)",
    gradientMid:  "rgba(16,185,129,0.06)",
    ring: "rgba(16,185,129,0.25)",
  },
  "lead-scoring": {
    label: "Lead Scoring",
    tagline: "Qualify every prospect with AI",
    Icon: Target,
    page: "LeadScoring",
    accent: "#f59e0b",
    gradientFrom: "rgba(245,158,11,0.18)",
    gradientMid:  "rgba(245,158,11,0.06)",
    ring: "rgba(245,158,11,0.25)",
  },
  "landing-page-analyzer": {
    label: "Landing Page Analyzer",
    tagline: "CRO audits in seconds",
    Icon: Globe,
    page: "LandingPageAnalyzer",
    accent: "#0ea5e9",
    gradientFrom: "rgba(14,165,233,0.18)",
    gradientMid:  "rgba(14,165,233,0.06)",
    ring: "rgba(14,165,233,0.25)",
  },
  "email-sequence-builder": {
    label: "Email Sequence Builder",
    tagline: "Multi-step outreach, crafted by AI",
    Icon: Mail,
    page: "EmailSequenceBuilder",
    accent: "#8b5cf6",
    gradientFrom: "rgba(139,92,246,0.18)",
    gradientMid:  "rgba(139,92,246,0.06)",
    ring: "rgba(139,92,246,0.25)",
  },
  "ab-email-tester": {
    label: "A/B Email Tester",
    tagline: "Pick the winner before you send",
    Icon: FlaskConical,
    page: "ABEmailTester",
    accent: "#ec4899",
    gradientFrom: "rgba(236,72,153,0.18)",
    gradientMid:  "rgba(236,72,153,0.06)",
    ring: "rgba(236,72,153,0.25)",
  },
  "reply-detector": {
    label: "Reply Detector",
    tagline: "Classify intent. Respond instantly.",
    Icon: Inbox,
    page: "ReplyDetector",
    accent: "#f97316",
    gradientFrom: "rgba(249,115,22,0.18)",
    gradientMid:  "rgba(249,115,22,0.06)",
    ring: "rgba(249,115,22,0.25)",
  },
  "blog-generator": {
    label: "Blog Generator",
    tagline: "SEO-ready content, on demand",
    Icon: FileText,
    page: "BlogGenerator",
    accent: "#14b8a6",
    gradientFrom: "rgba(20,184,166,0.18)",
    gradientMid:  "rgba(20,184,166,0.06)",
    ring: "rgba(20,184,166,0.25)",
  },
  "competitor-analyzer": {
    label: "Competitor Analyzer",
    tagline: "Full SWOT. Clear positioning.",
    Icon: Swords,
    page: "CompetitorAnalyzer",
    accent: "#6366f1",
    gradientFrom: "rgba(99,102,241,0.18)",
    gradientMid:  "rgba(99,102,241,0.06)",
    ring: "rgba(99,102,241,0.25)",
  },
  "backlink-outreach": {
    label: "Backlink Outreach",
    tagline: "Find prospects. Write the email.",
    Icon: Link2,
    page: "BacklinkOutreach",
    accent: "#10b981",
    gradientFrom: "rgba(16,185,129,0.18)",
    gradientMid:  "rgba(16,185,129,0.06)",
    ring: "rgba(16,185,129,0.25)",
  },
  "campaign-dashboard": {
    label: "Campaign Dashboard",
    tagline: "Live metrics for every send",
    Icon: BarChart3,
    page: "CampaignDashboard",
    accent: "#0ea5e9",
    gradientFrom: "rgba(14,165,233,0.18)",
    gradientMid:  "rgba(14,165,233,0.06)",
    ring: "rgba(14,165,233,0.25)",
  },
  "crm-lite": {
    label: "CRM Lite",
    tagline: "Your contacts, always in reach",
    Icon: Users,
    page: "CRMLite",
    accent: "#8b5cf6",
    gradientFrom: "rgba(139,92,246,0.18)",
    gradientMid:  "rgba(139,92,246,0.06)",
    ring: "rgba(139,92,246,0.25)",
  },
  "csv-import-export": {
    label: "CSV Import / Export",
    tagline: "Bulk contacts in, data out",
    Icon: ArrowUpDown,
    page: "CSVImportExport",
    accent: "#f59e0b",
    gradientFrom: "rgba(245,158,11,0.18)",
    gradientMid:  "rgba(245,158,11,0.06)",
    ring: "rgba(245,158,11,0.25)",
  },
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

// ─── Splash screen ────────────────────────────────────────────────────────────

function SplashScreen({ cfg, onDone }) {
  const [phase, setPhase] = useState("in"); // "in" | "hold" | "out"
  const { Icon, label, tagline, accent, gradientFrom, gradientMid, ring } = cfg;

  useEffect(() => {
    // hold for 1.6s then fade out
    const t1 = setTimeout(() => setPhase("out"), 1600);
    // remove after fade-out animation (0.55s)
    const t2 = setTimeout(() => onDone(), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  const opacity = phase === "out" ? 0 : 1;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9800,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        background: `radial-gradient(ellipse at 50% 40%, ${gradientFrom} 0%, ${gradientMid} 45%, #09090d 75%)`,
        transition: "opacity 0.55s ease",
        opacity,
        pointerEvents: phase === "out" ? "none" : "all",
      }}
    >
      {/* Animated ring */}
      <div
        style={{
          position: "absolute",
          width: 320, height: 320,
          borderRadius: "50%",
          border: `1px solid ${ring}`,
          animation: "splashRing 2s ease-out forwards",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 200, height: 200,
          borderRadius: "50%",
          border: `1px solid ${ring}`,
          animation: "splashRing 2s ease-out 0.2s forwards",
        }}
      />

      {/* Icon */}
      <div
        style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: 80, height: 80, borderRadius: 20,
          background: `${accent}18`,
          border: `1.5px solid ${accent}35`,
          marginBottom: 24,
          animation: "splashIcon 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards",
          opacity: 0,
        }}
      >
        <Icon size={36} style={{ color: accent }} />
      </div>

      {/* Label */}
      <p
        style={{
          fontSize: 28, fontWeight: 700, color: "#f1f5f9",
          letterSpacing: "-0.5px",
          animation: "splashText 0.5s ease 0.25s forwards",
          opacity: 0,
        }}
      >
        {label}
      </p>

      {/* Tagline */}
      <p
        style={{
          fontSize: 13, color: "#6b7280", marginTop: 8,
          animation: "splashText 0.5s ease 0.4s forwards",
          opacity: 0,
        }}
      >
        {tagline}
      </p>

      {/* Loading dots */}
      <div
        style={{
          display: "flex", gap: 6, marginTop: 36,
          animation: "splashText 0.5s ease 0.55s forwards",
          opacity: 0,
        }}
      >
        {[0, 1, 2].map(i => (
          <div
            key={i}
            style={{
              width: 5, height: 5, borderRadius: "50%",
              background: accent,
              animation: `splashDot 1.2s ease ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes splashRing {
          from { transform: scale(0.6); opacity: 0.8; }
          to   { transform: scale(1.1); opacity: 0; }
        }
        @keyframes splashIcon {
          from { transform: scale(0.5) translateY(10px); opacity: 0; }
          to   { transform: scale(1) translateY(0);       opacity: 1; }
        }
        @keyframes splashText {
          from { transform: translateY(8px); opacity: 0; }
          to   { transform: translateY(0);   opacity: 1; }
        }
        @keyframes splashDot {
          0%, 100% { transform: translateY(0);   opacity: 0.3; }
          50%       { transform: translateY(-6px); opacity: 1;   }
        }
      `}</style>
    </div>
  );
}

// ─── Top nav bar ──────────────────────────────────────────────────────────────

function TopNav({ cfg, allAgents, currentId }) {
  const navigate = useNavigate();
  const { Icon, label, accent } = cfg;
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 24px", height: 56,
      background: "#0d0d12cc",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid #1e1e26",
    }}>
      {/* Left: back */}
      <button
        onClick={() => navigate("/")}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          fontSize: 13, color: "#6b7280", background: "none", border: "none", cursor: "pointer",
          padding: "6px 10px", borderRadius: 8, transition: "color 0.15s",
        }}
        onMouseEnter={e => e.currentTarget.style.color = "#f1f5f9"}
        onMouseLeave={e => e.currentTarget.style.color = "#6b7280"}
      >
        <ChevronLeft size={15} />
        Dashboard
      </button>

      {/* Center: current agent + switcher */}
      <div ref={dropRef} style={{ position: "relative" }}>
        <button
          onClick={() => setDropOpen(v => !v)}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "none", border: "none", cursor: "pointer",
            padding: "6px 12px", borderRadius: 10,
            transition: "background 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "#ffffff08"}
          onMouseLeave={e => e.currentTarget.style.background = "none"}
        >
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 26, height: 26, borderRadius: 7,
            background: `${accent}18`, border: `1px solid ${accent}30`,
          }}>
            <Icon size={14} style={{ color: accent }} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9" }}>{label}</span>
          <Zap size={12} style={{ color: "#6b7280" }} />
        </button>

        {/* Dropdown: all 12 agents */}
        {dropOpen && (
          <div style={{
            position: "absolute", top: "calc(100% + 8px)", left: "50%",
            transform: "translateX(-50%)",
            width: 240, background: "#111116",
            border: "1px solid #1e1e26", borderRadius: 12,
            boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
            overflow: "hidden", zIndex: 200,
            animation: "splashText 0.18s ease forwards",
          }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: "#6b7280", letterSpacing: "0.08em", padding: "10px 14px 6px", textTransform: "uppercase" }}>Switch Agent</p>
            {allAgents.map(([id, agent]) => {
              const isActive = id === currentId;
              return (
                <button
                  key={id}
                  onClick={() => { navigate(`/agents/${id}`); setDropOpen(false); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    width: "100%", padding: "8px 14px",
                    background: isActive ? `${agent.accent}12` : "none",
                    border: "none", cursor: "pointer", textAlign: "left",
                    borderLeft: isActive ? `2px solid ${agent.accent}` : "2px solid transparent",
                    transition: "background 0.12s",
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "#ffffff06"; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "none"; }}
                >
                  <agent.Icon size={13} style={{ color: isActive ? agent.accent : "#6b7280", flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: isActive ? "#f1f5f9" : "#9ca3af" }}>{agent.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Right: thehotspot badge */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 11, color: "#6b7280", letterSpacing: "0.04em" }}>thehotspot</span>
        <div style={{
          width: 6, height: 6, borderRadius: "50%",
          background: accent, boxShadow: `0 0 6px ${accent}`,
        }} />
      </div>
    </header>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function AgentsLayout() {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const [splashDone, setSplashDone] = useState(false);

  const cfg = AGENTS[agentId];
  const allAgents = Object.entries(AGENTS);

  if (!cfg) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#09090d" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#f1f5f9", marginBottom: 12 }}>Agent not found.</p>
          <button
            onClick={() => navigate("/")}
            style={{ fontSize: 13, color: "#10b981", background: "none", border: "none", cursor: "pointer" }}
          >
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#09090d", color: "#f1f5f9", fontFamily: "ui-sans-serif, system-ui, sans-serif" }}>
      {/* Splash — unmounted once done */}
      {!splashDone && <SplashScreen cfg={cfg} onDone={() => setSplashDone(true)} />}

      {/* Page content — always in DOM so lazy load starts immediately */}
      <div style={{ opacity: splashDone ? 1 : 0, transition: "opacity 0.3s ease" }}>
        <TopNav cfg={cfg} allAgents={allAgents} currentId={agentId} />
        <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px 64px" }}>
          <LazyPage name={cfg.page} />
        </main>
      </div>

      {/* agents.css Tailwind scope */}
      <style>{`
        @keyframes splashRing {
          from { transform: scale(0.6); opacity: 0.8; }
          to   { transform: scale(1.1); opacity: 0; }
        }
        @keyframes splashIcon {
          from { transform: scale(0.5) translateY(10px); opacity: 0; }
          to   { transform: scale(1) translateY(0);       opacity: 1; }
        }
        @keyframes splashText {
          from { transform: translateY(8px); opacity: 0; }
          to   { transform: translateY(0);   opacity: 1; }
        }
        @keyframes splashDot {
          0%, 100% { transform: translateY(0);   opacity: 0.3; }
          50%       { transform: translateY(-6px); opacity: 1;   }
        }
      `}</style>
    </div>
  );
}
