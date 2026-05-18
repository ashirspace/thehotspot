import { useState } from "react";
import { Swords, TrendingUp, TrendingDown, Target, AlertTriangle, Lightbulb } from "lucide-react";
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

function parseSection(text, key) {
  const match = text.match(new RegExp(`${key}[^\\n]*\\n([\\s\\S]*?)(?=\\n[A-Z ]{5,}\\n|$)`));
  return match ? match[1].trim() : null;
}

function parseBullets(content) {
  if (!content) return [];
  return content.split("\n").filter(l => l.trim().startsWith("-")).map(l => l.replace(/^-\s*/, "").trim());
}

const SWOT_CONFIG = [
  {
    key: "STRENGTHS", label: "Strengths", icon: TrendingUp,
    color: "#10b981", bg: "bg-emerald-950/30", border: "border-emerald-800/40",
    iconClass: "text-emerald-400", col: "col-start-1 row-start-1",
  },
  {
    key: "WEAKNESSES", label: "Weaknesses", icon: TrendingDown,
    color: "#ef4444", bg: "bg-red-950/30", border: "border-red-800/40",
    iconClass: "text-red-400", col: "col-start-2 row-start-1",
  },
  {
    key: "OPPORTUNITIES (for us to exploit against them)", label: "Opportunities", icon: Target,
    color: "#6366f1", bg: "bg-indigo-950/30", border: "border-indigo-800/40",
    iconClass: "text-indigo-400", col: "col-start-1 row-start-2",
  },
  {
    key: "THREATS (risks if we compete with them)", label: "Threats", icon: AlertTriangle,
    color: "#f59e0b", bg: "bg-amber-950/30", border: "border-amber-800/40",
    iconClass: "text-amber-400", col: "col-start-2 row-start-2",
  },
];

export default function CompetitorAnalyzer() {
  const [company, setCompany] = useState("");
  const [ourOffer, setOurOffer] = useState("");
  const { loading, result, error, run } = useAgent(runCompetitorAnalyzer);

  const sections = result
    ? SWOT_CONFIG.map(cfg => ({
        ...cfg,
        bullets: parseBullets(parseSection(result, cfg.key)),
      }))
    : [];

  const positioningInsight = result ? parseSection(result, "POSITIONING INSIGHT") : null;

  return (
    <div className="flex flex-col gap-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-xl border border-line bg-card">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/8 via-transparent to-transparent" />
        <div className="relative flex items-start gap-4 p-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-500/12 border border-indigo-500/20">
            <Swords className="h-6 w-6 text-indigo-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-foreground">Competitor Analyzer</h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/12 text-indigo-400 border border-indigo-500/20">AI Agent</span>
            </div>
            <p className="text-sm text-muted max-w-lg">Get a full SWOT analysis of any competitor and a positioning insight for your outreach campaigns.</p>
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="flex flex-col gap-4">
        <div className="bg-card border border-line rounded-xl p-5 flex flex-col gap-4">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider">Competitor Details</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Competitor Name *">
              <TextInput value={company} onChange={setCompany} placeholder="e.g. HubSpot, Salesforce, Mailchimp" disabled={loading} />
            </Field>
            <Field label="Your Offer (optional)">
              <TextInput value={ourOffer} onChange={setOurOffer} placeholder="e.g. Performance marketing for SaaS brands" disabled={loading} />
            </Field>
          </div>
        </div>
        <RunButton onClick={() => run({ company, ourOffer })} loading={loading} label="Analyze Competitor" />
      </div>

      <AgentStatus loading={loading} error={error} />

      {!loading && !result && !error && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-line border-dashed bg-card/40 py-16 gap-3">
          <Swords className="h-10 w-10 text-muted/40" />
          <p className="text-sm text-muted">Enter a competitor to generate their SWOT analysis</p>
        </div>
      )}

      {sections.length > 0 && (
        <div className="flex flex-col gap-4">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider">SWOT Analysis — <span className="text-indigo-400 normal-case font-normal">{company}</span></p>

          {/* 2x2 SWOT grid */}
          <div className="grid grid-cols-2 gap-3">
            {sections.map(({ key, label, icon: Icon, bg, border, iconClass, bullets }) => (
              <div key={key} className={`rounded-xl border p-4 ${bg} ${border}`}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon className={`h-4 w-4 ${iconClass}`} />
                  <span className={`text-xs font-semibold uppercase tracking-wider ${iconClass}`}>{label}</span>
                </div>
                <ul className="flex flex-col gap-1.5">
                  {bullets.map((bullet, i) => (
                    <li key={i} className="text-sm text-foreground leading-relaxed flex items-start gap-2">
                      <span className={`mt-1 h-1.5 w-1.5 rounded-full shrink-0 ${iconClass.replace("text-", "bg-")}`} />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Positioning insight */}
          {positioningInsight && (
            <div className="bg-card border border-indigo-500/20 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="h-4 w-4 text-indigo-400" />
                <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Positioning Insight</p>
              </div>
              <p className="text-sm text-foreground leading-relaxed">{positioningInsight}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
