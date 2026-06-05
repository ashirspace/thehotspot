import { z } from "zod";
import { checkSuppression, db, handle, json, readJson, requireWorkspace } from "./_shared";

const schema = z.object({
  sendingIdentityId: z.string().uuid(),
  to: z.string().email(),
  subject: z.string().min(1),
  body: z.string().min(1),
});

export default handle(async function handler(request: Request) {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, { status: 405 });
  const membership = await requireWorkspace(request);
  if ("error" in membership) return membership.error;
  const input = await readJson(request, schema);

  const suppressed = await checkSuppression(membership.workspaceId, input.to);
  if (suppressed) return json({ error: "Recipient is suppressed", reason: suppressed.reason }, { status: 409 });

  const [identity] = await db()`
    select *
    from sending_identities
    where id = ${input.sendingIdentityId}
      and workspace_id = ${membership.workspaceId}
    limit 1
  `;
  if (!identity) return json({ error: "Sending identity not found" }, { status: 404 });
  if (!identity.dns_verified) return json({ error: "Domain not verified" }, { status: 423 });
  if (Number(identity.sent_today || 0) >= Number(identity.daily_limit || 0)) return json({ error: "Daily limit reached" }, { status: 429 });

  const [message] = await db()`
    insert into messages (
      workspace_id,
      campaign_id,
      lead_id,
      sending_identity_id,
      step_index,
      channel,
      subject,
      body,
      scheduled_at,
      status,
      idempotency_key
    )
    values (
      ${membership.workspaceId},
      null,
      null,
      ${input.sendingIdentityId},
      0,
      'email',
      ${input.subject},
      ${input.body},
      now(),
      'scheduled',
      ${`one-off:${membership.workspaceId}:${input.to}:${Date.now()}`}
    )
    returning id
  `;

  return json({
    queued: true,
    messageId: message.id,
    provider: identity.provider,
    note: "Provider send is intentionally isolated behind server-only ESP credentials.",
  });
});
