import { getDb } from "./_db.js";

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
  const sql = getDb();
  const rows = await sql`
    SELECT gmail_refresh_token FROM users
    WHERE username = ${userId} OR email = ${userId}
    LIMIT 1
  `;
  if (!rows.length || !rows[0].gmail_refresh_token) throw new Error(`No refresh token for: ${userId}`);
  return rows[0].gmail_refresh_token;
}

async function storeRefreshToken(userId, refreshToken) {
  try {
    const sql = getDb();
    await sql`
      UPDATE users SET gmail_refresh_token = ${refreshToken}
      WHERE username = ${userId} OR email = ${userId}
    `;
  } catch { /* non-critical */ }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

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

  if (req.method === "POST") {
    const { code, userId } = req.body || {};
    const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
    if (!CLIENT_SECRET) return res.status(200).json({ error: "GOOGLE_CLIENT_SECRET not configured", backgroundEnabled: false });
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
