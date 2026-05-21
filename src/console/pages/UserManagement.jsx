import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { LuSearch, LuCheck, LuTriangleAlert } from "react-icons/lu";
import { listUsers, setUserRole, logAudit } from "../api/consoleApi.js";

const ROLES = ["user", "manager", "admin"];

export default function UserManagement() {
  const { user } = useOutletContext();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    const t = setTimeout(() => {
      listUsers(search)
        .then(r => { if (alive) { setUsers(r.users || []); setLoading(false); } })
        .catch(() => { if (alive) setLoading(false); });
    }, 300);
    return () => { alive = false; clearTimeout(t); };
  }, [search]);

  useEffect(() => {
    if (!toast) return;
    const tm = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(tm);
  }, [toast]);

  const changeRole = async (u, role) => {
    if (role === u.role) return;
    setSavingId(u.id);
    try {
      await setUserRole(u.id, role);
      logAudit(user?.username || "admin", "role.change", u.username, `${u.role || "user"} → ${role}`);
      setUsers(prev => prev.map(x => (x.id === u.id ? { ...x, role } : x)));
      setToast({ ok: true, msg: `${u.username} is now ${role}.` });
    } catch {
      setToast({ ok: false, msg: "Couldn't change role. Try again." });
    }
    setSavingId(null);
  };

  return (
    <div>
      <header className="dash-page-head">
        <span className="dash-eyebrow">Access · Users</span>
        <h1 className="dash-page-title">User <em>management</em></h1>
        <p className="dash-page-stats"><strong>{users.length}</strong>&nbsp;{users.length === 1 ? "user" : "users"}</p>
      </header>

      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 1000, animation: "slideIn .3s ease" }}>
          <div className={`dash-toast ${toast.ok ? "is-green" : "is-red"}`}>
            {toast.ok
              ? <LuCheck size={15} style={{ color: "var(--green)", flexShrink: 0, marginTop: 1 }} />
              : <LuTriangleAlert size={15} style={{ color: "var(--red)", flexShrink: 0, marginTop: 1 }} />}
            <span>{toast.msg}</span>
          </div>
        </div>
      )}

      <label className="dash-search" style={{ maxWidth: 320, marginBottom: 16 }}>
        <LuSearch size={14} style={{ flexShrink: 0 }} />
        <input placeholder="Search name or email…" value={search} onChange={e => setSearch(e.target.value)} />
      </label>

      <div className="dash-card" style={{ padding: 0, overflow: "hidden" }}>
        <table className="dash-table">
          <thead>
            <tr><th>User</th><th>Email</th><th>Joined</th><th>Role</th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ color: "var(--text-faint)" }}>Loading…</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={4} style={{ color: "var(--text-faint)" }}>No users found.</td></tr>
            ) : users.map(u => (
              <tr key={u.id}>
                <td style={{ fontWeight: 600 }}>{u.username}</td>
                <td className="dash-td-num">{u.email || "—"}</td>
                <td className="dash-td-num">
                  {u.created_at ? new Date(u.created_at).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                </td>
                <td>
                  <select
                    value={u.role || "user"}
                    disabled={savingId === u.id || u.id === user?.dbId}
                    title={u.id === user?.dbId ? "You can't change your own role" : undefined}
                    onChange={e => changeRole(u, e.target.value)}
                    className="dash-input"
                    style={{ height: 32, width: 124, padding: "0 8px" }}
                  >
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
