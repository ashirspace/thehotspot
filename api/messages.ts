import { db, handle, json, requireWorkspace } from "./_shared";

export default handle(async function handler(request: Request) {
  const context = await requireWorkspace(request);
  if ("error" in context) return context.error;

  const url = new URL(request.url);
  const status = url.searchParams.get("status") || null;
  const messages = await db().query(
    `
      select
        messages.*,
        jsonb_build_object(
          'id', leads.id,
          'name', leads.name,
          'email', leads.email::text,
          'company', leads.company,
          'status', leads.status
        ) as lead,
        jsonb_build_object(
          'id', campaigns.id,
          'name', campaigns.name
        ) as campaign
      from messages
      left join leads on leads.id = messages.lead_id
      left join campaigns on campaigns.id = messages.campaign_id
      where messages.workspace_id = $1
        and ($2::text is null or messages.status = $2::message_status)
      order by messages.created_at desc
      limit 100
    `,
    [context.workspaceId, status],
  );

  return json({ messages });
});
