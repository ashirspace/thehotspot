import { useEffect, useState } from "react";
import { AgentCard } from "../components/AgentCard.jsx";
import { AgentStatus } from "../components/AgentStatus.jsx";

const COLS = ["name", "company", "email", "website", "category", "country", "notes"];

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
  const [editing, setEditing] = useState(null); // { id, field, value }
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadContacts()
      .then(setContacts)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

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
    <AgentCard title="CRM Lite" description={`Browse and edit all contacts (${contacts.length} total).`}>
      <div className="flex items-center gap-3">
        <input
          className="flex-1 bg-card border border-line rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted focus:outline-none focus:border-accent"
          placeholder="Search contacts..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <span className="text-xs text-muted">{filtered.length} shown</span>
      </div>

      <AgentStatus loading={loading} error={error} />

      {!loading && (
        <div className="overflow-x-auto rounded-lg border border-line">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-card">
                {COLS.map(c => (
                  <th key={c} className="px-3 py-2.5 text-left text-xs font-semibold text-muted uppercase tracking-wide">{c}</th>
                ))}
                <th className="px-3 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(contact => (
                <tr key={contact.id} className="border-b border-line last:border-0 hover:bg-card/60 transition-colors">
                  {COLS.map(col => (
                    <td key={col} className="px-3 py-2 max-w-[160px]">
                      {editing?.id === contact.id && editing?.field === col ? (
                        <input
                          autoFocus
                          className="w-full bg-surface border border-accent rounded px-2 py-1 text-xs text-foreground focus:outline-none"
                          value={editing.value}
                          onChange={e => setEditing(prev => ({ ...prev, value: e.target.value }))}
                          onBlur={commitEdit}
                          onKeyDown={e => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") setEditing(null); }}
                          disabled={saving}
                        />
                      ) : (
                        <span
                          className="block truncate text-foreground cursor-text hover:text-accent transition-colors"
                          title={contact[col] || ""}
                          onClick={() => startEdit(contact.id, col, contact[col] || "")}
                        >
                          {contact[col] || <span className="text-border">—</span>}
                        </span>
                      )}
                    </td>
                  ))}
                  <td className="px-3 py-2">
                    <button
                      onClick={() => handleDelete(contact.id)}
                      className="text-muted hover:text-red-400 transition-colors text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !filtered.length && (
        <p className="text-sm text-muted">No contacts found{search ? " matching your search" : ""}.</p>
      )}
    </AgentCard>
  );
}
