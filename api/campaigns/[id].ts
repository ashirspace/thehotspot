import { z } from "zod";
import { db, handle, json, methodNotAllowed, readJson, requireWorkspace } from "../_shared";

const patchSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  status: z.enum(["draft", "active", "paused", "completed"]).optional(),
  toneGuide: z.string().trim().max(1000).optional(),
  trackingEnabled: z.boolean().optional(),
});

function idFromRequest(request: Request) {
  return new URL(request.url).pathname.split("/").filter(Boolean).at(-1);
}

export default handle(async function handler(request: Request) {
  const context = await requireWorkspace(request);
  if ("error" in context) return context.error;
  const id = idFromRequest(request);
  if (!id) return json({ error: "Campaign id required" }, { status: 400 });

  if (request.method === "PATCH") {
    const input = await readJson(request, patchSchema);
    const [campaign] = await db()`
      update campaigns
      set
        name = coalesce(${input.name ?? null}, name),
        status = coalesce(${input.status ?? null}::campaign_status, status),
        tone_guide = coalesce(${input.toneGuide ?? null}, tone_guide),
        tracking_enabled = coalesce(${input.trackingEnabled ?? null}, tracking_enabled)
      where id = ${id}
        and workspace_id = ${context.workspaceId}
      returning *
    `;

    if (!campaign) return json({ error: "Campaign not found" }, { status: 404 });
    return json({ campaign });
  }

  return methodNotAllowed();
});
