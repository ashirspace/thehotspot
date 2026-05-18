import { useState } from "react";
import { Search, Building2, MapPin, Users, Globe, ChevronRight } from "lucide-react";
import { Field, TextInput, Select, RunButton } from "../components/AgentInput.jsx";
import { AgentStatus } from "../components/AgentStatus.jsx";
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

  if (Array.isArray(raw) && raw.length) return raw;

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

  return (
    <div className="flex flex-col gap-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-xl border border-line bg-card">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/8 via-transparent to-transparent" />
        <div className="relative flex items-start gap-4 p-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/12 border border-emerald-500/20">
            <Search className="h-6 w-6 text-emerald-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-foreground">Lead Finder</h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/12 text-emerald-400 border border-emerald-500/20">AI Agent</span>
            </div>
            <p className="text-sm text-muted max-w-lg">Discover B2B companies matching your target industry, location, and size. Powered by live company intelligence.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start">
        {/* Input panel */}
        <div className="flex flex-col gap-4">
          <div className="bg-card border border-line rounded-xl p-5 flex flex-col gap-4">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">Search Filters</p>
            <Field label="Industry *">
              <TextInput value={industry} onChange={setIndustry} placeholder="e.g. SaaS, E-commerce, Healthcare" disabled={loading} />
            </Field>
            <Field label="Location">
              <TextInput value={location} onChange={setLocation} placeholder="e.g. United States, London, UAE" disabled={loading} />
            </Field>
            <Field label="Company Size">
              <Select value={size} onChange={setSize} options={SIZE_OPTIONS} disabled={loading} />
            </Field>
          </div>
          <RunButton
            onClick={() => run({ industry, location, size })}
            loading={loading}
            label="Find Leads"
          />
        </div>

        {/* Output panel */}
        <div className="flex flex-col gap-4">
          <AgentStatus loading={loading} error={error} />

          {!loading && !result && !error && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-line border-dashed bg-card/40 py-16 gap-3">
              <Building2 className="h-10 w-10 text-muted/40" />
              <p className="text-sm text-muted">Enter an industry to start finding leads</p>
            </div>
          )}

          {result && result.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted uppercase tracking-wider">
                  {result.length} Companies Found
                </p>
                <span className="text-xs text-emerald-400 font-medium">{industry}{location ? ` · ${location}` : ""}{size !== "any" ? ` · ${size}` : ""}</span>
              </div>
              {result.map((company, i) => (
                <div key={i} className="group bg-card border border-line hover:border-emerald-500/30 rounded-xl p-4 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/15 mt-0.5">
                        <Building2 className="h-4 w-4 text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm truncate">{company.company || company.name || "Unknown"}</p>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          {company.location && (
                            <span className="flex items-center gap-1 text-xs text-muted">
                              <MapPin className="h-3 w-3" />{company.location}
                            </span>
                          )}
                          {company.size && (
                            <span className="flex items-center gap-1 text-xs text-muted">
                              <Users className="h-3 w-3" />{company.size}
                            </span>
                          )}
                          {company.industry && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/15">{company.industry}</span>
                          )}
                        </div>
                        {company.description && (
                          <p className="text-xs text-muted mt-2 leading-relaxed line-clamp-2">{company.description}</p>
                        )}
                      </div>
                    </div>
                    {company.website && (
                      <a
                        href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 flex items-center gap-1 text-xs text-muted hover:text-emerald-400 transition-colors"
                      >
                        <Globe className="h-3.5 w-3.5" />
                        <ChevronRight className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {result && result.length === 0 && (
            <div className="rounded-xl border border-line bg-card p-8 text-center">
              <p className="text-sm text-muted">No companies found. Try a broader industry or different location.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
