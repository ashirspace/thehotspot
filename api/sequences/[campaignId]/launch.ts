import { db, handle, json, methodNotAllowed, requireWorkspace } from "../../_shared";

function campaignIdFromRequest(request: Request) {
  const parts = new URL(request.url).pathname.split("/").filter(Boolean);
  return parts.at(-2);
}

export default handle(async function handler(request: Request) {
  if (request.method !== "POST") return methodNotAllowed();
  const context = await requireWorkspace(request);
  if ("error" in context) return context.error;
  const campaignId = campaignIdFromRequest(request);
  if (!campaignId) return json({ error: "Campaign id required" }, { status: 400 });

  const [campaign] = await db()`
    select campaigns.*, sending_identities.dns_verified as identity_dns_verified
    from campaigns
    left join sending_identities on sending_identities.id = campaigns.sending_identity_id
    where campaigns.id = ${campaignId}
      and campaigns.workspace_id = ${context.workspaceId}
    limit 1
  `;
  if (!campaign) return json({ error: "Campaign not found" }, { status: 404 });
  if (!context.workspace.physical_address) {
    return json({ error: "Physical mailing address is required before launch" }, { status: 409 });
  }
  if (!campaign.identity_dns_verified) {
    return json({ error: "Sending domain must pass SPF, DKIM, and DMARC before launch" }, { status: 423 });
  }

  const [sequence] = await db()`
    select steps
    from sequences
    where campaign_id = ${campaignId}
    limit 1
  `;
  const steps = Array.isArray(sequence?.steps) ? sequence.steps : [];
  if (steps.length === 0) return json({ error: "Sequence has no steps" }, { status: 409 });

  await db()`
    update campaigns
    set status = 'active'
    where id = ${campaignId}
      and workspace_id = ${context.workspaceId}
  `;
  return json({ ok: true, launched: true });
});
