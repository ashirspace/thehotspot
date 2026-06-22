"use client";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { LeadsTable } from "@/components/leads-table";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Contact } from "@/lib/types";

export function LeadsSearchTable({ contacts }: { contacts: Contact[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => { const needle = query.trim().toLowerCase(); if (!needle) return contacts; return contacts.filter((contact) => [contact.first_name, contact.last_name, contact.email, contact.company, contact.job_title].some((value) => value.toLowerCase().includes(needle))); }, [contacts, query]);
  return <Card><CardContent className="p-0"><div className="border-b p-4"><div className="relative max-w-md"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Search leads, companies, or roles" aria-label="Search leads" value={query} onChange={(event) => setQuery(event.target.value)} /></div></div>{filtered.length ? <LeadsTable contacts={filtered} /> : <p className="p-10 text-center text-sm text-muted-foreground">No leads match “{query}”.</p>}</CardContent></Card>;
}
