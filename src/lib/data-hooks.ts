import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Campaign, InboxThread, Lead, SendingIdentity, SequenceStep, Template } from "../types";
import { useAuth } from "../state/use-auth";
import { apiFetch } from "./api";

type DbLead = {
  id: string;
  name: string;
  first_name?: string | null;
  email: string;
  company?: string | null;
  role?: string | null;
  linkedin_url?: string | null;
  status: Lead["status"];
  validation_status: Lead["validationStatus"];
  enrichment?: Record<string, unknown>;
};

type DbCampaign = {
  id: string;
  name: string;
  status: Campaign["status"];
  sent?: number;
  delivered?: number;
  opened?: number;
  replied?: number;
  booked?: number;
};

type DbIdentity = {
  id: string;
  from_name: string;
  from_email: string;
  provider: SendingIdentity["provider"];
  dns_verified: boolean;
  daily_limit: number;
  sent_today: number;
  warmup_stage: number | string;
};

type DbTemplate = {
  id: string;
  name: string;
  channel: Template["channel"];
  subject?: string | null;
  body: string;
  variables?: string[] | unknown;
};

type DbMessage = {
  id: string;
  channel: InboxThread["channel"];
  body?: string | null;
  subject?: string | null;
  status: string;
  created_at?: string;
  lead?: { name?: string | null; company?: string | null } | null;
  campaign?: { name?: string | null } | null;
};

function mapLead(row: DbLead): Lead {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    company: row.company || "",
    role: row.role || "",
    linkedinUrl: row.linkedin_url || undefined,
    status: row.status,
    validationStatus: row.validation_status,
    enrichment: row.enrichment || {},
  };
}

function mapCampaign(row: DbCampaign): Campaign {
  return {
    id: row.id,
    name: row.name,
    status: row.status,
    sent: row.sent || 0,
    delivered: row.delivered || 0,
    opened: row.opened || 0,
    replied: row.replied || 0,
    booked: row.booked || 0,
  };
}

function mapIdentity(row: DbIdentity): SendingIdentity {
  const stage = typeof row.warmup_stage === "number" ? (row.warmup_stage >= 3 ? "healthy" : row.warmup_stage > 0 ? "warming" : "blocked") : row.warmup_stage;
  return {
    id: row.id,
    fromName: row.from_name,
    fromEmail: row.from_email,
    provider: row.provider,
    dnsVerified: row.dns_verified,
    dailyLimit: row.daily_limit,
    sentToday: row.sent_today,
    warmupStage: stage as SendingIdentity["warmupStage"],
  };
}

function mapTemplate(row: DbTemplate): Template {
  const variables = Array.isArray(row.variables) ? row.variables.filter((item): item is string => typeof item === "string") : [];
  return {
    id: row.id,
    name: row.name,
    channel: row.channel,
    subject: row.subject || undefined,
    body: row.body,
    variables,
  };
}

function mapMessage(row: DbMessage): InboxThread {
  return {
    id: row.id,
    leadName: row.lead?.name || "Unknown lead",
    company: row.lead?.company || row.campaign?.name || "Unknown company",
    channel: row.channel,
    intent: row.status === "replied" ? "interested" : "not_now",
    preview: row.body || row.subject || "No message preview",
    lastActivity: row.created_at ? new Date(row.created_at).toLocaleString() : "now",
  };
}

export function useLeads(search = "") {
  const { workspace } = useAuth();
  return useQuery({
    queryKey: ["leads", workspace.id, search],
    queryFn: async () => {
      const params = new URLSearchParams(search ? { search } : {});
      const data = await apiFetch<{ leads: DbLead[] }>(`/api/leads?${params}`, { workspaceId: workspace.id });
      return data.leads.map(mapLead);
    },
    enabled: Boolean(workspace.id),
  });
}

export function useImportLeads() {
  const { workspace } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (rows: Array<Record<string, unknown>>) => {
      return apiFetch<{ inserted: number; skipped: number }>("/api/leads?action=import", { workspaceId: workspace.id, body: { rows } });
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["leads", workspace.id] }),
  });
}

export function useUpdateLead() {
  const { workspace } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Lead["status"] }) => {
      return apiFetch(`/api/leads?id=${id}`, { method: "PATCH", workspaceId: workspace.id, body: { status } });
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["leads", workspace.id] }),
  });
}

export function useCampaigns() {
  const { workspace } = useAuth();
  return useQuery({
    queryKey: ["campaigns", workspace.id],
    queryFn: async () => {
      const data = await apiFetch<{ campaigns: DbCampaign[] }>("/api/campaigns", { workspaceId: workspace.id });
      return data.campaigns.map(mapCampaign);
    },
    enabled: Boolean(workspace.id),
  });
}

export function useTemplates() {
  const { workspace } = useAuth();
  return useQuery({
    queryKey: ["templates", workspace.id],
    queryFn: async () => {
      const data = await apiFetch<{ templates: DbTemplate[] }>("/api/templates", { workspaceId: workspace.id });
      return data.templates.map(mapTemplate);
    },
    enabled: Boolean(workspace.id),
  });
}

export function useIdentities() {
  const { workspace } = useAuth();
  return useQuery({
    queryKey: ["identities", workspace.id],
    queryFn: async () => {
      const data = await apiFetch<{ identities: DbIdentity[] }>("/api/identities", { workspaceId: workspace.id });
      return data.identities.map(mapIdentity);
    },
    enabled: Boolean(workspace.id),
  });
}

export function useVerifyIdentityDns() {
  const { workspace } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (identityId: string) => apiFetch(`/api/identities?id=${identityId}&action=verify-dns`, { workspaceId: workspace.id, method: "POST" }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["identities", workspace.id] }),
  });
}

export function useSaveWorkspaceSettings() {
  const { workspace } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: { name?: string; physicalAddress?: string | null; webhookUrl?: string | null; calendarUrl?: string | null }) => {
      return apiFetch("/api/workspaces", { method: "PATCH", workspaceId: workspace.id, body });
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["workspace", workspace.id] }),
  });
}

export function useInboxThreads() {
  const { workspace } = useAuth();
  return useQuery({
    queryKey: ["messages", workspace.id],
    queryFn: async () => {
      const data = await apiFetch<{ messages: DbMessage[] }>("/api/messages", { workspaceId: workspace.id });
      return data.messages.map(mapMessage);
    },
    enabled: Boolean(workspace.id),
  });
}

export function useSequenceSteps() {
  return useMemo<SequenceStep[]>(() => [], []);
}

export function useDashboardData() {
  const campaignQuery = useCampaigns();
  const identityQuery = useIdentities();
  const inboxQuery = useInboxThreads();
  return {
    campaigns: campaignQuery.data || [],
    identities: identityQuery.data || [],
    inboxThreads: inboxQuery.data || [],
    isLoading: campaignQuery.isLoading || identityQuery.isLoading || inboxQuery.isLoading,
    isError: campaignQuery.isError || identityQuery.isError || inboxQuery.isError,
  };
}
