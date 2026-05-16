export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const AIRTABLE_API_KEY = process.env.VITE_AIRTABLE_API_KEY;
  const AIRTABLE_BASE_ID = process.env.VITE_AIRTABLE_BASE_ID;

  // ── GET: list campaigns ────────────────────────────────────────────────────
  if (req.method === "GET") {
    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      return res.status(200).json({ campaigns: [], configured: false });
    }

    const { userId, limit = 50 } = req.query;

    try {
      const params = new URLSearchParams({
        sort: JSON.stringify([{ field: "Date", direction: "desc" }]),
        maxRecords: String(limit),
      });
      if (userId) params.set("filterByFormula", `{UserId}="${userId}"`);

      const r = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Campaigns?${params}`, {
        headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
      });
      const data = await r.json();
      if (data.error) throw new Error(data.error.message);

      const campaigns = (data.records || []).map(rec => ({
        id: rec.id,
        date: rec.fields.Date,
        userId: rec.fields.UserId,
        category: rec.fields.Category,
        offerContext: rec.fields.OfferContext,
        sent: rec.fields.SentCount || 0,
        failed: rec.fields.FailedCount || 0,
        cancelled: rec.fields.Cancelled || false,
        status: rec.fields.Status,
      }));

      const withContacts = await Promise.all(campaigns.slice(0, 20).map(async (c) => {
        try {
          const emailParams = new URLSearchParams({
            filterByFormula: `{CampaignId}="${c.id}"`,
            maxRecords: "100",
          });
          const er = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/CampaignEmails?${emailParams}`, {
            headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
          });
          const ed = await er.json();
          const contacts = (ed.records || []).map(r => ({
            email: r.fields.ContactEmail,
            company: r.fields.Company,
            subject: r.fields.Subject,
            body: r.fields.Body,
            threadId: r.fields.ThreadId,
            sentAt: r.fields.SentAt,
          }));
          return { ...c, contacts };
        } catch {
          return { ...c, contacts: [] };
        }
      }));

      return res.status(200).json({ campaigns: withContacts, configured: true });
    } catch (err) {
      return res.status(200).json({ campaigns: [], configured: true, error: err.message });
    }
  }

  // ── POST: create campaign ──────────────────────────────────────────────────
  if (req.method === "POST") {
    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      return res.status(200).json({ success: false, reason: "Airtable not configured" });
    }

    const { userId, category, offerContext, sent, failed, cancelled, contacts, date } = req.body;

    try {
      const campaignRes = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Campaigns`, {
        method: "POST",
        headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          records: [{
            fields: {
              UserId: userId || "unknown",
              Date: date || new Date().toISOString(),
              Category: category || "all",
              OfferContext: offerContext || "",
              SentCount: sent || 0,
              FailedCount: failed || 0,
              Cancelled: cancelled || false,
              Status: cancelled ? "cancelled" : "completed",
            },
          }],
        }),
      });

      const campaignData = await campaignRes.json();
      if (campaignData.error) throw new Error(campaignData.error.message);
      const campaignId = campaignData.records?.[0]?.id;

      if (campaignId && contacts && contacts.length > 0) {
        const chunks = [];
        for (let i = 0; i < contacts.length; i += 10) chunks.push(contacts.slice(i, i + 10));

        for (const chunk of chunks) {
          await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/CampaignEmails`, {
            method: "POST",
            headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              records: chunk.map(c => ({
                fields: {
                  CampaignId: campaignId,
                  ContactEmail: c.email || "",
                  Company: c.company || "",
                  Subject: c.subject || "",
                  Body: c.body || "",
                  ThreadId: c.threadId || "",
                  SentAt: c.sentAt || new Date().toISOString(),
                  Status: "sent",
                },
              })),
            }),
          });
        }
      }

      return res.status(200).json({ success: true, campaignId });
    } catch (err) {
      return res.status(200).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
