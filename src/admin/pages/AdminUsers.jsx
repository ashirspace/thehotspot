import { useState, useEffect, useRef } from "react";
import { LuPlus, LuPencil, LuTrash2, LuSearch, LuX, LuToggleLeft, LuToggleRight, LuCheck } from "react-icons/lu";

const FF = "'DM Sans', sans-serif";
const C = { card: "#111116", border: "#ffffff12", text: "#F1F5F9", muted: "#64748B", purple: "#6366f1", green: "#10b981", red: "#ef4444" };

async function api(body) {
  const r = await fetch("/api/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return r.json();
}

const inp = { width: "100%", background: "#0d0d12", border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 12px", fontSize: 13, color: C.text, fontFamily: FF, outline: "none", boxSizing: "border-box" };
const lbl = { fontSize: 11, fontWeight: 700, color: C.muted, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 };

function fmtDate(d) { if (!d) return "—"; return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); }

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, background: toast.type === "error" ? C.red : C.green, color: "#fff", padding: "12px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}>
      {toast.msg}
    </div>
  );
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
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, width: "100%", maxWidth: 500, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{title}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 4 }}><LuX size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

const EMPTY = { username: "", email: "", password: "", full_name: "", company: "", role_title: "", phone: "", website: "" };

function UserForm({ form, setForm, onSubmit, loading, isEdit }) {
  const field = (key, label, type = "text", ph = "") => (
    <div style={{ marginBottom: 14 }}>
      <label style={lbl}>{label}{!isEdit && key === "password" ? "" : isEdit && key === "password" ? " (leave blank to keep)" : ""}</label>
      <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={ph} style={inp} />
    </div>
  );
  return (
    <form onSubmit={onSubmit}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
        {field("username", "Username*", "text", "john_doe")}
        {field("email", "Email", "email", "john@example.com")}
        {field("password", isEdit ? "New Password" : "Password*", "password", "••••••••")}
        {field("full_name", "Full Name", "text", "John Doe")}
        {field("company", "Company", "text", "Acme Inc.")}
        {field("role_title", "Role / Title", "text", "CEO")}
        {field("phone", "Phone", "tel", "+91 98765 43210")}
        {field("website", "Website", "text", "https://example.com")}
      </div>
      <button type="submit" disabled={loading} style={{ width: "100%", padding: 11, borderRadius: 10, border: "none", background: C.purple, color: "#fff", fontSize: 13, fontWeight: 700, cursor: loading ? "default" : "pointer", fontFamily: FF, opacity: loading ? 0.7 : 1, marginTop: 4 }}>
        {loading ? "Saving…" : isEdit ? "Save changes" : "Create user"}
      </button>
    </form>
  );
}

