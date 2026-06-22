import { getSql } from "@/lib/db";

type GoogleTokens = { accessToken: string | null; refreshToken: string | null; expiresAt: Date | string | null };

export async function getValidGoogleAccessToken(userId: string, tokens: GoogleTokens) {
  const expiresAt = tokens.expiresAt ? new Date(tokens.expiresAt).getTime() : 0;
  if (tokens.accessToken && expiresAt > Date.now() + 60_000) return tokens.accessToken;
  if (!tokens.refreshToken || !process.env.AUTH_GOOGLE_ID || !process.env.AUTH_GOOGLE_SECRET) throw new Error("Google authorization needs to be renewed");
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: process.env.AUTH_GOOGLE_ID, client_secret: process.env.AUTH_GOOGLE_SECRET, refresh_token: tokens.refreshToken, grant_type: "refresh_token" }),
  });
  if (!response.ok) throw new Error("Google token refresh failed");
  const refreshed = await response.json() as { access_token: string; expires_in: number };
  const nextExpiry = new Date(Date.now() + refreshed.expires_in * 1000);
  const sql = getSql();
  await sql`UPDATE users SET google_access_token=${refreshed.access_token}, google_token_expires_at=${nextExpiry}, updated_at=NOW() WHERE id=${userId}`;
  return refreshed.access_token;
}
