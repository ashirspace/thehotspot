import { randomBytes, scrypt as scryptCallback, timingSafeEqual, createHash } from "node:crypto";
import { promisify } from "node:util";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { z } from "zod";

const scrypt = promisify(scryptCallback);

export type WorkspaceRole = "owner" | "admin" | "member";
export type WorkspacePlan = "starter" | "growth" | "scale";

export type AuthedUser = {
  token: string;
  tokenHash: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
};

export type AuthedWorkspace = AuthedUser & {
  workspaceId: string;
  role: WorkspaceRole;
  workspace: {
    id: string;
    name: string;
    plan: WorkspacePlan;
    physical_address: string | null;
    owner_id: string;
  };
};

type WorkspaceMembershipRow = {
  workspace_id: string;
  role: WorkspaceRole;
  id: string;
  name: string;
  plan: WorkspacePlan;
  physical_address: string | null;
  owner_id: string;
};

let client: NeonQueryFunction<false, false> | null = null;

export function db() {
  if (!client) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new Error("DATABASE_URL is not configured");
    client = neon(connectionString);
  }
  return client;
}

export function json(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers || {}),
    },
  });
}

export function methodNotAllowed() {
  return json({ error: "Method not allowed" }, { status: 405 });
}

export async function readJson<T>(request: Request, schema: z.ZodType<T>) {
  const body = await request.json().catch(() => null);
  return schema.parse(body);
}

type NodeHeaderValue = string | string[] | undefined;
type NodeRequest = {
  method?: string;
  url?: string;
  headers?: Record<string, NodeHeaderValue>;
  body?: unknown;
  [Symbol.asyncIterator]?: () => AsyncIterator<Uint8Array | string>;
};

type NodeResponse = {
  statusCode?: number;
  setHeader: (name: string, value: string | string[]) => void;
  end: (body?: string) => void;
};

type ApiHandler = {
  (request: Request): Promise<Response>;
  (request: NodeRequest, response: NodeResponse): Promise<void>;
};

function isFetchRequest(value: unknown): value is Request {
  return typeof Request !== "undefined" && value instanceof Request;
}

function getHeader(headers: Record<string, NodeHeaderValue> | undefined, name: string) {
  const value = headers?.[name] ?? headers?.[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : value;
}

function normalizeHeaders(headers: Record<string, NodeHeaderValue> | undefined) {
  const normalized = new Headers();
  for (const [name, value] of Object.entries(headers ?? {})) {
    if (Array.isArray(value)) {
      for (const item of value) normalized.append(name, item);
    } else if (value !== undefined) {
      normalized.set(name, value);
    }
  }
  return normalized;
}

async function readNodeBody(request: NodeRequest, method: string) {
  if (method === "GET" || method === "HEAD") return undefined;
  if (request.body !== undefined) {
    if (typeof request.body === "string" || request.body instanceof URLSearchParams) {
      return request.body;
    }
    if (request.body instanceof Uint8Array) return new TextDecoder().decode(request.body);
    return JSON.stringify(request.body);
  }

  if (typeof request[Symbol.asyncIterator] !== "function") return undefined;
  const chunks: Uint8Array[] = [];
  for await (const chunk of request as AsyncIterable<Uint8Array | string>) {
    chunks.push(typeof chunk === "string" ? new TextEncoder().encode(chunk) : chunk);
  }
  if (chunks.length === 0) return undefined;
  return Buffer.concat(chunks).toString("utf8");
}

async function toFetchRequest(request: NodeRequest) {
  const headers = normalizeHeaders(request.headers);
  const protocol = getHeader(request.headers, "x-forwarded-proto") || "https";
  const host = getHeader(request.headers, "x-forwarded-host") || getHeader(request.headers, "host") || process.env.VERCEL_URL || "localhost";
  const rawUrl = request.url || "/";
  const url = rawUrl.startsWith("http://") || rawUrl.startsWith("https://")
    ? rawUrl
    : `${protocol}://${host}${rawUrl.startsWith("/") ? "" : "/"}${rawUrl}`;
  const method = request.method || "GET";
  const body = await readNodeBody(request, method);

  return new Request(url, { method, headers, body });
}

async function sendNodeResponse(response: Response, nodeResponse: NodeResponse) {
  nodeResponse.statusCode = response.status;
  response.headers.forEach((value, name) => {
    nodeResponse.setHeader(name, value);
  });
  nodeResponse.end(await response.text());
}

export function handle(handler: (request: Request) => Promise<Response>): ApiHandler {
  const run = async (request: Request) => {
    try {
      return await handler(request);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return json({ error: "Invalid request", issues: error.issues }, { status: 400 });
      }
      const message = error instanceof Error ? error.message : "Unexpected server error";
      return json({ error: message }, { status: 500 });
    }
  };

  return (async (request: Request | NodeRequest, response?: NodeResponse) => {
    const fetchRequest = isFetchRequest(request) ? request : await toFetchRequest(request);
    const fetchResponse = await run(fetchRequest);
    if (response) {
      await sendNodeResponse(fetchResponse, response);
      return;
    }
    return fetchResponse;
  }) as ApiHandler;
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function getPagination(request: Request) {
  const url = new URL(request.url);
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || "50"), 1), 100);
  const page = Math.max(Number(url.searchParams.get("page") || "1"), 1);
  return { limit, offset: (page - 1) * limit };
}

