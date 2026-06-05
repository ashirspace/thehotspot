import { z } from "zod";
import { db, handle, json, normalizeEmail, readJson } from "./_shared.js";

const schema = z.object({
  messageId: z.string().uuid(),
  type: z.enum(["open", "click", "reply", "bounce", "complaint", "unsubscribe"]),
  payload: z.record(z.string(), z.unknown()).default({}),
});

function messageStatusForEvent(type: string) {
  if (type === "reply") return "replied";
  if (type === "bounce") return "bounced";
  if (["complaint", "unsubscribe"].includes(type)) return "skipped";
  return null;
}

export default handle(async function handler(request: Request) {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, { status: 405 });
  const secret = request.headers.get("x-webhook-secret");
  if (secret !== process.env.WEBHOOK_SIGNING_SECRET) return json({ error: "Invalid webhook secret" }, { status: 401 });

  const input = await readJson(request, schema);
  const [message] = await db()`
    select messages.*, leads.email::text as lead_email
    from messages
    left join leads on leads.id = messages.lead_id
    where messages.id = ${input.messageId}
    limit 1
  `;
  if (!message) return json({ error: "Message not found" }, { status: 404 });

  const statements = [
    db()`
      insert into events (workspace_id, message_id, lead_id, type, payload)
      values (
        ${message.workspace_id},
        ${input.messageId},
        ${message.lead_id || null},
        ${input.type},
        ${JSON.stringify(input.payload)}::jsonb
      )
    `,
  ];

  const nextStatus = messageStatusForEvent(input.type);
  if (nextStatus) {
    statements.push(
      db()`
        update messages
        set status = ${nextStatus}
        where id = ${input.messageId}
      `,
      db()`
        update leads
        set status = ${input.type === "reply" ? "replied" : "lost"}
        where id = ${message.lead_id}
      `,
      db()`
        update messages
        set status = 'skipped'
        where lead_id = ${message.lead_id}
          and status in ('queued', 'scheduled')
      `,
    );
  }

  if (["bounce", "complaint", "unsubscribe"].includes(input.type) && message.lead_email) {
    statements.push(
      db()`
        insert into suppression_list (workspace_id, email, reason, source)
        values (
          ${message.workspace_id},
          ${normalizeEmail(String(message.lead_email))},
          ${input.type === "bounce" ? "bounced" : input.type === "complaint" ? "complained" : "unsubscribed"},
          'webhook'
        )
        on conflict (workspace_id, email)
        do update set reason = excluded.reason, source = excluded.source, created_at = now()
      `,
    );
  }

  await db().transaction(statements);
  return json({ ok: true });
});
