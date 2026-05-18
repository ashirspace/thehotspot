import { useState, useRef } from "react";
import { Upload, Download, FileSpreadsheet, CheckCircle2, AlertCircle, ArrowUpDown } from "lucide-react";
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

const PREVIEW_COLS = ["name", "email", "company", "category", "country"];

export default function CSVImportExport() {
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState("");
  const [importResult, setImportResult] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (file) => {
    if (!file) return;
    setFileName(file.name);
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

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file?.name.endsWith(".csv")) handleFile(file);
  };

  const handleImport = async () => {
    if (!preview?.length) return;
    setImportLoading(true);
    setError(null);
    try {
      const result = await importRows(preview);
      setImportResult(result);
      setPreview(null);
      setFileName("");
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

  return (
    <div className="flex flex-col gap-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-xl border border-line bg-card">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/8 via-transparent to-transparent" />
        <div className="relative flex items-start gap-4 p-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/12 border border-amber-500/20">
            <ArrowUpDown className="h-6 w-6 text-amber-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-foreground">CSV Import / Export</h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/12 text-amber-400 border border-amber-500/20">Bulk</span>
            </div>
            <p className="text-sm text-muted max-w-lg">Import contacts from a CSV file or export your entire contact database as a CSV.</p>
          </div>
        </div>
      </div>

      {/* Import + Export side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Import card */}
        <div className="bg-card border border-line rounded-xl p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Upload className="h-4 w-4 text-amber-400" />
            <p className="text-sm font-semibold text-foreground">Import Contacts</p>
          </div>
          <p className="text-xs text-muted leading-relaxed">Supported columns: name, email, company, website, category, country, notes. Must have a header row.</p>

          {/* Drop zone */}
          <div
            className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-8 transition-colors cursor-pointer ${dragOver ? "border-amber-500/50 bg-amber-500/5" : "border-line hover:border-amber-500/30 hover:bg-amber-500/3"}`}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
          >
            <input ref={fileRef} type="file" accept=".csv" onChange={e => handleFile(e.target.files?.[0])} className="hidden" />
            <FileSpreadsheet className={`h-8 w-8 ${dragOver ? "text-amber-400" : "text-muted/50"}`} />
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Drop a CSV file here</p>
              <p className="text-xs text-muted mt-0.5">or click to browse</p>
            </div>
            {fileName && (
              <span className="text-xs text-amber-400 font-medium px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20">{fileName}</span>
            )}
          </div>
        </div>

        {/* Export card */}
        <div className="bg-card border border-line rounded-xl p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Download className="h-4 w-4 text-emerald-400" />
            <p className="text-sm font-semibold text-foreground">Export Contacts</p>
          </div>
          <p className="text-xs text-muted leading-relaxed">Download your entire contact list as a CSV file, ready for any CRM or spreadsheet tool.</p>

          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-line bg-surface/40 py-8">
            <Download className="h-8 w-8 text-muted/50" />
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Export all contacts</p>
              <p className="text-xs text-muted mt-0.5">Downloads as thehotspot-contacts-[date].csv</p>
            </div>
          </div>

          <button
            onClick={handleExport}
            disabled={exportLoading}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
          >
            {exportLoading ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Exporting...</>
            ) : (
              <><Download className="h-4 w-4" />Download CSV</>
            )}
          </button>
        </div>
      </div>

      <AgentStatus loading={importLoading} error={error} />

      {/* Preview */}
      {preview && preview.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold text-muted uppercase tracking-wider">Preview</p>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">{preview.length} rows</span>
            </div>
            <button
              onClick={handleImport}
              disabled={importLoading}
              className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              {importLoading ? "Importing..." : `Import ${preview.length} contacts`}
            </button>
          </div>
          <div className="overflow-x-auto rounded-xl border border-line max-h-72">
            <table className="w-full text-sm">
              <thead className="sticky top-0">
                <tr className="border-b border-line bg-card">
                  {PREVIEW_COLS.map(c => <th key={c} className="px-4 py-2.5 text-left text-xs font-semibold text-muted uppercase tracking-wider capitalize">{c}</th>)}
                </tr>
              </thead>
              <tbody>
                {preview.slice(0, 20).map((row, i) => (
                  <tr key={i} className="border-b border-line last:border-0 hover:bg-amber-500/3">
                    {PREVIEW_COLS.map(c => <td key={c} className="px-4 py-2.5 text-foreground truncate max-w-[120px]">{row[c] || "—"}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {preview.length > 20 && <p className="text-xs text-muted">Showing first 20 of {preview.length} rows.</p>}
        </div>
      )}

      {/* Import result */}
      {importResult && (
        <div className="flex items-start gap-6 bg-card border border-emerald-800/40 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            <div>
              <p className="text-2xl font-bold text-emerald-400">{importResult.success}</p>
              <p className="text-xs text-muted">Contacts imported</p>
            </div>
          </div>
          {importResult.failed > 0 && (
            <>
              <div className="w-px self-stretch bg-line" />
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
                <div>
                  <p className="text-2xl font-bold text-red-400">{importResult.failed}</p>
                  <p className="text-xs text-muted">Rows skipped (missing email + company)</p>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
