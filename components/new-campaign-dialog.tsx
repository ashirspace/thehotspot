"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
export function NewCampaignDialog() { const router = useRouter(); const [open, setOpen] = useState(false); const [busy, setBusy] = useState(false); async function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setBusy(true); const name = String(new FormData(event.currentTarget).get("name")); const response = await fetch("/api/campaigns", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) }); setBusy(false); if (response.ok) { setOpen(false); router.refresh(); } } return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button><Plus className="size-4" />New campaign</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Create campaign</DialogTitle><DialogDescription>Use campaigns as a lightweight way to group and track outreach.</DialogDescription></DialogHeader><form onSubmit={submit} className="space-y-4"><div className="space-y-1.5"><Label htmlFor="name">Campaign name</Label><Input id="name" name="name" placeholder="SaaS founders — July" required /></div><div className="flex justify-end"><Button disabled={busy}>{busy ? "Creating…" : "Create draft"}</Button></div></form></DialogContent></Dialog>; }
