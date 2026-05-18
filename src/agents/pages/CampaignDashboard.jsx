import { useEffect, useState } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { BarChart3, Send, MousePointerClick, Eye, AlertCircle, RefreshCw } from "lucide-react";
import { AgentStatus } from "../components/AgentStatus.jsx";

async function fetchStats() {
  const [campaignsRes, eventsRes] = await Promise.all([
    fetch("/api/db?entity=campaigns").catch(() => ({ ok: false })),
    fetch("/api/db?entity=events").catch(() => ({ ok: false })),
  ]);

  const campaigns = campaignsRes.ok ? (await campaignsRes.json()).records || [] : [];
  const events = eventsRes.ok ? (await eventsRes.json()).records || [] : [];

  const byDate = {};
  for (const e of events) {
    const date = (e.created_at || e.timestamp || "").slice(0, 10);
    if (!date) continue;
    byDate[date] = byDate[date] || { date, opens: 0, clicks: 0 };
    if (e.type === "open") byDate[date].opens++;
    if (e.type === "click") byDate[date].clicks++;
  }
  const timeline = Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date)).slice(-14);

  const totalSent = campaigns.reduce((s, c) => s + (c.sent_count || 0), 0);
  const totalFailed = campaigns.reduce((s, c) => s + (c.failed_count || 0), 0);
  const totalOpens = events.filter(e => e.type === "open").length;
  const totalClicks = events.filter(e => e.type === "click").length;

  return { campaigns, timeline, totalSent, totalFailed, totalOpens, totalClicks };
}

const TOOLTIP_STYLE = {
  backgroundColor: "#111116",
  border: "1px solid #1e1e26",
  borderRadius: "8px",
  color: "#f1f5f9",
  fontSize: "12px",
};

const STAT_CARDS = [
  { key: "totalSent",   label: "Total Sent",  icon: Send,             color: "#0ea5e9", bg: "bg-sky-500/10",     border: "border-sky-500/20" },
  { key: "totalOpens",  label: "Opens",        icon: Eye,              color: "#10b981", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  { key: "totalClicks", label: "Clicks",       icon: MousePointerClick,color: "#8b5cf6", bg: "bg-purple-500/10",  border: "border-purple-500/20" },
  { key: "totalFailed", label: "Failed",       icon: AlertCircle,      color: "#ef4444", bg: "bg-red-500/10",     border: "border-red-500/20" },
];

function StatusBadge({ status }) {
  const cfg = {
    completed: "bg-emerald-950/50 text-emerald-400 border-emerald-800/40",
    running:   "bg-sky-950/50 text-sky-400 border-sky-800/40",
    failed:    "bg-red-950/50 text-red-400 border-red-800/40",
  }[status] || "bg-zinc-900 text-zinc-400 border-zinc-700/40";
  return <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${cfg}`}>{status || "unknown"}</span>;
}

export default function CampaignDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    fetchStats()
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-xl border border-line bg-card">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-500/8 via-transparent to-transparent" />
        <div className="relative flex items-start justify-between gap-4 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-500/12 border border-sky-500/20">
              <BarChart3 className="h-6 w-6 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-foreground">Campaign Dashboard</h1>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-500/12 text-sky-400 border border-sky-500/20">Live</span>
              </div>
              <p className="text-sm text-muted max-w-lg">Analytics across all sent campaigns — opens, clicks, and delivery stats in real time.</p>
            </div>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs text-muted hover:text-sky-400 border border-line hover:border-sky-500/30 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      <AgentStatus loading={loading} error={error} />

      {data && (
        <div className="flex flex-col gap-6">
          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {STAT_CARDS.map(({ key, label, icon: Icon, color, bg, border }) => {
              const value = data[key] || 0;
              const sub = key === "totalOpens" && data.totalSent
                ? `${((value / data.totalSent) * 100).toFixed(1)}% open rate`
                : key === "totalClicks" && data.totalOpens
                ? `${((value / data.totalOpens) * 100).toFixed(1)}% CTR`
                : null;
              return (
                <div key={key} className={`bg-card border ${border} rounded-xl p-4 ${bg}/50`} style={{ borderColor: color + "22" }}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-muted uppercase tracking-wider">{label}</p>
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ backgroundColor: color + "18" }}>
                      <Icon className="h-3.5 w-3.5" style={{ color }} />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-foreground">{value.toLocaleString()}</p>
                  {sub && <p className="text-xs mt-1" style={{ color }}>{sub}</p>}
                </div>
              );
            })}
          </div>

          {/* Timeline chart */}
          {data.timeline.length > 0 && (
            <div className="bg-card border border-line rounded-xl p-5">
              <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-5">Opens &amp; Clicks — Last 14 Days</p>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={data.timeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1e26" />
                  <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="opens" stroke="#10b981" strokeWidth={2} dot={false} name="Opens" />
                  <Line type="monotone" dataKey="clicks" stroke="#0ea5e9" strokeWidth={2} dot={false} name="Clicks" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Campaigns table */}
          {data.campaigns.length > 0 && (
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold text-muted uppercase tracking-wider">Campaigns ({data.campaigns.length})</p>
              <div className="overflow-x-auto rounded-xl border border-line">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-line bg-card/80">
                      {["Campaign", "Status", "Sent", "Failed", "Date"].map(c => (
                        <th key={c} className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.campaigns.slice(0, 20).map((c, i) => (
                      <tr key={i} className="border-b border-line last:border-0 hover:bg-sky-500/3 transition-colors">
                        <td className="px-4 py-3 font-medium text-foreground">{c.name || "Untitled"}</td>
                        <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                        <td className="px-4 py-3 text-foreground">{c.sent_count ?? "—"}</td>
                        <td className="px-4 py-3 text-foreground">{c.failed_count ?? "—"}</td>
                        <td className="px-4 py-3 text-muted">{(c.created_at || "").slice(0, 10) || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!data.campaigns.length && (
            <div className="rounded-xl border border-line border-dashed bg-card/40 py-12 text-center">
              <p className="text-sm text-muted">No campaigns yet. Send your first campaign from the dashboard.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
