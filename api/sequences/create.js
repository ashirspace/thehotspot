import { getDb } from "../_db.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { contacts, campaignId, step = 1 } = req.body;
  if (!contacts || contacts.length === 0) return res.status(200).json({ success: true, created: 0 });

  const stepDays = { 1: 3, 2: 7, 3: 14 };
  const nextSendAt = new Date(Date.now() + (stepDays[step] || 3) * 86400000).toISOString();

  let created = 0;
  try {
    const sql = getDb();
    for (const c of contacts) {
      try {
        await sql`
          INSERT INTO sequences (contact_email, company, campaign_id, thread_id, step, sent_at, next_send_at, status)
          VALUES (${c.email || ""}, ${c.company || ""}, ${campaignId || null}, ${c.threadId || ""}, ${step}, ${c.sentAt || new Date().toISOString()}, ${nextSendAt}, 'active')
        `;
        created++;
      } catch { /* skip individual failures */ }
    }
  } catch { /* non-critical */ }

  return res.status(200).json({ success: true, created });
}
