import { z } from "zod";
import { db, handle, json, methodNotAllowed, normalizeEmail, readJson, requireWorkspace } from "./_shared";

const schema = z.object({
  email: z.string().email(),
  reason: z.enum(["unsubscribed", "bounced", "complained", "manual"]).default("manual"),
});

export default handle(async function handler(request: Request) {
  const context = await requireWorkspace(request);
  if ("error" in context) return context.error;

  if (request.method === "GET") {
    const suppression = await db()`
      select *
      from suppression_list
      where workspace_id = ${context.workspaceId}
      order by created_at desc
    `;
    return json({ suppression });
  }

  if (request.method === "POST") {
    const input = await readJson(request, schema);
    const [suppression] = await db()`
      insert into suppression_list (workspace_id, email, reason, source)
      values (${context.workspaceId}, ${normalizeEmail(input.email)}, ${input.reason}, 'manual')
      on conflict (workspace_id, email)
      do update set reason = excluded.reason, source = excluded.source, created_at = now()
      returning *
    `;
    return json({ suppression }, { status: 201 });
  }

  return methodNotAllowed();
});
