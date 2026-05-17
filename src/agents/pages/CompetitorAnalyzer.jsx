import { useState } from "react";
import { AgentCard, Section } from "../components/AgentCard.jsx";
import { Field, TextInput, RunButton } from "../components/AgentInput.jsx";
import { AgentStatus } from "../components/AgentStatus.jsx";
import { useAgent } from "../hooks/useAgent.js";
import { askClaude } from "../utils/anthropicClient.js";

const SYSTEM = `You are a competitive intelligence analyst. Produce a detailed SWOT analysis.
Return in this exact format (use plain text, no markdown tables):

STRENGTHS
- [point]
- [point]
- [point]

WEAKNESSES
- [point]
- [point]
- [point]

OPPORTUNITIES (for us to exploit against them)
- [point]
- [point]
- [point]

THREATS (risks if we compete with them)
- [point]
- [point]

POSITIONING INSIGHT
[1-2 sentences: how to position against this competitor in outreach]`;

async function runCompetitorAnalyzer({ company, ourOffer }) {
  const prompt = `Analyze ${company} as a competitor.
${ourOffer ? `Our offer/angle: ${ourOffer}` : ""}
Include: their business model, target audience, pricing signals, marketing approach, known weaknesses.`;
  return await askClaude(SYSTEM, prompt, 900);
}

export default function CompetitorAnalyzer() {
  const [company, setCompany] = useState("");
  const [ourOffer, setOurOffer] = useState("");
  const { loading, result, error, run } = useAgent(runCompetitorAnalyzer);

  const sections = result
    ? ["STRENGTHS", "WEAKNESSES", "OPPORTUNITIES", "THREATS", "POSITIONING INSIGHT"].map(key => {
        const match = result.match(new RegExp(`${key}\\n([\\s\\S]*?)(?=\\n[A-Z ]{5,}\\n|$)`));
        return match ? { key, content: match[1].trim() } : null;
      }).filter(Boolean)
    : [];

  const sectionColor = {
    STRENGTHS: "border-emerald-800 text-emerald-400",
    WEAKNESSES: "border-red-800 text-red-400",
    OPPORTUNITIES: "border-blue-800 text-blue-400",
    THREATS: "border-amber-800 text-amber-400",
    "POSITIONING INSIGHT": "border-purple-800 text-purple-400",
  };

  return (
    <AgentCard
      title="Competitor Analyzer"
      description="Get a full SWOT analysis of any competitor and a positioning insight for your outreach."
    >
      <Section>
        <Field label="Competitor Name *">
          <TextInput value={company} onChange={setCompany} placeholder="e.g. HubSpot, Salesforce, Mailchimp" disabled={loading} />
        </Field>
        <Field label="Your Offer (optional)">
          <TextInput value={ourOffer} onChange={setOurOffer} placeholder="e.g. Performance marketing for SaaS brands" disabled={loading} />
        </Field>
        <RunButton onClick={() => run({ company, ourOffer })} loading={loading} label="Analyze Competitor" />
      </Section>

      <AgentStatus loading={loading} error={error} />

      {sections.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {sections.map(({ key, content }) => (
            <div key={key} className={`bg-card border rounded-lg p-4 ${sectionColor[key]?.split(" ")[0] || "border-line"} ${key === "POSITIONING INSIGHT" ? "col-span-2" : ""}`}>
              <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${sectionColor[key]?.split(" ")[1] || "text-muted"}`}>{key}</p>
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{content}</p>
            </div>
          ))}
        </div>
      )}
    </AgentCard>
  );
}
