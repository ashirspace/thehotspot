import { getDb } from "./_db.js";

const PIXEL = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");

async function logEvent(trackId, type, contactEmail, clickedUrl) {
  try {
    const sql = getDb();
    await sql`
      INSERT INTO email_events (track_id, type, contact_email, clicked_url)
      VALUES (${trackId || ""}, ${type || ""}, ${contactEmail || ""}, ${clickedUrl || null})
    `;
  } catch { /* non-critical */ }
}

export default async function handler(req, res) {
  const { type, id, e: email, url } = req.query;

  if (type === "open" || !type) {
    res.setHeader("Content-Type", "image/gif");
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.status(200).send(PIXEL);
    if (id) logEvent(id, "open", email, null);
    return;
  }

  if (type === "click") {
    const destination = url ? decodeURIComponent(url) : "https://google.com";
    res.setHeader("Location", destination);
    res.status(302).end();
    if (id) logEvent(id, "click", email, destination);
    return;
  }

  res.status(400).json({ error: "type must be open or click" });
}
