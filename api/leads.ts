import { z } from "zod";
import { db, getPagination, handle, json, methodNotAllowed, normalizeEmail, readJson, requireWorkspace } from "./_shared.js";

const leadSchema = z.object({
  name: z.string().trim().min(1).max(160),
  email: z.string().email(),
  company: z.string().trim().max(160).optional().default(""),
  role: z.string().trim().max(160).optional().default(""),
  linkedinUrl: z.string().url().optional().or(z.literal("")).default(""),
  enrichment: z.record(z.string(), z.unknown()).optional().default({}),
});

const patchSchema = z.object({
  status: z.enum(["new", "contacted", "replied", "booked", "closed", "lost"]).optional(),
  name: z.string().trim().min(1).optional(),
  company: z.string().trim().optional(),
  role: z.string().trim().optional(),
  linkedinUrl: z.string().url().nullable().optional(),
});

const rowSchema = z.object({
  name: z.string().trim().optional(),
  first_name: z.string().trim().optional(),
  email: z.string().trim(),
  company: z.string().trim().optional(),
  role: z.string().trim().optional(),
  linkedin_url: z.string().trim().optional(),
  enrichment: z.record(z.string(), z.unknown()).optional(),
});

const importSchema = z.object({
  rows: z.array(rowSchema).max(500).optional(),
  csv: z.string().max(250_000).optional(),
});

function parseCsv(csv: string) {
  const [headerLine, ...lines] = csv.trim().split(/\r?\n/);
  const headers = headerLine.split(",").map((h) => h.trim());
  return lines.filter(Boolean).map((line) => {
    const values = line.split(",").map((v) => v.trim());
    return Object.fromEntries(headers.map((h, i) => [h, values[i] || ""]));
  });
}

function validationStatus(email: string) {
  const lower = normalizeEmail(email);
  const local = lower.split("@")[0] || "";
  if (!z.string().email().safeParse(lower).success) return "invalid";
  if (["info", "admin", "support", "hello", "sales", "contact"].includes(local)) return "risky";
  return "valid";
}

export default handle(async function handler(request: Request) {
  const context = await requireWorkspace(request);
  if ("error" in context) return context.error;

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const action = url.searchParams.get("action");

  // POST /api/leads?action=import
  if (action === "import") {
    if (request.method !== "POST") return methodNotAllowed();
    const input = await readJson(request, importSchema);
    const rawRows = input.rows || (input.csv ? parseCsv(input.csv) : []);
    const parsed = z.array(rowSchema).parse(rawRows);
    const normalized = parsed
      .map((row) => {
        const email = normalizeEmail(row.email || "");
        const name = row.name || row.first_name || email.split("@")[0] || "Unknown lead";
        return {
          name,
          first_name: row.first_name || name.split(/\s+/)[0] || name,
          email,
          company: row.company || "",
          role: row.role || "",
          linkedin_url: row.linkedin_url || null,
          enrichment: row.enrichment || {},
          validation_status: validationStatus(email),
        };
      })
      .filter((row) => row.validation_status !== "invalid");
    const uniqueRows = [...new Map(normalized.map((row) => [row.email, row])).values()];
    if (uniqueRows.length === 0) return json({ inserted: 0, skipped: parsed.length, leads: [] });
    const [result] = await db().query(
      `with source_rows as (
        select * from jsonb_to_recordset($1::jsonb) as row_data(
          name text, first_name text, email text, company text,
          role text, linkedin_url text, enrichment jsonb, validation_status text
        )
      ),
      inserted as (
        insert into leads (workspace_id, name, first_name, email, company, role, linkedin_url, enrichment, validation_status)
        select $2, name, first_name, email, company, role, linkedin_url,
               coalesce(enrichment, '{}'::jsonb), validation_status::validation_status
        from source_rows
        on conflict (workspace_id, email) do nothing
        returning *
      )
      select count(*)::integer as inserted, coalesce(jsonb_agg(to_jsonb(inserted.*)), '[]'::jsonb) as leads
      from inserted`,
      [JSON.stringify(uniqueRows), context.workspaceId],
    );
    const inserted = Number(result?.inserted || 0);
    return json({ inserted, skipped: parsed.length - inserted, leads: result?.leads || [] });
  }

  // DELETE /api/leads?id=xxx
  if (id && request.method === "DELETE") {
    const deleted = await db()`
      delete from leads where id = ${id} and workspace_id = ${context.workspaceId} returning id
    `;
    if (!deleted[0]) return json({ error: "Lead not found" }, { status: 404 });
    return json({ ok: true });
  }

  // PATCH /api/leads?id=xxx
  if (id && request.method === "PATCH") {
    const input = await readJson(request, patchSchema);
    const [lead] = await db()`
      update leads set
        status = coalesce(${input.status ?? null}::lead_status, status),
        name = coalesce(${input.name ?? null}, name),
        first_name = case when ${input.name ?? null}::text is null then first_name else split_part(${input.name ?? ""}, ' ', 1) end,
        company = coalesce(${input.company ?? null}, company),
        role = coalesce(${input.role ?? null}, role),
        linkedin_url = coalesce(${input.linkedinUrl ?? null}, linkedin_url)
      where id = ${id} and workspace_id = ${context.workspaceId}
      returning *
    `;
    if (!lead) return json({ error: "Lead not found" }, { status: 404 });
    return json({ lead });
  }

  // GET /api/leads — list
  if (request.method === "GET") {
    const search = url.searchParams.get("search")?.trim() || null;
    const status = url.searchParams.get("status") || null;
    const { limit, offset } = getPagination(request);
    const leads = await db().query(
      `select * from leads where workspace_id = $1
        and ($2::text is null or status = $2::lead_status)
        and ($3::text is null
          or to_tsvector('simple', coalesce(name,'') || ' ' || coalesce(email::text,'') || ' ' || coalesce(company,'') || ' ' || coalesce(role,''))
             @@ plainto_tsquery('simple', $3)
          or email::text ilike '%' || $3 || '%')
       order by created_at desc limit $4 offset $5`,
      [context.workspaceId, status, search, limit, offset],
    );
    const [countRow] = await db().query(
      `select count(*)::integer as count from leads where workspace_id = $1
        and ($2::text is null or status = $2::lead_status)
        and ($3::text is null
          or to_tsvector('simple', coalesce(name,'') || ' ' || coalesce(email::text,'') || ' ' || coalesce(company,'') || ' ' || coalesce(role,''))
             @@ plainto_tsquery('simple', $3)
          or email::text ilike '%' || $3 || '%')`,
      [context.workspaceId, status, search],
    );
    return json({ leads, count: Number(countRow?.count || 0) });
  }

  // POST /api/leads — create
  if (request.method === "POST") {
    const input = await readJson(request, leadSchema);
    const email = normalizeEmail(input.email);
    const [lead] = await db()`
      insert into leads (workspace_id, name, first_name, email, company, role, linkedin_url, enrichment, validation_status)
      values (
        ${context.workspaceId}, ${input.name}, ${input.name.split(/\s+/)[0] || input.name},
        ${email}, ${input.company}, ${input.role}, ${input.linkedinUrl || null},
        ${JSON.stringify(input.enrichment)}::jsonb, 'valid'
      )
      returning *
    `;
    return json({ lead }, { status: 201 });
  }

  return methodNotAllowed();
});
