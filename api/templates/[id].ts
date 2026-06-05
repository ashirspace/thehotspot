import { z } from "zod";
import { db, handle, json, methodNotAllowed, readJson, requireWorkspace } from "../_shared";

const patchSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  channel: z.enum(["email", "linkedin"]).optional(),
  subject: z.string().trim().nullable().optional(),
  body: z.string().trim().min(1).optional(),
  variables: z.array(z.string()).optional(),
});

function idFromRequest(request: Request) {
  return new URL(request.url).pathname.split("/").filter(Boolean).at(-1);
}

export default handle(async function handler(request: Request) {
  const context = await requireWorkspace(request);
  if ("error" in context) return context.error;
  const id = idFromRequest(request);
  if (!id) return json({ error: "Template id required" }, { status: 400 });

  if (request.method === "PATCH") {
    const input = await readJson(request, patchSchema);
    const [template] = await db()`
      update templates
      set
        name = coalesce(${input.name ?? null}, name),
        channel = coalesce(${input.channel ?? null}::outreach_channel, channel),
        subject = coalesce(${input.subject ?? null}, subject),
        body = coalesce(${input.body ?? null}, body),
        variables = coalesce(${input.variables ? JSON.stringify(input.variables) : null}::jsonb, variables)
      where id = ${id}
        and workspace_id = ${context.workspaceId}
      returning *
    `;
    if (!template) return json({ error: "Template not found" }, { status: 404 });
    return json({ template });
  }

  return methodNotAllowed();
});
