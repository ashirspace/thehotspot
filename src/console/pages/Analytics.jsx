import { useEffect, useState } from "react";
import { fetchStats } from "../api/consoleApi.js";

export default function Analytics() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats().then(setStats).catch(() => setStats({}));
  }, []);

  const cards = stats ? [
    { label: "Total users", value: stats.users },
    { label: "Admins & managers", value: stats.staff },
    { label: "Campaigns", value: stats.campaigns },
    { label: "Emails sent", value: stats.emailsSent },
    { label: "Contacts", value: stats.contacts },
  ] : [];

  return (
    <div>
      <header className="dash-page-head">
        <span className="dash-eyebrow">Insights · Analytics</span>
        <h1 className="dash-page-title">Workspace <em>analytics</em></h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)", maxWidth: 600 }}>
          A live snapshot of users, campaigns, and outreach volume across the workspace.
        </p>
      </header>

      {!stats ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[...Array(4)].map((_, i) => <div key={i} className="dash-skeleton" style={{ height: 64 }} />)}
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(168px,1fr))", gap: 14, marginBottom: 32 }}>
            {cards.map(c => (
              <div key={c.label} className="dash-card">
                <div className="dash-stat-label">{c.label}</div>
                <div className="dash-stat-value" style={{ marginTop: 8 }}>{c.value ?? "—"}</div>
              </div>
            ))}
          </div>

          <div className="dash-eyebrow" style={{ marginBottom: 12 }}>Recent signups</div>
          <div className="dash-card" style={{ padding: 0, overflow: "hidden" }}>
            <table className="dash-table">
              <thead>
                <tr><th>User</th><th>Email</th><th>Role</th><th>Joined</th></tr>
              </thead>
              <tbody>
                {(stats.recent || []).length === 0 ? (
                  <tr><td colSpan={4} style={{ color: "var(--text-faint)" }}>No signups yet.</td></tr>
                ) : stats.recent.map(u => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600 }}>{u.username}</td>
                    <td className="dash-td-num">{u.email || "—"}</td>
                    <td>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-soft)" }}>
                        <span className={`dash-dot ${u.role === "admin" ? "is-teal" : u.role === "manager" ? "is-amber" : ""}`} />
                        {u.role || "user"}
                      </span>
                    </td>
                    <td className="dash-td-num">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString("en", { month: "short", day: "numeric" }) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
