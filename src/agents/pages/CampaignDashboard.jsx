import { useEffect, useState } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { AgentCard } from "../components/AgentCard.jsx";
import { AgentStatus } from "../components/AgentStatus.jsx";

async function fetchStats() {
  const [campaignsRes, eventsRes] = await Promise.all([
    fetch("/api/db?entity=campaigns").catch(() => ({ ok: false })),
    fetch("/api/db?entity=events").catch(() => ({ ok: false })),
  ]);

  const campaigns = campaignsRes.ok ? (await campaignsRes.json()).records || [] : [];
  const events = eventsRes.ok ? (await eventsRes.json()).records || [] : [];

  // Aggregate opens + clicks by date
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

export default function CampaignDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats()
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const statCards = data
    ? [
        { label: "Total Sent", value: data.totalSent },
        { label: "Opens", value: data.totalOpens, sub: data.totalSent ? `${((data.totalOpens / data.totalSent) * 100).toFixed(1)}%` : "—" },
        { label: "Clicks", value: data.totalClicks, sub: data.totalOpens ? `${((data.totalClicks / data.totalOpens) * 100).toFixed(1)}% of opens` : "—" },
        { label: "Failed", value: data.totalFailed },
      ]
    : [];

  return (
    <AgentCard title="Campaign Dashboard" description="Analytics across all sent campaigns — opens, clicks, and delivery stats.">
      <AgentStatus loading={loading} error={error} />

      {data && (
        <div className="flex flex-col gap-6">
          {/* Stat cards */}
          <div className="grid grid-cols-4 gap-3">
            {statCards.map(s => (
              <div key={s.label} className="bg-card border border-line rounded-lg p-4">
                <p className="text-xs text-muted uppercase tracking-wide">{s.label}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{s.value.toLocaleString()}</p>
                {s.sub && <p className="text-xs text-accent mt-0.5">{s.sub}</p>}
              </div>
            ))}
          </div>

          {/* Timeline chart */}
          {data.timeline.length > 0 && (
            <div className="bg-card border border-line rounded-lg p-5">
              <p className="text-xs font-medium text-muted uppercase tracking-wide mb-4">Opens & Clicks — Last 14 Days</p>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={data.timeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1e26" />
                  <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="opens" stroke="#10b981" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="clicks" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Campaigns table */}
          {data.campaigns.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-muted uppercase tracking-wide">Recent Campaigns ({data.campaigns.length})</p>
              <div className="overflow-x-auto rounded-lg border border-line">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-line bg-card">
                      {["name", "status", "sent", "failed", "created"].map(c => (
                        <th key={c} className="px-3 py-2.5 text-left text-xs font-semibold text-muted uppercase tracking-wide">{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.campaigns.slice(0, 20).map((c, i) => (
                      <tr key={i} className="border-b border-line last:border-0 hover:bg-card/60 transition-colors">
                        <td className="px-3 py-2.5 text-foreground">{c.name || "—"}</td>
                        <td className="px-3 py-2.5">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${c.status === "completed" ? "bg-emerald-950/50 text-emerald-400" : c.status === "running" ? "bg-blue-950/50 text-blue-400" : "bg-zinc-800 text-zinc-400"}`}>
                            {c.status || "—"}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-foreground">{c.sent_count ?? "—"}</td>
                        <td className="px-3 py-2.5 text-foreground">{c.failed_count ?? "—"}</td>
                        <td className="px-3 py-2.5 text-muted">{(c.created_at || "").slice(0, 10) || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!data.campaigns.length && !loading && (
            <p className="text-sm text-muted">No campaigns yet. Send your first campaign from the dashboard.</p>
          )}
        </div>
      )}
    </AgentCard>
  );
}
