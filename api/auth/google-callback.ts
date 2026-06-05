import { createHash } from "node:crypto";
import { createSession, db, ensureDefaultWorkspace, handle, normalizeEmail, publicBaseUrl } from "../_shared";

function verifyState(state: string): boolean {
  const dot = state.lastIndexOf(".");
  if (dot < 1) return false;
  const rand = state.slice(0, dot);
  const mac = state.slice(dot + 1);
  const expected = createHash("sha256")
    .update(rand + (process.env.GOOGLE_CLIENT_SECRET ?? ""))
    .digest("hex")
    .slice(0, 16);
  return expected === mac;
}

function decodeJwtPayload(token: string): Record<string, unknown> {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid JWT");
  const padded = parts[1].replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(Buffer.from(padded, "base64").toString("utf8"));
}

export default handle(async function handler(request: Request) {
  const url = new URL(request.url);
  const base = publicBaseUrl(request);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error || !code || !state) {
    return Response.redirect(`${base}/login?error=google_denied`, 302);
  }
  if (!verifyState(state)) {
    return Response.redirect(`${base}/login?error=invalid_state`, 302);
  }

  const redirectUri = `${base}/api/auth/google-callback`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!tokenRes.ok) {
    return Response.redirect(`${base}/login?error=google_token_exchange`, 302);
  }

  const tokenData = await tokenRes.json();
  const idPayload = decodeJwtPayload(String(tokenData.id_token));

  const googleId = String(idPayload.sub ?? "");
  const googleEmail = String(idPayload.email ?? "");
  const googleName = String(idPayload.name ?? "");
  const emailVerified = Boolean(idPayload.email_verified);

  if (!emailVerified || !googleEmail) {
    return Response.redirect(`${base}/login?error=google_unverified`, 302);
  }

  const email = normalizeEmail(googleEmail);

  const [user] = await db()`
    insert into users (email, full_name, google_id, email_verified_at)
    values (${email}, ${googleName}, ${googleId}, now())
    on conflict (email) do update set
      google_id         = coalesce(users.google_id, excluded.google_id),
      email_verified_at = coalesce(users.email_verified_at, now()),
      full_name         = coalesce(users.full_name, excluded.full_name)
    returning id, email::text as email, coalesce(full_name, email::text) as name
  `;

  const workspace = await ensureDefaultWorkspace(String(user.id), email, String(user.name));
  const session = await createSession(String(user.id));

  const redirectParams = new URLSearchParams({
    token: session.token,
    uid: String(user.id),
    wid: workspace.membership.workspace_id,
  });

  return Response.redirect(`${base}/login?${redirectParams}`, 302);
});
