import { useState } from "react";
import { AgentCard, Section } from "../components/AgentCard.jsx";
import { Field, TextInput, TextArea, Select, RunButton } from "../components/AgentInput.jsx";
import { AgentStatus } from "../components/AgentStatus.jsx";
import { TextOutput } from "../components/AgentOutput.jsx";
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

export default function BlogGenerator() {
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");
  const [tone, setTone] = useState("professional");
  const [length, setLength] = useState("medium");
  const { loading, result, error, run } = useAgent(runBlogGenerator);

  return (
    <AgentCard
      title="Blog Generator"
      description="Generate a full SEO-ready blog post from a topic and keywords."
    >
      <Section>
        <Field label="Topic *">
          <TextInput value={topic} onChange={setTopic} placeholder="e.g. How to generate leads with content marketing" disabled={loading} />
        </Field>
        <Field label="Target Keywords (optional)">
          <TextInput value={keywords} onChange={setKeywords} placeholder="e.g. lead generation, content marketing, B2B" disabled={loading} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Tone">
            <Select value={tone} onChange={setTone} options={TONE_OPTIONS} disabled={loading} />
          </Field>
          <Field label="Length">
            <Select value={length} onChange={setLength} options={LENGTH_OPTIONS} disabled={loading} />
          </Field>
        </div>
        <RunButton onClick={() => run({ topic, keywords, tone, length })} loading={loading} label="Generate Blog Post" />
      </Section>

      <AgentStatus loading={loading} error={error} />
      <TextOutput text={result} label="Blog Post" />
    </AgentCard>
  );
}
