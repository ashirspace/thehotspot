import { Card } from "../../components/ui";

export function BlogPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-heading italic text-[clamp(2.6rem,5vw,5rem)] font-normal leading-[1] tracking-[-0.02em]">Outreach playbooks</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          ["How to warm up a new sending identity", "Deliverability basics before your first campaign."],
          ["Why reply events must stop every sequence", "Avoiding brand damage and duplicate sends."],
          ["AI personalization without hallucination", "Practical guardrails for high-confidence messages."],
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
