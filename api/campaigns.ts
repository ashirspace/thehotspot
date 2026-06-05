import { z } from "zod";
import { db, handle, json, methodNotAllowed, readJson, requireWorkspace } from "./_shared";

const createSchema = z.object({
  name: z.string().trim().min(1).max(120),
  sendingIdentityId: z.string().uuid().nullable().optional(),
  toneGuide: z.string().trim().max(1000).optional(),
});

export default handle(async function handler(request: Request) {
  const context = await requireWorkspace(request);
  if ("error" in context) return context.error;

  if (request.method === "GET") {
    const campaigns = await db()`
      select
        campaigns.*,
        sending_identities.from_email as sending_from_email,
        sending_identities.dns_verified as sending_dns_verified,
        coalesce(campaign_funnel.sent, 0)::integer as sent,
        coalesce(campaign_funnel.delivered, 0)::integer as delivered,
        coalesce(campaign_funnel.opened, 0)::integer as opened,
        coalesce(campaign_funnel.replied, 0)::integer as replied,
        coalesce(campaign_funnel.booked, 0)::integer as booked
      from campaigns
      left join sending_identities on sending_identities.id = campaigns.sending_identity_id
      left join campaign_funnel on campaign_funnel.campaign_id = campaigns.id
      where campaigns.workspace_id = ${context.workspaceId}
      order by campaigns.created_at desc
    `;

    return json({ campaigns });
  }

  if (request.method === "POST") {
    const input = await readJson(request, createSchema);
    const [campaign] = await db()`
      with inserted as (
        insert into campaigns (workspace_id, name, sending_identity_id, tone_guide)
        values (
          ${context.workspaceId},
          ${input.name},
          ${input.sendingIdentityId || null},
          ${input.toneGuide || "Concise, specific, no hype, no invented facts."}
        )
        returning *
      ),
      sequence_insert as (
        insert into sequences (campaign_id, steps)
        select id, '[]'::jsonb
        from inserted
      )
      select * from inserted
    `;

    return json({ campaign }, { status: 201 });
  }

  return methodNotAllowed();
});
