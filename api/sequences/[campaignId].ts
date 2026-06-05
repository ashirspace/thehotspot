import { z } from "zod";
import { db, handle, json, methodNotAllowed, readJson, requireWorkspace } from "../_shared";

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

const putSchema = z.object({
  steps: z.array(stepSchema).max(20),
});

function campaignIdFromRequest(request: Request) {
  return new URL(request.url).pathname.split("/").filter(Boolean).at(-1);
}

export default handle(async function handler(request: Request) {
  const context = await requireWorkspace(request);
  if ("error" in context) return context.error;
  const campaignId = campaignIdFromRequest(request);
  if (!campaignId) return json({ error: "Campaign id required" }, { status: 400 });

  const [campaign] = await db()`
    select id
    from campaigns
    where id = ${campaignId}
      and workspace_id = ${context.workspaceId}
    limit 1
  `;
  if (!campaign) return json({ error: "Campaign not found" }, { status: 404 });

  if (request.method === "GET") {
    const [sequence] = await db()`
      select *
      from sequences
      where campaign_id = ${campaignId}
      limit 1
    `;
    return json({ sequence: sequence || { campaign_id: campaignId, steps: [] } });
  }

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
      insert into sequences (campaign_id, steps)
      values (${campaignId}, ${JSON.stringify(steps)}::jsonb)
      on conflict (campaign_id)
      do update set steps = excluded.steps
      returning *
    `;
    return json({ sequence });
  }

  return methodNotAllowed();
});
