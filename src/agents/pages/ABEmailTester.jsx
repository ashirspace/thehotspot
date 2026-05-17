import { useState } from "react";
import { AgentCard, Section } from "../components/AgentCard.jsx";
import { Field, TextArea, RunButton } from "../components/AgentInput.jsx";
import { AgentStatus } from "../components/AgentStatus.jsx";
import { useAgent } from "../hooks/useAgent.js";
import { askClaude } from "../utils/anthropicClient.js";

const SYSTEM = `You are a cold email performance analyst. Compare two email variants and pick a winner.
Return your analysis in this exact format:

WINNER: [A or B]

WHY [WINNER] WINS
- [specific reason]
- [specific reason]
- [specific reason]

WHAT [LOSER] GETS WRONG
- [specific reason]
- [specific reason]

PREDICTED OPEN RATE
Email A: [X%] | Email B: [Y%]

PREDICTED REPLY RATE
Email A: [X%] | Email B: [Y%]

ONE IMPROVEMENT FOR THE WINNER
[Single concrete suggestion to improve it further]`;

async function runABTest({ emailA, emailB }) {
  const prompt = `Compare these two cold email variants:

=== EMAIL A ===
${emailA}

=== EMAIL B ===
${emailB}

Evaluate: subject line quality, hook strength, value clarity, CTA effectiveness, tone, length.`;
  return await askClaude(SYSTEM, prompt, 700);
}

export default function ABEmailTester() {
  const [emailA, setEmailA] = useState("");
  const [emailB, setEmailB] = useState("");
  const { loading, result, error, run } = useAgent(runABTest);

  const winner = result?.match(/WINNER:\s*([AB])/i)?.[1];

  return (
    <AgentCard
      title="A/B Email Tester"
      description="Paste two email variants and get an AI verdict on which will perform better — and why."
    >
      <Section>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Email A">
            <TextArea value={emailA} onChange={setEmailA} placeholder="Paste your first email variant..." rows={10} disabled={loading} />
          </Field>
          <Field label="Email B">
            <TextArea value={emailB} onChange={setEmailB} placeholder="Paste your second email variant..." rows={10} disabled={loading} />
          </Field>
        </div>
        <RunButton onClick={() => run({ emailA, emailB })} loading={loading} label="Compare Emails" />
      </Section>

      <AgentStatus loading={loading} error={error} />

      {result && (
        <div className="flex flex-col gap-3">
          {winner && (
            <div className="flex items-center gap-3 bg-accent/10 border border-accent/30 rounded-lg px-5 py-3">
              <span className="text-2xl font-bold text-accent">Email {winner} Wins</span>
            </div>
          )}
          <div className="bg-card border border-line rounded-lg p-4 text-sm text-foreground whitespace-pre-wrap leading-relaxed">
            {result}
          </div>
        </div>
      )}
    </AgentCard>
  );
}
