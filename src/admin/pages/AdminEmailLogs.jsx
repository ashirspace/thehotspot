import { useState, useEffect } from "react";
import { LuFilter, LuX } from "react-icons/lu";
import "./AdminEmailLogs.css";

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
  return new Date(d).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function StatusBadges({ opened, replied, bounced }) {
  return (
    <div className="badge-row">
      {bounced  && <span className="badge badge--red">Bounced</span>}
      {replied  && <span className="badge badge--green">Replied</span>}
      {opened && !replied && !bounced && <span className="badge badge--blue">Opened</span>}
      {!opened && !replied && !bounced && <span className="badge badge--gray">Sent</span>}
    </div>
  );
}

export default function AdminEmailLogs() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [campaignId, setCampaignId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [activeFilters, setActiveFilters] = useState({});
  const LIMIT = 25;

  function fetch_(p, filters) {
    setLoading(true);
    adminApi({ action: "emailLogs", page: p, ...filters })
      .then(d => {
        if (d.error) setError(d.error);
        else { setRows(d.rows || []); setTotal(d.total || 0); }
      })
      .catch(() => setError("Failed to load email logs"))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetch_(1, {}); }, []);

  function applyFilters() {
    const filters = {};
    if (campaignId.trim()) filters.campaignId = campaignId.trim();
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo)   filters.dateTo   = dateTo + "T23:59:59";
    setActiveFilters(filters);
    setPage(1);
    fetch_(1, filters);
  }

  function clearFilters() {
    setCampaignId("");
    setDateFrom("");
    setDateTo("");
    setActiveFilters({});
    setPage(1);
    fetch_(1, {});
  }

  function goPage(p) {
    setPage(p);
    fetch_(p, activeFilters);
  }

  const hasFilters = campaignId || dateFrom || dateTo;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));
  const start = (page - 1) * LIMIT + 1;
  const end = Math.min(page * LIMIT, total);

  return (
    <div>
      <div className="page-header">
        <div className="page-header__left">
          <h1>Email Logs</h1>
          <p>All sent emails and their delivery status</p>
        </div>
      </div>

      {error && <div className="msg-error">{error}</div>}

      <div className="logs-filter-bar">
        <div className="logs-filter-group">
          <label>Campaign ID</label>
          <input
            className="form-input logs-filter-input"
            type="number"
            placeholder="e.g. 42"
            value={campaignId}
            onChange={e => setCampaignId(e.target.value)}
            min="1"
          />
        </div>
        <div className="logs-filter-group">
          <label>Date from</label>
          <input
            className="form-input logs-filter-input"
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
          />
        </div>
        <div className="logs-filter-group">
          <label>Date to</label>
          <input
            className="form-input logs-filter-input"
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
          />
        </div>
        <button className="btn-primary logs-filter-apply" onClick={applyFilters}>
          <LuFilter size={14} />
          Apply
        </button>
        {hasFilters && (
          <button className="btn-ghost logs-filter-clear" onClick={clearFilters}>
            <LuX size={14} />
            Clear
          </button>
        )}
      </div>

      <div className="table-wrap">
        {loading ? (
          <div className="state-loading" />
        ) : rows.length === 0 ? (
          <div className="state-empty">No email logs found</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>To</th>
                <th>Campaign</th>
                <th>Sent At</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td className="text-primary">{r.to_email}</td>
                  <td>#{r.campaign_id}</td>
                  <td>{fmtDate(r.sent_at)}</td>
                  <td>
                    <StatusBadges
                      opened={r.opened}
                      replied={r.replied}
                      bounced={r.bounced}
                    />
                  </td>
                </tr>
              ))}
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
