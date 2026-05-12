const CLIENT_ID = process.env.GMAIL_CLIENT_ID || "1033289222732-c7c1kudmf0tuh1ustp2jme38ii8kqbm5.apps.googleusercontent.com";

export async function getAccessToken(refreshToken) {
  const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
  if (!CLIENT_SECRET) throw new Error("GOOGLE_CLIENT_SECRET not configured");
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: "refresh_token",
    }),
  });
  const d = await r.json();
  if (d.error) throw new Error(d.error_description || d.error);
  return d.access_token;
}

export async function getRefreshTokenForUser(userId) {
  const KEY = process.env.VITE_AIRTABLE_API_KEY;
  const BASE = process.env.VITE_AIRTABLE_BASE_ID;
  if (!KEY || !BASE) throw new Error("Airtable not configured");
  const r = await fetch(
    `https://api.airtable.com/v0/${BASE}/Users?filterByFormula=${encodeURIComponent(`OR({Username}="${userId}",{Email}="${userId}")`)}`,
    { headers: { Authorization: `Bearer ${KEY}` } }
  );
  const d = await r.json();
  const token = d.records?.[0]?.fields?.GmailRefreshToken;
  if (!token) throw new Error(`No refresh token for: ${userId}`);
  return token;
}

async function storeRefreshToken(userId, refreshToken) {
  const KEY = process.env.VITE_AIRTABLE_API_KEY;
  const BASE = process.env.VITE_AIRTABLE_BASE_ID;
  if (!KEY || !BASE) return;
  try {
    const r = await fetch(
      `https://api.airtable.com/v0/${BASE}/Users?filterByFormula=${encodeURIComponent(`OR({Username}="${userId}",{Email}="${userId}")`)}`,
      { headers: { Authorization: `Bearer ${KEY}` } }
    );
    const d = await r.json();
    const rec = d.records?.[0];
    if (rec) {
      await fetch(`https://api.airtable.com/v0/${BASE}/Users/${rec.id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ fields: { GmailRefreshToken: refreshToken } }),
      });
    }
  } catch { /* non-critical */ }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  // GET /api/auth?userId=... → return a fresh access token for that user
  if (req.method === "GET") {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "userId required" });
    try {
      const refreshToken = await getRefreshTokenForUser(userId);
      const accessToken = await getAccessToken(refreshToken);
      return res.status(200).json({ access_token: accessToken });
    } catch (e) {
      return res.status(200).json({ error: e.message });
    }
  }

  // POST /api/auth → exchange authorization code for tokens (Gmail OAuth callback)
  if (req.method === "POST") {
    const { code, userId } = req.body || {};
    const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

    if (!CLIENT_SECRET) {
      return res.status(200).json({ error: "GOOGLE_CLIENT_SECRET not configured", backgroundEnabled: false });
    }
    if (!code) return res.status(400).json({ error: "code required" });

    try {
      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          redirect_uri: "postmessage",
          grant_type: "authorization_code",
        }),
      });
      const tokens = await tokenRes.json();
      if (tokens.error) return res.status(200).json({ error: tokens.error_description || tokens.error, backgroundEnabled: false });

      const { access_token, refresh_token } = tokens;
      if (refresh_token && userId) await storeRefreshToken(userId, refresh_token);
      return res.status(200).json({ access_token, backgroundEnabled: !!refresh_token });
    } catch (e) {
      return res.status(200).json({ error: e.message, backgroundEnabled: false });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
