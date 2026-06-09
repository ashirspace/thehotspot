import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Badge, Button, Card, Field, Input, Textarea } from "../../components/ui";
import { useTemplates } from "../../lib/data-hooks";

export function TemplatesPage() {
  const templatesQuery = useTemplates();
  const seedTemplates = templatesQuery.data ?? [];
  const [selectedId, setSelectedId] = useState("");
  const activeId = selectedId || seedTemplates[0]?.id || "";
  const active = seedTemplates.find((template) => template.id === activeId) || seedTemplates[0];
  const hasAiBlock = Boolean(active?.body.includes("{{ai:"));

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-heading italic text-[clamp(2.3rem,4vw,4rem)] font-normal leading-[1] tracking-[-0.02em]">Templates + AI Writer</h1>
        <p className="mt-2 text-slate-600">Variables, AI blocks, strict JSON generation, validation, and human-review flags.</p>
      </div>
      <section className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <Card className="p-3">
          {templatesQuery.isLoading ? (
            <div className="p-3 text-sm text-slate-500">Loading templates...</div>
          ) : templatesQuery.isError ? (
            <div className="p-3 text-sm text-red-700">Could not load templates.</div>
          ) : seedTemplates.length === 0 ? (
            <div className="p-3 text-sm text-slate-500">No templates yet.</div>
          ) : seedTemplates.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => setSelectedId(template.id)}
              className={`mb-2 w-full rounded-xl border p-3 text-left last:mb-0 ${activeId === template.id ? "border-[var(--orange)] bg-[rgba(13,148,136,0.08)]" : "border-slate-200 hover:bg-slate-50"}`}
            >
              <div className="font-semibold">{template.name}</div>
              <div className="mt-1 text-xs text-slate-500">{template.channel}</div>
            </button>
          ))}
        </Card>
        <Card>
          {active ? <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">{active.name}</h2>
            <div className="flex gap-2">
              <Badge tone={hasAiBlock ? "orange" : "slate"}>{hasAiBlock ? "AI block" : "static"}</Badge>
              <Badge>{active.channel}</Badge>
            </div>
          </div> : null}
          {active ? <div className="mt-5 grid gap-4">
            {active.subject ? <Field label="Subject"><Input defaultValue={active.subject} /></Field> : null}
            <Field label="Body"><Textarea defaultValue={active.body} className="min-h-44" /></Field>
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2 font-semibold">
                <Sparkles className="h-4 w-4 text-[var(--orange)]" />
                AI output contract
              </div>
              <pre className="overflow-auto rounded-lg bg-slate-950 p-3 text-xs text-slate-100">{`{ "subject": string, "body": string, "confidence": number }`}</pre>
              <p className="mt-2 text-sm text-slate-600">
                Output is rejected if fields are empty, too long, contain hallucinated links, or confidence is below threshold.
              </p>
            </div>
            <Button>Generate preview for selected lead</Button>
          </div> : <div className="text-sm text-slate-500">Create a template to start using the AI writer.</div>}
        </Card>
      </section>
    </div>
  );
}
