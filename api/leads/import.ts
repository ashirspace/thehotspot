import { z } from "zod";
import { db, handle, json, methodNotAllowed, normalizeEmail, readJson, requireWorkspace } from "../_shared";

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
  const headers = headerLine.split(",").map((header) => header.trim());
  return lines
    .filter(Boolean)
    .map((line) => {
      const values = line.split(",").map((value) => value.trim());
      return Object.fromEntries(headers.map((header, index) => [header, values[index] || ""]));
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
  if (request.method !== "POST") return methodNotAllowed();
  const context = await requireWorkspace(request);
  if ("error" in context) return context.error;
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
  if (uniqueRows.length === 0) {
    return json({ inserted: 0, skipped: parsed.length, leads: [] });
  }

  const [result] = await db().query(
    `
      with source_rows as (
        select *
        from jsonb_to_recordset($1::jsonb) as row_data(
          name text,
          first_name text,
          email text,
          company text,
          role text,
          linkedin_url text,
          enrichment jsonb,
          validation_status text
        )
      ),
      inserted as (
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
        select
          $2,
          name,
          first_name,
          email,
          company,
          role,
          linkedin_url,
          coalesce(enrichment, '{}'::jsonb),
          validation_status::validation_status
        from source_rows
        on conflict (workspace_id, email) do nothing
        returning *
      )
      select
        count(*)::integer as inserted,
        coalesce(jsonb_agg(to_jsonb(inserted.*)), '[]'::jsonb) as leads
      from inserted
    `,
    [JSON.stringify(uniqueRows), context.workspaceId],
  );

  const inserted = Number(result?.inserted || 0);
  return json({
    inserted,
    skipped: parsed.length - inserted,
    leads: result?.leads || [],
  });
});
