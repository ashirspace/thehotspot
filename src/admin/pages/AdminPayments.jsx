import { useState, useEffect } from "react";
import { LuDollarSign } from "react-icons/lu";
import "./AdminPayments.css";

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

function fmt(n) { return Number(n || 0).toLocaleString("en-IN"); }

function planBadge(plan) {
  const p = (plan || "").toLowerCase();
  if (p === "pro")      return <span className="badge badge--blue">Pro</span>;
  if (p === "starter")  return <span className="badge badge--green">Starter</span>;
  if (p === "enterprise") return <span className="badge badge--yellow">Enterprise</span>;
  return <span className="badge badge--gray">{plan || "—"}</span>;
}

export default function AdminPayments() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [monthRevenue, setMonthRevenue] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const LIMIT = 20;

  function fetch_(p) {
    setLoading(true);
    adminApi({ action: "payments", page: p })
      .then(d => {
        if (d.error) setError(d.error);
        else {
          setRows(d.rows || []);
          setTotal(d.total || 0);
          setMonthRevenue(d.monthRevenue || 0);
        }
      })
      .catch(() => setError("Failed to load payments"))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetch_(1); }, []);

  function goPage(p) { setPage(p); fetch_(p); }

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));
  const start = (page - 1) * LIMIT + 1;
  const end = Math.min(page * LIMIT, total);

  const monthName = new Date().toLocaleString("en-IN", { month: "long", year: "numeric" });

  return (
    <div>
      <div className="page-header">
        <div className="page-header__left">
          <h1>Payments</h1>
          <p>Revenue and transaction history</p>
        </div>
      </div>

      {error && <div className="msg-error">{error}</div>}

      <div className="payments-revenue-card">
        <div className="payments-revenue-icon">
          <LuDollarSign size={24} />
        </div>
        <div className="payments-revenue-info">
          <label>Revenue this month</label>
          <div className="payments-revenue-amount">₹{fmt(monthRevenue)}</div>
          <div className="payments-revenue-sub">{monthName}</div>
        </div>
      </div>

      <div className="table-wrap">
        {loading ? (
          <div className="state-loading" />
        ) : rows.length === 0 ? (
          <div className="state-empty">No payments yet</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Amount</th>
                <th>Plan</th>
                <th>Razorpay ID</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>
                    <div className="text-primary">{r.user_name || "—"}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{r.user_email || r.user_id}</div>
                  </td>
                  <td className="text-primary">₹{fmt(r.amount)}</td>
                  <td>{planBadge(r.plan)}</td>
                  <td style={{ fontFamily: "monospace", fontSize: 12 }}>{r.razorpay_id || "—"}</td>
                  <td>{fmtDate(r.paid_at)}</td>
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
