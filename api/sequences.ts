import { z } from "zod";
import { db, handle, json, methodNotAllowed, readJson, requireWorkspace } from "./_shared";

const stepSchema = z.object({
  id: z.string(),
  index: z.number().int().optional(),
  type: z.enum(["email", "dm", "wait"]),
  delay_hours: z.number().int().min(0).optional(),
  delayHours: z.number().int().min(0).optional(),
  channel: z.enum(["email", "linkedin"]),
  template_id: z.string().uuid().nullable().optional(),
  templateId: z.string().uuid().nullable().optional(),
  label: z.string().trim().min(1),
});

const putSchema = z.object({ steps: z.array(stepSchema).max(20) });

export default handle(async function handler(request: Request) {
  const context = await requireWorkspace(request);
  if ("error" in context) return context.error;

  const url = new URL(request.url);
  const campaignId = url.searchParams.get("campaignId");
  const action = url.searchParams.get("action");
  if (!campaignId) return json({ error: "campaignId required" }, { status: 400 });

  const [campaign] = await db()`
    select campaigns.*, sending_identities.dns_verified as identity_dns_verified
    from campaigns
    left join sending_identities on sending_identities.id = campaigns.sending_identity_id
    where campaigns.id = ${campaignId} and campaigns.workspace_id = ${context.workspaceId}
    limit 1
  `;
  if (!campaign) return json({ error: "Campaign not found" }, { status: 404 });

  // POST /api/sequences?campaignId=xxx&action=launch
  if (action === "launch") {
    if (request.method !== "POST") return methodNotAllowed();
    if (!context.workspace.physical_address)
      return json({ error: "Physical mailing address is required before launch" }, { status: 409 });
    if (!campaign.identity_dns_verified)
      return json({ error: "Sending domain must pass SPF, DKIM, and DMARC before launch" }, { status: 423 });
    const [sequence] = await db()`select steps from sequences where campaign_id = ${campaignId} limit 1`;
    if (!Array.isArray(sequence?.steps) || sequence.steps.length === 0)
      return json({ error: "Sequence has no steps" }, { status: 409 });
    await db()`update campaigns set status = 'active' where id = ${campaignId} and workspace_id = ${context.workspaceId}`;
    return json({ ok: true, launched: true });
  }

  // GET /api/sequences?campaignId=xxx
  if (request.method === "GET") {
    const [sequence] = await db()`select * from sequences where campaign_id = ${campaignId} limit 1`;
    return json({ sequence: sequence || { campaign_id: campaignId, steps: [] } });
  }

  // PUT /api/sequences?campaignId=xxx
  if (request.method === "PUT") {
    const input = await readJson(request, putSchema);
    const steps = input.steps.map((step, index) => ({
      id: step.id,
      index: index + 1,
      type: step.type,
      delay_hours: step.delay_hours ?? step.delayHours ?? 0,
      channel: step.channel,
      template_id: step.template_id ?? step.templateId ?? null,
      label: step.label,
    }));
    const [sequence] = await db()`
      insert into sequences (campaign_id, steps) values (${campaignId}, ${JSON.stringify(steps)}::jsonb)
      on conflict (campaign_id) do update set steps = excluded.steps
      returning *
    `;
    return json({ sequence });
  }

  return methodNotAllowed();
});
