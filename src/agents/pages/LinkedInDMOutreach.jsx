import { useMemo, useRef, useState } from "react";
import {
  BriefcaseBusiness, Check, Copy, ExternalLink, FileUp,
  Send, SkipForward, Sparkles, Upload, Users,
} from "lucide-react";
import { Field, TextInput, TextArea, Select, RunButton } from "../components/AgentInput.jsx";
import { AgentStatus } from "../components/AgentStatus.jsx";
import { useAgent } from "../hooks/useAgent.js";

const GOAL_OPTIONS = [
  { value: "partnership", label: "Partnership" },
  { value: "affiliate", label: "Affiliate" },
  { value: "sales", label: "Sales" },
  { value: "hiring", label: "Hiring" },
  { value: "founder-intro", label: "Founder intro" },
  { value: "custom", label: "Custom" },
];

const TONE_OPTIONS = [
  { value: "professional", label: "Professional" },
  { value: "concise", label: "Concise" },
  { value: "warm", label: "Warm" },
  { value: "direct", label: "Direct" },
];

const CATEGORY_OPTIONS = [
  "Founder/Executive",
  "Partnerships",
  "Marketing/Growth",
  "Sales",
  "HR",
  "Engineering/Product",
  "Other",
].map(value => ({ value, label: value }));

function parseCsvLine(line) {
  const cells = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];
    if (char === '"' && quoted && next === '"') {
      current += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      cells.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current.trim());
  return cells;
}

function parsePeople(text) {
  const lines = String(text || "")
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);

  if (!lines.length) return [];

  const first = lines[0].toLowerCase();
  const hasHeader = /name/.test(first) && /(linkedin|url)/.test(first);
  const headers = hasHeader
    ? parseCsvLine(lines[0]).map(h => h.toLowerCase().replace(/\s+/g, ""))
    : [];
  const dataLines = hasHeader ? lines.slice(1) : lines;

  return dataLines.map((line, index) => {
    const cells = line.includes("\t")
      ? line.split("\t").map(c => c.trim())
      : line.includes("|")
      ? line.split("|").map(c => c.trim())
      : parseCsvLine(line);

    if (hasHeader) {
      const get = (...names) => {
        const found = names.map(name => headers.indexOf(name)).find(i => i >= 0);
        return found >= 0 ? cells[found] || "" : "";
      };
      return {
        id: `person-${Date.now()}-${index}`,
        name: get("name", "fullname", "person"),
        title: get("title", "jobtitle", "role"),
        linkedinUrl: get("linkedinurl", "linkedin", "url", "profile"),
        department: get("department", "team"),
        seniority: get("seniority", "level"),
        notes: get("notes", "note", "context"),
      };
    }

    return {
      id: `person-${Date.now()}-${index}`,
      name: cells[0] || "",
      title: cells[1] || "",
      linkedinUrl: cells[2] || "",
      department: cells[3] || "",
      seniority: cells[4] || "",
      notes: cells.slice(5).join(", "),
    };
  }).filter(person => person.name && person.linkedinUrl);
}

function autoCategory(person) {
  const text = [person.title, person.department, person.seniority, person.notes].filter(Boolean).join(" ");
  if (/\b(founder|co-founder|ceo|chief executive|president|owner|managing director)\b/i.test(text)) return "Founder/Executive";
  if (/\b(partnership|partner|alliance|business development|biz dev|affiliate|channel)\b/i.test(text)) return "Partnerships";
  if (/\b(marketing|growth|demand|performance|acquisition|brand|content|seo|paid media)\b/i.test(text)) return "Marketing/Growth";
  if (/\b(sales|revenue|commercial|account executive|sdr|bdr)\b/i.test(text)) return "Sales";
  if (/\b(hr|people|talent|recruit|human resources|hiring)\b/i.test(text)) return "HR";
  if (/\b(engineer|engineering|product|cto|technology|technical|developer|platform)\b/i.test(text)) return "Engineering/Product";
  return "Other";
}

async function runLinkedInAgent(payload) {
  const res = await fetch("/api/linkedin-dm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "LinkedIn DM generation failed");
  return data;
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text || "");
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }}
      className="flex items-center gap-1.5 text-xs text-muted hover:text-accent transition-colors"
      style={{ background: "transparent", border: "none" }}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-accent" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : "Copy DM"}
    </button>
  );
}

