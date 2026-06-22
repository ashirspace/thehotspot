import { AddLeadDialog } from "@/components/add-lead-dialog";
import { LeadsSearchTable } from "@/components/leads-search-table";
import { getContacts } from "@/lib/data";
import { getViewer } from "@/lib/viewer";

export default async function LeadsPage() { const viewer = (await getViewer())!; const contacts = await getContacts(viewer.id); return <div className="space-y-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 text-xs font-semibold uppercase tracking-[.16em] text-primary">People</p><h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Leads</h1><p className="mt-2 text-sm text-muted-foreground">Keep the list clean. Personalize one thoughtful email at a time.</p></div><AddLeadDialog /></div><LeadsSearchTable contacts={contacts} /></div>; }
