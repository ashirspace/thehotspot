import { z } from "zod";
import { db, handle, json, methodNotAllowed, readJson, requireWorkspace } from "./_shared";

const templateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  channel: z.enum(["email", "linkedin"]),
  subject: z.string().trim().nullable().optional(),
  body: z.string().trim().min(1),
  variables: z.array(z.string()).optional().default([]),
});

export default handle(async function handler(request: Request) {
  const context = await requireWorkspace(request);
  if ("error" in context) return context.error;

  if (request.method === "GET") {
    const templates = await db()`
      select *
      from templates
      where workspace_id = ${context.workspaceId}
      order by created_at asc
    `;
    return json({ templates });
  }

  if (request.method === "POST") {
    const input = await readJson(request, templateSchema);
    const [template] = await db()`
      insert into templates (workspace_id, name, channel, subject, body, variables)
      values (
        ${context.workspaceId},
        ${input.name},
        ${input.channel},
        ${input.subject || null},
        ${input.body},
        ${JSON.stringify(input.variables)}::jsonb
      )
      returning *
    `;
    return json({ template }, { status: 201 });
  }

  return methodNotAllowed();
});
