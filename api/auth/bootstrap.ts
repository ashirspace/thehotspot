import { z } from "zod";
import { ensureDefaultWorkspace, handle, json, methodNotAllowed, readJson, requireUser } from "../_shared";

const schema = z.object({
  workspaceName: z.string().trim().min(1).max(80).optional(),
  fullName: z.string().trim().max(120).optional(),
});

export default handle(async function handler(request: Request) {
  if (request.method !== "POST") return methodNotAllowed();

  const authed = await requireUser(request);
  if ("error" in authed) return authed.error;
  const input = await readJson(request, schema);

  const result = await ensureDefaultWorkspace(authed.user.id, authed.user.email, input.fullName || authed.user.name, input.workspaceName);

  return json(
    {
      workspace: {
        id: result.membership.id,
        name: result.membership.name,
        plan: result.membership.plan,
        physical_address: result.membership.physical_address,
        owner_id: result.membership.owner_id,
      },
      role: result.membership.role,
      created: result.created,
    },
    { status: result.created ? 201 : 200 },
  );
});
