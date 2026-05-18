import { useState } from "react";
import { Globe, CheckCircle2, XCircle, MousePointerClick, Zap, ScanSearch } from "lucide-react";
import { Field, TextInput, RunButton } from "../components/AgentInput.jsx";
import { AgentStatus } from "../components/AgentStatus.jsx";
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

function parseSection(text, key) {
  const match = text.match(new RegExp(`${key}\\n([\\s\\S]*?)(?=\\n[A-Z ]{3,}\\n|$)`));
  return match ? match[1].trim() : null;
}

function BulletList({ content, icon: Icon, iconClass }) {
  const lines = content.split("\n").filter(l => l.trim().startsWith("-")).map(l => l.replace(/^-\s*/, "").trim());
  return (
    <ul className="flex flex-col gap-2">
      {lines.map((line, i) => (
        <li key={i} className="flex items-start gap-2.5 text-sm text-foreground leading-relaxed">
          <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${iconClass}`} />
          {line}
        </li>
      ))}
    </ul>
  );
}

export default function LandingPageAnalyzer() {
  const [url, setUrl] = useState("");
  const { loading, result, error, run } = useAgent(runAnalyzer);

  const strengths = result ? parseSection(result, "STRENGTHS") : null;
  const weaknesses = result ? parseSection(result, "WEAKNESSES") : null;
  const ctaAssessment = result ? parseSection(result, "CTA ASSESSMENT") : null;
  const quickWins = result ? parseSection(result, "QUICK WINS") : null;

  return (
    <div className="flex flex-col gap-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-xl border border-line bg-card">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-500/8 via-transparent to-transparent" />
        <div className="relative flex items-start gap-4 p-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-500/12 border border-sky-500/20">
            <ScanSearch className="h-6 w-6 text-sky-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-foreground">Landing Page Analyzer</h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-500/12 text-sky-400 border border-sky-500/20">AI Agent</span>
            </div>
            <p className="text-sm text-muted max-w-lg">Get a structured CRO audit of any landing page — strengths, weaknesses, CTA assessment, and quick wins.</p>
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="flex flex-col gap-4">
        <div className="bg-card border border-line rounded-xl p-5 flex flex-col gap-4">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider">Page to Analyze</p>
          <Field label="Landing Page URL *">
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
              <input
                className="w-full bg-surface border border-line rounded-lg pl-9 pr-3 py-2 text-sm text-foreground placeholder-muted focus:outline-none focus:border-sky-500/50 disabled:opacity-50"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://example.com/landing"
                disabled={loading}
              />
            </div>
          </Field>
        </div>
        <RunButton onClick={() => run({ url })} loading={loading} label="Analyze Page" />
      </div>

      <AgentStatus loading={loading} error={error} />

      {!loading && !result && !error && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-line border-dashed bg-card/40 py-16 gap-3">
          <Globe className="h-10 w-10 text-muted/40" />
          <p className="text-sm text-muted">Enter a URL to get your CRO audit</p>
        </div>
      )}

      {result && (
        <div className="flex flex-col gap-4">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider">Audit Results — <span className="text-sky-400 normal-case font-normal">{url}</span></p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths */}
            {strengths && (
              <div className="bg-card border border-emerald-800/40 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Strengths</span>
                </div>
                <BulletList content={strengths} icon={CheckCircle2} iconClass="text-emerald-400" />
              </div>
            )}

            {/* Weaknesses */}
            {weaknesses && (
              <div className="bg-card border border-red-800/40 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <XCircle className="h-4 w-4 text-red-400" />
                  <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">Weaknesses</span>
                </div>
                <BulletList content={weaknesses} icon={XCircle} iconClass="text-red-400" />
              </div>
            )}
          </div>

          {/* CTA Assessment */}
          {ctaAssessment && (
            <div className="bg-card border border-sky-800/40 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <MousePointerClick className="h-4 w-4 text-sky-400" />
                <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider">CTA Assessment</span>
              </div>
              <p className="text-sm text-foreground leading-relaxed">{ctaAssessment}</p>
            </div>
          )}

          {/* Quick Wins */}
          {quickWins && (
            <div className="bg-card border border-amber-800/40 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="h-4 w-4 text-amber-400" />
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Quick Wins</span>
              </div>
              <BulletList content={quickWins} icon={Zap} iconClass="text-amber-400" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
