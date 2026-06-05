import { Link, Navigate, Outlet } from "react-router-dom";
import {
  BarChart3,
  BookOpenText,
  Cable,
  Inbox,
  LayoutDashboard,
  ListChecks,
  MailCheck,
  Settings,
  Shuffle,
  Users,
} from "lucide-react";
import { Badge, HubLogo, SidebarLink } from "../components/ui";
import { useAuth } from "../state/use-auth";

export function AppShell() {
  const { loading, user, workspace } = useAuth();
  if (loading) {
    return <div className="grid min-h-screen place-items-center bg-[var(--surface-base)] text-sm text-[var(--text-secondary)]">Loading workspace...</div>;
  }
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-[var(--surface-base)] text-[var(--text-primary)]">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-[var(--surface-border)] bg-[var(--surface-raised)] lg:block">
        <div className="flex h-full flex-col">
          <div className="border-b border-[var(--surface-border)] p-5">
            <Link to="/app">
              <HubLogo />
            </Link>
            <div className="mt-5 rounded border border-[var(--surface-border)] bg-[var(--surface-base)] p-3">
              <div className="flex items-center justify-between gap-2 text-sm font-medium">
                {workspace.name}
                <span className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-[var(--orange-dim)]">{workspace.plan}</span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="font-mono text-[0.7rem] uppercase tracking-[0.08em] text-[var(--text-tertiary)]">Workspace</span>
              </div>
            </div>
          </div>
          <nav className="grid gap-1 p-4">
            <SidebarLink to="/app" label="Dashboard" icon={<LayoutDashboard className="h-4 w-4" />} />
            <SidebarLink to="/app/leads" label="Lead Finder / Importer" icon={<Users className="h-4 w-4" />} />
            <SidebarLink to="/app/campaigns" label="Campaigns" icon={<BarChart3 className="h-4 w-4" />} />
            <SidebarLink to="/app/sequences" label="Sequence Builder" icon={<Shuffle className="h-4 w-4" />} />
            <SidebarLink to="/app/inbox" label="Reply Inbox" icon={<Inbox className="h-4 w-4" />} />
            <SidebarLink to="/app/crm" label="CRM Lite" icon={<ListChecks className="h-4 w-4" />} />
            <SidebarLink to="/app/templates" label="Templates + AI Writer" icon={<BookOpenText className="h-4 w-4" />} />
            <SidebarLink to="/app/deliverability" label="Deliverability" icon={<MailCheck className="h-4 w-4" />} />
            <SidebarLink to="/app/settings" label="Settings + Integrations" icon={<Settings className="h-4 w-4" />} />
          </nav>
          <div className="mt-auto border-t border-[var(--surface-border)] p-4">
            <div className="alert-card rounded p-3 text-sm text-[var(--text-primary)]">
              <div className="flex items-center gap-2 font-medium">
                <Cable className="h-4 w-4 text-[var(--orange)]" />
                Official channels only
              </div>
              <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">DM outreach is assisted and human-approved. No headless-browser bots.</p>
            </div>
            <div className="mt-4 flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.08em] text-[var(--text-secondary)]">
              <span className="scheduler-dot h-1.5 w-1.5 rounded-full bg-[var(--green)]" />
              Scheduler live
            </div>
          </div>
        </div>
      </aside>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-[var(--surface-border)] bg-[var(--surface-base)]/90 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-[var(--text-primary)]">{workspace.name}</div>
              <div className="font-mono text-[0.7rem] text-[var(--text-tertiary)]">Signed in as {user.email}</div>
            </div>
            <Badge tone="teal">RLS enforced workspace model</Badge>
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
