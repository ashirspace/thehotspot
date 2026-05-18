import { useState } from "react";
import { Inbox, MessageSquare, Copy, Check } from "lucide-react";
import { Field, TextArea, RunButton } from "../components/AgentInput.jsx";
import { AgentStatus } from "../components/AgentStatus.jsx";
import { useAgent } from "../hooks/useAgent.js";
import { askClaude } from "../utils/anthropicClient.js";

const SYSTEM = `You are a B2B sales communication expert. Analyze reply emails and classify intent, then suggest the best response.
Return in this exact format:

INTENT: [Interested / Not Interested / Objection / Question / Out of Office / Unsubscribe / Other]
SENTIMENT: [Positive / Neutral / Negative]

SUMMARY
[1 sentence explaining what they actually said]

SUGGESTED RESPONSE
[Write the full reply email, ready to send. Short, direct, peer tone. No em dashes. No clichés.]`;

async function runReplyDetector({ replyText }) {
  const prompt = `Analyze this reply to a cold email:\n\n${replyText}`;
  return await askClaude(SYSTEM, prompt, 600);
}

const INTENT_CONFIG = {
  "interested":     { color: "#10b981", bg: "bg-emerald-950/40", border: "border-emerald-800/50", label: "Interested" },
  "not interested": { color: "#ef4444", bg: "bg-red-950/40",     border: "border-red-800/50",     label: "Not Interested" },
  "objection":      { color: "#f59e0b", bg: "bg-amber-950/40",   border: "border-amber-800/50",   label: "Objection" },
  "question":       { color: "#0ea5e9", bg: "bg-sky-950/40",     border: "border-sky-800/50",     label: "Question" },
  "out of office":  { color: "#6b7280", bg: "bg-zinc-900",       border: "border-zinc-700/50",    label: "Out of Office" },
  "unsubscribe":    { color: "#f97316", bg: "bg-orange-950/40",  border: "border-orange-800/50",  label: "Unsubscribe" },
};

const SENTIMENT_CONFIG = {
  "positive": { color: "#10b981", label: "Positive" },
  "neutral":  { color: "#6b7280", label: "Neutral" },
  "negative": { color: "#ef4444", label: "Negative" },
};

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1800); }}
      className="flex items-center gap-1.5 text-xs text-muted hover:text-orange-400 transition-colors"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-orange-400" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : "Copy response"}
    </button>
  );
}

export default function ReplyDetector() {
  const [replyText, setReplyText] = useState("");
  const { loading, result, error, run } = useAgent(runReplyDetector);

  const intentRaw = result?.match(/INTENT:\s*(.+)/i)?.[1]?.trim().toLowerCase();
  const sentimentRaw = result?.match(/SENTIMENT:\s*(.+)/i)?.[1]?.trim().toLowerCase();
  const summary = result?.match(/SUMMARY\n([\s\S]*?)(?=\nSUGGESTED RESPONSE|$)/i)?.[1]?.trim();
  const suggested = result?.match(/SUGGESTED RESPONSE\n([\s\S]+)/i)?.[1]?.trim();

  const intentCfg = INTENT_CONFIG[intentRaw] || { color: "#6b7280", bg: "bg-card", border: "border-line", label: intentRaw || "Unknown" };
  const sentimentCfg = SENTIMENT_CONFIG[sentimentRaw] || { color: "#6b7280", label: sentimentRaw || "Unknown" };

  return (
    <div className="flex flex-col gap-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-xl border border-line bg-card">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/8 via-transparent to-transparent" />
        <div className="relative flex items-start gap-4 p-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500/12 border border-orange-500/20">
            <Inbox className="h-6 w-6 text-orange-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-foreground">Reply Detector</h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-500/12 text-orange-400 border border-orange-500/20">AI Agent</span>
            </div>
            <p className="text-sm text-muted max-w-lg">Paste an email reply to instantly classify intent and sentiment — plus get a ready-to-send response.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start">
        {/* Input panel */}
        <div className="flex flex-col gap-4">
          <div className="bg-card border border-line rounded-xl p-5 flex flex-col gap-4">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">Reply Email</p>
            <Field label="Their Reply *">
              <TextArea value={replyText} onChange={setReplyText} placeholder="Paste the email reply here..." rows={10} disabled={loading} />
            </Field>
          </div>
          <RunButton onClick={() => run({ replyText })} loading={loading} label="Analyze Reply" />
        </div>

        {/* Output panel */}
        <div className="flex flex-col gap-4">
          <AgentStatus loading={loading} error={error} />

          {!loading && !result && !error && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-line border-dashed bg-card/40 py-16 gap-3">
              <MessageSquare className="h-10 w-10 text-muted/40" />
              <p className="text-sm text-muted">Paste a reply to analyze intent</p>
            </div>
          )}

          {result && (
            <div className="flex flex-col gap-4">
              {/* Intent + Sentiment */}
              {intentRaw && (
                <div className={`rounded-xl border p-5 ${intentCfg.bg} ${intentCfg.border}`}>
                  <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Classification</p>
                  <div className="flex items-center gap-4 flex-wrap">
                    <div>
                      <p className="text-xs text-muted mb-1">Intent</p>
                      <span className="text-xl font-bold" style={{ color: intentCfg.color }}>{intentCfg.label}</span>
                    </div>
                    <div className="w-px h-8 bg-line" />
                    <div>
                      <p className="text-xs text-muted mb-1">Sentiment</p>
                      <span className="text-xl font-bold" style={{ color: sentimentCfg.color }}>{sentimentCfg.label}</span>
                    </div>
                  </div>
                  {summary && (
                    <div className="mt-4 pt-4 border-t border-line/50">
                      <p className="text-xs text-muted mb-1">Summary</p>
                      <p className="text-sm text-foreground leading-relaxed">{summary}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Suggested response */}
              {suggested && (
                <div className="bg-card border border-orange-500/20 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-line bg-orange-500/5">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-orange-400" />
                      <span className="text-xs font-semibold text-orange-400 uppercase tracking-wider">Suggested Response</span>
                    </div>
                    <CopyButton text={suggested} />
                  </div>
                  <div className="p-4 text-sm text-foreground whitespace-pre-wrap leading-relaxed">{suggested}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
