import { useState } from "react";
import { Layers, Mail, Copy, Check, Calendar } from "lucide-react";
import { Field, TextInput, TextArea, Select, RunButton } from "../components/AgentInput.jsx";
import { AgentStatus } from "../components/AgentStatus.jsx";
import { useAgent } from "../hooks/useAgent.js";
import { askClaude } from "../utils/anthropicClient.js";

const STEP_OPTIONS = [
  { value: "2", label: "2 emails" },
  { value: "3", label: "3 emails" },
  { value: "4", label: "4 emails" },
  { value: "5", label: "5 emails" },
];

const SYSTEM = `You are an expert B2B cold email copywriter. Write cold email sequences that feel personal, not robotic.
Rules: No clichés ("touch base", "hope this finds you well", "synergy"). No em dashes. Short emails. Peer-to-peer tone.
For each email, provide:
EMAIL [N] — Day [X]
Subject: [subject line]
[email body]
---`;

async function runSequenceBuilder({ company, angle, steps, senderName, senderCompany }) {
  const prompt = `Write a ${steps}-email cold outreach sequence for:

Target company: ${company}
Our angle/offer: ${angle}
Sender: ${senderName || "Ashir Ayaan"}, ${senderCompany || "thehotspot"}

Email 1 = initial cold email. Subsequent emails = short follow-ups referencing the previous email.
Space emails: Email 1 (Day 1), Email 2 (Day 4), Email 3 (Day 8), Email 4 (Day 14), Email 5 (Day 21).`;

  return await askClaude(SYSTEM, prompt, 1800);
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs text-muted hover:text-purple-400 transition-colors">
      {copied ? <Check className="h-3.5 w-3.5 text-purple-400" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function parseEmail(block) {
  const headerMatch = block.match(/EMAIL\s+(\d+)[^\n]*Day\s+(\d+)/i);
  const subjectMatch = block.match(/Subject:\s*(.+)/i);
  const body = block.replace(/EMAIL\s+\d+[^\n]*/i, "").replace(/Subject:\s*.+\n?/, "").trim();
  return {
    num: headerMatch?.[1] || "?",
    day: headerMatch?.[2] || "?",
    subject: subjectMatch?.[1]?.trim() || "",
    body,
  };
}

const DAY_COLORS = ["#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe", "#ede9fe"];

export default function EmailSequenceBuilder() {
  const [company, setCompany] = useState("");
  const [angle, setAngle] = useState("");
  const [steps, setSteps] = useState("3");
  const [senderName, setSenderName] = useState("Ashir Ayaan");
  const [senderCompany, setSenderCompany] = useState("");
  const { loading, result, error, run } = useAgent(runSequenceBuilder);

  const emails = result ? result.split("---").filter(s => s.trim()).map(parseEmail) : [];

  return (
    <div className="flex flex-col gap-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-xl border border-line bg-card">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/8 via-transparent to-transparent" />
        <div className="relative flex items-start gap-4 p-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-500/12 border border-purple-500/20">
            <Layers className="h-6 w-6 text-purple-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-foreground">Email Sequence Builder</h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-500/12 text-purple-400 border border-purple-500/20">AI Agent</span>
            </div>
            <p className="text-sm text-muted max-w-lg">Generate a complete multi-step cold email sequence with follow-ups — no clichés, peer-to-peer tone.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start">
        {/* Input panel */}
        <div className="flex flex-col gap-4">
          <div className="bg-card border border-line rounded-xl p-5 flex flex-col gap-4">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">Sequence Setup</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Target Company *">
                <TextInput value={company} onChange={setCompany} placeholder="e.g. Shopify" disabled={loading} />
              </Field>
              <Field label="Emails">
                <Select value={steps} onChange={setSteps} options={STEP_OPTIONS} disabled={loading} />
              </Field>
            </div>
            <Field label="Pitch Angle / Offer *">
              <TextArea value={angle} onChange={setAngle} placeholder="e.g. We drive affiliate traffic to e-commerce brands through owned media" rows={3} disabled={loading} />
            </Field>
            <p className="text-xs font-semibold text-muted uppercase tracking-wider pt-1">Sender Info</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Your Name">
                <TextInput value={senderName} onChange={setSenderName} disabled={loading} />
              </Field>
              <Field label="Your Company">
                <TextInput value={senderCompany} onChange={setSenderCompany} disabled={loading} />
              </Field>
            </div>
          </div>
          <RunButton onClick={() => run({ company, angle, steps, senderName, senderCompany })} loading={loading} label="Build Sequence" />
          {result && (
            <button
              onClick={() => navigator.clipboard.writeText(result)}
              className="flex items-center justify-center gap-2 text-xs text-muted hover:text-purple-400 border border-line hover:border-purple-500/30 rounded-lg py-2 transition-colors"
            >
              <Copy className="h-3.5 w-3.5" />
              Copy all emails
            </button>
          )}
        </div>

        {/* Output panel */}
        <div className="flex flex-col gap-4">
          <AgentStatus loading={loading} error={error} />

          {!loading && !result && !error && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-line border-dashed bg-card/40 py-16 gap-3">
              <Mail className="h-10 w-10 text-muted/40" />
              <p className="text-sm text-muted">Your sequence will appear here</p>
            </div>
          )}

          {emails.length > 0 && (
            <div className="flex flex-col gap-4">
              <p className="text-xs font-semibold text-muted uppercase tracking-wider">{emails.length}-Email Sequence for <span className="text-purple-400 normal-case font-normal">{company}</span></p>
              {emails.map((email, i) => (
                <div key={i} className="bg-card border border-line rounded-xl overflow-hidden">
                  {/* Email header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-line" style={{ borderLeftWidth: 3, borderLeftColor: DAY_COLORS[i % DAY_COLORS.length] }}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: DAY_COLORS[i % DAY_COLORS.length] }}>
                        {email.num}
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-foreground">Email {email.num}</span>
                        {email.day !== "?" && (
                          <span className="flex items-center gap-1 text-xs text-muted mt-0.5">
                            <Calendar className="h-3 w-3" />Day {email.day}
                          </span>
                        )}
                      </div>
                    </div>
                    <CopyButton text={`Subject: ${email.subject}\n\n${email.body}`} />
                  </div>
                  {/* Subject */}
                  {email.subject && (
                    <div className="px-4 py-2.5 border-b border-line bg-surface/40">
                      <span className="text-xs text-muted mr-2">Subject:</span>
                      <span className="text-sm font-medium text-foreground">{email.subject}</span>
                    </div>
                  )}
                  {/* Body */}
                  <div className="px-4 py-4 text-sm text-foreground whitespace-pre-wrap leading-relaxed">{email.body}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
