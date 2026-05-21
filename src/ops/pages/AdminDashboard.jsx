import { useState, useEffect } from "react";
import { LuUsers, LuRadio, LuMail, LuDollarSign } from "react-icons/lu";
import "./AdminDashboard.css";

async function adminApi(body) {
  const res = await fetch("/api/admin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

function fmt(n) { return Number(n || 0).toLocaleString(); }

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function initials(name, email) {
  if (name && name.trim()) return name.trim()[0];
  if (email) return email[0].toUpperCase();
  return "?";
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    adminApi({ action: "stats" })
      .then(data => {
        if (data.error) setError(data.error);
        else setStats(data);
      })
      .catch(() => setError("Failed to load stats"))
      .finally(() => setLoading(false));
  }, []);

  const CARDS = stats ? [
    { label: "Total Users",     value: fmt(stats.users),      icon: LuUsers,      iconClass: "green"  },
    { label: "Total Campaigns", value: fmt(stats.campaigns),  icon: LuRadio,      iconClass: "blue"   },
    { label: "Emails Sent",     value: fmt(stats.emailsSent), icon: LuMail,       iconClass: "yellow" },
    { label: "Total Revenue",   value: `₹${fmt(stats.revenue)}`, icon: LuDollarSign, iconClass: "purple" },
  ] : [];

  return (
    <div>
      <div className="page-header">
        <div className="page-header__left">
          <h1>Overview</h1>
          <p>Key metrics across thehotspot platform</p>
        </div>
      </div>

      {loading && <div className="state-loading">Loading stats…</div>}
      {error && <div className="msg-error">{error}</div>}

      {stats && (
        <>
          <div className="dashboard-stats">
            {CARDS.map(({ label, value, icon: Icon, iconClass }) => (
              <div className="stat-card" key={label}>
                <div className={`stat-card__icon stat-card__icon--${iconClass}`}>
                  <Icon size={18} />
                </div>
                <div className="stat-card__label">{label}</div>
                <div className="stat-card__value">{value}</div>
              </div>
            ))}
          </div>

          <div className="dashboard-bottom">
            <div className="card">
              <div className="section-title">Recent Signups</div>
              {stats.recentSignups?.length === 0 && (
                <div className="state-empty">No users yet</div>
              )}
              {stats.recentSignups?.map(u => (
                <div className="recent-user-row" key={u.id}>
                  <div className="recent-user-avatar">{initials(u.full_name, u.email)}</div>
                  <div className="recent-user-info">
                    <div className="recent-user-name">{u.full_name || "(no name)"}</div>
                    <div className="recent-user-email">{u.email}</div>
                  </div>
                  <div className="recent-user-date">{fmtDate(u.created_at)}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
