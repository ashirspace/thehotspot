import { useState } from "react";
import { AgentCard, Section } from "../components/AgentCard.jsx";
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

const INTENT_COLORS = {
  "interested":     { bg: "bg-emerald-950/40", border: "border-emerald-800", text: "text-emerald-400" },
  "not interested": { bg: "bg-red-950/40",     border: "border-red-800",     text: "text-red-400"     },
  "objection":      { bg: "bg-amber-950/40",   border: "border-amber-800",   text: "text-amber-400"   },
  "question":       { bg: "bg-blue-950/40",    border: "border-blue-800",    text: "text-blue-400"    },
  "out of office":  { bg: "bg-zinc-900",       border: "border-zinc-700",    text: "text-zinc-400"    },
};

export default function ReplyDetector() {
  const [replyText, setReplyText] = useState("");
  const { loading, result, error, run } = useAgent(runReplyDetector);

  const intent = result?.match(/INTENT:\s*(.+)/i)?.[1]?.trim().toLowerCase();
  const colors = INTENT_COLORS[intent] || { bg: "bg-card", border: "border-line", text: "text-foreground" };

  const suggested = result?.match(/SUGGESTED RESPONSE\n([\s\S]+)/i)?.[1]?.trim();

  return (
    <AgentCard
      title="Reply Detector"
      description="Paste an email reply to classify the intent and get a ready-to-send response."
    >
      <Section>
        <Field label="Their Reply *">
          <TextArea value={replyText} onChange={setReplyText} placeholder="Paste the email reply here..." rows={8} disabled={loading} />
        </Field>
        <RunButton onClick={() => run({ replyText })} loading={loading} label="Analyze Reply" />
      </Section>

      <AgentStatus loading={loading} error={error} />

      {result && (
        <div className="flex flex-col gap-4">
          {intent && (
            <div className={`flex items-center gap-2 px-4 py-3 rounded-lg border ${colors.bg} ${colors.border}`}>
              <span className={`text-sm font-semibold ${colors.text} capitalize`}>{result.match(/INTENT:\s*(.+)/i)?.[1]?.trim()}</span>
              <span className="text-muted text-sm">— {result.match(/SENTIMENT:\s*(.+)/i)?.[1]?.trim()}</span>
            </div>
          )}
          <div className="bg-card border border-line rounded-lg p-4 text-sm text-foreground whitespace-pre-wrap leading-relaxed">
            {result.replace(/SUGGESTED RESPONSE[\s\S]+/, "").trim()}
          </div>
          {suggested && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-muted uppercase tracking-wide">Suggested Response</p>
              <div className="bg-card border border-accent/30 rounded-lg p-4 text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                {suggested}
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(suggested)}
                className="self-start text-xs text-muted hover:text-accent transition-colors"
              >
                Copy response
              </button>
            </div>
          )}
        </div>
      )}
    </AgentCard>
  );
}
