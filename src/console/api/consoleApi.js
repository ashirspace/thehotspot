// Client for the admin-console data actions (all on /api/db).

async function post(payload) {
  const res = await fetch("/api/db", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  let json = {};
  try { json = await res.json(); } catch { /* ignore */ }
  if (!res.ok) throw new Error(json.error || "Request failed");
  return json;
}

export const listUsers = (search) => post({ action: "listUsers", search: search || "" });
export const setUserRole = (id, role) => post({ action: "setRole", id, role });
export const fetchStats = () => post({ action: "consoleStats" });
export const fetchAudit = () => post({ action: "listAudit" });

// Fire-and-forget — never blocks or throws into the UI.
export function logAudit(actor, auditAction, target, detail) {
  return post({ action: "logAudit", actor, auditAction, target, detail }).catch(() => {});
}
