import { AlertTriangle, CheckCircle2, ShieldCheck } from "lucide-react";
import { Badge, Button, Card } from "../../components/ui";
import { sendingIdentities } from "../../data/demo";

export function DeliverabilityPage() {
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-heading italic text-[clamp(2.5rem,4vw,4.5rem)] font-normal leading-[0.95] tracking-[-0.03em]">Deliverability</h1>
        <p className="mt-2 text-[var(--text-secondary)]">Domain verification, sender warmup, daily limits, tracking domains, and spam-score checks.</p>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card>
          <h2 className="font-sans text-[1.1rem] font-medium not-italic tracking-normal">Sending identities</h2>
          <div className="mt-5 space-y-4">
            {sendingIdentities.map((identity) => (
              <div key={identity.id} className="rounded border border-[var(--surface-border)] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">{identity.fromName}</div>
                    <div className="font-mono text-[0.7rem] text-[var(--text-tertiary)]">{identity.fromEmail} · {identity.provider}</div>
                  </div>
                  <Badge tone={identity.dnsVerified ? "green" : "red"}>{identity.dnsVerified ? "verified" : "domain blocked"}</Badge>
                </div>
                <div className="mt-4 overflow-hidden rounded border border-[var(--surface-border)]">
                  <Check label="SPF" pass={identity.dnsVerified} />
                  <Check label="DKIM" pass={identity.dnsVerified} />
                  <Check label="DMARC" pass={identity.dnsVerified} />
                </div>
                <div className="mt-4 h-2 rounded-full bg-[var(--surface-raised)]">
                  <div className="warmup-gradient h-2 rounded-full" style={{ width: `${Math.min(100, (identity.sentToday / Math.max(1, identity.dailyLimit)) * 100)}%` }} />
                </div>
                <div className="mt-2 font-mono text-[0.7rem] text-[var(--text-tertiary)]">{identity.sentToday}/{identity.dailyLimit} sent today · warmup {identity.warmupStage}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="alert-card">
          <div className="flex items-center gap-2 font-medium text-[var(--orange-dim)]">
            <ShieldCheck className="h-5 w-5" />
            Hard send block
          </div>
          <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
            Campaign launch remains disabled until SPF, DKIM, and DMARC all pass for the selected sending domain.
            Suppression, bounce, complaint, and unsubscribe checks also run before every queued message.
          </p>
          <Button className="mt-5 w-full" disabled>Verify DNS before launch</Button>
        </Card>
      </div>
    </div>
  );
}

function Check({ label, pass }: { label: string; pass: boolean }) {
  const record =
    label === "SPF"
      ? "v=spf1 include:_spf.google.com ~all"
      : label === "DKIM"
        ? "2048-bit RSA / selector: google"
        : pass
          ? "v=DMARC1; p=quarantine"
          : "Record not found";

  return (
    <div className="grid grid-cols-[20px_64px_minmax(0,1fr)_90px] items-center gap-3 border-b border-[var(--surface-border)] px-3 py-2 text-sm last:border-b-0">
      {pass ? <CheckCircle2 className="h-4 w-4 text-[var(--green)]" /> : <AlertTriangle className="h-4 w-4 text-[var(--red)]" />}
      <span className="font-medium">{label}</span>
      <span className="truncate font-mono text-[0.72rem] text-[var(--text-secondary)]">{record}</span>
      <span className={`text-right font-mono text-[0.7rem] ${pass ? "text-[var(--green)]" : "text-[var(--red)]"}`}>
        {pass ? "VERIFIED" : "BLOCKED"}
      </span>
    </div>
  );
}
