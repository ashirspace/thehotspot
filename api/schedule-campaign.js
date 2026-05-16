import { getDb } from "./_db.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { userId, scheduledFor, category, offerContext, maxChars } = req.body;
  if (!scheduledFor) return res.status(400).json({ error: "scheduledFor required" });

  try {
    const sql = getDb();
    const rows = await sql`
      INSERT INTO scheduled_campaigns (user_id, scheduled_for, category, offer_context, max_chars, status)
      VALUES (${userId || null}, ${scheduledFor}, ${category || "all"}, ${offerContext || ""}, ${maxChars || 400}, 'pending')
      RETURNING id
    `;
    return res.status(200).json({ success: true, recordId: rows[0].id });
  } catch (err) {
    return res.status(200).json({ success: false, error: err.message });
  }
}
