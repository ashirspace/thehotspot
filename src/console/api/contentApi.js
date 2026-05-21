// Client for editable site content. Content routes live on /api/db
// (entity:"content") to stay under Vercel's Hobby-plan function limit.

// Returns { key, data, updated_at, updated_by } or null on failure.
export async function fetchContent(key) {
  try {
    const res = await fetch(`/api/db?entity=content&key=${encodeURIComponent(key)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.warn("[console] content fetch failed", e);
    return null;
  }
}

// Upserts a content row. Throws on failure.
export async function saveContent(key, data, updatedBy) {
  const res = await fetch("/api/db", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ entity: "content", action: "set", key, data, updatedBy }),
  });
  let json = {};
  try { json = await res.json(); } catch { /* ignore */ }
  if (!res.ok || !json.ok) throw new Error(json.error || "Save failed");
  return json;
}

export const fetchLoginContent = () => fetchContent("login");
export const saveLoginContent = (data, updatedBy) => saveContent("login", data, updatedBy);
