import { useState } from "react";
import { AgentCard, Section } from "../components/AgentCard.jsx";
import { Field, TextInput, Select, RunButton } from "../components/AgentInput.jsx";
import { AgentStatus } from "../components/AgentStatus.jsx";
import { TableOutput } from "../components/AgentOutput.jsx";
import { useAgent } from "../hooks/useAgent.js";
import { findLeads } from "../utils/apolloClient.js";

const SIZE_OPTIONS = [
  { value: "any", label: "Any size" },
  { value: "1-10", label: "1-10 employees" },
  { value: "11-50", label: "11-50 employees" },
  { value: "51-200", label: "51-200 employees" },
  { value: "201-1000", label: "201-1000 employees" },
  { value: "1000+", label: "1000+ employees" },
];

async function runLeadFinder({ industry, location, size }) {
  const query = [
    `Find B2B companies in the ${industry} industry`,
    location ? `based in ${location}` : "",
    size && size !== "any" ? `with ${size} employees` : "",
    "Return a JSON array of objects with fields: company, website, industry, location, size, description.",
  ].filter(Boolean).join(", ");

  const raw = await findLeads(query);

  // If array of objects already, use them; else try to parse text
  if (Array.isArray(raw) && raw.length) return raw;

  // Fallback: if string returned, try JSON parse
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw.match(/\[[\s\S]*\]/)?.[0] || "[]");
      return parsed;
    } catch { return []; }
  }

  return [];
}

export default function LeadFinder() {
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("");
  const [size, setSize] = useState("any");
  const { loading, result, error, run } = useAgent(runLeadFinder);

  const columns = ["company", "website", "location", "size", "description"];

  return (
    <AgentCard
      title="Lead Finder"
      description="Find B2B companies matching your target industry, location, and company size."
    >
      <Section>
        <Field label="Industry *">
          <TextInput value={industry} onChange={setIndustry} placeholder="e.g. SaaS, E-commerce, Healthcare" disabled={loading} />
        </Field>
        <Field label="Location">
          <TextInput value={location} onChange={setLocation} placeholder="e.g. United States, London, UAE" disabled={loading} />
        </Field>
        <Field label="Company Size">
          <Select value={size} onChange={setSize} options={SIZE_OPTIONS} disabled={loading} />
        </Field>
        <RunButton
          onClick={() => run({ industry, location, size })}
          loading={loading}
          label="Find Leads"
        />
      </Section>

      <AgentStatus loading={loading} error={error} />

      {result && (
        <TableOutput rows={result} columns={columns} label="Companies Found" />
      )}
    </AgentCard>
  );
}
