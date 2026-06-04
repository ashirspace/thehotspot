import { Card } from "../../components/ui";

export function AboutPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-heading italic text-[clamp(2.6rem,5vw,5rem)] font-normal leading-[1] tracking-[-0.02em]">Built for outbound that respects people.</h1>
      <p className="mt-5 text-lg leading-8 text-slate-600">
        thehotspot.in helps teams run targeted, compliant outreach without turning prospects into volume metrics. The
        product is designed around workspace isolation, sender health, human approval, and suppression-first automation.
      </p>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {[
          ["Safety before scale", "No sequence step sends without checking suppression, sender limits, and reply/bounce state."],
          ["Official channels", "Social outreach uses official APIs where available, with LinkedIn kept human-in-the-loop."],
          ["Agency-ready", "Multi-workspace architecture keeps client data and sender identities isolated from day one."],
          ["Operator clarity", "Every campaign shows funnel metrics, lead timelines, and deliverability health."],
        ].map(([title, copy]) => (
          <Card key={title}>
            <h2 className="font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p>
          </Card>
        ))}
      </div>
    </main>
  );
}
