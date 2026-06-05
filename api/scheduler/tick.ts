import { db, handle, json, methodNotAllowed, normalizeEmail } from "../_shared";

function isTerminalLeadStatus(status?: string) {
  return ["replied", "booked", "closed", "lost"].includes(status || "");
}

export default handle(async function handler(request: Request) {
  if (request.method !== "POST") return methodNotAllowed();
  const secret = request.headers.get("x-cron-secret");
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return json({ error: "Invalid cron secret" }, { status: 401 });
  }

  const dueMessages = await db()`
    select
      messages.*,
      leads.id as lead_id_joined,
      leads.email::text as lead_email,
      leads.status as lead_status,
      campaigns.id as campaign_id_joined,
      campaigns.status as campaign_status,
      sending_identities.id as identity_id,
      sending_identities.provider as identity_provider,
      sending_identities.dns_verified,
      sending_identities.sent_today,
      sending_identities.daily_limit
    from messages
    left join leads on leads.id = messages.lead_id
    left join campaigns on campaigns.id = messages.campaign_id
    left join sending_identities on sending_identities.id = coalesce(messages.sending_identity_id, campaigns.sending_identity_id)
    where messages.status = 'scheduled'
      and messages.scheduled_at <= now()
    order by messages.scheduled_at asc
    limit 25
  `;

  const processed: Array<{ id: string; action: string; reason?: string }> = [];
  for (const message of dueMessages) {
    const claimed = await db()`
      update messages
      set status = 'sending'
      where id = ${message.id}
        and status = 'scheduled'
      returning id
    `;
    if (!claimed[0]) continue;

    let blockReason: string | null = null;
    if (!message.campaign_id_joined || message.campaign_status !== "active") blockReason = "campaign_inactive";
    if (!blockReason && isTerminalLeadStatus(String(message.lead_status || ""))) blockReason = "lead_terminal";
    if (!blockReason && !message.dns_verified) blockReason = "dns_not_verified";
    if (!blockReason && Number(message.sent_today || 0) >= Number(message.daily_limit || 0)) blockReason = "daily_limit";

    if (!blockReason && message.lead_email) {
      const [suppressed] = await db()`
        select reason
        from suppression_list
        where workspace_id = ${message.workspace_id}
          and email = ${normalizeEmail(String(message.lead_email))}
        limit 1
      `;
      if (suppressed) blockReason = `suppressed:${suppressed.reason}`;
    }

    if (blockReason) {
      await db().transaction([
        db()`
          update messages
          set status = 'skipped', error = ${blockReason}
          where id = ${message.id}
        `,
        db()`
          update messages
          set status = 'skipped', error = ${blockReason}
          where lead_id = ${message.lead_id}
            and status in ('queued', 'scheduled')
        `,
      ]);
      processed.push({ id: String(message.id), action: "skipped", reason: blockReason });
      continue;
    }

    await db().transaction([
      db()`
        update messages
        set status = 'sent', sent_at = now(), error = null
        where id = ${message.id}
      `,
      db()`
        update sending_identities
        set sent_today = sent_today + 1, last_reset_date = current_date
        where id = ${message.identity_id}
      `,
    ]);
    processed.push({ id: String(message.id), action: "sent" });
  }

  return json({ processed });
});
