import { z } from "zod";
import { db, handle, json, methodNotAllowed, readJson, requireRole, requireWorkspace } from "./_shared.js";

const patchSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  physicalAddress: z.string().trim().max(500).nullable().optional(),
  webhookUrl: z.string().url().nullable().optional(),
  calendarUrl: z.string().url().nullable().optional(),
});

export default handle(async function handler(request: Request) {
  const context = await requireWorkspace(request);
  if ("error" in context) return context.error;

  // GET /api/workspaces — current workspace details, members, settings
  if (request.method === "GET") {
    const members = await db()`
      select members.user_id, users.email::text as email, coalesce(users.full_name, users.email::text) as name, members.role, members.created_at
      from members join users on users.id = members.user_id
      where members.workspace_id = ${context.workspaceId}
      order by members.created_at asc
    `;
    const [settings] = await db()`
      select webhook_url, calendar_url, daily_send_window_start, daily_send_window_end, timezone
      from workspace_settings where workspace_id = ${context.workspaceId} limit 1
    `;
    return json({ workspace: context.workspace, role: context.role, members, settings: settings || { webhook_url: null, calendar_url: null } });
  }

  // PATCH /api/workspaces
  if (request.method === "PATCH") {
    const roleError = requireRole(context, ["owner", "admin"]);
    if (roleError) return roleError;
    const input = await readJson(request, patchSchema);
    if (input.name !== undefined || input.physicalAddress !== undefined) {
      await db()`
        update workspaces set
          name = coalesce(${input.name ?? null}, name),
          physical_address = coalesce(${input.physicalAddress ?? null}, physical_address)
        where id = ${context.workspaceId}
      `;
    }
    if (input.webhookUrl !== undefined || input.calendarUrl !== undefined) {
      await db()`
        insert into workspace_settings (workspace_id, webhook_url, calendar_url)
        values (${context.workspaceId}, ${input.webhookUrl ?? null}, ${input.calendarUrl ?? null})
        on conflict (workspace_id) do update set
          webhook_url = coalesce(excluded.webhook_url, workspace_settings.webhook_url),
          calendar_url = coalesce(excluded.calendar_url, workspace_settings.calendar_url)
      `;
    }
    return json({ ok: true });
  }

  return methodNotAllowed();
});
