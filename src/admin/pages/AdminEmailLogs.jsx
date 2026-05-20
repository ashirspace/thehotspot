import { useState, useEffect } from "react";
import { LuSearch, LuX, LuFilter } from "react-icons/lu";

const FF = "'DM Sans', sans-serif";
const C = { card: "#111116", border: "#ffffff12", text: "#F1F5F9", muted: "#64748B", purple: "#6366f1", green: "#10b981", blue: "#0ea5e9" };

async function api(body) {
  const r = await fetch("/api/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return r.json();
}

const inp = { background: "#0d0d12", border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 12px", fontSize: 13, color: C.text, fontFamily: FF, outline: "none", boxSizing: "border-box" };
const lbl = { fontSize: 11, fontWeight: 700, color: C.muted, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 };

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function Pager({ page, total, limit = 20, onChange }) {
  const pages = Math.max(1, Math.ceil(total / limit));
  if (pages <= 1 && total <= limit) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 14, marginTop: 8, borderTop: `1px solid ${C.border}` }}>
      <span style={{ fontSize: 12, color: C.muted }}>{(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}</span>
      <div style={{ display: "flex", gap: 6 }}>
        <button onClick={() => onChange(page - 1)} disabled={page <= 1} style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: "#0d0d12", color: page > 1 ? C.text : C.muted, fontSize: 12, cursor: page > 1 ? "pointer" : "default", fontFamily: FF }}>Prev</button>
        <button onClick={() => onChange(page + 1)} disabled={page >= pages} style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: "#0d0d12", color: page < pages ? C.text : C.muted, fontSize: 12, cursor: page < pages ? "pointer" : "default", fontFamily: FF }}>Next</button>
      </div>
    </div>
  );
}

export default function AdminEmailLogs() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [campaignId, setCampaignId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [active, setActive] = useState({});

  function load(p = 1, filters = active) {
    setLoading(true);
    api({ action: "emailLogs", page: p, ...filters })
      .then(d => { setRows(d.rows || []); setTotal(d.total || 0); setLoading(false); })
      .catch(() => setLoading(false));
  }

  useEffect(() => { load(1, {}); }, []);

  function applyFilters() {
    const f = {};
    if (campaignId.trim()) f.campaignId = campaignId.trim();
    if (dateFrom) f.dateFrom = dateFrom;
    if (dateTo) f.dateTo = dateTo;
    setActive(f); setPage(1); load(1, f);
  }

  function clearFilters() {
    setCampaignId(""); setDateFrom(""); setDateTo("");
    setActive({}); setPage(1); load(1, {});
  }

  const hasFilters = campaignId || dateFrom || dateTo;

  return (
    <div style={{ fontFamily: FF }}>
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: -0.5 }}>Email Logs</div>
        <div style={{ fontSize: 13, color: C.muted, marginTop: 3 }}>{total} email record{total !== 1 ? "s" : ""}</div>
      </div>

      {/* Filter bar */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 16px", marginBottom: 16, display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
        <div>
          <label style={lbl}>Campaign ID</label>
          <input type="number" value={campaignId} onChange={e => setCampaignId(e.target.value)} placeholder="e.g. 42" min="1" style={{ ...inp, width: 120 }} />
        </div>
        <div>
          <label style={lbl}>Date From</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ ...inp, width: 160 }} />
        </div>
        <div>
          <label style={lbl}>Date To</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ ...inp, width: 160 }} />
        </div>
        <button onClick={applyFilters} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 8, border: "none", background: C.purple, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: FF }}>
          <LuFilter size={13} /> Apply
        </button>
        {hasFilters && (
          <button onClick={clearFilters} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: FF }}>
            <LuX size={13} /> Clear
          </button>
        )}
      </div>

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: C.muted, fontSize: 13 }}>Loading…</div>
        ) : rows.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: C.muted, fontSize: 13 }}>No email logs found</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#0d0d12" }}>
                  {["#", "Campaign", "Recipient", "Company", "Subject", "Sent At"].map(h => (
                    <th key={h} style={{ padding: "11px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.id} style={{ borderTop: `1px solid ${C.border}`, background: i % 2 === 1 ? "#0d0d1210" : "transparent" }}>
                    <td style={{ padding: "11px 14px", fontSize: 12, color: C.muted, fontFamily: "'JetBrains Mono',monospace" }}>{r.id}</td>
                    <td style={{ padding: "11px 14px" }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: C.purple, background: "#6366f118", border: "1px solid #6366f128", borderRadius: 20, padding: "3px 8px" }}>#{r.campaign_id}</span>
                    </td>
                    <td style={{ padding: "11px 14px", fontSize: 13, fontWeight: 600, color: C.text }}>{r.contact_email || "—"}</td>
                    <td style={{ padding: "11px 14px", fontSize: 12, color: C.muted }}>{r.company || "—"}</td>
                    <td style={{ padding: "11px 14px", fontSize: 12, color: C.muted, maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.subject || "—"}</td>
                    <td style={{ padding: "11px 14px", fontSize: 11, color: C.muted, whiteSpace: "nowrap" }}>{fmtDate(r.sent_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && rows.length > 0 && (
          <div style={{ padding: "0 16px 14px" }}>
            <Pager page={page} total={total} onChange={p => { setPage(p); load(p); }} />
          </div>
        )}
      </div>
    </div>
  );
}
