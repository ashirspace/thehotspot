import { useEffect, useState } from "react";
import { Users, Search, Trash2, RefreshCw, Edit3 } from "lucide-react";
import { AgentStatus } from "../components/AgentStatus.jsx";

const COLS = ["name", "company", "email", "website", "category", "country", "notes"];
const DISPLAY_COLS = ["name", "company", "email", "category", "country"];

const CATEGORY_COLORS = {
  network: { bg: "bg-emerald-950/50", text: "text-emerald-400", border: "border-emerald-800/40" },
  cps:     { bg: "bg-sky-950/50",     text: "text-sky-400",     border: "border-sky-800/40" },
  cpl:     { bg: "bg-purple-950/50",  text: "text-purple-400",  border: "border-purple-800/40" },
  cpa:     { bg: "bg-amber-950/50",   text: "text-amber-400",   border: "border-amber-800/40" },
  mobile:  { bg: "bg-pink-950/50",    text: "text-pink-400",    border: "border-pink-800/40" },
};

function CategoryBadge({ value }) {
  const key = (value || "").toLowerCase();
  const cfg = CATEGORY_COLORS[key] || { bg: "bg-surface", text: "text-muted", border: "border-line" };
  if (!value) return <span className="text-muted text-sm">—</span>;
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {value}
    </span>
  );
}

async function loadContacts() {
  const res = await fetch("/api/db?entity=contact&limit=200");
  if (!res.ok) throw new Error("Failed to load contacts");
  const data = await res.json();
  return data.records || [];
}

async function saveContact(id, fields) {
  const res = await fetch("/api/db", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ entity: "contact", action: "update", id, fields }),
  });
  if (!res.ok) throw new Error("Failed to save");
}

async function deleteContact(id) {
  const res = await fetch("/api/db", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ entity: "contact", action: "delete", id }),
  });
  if (!res.ok) throw new Error("Failed to delete");
}

export default function CRMLite() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    loadContacts()
      .then(setContacts)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = contacts.filter(c =>
    COLS.some(col => (c[col] || "").toLowerCase().includes(search.toLowerCase()))
  );

  const startEdit = (id, field, value) => setEditing({ id, field, value });

  const commitEdit = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await saveContact(editing.id, { [editing.field]: editing.value });
      setContacts(prev => prev.map(c => c.id === editing.id ? { ...c, [editing.field]: editing.value } : c));
      setEditing(null);
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this contact?")) return;
    try {
      await deleteContact(id);
      setContacts(prev => prev.filter(c => c.id !== id));
    } catch (e) { setError(e.message); }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-xl border border-line bg-card">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/8 via-transparent to-transparent" />
        <div className="relative flex items-start justify-between gap-4 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-500/12 border border-violet-500/20">
              <Users className="h-6 w-6 text-violet-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-foreground">CRM Lite</h1>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-violet-500/12 text-violet-400 border border-violet-500/20">{contacts.length} contacts</span>
              </div>
              <p className="text-sm text-muted max-w-lg">Browse, search, and inline-edit all your contacts. Click any cell to edit.</p>
            </div>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs text-muted hover:text-violet-400 border border-line hover:border-violet-500/30 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
          <input
            className="w-full bg-card border border-line rounded-xl pl-9 pr-4 py-2.5 text-sm text-foreground placeholder-muted focus:outline-none focus:border-violet-500/50 transition-colors"
            placeholder="Search contacts by name, company, email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <span className="text-xs text-muted whitespace-nowrap">{filtered.length} of {contacts.length}</span>
      </div>

      <AgentStatus loading={loading} error={error} />

      {!loading && (
        <>
          {filtered.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-line">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line bg-card/80">
                    {DISPLAY_COLS.map(c => (
                      <th key={c} className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider capitalize">{c}</th>
                    ))}
                    <th className="px-4 py-3 w-10" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(contact => (
                    <tr key={contact.id} className="border-b border-line last:border-0 hover:bg-violet-500/3 transition-colors group">
                      {DISPLAY_COLS.map(col => (
                        <td key={col} className="px-4 py-2.5 max-w-[180px]">
                          {editing?.id === contact.id && editing?.field === col ? (
                            <input
                              autoFocus
                              className="w-full bg-surface border border-violet-500/50 rounded-lg px-2 py-1 text-xs text-foreground focus:outline-none"
                              value={editing.value}
                              onChange={e => setEditing(prev => ({ ...prev, value: e.target.value }))}
                              onBlur={commitEdit}
                              onKeyDown={e => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") setEditing(null); }}
                              disabled={saving}
                            />
                          ) : col === "category" ? (
                            <span
                              className="cursor-pointer"
                              onClick={() => startEdit(contact.id, col, contact[col] || "")}
                            >
                              <CategoryBadge value={contact[col]} />
                            </span>
                          ) : (
                            <span
                              className="flex items-center gap-1.5 group/cell cursor-text truncate text-foreground hover:text-violet-400 transition-colors"
                              title={contact[col] || ""}
                              onClick={() => startEdit(contact.id, col, contact[col] || "")}
                            >
                              <span className="truncate">{contact[col] || <span className="text-muted">—</span>}</span>
                              <Edit3 className="h-3 w-3 shrink-0 opacity-0 group-hover/cell:opacity-40 transition-opacity" />
                            </span>
                          )}
                        </td>
                      ))}
                      <td className="px-4 py-2.5">
                        <button
                          onClick={() => handleDelete(contact.id)}
                          className="opacity-0 group-hover:opacity-100 text-muted hover:text-red-400 transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-line border-dashed bg-card/40 py-16 gap-3">
              <Users className="h-10 w-10 text-muted/40" />
              <p className="text-sm text-muted">
                {search ? `No contacts matching "${search}"` : "No contacts yet. Import a CSV to get started."}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
