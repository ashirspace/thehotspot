import { useState } from "react";
import { AgentCard, Section } from "../components/AgentCard.jsx";
import { Field, TextInput, RunButton } from "../components/AgentInput.jsx";
import { AgentStatus } from "../components/AgentStatus.jsx";
import { TextOutput } from "../components/AgentOutput.jsx";
import { useAgent } from "../hooks/useAgent.js";
import { askClaude } from "../utils/anthropicClient.js";

const SYSTEM = `You are a conversion rate optimization expert. Analyze landing pages and provide structured feedback.
Format your response exactly like this:

STRENGTHS
- [point]
- [point]

WEAKNESSES
- [point]
- [point]

CTA ASSESSMENT
[1-2 sentences on the call-to-action effectiveness]

QUICK WINS
- [specific actionable improvement]
- [specific actionable improvement]
- [specific actionable improvement]

Be specific. No generic advice.`;

async function runAnalyzer({ url }) {
  const prompt = `Analyze this landing page: ${url}

Evaluate: headline clarity, value proposition, social proof, CTA strength, trust signals, above-the-fold content, mobile considerations.`;
  return await askClaude(SYSTEM, prompt, 800);
}

export default function LandingPageAnalyzer() {
  const [url, setUrl] = useState("");
  const { loading, result, error, run } = useAgent(runAnalyzer);

  return (
    <AgentCard
      title="Landing Page Analyzer"
      description="Get a structured CRO audit of any landing page URL — strengths, weaknesses, and quick wins."
    >
      <Section>
        <Field label="Landing Page URL *">
          <TextInput value={url} onChange={setUrl} placeholder="https://example.com/landing" disabled={loading} />
        </Field>
        <RunButton onClick={() => run({ url })} loading={loading} label="Analyze Page" />
      </Section>

      <AgentStatus loading={loading} error={error} />
      <TextOutput text={result} label="Analysis" />
    </AgentCard>
  );
}
