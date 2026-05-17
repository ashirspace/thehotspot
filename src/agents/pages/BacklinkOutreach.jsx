import { useState } from "react";
import { AgentCard, Section } from "../components/AgentCard.jsx";
import { Field, TextInput, RunButton } from "../components/AgentInput.jsx";
import { AgentStatus } from "../components/AgentStatus.jsx";
import { useAgent } from "../hooks/useAgent.js";
import { findLeads } from "../utils/apolloClient.js";
import { askClaude } from "../utils/anthropicClient.js";

const EMAIL_SYSTEM = `You are a link-building outreach specialist. Write short, personalized backlink request emails.
Rules: No em dashes. No "I hope this email finds you well". No "synergy". Direct, peer tone. Under 120 words.`;

async function runBacklinkOutreach({ niche, ourSite, ourContent }) {
  const query = `Find blogs, media sites, and content publishers in the ${niche} niche that accept guest posts or link partnerships. Return JSON array with: site, website, contactEmail, description.`;

  const raw = await findLeads(query);
  const prospects = Array.isArray(raw) ? raw.slice(0, 8) : [];

  const emailPrompt = `Write a backlink outreach email for:
Our site: ${ourSite || "thehotspot.in"}
Our content: ${ourContent || `a resource about ${niche}`}
Niche: ${niche}
Recipient: a content editor at a ${niche} publication`;

  const emailTemplate = await askClaude(EMAIL_SYSTEM, emailPrompt, 300);

  return { prospects, emailTemplate };
}

export default function BacklinkOutreach() {
  const [niche, setNiche] = useState("");
  const [ourSite, setOurSite] = useState("thehotspot.in");
  const [ourContent, setOurContent] = useState("");
  const { loading, result, error, run } = useAgent(runBacklinkOutreach);

  const cols = ["site", "website", "contactEmail", "description"];

  return (
    <AgentCard
      title="Backlink Outreach"
      description="Find backlink prospects in your niche and get a ready-to-use outreach email template."
    >
      <Section>
        <Field label="Niche *">
          <TextInput value={niche} onChange={setNiche} placeholder="e.g. SaaS, travel, personal finance" disabled={loading} />
        </Field>
        <Field label="Your Site">
          <TextInput value={ourSite} onChange={setOurSite} disabled={loading} />
        </Field>
        <Field label="Content to Link To">
          <TextInput value={ourContent} onChange={setOurContent} placeholder="e.g. Ultimate guide to cold email outreach" disabled={loading} />
        </Field>
        <RunButton onClick={() => run({ niche, ourSite, ourContent })} loading={loading} label="Find Prospects" />
      </Section>

      <AgentStatus loading={loading} error={error} />

      {result && (
        <div className="flex flex-col gap-5">
          {result.prospects.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-muted uppercase tracking-wide">Prospects ({result.prospects.length})</p>
              <div className="overflow-x-auto rounded-lg border border-line">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-line bg-card">
                      {cols.map(c => (
                        <th key={c} className="px-3 py-2.5 text-left text-xs font-semibold text-muted uppercase tracking-wide">{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.prospects.map((row, i) => (
                      <tr key={i} className="border-b border-line last:border-0 hover:bg-card/60 transition-colors">
                        {cols.map(c => (
                          <td key={c} className="px-3 py-2.5 text-foreground">{row[c] ?? "—"}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {result.emailTemplate && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-muted uppercase tracking-wide">Outreach Email Template</p>
              <div className="bg-card border border-line rounded-lg p-4 text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                {result.emailTemplate}
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(result.emailTemplate)}
                className="self-start text-xs text-muted hover:text-accent transition-colors"
              >
                Copy email
              </button>
            </div>
          )}
        </div>
      )}
    </AgentCard>
  );
}
