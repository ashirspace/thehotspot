export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const AIRTABLE_API_KEY = process.env.VITE_AIRTABLE_API_KEY;
  const AIRTABLE_BASE_ID = process.env.VITE_AIRTABLE_BASE_ID;

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

    // For each campaign fetch its emails
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
