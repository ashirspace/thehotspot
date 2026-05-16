import { getDb, initDb } from "./_db.js";

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
    // ── GET: fetch all contacts (paginated) ────────────
    if (req.method === "GET") {
      const limit = parseInt(req.query?.limit || "500");
      const offset = parseInt(req.query?.offset || "0");
      const rows = await sql`SELECT * FROM contacts ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
      return res.status(200).json({ records: rows });
    }

    const { action, ...body } = req.body || {};

    // ── Create contact ─────────────────────────────────
    if (action === "create") {
      const f = body.fields || body;
      const rows = await sql`
        INSERT INTO contacts (name, email, company, website, category, country, notes)
        VALUES (${f.name || f.Name || ""}, ${f.email || f.Email || ""}, ${f.company || f.Company || ""}, ${f.website || f.Website || ""}, ${f.category || f.Category || ""}, ${f.country || f.Country || ""}, ${f.notes || f.Notes || ""})
        RETURNING id
      `;
      return res.status(200).json({ created: true, id: rows[0].id });
    }

    // ── Update contact ─────────────────────────────────
    if (action === "update") {
      const { id, fields } = body;
      const f = fields || {};
      await sql`
        UPDATE contacts SET
          name    = COALESCE(${f.name ?? f.Name ?? null}, name),
          email   = COALESCE(${f.email ?? f.Email ?? null}, email),
          company = COALESCE(${f.company ?? f.Company ?? null}, company),
          website = COALESCE(${f.website ?? f.Website ?? null}, website),
          category= COALESCE(${f.category ?? f.Category ?? null}, category),
          country = COALESCE(${f.country ?? f.Country ?? null}, country),
          notes   = COALESCE(${f.notes ?? f.Notes ?? null}, notes)
        WHERE id = ${id}
      `;
      return res.status(200).json({ updated: true });
    }

    // ── Delete contact ─────────────────────────────────
    if (action === "delete") {
      const { id } = body;
      await sql`DELETE FROM contacts WHERE id = ${id}`;
      return res.status(200).json({ deleted: true });
    }

    return res.status(400).json({ error: "Unknown action: " + action });
  } catch (err) {
    console.error("db-contacts error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
