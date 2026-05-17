import "./agents.css";
import { Outlet, NavLink, useNavigate, useParams } from "react-router-dom";
import {
  Search, Star, Globe, Mail, FlaskConical, Reply, FileText,
  BarChart2, Link2, TrendingUp, Database, Upload, ChevronLeft,
} from "lucide-react";

const AGENTS = [
  { id: "lead-finder",            label: "Lead Finder",             Icon: Search },
  { id: "lead-scoring",           label: "Lead Scoring",            Icon: Star },
  { id: "landing-page-analyzer",  label: "Landing Page Analyzer",   Icon: Globe },
  { id: "email-sequence-builder", label: "Email Sequence Builder",  Icon: Mail },
  { id: "ab-email-tester",        label: "A/B Email Tester",        Icon: FlaskConical },
  { id: "reply-detector",         label: "Reply Detector",          Icon: Reply },
  { id: "blog-generator",         label: "Blog Generator",          Icon: FileText },
  { id: "competitor-analyzer",    label: "Competitor Analyzer",     Icon: BarChart2 },
  { id: "backlink-outreach",      label: "Backlink Outreach",       Icon: Link2 },
  { id: "campaign-dashboard",     label: "Campaign Dashboard",      Icon: TrendingUp },
  { id: "crm-lite",               label: "CRM Lite",                Icon: Database },
  { id: "csv-import-export",      label: "CSV Import / Export",     Icon: Upload },
];

export default function AgentsLayout() {
  const navigate = useNavigate();
  const { agentId } = useParams();

  return (
    <div className="flex h-screen bg-surface text-foreground font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="flex flex-col w-60 shrink-0 bg-card border-r border-line overflow-y-auto">
        {/* Back to dashboard */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-4 py-4 text-sm text-muted hover:text-foreground border-b border-line transition-colors"
        >
          <ChevronLeft size={15} />
          Dashboard
        </button>

        <div className="px-4 py-3">
          <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-2">AI Agents</p>
        </div>

        <nav className="flex flex-col gap-0.5 px-2 pb-4">
          {AGENTS.map(({ id, label, Icon }) => (
            <NavLink
              key={id}
              to={`/agents/${id}`}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-accent/10 text-accent font-medium"
                    : "text-muted hover:text-foreground hover:bg-line/50"
                }`
              }
            >
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-8">
        <AgentRouter agentId={agentId} />
      </main>
    </div>
  );
}

function AgentRouter({ agentId }) {
  switch (agentId) {
    case "lead-finder":            return <LazyPage name="LeadFinder" />;
    case "lead-scoring":           return <LazyPage name="LeadScoring" />;
    case "landing-page-analyzer":  return <LazyPage name="LandingPageAnalyzer" />;
    case "email-sequence-builder": return <LazyPage name="EmailSequenceBuilder" />;
    case "ab-email-tester":        return <LazyPage name="ABEmailTester" />;
    case "reply-detector":         return <LazyPage name="ReplyDetector" />;
    case "blog-generator":         return <LazyPage name="BlogGenerator" />;
    case "competitor-analyzer":    return <LazyPage name="CompetitorAnalyzer" />;
    case "backlink-outreach":      return <LazyPage name="BacklinkOutreach" />;
    case "campaign-dashboard":     return <LazyPage name="CampaignDashboard" />;
    case "crm-lite":               return <LazyPage name="CRMLite" />;
    case "csv-import-export":      return <LazyPage name="CSVImportExport" />;
    default:                       return <div className="text-muted text-sm">Agent not found.</div>;
  }
}

// Dynamic import per agent — keeps initial bundle small
import { lazy, Suspense } from "react";
const pageCache = {};
function LazyPage({ name }) {
  if (!pageCache[name]) {
    pageCache[name] = lazy(() => import(`./pages/${name}.jsx`));
  }
  const Page = pageCache[name];
  return (
    <Suspense fallback={<div className="text-muted text-sm">Loading...</div>}>
      <Page />
    </Suspense>
  );
}