export default function AdminUsers() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | "create" | rowObj
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [acting, setActing] = useState(null);
  const [toast, setToast] = useState(null);
  const debounce = useRef(null);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function load(p = 1, q = search) {
    setLoading(true);
    api({ action: "users", page: p, search: q })
      .then(d => { setRows(d.rows || []); setTotal(d.total || 0); setLoading(false); })
      .catch(() => setLoading(false));
  }

  useEffect(() => { load(1, ""); }, []);

  function handleSearch(val) {
    setSearch(val); setPage(1);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => load(1, val), 350);
  }

  function openCreate() { setForm(EMPTY); setModal("create"); }
  function openEdit(row) { setForm({ username: row.username || "", email: row.email || "", password: "", full_name: row.full_name || "", company: row.company || "", role_title: row.role_title || "", phone: row.phone || "", website: row.website || "" }); setModal(row); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.username) { showToast("Username is required.", "error"); return; }
    if (modal === "create" && !form.password) { showToast("Password is required for new users.", "error"); return; }
    setSaving(true);
    try {
      const isEdit = modal !== "create";
      const body = isEdit
        ? { action: "updateUser", id: modal.id, ...form }
        : { action: "createUser", ...form };
      const d = await api(body);
      if (d.ok) { showToast(isEdit ? "User updated." : "User created."); setModal(null); load(page); }
      else showToast(d.error || "Failed.", "error");
    } catch { showToast("Network error.", "error"); }
    finally { setSaving(false); }
  }

  async function handleDelete(row) {
    if (!window.confirm(`Delete user "${row.username}"? This cannot be undone.`)) return;
    setActing(row.id + "del");
    try {
      const d = await api({ action: "deleteUser", id: row.id });
      if (d.ok) { showToast("User deleted."); load(page); }
      else showToast(d.error || "Failed.", "error");
    } catch { showToast("Network error.", "error"); }
    finally { setActing(null); }
  }

  async function handleToggle(row) {
    setActing(row.id + "tog");
    try {
      const d = await api({ action: "toggleActive", id: row.id });
      if (d.ok) { setRows(rs => rs.map(r => r.id === row.id ? { ...r, active: d.active } : r)); showToast(d.active ? "User set live." : "User set un-live."); }
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

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: -0.5 }}>Users</div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 3 }}>{total} registered user{total !== 1 ? "s" : ""}</div>
        </div>
        <button onClick={openCreate} style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: 10, border: "none", background: C.purple, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: FF }}>
          <LuPlus size={16} /> Add User
        </button>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 16 }}>
        <LuSearch size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.muted }} />
        <input value={search} onChange={e => handleSearch(e.target.value)} placeholder="Search by name, email, or username…" style={{ ...inp, paddingLeft: 34, maxWidth: 380 }} />
      </div>

      {/* Table */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: C.muted, fontSize: 13 }}>Loading…</div>
        ) : rows.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: C.muted, fontSize: 13 }}>No users found</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#0d0d12" }}>
                  {["Name", "Email", "Company", "Role", "Status", "Joined", "Actions"].map(h => (
                    <th key={h} style={{ padding: "11px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.id} style={{ borderTop: `1px solid ${C.border}`, background: i % 2 === 1 ? "#0d0d1210" : "transparent" }}>
                    <td style={{ padding: "11px 14px" }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{r.full_name || "—"}</div>
                      <div style={{ fontSize: 11, color: C.muted }}>@{r.username}</div>
                    </td>
                    <td style={{ padding: "11px 14px", fontSize: 12, color: C.muted }}>{r.email || "—"}</td>
                    <td style={{ padding: "11px 14px", fontSize: 12, color: C.muted }}>{r.company || "—"}</td>
                    <td style={{ padding: "11px 14px", fontSize: 12, color: C.muted }}>{r.role_title || "—"}</td>
                    <td style={{ padding: "11px 14px" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: r.active !== false ? C.green : C.red, background: r.active !== false ? "#10b98118" : "#ef444418", border: `1px solid ${r.active !== false ? "#10b98130" : "#ef444430"}`, borderRadius: 20, padding: "3px 10px" }}>
                        {r.active !== false ? "Live" : "Un-live"}
                      </span>
                    </td>
                    <td style={{ padding: "11px 14px", fontSize: 11, color: C.muted, whiteSpace: "nowrap" }}>{fmtDate(r.created_at)}</td>
                    <td style={{ padding: "11px 14px" }}>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {btn("Edit", C.purple, () => openEdit(r), <LuPencil size={11} />)}
                        {btn(r.active !== false ? "Un-live" : "Make Live", r.active !== false ? "#f59e0b" : C.green, () => handleToggle(r), r.active !== false ? <LuToggleRight size={12} /> : <LuToggleLeft size={12} />, acting === r.id + "tog")}
                        {btn("Delete", C.red, () => handleDelete(r), <LuTrash2 size={11} />, acting === r.id + "del")}
                      </div>
                    </td>
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

      {/* Modal */}
      {modal && (
        <Modal onClose={() => setModal(null)} title={modal === "create" ? "Add User" : `Edit — @${modal.username}`}>
          <UserForm form={form} setForm={setForm} onSubmit={handleSubmit} loading={saving} isEdit={modal !== "create"} />
        </Modal>
      )}
    </div>
  );
}
