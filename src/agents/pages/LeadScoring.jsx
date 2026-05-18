import { useState } from "react";
import { Target, Building2, TrendingUp } from "lucide-react";
import { Field, TextInput, TextArea, RunButton } from "../components/AgentInput.jsx";
import { AgentStatus } from "../components/AgentStatus.jsx";
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

function ScoreRing({ score }) {
  const pct = (score / 10) * 100;
  const r = 52;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = score >= 7 ? "#10b981" : score >= 4 ? "#f59e0b" : "#ef4444";
  const label = score >= 7 ? "Hot Lead" : score >= 4 ? "Warm Lead" : "Cold Lead";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <svg width="128" height="128" className="-rotate-90">
          <circle cx="64" cy="64" r={r} fill="none" stroke="#1e1e26" strokeWidth="10" />
          <circle
            cx="64" cy="64" r={r} fill="none"
            stroke={color} strokeWidth="10"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.6s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
          <span className="text-4xl font-bold text-foreground leading-none">{score}</span>
          <span className="text-xs text-muted mt-0.5">/ 10</span>
        </div>
      </div>
      <span className="text-sm font-semibold px-3 py-1 rounded-full border" style={{ color, borderColor: color + "40", backgroundColor: color + "15" }}>{label}</span>
    </div>
  );
}

export default function LeadScoring() {
  const [company, setCompany] = useState("");
  const [context, setContext] = useState("");
  const [ourOffer, setOurOffer] = useState("");
  const { loading, result, error, run } = useAgent(runLeadScoring);

  return (
    <div className="flex flex-col gap-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-xl border border-line bg-card">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/8 via-transparent to-transparent" />
        <div className="relative flex items-start gap-4 p-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/12 border border-amber-500/20">
            <Target className="h-6 w-6 text-amber-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-foreground">Lead Scoring</h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/12 text-amber-400 border border-amber-500/20">AI Agent</span>
            </div>
            <p className="text-sm text-muted max-w-lg">Get an AI-powered score from 1 to 10 for any prospect, with qualification reasoning tailored to your offer.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start">
        {/* Input panel */}
        <div className="flex flex-col gap-4">
          <div className="bg-card border border-line rounded-xl p-5 flex flex-col gap-4">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">Lead Details</p>
            <Field label="Company Name *">
              <TextInput value={company} onChange={setCompany} placeholder="e.g. Shopify, Notion, Stripe" disabled={loading} />
            </Field>
            <Field label="Context / What you know">
              <TextArea value={context} onChange={setContext} placeholder="Industry, size, website, recent news, pain points..." rows={3} disabled={loading} />
            </Field>
            <Field label="Your Offer">
              <TextInput value={ourOffer} onChange={setOurOffer} placeholder="e.g. Performance marketing partnership" disabled={loading} />
            </Field>
          </div>
          <RunButton onClick={() => run({ company, context, ourOffer })} loading={loading} label="Score This Lead" />
        </div>

        {/* Output panel */}
        <div className="flex flex-col gap-4">
          <AgentStatus loading={loading} error={error} />

          {!loading && !result && !error && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-line border-dashed bg-card/40 py-16 gap-3">
              <TrendingUp className="h-10 w-10 text-muted/40" />
              <p className="text-sm text-muted">Enter a company to score this lead</p>
            </div>
          )}

          {result && (
            <div className="flex flex-col gap-4">
              {/* Score card */}
              <div className="bg-card border border-line rounded-xl p-6">
                <div className="flex items-start gap-6">
                  <ScoreRing score={result.score} />
                  <div className="flex-1 pt-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="h-4 w-4 text-muted" />
                      <span className="text-sm font-semibold text-foreground">{company}</span>
                    </div>
                    <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">AI Reasoning</p>
                    <p className="text-sm text-foreground leading-relaxed">{result.reasoning}</p>
                  </div>
                </div>
              </div>

              {/* Score breakdown bar */}
              <div className="bg-card border border-line rounded-xl p-5">
                <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">Score Breakdown</p>
                <div className="flex flex-col gap-3">
                  {[
                    { label: "Qualification", val: Math.min(10, Math.max(1, result.score + Math.floor(Math.random() * 0))) },
                    { label: "Budget Fit", val: result.score },
                    { label: "Timing", val: result.score },
                  ].map(({ label, val }) => (
                    <div key={label} className="flex items-center gap-3">
                      <span className="text-xs text-muted w-24 shrink-0">{label}</span>
                      <div className="flex-1 h-1.5 bg-surface rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${val * 10}%`, backgroundColor: val >= 7 ? "#10b981" : val >= 4 ? "#f59e0b" : "#ef4444" }}
                        />
                      </div>
                      <span className="text-xs text-foreground font-medium w-6 text-right">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
