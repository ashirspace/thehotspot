export type WorkspaceRole = "owner" | "admin" | "member";
export type CampaignStatus = "draft" | "active" | "paused" | "completed";
export type LeadStatus = "new" | "contacted" | "replied" | "booked" | "closed" | "lost";
export type ValidationStatus = "unknown" | "valid" | "invalid" | "risky";
export type MessageStatus =
  | "queued"
  | "scheduled"
  | "sending"
  | "sent"
  | "delivered"
  | "bounced"
  | "replied"
  | "skipped"
  | "failed";
export type Channel = "email" | "linkedin" | "x" | "instagram" | "facebook";

export type Workspace = {
  id: string;
  name: string;
  plan: "starter" | "growth" | "scale";
  role: WorkspaceRole;
};

export type Lead = {
  id: string;
  name: string;
  email: string;
  company: string;
  role: string;
  linkedinUrl?: string;
  status: LeadStatus;
  validationStatus: ValidationStatus;
  enrichment: Record<string, unknown>;
};

export type SendingIdentity = {
  id: string;
  fromName: string;
  fromEmail: string;
  provider: "gmail" | "resend" | "sendgrid";
  dnsVerified: boolean;
  dailyLimit: number;
  sentToday: number;
  warmupStage: "blocked" | "warming" | "healthy";
};

export type SequenceStep = {
  id: string;
  type: "email" | "dm" | "wait";
  channel: Channel;
  delayHours: number;
  templateId?: string;
  label: string;
};

export type Campaign = {
  id: string;
  name: string;
  status: CampaignStatus;
  sent: number;
  delivered: number;
  opened: number;
  replied: number;
  booked: number;
};

export type Template = {
  id: string;
  name: string;
  channel: Channel;
  subject?: string;
  body: string;
  variables: string[];
};

export type InboxThread = {
  id: string;
  leadName: string;
  company: string;
  channel: Channel;
  intent: "interested" | "pricing" | "not_now" | "unsubscribe";
  preview: string;
  lastActivity: string;
};

export type DashboardReply = {
  id: string;
  senderName: string;
  senderEmail: string | null;
  subject: string;
  preview: string;
  campaignName: string;
  timestamp: string;
};

export type DashboardSummary = {
  totalCampaigns: number;
  leadsGenerated: number;
  followUpsLeftToday: number;
};

export type DashboardOverview = {
  summary: DashboardSummary;
  recentReplies: DashboardReply[];
};
