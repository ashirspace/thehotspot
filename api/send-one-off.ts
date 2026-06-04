import { z } from "zod";
import { checkSuppression, json, readJson, requireWorkspace } from "./_shared";

const schema = z.object({
  sendingIdentityId: z.string().uuid(),
  to: z.string().email(),
  subject: z.string().min(1),
  body: z.string().min(1),
});

export default async function handler(request: Request) {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, { status: 405 });
  const membership = await requireWorkspace(request);
  if ("error" in membership) return membership.error;
  const input = await readJson(request, schema);

  const suppressed = await checkSuppression(membership.workspaceId, input.to);
  if (suppressed) return json({ error: "Recipient is suppressed", reason: suppressed.reason }, { status: 409 });

  const { data: identity, error } = await membership.supabase
    .from("sending_identities")
    .select("*")
    .eq("id", input.sendingIdentityId)
    .eq("workspace_id", membership.workspaceId)
    .maybeSingle();
  if (error) throw error;
  if (!identity) return json({ error: "Sending identity not found" }, { status: 404 });
  if (!identity.dns_verified) return json({ error: "Domain not verified" }, { status: 423 });
  if (identity.sent_today >= identity.daily_limit) return json({ error: "Daily limit reached" }, { status: 429 });

  return json({
    queued: true,
    provider: identity.provider,
    note: "Provider send is intentionally isolated behind server-only ESP credentials.",
  });
}
