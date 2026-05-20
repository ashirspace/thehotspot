import { useState, useEffect } from "react";
import { LuPause, LuSquare } from "react-icons/lu";
import "./AdminCampaigns.css";

async function adminApi(body) {
  const res = await fetch("/api/admin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function statusBadge(row) {
  if (row.cancelled) return <span className="badge badge--red">Cancelled</span>;
  const s = (row.status || "").toLowerCase();
  if (s === "paused")   return <span className="badge badge--yellow">Paused</span>;
  if (s === "running")  return <span className="badge badge--green">Running</span>;
  if (s === "done" || s === "completed") return <span className="badge badge--blue">Done</span>;
  return <span className="badge badge--gray">{row.status || "—"}</span>;
}

export default function AdminCampaigns() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [acting, setActing] = useState(null);
  const LIMIT = 20;

  function fetch_(p) {
    setLoading(true);
    adminApi({ action: "campaigns", page: p })
      .then(d => {
        if (d.error) setError(d.error);
        else { setRows(d.rows || []); setTotal(d.total || 0); }
      })
      .catch(() => setError("Failed to load campaigns"))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetch_(1); }, []);

  async function setStatus(id, status) {
    setActing(id + status);
    const d = await adminApi({ action: "setCampaignStatus", id, status });
    if (d.ok) {
      setRows(prev => prev.map(r =>
        r.id === id
          ? { ...r, status, cancelled: status === "cancelled" }
          : r
      ));
    }
    setActing(null);
  }

  function goPage(p) { setPage(p); fetch_(p); }

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));
  const start = (page - 1) * LIMIT + 1;
  const end = Math.min(page * LIMIT, total);

  return (
    <div>
      <div className="page-header">
        <div className="page-header__left">
          <h1>Campaigns</h1>
          <p>Monitor and manage all user campaigns</p>
        </div>
      </div>

      {error && <div className="msg-error">{error}</div>}

      <div className="table-wrap">
        {loading ? (
          <div className="state-loading" />
        ) : rows.length === 0 ? (
          <div className="state-empty">No campaigns yet</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Category</th>
                <th>Status</th>
                <th>Sent</th>
                <th>Reply Rate</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => {
                const replyRate = r.sent_count > 0
                  ? ((r.reply_count / r.sent_count) * 100).toFixed(1) + "%"
                  : "0%";
                return (
                  <tr key={r.id}>
                    <td className="text-primary">#{r.id}</td>
                    <td>
                      <div>{r.user_name || "—"}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{r.user_email || r.user_id}</div>
                    </td>
                    <td>{r.category || "—"}</td>
                    <td>{statusBadge(r)}</td>
                    <td>{r.sent_count ?? 0}</td>
                    <td><span className="reply-rate">{replyRate}</span></td>
                    <td>{fmtDate(r.created_at)}</td>
                    <td>
                      <div className="campaigns-actions">
                        {!r.cancelled && r.status !== "paused" && (
                          <button
                            className="btn-warning"
                            onClick={() => setStatus(r.id, "paused")}
                            disabled={acting === r.id + "paused"}
                          >
                            <LuPause size={12} />
                            Pause
                          </button>
                        )}
                        {!r.cancelled && (
                          <button
                            className="btn-danger"
                            onClick={() => setStatus(r.id, "cancelled")}
                            disabled={acting === r.id + "cancelled"}
                          >
                            <LuSquare size={12} />
                            Stop
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {!loading && rows.length > 0 && (
          <div className="pagination">
            <span className="pagination__info">{start}–{end} of {total}</span>
            <div className="pagination__btns">
              <button className="btn-page" onClick={() => goPage(page - 1)} disabled={page <= 1}>Prev</button>
              <button className="btn-page" onClick={() => goPage(page + 1)} disabled={page >= totalPages}>Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
