import { z } from "zod";
import { checkSuppression, db, handle, json, methodNotAllowed, normalizeEmail, readJson, requireWorkspace } from "./_shared.js";

const sendOneOffSchema = z.object({
  sendingIdentityId: z.string().uuid(),
  to: z.string().email(),
  subject: z.string().min(1),
  body: z.string().min(1),
});

function isTerminalLeadStatus(status?: string) {
  return ["replied", "booked", "closed", "lost"].includes(status || "");
}

export default handle(async function handler(request: Request) {
  if (request.method !== "POST") return methodNotAllowed();

  const url = new URL(request.url);
  const action = url.searchParams.get("action");

  // POST /api/scheduler?action=send-one-off  (requires workspace auth)
  if (action === "send-one-off") {
    const membership = await requireWorkspace(request);
    if ("error" in membership) return membership.error;
    const input = await readJson(request, sendOneOffSchema);
    const suppressed = await checkSuppression(membership.workspaceId, input.to);
    if (suppressed) return json({ error: "Recipient is suppressed", reason: suppressed.reason }, { status: 409 });
    const [identity] = await db()`
      select * from sending_identities where id = ${input.sendingIdentityId} and workspace_id = ${membership.workspaceId} limit 1
    `;
    if (!identity) return json({ error: "Sending identity not found" }, { status: 404 });
    if (!identity.dns_verified) return json({ error: "Domain not verified" }, { status: 423 });
    if (Number(identity.sent_today || 0) >= Number(identity.daily_limit || 0)) return json({ error: "Daily limit reached" }, { status: 429 });
    const [message] = await db()`
      insert into messages (workspace_id, campaign_id, lead_id, sending_identity_id, step_index, channel, subject, body, scheduled_at, status, idempotency_key)
      values (${membership.workspaceId}, null, null, ${input.sendingIdentityId}, 0, 'email'::outreach_channel, ${input.subject}, ${input.body}, now(), 'scheduled'::message_status, ${`one-off:${membership.workspaceId}:${input.to}:${Date.now()}`})
      returning id
    `;
    return json({ queued: true, messageId: message.id, provider: identity.provider });
  }

  // POST /api/scheduler  — cron tick: process due messages
  const secret = request.headers.get("x-cron-secret");
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return json({ error: "Invalid cron secret" }, { status: 401 });
  }

  const dueMessages = await db()`
    select
      messages.*,
      leads.id as lead_id_joined, leads.email::text as lead_email, leads.status as lead_status,
      campaigns.id as campaign_id_joined, campaigns.status as campaign_status,
      sending_identities.id as identity_id, sending_identities.provider as identity_provider,
      sending_identities.dns_verified, sending_identities.sent_today, sending_identities.daily_limit
    from messages
    left join leads on leads.id = messages.lead_id
    left join campaigns on campaigns.id = messages.campaign_id
    left join sending_identities on sending_identities.id = coalesce(messages.sending_identity_id, campaigns.sending_identity_id)
    where messages.status = 'scheduled' and messages.scheduled_at <= now()
    order by messages.scheduled_at asc limit 25
  `;

  const processed: Array<{ id: string; action: string; reason?: string }> = [];
  for (const message of dueMessages) {
    const claimed = await db()`
      update messages set status = 'sending' where id = ${message.id} and status = 'scheduled' returning id
    `;
    if (!claimed[0]) continue;

    let blockReason: string | null = null;
    if (!message.campaign_id_joined || message.campaign_status !== "active") blockReason = "campaign_inactive";
    if (!blockReason && isTerminalLeadStatus(String(message.lead_status || ""))) blockReason = "lead_terminal";
    if (!blockReason && !message.dns_verified) blockReason = "dns_not_verified";
    if (!blockReason && Number(message.sent_today || 0) >= Number(message.daily_limit || 0)) blockReason = "daily_limit";
    if (!blockReason && message.lead_email) {
      const [suppressed] = await db()`
        select reason from suppression_list
        where workspace_id = ${message.workspace_id} and email = ${normalizeEmail(String(message.lead_email))} limit 1
      `;
      if (suppressed) blockReason = `suppressed:${suppressed.reason}`;
    }

    if (blockReason) {
      await db().transaction([
      db()`update messages set status = 'skipped'::message_status, error = ${blockReason} where id = ${message.id}`,
      db()`update messages set status = 'skipped'::message_status, error = ${blockReason} where lead_id = ${message.lead_id} and status in ('queued', 'scheduled')`,
      ]);
      processed.push({ id: String(message.id), action: "skipped", reason: blockReason });
      continue;
    }

    await db().transaction([
      db()`update messages set status = 'sent'::message_status, sent_at = now(), error = null where id = ${message.id}`,
      db()`update sending_identities set sent_today = sent_today + 1, last_reset_date = current_date where id = ${message.identity_id}`,
    ]);
    processed.push({ id: String(message.id), action: "sent" });
  }

  return json({ processed });
});
