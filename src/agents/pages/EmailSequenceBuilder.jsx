import { useState } from "react";
import { AgentCard, Section } from "../components/AgentCard.jsx";
import { Field, TextInput, TextArea, Select, RunButton } from "../components/AgentInput.jsx";
import { AgentStatus } from "../components/AgentStatus.jsx";
import { useAgent } from "../hooks/useAgent.js";
import { askClaude } from "../utils/anthropicClient.js";

const STEP_OPTIONS = [
  { value: "2", label: "2 emails" },
  { value: "3", label: "3 emails" },
  { value: "4", label: "4 emails" },
  { value: "5", label: "5 emails" },
];

const SYSTEM = `You are an expert B2B cold email copywriter. Write cold email sequences that feel personal, not robotic.
Rules: No clichés ("touch base", "hope this finds you well", "synergy"). No em dashes. Short emails. Peer-to-peer tone.
For each email, provide:
EMAIL [N] — Day [X]
Subject: [subject line]
[email body]
---`;

async function runSequenceBuilder({ company, angle, steps, senderName, senderCompany }) {
  const prompt = `Write a ${steps}-email cold outreach sequence for:

Target company: ${company}
Our angle/offer: ${angle}
Sender: ${senderName || "Ashir Ayaan"}, ${senderCompany || "thehotspot"}

Email 1 = initial cold email. Subsequent emails = short follow-ups referencing the previous email.
Space emails: Email 1 (Day 1), Email 2 (Day 4), Email 3 (Day 8), Email 4 (Day 14), Email 5 (Day 21).`;

  return await askClaude(SYSTEM, prompt, 1800);
}

export default function EmailSequenceBuilder() {
  const [company, setCompany] = useState("");
  const [angle, setAngle] = useState("");
  const [steps, setSteps] = useState("3");
  const [senderName, setSenderName] = useState("Ashir Ayaan");
  const [senderCompany, setSenderCompany] = useState("");
  const { loading, result, error, run } = useAgent(runSequenceBuilder);

  return (
    <AgentCard
      title="Email Sequence Builder"
      description="Generate a multi-step cold email sequence with follow-ups for any prospect."
    >
      <Section>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Target Company *">
            <TextInput value={company} onChange={setCompany} placeholder="e.g. Shopify" disabled={loading} />
          </Field>
          <Field label="Number of Emails">
            <Select value={steps} onChange={setSteps} options={STEP_OPTIONS} disabled={loading} />
          </Field>
        </div>
        <Field label="Pitch Angle / Offer *">
          <TextArea value={angle} onChange={setAngle} placeholder="e.g. We drive affiliate traffic to e-commerce brands through our owned media properties" rows={2} disabled={loading} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Your Name">
            <TextInput value={senderName} onChange={setSenderName} disabled={loading} />
          </Field>
          <Field label="Your Company">
            <TextInput value={senderCompany} onChange={setSenderCompany} disabled={loading} />
          </Field>
        </div>
        <RunButton onClick={() => run({ company, angle, steps, senderName, senderCompany })} loading={loading} label="Build Sequence" />
      </Section>

      <AgentStatus loading={loading} error={error} />

      {result && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-muted uppercase tracking-wide">Generated Sequence</p>
          {result.split("---").filter(s => s.trim()).map((email, i) => (
            <div key={i} className="bg-card border border-line rounded-lg p-4 text-sm text-foreground whitespace-pre-wrap leading-relaxed">
              {email.trim()}
            </div>
          ))}
          <button
            onClick={() => navigator.clipboard.writeText(result)}
            className="self-start text-xs text-muted hover:text-accent transition-colors"
          >
            Copy all emails
          </button>
        </div>
      )}
    </AgentCard>
  );
}
