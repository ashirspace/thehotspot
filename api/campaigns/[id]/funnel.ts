import { db, handle, json, requireWorkspace } from "../../_shared";

function idFromRequest(request: Request) {
  const parts = new URL(request.url).pathname.split("/").filter(Boolean);
  return parts.at(-2);
}

export default handle(async function handler(request: Request) {
  const context = await requireWorkspace(request);
  if ("error" in context) return context.error;
  const id = idFromRequest(request);
  if (!id) return json({ error: "Campaign id required" }, { status: 400 });

  const [funnel] = await db()`
    select sent, delivered, opened, replied, booked
    from campaign_funnel
    where workspace_id = ${context.workspaceId}
      and campaign_id = ${id}
    limit 1
  `;

  return json(funnel || { sent: 0, delivered: 0, opened: 0, replied: 0, booked: 0 });
});
