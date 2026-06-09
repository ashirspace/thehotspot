import { useState } from "react";
import { FileSpreadsheet, Upload } from "lucide-react";
import { Badge, Button, Card, Field, Input } from "../../components/ui";
import { useImportLeads, useLeads } from "../../lib/data-hooks";

export function LeadsPage() {
  const [query, setQuery] = useState("");
  const [importMessage, setImportMessage] = useState("No import running.");
  const leadsQuery = useLeads(query);
  const importMutation = useImportLeads();
  const filtered = leadsQuery.data || [];

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-heading italic text-[clamp(2.3rem,4vw,4rem)] font-normal leading-[1] tracking-[-0.02em]">Lead Finder / Importer</h1>
        <p className="mt-2 text-slate-600">CSV and Google Sheets import with field mapping, dedupe, validation, and enrichment.</p>
      </div>
      <section className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <Card>
          <div className="flex items-center gap-2 font-semibold">
            <Upload className="h-5 w-5 text-[var(--orange)]" />
            Import leads
          </div>
          <form
            className="mt-5 grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              const emailOrUrl = String(form.get("sourceValue") || "");
              const fallbackRows = emailOrUrl.includes("@")
                ? [{ email: emailOrUrl, name: emailOrUrl.split("@")[0], company: "", role: "" }]
                : [];
              importMutation.mutate(fallbackRows, {
                onSuccess: (result) => setImportMessage(`Inserted ${result.inserted} lead(s), skipped ${result.skipped}.`),
                onError: (error) => setImportMessage(error instanceof Error ? error.message : "Import failed."),
              });
            }}
          >
            <Field label="Source">
              <select className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm">
                <option>CSV upload</option>
                <option>Google Sheets URL</option>
              </select>
            </Field>
            <Field label="File or sheet URL">
              <Input name="sourceValue" placeholder="Paste one email now; CSV/Sheets parser is available through /api/leads/import" />
            </Field>
            <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
              Required mapping: name or first_name, email, company. Optional: role, LinkedIn URL, enrichment notes.
            </div>
            <Button type="submit" disabled={importMutation.isPending}>{importMutation.isPending ? "Validating..." : "Validate import"}</Button>
          </form>
          <p className="mt-4 rounded-xl bg-[rgba(13,148,136,0.08)] p-3 text-sm text-[var(--orange-dim)]">{importMessage}</p>
        </Card>
        <Card>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold">Leads</h2>
              <p className="text-sm text-slate-500">{filtered.length} workspace-scoped records</p>
            </div>
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search leads..." />
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            {leadsQuery.isLoading ? (
              <div className="p-4 text-sm text-slate-500">Loading leads...</div>
            ) : leadsQuery.isError ? (
              <div className="p-4 text-sm text-red-700">Could not load leads.</div>
            ) : filtered.length === 0 ? (
              <div className="p-4 text-sm text-slate-500">No leads found.</div>
            ) : filtered.map((lead) => (
              <div key={lead.id} className="grid gap-3 border-b border-slate-100 p-4 text-sm last:border-b-0 md:grid-cols-[1fr_1fr_130px_120px] md:items-center">
                <div>
                  <div className="font-semibold">{lead.name}</div>
                  <div className="text-slate-500">{lead.email}</div>
                </div>
                <div>
                  <div>{lead.company}</div>
                  <div className="text-slate-500">{lead.role}</div>
                </div>
                <Badge tone={lead.validationStatus === "valid" ? "green" : "orange"}>{lead.validationStatus}</Badge>
                <Badge>{lead.status}</Badge>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
            <FileSpreadsheet className="h-4 w-4" />
            Production import uses Supabase storage + server validation before inserting workspace-scoped leads.
          </div>
        </Card>
      </section>
    </div>
  );
}
