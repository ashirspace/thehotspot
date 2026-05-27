import { getDb, initDb } from "./_db.js";
import { handleLinkedInDm } from "./_linkedin-dm.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { entity, action, ...body } = req.body || {};

  // ── LinkedIn DM outreach routes ───────────────────────────────────────────
  // Folded into /api/db to stay under the Hobby-plan 12-function limit.
  if (entity === "linkedin-dm") {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
    try {
      const sql = getDb();
      await initDb(sql);
      return handleLinkedInDm(req, res, sql);
    } catch {
      return handleLinkedInDm(req, res, null);
    }
  }

  let sql;
  try {
    sql = getDb();
    await initDb(sql);
  } catch {
    return res.status(503).json({ error: "Database not configured. Add DATABASE_URL to environment variables." });
  }

  // ── Content routes (editable site copy) ────────────────────────────────────
  // Folded into /api/db to stay under the Hobby-plan 12-function limit.
  if (entity === "content" || (req.method === "GET" && req.query?.entity === "content")) {
    try {
      if (req.method === "GET") {
        const key = req.query?.key || "login";
        const rows = await sql`SELECT key, data, updated_at, updated_by FROM content WHERE key = ${key} LIMIT 1`;
        if (!rows.length) return res.status(200).json({ key, data: {}, updated_at: null, updated_by: null });
        return res.status(200).json(rows[0]);
      }
      if (action === "set") {
        // TODO: server-side role validation in v2 — this write is currently unauthenticated.
        const { key, data, updatedBy } = body;
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
      return res.status(400).json({ error: "Unknown content action: " + action });
    } catch (err) {
      console.error("db content error:", err.message);
      return res.status(500).json({ error: err.message });
    }
  }

  // ── Public stats (campaigns count + unique companies) ─────────────────────
  if (req.method === "GET" && req.query?.entity === "stats") {
    try {
      const [camp] = await sql`SELECT COUNT(*)::int AS n FROM campaigns`;
      const [companies] = await sql`SELECT COUNT(DISTINCT company)::int AS n FROM users WHERE company IS NOT NULL AND company != ''`;
      return res.status(200).json({ campaigns: camp.n, companies: companies.n });
    } catch (err) {
      return res.status(200).json({ campaigns: 0, companies: 0 });
    }
  }

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
        SELECT id, username, email, full_name, company, role_title, role, website, phone, profile_complete, gmail_refresh_token
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
          role: u.role || "user",
          website: u.website || "",
          phone: u.phone || "",
          profileComplete: !!(u.profile_complete || (u.full_name && u.company)),
        },
      });
    }

    if (action === "signup") {
      const { username, email, password, name, phone, company, role_title } = body;
      const existing = await sql`SELECT id FROM users WHERE username = ${username} LIMIT 1`;
      if (existing.length) return res.status(200).json({ created: false, error: "Username already taken" });
      const emailExists = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
      if (emailExists.length) return res.status(200).json({ created: false, error: "An account with that email already exists" });
      const rows = await sql`
        INSERT INTO users (username, email, password, full_name, phone, company, role_title)
        VALUES (${username}, ${email}, ${password}, ${name || ""}, ${phone || ""}, ${company || ""}, ${role_title || ""})
        RETURNING id
      `;
      return res.status(200).json({ created: true, id: rows[0].id });
    }

    if (action === "forgotPassword") {
      const { email } = body;
      const rows = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
      // Always return ok — don't reveal whether email exists
      return res.status(200).json({ ok: true, exists: rows.length > 0 });
    }

    if (action === "find") {
      const { email, username } = body;
      let rows;
      if (email) {
        rows = await sql`SELECT id, username, email, full_name, company, role_title, role, website, phone, profile_complete FROM users WHERE email = ${email} LIMIT 1`;
      } else {
        rows = await sql`SELECT id, username, email, full_name, company, role_title, role, website, phone, profile_complete FROM users WHERE username = ${username} LIMIT 1`;
      }
      if (!rows.length) return res.status(200).json({ found: false });
      const u = rows[0];
      return res.status(200).json({
        found: true,
        user: { id: u.id, username: u.username, email: u.email, name: u.full_name || "", company: u.company || "", role_title: u.role_title || "", role: u.role || "user", website: u.website || "", phone: u.phone || "", profileComplete: !!(u.profile_complete || (u.full_name && u.company)) },
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

    // ── Admin console: users, roles, stats, audit ──────────────────────────
    if (action === "listUsers") {
      const q = (body.search || "").trim();
      const rows = q
        ? await sql`SELECT id, username, email, full_name, role, created_at FROM users WHERE username ILIKE ${"%" + q + "%"} OR email ILIKE ${"%" + q + "%"} ORDER BY created_at DESC LIMIT 200`
        : await sql`SELECT id, username, email, full_name, role, created_at FROM users ORDER BY created_at DESC LIMIT 200`;
      return res.status(200).json({ users: rows });
    }

    if (action === "setRole") {
      const { id, role } = body;
      if (!["user", "manager", "admin"].includes(role)) return res.status(400).json({ error: "Invalid role" });
      const rows = await sql`UPDATE users SET role = ${role} WHERE id = ${id} RETURNING id, username, role`;
      if (!rows.length) return res.status(200).json({ ok: false, error: "User not found" });
      return res.status(200).json({ ok: true, user: rows[0] });
    }

    if (action === "consoleStats") {
      const u = await sql`SELECT COUNT(*)::int AS n FROM users`;
      const staff = await sql`SELECT COUNT(*)::int AS n FROM users WHERE role IN ('admin','manager')`;
      const camp = await sql`SELECT COUNT(*)::int AS n FROM campaigns`;
      const sent = await sql`SELECT COALESCE(SUM(sent_count),0)::int AS n FROM campaigns`;
      const contacts = await sql`SELECT COUNT(*)::int AS n FROM contacts`;
      const recent = await sql`SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 6`;
      return res.status(200).json({
        users: u[0].n, staff: staff[0].n, campaigns: camp[0].n,
        emailsSent: sent[0].n, contacts: contacts[0].n, recent,
      });
    }

    if (action === "logAudit") {
      const { actor, auditAction, target, detail } = body;
      await sql`INSERT INTO audit (actor, action, target, detail) VALUES (${actor || "unknown"}, ${auditAction || ""}, ${target || ""}, ${detail || ""})`;
      return res.status(200).json({ ok: true });
    }

    if (action === "listAudit") {
      const rows = await sql`SELECT id, actor, action, target, detail, created_at FROM audit ORDER BY created_at DESC LIMIT 80`;
      return res.status(200).json({ entries: rows });
    }

    // One-time first-admin bootstrap: promotes a user to admin ONLY while no
    // admin exists yet. Refuses once any admin exists, so it cannot be abused.
    if (action === "bootstrapAdmin") {
      const { username, email } = body;
      const admins = await sql`SELECT COUNT(*)::int AS n FROM users WHERE role = 'admin'`;
      if (admins[0].n > 0) {
        return res.status(200).json({ ok: false, error: "An admin already exists." });
      }
      let rows;
      if (email) {
        rows = await sql`UPDATE users SET role = 'admin' WHERE email = ${email} RETURNING id, username, email, role`;
      } else if (username) {
        rows = await sql`UPDATE users SET role = 'admin' WHERE username = ${username} RETURNING id, username, email, role`;
      } else {
        return res.status(400).json({ error: "Provide username or email" });
      }
      if (!rows.length) return res.status(200).json({ ok: false, error: "No user matched" });
      return res.status(200).json({ ok: true, promoted: rows });
    }

    return res.status(400).json({ error: "Unknown action: " + action });
  } catch (err) {
    console.error("db users error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
