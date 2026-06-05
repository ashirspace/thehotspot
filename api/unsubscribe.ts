import { createHmac, timingSafeEqual } from "node:crypto";
import { db, handle, json, methodNotAllowed, normalizeEmail } from "./_shared";

function sign(value: string) {
  const secret = process.env.UNSUBSCRIBE_TOKEN_SECRET;
  if (!secret) throw new Error("UNSUBSCRIBE_TOKEN_SECRET is not configured");
  return createHmac("sha256", secret).update(value).digest("hex");
}

function verifyToken(token: string) {
  const decoded = Buffer.from(token, "base64url").toString("utf8");
  const [workspaceId, email, signature] = decoded.split(".");
  if (!workspaceId || !email || !signature) return null;
  const expected = sign(`${workspaceId}.${email}`);
  if (signature.length !== expected.length) return null;
  const ok = timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  return ok ? { workspaceId, email } : null;
}

export default handle(async function handler(request: Request) {
  if (request.method !== "GET") return methodNotAllowed();
  const token = new URL(request.url).searchParams.get("token");
  if (!token) return json({ error: "Unsubscribe token required" }, { status: 400 });
  const verified = verifyToken(token);
  if (!verified) return json({ error: "Invalid unsubscribe token" }, { status: 400 });

  await db()`
    insert into suppression_list (workspace_id, email, reason, source)
    values (${verified.workspaceId}, ${normalizeEmail(verified.email)}, 'unsubscribed', 'unsubscribe_link')
    on conflict (workspace_id, email)
    do update set reason = excluded.reason, source = excluded.source, created_at = now()
  `;

  return new Response("You have been unsubscribed. No further outreach will be sent to this address.", {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
});
