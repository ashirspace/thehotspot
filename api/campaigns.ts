import { z } from "zod";
import { db, handle, json, methodNotAllowed, readJson, requireWorkspace } from "./_shared";

const createSchema = z.object({
  name: z.string().trim().min(1).max(120),
  sendingIdentityId: z.string().uuid().nullable().optional(),
  toneGuide: z.string().trim().max(1000).optional(),
});

const patchSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  status: z.enum(["draft", "active", "paused", "completed"]).optional(),
  toneGuide: z.string().trim().max(1000).optional(),
  trackingEnabled: z.boolean().optional(),
});

export default handle(async function handler(request: Request) {
  const context = await requireWorkspace(request);
  if ("error" in context) return context.error;

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const action = url.searchParams.get("action");

  // GET /api/campaigns?id=xxx&action=funnel
  if (id && action === "funnel") {
    const [funnel] = await db()`
      select sent, delivered, opened, replied, booked
      from campaign_funnel
      where workspace_id = ${context.workspaceId} and campaign_id = ${id}
      limit 1
    `;
    return json(funnel || { sent: 0, delivered: 0, opened: 0, replied: 0, booked: 0 });
  }

  // PATCH /api/campaigns?id=xxx
  if (id && request.method === "PATCH") {
    const input = await readJson(request, patchSchema);
    const [campaign] = await db()`
      update campaigns set
        name = coalesce(${input.name ?? null}, name),
        status = coalesce(${input.status ?? null}::campaign_status, status),
        tone_guide = coalesce(${input.toneGuide ?? null}, tone_guide),
        tracking_enabled = coalesce(${input.trackingEnabled ?? null}, tracking_enabled)
      where id = ${id} and workspace_id = ${context.workspaceId}
      returning *
    `;
    if (!campaign) return json({ error: "Campaign not found" }, { status: 404 });
    return json({ campaign });
  }

  // GET /api/campaigns — list
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

  // POST /api/campaigns — create
  if (request.method === "POST") {
    const input = await readJson(request, createSchema);
    const [campaign] = await db()`
      with inserted as (
        insert into campaigns (workspace_id, name, sending_identity_id, tone_guide)
        values (
          ${context.workspaceId}, ${input.name},
          ${input.sendingIdentityId || null},
          ${input.toneGuide || "Concise, specific, no hype, no invented facts."}
        )
        returning *
      ),
      sequence_insert as (
        insert into sequences (campaign_id, steps) select id, '[]'::jsonb from inserted
      )
      select * from inserted
    `;
    return json({ campaign }, { status: 201 });
  }

  return methodNotAllowed();
});
