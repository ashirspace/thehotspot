import { useState, useEffect } from "react";
import { LuPlus, LuPencil, LuTrash2, LuX, LuDollarSign } from "react-icons/lu";

const FF = "'DM Sans', sans-serif";
const C = { card: "#111116", border: "#ffffff12", text: "#F1F5F9", muted: "#64748B", purple: "#6366f1", green: "#10b981", red: "#ef4444", blue: "#0ea5e9", yellow: "#f59e0b", pink: "#ec4899" };
const PLANS = ["starter", "pro", "enterprise"];
const PLAN_COLOR = { starter: C.green, pro: C.blue, enterprise: C.purple };

async function api(body) {
  const r = await fetch("/api/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return r.json();
}

const inp = { width: "100%", background: "#0d0d12", border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 12px", fontSize: 13, color: C.text, fontFamily: FF, outline: "none", boxSizing: "border-box" };
const lbl = { fontSize: 11, fontWeight: 700, color: C.muted, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 };

function fmtDate(d) { if (!d) return "—"; return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); }
function fmt(n) { return Number(n || 0).toLocaleString("en-IN"); }

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

function Modal({ onClose, title, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{title}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 4 }}><LuX size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

const EMPTY = { user_name: "", user_email: "", amount: "", plan: "starter", razorpay_id: "", paid_at: new Date().toISOString().slice(0, 10) };

function PaymentForm({ form, setForm, onSubmit, loading, isEdit }) {
  const field = (key, label, type = "text", ph = "") => (
    <div style={{ marginBottom: 14 }}>
      <label style={lbl}>{label}</label>
      <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={ph} style={inp} />
    </div>
  );
  return (
    <form onSubmit={onSubmit}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
        {field("user_name", "User Name", "text", "John Doe")}
        {field("user_email", "User Email", "email", "john@example.com")}
        {field("amount", "Amount (₹)*", "number", "999")}
        <div style={{ marginBottom: 14 }}>
          <label style={lbl}>Plan*</label>
          <select value={form.plan} onChange={e => setForm(f => ({ ...f, plan: e.target.value }))} style={inp}>
            {PLANS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
          </select>
        </div>
        {field("razorpay_id", "Razorpay ID", "text", "pay_abc123")}
        {field("paid_at", "Payment Date", "date")}
      </div>
      <button type="submit" disabled={loading} style={{ width: "100%", padding: 11, borderRadius: 10, border: "none", background: C.purple, color: "#fff", fontSize: 13, fontWeight: 700, cursor: loading ? "default" : "pointer", fontFamily: FF, opacity: loading ? 0.7 : 1 }}>
        {loading ? "Saving…" : isEdit ? "Save changes" : "Add payment"}
      </button>
    </form>
  );
}

export default function AdminPayments() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [monthRevenue, setMonthRevenue] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [acting, setActing] = useState(null);
  const [toast, setToast] = useState(null);

  function showToast(msg, type = "success") { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); }

  function load(p = 1) {
    setLoading(true);
    api({ action: "payments", page: p })
      .then(d => { setRows(d.rows || []); setTotal(d.total || 0); setMonthRevenue(d.monthRevenue || 0); setLoading(false); })
      .catch(() => setLoading(false));
  }

  useEffect(() => { load(1); }, []);

  function openCreate() { setForm(EMPTY); setModal("create"); }
  function openEdit(row) {
    setForm({ user_name: row.user_name || "", user_email: row.user_email || "", amount: row.amount || "", plan: row.plan || "starter", razorpay_id: row.razorpay_id || "", paid_at: row.paid_at ? new Date(row.paid_at).toISOString().slice(0, 10) : "" });
    setModal(row);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.amount) { showToast("Amount is required.", "error"); return; }
    setSaving(true);
    try {
      const isEdit = modal !== "create";
      const d = await api(isEdit ? { action: "updatePayment", id: modal.id, ...form } : { action: "createPayment", ...form });
      if (d.ok) { showToast(isEdit ? "Payment updated." : "Payment added."); setModal(null); load(page); }
      else showToast(d.error || "Failed.", "error");
    } catch { showToast("Network error.", "error"); }
    finally { setSaving(false); }
  }

  async function handleDelete(row) {
    if (!window.confirm(`Delete payment #${row.id}?`)) return;
    setActing(row.id);
    try {
      const d = await api({ action: "deletePayment", id: row.id });
      if (d.ok) { showToast("Deleted."); load(page); }
      else showToast(d.error || "Failed.", "error");
    } catch { showToast("Network error.", "error"); }
    finally { setActing(null); }
  }

  const btn = (label, color, onClick, icon, disabled = false) => (
    <button onClick={onClick} disabled={disabled} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 7, border: `1px solid ${color}30`, background: `${color}10`, color, fontSize: 11, fontWeight: 700, cursor: disabled ? "default" : "pointer", fontFamily: FF, opacity: disabled ? 0.5 : 1 }}>
      {icon}{label}
    </button>
  );

  const monthName = new Date().toLocaleString("en-IN", { month: "long", year: "numeric" });

  return (
    <div style={{ fontFamily: FF }}>
      <Toast toast={toast} />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: -0.5 }}>Payments</div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 3 }}>{total} transaction{total !== 1 ? "s" : ""}</div>
        </div>
        <button onClick={openCreate} style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: 10, border: "none", background: C.purple, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: FF }}>
          <LuPlus size={16} /> Add Payment
        </button>
      </div>

      {/* Monthly revenue card */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 22px", marginBottom: 18, display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: "#ec489918", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <LuDollarSign size={20} color={C.pink} />
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 2 }}>Revenue this month</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: C.text, fontFamily: "'JetBrains Mono',monospace", letterSpacing: -1 }}>₹{fmt(monthRevenue)}</div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{monthName}</div>
        </div>
      </div>

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: C.muted, fontSize: 13 }}>Loading…</div>
        ) : rows.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: C.muted, fontSize: 13 }}>No payments yet</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#0d0d12" }}>
                  {["#", "User", "Amount", "Plan", "Razorpay ID", "Date", "Actions"].map(h => (
                    <th key={h} style={{ padding: "11px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const pc = PLAN_COLOR[r.plan] || C.muted;
                  return (
                    <tr key={r.id} style={{ borderTop: `1px solid ${C.border}`, background: i % 2 === 1 ? "#0d0d1210" : "transparent" }}>
                      <td style={{ padding: "11px 14px", fontSize: 12, color: C.muted }}>{r.id}</td>
                      <td style={{ padding: "11px 14px" }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{r.user_name || "—"}</div>
                        <div style={{ fontSize: 11, color: C.muted }}>{r.user_email || "—"}</div>
                      </td>
                      <td style={{ padding: "11px 14px", fontSize: 14, fontWeight: 800, color: C.text, fontFamily: "'JetBrains Mono',monospace" }}>₹{fmt(r.amount)}</td>
                      <td style={{ padding: "11px 14px" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: pc, background: `${pc}18`, border: `1px solid ${pc}28`, borderRadius: 20, padding: "3px 10px", textTransform: "capitalize" }}>{r.plan || "—"}</span>
                      </td>
                      <td style={{ padding: "11px 14px", fontSize: 12, color: C.muted, fontFamily: "'JetBrains Mono',monospace" }}>{r.razorpay_id || "—"}</td>
                      <td style={{ padding: "11px 14px", fontSize: 11, color: C.muted, whiteSpace: "nowrap" }}>{fmtDate(r.paid_at)}</td>
                      <td style={{ padding: "11px 14px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          {btn("Edit", C.purple, () => openEdit(r), <LuPencil size={11} />)}
                          {btn("Delete", C.red, () => handleDelete(r), <LuTrash2 size={11} />, acting === r.id)}
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

      {modal && (
        <Modal onClose={() => setModal(null)} title={modal === "create" ? "Add Payment" : `Edit Payment #${modal.id}`}>
          <PaymentForm form={form} setForm={setForm} onSubmit={handleSubmit} loading={saving} isEdit={modal !== "create"} />
        </Modal>
      )}
    </div>
  );
}
