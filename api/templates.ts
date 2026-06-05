import { z } from "zod";
import { db, handle, json, methodNotAllowed, readJson, requireWorkspace } from "./_shared.js";

const createSchema = z.object({
  name: z.string().trim().min(1).max(120),
  channel: z.enum(["email", "linkedin"]),
  subject: z.string().trim().nullable().optional(),
  body: z.string().trim().min(1),
  variables: z.array(z.string()).optional().default([]),
});

const patchSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  channel: z.enum(["email", "linkedin"]).optional(),
  subject: z.string().trim().nullable().optional(),
  body: z.string().trim().min(1).optional(),
  variables: z.array(z.string()).optional(),
});

export default handle(async function handler(request: Request) {
  const context = await requireWorkspace(request);
  if ("error" in context) return context.error;

  const id = new URL(request.url).searchParams.get("id");

  // PATCH /api/templates?id=xxx
  if (id && request.method === "PATCH") {
    const input = await readJson(request, patchSchema);
    const [template] = await db()`
      update templates set
        name = coalesce(${input.name ?? null}, name),
        channel = coalesce(${input.channel ?? null}::outreach_channel, channel),
        subject = coalesce(${input.subject ?? null}, subject),
        body = coalesce(${input.body ?? null}, body),
        variables = coalesce(${input.variables ? JSON.stringify(input.variables) : null}::jsonb, variables)
      where id = ${id} and workspace_id = ${context.workspaceId}
      returning *
    `;
    if (!template) return json({ error: "Template not found" }, { status: 404 });
    return json({ template });
  }

  // GET /api/templates — list
  if (request.method === "GET") {
    const templates = await db()`
      select * from templates where workspace_id = ${context.workspaceId} order by created_at asc
    `;
    return json({ templates });
  }

  // POST /api/templates — create
  if (request.method === "POST") {
    const input = await readJson(request, createSchema);
    const [template] = await db()`
      insert into templates (workspace_id, name, channel, subject, body, variables)
      values (${context.workspaceId}, ${input.name}, ${input.channel}, ${input.subject || null}, ${input.body}, ${JSON.stringify(input.variables)}::jsonb)
      returning *
    `;
    return json({ template }, { status: 201 });
  }

  return methodNotAllowed();
});
