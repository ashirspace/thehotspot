import { randomBytes, createHash } from "node:crypto";
import { z } from "zod";
import {
  createSession, db, ensureDefaultWorkspace, getBearerToken, handle,
  hashOtp, hashPassword, hashSessionToken, json, methodNotAllowed,
  normalizeEmail, publicBaseUrl, readJson, requireUser, sendTransactionalEmail,
  verifyPassword, verifyTurnstile, workspaceForUser,
} from "./_shared";

// ── helpers ───────────────────────────────────────────────────────────────────

function buildState(): string {
  const rand = randomBytes(16).toString("base64url");
  const mac = createHash("sha256")
    .update(rand + (process.env.GOOGLE_CLIENT_SECRET ?? ""))
    .digest("hex")
    .slice(0, 16);
  return `${rand}.${mac}`;
}

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

// ── schemas ───────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(200),
  turnstileToken: z.string().optional(),
});

const signupSchema = z.object({
  fullName: z.string().trim().min(1).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(200),
  workspaceName: z.string().trim().min(1).max(80).optional(),
  turnstileToken: z.string().optional(),
});

const otpSendSchema = z.object({
  email: z.string().email(),
  turnstileToken: z.string().optional(),
});

const otpVerifySchema = z.object({
  email: z.string().email(),
  otp: z.string().regex(/^\d{6}$/, "OTP must be 6 digits"),
});

const bootstrapSchema = z.object({
  workspaceName: z.string().trim().min(1).max(80).optional(),
  fullName: z.string().trim().max(120).optional(),
});

// ── router ────────────────────────────────────────────────────────────────────

