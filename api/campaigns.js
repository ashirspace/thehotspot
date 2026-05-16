import { getDb } from "./_db.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  let sql;
  try {
    sql = getDb();
  } catch {
    return res.status(503).json({ error: "Database not configured" });
  }

  // ── GET: list campaigns ────────────────────────────────────────────────────
  if (req.method === "GET") {
    const { userId, limit = 50 } = req.query;
    try {
      let rows;
      if (userId) {
        rows = await sql`
          SELECT * FROM campaigns WHERE user_id = ${userId}
          ORDER BY created_at DESC LIMIT ${parseInt(limit)}
        `;
      } else {
        rows = await sql`SELECT * FROM campaigns ORDER BY created_at DESC LIMIT ${parseInt(limit)}`;
      }

      const campaigns = await Promise.all(rows.slice(0, 20).map(async (c) => {
        try {
          const emails = await sql`SELECT * FROM campaign_emails WHERE campaign_id = ${c.id} LIMIT 100`;
          return {
            id: c.id,
            date: c.created_at,
            userId: c.user_id,
            category: c.category,
            offerContext: c.offer_context,
            sent: c.sent_count || 0,
            failed: c.failed_count || 0,
            cancelled: c.cancelled || false,
            status: c.status,
            contacts: emails.map(e => ({
              email: e.contact_email,
              company: e.company,
              subject: e.subject,
              body: e.body,
              threadId: e.thread_id,
              sentAt: e.sent_at,
            })),
          };
        } catch {
          return { ...c, contacts: [] };
        }
      }));

      return res.status(200).json({ campaigns, configured: true });
    } catch (err) {
      return res.status(200).json({ campaigns: [], configured: true, error: err.message });
    }
  }

  // ── POST: create campaign ──────────────────────────────────────────────────
  if (req.method === "POST") {
    const { userId, category, offerContext, sent, failed, cancelled, contacts, date } = req.body;
    try {
      const rows = await sql`
        INSERT INTO campaigns (user_id, category, offer_context, sent_count, failed_count, cancelled, status, created_at)
        VALUES (${userId || null}, ${category || "all"}, ${offerContext || ""}, ${sent || 0}, ${failed || 0}, ${cancelled || false}, ${cancelled ? "cancelled" : "completed"}, ${date || new Date().toISOString()})
        RETURNING id
      `;
      const campaignId = rows[0].id;

      if (campaignId && contacts && contacts.length > 0) {
        for (const c of contacts) {
          try {
            await sql`
              INSERT INTO campaign_emails (campaign_id, contact_email, company, subject, body, thread_id, sent_at)
              VALUES (${campaignId}, ${c.email || ""}, ${c.company || ""}, ${c.subject || ""}, ${c.body || ""}, ${c.threadId || ""}, ${c.sentAt || new Date().toISOString()})
            `;
          } catch { /* skip individual failures */ }
        }
      }

      return res.status(200).json({ success: true, campaignId });
    } catch (err) {
      return res.status(200).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
