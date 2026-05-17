import { useState } from "react";
import { AgentCard, Section } from "../components/AgentCard.jsx";
import { Field, TextInput, TextArea, RunButton } from "../components/AgentInput.jsx";
import { AgentStatus } from "../components/AgentStatus.jsx";
import { ScoreOutput } from "../components/AgentOutput.jsx";
import { useAgent } from "../hooks/useAgent.js";
import { askClaude } from "../utils/anthropicClient.js";

const SYSTEM = `You are a B2B sales qualification expert. Score leads from 1 to 10.
Return ONLY valid JSON: {"score": <number 1-10>, "reasoning": "<2-3 sentences explaining the score>"}
Consider: company size fit, industry relevance, likely budget, decision-maker access, timing signals.`;

async function runLeadScoring({ company, context, ourOffer }) {
  const prompt = `Score this lead for our outreach:

Company: ${company}
Context / Info: ${context || "No additional context"}
Our Offer: ${ourOffer || "B2B partnership / performance marketing"}

Return JSON only.`;

  const text = await askClaude(SYSTEM, prompt, 300);
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Could not parse score from AI response");
  const { score, reasoning } = JSON.parse(match[0]);
  return { score: Number(score), reasoning };
}

export default function LeadScoring() {
  const [company, setCompany] = useState("");
  const [context, setContext] = useState("");
  const [ourOffer, setOurOffer] = useState("");
  const { loading, result, error, run } = useAgent(runLeadScoring);

  return (
    <AgentCard
      title="Lead Scoring"
      description="Get an AI score (1-10) and qualification reasoning for any prospect."
    >
      <Section>
        <Field label="Company Name *">
          <TextInput value={company} onChange={setCompany} placeholder="e.g. Shopify, Notion, Stripe" disabled={loading} />
        </Field>
        <Field label="Context / What you know">
          <TextArea value={context} onChange={setContext} placeholder="Industry, size, website, recent news, pain points..." rows={3} disabled={loading} />
        </Field>
        <Field label="Your Offer">
          <TextInput value={ourOffer} onChange={setOurOffer} placeholder="e.g. Performance marketing partnership" disabled={loading} />
        </Field>
        <RunButton onClick={() => run({ company, context, ourOffer })} loading={loading} label="Score This Lead" />
      </Section>

      <AgentStatus loading={loading} error={error} />

      {result && <ScoreOutput score={result.score} label={company} reasoning={result.reasoning} />}
    </AgentCard>
  );
}
