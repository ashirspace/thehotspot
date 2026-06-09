import { Card } from "../../components/ui";

export function BlogPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
      <p className="precision-label text-[var(--teal-deep)]">Resources</p>
      <h1 className="mt-5 font-heading text-[clamp(2.8rem,6vw,5.6rem)] leading-[0.95] tracking-[-0.03em]">Outreach playbooks</h1>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {[
          ["How to warm up a new sending identity", "Deliverability basics before your first campaign."],
          ["Why reply events must stop every sequence", "Avoiding brand damage and duplicate sends."],
          ["AI personalization without hallucination", "Practical guardrails for high-confidence messages."],
        ].map(([title, copy]) => (
          <Card key={title} className="p-6">
            <div className="mb-6 h-1 w-10 rounded-full bg-[var(--teal)]" />
            <h2 className="font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{copy}</p>
          </Card>
        ))}
      </div>
    </main>
  );
}
