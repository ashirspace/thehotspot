import { z } from "zod";
import { db, handle, json, methodNotAllowed, readJson, requireWorkspace } from "./_shared.js";

const replySchema = z.object({
  body: z.string().trim().min(1).max(4000),
  markLeadStatus: z.enum(["replied", "booked"]).optional().default("replied"),
});

export default handle(async function handler(request: Request) {
  const context = await requireWorkspace(request);
  if ("error" in context) return context.error;

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const action = url.searchParams.get("action");

  // POST /api/messages?id=xxx&action=reply
  if (id && action === "reply") {
    if (request.method !== "POST") return methodNotAllowed();
    const input = await readJson(request, replySchema);
    const [message] = await db()`
      select id, workspace_id, lead_id from messages
      where id = ${id} and workspace_id = ${context.workspaceId} limit 1
    `;
    if (!message) return json({ error: "Message not found" }, { status: 404 });
    await db().transaction([
      db()`insert into events (workspace_id, message_id, lead_id, type, payload)
           values (${context.workspaceId}, ${id}, ${message.lead_id || null}, 'reply'::event_type, ${JSON.stringify({ body: input.body, manual: true })}::jsonb)`,
      db()`update leads set status = ${input.markLeadStatus}::lead_status where id = ${message.lead_id} and workspace_id = ${context.workspaceId}`,
      db()`update messages set status = 'replied'::message_status where id = ${id} and workspace_id = ${context.workspaceId}`,
      db()`update messages set status = 'skipped'::message_status where lead_id = ${message.lead_id} and workspace_id = ${context.workspaceId} and status in ('queued', 'scheduled')`,
    ]);
    return json({ ok: true });
  }

  // GET /api/messages — list
  if (request.method === "GET") {
    const status = url.searchParams.get("status") || null;
    const messages = await db().query(
      `select messages.*,
        jsonb_build_object('id', leads.id, 'name', leads.name, 'email', leads.email::text, 'company', leads.company, 'status', leads.status) as lead,
        jsonb_build_object('id', campaigns.id, 'name', campaigns.name) as campaign
       from messages
       left join leads on leads.id = messages.lead_id
       left join campaigns on campaigns.id = messages.campaign_id
       where messages.workspace_id = $1 and ($2::text is null or messages.status = $2::message_status)
       order by messages.created_at desc limit 100`,
      [context.workspaceId, status],
    );
    return json({ messages });
  }

  return methodNotAllowed();
});
