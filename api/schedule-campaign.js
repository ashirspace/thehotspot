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

  const { userId, scheduledFor, category, offerContext, maxChars } = req.body;

  if (!scheduledFor) return res.status(400).json({ error: "scheduledFor required" });

  try {
    const r = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/ScheduledCampaigns`, {
      method: "POST",
      headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        records: [{
          fields: {
            UserId: userId || "unknown",
            ScheduledAt: scheduledFor,
            Category: category || "all",
            OfferContext: offerContext || "",
            MaxChars: maxChars || 400,
            Status: "pending",
            CreatedAt: new Date().toISOString(),
          },
        }],
      }),
    });
    const data = await r.json();
    if (data.error) throw new Error(data.error.message);
    return res.status(200).json({ success: true, recordId: data.records?.[0]?.id });
  } catch (err) {
    return res.status(200).json({ success: false, error: err.message });
  }
}
