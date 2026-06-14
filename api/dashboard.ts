import { db, handle, json, methodNotAllowed, requireWorkspace } from "./_shared.js";

export default handle(async function handler(request: Request) {
  const context = await requireWorkspace(request);
  if ("error" in context) return context.error;

  if (request.method !== "GET") return methodNotAllowed();

  const [summary] = await db().query(
    `select
      (select count(*)::integer from campaigns where workspace_id = $1) as total_campaigns,
      (select count(*)::integer from leads where workspace_id = $1) as leads_generated,
      (
        select count(*)::integer
        from messages
        where workspace_id = $1
          and status in ('queued', 'scheduled')
          and (
            scheduled_at is null
            or scheduled_at < date_trunc('day', now()) + interval '1 day'
          )
      ) as follow_ups_left_today`,
    [context.workspaceId],
  );

  const recentReplies = await db().query(
    `select
      messages.id,
      messages.subject,
      messages.body,
      messages.created_at,
      messages.updated_at,
      messages.channel,
      coalesce(leads.name, leads.email::text, 'Unknown sender') as sender_name,
      leads.email::text as sender_email,
      coalesce(campaigns.name, 'No campaign') as campaign_name
    from messages
    left join leads on leads.id = messages.lead_id
    left join campaigns on campaigns.id = messages.campaign_id
    where messages.workspace_id = $1
      and messages.status = 'replied'
      and messages.channel = 'email'
    order by coalesce(messages.updated_at, messages.created_at) desc
    limit 5`,
    [context.workspaceId],
  );

  return json({
    summary: {
      totalCampaigns: Number(summary?.total_campaigns || 0),
      leadsGenerated: Number(summary?.leads_generated || 0),
      followUpsLeftToday: Number(summary?.follow_ups_left_today || 0),
    },
    recentReplies: recentReplies.map((reply) => ({
      id: String(reply.id),
      senderName: String(reply.sender_name || "Unknown sender"),
      senderEmail: reply.sender_email ? String(reply.sender_email) : null,
      subject: reply.subject ? String(reply.subject) : "No subject",
      preview: reply.body ? String(reply.body) : "",
      campaignName: String(reply.campaign_name || "No campaign"),
      timestamp: new Date(reply.updated_at || reply.created_at).toISOString(),
    })),
  });
});
