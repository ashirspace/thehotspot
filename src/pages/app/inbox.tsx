import { useState } from "react";
import { Badge, Button, Card, Textarea } from "../../components/ui";
import { inboxThreads } from "../../data/demo";

export function InboxPage() {
  const [activeId, setActiveId] = useState(inboxThreads[0].id);
  const active = inboxThreads.find((thread) => thread.id === activeId) || inboxThreads[0];

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-heading italic text-[clamp(2.3rem,4vw,4rem)] font-normal leading-[1] tracking-[-0.02em]">Unified reply inbox</h1>
        <p className="mt-2 text-slate-600">Handle replies, intent, and next steps without leaving the campaign workspace.</p>
      </div>
      <section className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <Card className="p-3">
          <div className="space-y-2">
            {inboxThreads.map((thread) => (
              <button
                key={thread.id}
                type="button"
                onClick={() => setActiveId(thread.id)}
                className={`w-full rounded-xl border p-3 text-left transition ${activeId === thread.id ? "border-[var(--orange)] bg-[rgba(254,110,0,0.08)]" : "border-slate-200 hover:bg-slate-50"}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{thread.leadName}</span>
                  <span className="text-xs text-slate-500">{thread.lastActivity}</span>
                </div>
                <div className="mt-1 text-xs text-slate-500">{thread.company} · {thread.channel}</div>
                <p className="mt-2 line-clamp-2 text-sm text-slate-600">{thread.preview}</p>
              </button>
            ))}
          </div>
        </Card>
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">{active.leadName}</h2>
              <p className="text-sm text-slate-500">{active.company} · {active.channel}</p>
            </div>
            <Badge tone={active.intent === "interested" ? "green" : active.intent === "pricing" ? "orange" : "slate"}>{active.intent}</Badge>
          </div>
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
            {active.preview}
          </div>
          <div className="mt-6 grid gap-3">
            <Textarea placeholder="Write a reply..." defaultValue="Thanks for the context. I can send a concise overview and a deliverability checklist. Would a 15-minute walkthrough next week be useful?" />
            <div className="flex justify-end gap-2">
              <Button variant="secondary">Insert template</Button>
              <Button>Send reply</Button>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
