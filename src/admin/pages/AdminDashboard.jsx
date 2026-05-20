import { useState, useEffect } from "react";
import { LuUsers, LuDatabase, LuRadio, LuMail, LuDollarSign, LuUserCheck } from "react-icons/lu";

const FF = "'DM Sans', sans-serif";
const MONO = "'JetBrains Mono', monospace";
const C = { card: "#111116", border: "#ffffff12", text: "#F1F5F9", muted: "#64748B", green: "#10b981", blue: "#0ea5e9", purple: "#6366f1", yellow: "#f59e0b", pink: "#ec4899" };

async function api(body) {
  const r = await fetch("/api/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return r.json();
}

function fmt(n) { return Number(n || 0).toLocaleString(); }
function fmtDate(d) { if (!d) return "—"; return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); }

function StatCard({ label, value, Icon, color, sub }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.8 }}>{label}</div>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={16} color={color} />
        </div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 900, color: C.text, fontFamily: MONO, letterSpacing: -1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function statusBadge(r) {
  if (r.cancelled) return { label: "Cancelled", color: "#ef4444" };
  const s = (r.status || "").toLowerCase();
  if (s === "running")   return { label: "Running",   color: "#10b981" };
  if (s === "paused")    return { label: "Paused",    color: "#f59e0b" };
  if (s === "completed" || s === "done") return { label: "Done", color: "#0ea5e9" };
  return { label: r.status || "—", color: "#64748B" };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api({ action: "stats" }).then(d => { setStats(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: C.muted, fontSize: 13, padding: 40, textAlign: "center", fontFamily: FF }}>Loading…</div>;
  if (!stats) return <div style={{ color: "#ef4444", fontSize: 13, fontFamily: FF }}>Failed to load stats.</div>;

  return (
    <div style={{ fontFamily: FF }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: -0.5 }}>Overview</div>
        <div style={{ fontSize: 13, color: C.muted, marginTop: 3 }}>Platform-wide metrics at a glance</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 12, marginBottom: 28 }}>
        <StatCard label="Total Users"   value={fmt(stats.users)}    Icon={LuUsers}     color={C.green}  sub={`${fmt(stats.activeUsers)} active`} />
        <StatCard label="Contacts"      value={fmt(stats.contacts)} Icon={LuDatabase}  color={C.blue}   />
        <StatCard label="Campaigns"     value={fmt(stats.campaigns)}Icon={LuRadio}     color={C.purple} />
        <StatCard label="Emails Sent"   value={fmt(stats.emails)}   Icon={LuMail}      color={C.yellow} />
        <StatCard label="Total Revenue" value={`₹${fmt(stats.revenue)}`} Icon={LuDollarSign} color={C.pink} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Recent signups */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <LuUsers size={14} color={C.muted} /> Recent Signups
          </div>
          {!stats.recentSignups?.length && <div style={{ fontSize: 12, color: C.muted }}>No users yet</div>}
          {stats.recentSignups?.map(u => (
            <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#6366f120", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: C.purple, flexShrink: 0 }}>
                {(u.full_name || u.username || "?")[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.full_name || u.username || "—"}</div>
                <div style={{ fontSize: 11, color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email || "no email"}</div>
              </div>
              <div style={{ fontSize: 11, color: C.muted, flexShrink: 0 }}>{fmtDate(u.created_at)}</div>
            </div>
          ))}
        </div>

        {/* Recent campaigns */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <LuRadio size={14} color={C.muted} /> Recent Campaigns
          </div>
          {!stats.recentCampaigns?.length && <div style={{ fontSize: 12, color: C.muted }}>No campaigns yet</div>}
          {stats.recentCampaigns?.map(r => {
            const { label, color } = statusBadge(r);
            return (
              <div key={r.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>#{r.id} · {r.category || "—"}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{r.user_id} · {fmtDate(r.created_at)}</div>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, color, background: `${color}18`, border: `1px solid ${color}28`, borderRadius: 20, padding: "3px 8px", flexShrink: 0 }}>{label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
