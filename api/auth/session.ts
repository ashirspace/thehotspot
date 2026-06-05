import { handle, json, methodNotAllowed, requireUser, workspaceForUser } from "../_shared";

export default handle(async function handler(request: Request) {
  if (request.method !== "GET") return methodNotAllowed();

  const authed = await requireUser(request);
  if ("error" in authed) return authed.error;

  const workspace = await workspaceForUser(authed.user.id, request.headers.get("x-workspace-id"));
  if (!workspace) return json({ error: "Workspace membership required" }, { status: 403 });

  return json({
    user: authed.user,
    workspace: {
      id: workspace.id,
      name: workspace.name,
      plan: workspace.plan,
      physical_address: workspace.physical_address,
      owner_id: workspace.owner_id,
    },
    role: workspace.role,
  });
});
