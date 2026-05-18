import { useState } from "react";
import { FileText, Copy, Check, BookOpen } from "lucide-react";
import { Field, TextInput, Select, RunButton } from "../components/AgentInput.jsx";
import { AgentStatus } from "../components/AgentStatus.jsx";
import { useAgent } from "../hooks/useAgent.js";
import { askClaude } from "../utils/anthropicClient.js";

const TONE_OPTIONS = [
  { value: "professional", label: "Professional" },
  { value: "conversational", label: "Conversational" },
  { value: "authoritative", label: "Authoritative" },
  { value: "educational", label: "Educational" },
];

const LENGTH_OPTIONS = [
  { value: "short", label: "Short (~500 words)" },
  { value: "medium", label: "Medium (~900 words)" },
  { value: "long", label: "Long (~1500 words)" },
];

const SYSTEM = `You are a content strategist and expert copywriter. Write high-quality blog posts optimized for readability and SEO.
Structure: Title (H1), intro hook, 3-5 H2 sections with content, conclusion with a CTA. Use short paragraphs.
No filler sentences. No phrases like "In conclusion" or "In today's fast-paced world".`;

async function runBlogGenerator({ topic, keywords, tone, length }) {
  const wordCount = length === "short" ? 500 : length === "medium" ? 900 : 1500;
  const prompt = `Write a blog post:
Topic: ${topic}
Keywords to include: ${keywords || "none specified"}
Tone: ${tone}
Target length: ~${wordCount} words`;
  return await askClaude(SYSTEM, prompt, Math.ceil(wordCount / 0.7));
}

function estimateWordCount(text) {
  return text ? text.trim().split(/\s+/).length : 0;
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1800); }}
      className="flex items-center gap-1.5 text-xs text-muted hover:text-teal-400 transition-colors"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-teal-400" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : "Copy post"}
    </button>
  );
}

function ArticleRenderer({ text }) {
  const lines = text.split("\n");
  return (
    <div className="flex flex-col gap-3">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-1" />;
        if (trimmed.startsWith("# ")) return <h1 key={i} className="text-xl font-bold text-foreground leading-tight">{trimmed.slice(2)}</h1>;
        if (trimmed.startsWith("## ")) return <h2 key={i} className="text-base font-semibold text-foreground mt-2">{trimmed.slice(3)}</h2>;
        if (trimmed.startsWith("### ")) return <h3 key={i} className="text-sm font-semibold text-teal-400 mt-1">{trimmed.slice(4)}</h3>;
        if (trimmed.startsWith("- ")) return <li key={i} className="text-sm text-foreground leading-relaxed ml-4 list-disc">{trimmed.slice(2)}</li>;
        return <p key={i} className="text-sm text-foreground leading-relaxed">{trimmed}</p>;
      })}
    </div>
  );
}

export default function BlogGenerator() {
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");
  const [tone, setTone] = useState("professional");
  const [length, setLength] = useState("medium");
  const { loading, result, error, run } = useAgent(runBlogGenerator);

  const wordCount = estimateWordCount(result);

  return (
    <div className="flex flex-col gap-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-xl border border-line bg-card">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/8 via-transparent to-transparent" />
        <div className="relative flex items-start gap-4 p-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-500/12 border border-teal-500/20">
            <FileText className="h-6 w-6 text-teal-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-foreground">Blog Generator</h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-500/12 text-teal-400 border border-teal-500/20">AI Agent</span>
            </div>
            <p className="text-sm text-muted max-w-lg">Generate a full SEO-ready blog post from a topic and keywords — structured, readable, and ready to publish.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 items-start">
        {/* Input panel */}
        <div className="flex flex-col gap-4">
          <div className="bg-card border border-line rounded-xl p-5 flex flex-col gap-4">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">Post Settings</p>
            <Field label="Topic *">
              <TextInput value={topic} onChange={setTopic} placeholder="e.g. How to generate leads with content marketing" disabled={loading} />
            </Field>
            <Field label="Target Keywords">
              <TextInput value={keywords} onChange={setKeywords} placeholder="e.g. lead generation, content marketing, B2B" disabled={loading} />
            </Field>
            <div className="grid grid-cols-1 gap-3">
              <Field label="Tone">
                <Select value={tone} onChange={setTone} options={TONE_OPTIONS} disabled={loading} />
              </Field>
              <Field label="Length">
                <Select value={length} onChange={setLength} options={LENGTH_OPTIONS} disabled={loading} />
              </Field>
            </div>
          </div>
          <RunButton onClick={() => run({ topic, keywords, tone, length })} loading={loading} label="Generate Blog Post" />
        </div>

        {/* Output panel */}
        <div className="flex flex-col gap-4">
          <AgentStatus loading={loading} error={error} />

          {!loading && !result && !error && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-line border-dashed bg-card/40 py-16 gap-3">
              <BookOpen className="h-10 w-10 text-muted/40" />
              <p className="text-sm text-muted">Your blog post will appear here</p>
            </div>
          )}

          {result && (
            <div className="bg-card border border-line rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-line">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-muted uppercase tracking-wider">Blog Post</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/15">~{wordCount} words</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-surface text-muted border border-line capitalize">{tone}</span>
                </div>
                <CopyButton text={result} />
              </div>
              <div className="p-5 max-h-[600px] overflow-y-auto">
                <ArticleRenderer text={result} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
