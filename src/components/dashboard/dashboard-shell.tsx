"use client";

import { FormEvent, useEffect, useMemo, useState, useTransition } from "react";
import { signIn, signOut } from "next-auth/react";
import {
  Archive,
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  Clock3,
  FileUp,
  Filter,
  Loader2,
  Menu,
  MessageSquareText,
  MoreHorizontal,
  Search,
  Send,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { AnalyticsSnapshot, DashboardMessage, MessageStatus } from "./types";

type CampaignFormState = {
  name: string;
  description: string;
  baseMessage: string;
  audienceType: string;
  targetCompany: string;
  targetRole: string;
  targetProfession: string;
  targetCategory: string;
  context: string;
  referenceUrl: string;
};

const statusTabs: Array<{ label: string; value: MessageStatus }> = [
  { label: "Drafts", value: "DRAFT" },
  { label: "Approved", value: "APPROVED" },
  { label: "Sent", value: "SENT" },
  { label: "Skipped", value: "SKIPPED" },
];

const navigation = [
  { label: "Analytics", icon: BarChart3 },
  { label: "Messages", icon: MessageSquareText },
  { label: "Campaign Setup", icon: Sparkles },
  { label: "Bulk Import", icon: FileUp },
  { label: "Settings", icon: Settings },
];

const fallbackMessages: DashboardMessage[] = [
  {
    id: "demo-1",
    recipientName: "Maya Shah",
    recipientRole: "VP Growth",
    company: "Northstar Labs",
    campaignName: "Q2 Pipeline Partners",
    body: "Hi Maya,\n\nI noticed Northstar is expanding its partner channel. We help growth teams identify qualified operators and test a short outbound motion before hiring another SDR seat. Would it be useful to compare notes this week?",
    status: "DRAFT",
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
  },
  {
    id: "demo-2",
    recipientName: "Jordan Lee",
    recipientRole: "Founder",
    company: "Ridge Analytics",
    campaignName: "Founder Outreach",
    body: "Hi Jordan,\n\nYour recent hiring push around revenue operations stood out. We are helping founder-led teams turn LinkedIn profile data into reviewed DM drafts, with approval before anything goes out. Open to a quick walkthrough?",
    status: "APPROVED",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "demo-3",
    recipientName: "Nora Patel",
    recipientRole: "Head of Partnerships",
    company: "HelioStack",
    campaignName: "Partner Pilot",
    body: "Hi Nora, thanks again for taking a look. Sending this over as discussed.",
    status: "SENT",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
    openedAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
  },
];

const fallbackAnalytics: AnalyticsSnapshot = {
  openRate: 68,
  responseRate: 24,
  engagementTrend: 12,
  sentCount: 148,
  timeline: [
    {
      id: "activity-1",
      type: "OPENED",
      label: "Maya Shah opened a DM",
      createdAt: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
      message: "Q2 Pipeline Partners",
    },
    {
      id: "activity-2",
      type: "RESPONDED",
      label: "Jordan Lee replied",
      createdAt: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
      message: "Founder Outreach",
    },
    {
      id: "activity-3",
      type: "SENT",
      label: "18 approved DMs were queued",
      createdAt: new Date(Date.now() - 1000 * 60 * 80).toISOString(),
      message: "Partner Pilot",
    },
  ],
};

type DashboardShellProps = {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
};

export function DashboardShell({ user }: DashboardShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("Analytics");
  const [timeframe, setTimeframe] = useState("day");
  const [activeStatus, setActiveStatus] = useState<MessageStatus>("DRAFT");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [messages, setMessages] = useState<DashboardMessage[]>(fallbackMessages);
  const [analytics, setAnalytics] = useState<AnalyticsSnapshot>(fallbackAnalytics);
  const [selectedMessageId, setSelectedMessageId] = useState(fallbackMessages[0]?.id || "");
  const [editedBody, setEditedBody] = useState(fallbackMessages[0]?.body || "");
  const [saving, startSaving] = useTransition();
  const [loadingData, setLoadingData] = useState(true);
  const [importState, setImportState] = useState<string | null>(null);
  const [matchCount, setMatchCount] = useState(0);
  const [campaignForm, setCampaignForm] = useState({
    name: "Q2 Pipeline Partners",
    description: "Reach revenue leaders who are expanding partner-led growth motions.",
    baseMessage: "We help teams turn LinkedIn profile data into reviewed, personalized DM drafts.",
    audienceType: "CUSTOM_CATEGORY",
    targetCompany: "",
    targetRole: "Growth",
    targetProfession: "",
    targetCategory: "SaaS",
    context: "Reference the recipient's role and company. Keep the CTA low pressure.",
    referenceUrl: "",
  });

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      setLoadingData(true);
      try {
        const [messageResponse, analyticsResponse] = await Promise.all([
          fetch("/api/messages", { cache: "no-store" }),
          fetch(`/api/analytics?range=${timeframe}`, { cache: "no-store" }),
        ]);

        if (!mounted) return;

        if (messageResponse.ok) {
          const data = (await messageResponse.json()) as { messages: DashboardMessage[] };
          if (data.messages.length) {
            setMessages(data.messages);
            setSelectedMessageId((current) => current || data.messages[0].id);
          }
        }

        if (analyticsResponse.ok) {
          const data = (await analyticsResponse.json()) as AnalyticsSnapshot;
          setAnalytics(data);
        }
      } finally {
        if (mounted) setLoadingData(false);
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, [timeframe]);

  useEffect(() => {
    const selected = messages.find((message) => message.id === selectedMessageId);
    if (selected) {
      setEditedBody(selected.body);
    }
  }, [messages, selectedMessageId]);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({
      audienceType: campaignForm.audienceType,
      company: campaignForm.targetCompany,
      role: campaignForm.targetRole,
      profession: campaignForm.targetProfession,
      category: campaignForm.targetCategory,
    });

    fetch(`/api/recipients/count?${params.toString()}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then((response) => (response.ok ? response.json() : { count: 0 }))
      .then((data: { count: number }) => setMatchCount(data.count))
      .catch(() => undefined);

    return () => controller.abort();
  }, [campaignForm.audienceType, campaignForm.targetCategory, campaignForm.targetCompany, campaignForm.targetProfession, campaignForm.targetRole]);

  const selectedMessage = messages.find((message) => message.id === selectedMessageId) || messages[0];

  const filteredMessages = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return messages
      .filter((message) => message.status === activeStatus)
      .filter((message) => {
        if (!normalizedQuery) return true;
        return [message.recipientName, message.company, message.recipientRole, message.campaignName, message.body]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(normalizedQuery));
      })
      .sort((a, b) => {
        const aTime = new Date(a.updatedAt).getTime();
        const bTime = new Date(b.updatedAt).getTime();
        return sort === "oldest" ? aTime - bTime : bTime - aTime;
      });
  }, [activeStatus, messages, query, sort]);

  const statusCounts = useMemo(() => {
    return statusTabs.reduce(
      (acc, tab) => ({
        ...acc,
        [tab.value]: messages.filter((message) => message.status === tab.value).length,
      }),
      {} as Record<MessageStatus, number>,
    );
  }, [messages]);

  async function updateMessage(messageId: string, updates: Partial<DashboardMessage>) {
    setMessages((current) =>
      current.map((message) => (message.id === messageId ? { ...message, ...updates } : message)),
    );

    await fetch("/api/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: messageId,
        status: updates.status,
        body: updates.body,
      }),
    });
  }

  function saveSelectedMessage() {
    if (!selectedMessage) return;
    startSaving(async () => {
      await updateMessage(selectedMessage.id, { body: editedBody, updatedAt: new Date().toISOString() });
    });
  }

  async function createCampaign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startSaving(async () => {
      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(campaignForm),
      });

      const campaign = await response.json();

      const generationResponse = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId: campaign.id }),
      });

      if (generationResponse.ok) {
        const data = (await generationResponse.json()) as { messages: DashboardMessage[] };
        if (data.messages.length) {
          setMessages((current) => [...data.messages, ...current]);
          setActiveStatus("DRAFT");
          setActiveSection("Messages");
          setSelectedMessageId(data.messages[0].id);
        }
      }
    });
  }

  async function importRecipients(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setImportState("Validating file...");

    const response = await fetch("/api/import", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      setImportState("Import failed. Check required columns and try again.");
      return;
    }

    const data = (await response.json()) as { validCount: number; invalidCount: number };
    setImportState(`Imported ${data.validCount} recipients. ${data.invalidCount} rows need review.`);
    form.reset();
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white px-4 py-5 lg:block">
          <BrandBlock user={user} />
          <Navigation activeSection={activeSection} onChange={setActiveSection} />
        </aside>

        {mobileNavOpen ? (
          <div className="fixed inset-0 z-50 bg-slate-950/30 lg:hidden">
            <div className="h-full w-[82vw] max-w-80 bg-white px-4 py-5 shadow-xl">
              <div className="mb-5 flex items-center justify-between">
                <BrandBlock user={user} compact />
                <Button variant="ghost" size="icon" onClick={() => setMobileNavOpen(false)} aria-label="Close menu">
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <Navigation
                activeSection={activeSection}
                onChange={(section) => {
                  setActiveSection(section);
                  setMobileNavOpen(false);
                }}
              />
            </div>
          </div>
        ) : null}

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur md:px-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileNavOpen(true)} aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-500">LinkedIn DM Outreach</p>
                  <h1 className="truncate text-xl font-semibold tracking-tight text-slate-950 md:text-2xl">
                    Approval-first outbound workspace
                  </h1>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge variant="blue" className="hidden sm:inline-flex">
                  <BadgeCheck className="mr-1 h-3 w-3" />
                  Connected
                </Badge>
                <Button variant="outline" size="sm" onClick={() => signOut()}>
                  Sign out
                </Button>
              </div>
            </div>
          </header>

          <div className="grid gap-4 px-4 py-4 md:px-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="min-w-0 space-y-4">
              <AnalyticsSection
                analytics={analytics}
                timeframe={timeframe}
                setTimeframe={setTimeframe}
                loading={loadingData}
              />

              <MessagesSection
                activeStatus={activeStatus}
                setActiveStatus={setActiveStatus}
                statusCounts={statusCounts}
                query={query}
                setQuery={setQuery}
                sort={sort}
                setSort={setSort}
                messages={filteredMessages}
                selectedMessageId={selectedMessageId}
                setSelectedMessageId={setSelectedMessageId}
                onMove={(id, status) => updateMessage(id, { status, updatedAt: new Date().toISOString() })}
              />

              <CampaignSetupSection
                form={campaignForm}
                setForm={setCampaignForm}
                matchCount={matchCount}
                saving={saving}
                onSubmit={createCampaign}
              />

              <BulkImportSection importState={importState} onSubmit={importRecipients} />
            </div>

            <ApprovalPanel
              selectedMessage={selectedMessage}
              editedBody={editedBody}
              setEditedBody={setEditedBody}
              saving={saving}
              onSave={saveSelectedMessage}
              onApprove={() => selectedMessage && updateMessage(selectedMessage.id, { status: "APPROVED", updatedAt: new Date().toISOString() })}
              onSkip={() => selectedMessage && updateMessage(selectedMessage.id, { status: "SKIPPED", updatedAt: new Date().toISOString() })}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

function BrandBlock({ user, compact = false }: DashboardShellProps & { compact?: boolean }) {
  return (
    <div className={compact ? "" : "mb-8"}>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-white">
          <BadgeCheck className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold tracking-tight">thehotspot</p>
          <p className="truncate text-xs text-slate-500">{user.email || user.name || "LinkedIn workspace"}</p>
        </div>
      </div>
    </div>
  );
}

function Navigation({
  activeSection,
  onChange,
}: {
  activeSection: string;
  onChange: (section: string) => void;
}) {
  return (
    <nav className="space-y-1">
      {navigation.map((item) => {
        const Icon = item.icon;
        const active = activeSection === item.label;
        return (
          <button
            key={item.label}
            className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition ${
              active ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
            }`}
            onClick={() => onChange(item.label)}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}

function AnalyticsSection({
  analytics,
  timeframe,
  setTimeframe,
  loading,
}: {
  analytics: AnalyticsSnapshot;
  timeframe: string;
  setTimeframe: (value: string) => void;
  loading: boolean;
}) {
  return (
    <section id="analytics" className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Analytics</h2>
          <p className="text-sm text-slate-500">Recent DM activity and engagement quality.</p>
        </div>
        <div className="grid grid-cols-3 rounded-lg border border-slate-200 bg-white p-1 text-sm">
          {[
            ["hour", "Past Hour"],
            ["day", "Past Day"],
            ["week", "Past Week"],
          ].map(([value, label]) => (
            <button
              key={value}
              className={`rounded-md px-3 py-1.5 transition ${timeframe === value ? "bg-slate-950 text-white" : "text-slate-500 hover:text-slate-950"}`}
              onClick={() => setTimeframe(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Open rate" value={`${analytics.openRate}%`} helper="Tracked via campaign events" icon={BarChart3} />
        <MetricCard label="Response rate" value={`${analytics.responseRate}%`} helper="Replies over sent DMs" icon={MessageSquareText} />
        <MetricCard label="Engagement trend" value={`+${analytics.engagementTrend}%`} helper="Compared with prior period" icon={Sparkles} />
        <MetricCard label="Sent DMs" value={analytics.sentCount.toString()} helper="Approved and sent" icon={Send} />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div>
            <CardTitle>Activity timeline</CardTitle>
            <CardDescription>Filterable events for opens, replies, approvals, and imports.</CardDescription>
          </div>
          {loading ? <Loader2 className="h-4 w-4 animate-spin text-slate-400" /> : null}
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.timeline.map((event) => (
              <div key={event.id} className="flex gap-3 rounded-md border border-slate-100 bg-slate-50 px-3 py-3">
                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-sky-500" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900">{event.label}</p>
                  <p className="text-xs text-slate-500">
                    {event.message} · {formatRelative(event.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function MetricCard({
  label,
  value,
  helper,
  icon: Icon,
}: {
  label: string;
  value: string;
  helper: string;
  icon: typeof BarChart3;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-slate-500">{label}</p>
          <Icon className="h-4 w-4 text-slate-400" />
        </div>
        <p className="text-2xl font-semibold tracking-tight text-slate-950">{value}</p>
        <p className="mt-1 text-xs text-slate-500">{helper}</p>
      </CardContent>
    </Card>
  );
}

function MessagesSection({
  activeStatus,
  setActiveStatus,
  statusCounts,
  query,
  setQuery,
  sort,
  setSort,
  messages,
  selectedMessageId,
  setSelectedMessageId,
  onMove,
}: {
  activeStatus: MessageStatus;
  setActiveStatus: (value: MessageStatus) => void;
  statusCounts: Record<MessageStatus, number>;
  query: string;
  setQuery: (value: string) => void;
  sort: string;
  setSort: (value: string) => void;
  messages: DashboardMessage[];
  selectedMessageId: string;
  setSelectedMessageId: (value: string) => void;
  onMove: (id: string, status: MessageStatus) => void;
}) {
  return (
    <section id="messages" className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">DM Management</h2>
        <p className="text-sm text-slate-500">Search, sort, edit, and move messages through approval states.</p>
      </div>

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search recipient, company, campaign..." className="pl-9" />
            </div>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
            <Button variant="outline">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {statusTabs.map((tab) => (
              <button
                key={tab.value}
                className={`rounded-md border px-3 py-2 text-left text-sm transition ${
                  activeStatus === tab.value
                    ? "border-slate-950 bg-slate-950 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
                onClick={() => setActiveStatus(tab.value)}
              >
                <span className="block font-medium">{tab.label}</span>
                <span className={activeStatus === tab.value ? "text-white/70" : "text-slate-400"}>
                  {statusCounts[tab.value] || 0} messages
                </span>
              </button>
            ))}
          </div>

          <div className="overflow-hidden rounded-lg border border-slate-200">
            <div className="hidden grid-cols-[1.2fr_1fr_120px_120px] gap-3 border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs font-medium uppercase tracking-wide text-slate-500 md:grid">
              <span>Recipient</span>
              <span>Campaign</span>
              <span>Status</span>
              <span>Updated</span>
            </div>
            <div className="divide-y divide-slate-100">
              {messages.length ? (
                messages.map((message) => (
                  <button
                    key={message.id}
                    className={`grid w-full gap-2 px-4 py-3 text-left transition md:grid-cols-[1.2fr_1fr_120px_120px] md:items-center md:gap-3 ${
                      selectedMessageId === message.id ? "bg-sky-50" : "bg-white hover:bg-slate-50"
                    }`}
                    onClick={() => setSelectedMessageId(message.id)}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-950">{message.recipientName}</p>
                      <p className="truncate text-xs text-slate-500">
                        {[message.recipientRole, message.company].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    <p className="truncate text-sm text-slate-600">{message.campaignName || "No campaign"}</p>
                    <div>
                      <StatusBadge status={message.status} />
                    </div>
                    <div className="flex items-center justify-between gap-3 md:block">
                      <span className="text-xs text-slate-500">{formatRelative(message.updatedAt)}</span>
                      <MessageActions message={message} onMove={onMove} />
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-10 text-center text-sm text-slate-500">
                  No messages match this view.
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function MessageActions({
  message,
  onMove,
}: {
  message: DashboardMessage;
  onMove: (id: string, status: MessageStatus) => void;
}) {
  return (
    <div className="flex items-center gap-1 md:mt-2">
      {message.status !== "APPROVED" ? (
        <Button variant="ghost" size="sm" onClick={(event) => { event.stopPropagation(); onMove(message.id, "APPROVED"); }}>
          Approve
        </Button>
      ) : null}
      {message.status !== "SKIPPED" ? (
        <Button variant="ghost" size="sm" onClick={(event) => { event.stopPropagation(); onMove(message.id, "SKIPPED"); }}>
          Skip
        </Button>
      ) : null}
      <MoreHorizontal className="h-4 w-4 text-slate-400" />
    </div>
  );
}

function CampaignSetupSection({
  form,
  setForm,
  matchCount,
  saving,
  onSubmit,
}: {
  form: CampaignFormState;
  setForm: (value: CampaignFormState) => void;
  matchCount: number;
  saving: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  function updateField(field: string, value: string) {
    setForm({ ...form, [field]: value });
  }

  return (
    <section id="campaign-setup" className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Campaign Setup</h2>
        <p className="text-sm text-slate-500">Compose context-rich campaigns before Codex generates drafts.</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <form className="grid gap-4 lg:grid-cols-2" onSubmit={onSubmit}>
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-slate-700">Campaign name</span>
              <Input value={form.name} onChange={(event) => updateField("name", event.target.value)} required />
            </label>
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-slate-700">Recipient selection</span>
              <select
                value={form.audienceType}
                onChange={(event) => updateField("audienceType", event.target.value)}
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="SINGLE_PERSON">Single Person</option>
                <option value="ENTIRE_COMPANY">Entire Company</option>
                <option value="CUSTOM_CATEGORY">Custom Category</option>
              </select>
            </label>
            <label className="space-y-1.5 lg:col-span-2">
              <span className="text-sm font-medium text-slate-700">Campaign description</span>
              <Textarea value={form.description} onChange={(event) => updateField("description", event.target.value)} required />
            </label>
            <div className="grid gap-3 sm:grid-cols-2 lg:col-span-2">
              <Input value={form.targetCompany} onChange={(event) => updateField("targetCompany", event.target.value)} placeholder="Target company" />
              <Input value={form.targetRole} onChange={(event) => updateField("targetRole", event.target.value)} placeholder="Role or title" />
              <Input value={form.targetProfession} onChange={(event) => updateField("targetProfession", event.target.value)} placeholder="Profession" />
              <Input value={form.targetCategory} onChange={(event) => updateField("targetCategory", event.target.value)} placeholder="Category" />
            </div>
            <label className="space-y-1.5 lg:col-span-2">
              <span className="text-sm font-medium text-slate-700">Base DM content</span>
              <Textarea value={form.baseMessage} onChange={(event) => updateField("baseMessage", event.target.value)} required />
            </label>
            <label className="space-y-1.5 lg:col-span-2">
              <span className="text-sm font-medium text-slate-700">Context, links, background, reference materials</span>
              <Textarea value={form.context} onChange={(event) => updateField("context", event.target.value)} required />
            </label>
            <Input className="lg:col-span-2" value={form.referenceUrl} onChange={(event) => updateField("referenceUrl", event.target.value)} placeholder="Optional reference link" />
            <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between lg:col-span-2">
              <div>
                <p className="text-sm font-medium text-slate-950">{matchCount} matching recipients</p>
                <p className="text-xs text-slate-500">Count updates from stored LinkedIn profile and import data.</p>
              </div>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Generate drafts
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}

function BulkImportSection({
  importState,
  onSubmit,
}: {
  importState: string | null;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <section id="bulk-import" className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Bulk Import</h2>
        <p className="text-sm text-slate-500">Upload CSV or Excel files with people and company data.</p>
      </div>
      <Card>
        <CardContent className="p-4">
          <form className="grid gap-4 md:grid-cols-[1fr_auto]" onSubmit={onSubmit}>
            <label className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5">
              <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-900">
                <FileUp className="h-4 w-4" />
                Import recipients
              </span>
              <input
                className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-white file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700"
                name="file"
                type="file"
                accept=".csv,.xlsx,.xls"
                required
              />
              <p className="mt-2 text-xs text-slate-500">Recommended columns: firstName, lastName, fullName, linkedinUrl, company, role, profession, category.</p>
            </label>
            <div className="flex flex-col justify-between gap-3">
              <Button type="submit">Parse and import</Button>
              {importState ? <p className="text-sm text-slate-600">{importState}</p> : null}
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}

function ApprovalPanel({
  selectedMessage,
  editedBody,
  setEditedBody,
  saving,
  onSave,
  onApprove,
  onSkip,
}: {
  selectedMessage?: DashboardMessage;
  editedBody: string;
  setEditedBody: (value: string) => void;
  saving: boolean;
  onSave: () => void;
  onApprove: () => void;
  onSkip: () => void;
}) {
  return (
    <aside className="xl:sticky xl:top-20 xl:h-[calc(100vh-6rem)]">
      <Card className="xl:h-full">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle>Approval Editor</CardTitle>
              <CardDescription>Edit generated copy before final approval.</CardDescription>
            </div>
            <Badge variant="blue">Codex</Badge>
          </div>
        </CardHeader>
        <CardContent className="flex h-full flex-col gap-4">
          {selectedMessage ? (
            <>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-sm font-medium text-slate-950">{selectedMessage.recipientName}</p>
                <p className="text-xs text-slate-500">
                  {[selectedMessage.recipientRole, selectedMessage.company].filter(Boolean).join(" · ")}
                </p>
              </div>
              <Textarea className="min-h-72 flex-1 resize-none leading-6" value={editedBody} onChange={(event) => setEditedBody(event.target.value)} />
              <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
                <Button variant="outline" onClick={onSave} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Clock3 className="h-4 w-4" />}
                  Save
                </Button>
                <Button onClick={onApprove}>
                  <CheckCircle2 className="h-4 w-4" />
                  Approve
                </Button>
                <Button variant="secondary" onClick={onSkip}>
                  <Archive className="h-4 w-4" />
                  Skip
                </Button>
              </div>
            </>
          ) : (
            <div className="flex min-h-72 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 text-center">
              <MessageSquareText className="mb-3 h-8 w-8 text-slate-300" />
              <p className="text-sm font-medium text-slate-700">Select a message</p>
              <p className="text-xs text-slate-500">Draft copy appears here for review.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </aside>
  );
}

function StatusBadge({ status }: { status: MessageStatus }) {
  const variant = status === "SENT" ? "green" : status === "SKIPPED" ? "orange" : status === "APPROVED" ? "blue" : "secondary";
  return <Badge variant={variant}>{status.toLowerCase()}</Badge>;
}

function formatRelative(value: string) {
  const delta = Date.now() - new Date(value).getTime();
  const minutes = Math.max(1, Math.round(delta / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export function ConnectionScreen() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-950">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl items-center">
        <div className="grid w-full gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <section className="space-y-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-950 text-white">
              <BadgeCheck className="h-6 w-6" />
            </div>
            <div className="space-y-3">
              <h1 className="max-w-xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Connect LinkedIn before managing outreach.
              </h1>
              <p className="max-w-lg text-base leading-7 text-slate-600">
                Authenticate with LinkedIn to access your secure workspace for campaigns, imported profile data, draft approvals, and engagement analytics.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" onClick={() => signIn("linkedin")}>
                <BadgeCheck className="h-4 w-4" />
                Continue with LinkedIn
              </Button>
              <Button variant="outline" size="lg" onClick={() => signIn("linkedin")}>
                Use company SSO
              </Button>
            </div>
            <p className="text-xs text-slate-500">
              Sessions are persisted with NextAuth. LinkedIn tokens are stored server-side through Prisma and Neon.
            </p>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Workspace preview</p>
                <h2 className="text-xl font-semibold tracking-tight">Approval queue</h2>
              </div>
              <Badge variant="blue">Locked</Badge>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <PreviewMetric label="Drafts" value="42" />
              <PreviewMetric label="Approved" value="18" />
              <PreviewMetric label="Response rate" value="24%" />
            </div>
            <div className="mt-5 space-y-3">
              {fallbackMessages.map((message) => (
                <div key={message.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-medium text-slate-950">{message.recipientName}</p>
                    <StatusBadge status={message.status} />
                  </div>
                  <p className="line-clamp-2 text-sm leading-6 text-slate-600">{message.body}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function PreviewMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}
