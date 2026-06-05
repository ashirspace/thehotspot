import { z } from "zod";
import { db, handle, json, methodNotAllowed, readJson, requireWorkspace } from "../../_shared";

const schema = z.object({
  body: z.string().trim().min(1).max(4000),
  markLeadStatus: z.enum(["replied", "booked"]).optional().default("replied"),
});

function idFromRequest(request: Request) {
  const parts = new URL(request.url).pathname.split("/").filter(Boolean);
  return parts.at(-2);
}

export default handle(async function handler(request: Request) {
  if (request.method !== "POST") return methodNotAllowed();
  const context = await requireWorkspace(request);
  if ("error" in context) return context.error;
  const id = idFromRequest(request);
  if (!id) return json({ error: "Message id required" }, { status: 400 });
  const input = await readJson(request, schema);

  const [message] = await db()`
    select id, workspace_id, lead_id
    from messages
    where id = ${id}
      and workspace_id = ${context.workspaceId}
    limit 1
  `;
  if (!message) return json({ error: "Message not found" }, { status: 404 });

  await db().transaction([
    db()`
      insert into events (workspace_id, message_id, lead_id, type, payload)
      values (
        ${context.workspaceId},
        ${id},
        ${message.lead_id || null},
        'reply',
        ${JSON.stringify({ body: input.body, manual: true })}::jsonb
      )
    `,
    db()`
      update leads
      set status = ${input.markLeadStatus}
      where id = ${message.lead_id}
        and workspace_id = ${context.workspaceId}
    `,
    db()`
      update messages
      set status = 'replied'
      where id = ${id}
        and workspace_id = ${context.workspaceId}
    `,
    db()`
      update messages
      set status = 'skipped'
      where lead_id = ${message.lead_id}
        and workspace_id = ${context.workspaceId}
        and status in ('queued', 'scheduled')
    `,
  ]);

  return json({ ok: true });
});
