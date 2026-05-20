import { useState, useEffect } from "react";
import { LuPause, LuPlay, LuSquare, LuTrash2, LuEye, LuX, LuMail } from "react-icons/lu";

const FF = "'DM Sans', sans-serif";
const C = { card: "#111116", border: "#ffffff12", text: "#F1F5F9", muted: "#64748B", purple: "#6366f1", green: "#10b981", red: "#ef4444", yellow: "#f59e0b", blue: "#0ea5e9" };

async function api(body) {
  const r = await fetch("/api/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return r.json();
}

function fmtDate(d) { if (!d) return "—"; return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); }

function Toast({ toast }) {
  if (!toast) return null;
  return <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, background: toast.type === "error" ? C.red : C.green, color: "#fff", padding: "12px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}>{toast.msg}</div>;
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

function statusStyle(r) {
  if (r.cancelled) return { label: "Cancelled", color: C.red };
  const s = (r.status || "").toLowerCase();
  if (s === "running")   return { label: "Running",   color: C.green };
  if (s === "paused")    return { label: "Paused",    color: C.yellow };
  if (s === "completed" || s === "done") return { label: "Done", color: C.blue };
  return { label: r.status || "—", color: C.muted };
}

function RecipientsModal({ campaignId, onClose }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api({ action: "campaignEmails", id: campaignId })
      .then(d => { setRows(d.rows || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [campaignId]);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, width: "100%", maxWidth: 620, maxHeight: "85vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Recipients — Campaign #{campaignId}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 4 }}><LuX size={18} /></button>
        </div>
        {loading ? (
          <div style={{ textAlign: "center", color: C.muted, padding: 24, fontSize: 13 }}>Loading…</div>
        ) : rows.length === 0 ? (
          <div style={{ textAlign: "center", color: C.muted, padding: 24, fontSize: 13 }}>No emails found</div>
        ) : (
          <div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>{rows.length} email{rows.length !== 1 ? "s" : ""} sent</div>
            {rows.map((r, i) => (
              <div key={i} style={{ padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <LuMail size={13} color={C.muted} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{r.contact_email}</span>
                  <span style={{ fontSize: 11, color: C.muted }}>{r.company ? `· ${r.company}` : ""}</span>
                </div>
                <div style={{ fontSize: 12, color: C.muted, paddingLeft: 21 }}>{r.subject || "No subject"}</div>
                <div style={{ fontSize: 10, color: C.muted, paddingLeft: 21, marginTop: 2 }}>{fmtDate(r.sent_at)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminCampaigns() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);
  const [toast, setToast] = useState(null);
  const [recipients, setRecipients] = useState(null);

  function showToast(msg, type = "success") { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); }

  function load(p = 1) {
    setLoading(true);
    api({ action: "campaigns", page: p })
      .then(d => { setRows(d.rows || []); setTotal(d.total || 0); setLoading(false); })
      .catch(() => setLoading(false));
  }

  useEffect(() => { load(1); }, []);

  async function setStatus(row, status) {
    setActing(row.id + status);
    try {
      const d = await api({ action: "setCampaignStatus", id: row.id, status });
      if (d.ok) {
        setRows(rs => rs.map(r => r.id === row.id ? { ...r, status, cancelled: status === "cancelled" } : r));
        showToast(`Campaign ${status}.`);
      } else showToast(d.error || "Failed.", "error");
    } catch { showToast("Network error.", "error"); }
    finally { setActing(null); }
  }

  async function handleDelete(row) {
    if (!window.confirm(`Delete campaign #${row.id} and all its emails?`)) return;
    setActing(row.id + "del");
    try {
      const d = await api({ action: "deleteCampaign", id: row.id });
      if (d.ok) { showToast("Campaign deleted."); load(page); }
      else showToast(d.error || "Failed.", "error");
    } catch { showToast("Network error.", "error"); }
    finally { setActing(null); }
  }

  const btn = (label, color, onClick, icon, disabled = false) => (
    <button onClick={onClick} disabled={disabled} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 7, border: `1px solid ${color}30`, background: `${color}10`, color, fontSize: 11, fontWeight: 700, cursor: disabled ? "default" : "pointer", fontFamily: FF, opacity: disabled ? 0.5 : 1 }}>
      {icon}{label}
    </button>
  );

  return (
    <div style={{ fontFamily: FF }}>
      <Toast toast={toast} />
      {recipients !== null && <RecipientsModal campaignId={recipients} onClose={() => setRecipients(null)} />}

      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: -0.5 }}>Campaigns</div>
        <div style={{ fontSize: 13, color: C.muted, marginTop: 3 }}>{total} campaign{total !== 1 ? "s" : ""} total</div>
      </div>

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: C.muted, fontSize: 13 }}>Loading…</div>
        ) : rows.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: C.muted, fontSize: 13 }}>No campaigns yet</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#0d0d12" }}>
                  {["ID", "User", "Category", "Status", "Sent", "Emails", "Date", "Actions"].map(h => (
                    <th key={h} style={{ padding: "11px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const { label, color } = statusStyle(r);
                  const isRunning = !r.cancelled && (r.status || "").toLowerCase() === "running";
                  const isPaused  = !r.cancelled && (r.status || "").toLowerCase() === "paused";
                  return (
                    <tr key={r.id} style={{ borderTop: `1px solid ${C.border}`, background: i % 2 === 1 ? "#0d0d1210" : "transparent" }}>
                      <td style={{ padding: "11px 14px", fontSize: 13, fontWeight: 700, color: C.purple }}>#{r.id}</td>
                      <td style={{ padding: "11px 14px" }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{r.user_name || "—"}</div>
                        <div style={{ fontSize: 11, color: C.muted }}>{r.user_email || r.user_id || "—"}</div>
                      </td>
                      <td style={{ padding: "11px 14px", fontSize: 12, color: C.muted }}>{r.category || "—"}</td>
                      <td style={{ padding: "11px 14px" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color, background: `${color}18`, border: `1px solid ${color}28`, borderRadius: 20, padding: "3px 9px" }}>{label}</span>
                      </td>
                      <td style={{ padding: "11px 14px", fontSize: 13, fontFamily: "'JetBrains Mono',monospace", color: C.text }}>{r.sent_count ?? 0}</td>
                      <td style={{ padding: "11px 14px", fontSize: 13, fontFamily: "'JetBrains Mono',monospace", color: C.muted }}>{r.email_count ?? 0}</td>
                      <td style={{ padding: "11px 14px", fontSize: 11, color: C.muted, whiteSpace: "nowrap" }}>{fmtDate(r.created_at)}</td>
                      <td style={{ padding: "11px 14px" }}>
                        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                          {btn("Recipients", C.blue, () => setRecipients(r.id), <LuEye size={11} />)}
                          {isRunning  && btn("Pause",   C.yellow, () => setStatus(r, "paused"),    <LuPause size={11} />, acting === r.id + "paused")}
                          {isPaused   && btn("Resume",  C.green,  () => setStatus(r, "running"),   <LuPlay size={11} />,  acting === r.id + "running")}
                          {!r.cancelled && btn("Stop",  C.red,    () => setStatus(r, "cancelled"), <LuSquare size={11} />, acting === r.id + "cancelled")}
                          {btn("Delete", C.red, () => handleDelete(r), <LuTrash2 size={11} />, acting === r.id + "del")}
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
