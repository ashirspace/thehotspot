import { z } from "zod";
import { db, getPagination, handle, json, methodNotAllowed, normalizeEmail, readJson, requireWorkspace } from "./_shared";

const leadSchema = z.object({
  name: z.string().trim().min(1).max(160),
  email: z.string().email(),
  company: z.string().trim().max(160).optional().default(""),
  role: z.string().trim().max(160).optional().default(""),
  linkedinUrl: z.string().url().optional().or(z.literal("")).default(""),
  enrichment: z.record(z.string(), z.unknown()).optional().default({}),
});

export default handle(async function handler(request: Request) {
  const context = await requireWorkspace(request);
  if ("error" in context) return context.error;

  if (request.method === "GET") {
    const url = new URL(request.url);
    const search = url.searchParams.get("search")?.trim() || null;
    const status = url.searchParams.get("status") || null;
    const { limit, offset } = getPagination(request);

    const leads = await db().query(
      `
        select *
        from leads
        where workspace_id = $1
          and ($2::text is null or status = $2::lead_status)
          and (
            $3::text is null
            or to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(email::text, '') || ' ' || coalesce(company, '') || ' ' || coalesce(role, ''))
              @@ plainto_tsquery('simple', $3)
            or email::text ilike '%' || $3 || '%'
          )
        order by created_at desc
        limit $4 offset $5
      `,
      [context.workspaceId, status, search, limit, offset],
    );

    const [countRow] = await db().query(
      `
        select count(*)::integer as count
        from leads
        where workspace_id = $1
          and ($2::text is null or status = $2::lead_status)
          and (
            $3::text is null
            or to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(email::text, '') || ' ' || coalesce(company, '') || ' ' || coalesce(role, ''))
              @@ plainto_tsquery('simple', $3)
            or email::text ilike '%' || $3 || '%'
          )
      `,
      [context.workspaceId, status, search],
    );

    return json({ leads, count: Number(countRow?.count || 0) });
  }

  if (request.method === "POST") {
    const input = await readJson(request, leadSchema);
    const email = normalizeEmail(input.email);
    const [lead] = await db()`
      insert into leads (
        workspace_id,
        name,
        first_name,
        email,
        company,
        role,
        linkedin_url,
        enrichment,
        validation_status
      )
      values (
        ${context.workspaceId},
        ${input.name},
        ${input.name.split(/\s+/)[0] || input.name},
        ${email},
        ${input.company},
        ${input.role},
        ${input.linkedinUrl || null},
        ${JSON.stringify(input.enrichment)}::jsonb,
        'valid'
      )
      returning *
    `;
    return json({ lead }, { status: 201 });
  }

  return methodNotAllowed();
});
