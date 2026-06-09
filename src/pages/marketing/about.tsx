import { Card } from "../../components/ui";

export function AboutPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="grid gap-10 border-b border-[var(--surface-border)] pb-14 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="precision-label text-[var(--teal-deep)]">About thehotspot</p>
          <h1 className="mt-5 font-heading text-[clamp(2.8rem,6vw,5.6rem)] leading-[0.95] tracking-[-0.03em]">Built for outbound that respects people.</h1>
        </div>
        <p className="self-end text-lg leading-8 text-[var(--text-secondary)]">
          thehotspot.in helps teams run targeted, compliant outreach without turning prospects into volume metrics. The
          product is designed around workspace isolation, sender health, human approval, and suppression-first automation.
        </p>
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {[
          ["Safety before scale", "No sequence step sends without checking suppression, sender limits, and reply/bounce state."],
          ["Official channels", "Social outreach uses official APIs where available, with LinkedIn kept human-in-the-loop."],
          ["Agency-ready", "Multi-workspace architecture keeps client data and sender identities isolated from day one."],
          ["Operator clarity", "Every campaign shows funnel metrics, lead timelines, and deliverability health."],
        ].map(([title, copy]) => (
          <Card key={title} className="p-6">
            <h2 className="font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{copy}</p>
          </Card>
        ))}
      </div>
    </main>
  );
}
