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

  const { entity, action, ...body } = req.body || {};

  // ── Contact routes ─────────────────────────────────────────────────────────
  if (req.method === "GET" || entity === "contact") {
    try {
      if (req.method === "GET") {
        const limit = parseInt(req.query?.limit || "500");
        const offset = parseInt(req.query?.offset || "0");
        const rows = await sql`SELECT * FROM contacts ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
        return res.status(200).json({ records: rows });
      }

      if (action === "create") {
        const f = body.fields || body;
        const rows = await sql`
          INSERT INTO contacts (name, email, company, website, category, country, notes)
          VALUES (${f.name || f.Name || ""}, ${f.email || f.Email || ""}, ${f.company || f.Company || ""}, ${f.website || f.Website || ""}, ${f.category || f.Category || ""}, ${f.country || f.Country || ""}, ${f.notes || f.Notes || ""})
          RETURNING id
        `;
        return res.status(200).json({ created: true, id: rows[0].id });
      }

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

      if (action === "delete") {
        const { id } = body;
        await sql`DELETE FROM contacts WHERE id = ${id}`;
        return res.status(200).json({ deleted: true });
      }

      return res.status(400).json({ error: "Unknown contact action: " + action });
    } catch (err) {
      console.error("db contacts error:", err.message);
      return res.status(500).json({ error: err.message });
    }
  }

  // ── User routes ────────────────────────────────────────────────────────────
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    if (action === "login") {
      const { username, password } = body;
      const rows = await sql`
        SELECT id, username, email, full_name, company, role_title, website, phone, profile_complete, gmail_refresh_token
        FROM users WHERE username = ${username} AND password = ${password} LIMIT 1
      `;
      if (!rows.length) return res.status(200).json({ found: false });
      const u = rows[0];
      return res.status(200).json({
        found: true,
        user: {
          id: u.id,
          username: u.username,
          email: u.email,
          name: u.full_name || "",
          company: u.company || "",
          role_title: u.role_title || "",
          website: u.website || "",
          phone: u.phone || "",
          profileComplete: !!(u.profile_complete || (u.full_name && u.company)),
        },
      });
    }

    if (action === "signup") {
      const { username, email, password } = body;
      const existing = await sql`SELECT id FROM users WHERE username = ${username} LIMIT 1`;
      if (existing.length) return res.status(200).json({ created: false, error: "Username already taken" });
      const rows = await sql`
        INSERT INTO users (username, email, password) VALUES (${username}, ${email}, ${password})
        RETURNING id
      `;
      return res.status(200).json({ created: true, id: rows[0].id });
    }

    if (action === "find") {
      const { email, username } = body;
      let rows;
      if (email) {
        rows = await sql`SELECT id, username, email, full_name, company, role_title, website, phone, profile_complete FROM users WHERE email = ${email} LIMIT 1`;
      } else {
        rows = await sql`SELECT id, username, email, full_name, company, role_title, website, phone, profile_complete FROM users WHERE username = ${username} LIMIT 1`;
      }
      if (!rows.length) return res.status(200).json({ found: false });
      const u = rows[0];
      return res.status(200).json({
        found: true,
        user: { id: u.id, username: u.username, email: u.email, name: u.full_name || "", company: u.company || "", role_title: u.role_title || "", website: u.website || "", phone: u.phone || "", profileComplete: !!(u.profile_complete || (u.full_name && u.company)) },
      });
    }

    if (action === "update") {
      const { id, fields } = body;
      if (!id) return res.status(400).json({ error: "Missing user id" });
      await sql`
        UPDATE users SET
          username = COALESCE(${fields.username ?? null}, username),
          email = COALESCE(${fields.user_email ?? null}, email),
          password = COALESCE(${fields.password ?? null}, password),
          full_name = COALESCE(${fields.full_name ?? null}, full_name),
          company = COALESCE(${fields.company ?? null}, company),
          role_title = COALESCE(${fields.role_title ?? null}, role_title),
          website = COALESCE(${fields.website ?? null}, website),
          phone = COALESCE(${fields.phone ?? null}, phone),
          profile_complete = COALESCE(${fields.profile_complete ?? null}, profile_complete)
        WHERE id = ${id}
      `;
      return res.status(200).json({ updated: true });
    }

    if (action === "create") {
      const f = body.fields || body;
      const rows = await sql`
        INSERT INTO users (username, email, password, full_name, company, role_title, website, phone, profile_complete)
        VALUES (${f.username || ""}, ${f.user_email || f.email || ""}, ${f.password || ""}, ${f.full_name || ""}, ${f.company || ""}, ${f.role_title || ""}, ${f.website || ""}, ${f.phone || ""}, ${f.profile_complete || false})
        ON CONFLICT (username) DO UPDATE SET email = EXCLUDED.email
        RETURNING id
      `;
      return res.status(200).json({ created: true, id: rows[0].id });
    }

    if (action === "setGmailToken") {
      const { id, token } = body;
      await sql`UPDATE users SET gmail_refresh_token = ${token} WHERE id = ${id}`;
      return res.status(200).json({ ok: true });
    }

    if (action === "getGmailToken") {
      const { id } = body;
      const rows = await sql`SELECT gmail_refresh_token FROM users WHERE id = ${id} LIMIT 1`;
      return res.status(200).json({ token: rows[0]?.gmail_refresh_token || null });
    }

    return res.status(400).json({ error: "Unknown action: " + action });
  } catch (err) {
    console.error("db users error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
