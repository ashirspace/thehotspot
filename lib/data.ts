import { getSql } from "@/lib/db";
import { demoCampaigns, demoContacts, demoFollowUps } from "@/lib/demo-data";
import type { Campaign, Contact, FollowUp } from "@/lib/types";

export async function getContacts(userId: string): Promise<Contact[]> {
  if (userId === "demo-user") return demoContacts;
  const sql = getSql();
  return await sql`SELECT id, first_name, last_name, email, company, job_title, status, COALESCE(notes, '') notes, created_at FROM contacts WHERE user_id = ${userId} ORDER BY created_at DESC` as Contact[];
}

export async function getContact(userId: string, id: string): Promise<Contact | null> {
  if (userId === "demo-user") return demoContacts.find((contact) => contact.id === id) ?? demoContacts[0];
  const sql = getSql();
  const rows = await sql`SELECT id, first_name, last_name, email, company, job_title, status, COALESCE(notes, '') notes, created_at FROM contacts WHERE user_id = ${userId} AND id = ${id} LIMIT 1` as Contact[];
  return rows[0] ?? null;
}

export async function getFollowUps(userId: string): Promise<FollowUp[]> {
  if (userId === "demo-user") return demoFollowUps;
  const sql = getSql();
  return await sql`SELECT e.id, e.contact_id, CONCAT(c.first_name, ' ', c.last_name) contact_name, c.company, e.subject, e.follow_up_due FROM emails e JOIN contacts c ON c.id = e.contact_id WHERE e.user_id = ${userId} AND e.status = 'sent' AND e.follow_up_due IS NOT NULL AND e.follow_up_due <= NOW() + INTERVAL '1 day' ORDER BY e.follow_up_due` as FollowUp[];
}

export async function getCampaigns(userId: string): Promise<Campaign[]> {
  if (userId === "demo-user") return demoCampaigns;
  const sql = getSql();
  return await sql`SELECT id, name, status, sent_count, reply_count, created_at FROM campaigns WHERE user_id = ${userId} ORDER BY created_at DESC` as Campaign[];
}

export async function getMetrics(userId: string) {
  if (userId === "demo-user") return { leads: 128, sent: 86, replies: 19 };
  const sql = getSql();
  const [row] = await sql`SELECT (SELECT COUNT(*)::int FROM contacts WHERE user_id = ${userId}) leads, (SELECT COUNT(*)::int FROM emails WHERE user_id = ${userId} AND status = 'sent') sent, (SELECT COUNT(*)::int FROM contacts WHERE user_id = ${userId} AND status = 'replied') replies`;
  return row as { leads: number; sent: number; replies: number };
}
