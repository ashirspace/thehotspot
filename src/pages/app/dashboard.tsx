import type { ReactNode } from "react";
import { ArrowRight, CalendarClock, Loader2, MailCheck, Megaphone, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "../../components/ui";
import { useDashboardOverview } from "../../lib/data-hooks";

export function DashboardPage() {
  const dashboardQuery = useDashboardOverview();
  const summary = dashboardQuery.data?.summary ?? {
    totalCampaigns: 0,
    leadsGenerated: 0,
    followUpsLeftToday: 0,
  };
  const recentReplies = dashboardQuery.data?.recentReplies ?? [];

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-heading italic text-[clamp(2.5rem,4vw,4.5rem)] font-normal leading-[0.95] tracking-[-0.03em]">Campaign dashboard</h1>
          <p className="mt-2 max-w-2xl text-[var(--text-secondary)]">
            Live campaign, lead, follow-up, and reply activity for this workspace.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-[var(--surface-border)] bg-[var(--surface-card)] px-3 py-2 text-sm text-[var(--text-secondary)]">
          {dashboardQuery.isFetching ? <Loader2 className="h-4 w-4 animate-spin text-[var(--teal)]" /> : <span className="h-2 w-2 rounded-full bg-[var(--teal)]" />}
          {dashboardQuery.isFetching ? "Refreshing live data" : "Live data"}
        </div>
      </div>

      {dashboardQuery.isError ? (
        <StateLine label="Could not load dashboard metrics from the backend. Try refreshing or check your workspace access." tone="error" />
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Total Campaigns"
          value={summary.totalCampaigns}
          helper="Campaigns created in this workspace"
          to="/app/campaigns"
          icon={<Megaphone className="h-5 w-5" />}
        />
        <MetricCard
          label="Leads Generated"
          value={summary.leadsGenerated}
          helper="Workspace leads available for outreach"
          to="/app/leads"
          icon={<UsersRound className="h-5 w-5" />}
        />
        <MetricCard
          label="Follow-ups Left Today"
          value={summary.followUpsLeftToday}
          helper="Queued or scheduled follow-ups due by tonight"
          to="/app/sequences"
          icon={<CalendarClock className="h-5 w-5" />}
          highlight={summary.followUpsLeftToday > 0}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <Card className="p-0">
          <div className="flex flex-col gap-3 border-b border-[var(--surface-border)] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 font-semibold">
                <MailCheck className="h-5 w-5 text-[var(--teal)]" />
                Recent Replies
              </div>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">The five newest replied email messages from your inbox.</p>
            </div>
            <Link to="/app/inbox" className="inline-flex items-center gap-1 text-sm font-medium text-[var(--teal-deep)]">
              Open inbox <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {dashboardQuery.isLoading ? (
            <div className="grid gap-3 p-5">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-20 animate-pulse rounded-md bg-[var(--surface-raised)]" />
              ))}
            </div>
          ) : recentReplies.length === 0 ? (
            <div className="p-8 text-sm text-[var(--text-secondary)]">
              No recent replies yet. New replied emails will appear here as soon as they land in the workspace.
            </div>
          ) : (
            <div className="divide-y divide-[var(--surface-border)]">
              {recentReplies.map((reply) => (
                <Link
                  key={reply.id}
                  to={`/app/inbox?thread=${reply.id}`}
                  className="grid gap-3 p-5 transition hover:bg-[var(--surface-raised)] sm:grid-cols-[44px_minmax(0,1fr)_auto] sm:items-start"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-md bg-[var(--teal)] text-sm font-semibold text-white">
                    {reply.senderName.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="min-w-0">
                    <span className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                      <span className="font-semibold text-[var(--text-primary)]">{reply.senderName}</span>
                      {reply.senderEmail ? <span className="truncate text-xs text-[var(--text-tertiary)]">{reply.senderEmail}</span> : null}
                    </span>
                    <span className="mt-1 block truncate text-sm font-medium text-[var(--text-primary)]">{reply.subject}</span>
                    <span className="mt-1 block line-clamp-2 text-sm leading-6 text-[var(--text-secondary)]">{reply.preview || reply.campaignName}</span>
                  </span>
                  <span className="font-mono text-[0.7rem] text-[var(--text-tertiary)] sm:text-right">{formatRelativeTime(reply.timestamp)}</span>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div className="precision-label">Today</div>
          <h2 className="mt-3 font-sans text-xl font-semibold not-italic tracking-normal">What needs attention</h2>
          <div className="mt-5 grid gap-3">
            <ActionItem
              label="Follow-ups pending"
              value={summary.followUpsLeftToday}
              copy={summary.followUpsLeftToday > 0 ? "Review queued steps before the next scheduler run." : "No pending follow-ups due today."}
              to="/app/sequences"
            />
            <ActionItem
              label="Replies to review"
              value={recentReplies.length}
              copy={recentReplies.length > 0 ? "Open recent conversations and move qualified leads forward." : "Your reply queue is clear."}
              to="/app/inbox"
            />
          </div>
        </Card>
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
  helper,
  to,
  icon,
  highlight = false,
}: {
  label: string;
  value: number;
  helper: string;
  to: string;
  icon: ReactNode;
  highlight?: boolean;
}) {
  return (
    <Link to={to} className="group block">
      <Card className={`h-full p-5 transition group-hover:border-[var(--teal)] group-hover:shadow-[0_18px_42px_rgba(15,118,110,0.08)] ${highlight ? "bg-[var(--teal-pale)]/35" : ""}`}>
        <div className="flex items-start justify-between gap-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[var(--teal-pale)] text-[var(--teal-deep)]">{icon}</span>
          <ArrowRight className="h-4 w-4 text-[var(--text-tertiary)] transition group-hover:translate-x-1 group-hover:text-[var(--teal-deep)]" />
        </div>
        <div className="mt-5 precision-label">{label}</div>
        <div className="mt-2 text-[2.75rem] font-semibold leading-none tracking-[-0.05em]">{value.toLocaleString()}</div>
        <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{helper}</p>
      </Card>
    </Link>
  );
}

function ActionItem({ label, value, copy, to }: { label: string; value: number; copy: string; to: string }) {
  return (
    <Link to={to} className="rounded-md border border-[var(--surface-border)] bg-[var(--surface-base)] p-4 transition hover:border-[var(--teal)] hover:bg-[var(--teal-pale)]/35">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-semibold">{label}</span>
        <span className="font-mono text-sm text-[var(--teal-deep)]">{value}</span>
      </div>
      <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{copy}</p>
    </Link>
  );
}

function StateLine({ label, tone = "default" }: { label: string; tone?: "default" | "error" }) {
  return (
    <div className={`rounded border px-4 py-3 text-sm ${tone === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-[var(--surface-border)] bg-[var(--surface-raised)] text-[var(--text-secondary)]"}`}>
      {label}
    </div>
  );
}

function formatRelativeTime(timestamp: string) {
  const then = new Date(timestamp).getTime();
  if (!Number.isFinite(then)) return "recently";
  const diffMs = Date.now() - then;
  const minutes = Math.max(0, Math.round(diffMs / 60_000));
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(timestamp));
}
