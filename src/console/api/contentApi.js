// Client for editable site copy. Content routes live on /api/db
// (entity:"content") to stay under Vercel's Hobby-plan function limit.

// Returns { key, data, updated_at, updated_by } or null on failure.
export async function fetchLoginContent() {
  try {
    const res = await fetch("/api/db?entity=content&key=login");
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.warn("[console] login content fetch failed", e);
    return null;
  }
}

// Upserts the login content row. Throws on failure.
export async function saveLoginContent(data, updatedBy) {
  const res = await fetch("/api/db", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ entity: "content", action: "set", key: "login", data, updatedBy }),
  });
  let json = {};
  try { json = await res.json(); } catch { /* ignore */ }
  if (!res.ok || !json.ok) throw new Error(json.error || "Save failed");
  return json;
}