export default handle(async function handler(request: Request) {
  const url = new URL(request.url);
  const action = url.searchParams.get("action");
  const base = publicBaseUrl(request);

  // POST /api/auth?action=login
  if (action === "login") {
    if (request.method !== "POST") return methodNotAllowed();
    const input = await readJson(request, loginSchema);
    if (input.turnstileToken) {
      const ip = request.headers.get("cf-connecting-ip") ?? undefined;
      if (!await verifyTurnstile(input.turnstileToken, ip))
        return json({ error: "Human verification failed." }, { status: 403 });
    }
    const email = normalizeEmail(input.email);
    const [user] = await db()`
      select id, email::text as email, coalesce(full_name, email::text) as name, password_hash
      from users where email = ${email} limit 1
    `;
    const isValid = await verifyPassword(input.password, user?.password_hash ? String(user.password_hash) : null);
    if (!user || !isValid) return json({ error: "Invalid email or password." }, { status: 401 });
    const workspace = await ensureDefaultWorkspace(String(user.id), String(user.email), String(user.name));
    const session = await createSession(String(user.id));
    return json({
      token: session.token,
      user: { id: user.id, email: user.email, name: user.name },
      workspace: { id: workspace.membership.id, name: workspace.membership.name, plan: workspace.membership.plan, physical_address: workspace.membership.physical_address, owner_id: workspace.membership.owner_id },
      role: workspace.membership.role,
    });
  }

  // POST /api/auth?action=signup
  if (action === "signup") {
    if (request.method !== "POST") return methodNotAllowed();
    const input = await readJson(request, signupSchema);
    if (input.turnstileToken) {
      const ip = request.headers.get("cf-connecting-ip") ?? undefined;
      if (!await verifyTurnstile(input.turnstileToken, ip))
        return json({ error: "Human verification failed." }, { status: 403 });
    }
    const email = normalizeEmail(input.email);
    const passwordHash = await hashPassword(input.password);
    const [user] = await db()`
      insert into users (email, full_name, password_hash)
      values (${email}, ${input.fullName}, ${passwordHash})
      on conflict (email) do nothing
      returning id, email::text as email, coalesce(full_name, email::text) as name
    `;
    if (!user) return json({ error: "An account already exists for this email." }, { status: 409 });
    const workspace = await ensureDefaultWorkspace(String(user.id), email, input.fullName, input.workspaceName);
    const session = await createSession(String(user.id));
    return json({
      token: session.token, user,
      workspace: { id: workspace.membership.id, name: workspace.membership.name, plan: workspace.membership.plan, physical_address: workspace.membership.physical_address, owner_id: workspace.membership.owner_id },
      role: workspace.membership.role,
    }, { status: 201 });
  }

  // POST /api/auth?action=logout
  if (action === "logout") {
    if (request.method !== "POST") return methodNotAllowed();
    const token = getBearerToken(request);
    if (token) await db()`delete from sessions where token_hash = ${hashSessionToken(token)}`;
    return json({ ok: true });
  }

  // GET /api/auth?action=session
  if (action === "session") {
    if (request.method !== "GET") return methodNotAllowed();
    const authed = await requireUser(request);
    if ("error" in authed) return authed.error;
    const workspace = await workspaceForUser(authed.user.id, request.headers.get("x-workspace-id"));
    if (!workspace) return json({ error: "Workspace membership required" }, { status: 403 });
    return json({
      user: authed.user,
      workspace: { id: workspace.id, name: workspace.name, plan: workspace.plan, physical_address: workspace.physical_address, owner_id: workspace.owner_id },
      role: workspace.role,
    });
  }

  // POST /api/auth?action=bootstrap
  if (action === "bootstrap") {
    if (request.method !== "POST") return methodNotAllowed();
    const authed = await requireUser(request);
    if ("error" in authed) return authed.error;
    const input = await readJson(request, bootstrapSchema);
    const result = await ensureDefaultWorkspace(authed.user.id, authed.user.email, input.fullName || authed.user.name, input.workspaceName);
    return json({
      workspace: { id: result.membership.id, name: result.membership.name, plan: result.membership.plan, physical_address: result.membership.physical_address, owner_id: result.membership.owner_id },
      role: result.membership.role,
      created: result.created,
    }, { status: result.created ? 201 : 200 });
  }

  // POST /api/auth?action=otp-send
  if (action === "otp-send") {
    if (request.method !== "POST") return methodNotAllowed();
    const input = await readJson(request, otpSendSchema);
    if (input.turnstileToken) {
      const ip = request.headers.get("cf-connecting-ip") ?? undefined;
      if (!await verifyTurnstile(input.turnstileToken, ip))
        return json({ error: "Human verification failed." }, { status: 403 });
    }
    const email = normalizeEmail(input.email);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const tokenHash = hashOtp(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    await db()`
      insert into otp_tokens (email, token_hash, expires_at, used_at)
      values (${email}, ${tokenHash}, ${expiresAt}, null)
      on conflict (email) do update set
        token_hash = excluded.token_hash, expires_at = excluded.expires_at,
        used_at = null, created_at = now()
    `;
    await sendTransactionalEmail({
      to: email,
      subject: "Your thehotspot sign-in code",
      html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px"><p style="margin:0 0 16px;color:#374151">Your one-time sign-in code is:</p><div style="font-size:2.25rem;letter-spacing:0.3em;font-family:monospace;font-weight:700;color:#0f172a;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px 24px;display:inline-block">${otp}</div><p style="margin:16px 0 0;font-size:0.875rem;color:#6b7280">This code expires in 10 minutes. Do not share it with anyone.</p></div>`,
    });
    return json({ ok: true });
  }

  // POST /api/auth?action=otp-verify
  if (action === "otp-verify") {
    if (request.method !== "POST") return methodNotAllowed();
    const input = await readJson(request, otpVerifySchema);
    const email = normalizeEmail(input.email);
    const tokenHash = hashOtp(input.otp);
    const [otpRow] = await db()`
      select email from otp_tokens
      where email = ${email} and token_hash = ${tokenHash}
        and expires_at > now() and used_at is null
      limit 1
    `;
    if (!otpRow) return json({ error: "Invalid or expired code." }, { status: 401 });
    await db()`update otp_tokens set used_at = now() where email = ${email}`;
    const [user] = await db()`
      insert into users (email, email_verified_at) values (${email}, now())
      on conflict (email) do update set email_verified_at = coalesce(users.email_verified_at, now())
      returning id, email::text as email, coalesce(full_name, email::text) as name
    `;
    const workspace = await ensureDefaultWorkspace(String(user.id), email, String(user.name));
    const session = await createSession(String(user.id));
    return json({
      token: session.token,
      user: { id: user.id, email: user.email, name: user.name },
      workspace: { id: workspace.membership.id, name: workspace.membership.name, plan: workspace.membership.plan, physical_address: workspace.membership.physical_address, owner_id: workspace.membership.owner_id },
      role: workspace.membership.role,
    });
  }

  // GET /api/auth?action=google  — redirect to Google consent screen
  // NOTE: update authorized redirect URIs in Google Cloud Console to:
  //   https://your-domain.com/api/auth?action=google-callback
  if (action === "google") {
    if (request.method !== "GET") return methodNotAllowed();
    const redirectUri = `${base}/api/auth?action=google-callback`;
    const state = buildState();
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      state,
      access_type: "offline",
      prompt: "select_account",
    });
    return Response.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`, 302);
  }

  // GET /api/auth?action=google-callback  — OAuth code exchange
  if (action === "google-callback") {
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");
    if (error || !code || !state) return Response.redirect(`${base}/login?error=google_denied`, 302);
    if (!verifyState(state)) return Response.redirect(`${base}/login?error=invalid_state`, 302);
    const redirectUri = `${base}/api/auth?action=google-callback`;
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ code, client_id: process.env.GOOGLE_CLIENT_ID ?? "", client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "", redirect_uri: redirectUri, grant_type: "authorization_code" }),
    });
    if (!tokenRes.ok) return Response.redirect(`${base}/login?error=google_token_exchange`, 302);
    const tokenData = await tokenRes.json();
    const idPayload = decodeJwtPayload(String(tokenData.id_token));
    const googleId = String(idPayload.sub ?? "");
    const googleEmail = String(idPayload.email ?? "");
    const googleName = String(idPayload.name ?? "");
    if (!Boolean(idPayload.email_verified) || !googleEmail)
      return Response.redirect(`${base}/login?error=google_unverified`, 302);
    const email = normalizeEmail(googleEmail);
    const [user] = await db()`
      insert into users (email, full_name, google_id, email_verified_at)
      values (${email}, ${googleName}, ${googleId}, now())
      on conflict (email) do update set
        google_id = coalesce(users.google_id, excluded.google_id),
        email_verified_at = coalesce(users.email_verified_at, now()),
        full_name = coalesce(users.full_name, excluded.full_name)
      returning id, email::text as email, coalesce(full_name, email::text) as name
    `;
    const workspace = await ensureDefaultWorkspace(String(user.id), email, String(user.name));
    const session = await createSession(String(user.id));
    const redirectParams = new URLSearchParams({ token: session.token, uid: String(user.id), wid: workspace.membership.workspace_id });
    return Response.redirect(`${base}/login?${redirectParams}`, 302);
  }

  return json({ error: "Unknown auth action. Use ?action=login|signup|logout|session|otp-send|otp-verify|bootstrap|google|google-callback" }, { status: 400 });
});
