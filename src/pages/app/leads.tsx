import { useMemo, useState } from "react";
import { FileSpreadsheet, Upload } from "lucide-react";
import { Badge, Button, Card, Field, Input } from "../../components/ui";
import { leads as seedLeads } from "../../data/demo";
import type { Lead } from "../../types";

export function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>(seedLeads);
  const [query, setQuery] = useState("");
  const [importMessage, setImportMessage] = useState("No import running.");

  const filtered = useMemo(
    () => leads.filter((lead) => [lead.name, lead.company, lead.email, lead.role].join(" ").toLowerCase().includes(query.toLowerCase())),
    [leads, query],
  );

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
              setImportMessage("Mapped 4 columns, removed 2 duplicates, flagged 1 risky address.");
              setLeads(seedLeads);
            }}
          >
            <Field label="Source">
              <select className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm">
                <option>CSV upload</option>
                <option>Google Sheets URL</option>
              </select>
            </Field>
            <Field label="File or sheet URL">
              <Input placeholder="Upload CSV or paste Google Sheet URL" />
            </Field>
            <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
              Required mapping: name or first_name, email, company. Optional: role, LinkedIn URL, enrichment notes.
            </div>
            <Button type="submit">Validate import</Button>
          </form>
          <p className="mt-4 rounded-xl bg-[rgba(254,110,0,0.08)] p-3 text-sm text-[var(--orange-dim)]">{importMessage}</p>
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
            {filtered.map((lead) => (
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
