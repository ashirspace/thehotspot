export type MessageStatus = "DRAFT" | "APPROVED" | "SENT" | "SKIPPED";

export type DashboardMessage = {
  id: string;
  recipientName: string;
  recipientRole?: string | null;
  company?: string | null;
  body: string;
  status: MessageStatus;
  campaignName?: string | null;
  createdAt: string;
  updatedAt: string;
  sentAt?: string | null;
  openedAt?: string | null;
  respondedAt?: string | null;
};

export type ActivityEvent = {
  id: string;
  type: string;
  label: string;
  createdAt: string;
  message?: string;
};

export type AnalyticsSnapshot = {
  openRate: number;
  responseRate: number;
  engagementTrend: number;
  sentCount: number;
  timeline: ActivityEvent[];
};

export type RecipientCount = {
  count: number;
};
