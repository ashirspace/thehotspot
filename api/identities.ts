import { z } from "zod";
import { db, handle, json, methodNotAllowed, readJson, requireWorkspace } from "./_shared";

const identitySchema = z.object({
  fromName: z.string().trim().min(1).max(120),
  fromEmail: z.string().email(),
  provider: z.enum(["gmail", "resend", "sendgrid"]),
  providerAccountRef: z.string().trim().optional(),
  trackingDomain: z.string().trim().optional(),
  dailyLimit: z.number().int().min(0).max(500).optional(),
});

export default handle(async function handler(request: Request) {
  const context = await requireWorkspace(request);
  if ("error" in context) return context.error;

  if (request.method === "GET") {
    const identities = await db()`
      select *
      from sending_identities
      where workspace_id = ${context.workspaceId}
      order by created_at asc
    `;
    return json({ identities });
  }

  if (request.method === "POST") {
    const input = await readJson(request, identitySchema);
    const [identity] = await db()`
      insert into sending_identities (
        workspace_id,
        from_name,
        from_email,
        provider,
        provider_account_ref,
        tracking_domain,
        daily_limit
      )
      values (
        ${context.workspaceId},
        ${input.fromName},
        ${input.fromEmail.toLowerCase()},
        ${input.provider},
        ${input.providerAccountRef || null},
        ${input.trackingDomain || null},
        ${input.dailyLimit || 20}
      )
      returning *
    `;
    return json({ identity }, { status: 201 });
  }

  return methodNotAllowed();
});