export function publicBaseUrl(request: Request) {
  return process.env.APP_BASE_URL || new URL(request.url).origin;
}

export function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization") || "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1] || null;
}

export function generateSessionToken() {
  return randomBytes(32).toString("base64url");
}

export function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("base64url");
  const hash = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt$${salt}$${hash.toString("base64url")}`;
}

export async function verifyPassword(password: string, storedHash: string | null) {
  if (!storedHash) return false;
  const [scheme, salt, encoded] = storedHash.split("$");
  if (scheme !== "scrypt" || !salt || !encoded) return false;
  const expected = Buffer.from(encoded, "base64url");
  const actual = (await scrypt(password, salt, expected.length)) as Buffer;
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function createSession(userId: string) {
  const token = generateSessionToken();
  const tokenHash = hashSessionToken(token);
  const [session] = await db()`
    insert into sessions (user_id, token_hash, expires_at)
    values (${userId}, ${tokenHash}, now() + interval '30 days')
    returning id, expires_at
  `;
  return { token, session };
}

export async function requireUser(request: Request): Promise<AuthedUser | { error: Response }> {
  const token = getBearerToken(request);
  if (!token) return { error: json({ error: "Bearer token required" }, { status: 401 }) };

  const tokenHash = hashSessionToken(token);
  const [row] = await db()`
    select
      users.id,
      users.email::text as email,
      coalesce(users.full_name, users.email::text) as name
    from sessions
    join users on users.id = sessions.user_id
    where sessions.token_hash = ${tokenHash}
      and sessions.expires_at > now()
    limit 1
  `;

  if (!row) return { error: json({ error: "Invalid or expired session" }, { status: 401 }) };

  await db()`
    update sessions
    set last_seen_at = now()
    where token_hash = ${tokenHash}
  `;

  return {
    token,
    tokenHash,
    user: {
      id: String(row.id),
      email: String(row.email),
      name: String(row.name),
    },
  };
}

export async function requireWorkspace(request: Request): Promise<AuthedWorkspace | { error: Response }> {
  const authed = await requireUser(request);
  if ("error" in authed) return { error: authed.error };

  const url = new URL(request.url);
  const requestedWorkspaceId = request.headers.get("x-workspace-id") || url.searchParams.get("workspaceId");
  const rows = requestedWorkspaceId
    ? await db()`
        select
          members.workspace_id,
          members.role,
          workspaces.id,
          workspaces.name,
          workspaces.plan,
          workspaces.physical_address,
          workspaces.owner_id
        from members
        join workspaces on workspaces.id = members.workspace_id
        where members.user_id = ${authed.user.id}
          and members.workspace_id = ${requestedWorkspaceId}
        limit 1
      `
    : await db()`
        select
          members.workspace_id,
          members.role,
          workspaces.id,
          workspaces.name,
          workspaces.plan,
          workspaces.physical_address,
          workspaces.owner_id
        from members
        join workspaces on workspaces.id = members.workspace_id
        where members.user_id = ${authed.user.id}
        order by members.created_at asc
        limit 1
      `;

  const membership = rows[0] as WorkspaceMembershipRow | undefined;
  if (!membership) return { error: json({ error: "Workspace membership required" }, { status: 403 }) };

  return {
    ...authed,
    workspaceId: membership.workspace_id,
    role: membership.role,
    workspace: {
      id: membership.id,
      name: membership.name,
      plan: membership.plan,
      physical_address: membership.physical_address,
      owner_id: membership.owner_id,
    },
  };
}

export function requireRole(context: AuthedWorkspace, roles: WorkspaceRole[]) {
  if (!roles.includes(context.role)) {
    return json({ error: "Insufficient workspace role" }, { status: 403 });
  }
  return null;
}

export function requireAdmin(context: AuthedUser) {
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (adminEmails.length === 0 || !adminEmails.includes(context.user.email.toLowerCase())) {
    return json({ error: "Admin access required." }, { status: 403 });
  }
  return null;
}

export async function checkSuppression(workspaceId: string, email: string) {
  const [row] = await db()`
    select reason
    from suppression_list
    where workspace_id = ${workspaceId}
      and email = ${normalizeEmail(email)}
    limit 1
  `;
  return row as { reason: string } | undefined;
}

export async function workspaceForUser(userId: string, requestedWorkspaceId?: string | null) {
  const rows = requestedWorkspaceId
    ? await db()`
        select
          members.workspace_id,
          members.role,
          workspaces.id,
          workspaces.name,
          workspaces.plan,
          workspaces.physical_address,
          workspaces.owner_id
        from members
        join workspaces on workspaces.id = members.workspace_id
        where members.user_id = ${userId}
          and members.workspace_id = ${requestedWorkspaceId}
        limit 1
      `
    : await db()`
        select
          members.workspace_id,
          members.role,
          workspaces.id,
          workspaces.name,
          workspaces.plan,
          workspaces.physical_address,
          workspaces.owner_id
        from members
        join workspaces on workspaces.id = members.workspace_id
        where members.user_id = ${userId}
        order by members.created_at asc
        limit 1
      `;
  return rows[0] as WorkspaceMembershipRow | undefined;
}

export function hashOtp(otp: string): string {
  return createHash("sha256").update(otp).digest("hex");
}

export async function sendTransactionalEmail(opts: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}): Promise<void> {
  const from = opts.from ?? "thehotspot <noreply@thehotspot.in>";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${process.env.ESP_API_KEY}`,
    },
    body: JSON.stringify({ from, to: [opts.to], subject: opts.subject, html: opts.html }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "unknown");
    throw new Error(`Email send failed: ${res.status} ${text}`);
  }
}

