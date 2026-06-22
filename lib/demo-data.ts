import type { Campaign, Contact, FollowUp } from "@/lib/types";

export const demoContacts: Contact[] = [
  { id: "lead-1", first_name: "Aarav", last_name: "Mehta", email: "aarav@northstar.io", company: "Northstar Labs", job_title: "Head of Growth", status: "follow_up", notes: "Building an outbound motion for the India market.", created_at: "2026-06-20T09:30:00.000Z" },
  { id: "lead-2", first_name: "Priya", last_name: "Shah", email: "priya@fieldnote.co", company: "Fieldnote", job_title: "Founder", status: "contacted", notes: "Referred by Maya. Keep the message concise.", created_at: "2026-06-19T13:10:00.000Z" },
  { id: "lead-3", first_name: "Kabir", last_name: "Rao", email: "kabir@plainwork.com", company: "Plainwork", job_title: "VP Sales", status: "new", notes: "Interested in reducing manual prospect research.", created_at: "2026-06-18T08:45:00.000Z" },
  { id: "lead-4", first_name: "Mira", last_name: "Singh", email: "mira@lumenhq.com", company: "Lumen HQ", job_title: "Revenue Operations", status: "replied", notes: "Asked for a short walkthrough next week.", created_at: "2026-06-16T12:00:00.000Z" },
];

export const demoFollowUps: FollowUp[] = [
  { id: "email-1", contact_id: "lead-1", contact_name: "Aarav Mehta", company: "Northstar Labs", subject: "A simpler outbound workflow for Northstar", follow_up_due: "2026-06-20T11:30:00.000Z" },
  { id: "email-2", contact_id: "lead-2", contact_name: "Priya Shah", company: "Fieldnote", subject: "Quick idea for Fieldnote's founder-led sales", follow_up_due: "2026-06-20T14:00:00.000Z" },
];

export const demoCampaigns: Campaign[] = [
  { id: "campaign-1", name: "SaaS founders — June", status: "active", sent_count: 42, reply_count: 8, created_at: "2026-06-12T08:00:00.000Z" },
  { id: "campaign-2", name: "Growth leaders — India", status: "draft", sent_count: 0, reply_count: 0, created_at: "2026-06-18T08:00:00.000Z" },
];
