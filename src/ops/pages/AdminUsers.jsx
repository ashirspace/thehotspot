import { useState, useEffect, useRef } from "react";
import { LuSearch, LuX, LuEye } from "react-icons/lu";
import "./AdminUsers.css";

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

function ProfileModal({ userId, onClose }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi({ action: "userProfile", id: userId })
      .then(d => setUser(d.user))
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-box__header">
          <h2>User Profile</h2>
          <button className="modal-close" onClick={onClose}><LuX size={18} /></button>
        </div>
        {loading && <div className="state-loading" />}
        {!loading && !user && <div className="state-empty">User not found</div>}
        {user && (
          <div className="profile-grid">
            <div className="profile-field">
              <label>Full Name</label>
              <span className={!user.full_name ? "empty" : ""}>{user.full_name || "Not set"}</span>
            </div>
            <div className="profile-field">
              <label>Username</label>
              <span className={!user.username ? "empty" : ""}>{user.username || "Not set"}</span>
            </div>
            <div className="profile-field profile-field--full">
              <label>Email</label>
              <span>{user.email || "—"}</span>
            </div>
            <div className="profile-field">
              <label>Company</label>
              <span className={!user.company ? "empty" : ""}>{user.company || "Not set"}</span>
            </div>
            <div className="profile-field">
              <label>Role / Title</label>
              <span className={!user.role_title ? "empty" : ""}>{user.role_title || "Not set"}</span>
            </div>
            <div className="profile-field">
              <label>Phone</label>
              <span className={!user.phone ? "empty" : ""}>{user.phone || "Not set"}</span>
            </div>
            <div className="profile-field">
              <label>Website</label>
              <span className={!user.website ? "empty" : ""}>{user.website || "Not set"}</span>
            </div>
            <div className="profile-field">
              <label>Profile Complete</label>
              <span>
                <span className={`badge badge--${user.profile_complete ? "green" : "gray"}`}>
                  {user.profile_complete ? "Yes" : "No"}
                </span>
              </span>
            </div>
            <div className="profile-field profile-field--full">
              <label>Joined</label>
              <span>{fmtDate(user.created_at)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewId, setViewId] = useState(null);
  const debounceRef = useRef(null);
  const LIMIT = 20;

  function fetchUsers(p, q) {
    setLoading(true);
    adminApi({ action: "users", page: p, search: q })
      .then(d => {
        if (d.error) setError(d.error);
        else { setRows(d.rows || []); setTotal(d.total || 0); }
      })
      .catch(() => setError("Failed to load users"))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchUsers(1, ""); }, []);

  function handleSearch(val) {
    setSearch(val);
    setPage(1);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchUsers(1, val), 300);
  }

  function goPage(p) {
    setPage(p);
    fetchUsers(p, search);
  }

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));
  const start = (page - 1) * LIMIT + 1;
  const end = Math.min(page * LIMIT, total);

  return (
    <div>
      <div className="page-header">
        <div className="page-header__left">
          <h1>Users</h1>
          <p>All registered users on thehotspot</p>
        </div>
      </div>

      {error && <div className="msg-error">{error}</div>}

      <div className="users-toolbar">
        <div className="users-search-wrap">
          <span className="users-search-icon"><LuSearch size={15} /></span>
          <input
            className="form-input users-search-input"
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={e => handleSearch(e.target.value)}
          />
        </div>
        {!loading && <span className="users-count">{total} user{total !== 1 ? "s" : ""}</span>}
      </div>

      <div className="table-wrap">
        {loading ? (
          <div className="state-loading" />
        ) : rows.length === 0 ? (
          <div className="state-empty">No users found</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Company</th>
                <th>Role</th>
                <th>Phone</th>
                <th>Profile</th>
                <th>Joined</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(u => (
                <tr key={u.id}>
                  <td className="text-primary">{u.full_name || "—"}</td>
                  <td>{u.email}</td>
                  <td>{u.company || "—"}</td>
                  <td>{u.role_title || "—"}</td>
                  <td>{u.phone || "—"}</td>
                  <td>
                    <span className={`badge badge--${u.profile_complete ? "green" : "gray"}`}>
                      {u.profile_complete ? "Complete" : "Incomplete"}
                    </span>
                  </td>
                  <td>{fmtDate(u.created_at)}</td>
                  <td>
                    <button className="btn-ghost" onClick={() => setViewId(u.id)}>
                      <LuEye size={13} />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && rows.length > 0 && (
          <div className="pagination">
            <span className="pagination__info">
              {start}–{end} of {total}
            </span>
            <div className="pagination__btns">
              <button className="btn-page" onClick={() => goPage(page - 1)} disabled={page <= 1}>Prev</button>
              <button className="btn-page" onClick={() => goPage(page + 1)} disabled={page >= totalPages}>Next</button>
            </div>
          </div>
        )}
      </div>

      {viewId && <ProfileModal userId={viewId} onClose={() => setViewId(null)} />}
    </div>
  );
}
