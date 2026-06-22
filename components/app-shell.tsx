"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BarChart3, Flame, LayoutDashboard, Menu, Megaphone, Users, X } from "lucide-react";
import { cn, initials } from "@/lib/utils";

const nav = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/leads", label: "Leads", icon: Users },
  { href: "/app/campaigns", label: "Campaigns", icon: Megaphone },
];

export function AppShell({ user, children }: { user: { name: string; email: string }; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const sidebar = <><div className="flex h-20 items-center justify-between px-5"><Link href="/app" className="flex items-center gap-2.5 font-semibold tracking-tight"><span className="grid size-9 place-items-center rounded-xl bg-primary text-white"><Flame className="size-5" /></span><span>TheHotspot <span className="text-[#ff8c80]">AI</span></span></Link><button className="rounded-lg p-2 lg:hidden" onClick={() => setOpen(false)} aria-label="Close navigation"><X className="size-5" /></button></div><nav className="flex flex-1 flex-col gap-1 px-3 pt-3">{nav.map(({ href, label, icon: Icon }) => { const active = href === "/app" ? pathname === href : pathname.startsWith(href); return <Link key={href} href={href} onClick={() => setOpen(false)} className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/8 hover:text-white", active && "bg-white/10 text-white")}><Icon className="size-4.5" />{label}</Link>; })}</nav><div className="border-t border-white/10 p-4"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full bg-[#ff8c80] text-xs font-bold text-[#172135]">{initials(user.name)}</span><div className="min-w-0"><p className="truncate text-sm font-medium text-white">{user.name}</p><p className="truncate text-xs text-slate-400">{user.email}</p></div></div></div></>;
  return <div className="min-h-screen lg:grid lg:grid-cols-[248px_1fr]"><aside className="sticky top-0 hidden h-screen flex-col bg-[#172135] text-white lg:flex">{sidebar}</aside>{open && <div className="fixed inset-0 z-50 lg:hidden"><button className="absolute inset-0 bg-[#172135]/50" onClick={() => setOpen(false)} aria-label="Close navigation overlay" /><aside className="relative flex h-full w-[280px] flex-col bg-[#172135] text-white shadow-2xl">{sidebar}</aside></div>}<div className="min-w-0"><header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-[#f7f6f2]/90 px-4 backdrop-blur md:px-8 lg:hidden"><button className="rounded-lg border bg-card p-2" onClick={() => setOpen(true)} aria-label="Open navigation"><Menu className="size-5" /></button><span className="flex items-center gap-2 font-semibold"><Flame className="size-5 text-primary" /> TheHotspot AI</span><BarChart3 className="size-5 text-muted-foreground" /></header><main className="mx-auto w-full max-w-[1440px] p-4 sm:p-6 lg:p-8 xl:p-10">{children}</main></div></div>;
}
