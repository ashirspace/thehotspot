import { useState } from "react";
import { GitBranch, Plus, Timer } from "lucide-react";
import { Badge, Button, Card, Field, Input, Textarea } from "../../components/ui";
import { sequenceSteps as initialSteps, templates } from "../../data/demo";
import type { SequenceStep } from "../../types";

export function SequenceBuilderPage() {
  const [steps, setSteps] = useState<SequenceStep[]>(initialSteps);

  function addWait() {
    setSteps((current) => [
      ...current,
      {
        id: `step-${current.length + 1}`,
        type: "wait",
        channel: "email",
        delayHours: 48,
        label: "Wait 2 business days",
      },
    ]);
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-heading italic text-[clamp(2.5rem,4vw,4.5rem)] font-normal leading-[0.95] tracking-[-0.03em]">Sequence Builder</h1>
        <p className="mt-2 text-[var(--text-secondary)]">Visual multi-step flow with email, wait, follow-up, and human-approved DM steps.</p>
      </div>
      <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <Card>
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2 font-medium">
              <GitBranch className="h-5 w-5 text-[var(--orange)]" />
              SaaS founder outbound
            </div>
            <Button variant="secondary" onClick={addWait}><Plus className="h-4 w-4" /> Add wait</Button>
          </div>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`relative ml-8 rounded border border-[var(--surface-border)] bg-[var(--surface-base)] p-4 pl-5 ${
                  step.type === "email"
                    ? "border-l-[3px] border-l-[var(--teal)]"
                    : step.type === "dm"
                      ? "border-l-[3px] border-l-[var(--orange)]"
                      : "translate-x-4 border-dashed border-l-[3px] border-l-[var(--amber)] bg-[var(--surface-raised)]"
                }`}
              >
                <div className="absolute -left-10 top-2 font-heading text-5xl italic leading-none text-[var(--surface-border)]">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="precision-label">Step {index + 1}</div>
                    <div className="mt-1 text-[1.1rem] font-medium leading-[1.3]">{step.label}</div>
                  </div>
                  <div className="flex gap-2">
                    <Badge tone={step.type === "dm" ? "teal" : step.type === "wait" ? "slate" : "orange"}>{step.type}</Badge>
                    <Badge>{step.channel}</Badge>
                  </div>
                </div>
                {step.type === "wait" ? (
                  <div className="mt-3 flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <Timer className="h-4 w-4" />
                    Scheduler waits {step.delayHours} hours and re-checks reply, bounce, unsubscribe, pause, and daily limit state.
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-[var(--text-secondary)]">Template: {templates.find((template) => template.id === step.templateId)?.name}</p>
                )}
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="font-sans text-[1.1rem] font-medium not-italic tracking-normal">Launch readiness</h2>
          <div className="mt-4 grid gap-3">
            {[
              ["Suppression check before every send", true],
              ["Reply/bounce halts remaining steps", true],
              ["Idempotency key per message step", true],
              ["Domain DNS verified", false],
            ].map(([label, pass]) => (
              <div key={String(label)} className="flex items-center justify-between rounded border border-[var(--surface-border)] bg-[var(--surface-raised)] p-3 text-sm">
                <span className="text-[var(--text-secondary)]">{label}</span>
                <span className={`font-mono text-[0.7rem] ${pass ? "text-[var(--green)]" : "text-[var(--red)]"}`}>
                  {pass ? "[PASS]" : "[BLOCKED]"}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-4">
            <Field label="Campaign name"><Input defaultValue="SaaS founder outbound" /></Field>
            <Field label="Tone guide"><Textarea defaultValue="Concise, specific, no hype, no invented facts, no fake familiarity." /></Field>
            <Button disabled className="border-2 border-[var(--red)] bg-transparent text-[var(--red)] opacity-100 hover:bg-transparent">Launch blocked until DNS passes</Button>
          </div>
        </Card>
      </section>
    </div>
  );
}
