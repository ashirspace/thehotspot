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

  const { contacts, campaignId, step = 1 } = req.body;

  if (!contacts || contacts.length === 0) {
    return res.status(200).json({ success: true, created: 0 });
  }

  // Days until next follow-up step
  const stepDays = { 1: 3, 2: 7, 3: 14 };
  const nextSendAt = new Date(Date.now() + (stepDays[step] || 3) * 24 * 60 * 60 * 1000).toISOString();

  const records = contacts.map(c => ({
    fields: {
      ContactEmail: c.email || "",
      Company: c.company || "",
      CampaignId: campaignId || "",
      ThreadId: c.threadId || "",
      Step: step,
      SentAt: c.sentAt || new Date().toISOString(),
      NextSendAt: nextSendAt,
      Status: "active",
    },
  }));

  let created = 0;
  for (let i = 0; i < records.length; i += 10) {
    try {
      await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Sequences`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ records: records.slice(i, i + 10) }),
      });
      created += Math.min(10, records.length - i);
    } catch { /* non-critical, don't fail the request */ }
  }

  return res.status(200).json({ success: true, created });
}
