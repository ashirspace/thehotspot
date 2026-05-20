import { createHash } from "crypto";
import { getDb } from "./_db.js";

const sha = (pw) => createHash("sha256").update(String(pw)).digest("hex");
const PG = 20;

async function boot(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS admin_users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      full_name TEXT DEFAULT 'Admin',
      password TEXT NOT NULL,
      banner TEXT DEFAULT '',
      maintenance BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE`;
  await sql`ALTER TABLE contacts ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE`;
  await sql`
    CREATE TABLE IF NOT EXISTS payments (
      id SERIAL PRIMARY KEY,
      user_name TEXT DEFAULT '',
      user_email TEXT DEFAULT '',
      amount NUMERIC(12,2) DEFAULT 0,
      plan TEXT DEFAULT 'starter',
      razorpay_id TEXT DEFAULT '',
      paid_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS site_content (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL DEFAULT '',
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  const existing = await sql`SELECT id FROM admin_users LIMIT 1`;
  if (!existing.length) {
    await sql`
      INSERT INTO admin_users (email, full_name, password)
      VALUES ('admin@thehotspot.in', 'Super Admin', ${sha("admin123")})
      ON CONFLICT DO NOTHING
    `;
  }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET" && req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  let sql;
  try {
    sql = getDb();
    await boot(sql);
  } catch (e) {
    return res.status(503).json({ error: "DB error: " + e.message });
  }

  if (req.method === "GET") {
    const rows = await sql`SELECT key, value FROM site_content`.catch(() => []);
    const content = {};
    for (const r of rows) content[r.key] = r.value;
    res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    return res.json({ content });
  }

  const { action, ...b } = req.body || {};

  try {
    // ── AUTH ──────────────────────────────────────────────────────
    if (action === "login") {
      const rows = await sql`SELECT id,email,full_name FROM admin_users WHERE email=${b.email} AND password=${sha(b.password)} LIMIT 1`;
      if (!rows.length) return res.json({ ok: false, error: "Invalid credentials" });
      return res.json({ ok: true, admin: rows[0] });
    }

    // ── DASHBOARD STATS ───────────────────────────────────────────
    if (action === "stats") {
      const [uc] = await sql`SELECT COUNT(*) AS n FROM users`;
      const [cc] = await sql`SELECT COUNT(*) AS n FROM contacts`;
      const [kc] = await sql`SELECT COUNT(*) AS n FROM campaigns`;
      const [ec] = await sql`SELECT COUNT(*) AS n FROM campaign_emails`;
      const [rv] = await sql`SELECT COALESCE(SUM(amount),0) AS n FROM payments`;
      const [ac] = await sql`SELECT COUNT(*) AS n FROM users WHERE active=true`;
      const signups = await sql`SELECT id,full_name,username,email,created_at FROM users ORDER BY created_at DESC LIMIT 6`;
      const camps = await sql`SELECT id,user_id,category,status,sent_count,cancelled,created_at FROM campaigns ORDER BY created_at DESC LIMIT 5`;
      return res.json({
        users: +uc.n, contacts: +cc.n, campaigns: +kc.n,
        emails: +ec.n, revenue: +rv.n, activeUsers: +ac.n,
        recentSignups: signups, recentCampaigns: camps,
      });
    }

    // ── USERS ─────────────────────────────────────────────────────
    if (action === "users") {
      const off = ((+b.page || 1) - 1) * PG;
      const q = b.search ? `%${b.search}%` : null;
      const rows = q
        ? await sql`SELECT id,username,full_name,email,company,role_title,phone,website,active,profile_complete,created_at FROM users WHERE full_name ILIKE ${q} OR email ILIKE ${q} OR username ILIKE ${q} ORDER BY created_at DESC LIMIT ${PG} OFFSET ${off}`
        : await sql`SELECT id,username,full_name,email,company,role_title,phone,website,active,profile_complete,created_at FROM users ORDER BY created_at DESC LIMIT ${PG} OFFSET ${off}`;
      const [{ n }] = q
        ? await sql`SELECT COUNT(*) AS n FROM users WHERE full_name ILIKE ${q} OR email ILIKE ${q} OR username ILIKE ${q}`
        : await sql`SELECT COUNT(*) AS n FROM users`;
      return res.json({ rows, total: +n });
    }

    if (action === "createUser") {
      const rows = await sql`
        INSERT INTO users (username,email,password,full_name,company,role_title,phone,website,active)
        VALUES (${b.username||""},${b.email||null},${b.password||""},${b.full_name||null},${b.company||null},${b.role_title||null},${b.phone||null},${b.website||null},true)
        RETURNING id
      `;
      return res.json({ ok: true, id: rows[0].id });
    }

    if (action === "updateUser") {
      await sql`
        UPDATE users SET
          username=${b.username}, email=${b.email||null}, full_name=${b.full_name||null},
          company=${b.company||null}, role_title=${b.role_title||null},
          phone=${b.phone||null}, website=${b.website||null}
        WHERE id=${b.id}
      `;
      return res.json({ ok: true });
    }

    if (action === "deleteUser") {
      await sql`DELETE FROM users WHERE id=${b.id}`;
      return res.json({ ok: true });
    }

    if (action === "toggleActive") {
      const [r] = await sql`UPDATE users SET active=NOT active WHERE id=${b.id} RETURNING active`;
      return res.json({ ok: true, active: r.active });
    }

    // ── CONTACTS ──────────────────────────────────────────────────
    if (action === "contacts") {
      const off = ((+b.page || 1) - 1) * PG;
      const q = b.search ? `%${b.search}%` : null;
      const cat = b.category && b.category !== "All" ? b.category : null;
      let rows, cnt;
      if (q && cat) {
        rows = await sql`SELECT * FROM contacts WHERE (name ILIKE ${q} OR email ILIKE ${q} OR company ILIKE ${q}) AND category=${cat} ORDER BY created_at DESC LIMIT ${PG} OFFSET ${off}`;
        [cnt] = await sql`SELECT COUNT(*) AS n FROM contacts WHERE (name ILIKE ${q} OR email ILIKE ${q} OR company ILIKE ${q}) AND category=${cat}`;
      } else if (q) {
        rows = await sql`SELECT * FROM contacts WHERE name ILIKE ${q} OR email ILIKE ${q} OR company ILIKE ${q} ORDER BY created_at DESC LIMIT ${PG} OFFSET ${off}`;
        [cnt] = await sql`SELECT COUNT(*) AS n FROM contacts WHERE name ILIKE ${q} OR email ILIKE ${q} OR company ILIKE ${q}`;
      } else if (cat) {
        rows = await sql`SELECT * FROM contacts WHERE category=${cat} ORDER BY created_at DESC LIMIT ${PG} OFFSET ${off}`;
        [cnt] = await sql`SELECT COUNT(*) AS n FROM contacts WHERE category=${cat}`;
      } else {
        rows = await sql`SELECT * FROM contacts ORDER BY created_at DESC LIMIT ${PG} OFFSET ${off}`;
        [cnt] = await sql`SELECT COUNT(*) AS n FROM contacts`;
      }
      return res.json({ rows, total: +cnt.n });
    }

    if (action === "createContact") {
      const rows = await sql`
        INSERT INTO contacts (name,email,company,website,category,country,notes)
        VALUES (${b.name||""},${b.email||null},${b.company||null},${b.website||null},${b.category||"Network"},${b.country||null},${b.notes||null})
        RETURNING id
      `;
      return res.json({ ok: true, id: rows[0].id });
    }

    if (action === "updateContact") {
      await sql`
        UPDATE contacts SET name=${b.name||""},email=${b.email||null},company=${b.company||null},
        website=${b.website||null},category=${b.category||"Network"},country=${b.country||null},notes=${b.notes||null}
        WHERE id=${b.id}
      `;
      return res.json({ ok: true });
    }

    if (action === "deleteContact") {
      await sql`DELETE FROM contacts WHERE id=${b.id}`;
      return res.json({ ok: true });
    }

    if (action === "toggleContactActive") {
      const [r] = await sql`UPDATE contacts SET active=NOT active WHERE id=${b.id} RETURNING active`;
      return res.json({ ok: true, active: r.active });
    }

    // ── CAMPAIGNS ─────────────────────────────────────────────────
    if (action === "campaigns") {
      const off = ((+b.page || 1) - 1) * PG;
      const rows = await sql`
        SELECT c.id,c.user_id,c.category,c.status,c.sent_count,c.failed_count,c.cancelled,c.offer_context,c.created_at,
          u.email AS user_email, u.full_name AS user_name,
          (SELECT COUNT(*) FROM campaign_emails WHERE campaign_id=c.id) AS email_count
        FROM campaigns c
        LEFT JOIN users u ON u.id::text=c.user_id OR u.email=c.user_id OR u.username=c.user_id
        ORDER BY c.created_at DESC LIMIT ${PG} OFFSET ${off}
      `;
      const [{ n }] = await sql`SELECT COUNT(*) AS n FROM campaigns`;
      return res.json({ rows, total: +n });
    }

    if (action === "setCampaignStatus") {
      if (b.status === "cancelled") {
        await sql`UPDATE campaigns SET cancelled=true,status='cancelled' WHERE id=${b.id}`;
      } else {
        await sql`UPDATE campaigns SET cancelled=false,status=${b.status} WHERE id=${b.id}`;
      }
      return res.json({ ok: true });
    }

    if (action === "deleteCampaign") {
      await sql`DELETE FROM campaign_emails WHERE campaign_id=${b.id}`;
      await sql`DELETE FROM campaigns WHERE id=${b.id}`;
      return res.json({ ok: true });
    }

    if (action === "campaignEmails") {
      const rows = await sql`SELECT contact_email,company,subject,sent_at FROM campaign_emails WHERE campaign_id=${b.id} ORDER BY sent_at DESC LIMIT 200`;
      return res.json({ rows });
    }

    // ── EMAIL LOGS ────────────────────────────────────────────────
    if (action === "emailLogs") {
      const off = ((+b.page || 1) - 1) * PG;
      const cid = b.campaignId ? +b.campaignId : null;
      const df = b.dateFrom || null;
      const dt = b.dateTo ? b.dateTo + "T23:59:59" : null;
      let rows, cnt;
      if (cid && df && dt) {
        rows = await sql`SELECT id,campaign_id,contact_email,company,subject,sent_at FROM campaign_emails WHERE campaign_id=${cid} AND sent_at>=${df}::timestamptz AND sent_at<=${dt}::timestamptz ORDER BY sent_at DESC LIMIT ${PG} OFFSET ${off}`;
        [cnt] = await sql`SELECT COUNT(*) AS n FROM campaign_emails WHERE campaign_id=${cid} AND sent_at>=${df}::timestamptz AND sent_at<=${dt}::timestamptz`;
      } else if (cid) {
        rows = await sql`SELECT id,campaign_id,contact_email,company,subject,sent_at FROM campaign_emails WHERE campaign_id=${cid} ORDER BY sent_at DESC LIMIT ${PG} OFFSET ${off}`;
        [cnt] = await sql`SELECT COUNT(*) AS n FROM campaign_emails WHERE campaign_id=${cid}`;
      } else if (df && dt) {
        rows = await sql`SELECT id,campaign_id,contact_email,company,subject,sent_at FROM campaign_emails WHERE sent_at>=${df}::timestamptz AND sent_at<=${dt}::timestamptz ORDER BY sent_at DESC LIMIT ${PG} OFFSET ${off}`;
        [cnt] = await sql`SELECT COUNT(*) AS n FROM campaign_emails WHERE sent_at>=${df}::timestamptz AND sent_at<=${dt}::timestamptz`;
      } else {
        rows = await sql`SELECT id,campaign_id,contact_email,company,subject,sent_at FROM campaign_emails ORDER BY sent_at DESC LIMIT ${PG} OFFSET ${off}`;
        [cnt] = await sql`SELECT COUNT(*) AS n FROM campaign_emails`;
      }
      return res.json({ rows, total: +cnt.n });
    }

    // ── PAYMENTS ──────────────────────────────────────────────────
    if (action === "payments") {
      const off = ((+b.page || 1) - 1) * PG;
      const rows = await sql`SELECT * FROM payments ORDER BY paid_at DESC LIMIT ${PG} OFFSET ${off}`;
      const [{ n }] = await sql`SELECT COUNT(*) AS n FROM payments`;
      const [{ total }] = await sql`SELECT COALESCE(SUM(amount),0) AS total FROM payments WHERE DATE_TRUNC('month',paid_at)=DATE_TRUNC('month',NOW())`;
      return res.json({ rows, total: +n, monthRevenue: +total });
    }

    if (action === "createPayment") {
      const rows = await sql`
        INSERT INTO payments (user_name,user_email,amount,plan,razorpay_id,paid_at)
        VALUES (${b.user_name||""},${b.user_email||""},${+b.amount||0},${b.plan||"starter"},${b.razorpay_id||""},${b.paid_at||new Date().toISOString()})
        RETURNING id
      `;
      return res.json({ ok: true, id: rows[0].id });
    }

    if (action === "updatePayment") {
      await sql`
        UPDATE payments SET user_name=${b.user_name||""},user_email=${b.user_email||""},
        amount=${+b.amount||0},plan=${b.plan||"starter"},razorpay_id=${b.razorpay_id||""},paid_at=${b.paid_at}
        WHERE id=${b.id}
      `;
      return res.json({ ok: true });
    }

    if (action === "deletePayment") {
      await sql`DELETE FROM payments WHERE id=${b.id}`;
      return res.json({ ok: true });
    }

    // ── SETTINGS ──────────────────────────────────────────────────
    if (action === "changePassword") {
      const check = await sql`SELECT id FROM admin_users WHERE id=${b.adminId} AND password=${sha(b.currentPassword)}`;
      if (!check.length) return res.json({ ok: false, error: "Current password is incorrect" });
      await sql`UPDATE admin_users SET password=${sha(b.newPassword)} WHERE id=${b.adminId}`;
      return res.json({ ok: true });
    }

    if (action === "getBanner") {
      const [r] = await sql`SELECT banner,maintenance FROM admin_users ORDER BY id LIMIT 1`;
      return res.json({ banner: r?.banner || "", maintenance: r?.maintenance || false });
    }

    if (action === "setBanner") {
      await sql`UPDATE admin_users SET banner=${b.message||""} WHERE id=(SELECT id FROM admin_users ORDER BY id LIMIT 1)`;
      return res.json({ ok: true });
    }

    if (action === "setMaintenance") {
      await sql`UPDATE admin_users SET maintenance=${!!b.enabled} WHERE id=(SELECT id FROM admin_users ORDER BY id LIMIT 1)`;
      return res.json({ ok: true });
    }

    // ── SITE CONTENT (CMS) ────────────────────────────────────────
    if (action === "getAllContent") {
      const rows = await sql`SELECT key, value FROM site_content`;
      const content = {};
      for (const r of rows) content[r.key] = r.value;
      return res.json({ content });
    }

    if (action === "setContent") {
      await sql`
        INSERT INTO site_content (key, value, updated_at)
        VALUES (${b.key}, ${b.value ?? ""}, NOW())
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
      `;
      return res.json({ ok: true });
    }

    if (action === "setContentBulk") {
      const entries = b.entries || [];
      for (const { key, value } of entries) {
        await sql`
          INSERT INTO site_content (key, value, updated_at)
          VALUES (${key}, ${value ?? ""}, NOW())
          ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
        `;
      }
      return res.json({ ok: true });
    }

    return res.status(400).json({ error: "Unknown action: " + action });
  } catch (e) {
    console.error("[admin]", action, e.message);
    return res.status(500).json({ error: e.message });
  }
}