export default function LinkedInDMOutreach() {
  const fileRef = useRef(null);
  const [company, setCompany] = useState("");
  const [website, setWebsite] = useState("");
  const [goal, setGoal] = useState("partnership");
  const [tone, setTone] = useState("professional");
  const [offerContext, setOfferContext] = useState("");
  const [peopleText, setPeopleText] = useState("");
  const [people, setPeople] = useState([]);
  const [drafts, setDrafts] = useState(() => {
    try { return JSON.parse(localStorage.getItem("thehotspot_linkedin_drafts") || "[]"); } catch { return []; }
  });
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem("thehotspot_linkedin_history") || "[]"); } catch { return []; }
  });
  const [campaignId, setCampaignId] = useState(() => localStorage.getItem("thehotspot_linkedin_campaign_id") || "");
  const [formError, setFormError] = useState("");
  const { loading, error, run } = useAgent(runLinkedInAgent);

  const stats = useMemo(() => ({
    total: drafts.length,
    approved: drafts.filter(d => d.approved).length,
    sent: drafts.filter(d => d.status === "sent").length,
    skipped: drafts.filter(d => d.status === "skipped").length,
  }), [drafts]);

  const saveDrafts = (nextDrafts, nextCampaignId = campaignId) => {
    setDrafts(nextDrafts);
    localStorage.setItem("thehotspot_linkedin_drafts", JSON.stringify(nextDrafts));
    const resolvedCampaignId = String(nextCampaignId || campaignId || "local-current");
    if (resolvedCampaignId) {
      setCampaignId(resolvedCampaignId);
      localStorage.setItem("thehotspot_linkedin_campaign_id", resolvedCampaignId);
    }
    if (nextDrafts.length) {
      const record = {
        id: resolvedCampaignId,
        company: company || "LinkedIn campaign",
        goal,
        draftCount: nextDrafts.length,
        approvedCount: nextDrafts.filter(d => d.approved).length,
        sentCount: nextDrafts.filter(d => d.status === "sent").length,
        skippedCount: nextDrafts.filter(d => d.status === "skipped").length,
        updatedAt: new Date().toISOString(),
      };
      const nextHistory = [record, ...history.filter(item => item.id !== resolvedCampaignId)].slice(0, 5);
      setHistory(nextHistory);
      localStorage.setItem("thehotspot_linkedin_history", JSON.stringify(nextHistory));
    }
  };

  const handleParsePeople = () => {
    const parsed = parsePeople(peopleText).map(person => ({ ...person, category: autoCategory(person) }));
    setPeople(parsed);
  };

  const handleFile = async (file) => {
    if (!file) return;
    const text = await file.text();
    setPeopleText(text);
    const parsed = parsePeople(text).map(person => ({ ...person, category: autoCategory(person) }));
    setPeople(parsed);
  };

  const updatePerson = (id, field, value) => {
    setPeople(prev => prev.map(person => person.id === id ? { ...person, [field]: value } : person));
  };

  const updateDraft = async (id, patch) => {
    const next = drafts.map(draft => draft.id === id ? { ...draft, ...patch } : draft);
    saveDrafts(next);
    fetch("/api/linkedin-dm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "updateStatus",
        draftId: id,
        campaignId,
        status: patch.status,
        approved: patch.approved,
        message: patch.message,
      }),
    }).catch(() => {});
  };

  const generateDrafts = async () => {
    setFormError("");
    const selectedPeople = people.length ? people : parsePeople(peopleText).map(person => ({ ...person, category: autoCategory(person) }));
    if (!company.trim()) {
      setFormError("Company is required");
      return;
    }
    if (!selectedPeople.length) {
      setFormError("Add at least one person with a name and LinkedIn URL");
      return;
    }
    setPeople(selectedPeople);
    const data = await run({
      company,
      website,
      goal,
      tone,
      offerContext,
      people: selectedPeople,
      userId: "dashboard-user",
    });
    if (data?.drafts) saveDrafts(data.drafts, data.campaignId);
  };

  return (
    <div className="agent-page-shell linkedin-workbench flex flex-col gap-6">
      <header className="li-page-header">
        <div>
          <p className="li-kicker">Intelligence / manual LinkedIn workflow</p>
          <h1 className="li-page-title">LinkedIn DM Outreach</h1>
          <p className="li-page-copy">Build a focused outreach queue from a company list, review every line, and send from LinkedIn only after you approve the draft.</p>
        </div>
        <div className="li-mode-tag">Manual send only</div>
      </header>

      <div className="li-layout">
        <div className="li-stack">
          <section className="li-panel">
            <div className="li-panel-inner">
              <div className="li-panel-heading">
                <p className="li-section-label">Campaign setup</p>
                <span className="li-panel-number">01</span>
              </div>
            <Field label="Target Company *">
              <TextInput value={company} onChange={setCompany} placeholder="e.g. Shopify" disabled={loading} />
            </Field>
            <Field label="Website / Domain">
              <TextInput value={website} onChange={setWebsite} placeholder="e.g. shopify.com" disabled={loading} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Goal">
                <Select value={goal} onChange={setGoal} options={GOAL_OPTIONS} disabled={loading} />
              </Field>
              <Field label="Tone">
                <Select value={tone} onChange={setTone} options={TONE_OPTIONS} disabled={loading} />
              </Field>
            </div>
            <Field label="Offer / Context *">
              <TextArea value={offerContext} onChange={setOfferContext} rows={4} placeholder="e.g. We help affiliate networks drive qualified traffic from owned media properties." disabled={loading} />
            </Field>
            </div>
          </section>

          <section className="li-panel">
            <div className="li-panel-inner">
            <div className="li-panel-heading">
              <div>
                <p className="li-section-label">People input</p>
              </div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="li-upload-btn"
              >
                <Upload className="h-3.5 w-3.5" />
                Upload CSV
              </button>
              <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={e => handleFile(e.target.files?.[0])} />
            </div>
            <Field label="Paste CSV / rows">
              <TextArea
                value={peopleText}
                onChange={setPeopleText}
                rows={7}
                placeholder={'Jane Doe,Head of Partnerships,https://linkedin.com/in/janedoe\nAlex Lee,VP Growth,https://linkedin.com/in/alexlee'}
                disabled={loading}
              />
            </Field>
            <button
              onClick={handleParsePeople}
              className="li-line-btn"
            >
              <FileUp className="h-3.5 w-3.5" />
              Parse and categorize people
            </button>
            </div>
          </section>

          <RunButton onClick={generateDrafts} loading={loading} label="Generate LinkedIn DMs" />
        </div>

        <div className="li-stack">
          <AgentStatus loading={loading} error={error || formError} />

          <div className="li-stat-grid">
            {[
              ["Drafts", stats.total],
              ["Approved", stats.approved],
              ["Sent", stats.sent],
              ["Skipped", stats.skipped],
            ].map(([label, value]) => (
              <div key={label} className="li-stat">
                <div className="li-stat-label">{label}</div>
                <div className="li-stat-value">{value}</div>
              </div>
            ))}
          </div>

          {people.length > 0 && (
            <section className="li-table">
              <div className="li-table-head">
                <Users className="h-4 w-4 text-accent" />
                <p className="li-section-label">Categorization</p>
              </div>
              <div>
                {people.map(person => (
                  <div key={person.id} className="li-row">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">{person.name}</p>
                      <p className="text-xs text-muted mt-0.5">{person.title || "No title"} {person.linkedinUrl ? `- ${person.linkedinUrl}` : ""}</p>
                    </div>
                    <Select value={person.category || "Other"} onChange={value => updatePerson(person.id, "category", value)} options={CATEGORY_OPTIONS} disabled={loading} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {!loading && !people.length && !drafts.length && !error && (
            <div className="li-empty">
              <BriefcaseBusiness className="h-10 w-10 text-muted/40" />
              <p className="text-sm text-muted">Add company details and people to build your LinkedIn DM queue</p>
            </div>
          )}

          {drafts.length > 0 && (
            <section className="li-stack">
              <div className="li-queue-title">
                <p className="li-section-label">Review queue</p>
                <span className="li-campaign-name">{company || "LinkedIn campaign"}</span>
              </div>
              {drafts.map(draft => (
                <article key={draft.id} className="li-draft">
                  <div className="li-draft-top">
                    <div className="li-person">
                      <div className="li-person-mark">
                        {(draft.name || "?").slice(0, 1).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{draft.name}</p>
                        <p className="text-xs text-muted truncate">{draft.title || "No title"} - {draft.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="li-status-pill">{draft.status || "draft"}</span>
                      <label className="flex items-center gap-1.5 text-xs text-muted">
                        <input
                          type="checkbox"
                          checked={!!draft.approved}
                          onChange={e => updateDraft(draft.id, { approved: e.target.checked, status: e.target.checked ? "approved" : "draft" })}
                        />
                        Approved
                      </label>
                    </div>
                  </div>
                  <div className="li-draft-body">
                    <p className="text-xs text-muted">{draft.reason}</p>
                    <textarea
                      value={draft.message}
                      onChange={e => updateDraft(draft.id, { message: e.target.value })}
                      rows={5}
                      className="bg-surface border border-line rounded-[8px] px-3 py-2 text-sm text-foreground placeholder-muted focus:outline-none focus:border-accent resize-none leading-relaxed font-sans"
                    />
                    <div className="li-draft-actions">
                      <CopyButton text={draft.message} />
                      <a href={draft.linkedinUrl} target="_blank" rel="noopener noreferrer" className="li-action">
                        <ExternalLink className="h-3.5 w-3.5" />
                        Open LinkedIn
                      </a>
                      <button onClick={() => updateDraft(draft.id, { approved: true, status: "sent" })} className="li-action">
                        <Send className="h-3.5 w-3.5" />
                        Mark sent
                      </button>
                      <button onClick={() => updateDraft(draft.id, { approved: false, status: "skipped" })} className="li-action">
                        <SkipForward className="h-3.5 w-3.5" />
                        Mark skipped
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </section>
          )}

          <div className="li-note">
            <Sparkles className="h-4 w-4 text-accent mt-0.5" />
            <p className="text-xs text-muted leading-relaxed">
              V1 does not auto-send LinkedIn messages. Review each DM, copy it, send manually in LinkedIn, then mark the outcome here for tracking.
            </p>
          </div>

          {history.length > 0 && (
            <section className="li-history">
              <div className="li-history-head">
                <p className="li-section-label">Recent LinkedIn campaigns</p>
              </div>
              <div className="divide-y divide-line">
                {history.map(item => (
                  <div key={item.id} className="px-4 py-3 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{item.company}</p>
                      <p className="text-xs text-muted mt-0.5">{item.goal} - {new Date(item.updatedAt).toLocaleString()}</p>
                    </div>
                    <div className="text-xs text-muted shrink-0">
                      {item.draftCount} drafts - {item.sentCount} sent - {item.skippedCount} skipped
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
