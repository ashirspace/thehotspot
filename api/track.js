const PIXEL = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");

async function logEvent(fields) {
  const KEY = process.env.VITE_AIRTABLE_API_KEY;
  const BASE = process.env.VITE_AIRTABLE_BASE_ID;
  if (!KEY || !BASE) return;
  fetch(`https://api.airtable.com/v0/${BASE}/EmailEvents`, {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ records: [{ fields: { ...fields, Timestamp: new Date().toISOString() } }] }),
  }).catch(() => {});
}

export default async function handler(req, res) {
  const { type, id, e: email, url } = req.query;

  if (type === "open" || !type) {
    res.setHeader("Content-Type", "image/gif");
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.status(200).send(PIXEL);
    if (id) logEvent({ TrackId: id, Type: "open", ContactEmail: email || "" });
    return;
  }

  if (type === "click") {
    const destination = url ? decodeURIComponent(url) : "https://google.com";
    res.setHeader("Location", destination);
    res.status(302).end();
    if (id) logEvent({ TrackId: id, Type: "click", ContactEmail: email || "", ClickedUrl: destination });
    return;
  }

  res.status(400).json({ error: "type must be open or click" });
}
