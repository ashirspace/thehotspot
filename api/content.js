import { getDb, initDb } from "./_db.js";

// Editable site content. One row per key (e.g. key='login').
// GET  /api/content?key=login        → { key, data, updated_at, updated_by }
// POST /api/content { action:"set", key, data, updatedBy } → upsert
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  let sql;
  try {
    sql = getDb();
    await initDb(sql);
  } catch {
    return res.status(503).json({ error: "Database not configured. Add DATABASE_URL to environment variables." });
  }

  try {
    if (req.method === "GET") {
      const key = req.query?.key || "login";
      const rows = await sql`SELECT key, data, updated_at, updated_by FROM content WHERE key = ${key} LIMIT 1`;
      if (!rows.length) return res.status(200).json({ key, data: {}, updated_at: null, updated_by: null });
      return res.status(200).json(rows[0]);
    }

    if (req.method === "POST") {
      // TODO: server-side role validation in v2 — this write is currently unauthenticated.
      const { action, key, data, updatedBy } = req.body || {};
      if (action !== "set") return res.status(400).json({ error: "Unknown action: " + action });
      if (!key || typeof data !== "object" || data === null) {
        return res.status(400).json({ error: "Missing or invalid key/data" });
      }
      const rows = await sql`
        INSERT INTO content (key, data, updated_at, updated_by)
        VALUES (${key}, ${JSON.stringify(data)}::jsonb, NOW(), ${updatedBy || null})
        ON CONFLICT (key) DO UPDATE
          SET data = EXCLUDED.data, updated_at = NOW(), updated_by = EXCLUDED.updated_by
        RETURNING key, data, updated_at, updated_by
      `;
      return res.status(200).json({ ok: true, ...rows[0] });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("content error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
