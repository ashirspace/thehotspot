import { useState } from "react";
import { Link2, Globe, Mail, Copy, Check, ExternalLink } from "lucide-react";
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

function CopyButton({ text, accent }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1800); }}
      className="flex items-center gap-1.5 text-xs text-muted hover:text-emerald-400 transition-colors"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : "Copy email"}
    </button>
  );
}

export default function BacklinkOutreach() {
  const [niche, setNiche] = useState("");
  const [ourSite, setOurSite] = useState("thehotspot.in");
  const [ourContent, setOurContent] = useState("");
  const { loading, result, error, run } = useAgent(runBacklinkOutreach);

  return (
    <div className="flex flex-col gap-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-xl border border-line bg-card">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/8 via-transparent to-transparent" />
        <div className="relative flex items-start gap-4 p-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/12 border border-emerald-500/20">
            <Link2 className="h-6 w-6 text-emerald-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-foreground">Backlink Outreach</h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/12 text-emerald-400 border border-emerald-500/20">AI Agent</span>
            </div>
            <p className="text-sm text-muted max-w-lg">Find backlink prospects in your niche and get a ready-to-send outreach email template — under 120 words, peer tone.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 items-start">
        {/* Input panel */}
        <div className="flex flex-col gap-4">
          <div className="bg-card border border-line rounded-xl p-5 flex flex-col gap-4">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">Campaign Details</p>
            <Field label="Niche *">
              <TextInput value={niche} onChange={setNiche} placeholder="e.g. SaaS, travel, personal finance" disabled={loading} />
            </Field>
            <Field label="Your Site">
              <TextInput value={ourSite} onChange={setOurSite} disabled={loading} />
            </Field>
            <Field label="Content to Link To">
              <TextInput value={ourContent} onChange={setOurContent} placeholder="e.g. Ultimate guide to cold email outreach" disabled={loading} />
            </Field>
          </div>
          <RunButton onClick={() => run({ niche, ourSite, ourContent })} loading={loading} label="Find Prospects" />
        </div>

        {/* Output panel */}
        <div className="flex flex-col gap-5">
          <AgentStatus loading={loading} error={error} />

          {!loading && !result && !error && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-line border-dashed bg-card/40 py-16 gap-3">
              <Link2 className="h-10 w-10 text-muted/40" />
              <p className="text-sm text-muted">Enter your niche to find backlink opportunities</p>
            </div>
          )}

          {result && (
            <>
              {/* Prospects */}
              {result.prospects.length > 0 && (
                <div className="flex flex-col gap-3">
                  <p className="text-xs font-semibold text-muted uppercase tracking-wider">
                    {result.prospects.length} Prospects Found
                  </p>
                  {result.prospects.map((prospect, i) => (
                    <div key={i} className="bg-card border border-line hover:border-emerald-500/25 rounded-xl p-4 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/15 mt-0.5">
                            <Globe className="h-4 w-4 text-emerald-400" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{prospect.site || "Unknown"}</p>
                            {prospect.contactEmail && (
                              <p className="flex items-center gap-1 text-xs text-muted mt-0.5">
                                <Mail className="h-3 w-3" />{prospect.contactEmail}
                              </p>
                            )}
                            {prospect.description && (
                              <p className="text-xs text-muted mt-1.5 leading-relaxed line-clamp-2">{prospect.description}</p>
                            )}
                          </div>
                        </div>
                        {prospect.website && (
                          <a
                            href={prospect.website.startsWith("http") ? prospect.website : `https://${prospect.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 text-muted hover:text-emerald-400 transition-colors"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Email template */}
              {result.emailTemplate && (
                <div className="bg-card border border-emerald-500/20 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-line bg-emerald-500/5">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-emerald-400" />
                      <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Outreach Email Template</span>
                    </div>
                    <CopyButton text={result.emailTemplate} />
                  </div>
                  <div className="p-4 text-sm text-foreground whitespace-pre-wrap leading-relaxed">{result.emailTemplate}</div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