export async function verifyTurnstile(token: string, ip?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  const form = new URLSearchParams({ secret, response: token });
  if (ip) form.set("remoteip", ip);
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v1/siteverify", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: form,
  });
  const data = await res.json().catch(() => ({ success: false }));
  return Boolean(data.success);
}

export async function ensureDefaultWorkspace(userId: string, email: string, fullName?: string | null, workspaceName?: string | null) {
  const existing = await workspaceForUser(userId);
  if (existing) return { membership: existing, created: false };

  const name = workspaceName?.trim() || `${fullName || email.split("@")[0] || "My"} workspace`;
  const [created] = await db()`
    with workspace_insert as (
      insert into workspaces (name, owner_id, plan)
      values (${name}, ${userId}, 'starter')
      returning id, name, plan, physical_address, owner_id
    ),
    member_insert as (
      insert into members (workspace_id, user_id, role)
      select id, ${userId}, 'owner'
      from workspace_insert
      returning workspace_id, role
    ),
    settings_insert as (
      insert into workspace_settings (workspace_id)
      select id
      from workspace_insert
      on conflict (workspace_id) do nothing
    ),
    template_insert as (
      insert into templates (workspace_id, name, channel, subject, body, variables)
      select id, 'Founder intro', 'email', 'Quick idea for {{company}}',
        'Hi {{first_name}}, saw {{ai: summarize the strongest company signal in one sentence}}. We help teams turn that context into safe outbound sequences that stop the moment someone replies.',
        '["first_name","company","ai"]'::jsonb
      from workspace_insert
      union all
      select id, 'Low-pressure follow-up', 'email', 'Worth a quick look?',
        'Hi {{first_name}}, wanted to follow up. If outbound quality or sender health is on your radar, I can send a short teardown for {{company}}.',
        '["first_name","company"]'::jsonb
      from workspace_insert
      union all
      select id, 'Assisted LinkedIn DM', 'linkedin', null,
        'Hi {{first_name}}, quick note after seeing your work at {{company}}. I had an idea for improving outbound reply quality without adding more reps. Open to me sending it over?',
        '["first_name","company"]'::jsonb
      from workspace_insert
    )
    select
      member_insert.workspace_id,
      member_insert.role,
      workspace_insert.id,
      workspace_insert.name,
      workspace_insert.plan,
      workspace_insert.physical_address,
      workspace_insert.owner_id
    from workspace_insert
    join member_insert on member_insert.workspace_id = workspace_insert.id
  `;

  return { membership: created as WorkspaceMembershipRow, created: true };
}
