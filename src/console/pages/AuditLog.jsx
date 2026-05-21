import { useEffect, useState } from "react";
import { fetchAudit } from "../api/consoleApi.js";

export default function AuditLog() {
  const [entries, setEntries] = useState(null);

  useEffect(() => {
    fetchAudit().then(r => setEntries(r.entries || [])).catch(() => setEntries([]));
  }, []);

  return (
    <div>
      <header className="dash-page-head">
        <span className="dash-eyebrow">Insights · Audit</span>
        <h1 className="dash-page-title">Audit <em>log</em></h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)", maxWidth: 600 }}>
          Every content save and role change made in the console, newest first.
        </p>
      </header>

      {entries === null ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[...Array(5)].map((_, i) => <div key={i} className="dash-skeleton" style={{ height: 44 }} />)}
        </div>
      ) : entries.length === 0 ? (
        <div className="dash-empty">
          <div className="dash-empty-title">No activity yet</div>
          <div className="dash-empty-text">Console actions — content edits and role changes — will be recorded here as they happen.</div>
        </div>
      ) : (
        <div className="dash-card" style={{ padding: 0, overflow: "hidden" }}>
          <table className="dash-table">
            <thead>
              <tr><th>When</th><th>Actor</th><th>Action</th><th>Target</th><th>Detail</th></tr>
            </thead>
            <tbody>
              {entries.map(e => (
                <tr key={e.id}>
                  <td className="dash-td-num">
                    {e.created_at ? new Date(e.created_at).toLocaleString("en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                  </td>
                  <td style={{ fontWeight: 600 }}>{e.actor}</td>
                  <td><span className="dash-num" style={{ fontSize: 12, color: "var(--text-soft)" }}>{e.action}</span></td>
                  <td>{e.target || "—"}</td>
                  <td style={{ color: "var(--text-muted)" }}>{e.detail || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
