export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const AIRTABLE_API_KEY = process.env.VITE_AIRTABLE_API_KEY;
  const AIRTABLE_BASE_ID = process.env.VITE_AIRTABLE_BASE_ID;

  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    return res.status(200).json({ success: false, reason: "Airtable not configured" });
  }

  const { userId, category, offerContext, sent, failed, cancelled, contacts, date } = req.body;

  try {
    const campaignRes = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Campaigns`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
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
          headers: {
            Authorization: `Bearer ${AIRTABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
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
