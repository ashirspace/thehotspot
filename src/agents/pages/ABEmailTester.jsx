import { useState } from "react";
import { FlaskConical, Trophy, TrendingUp, TrendingDown, Copy } from "lucide-react";
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

function parseRates(result, key) {
  const match = result.match(new RegExp(`${key}\\nEmail A:\\s*([\\d.]+%).*Email B:\\s*([\\d.]+%)`, "i"));
  return match ? { a: match[1], b: match[2] } : null;
}

function parseBullets(text) {
  return text.split("\n").filter(l => l.trim().startsWith("-")).map(l => l.replace(/^-\s*/, "").trim());
}

function parseSection(result, key) {
  const match = result.match(new RegExp(`${key}\\n([\\s\\S]*?)(?=\\n[A-Z ]{4,}\\n|$)`));
  return match ? match[1].trim() : null;
}

export default function ABEmailTester() {
  const [emailA, setEmailA] = useState("");
  const [emailB, setEmailB] = useState("");
  const { loading, result, error, run } = useAgent(runABTest);

  const winner = result?.match(/WINNER:\s*([AB])/i)?.[1];
  const loser = winner === "A" ? "B" : winner === "B" ? "A" : null;
  const whyWins = winner ? parseSection(result, `WHY ${winner} WINS`) : null;
  const whatWrong = loser ? parseSection(result, `WHAT ${loser} GETS WRONG`) : null;
  const openRates = result ? parseRates(result, "PREDICTED OPEN RATE") : null;
  const replyRates = result ? parseRates(result, "PREDICTED REPLY RATE") : null;
  const improvement = result ? parseSection(result, "ONE IMPROVEMENT FOR THE WINNER") : null;

  return (
    <div className="flex flex-col gap-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-xl border border-line bg-card">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/8 via-transparent to-transparent" />
        <div className="relative flex items-start gap-4 p-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-pink-500/12 border border-pink-500/20">
            <FlaskConical className="h-6 w-6 text-pink-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-foreground">A/B Email Tester</h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-pink-500/12 text-pink-400 border border-pink-500/20">AI Agent</span>
            </div>
            <p className="text-sm text-muted max-w-lg">Paste two email variants and get an AI verdict on which will perform better — predicted open rates, reply rates, and why.</p>
          </div>
        </div>
      </div>

      {/* Input: side by side */}
      <div className="bg-card border border-line rounded-xl p-5 flex flex-col gap-4">
        <p className="text-xs font-semibold text-muted uppercase tracking-wider">Email Variants</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-pink-500/15 text-xs font-bold text-pink-400 border border-pink-500/20">A</span>
              <span className="text-sm font-medium text-foreground">Variant A</span>
            </div>
            <Field label="">
              <TextArea value={emailA} onChange={setEmailA} placeholder="Paste your first email variant..." rows={10} disabled={loading} />
            </Field>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/15 text-xs font-bold text-purple-400 border border-purple-500/20">B</span>
              <span className="text-sm font-medium text-foreground">Variant B</span>
            </div>
            <Field label="">
              <TextArea value={emailB} onChange={setEmailB} placeholder="Paste your second email variant..." rows={10} disabled={loading} />
            </Field>
          </div>
        </div>
      </div>
      <RunButton onClick={() => run({ emailA, emailB })} loading={loading} label="Compare Emails" />

      <AgentStatus loading={loading} error={error} />

      {!loading && !result && !error && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-line border-dashed bg-card/40 py-16 gap-3">
          <FlaskConical className="h-10 w-10 text-muted/40" />
          <p className="text-sm text-muted">Paste both variants to get your verdict</p>
        </div>
      )}

      {result && winner && (
        <div className="flex flex-col gap-4">
          {/* Winner banner */}
          <div className="relative overflow-hidden rounded-xl border border-pink-500/30 bg-pink-500/8 p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-500/15 border border-pink-500/25">
              <Trophy className="h-6 w-6 text-pink-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-pink-400 uppercase tracking-wider mb-0.5">Winner</p>
              <p className="text-2xl font-bold text-foreground">Email {winner}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Predicted rates */}
            {(openRates || replyRates) && (
              <div className="bg-card border border-line rounded-xl p-5 flex flex-col gap-4">
                <p className="text-xs font-semibold text-muted uppercase tracking-wider">Predicted Performance</p>
                {openRates && (
                  <div>
                    <p className="text-xs text-muted mb-2">Open Rate</p>
                    <div className="flex gap-3">
                      <div className={`flex-1 rounded-lg p-3 text-center ${winner === "A" ? "bg-pink-500/12 border border-pink-500/20" : "bg-surface border border-line"}`}>
                        <p className="text-xs text-muted mb-1">Email A</p>
                        <p className={`text-lg font-bold ${winner === "A" ? "text-pink-400" : "text-foreground"}`}>{openRates.a}</p>
                      </div>
                      <div className={`flex-1 rounded-lg p-3 text-center ${winner === "B" ? "bg-pink-500/12 border border-pink-500/20" : "bg-surface border border-line"}`}>
                        <p className="text-xs text-muted mb-1">Email B</p>
                        <p className={`text-lg font-bold ${winner === "B" ? "text-pink-400" : "text-foreground"}`}>{openRates.b}</p>
                      </div>
                    </div>
                  </div>
                )}
                {replyRates && (
                  <div>
                    <p className="text-xs text-muted mb-2">Reply Rate</p>
                    <div className="flex gap-3">
                      <div className={`flex-1 rounded-lg p-3 text-center ${winner === "A" ? "bg-pink-500/12 border border-pink-500/20" : "bg-surface border border-line"}`}>
                        <p className="text-xs text-muted mb-1">Email A</p>
                        <p className={`text-lg font-bold ${winner === "A" ? "text-pink-400" : "text-foreground"}`}>{replyRates.a}</p>
                      </div>
                      <div className={`flex-1 rounded-lg p-3 text-center ${winner === "B" ? "bg-pink-500/12 border border-pink-500/20" : "bg-surface border border-line"}`}>
                        <p className="text-xs text-muted mb-1">Email B</p>
                        <p className={`text-lg font-bold ${winner === "B" ? "text-pink-400" : "text-foreground"}`}>{replyRates.b}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Why winner wins */}
            {whyWins && (
              <div className="bg-card border border-emerald-800/40 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                  <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Why Email {winner} Wins</p>
                </div>
                <ul className="flex flex-col gap-2">
                  {parseBullets(whyWins).map((line, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground leading-relaxed">
                      <span className="text-emerald-400 mt-0.5 shrink-0">+</span>{line}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* What loser gets wrong */}
          {whatWrong && (
            <div className="bg-card border border-red-800/30 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown className="h-4 w-4 text-red-400" />
                <p className="text-xs font-semibold text-red-400 uppercase tracking-wider">What Email {loser} Gets Wrong</p>
              </div>
              <ul className="flex flex-col gap-2">
                {parseBullets(whatWrong).map((line, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground leading-relaxed">
                    <span className="text-red-400 mt-0.5 shrink-0">-</span>{line}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* One improvement */}
          {improvement && (
            <div className="bg-card border border-amber-800/30 rounded-xl p-5">
              <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">One Improvement for Email {winner}</p>
              <p className="text-sm text-foreground leading-relaxed">{improvement}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
