import { z } from "zod";
import { db, handle, json, methodNotAllowed, readJson, requireWorkspace } from "../_shared";

const patchSchema = z.object({
  status: z.enum(["new", "contacted", "replied", "booked", "closed", "lost"]).optional(),
  name: z.string().trim().min(1).optional(),
  company: z.string().trim().optional(),
  role: z.string().trim().optional(),
  linkedinUrl: z.string().url().nullable().optional(),
});

function idFromRequest(request: Request) {
  return new URL(request.url).pathname.split("/").filter(Boolean).at(-1);
}

export default handle(async function handler(request: Request) {
  const context = await requireWorkspace(request);
  if ("error" in context) return context.error;
  const id = idFromRequest(request);
  if (!id) return json({ error: "Lead id required" }, { status: 400 });

  if (request.method === "PATCH") {
    const input = await readJson(request, patchSchema);
    const [lead] = await db()`
      update leads
      set
        status = coalesce(${input.status ?? null}::lead_status, status),
        name = coalesce(${input.name ?? null}, name),
        first_name = case
          when ${input.name ?? null}::text is null then first_name
          else split_part(${input.name ?? ""}, ' ', 1)
        end,
        company = coalesce(${input.company ?? null}, company),
        role = coalesce(${input.role ?? null}, role),
        linkedin_url = coalesce(${input.linkedinUrl ?? null}, linkedin_url)
      where id = ${id}
        and workspace_id = ${context.workspaceId}
      returning *
    `;
    if (!lead) return json({ error: "Lead not found" }, { status: 404 });
    return json({ lead });
  }

  if (request.method === "DELETE") {
    const deleted = await db()`
      delete from leads
      where id = ${id}
        and workspace_id = ${context.workspaceId}
      returning id
    `;
    if (!deleted[0]) return json({ error: "Lead not found" }, { status: 404 });
    return json({ ok: true });
  }

  return methodNotAllowed();
});
