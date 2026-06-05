import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { db, handle, json, methodNotAllowed, normalizeEmail, readJson, requireWorkspace } from "./_shared.js";

const addSchema = z.object({
  email: z.string().email(),
  reason: z.enum(["unsubscribed", "bounced", "complained", "manual"]).default("manual"),
});

function signUnsubscribe(value: string) {
  const secret = process.env.UNSUBSCRIBE_TOKEN_SECRET;
  if (!secret) throw new Error("UNSUBSCRIBE_TOKEN_SECRET is not configured");
  return createHmac("sha256", secret).update(value).digest("hex");
}

function verifyUnsubscribeToken(token: string) {
  const decoded = Buffer.from(token, "base64url").toString("utf8");
  const [workspaceId, email, signature] = decoded.split(".");
  if (!workspaceId || !email || !signature) return null;
  const expected = signUnsubscribe(`${workspaceId}.${email}`);
  if (signature.length !== expected.length) return null;
  const ok = timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  return ok ? { workspaceId, email } : null;
}

export default handle(async function handler(request: Request) {
  const url = new URL(request.url);

  // GET /api/suppression?token=xxx  — one-click unsubscribe (no auth required)
  const token = url.searchParams.get("token");
  if (token) {
    if (request.method !== "GET") return methodNotAllowed();
    const verified = verifyUnsubscribeToken(token);
    if (!verified) return json({ error: "Invalid unsubscribe token" }, { status: 400 });
    await db()`
      insert into suppression_list (workspace_id, email, reason, source)
      values (${verified.workspaceId}, ${normalizeEmail(verified.email)}, 'unsubscribed', 'unsubscribe_link')
      on conflict (workspace_id, email) do update set reason = excluded.reason, source = excluded.source, created_at = now()
    `;
    return new Response("You have been unsubscribed. No further outreach will be sent to this address.", {
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  // Authenticated routes
  const context = await requireWorkspace(request);
  if ("error" in context) return context.error;

  // GET /api/suppression — list
  if (request.method === "GET") {
    const suppression = await db()`
      select * from suppression_list where workspace_id = ${context.workspaceId} order by created_at desc
    `;
    return json({ suppression });
  }

  // POST /api/suppression — add
  if (request.method === "POST") {
    const input = await readJson(request, addSchema);
    const [suppression] = await db()`
      insert into suppression_list (workspace_id, email, reason, source)
      values (${context.workspaceId}, ${normalizeEmail(input.email)}, ${input.reason}, 'manual')
      on conflict (workspace_id, email) do update set reason = excluded.reason, source = excluded.source, created_at = now()
      returning *
    `;
    return json({ suppression }, { status: 201 });
  }

  return methodNotAllowed();
});
