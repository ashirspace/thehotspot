import { useState, useRef } from "react";
import { AgentCard, Section } from "../components/AgentCard.jsx";
import { AgentStatus } from "../components/AgentStatus.jsx";

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.trim().replace(/^["']|["']$/g, "").toLowerCase());
  return lines.slice(1).map(line => {
    const vals = line.split(",").map(v => v.trim().replace(/^["']|["']$/g, ""));
    const obj = {};
    headers.forEach((h, i) => { obj[h] = vals[i] || ""; });
    return obj;
  }).filter(r => Object.values(r).some(Boolean));
}

function toCSV(rows) {
  if (!rows.length) return "";
  const cols = Object.keys(rows[0]);
  const header = cols.join(",");
  const body = rows.map(r => cols.map(c => `"${(r[c] || "").replace(/"/g, '""')}"`).join(","));
  return [header, ...body].join("\n");
}

async function importRows(rows) {
  let success = 0, failed = 0;
  for (const row of rows) {
    try {
      const fields = {
        name: row.name || row.Name || "",
        email: row.email || row.Email || "",
        company: row.company || row.Company || "",
        website: row.website || row.Website || "",
        category: row.category || row.Category || "",
        country: row.country || row.Country || "",
        notes: row.notes || row.Notes || "",
      };
      if (!fields.email && !fields.company) { failed++; continue; }
      const res = await fetch("/api/db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entity: "contact", action: "create", fields }),
      });
      res.ok ? success++ : failed++;
    } catch { failed++; }
  }
  return { success, failed };
}

async function exportContacts() {
  const res = await fetch("/api/db?entity=contact&limit=2000");
  if (!res.ok) throw new Error("Export failed");
  const data = await res.json();
  return data.records || [];
}

export default function CSVImportExport() {
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const rows = parseCSV(ev.target.result);
        setPreview(rows);
        setImportResult(null);
        setError(null);
      } catch { setError("Could not parse CSV. Make sure it has a header row."); }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!preview?.length) return;
    setImportLoading(true);
    setError(null);
    try {
      const result = await importRows(preview);
      setImportResult(result);
      setPreview(null);
    } catch (e) { setError(e.message); }
    finally { setImportLoading(false); }
  };

  const handleExport = async () => {
    setExportLoading(true);
    setError(null);
    try {
      const rows = await exportContacts();
      if (!rows.length) { setError("No contacts to export."); return; }
      const csv = toCSV(rows);
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `thehotspot-contacts-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) { setError(e.message); }
    finally { setExportLoading(false); }
  };

  const COLS = ["name", "email", "company", "category", "country"];

  return (
    <AgentCard
      title="CSV Import / Export"
      description="Import contacts from a CSV file or export your entire contact list."
    >
      <div className="grid grid-cols-2 gap-4">
        {/* Import */}
        <div className="bg-card border border-line rounded-lg p-5 flex flex-col gap-4">
          <div>
            <p className="text-sm font-semibold text-foreground">Import Contacts</p>
            <p className="text-xs text-muted mt-1">CSV must have a header row. Supported columns: name, email, company, website, category, country, notes.</p>
          </div>
          <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} className="hidden" />
          <button
            onClick={() => fileRef.current?.click()}
            className="border border-line rounded-lg px-4 py-2.5 text-sm text-muted hover:text-foreground hover:border-accent transition-colors"
          >
            Choose CSV file
          </button>
        </div>

        {/* Export */}
        <div className="bg-card border border-line rounded-lg p-5 flex flex-col gap-4">
          <div>
            <p className="text-sm font-semibold text-foreground">Export Contacts</p>
            <p className="text-xs text-muted mt-1">Download all your contacts as a CSV file.</p>
          </div>
          <button
            onClick={handleExport}
            disabled={exportLoading}
            className="flex items-center justify-center gap-2 bg-accent hover:bg-emerald-400 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
          >
            {exportLoading ? (
              <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Exporting...</>
            ) : "Download CSV"}
          </button>
        </div>
      </div>

      <AgentStatus loading={importLoading} error={error} />

      {/* Preview */}
      {preview && preview.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted uppercase tracking-wide">Preview — {preview.length} rows</p>
            <button
              onClick={handleImport}
              disabled={importLoading}
              className="flex items-center gap-2 bg-accent hover:bg-emerald-400 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              {importLoading ? "Importing..." : `Import ${preview.length} contacts`}
            </button>
          </div>
          <div className="overflow-x-auto rounded-lg border border-line max-h-72">
            <table className="w-full text-sm">
              <thead className="sticky top-0">
                <tr className="border-b border-line bg-card">
                  {COLS.map(c => <th key={c} className="px-3 py-2.5 text-left text-xs font-semibold text-muted uppercase tracking-wide">{c}</th>)}
                </tr>
              </thead>
              <tbody>
                {preview.slice(0, 20).map((row, i) => (
                  <tr key={i} className="border-b border-line last:border-0">
                    {COLS.map(c => <td key={c} className="px-3 py-2 text-foreground truncate max-w-[120px]">{row[c] || "—"}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {preview.length > 20 && <p className="text-xs text-muted">Showing first 20 of {preview.length} rows.</p>}
        </div>
      )}

      {importResult && (
        <div className="bg-emerald-950/40 border border-emerald-800 rounded-lg px-5 py-4 flex gap-6">
          <div>
            <p className="text-2xl font-bold text-emerald-400">{importResult.success}</p>
            <p className="text-xs text-muted">Imported</p>
          </div>
          {importResult.failed > 0 && (
            <div>
              <p className="text-2xl font-bold text-red-400">{importResult.failed}</p>
              <p className="text-xs text-muted">Skipped</p>
            </div>
          )}
        </div>
      )}
    </AgentCard>
  );
}
