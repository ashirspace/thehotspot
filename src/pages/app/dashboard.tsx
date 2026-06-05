import { AlertTriangle, ArrowRight, CheckCircle2, MailCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge, Card } from "../../components/ui";
import { useDashboardData } from "../../lib/data-hooks";
import { percent } from "../../lib/utils";

export function DashboardPage() {
  const { campaigns, identities, inboxThreads, isError, isLoading } = useDashboardData();
  const totalSent = campaigns.reduce((sum, campaign) => sum + campaign.sent, 0);
  const totalReplies = campaigns.reduce((sum, campaign) => sum + campaign.replied, 0);
  const blockedSenders = identities.filter((sender) => !sender.dnsVerified).length;

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-heading italic text-[clamp(2.5rem,4vw,4.5rem)] font-normal leading-[0.95] tracking-[-0.03em]">Campaign dashboard</h1>
        <p className="mt-2 text-[var(--text-secondary)]">Live workspace health, funnel metrics, replies, and launch readiness.</p>
      </div>
      <section className="grid border-y border-[var(--surface-border)] md:grid-cols-4">
        <Metric label="Sent" value={totalSent.toLocaleString()} helper="Across active campaigns" />
        <Metric label="Reply rate" value={percent(totalReplies, totalSent)} helper={`${totalReplies} replies`} />
        <Metric label="Booked" value="34" helper="Demo-ready opportunities" />
        <Metric label="Blocked senders" value={String(blockedSenders)} helper="DNS verification required" warning={blockedSenders > 0} />
      </section>
      {isLoading ? <StateLine label="Loading live workspace data..." /> : null}
      {isError ? <StateLine label="Could not load Neon data. Showing empty workspace state." tone="error" /> : null}
      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card className="p-0">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="px-5 pt-5 font-sans text-[1.1rem] font-medium not-italic tracking-normal">Campaign funnel</h2>
              <p className="px-5 text-sm text-[var(--text-secondary)]">Sent to booked conversion by campaign.</p>
            </div>
            <Link className="px-5 pt-5 text-sm font-medium text-[var(--orange-dim)]" to="/app/campaigns">Manage <ArrowRight className="inline h-4 w-4" /></Link>
          </div>
          <div className="overflow-x-auto">
            <div className="grid min-w-[820px] grid-cols-[minmax(190px,1.3fr)_90px_repeat(5,minmax(72px,1fr))] gap-3 border-y border-[var(--surface-border)] bg-[var(--surface-raised)] px-5 py-2 font-mono text-[0.68rem] uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
              <span>Campaign</span>
              <span>Status</span>
              <span>Sent</span>
              <span>Delivered</span>
              <span>Opened</span>
              <span>Replied</span>
              <span>Booked</span>
            </div>
            {campaigns.length === 0 ? (
              <div className="px-5 py-8 text-sm text-[var(--text-secondary)]">No campaigns yet. Create a campaign to populate the funnel.</div>
            ) : campaigns.map((campaign) => (
              <div key={campaign.id} className="campaign-row grid min-w-[820px] grid-cols-[minmax(190px,1.3fr)_90px_repeat(5,minmax(72px,1fr))] gap-3 border-b border-[var(--surface-border)] px-5 py-4 text-sm last:border-b-0">
                <div className="font-medium">{campaign.name}</div>
                <Badge tone={campaign.status === "active" ? "teal" : "orange"}>{campaign.status}</Badge>
                <span>{campaign.sent}</span>
                <span>{campaign.delivered}</span>
                <span>{campaign.opened}</span>
                <span>{campaign.replied}</span>
                <span>{campaign.booked}</span>
              </div>
            ))}
          </div>
        </Card>
        <div className="grid gap-6">
          <Card>
            <h2 className="font-sans text-[1.1rem] font-medium not-italic tracking-normal">Onboarding</h2>
            <div className="mt-4 space-y-3">
              {[
                ["Connect mailbox", true],
                ["Verify SPF/DKIM/DMARC", false],
                ["Import leads", true],
                ["Build sequence", true],
                ["Launch safely", false],
              ].map(([label, done]) => (
                <div key={String(label)} className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                  {done ? <CheckCircle2 className="h-4 w-4 text-[var(--green)]" /> : <AlertTriangle className="h-4 w-4 text-[var(--amber)]" />}
                  {label}
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-2 font-medium">
              <MailCheck className="h-5 w-5 text-[var(--orange)]" />
              Reply inbox
            </div>
            <div className="mt-4 space-y-3">
              {inboxThreads.length === 0 ? (
                <p className="text-sm text-[var(--text-secondary)]">No replies yet.</p>
              ) : inboxThreads.slice(0, 2).map((thread) => (
                <Link key={thread.id} to="/app/inbox" className="grid grid-cols-[28px_1fr_auto] gap-3 rounded border border-[var(--surface-border)] p-3 hover:bg-[var(--surface-raised)]">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--orange)] text-xs font-medium text-[var(--dark-text)]">
                    {thread.leadName.slice(0, 1)}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{thread.leadName}</span>
                    <span className="mt-1 block line-clamp-2 text-xs text-[var(--text-secondary)]">{thread.preview}</span>
                  </span>
                  <span className="font-mono text-[0.7rem] text-[var(--text-tertiary)]">{thread.lastActivity}</span>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}

function StateLine({ label, tone = "default" }: { label: string; tone?: "default" | "error" }) {
  return (
    <div className={`rounded border px-4 py-3 text-sm ${tone === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-[var(--surface-border)] bg-[var(--surface-raised)] text-[var(--text-secondary)]"}`}>
      {label}
    </div>
  );
}

function Metric({ label, value, helper, warning }: { label: string; value: string; helper: string; warning?: boolean }) {
  return (
    <div className="border-b border-[var(--surface-border)] p-4 md:border-b-0 md:border-r md:last:border-r-0">
      <div className="precision-label">{label}</div>
      <div className={warning ? "mt-2 text-[2.5rem] font-light leading-none text-[var(--orange-dim)]" : "mt-2 text-[2.5rem] font-light leading-none"}>{value}</div>
      <div className="mt-2 font-mono text-[0.7rem] text-[var(--text-tertiary)]">{helper}</div>
    </div>
  );
}
