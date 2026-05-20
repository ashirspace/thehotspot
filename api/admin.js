import { getDb } from "./_db.js";

async function initAdminDb(sql) {
  await sql`CREATE TABLE IF NOT EXISTS admin (id SERIAL PRIMARY KEY, email TEXT UNIQUE NOT NULL, full_name TEXT, password TEXT, banner TEXT, created_at TIMESTAMPTZ DEFAULT NOW())`;
  await sql`ALTER TABLE admin ADD COLUMN IF NOT EXISTS banner TEXT`;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  let sql;
  try {
    sql = getDb();
    await initAdminDb(sql);
  } catch {
    return res.status(503).json({ error: "Database not configured" });
  }

  const { action, ...body } = req.body || {};

  try {
    // ── Login ──────────────────────────────────────────────────────────────────
    if (action === "login") {
      const { email, password } = body;
      if (!email || !password) return res.status(400).json({ ok: false, error: "Email and password required" });
      const rows = await sql`
        SELECT id, email, full_name FROM admin
        WHERE email = ${email} AND password = ${password}
        LIMIT 1
      `;
      if (!rows.length) return res.status(200).json({ ok: false, error: "Invalid credentials" });
      return res.status(200).json({ ok: true, admin: rows[0] });
    }

    // ── Dashboard stats ────────────────────────────────────────────────────────
    if (action === "stats") {
      const [usersCount] = await sql`SELECT COUNT(*) AS count FROM users`;
      const [campaignsCount] = await sql`SELECT COUNT(*) AS count FROM campaigns`;
      const [emailsCount] = await sql`SELECT COUNT(*) AS count FROM email_logs`;
      const [revenueRow] = await sql`SELECT COALESCE(SUM(amount), 0) AS total FROM payments`;
      const recentSignups = await sql`
        SELECT id, full_name, email, created_at FROM users
        ORDER BY created_at DESC LIMIT 5
      `;
      return res.status(200).json({
        users: parseInt(usersCount.count),
        campaigns: parseInt(campaignsCount.count),
        emailsSent: parseInt(emailsCount.count),
        revenue: parseFloat(revenueRow.total),
        recentSignups,
      });
    }

    // ── Users list ─────────────────────────────────────────────────────────────
    if (action === "users") {
      const page = parseInt(body.page || 1);
      const limit = 20;
      const offset = (page - 1) * limit;
      const search = body.search ? `%${body.search}%` : null;

      let rows, totalRow;
      if (search) {
        rows = await sql`
          SELECT id, full_name, email, company, role_title, phone, profile_complete, created_at
          FROM users
          WHERE full_name ILIKE ${search} OR email ILIKE ${search}
          ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}
        `;
        [totalRow] = await sql`
          SELECT COUNT(*) AS count FROM users
          WHERE full_name ILIKE ${search} OR email ILIKE ${search}
        `;
      } else {
        rows = await sql`
          SELECT id, full_name, email, company, role_title, phone, profile_complete, created_at
          FROM users ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}
        `;
        [totalRow] = await sql`SELECT COUNT(*) AS count FROM users`;
      }

      return res.status(200).json({ rows, total: parseInt(totalRow.count) });
    }

    // ── Single user profile ────────────────────────────────────────────────────
    if (action === "userProfile") {
      const { id } = body;
      const rows = await sql`
        SELECT id, full_name, email, username, company, role_title, website, phone, profile_complete, created_at
        FROM users WHERE id = ${id} LIMIT 1
      `;
      if (!rows.length) return res.status(200).json({ user: null });
      return res.status(200).json({ user: rows[0] });
    }

    // ── Campaigns list ─────────────────────────────────────────────────────────
    if (action === "campaigns") {
      const page = parseInt(body.page || 1);
      const limit = 20;
      const offset = (page - 1) * limit;

      const rows = await sql`
        SELECT
          c.id,
          c.user_id,
          c.category,
          c.status,
          c.sent_count,
          c.failed_count,
          c.cancelled,
          c.created_at,
          u.email AS user_email,
          u.full_name AS user_name,
          COALESCE(
            (SELECT COUNT(*) FROM email_logs el WHERE el.campaign_id = c.id AND el.replied = true),
            0
          ) AS reply_count
        FROM campaigns c
        LEFT JOIN users u ON u.id::text = c.user_id OR u.email = c.user_id
        ORDER BY c.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      const [totalRow] = await sql`SELECT COUNT(*) AS count FROM campaigns`;
      return res.status(200).json({ rows, total: parseInt(totalRow.count) });
    }

    // ── Set campaign status ────────────────────────────────────────────────────
    if (action === "setCampaignStatus") {
      const { id, status } = body;
      if (status === "cancelled") {
        await sql`UPDATE campaigns SET cancelled = true, status = 'cancelled' WHERE id = ${id}`;
      } else {
        await sql`UPDATE campaigns SET status = ${status} WHERE id = ${id}`;
      }
      return res.status(200).json({ ok: true });
    }

    // ── Email logs ─────────────────────────────────────────────────────────────
    if (action === "emailLogs") {
      const page = parseInt(body.page || 1);
      const limit = 25;
      const offset = (page - 1) * limit;
      const { campaignId, dateFrom, dateTo } = body;

      let rows, totalRow;

      if (campaignId && dateFrom && dateTo) {
        rows = await sql`
          SELECT id, campaign_id, to_email, sent_at, opened, replied, bounced
          FROM email_logs
          WHERE campaign_id = ${parseInt(campaignId)}
            AND sent_at >= ${dateFrom}::timestamptz
            AND sent_at <= ${dateTo}::timestamptz
          ORDER BY sent_at DESC LIMIT ${limit} OFFSET ${offset}
        `;
        [totalRow] = await sql`
          SELECT COUNT(*) AS count FROM email_logs
          WHERE campaign_id = ${parseInt(campaignId)}
            AND sent_at >= ${dateFrom}::timestamptz
            AND sent_at <= ${dateTo}::timestamptz
        `;
      } else if (campaignId) {
        rows = await sql`
          SELECT id, campaign_id, to_email, sent_at, opened, replied, bounced
          FROM email_logs WHERE campaign_id = ${parseInt(campaignId)}
          ORDER BY sent_at DESC LIMIT ${limit} OFFSET ${offset}
        `;
        [totalRow] = await sql`SELECT COUNT(*) AS count FROM email_logs WHERE campaign_id = ${parseInt(campaignId)}`;
      } else if (dateFrom && dateTo) {
        rows = await sql`
          SELECT id, campaign_id, to_email, sent_at, opened, replied, bounced
          FROM email_logs
          WHERE sent_at >= ${dateFrom}::timestamptz AND sent_at <= ${dateTo}::timestamptz
          ORDER BY sent_at DESC LIMIT ${limit} OFFSET ${offset}
        `;
        [totalRow] = await sql`
          SELECT COUNT(*) AS count FROM email_logs
          WHERE sent_at >= ${dateFrom}::timestamptz AND sent_at <= ${dateTo}::timestamptz
        `;
      } else {
        rows = await sql`
          SELECT id, campaign_id, to_email, sent_at, opened, replied, bounced
          FROM email_logs ORDER BY sent_at DESC LIMIT ${limit} OFFSET ${offset}
        `;
        [totalRow] = await sql`SELECT COUNT(*) AS count FROM email_logs`;
      }

      return res.status(200).json({ rows, total: parseInt(totalRow.count) });
    }

    // ── Payments ───────────────────────────────────────────────────────────────
    if (action === "payments") {
      const page = parseInt(body.page || 1);
      const limit = 20;
      const offset = (page - 1) * limit;

      const rows = await sql`
        SELECT p.id, p.user_id, p.amount, p.plan, p.razorpay_id, p.paid_at,
               u.email AS user_email, u.full_name AS user_name
        FROM payments p
        LEFT JOIN users u ON u.id = p.user_id
        ORDER BY p.paid_at DESC LIMIT ${limit} OFFSET ${offset}
      `;
      const [totalRow] = await sql`SELECT COUNT(*) AS count FROM payments`;
      const [monthRow] = await sql`
        SELECT COALESCE(SUM(amount), 0) AS total FROM payments
        WHERE DATE_TRUNC('month', paid_at) = DATE_TRUNC('month', NOW())
      `;

      return res.status(200).json({
        rows,
        total: parseInt(totalRow.count),
        monthRevenue: parseFloat(monthRow.total),
      });
    }

    // ── Change admin password ──────────────────────────────────────────────────
    if (action === "changePassword") {
      const { adminId, currentPassword, newPassword } = body;
      const check = await sql`SELECT id FROM admin WHERE id = ${adminId} AND password = ${currentPassword}`;
      if (!check.length) return res.status(200).json({ ok: false, error: "Current password is incorrect" });
      await sql`UPDATE admin SET password = ${newPassword} WHERE id = ${adminId}`;
      return res.status(200).json({ ok: true });
    }

    // ── Set banner ─────────────────────────────────────────────────────────────
    if (action === "setBanner") {
      const { adminId, message } = body;
      await sql`UPDATE admin SET banner = ${message} WHERE id = ${adminId}`;
      return res.status(200).json({ ok: true });
    }

    // ── Get banner ─────────────────────────────────────────────────────────────
    if (action === "getBanner") {
      const { adminId } = body;
      const rows = await sql`SELECT banner FROM admin WHERE id = ${adminId} LIMIT 1`;
      return res.status(200).json({ banner: rows[0]?.banner || "" });
    }

    return res.status(400).json({ error: "Unknown action: " + action });
  } catch (err) {
    console.error("admin api error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
