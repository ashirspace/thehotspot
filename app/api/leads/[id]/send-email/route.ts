import { NextResponse } from "next/server";
import { z } from "zod";
import { getContact } from "@/lib/data";
import { getSql } from "@/lib/db";
import { sendGmail } from "@/lib/gmail";
import { getValidGoogleAccessToken } from "@/lib/google-oauth";
import { getViewer } from "@/lib/viewer";

const schema = z.object({ subject: z.string().trim().min(3).max(160), body: z.string().trim().min(20).max(10000), followUpDays: z.number().int().min(1).max(30).default(3) });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const viewer = await getViewer();
  if (!viewer) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Complete the subject and email body." }, { status: 400 });
  const { id } = await params;
  const contact = await getContact(viewer.id, id);
  if (!contact) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  if (viewer.id === "demo-user") return NextResponse.json({ ok: true, demo: true });
  const sql = getSql();
  const [user] = await sql`SELECT google_access_token, google_refresh_token, google_token_expires_at FROM users WHERE id=${viewer.id}` as Array<{ google_access_token: string | null; google_refresh_token: string | null; google_token_expires_at: string | null }>;
  if (!user) return NextResponse.json({ error: "Connect Google before sending with Gmail." }, { status: 409 });
  let accessToken: string;
  try { accessToken = await getValidGoogleAccessToken(viewer.id, { accessToken: user.google_access_token, refreshToken: user.google_refresh_token, expiresAt: user.google_token_expires_at }); }
  catch { return NextResponse.json({ error: "Reconnect Google before sending with Gmail." }, { status: 409 }); }
  const result = await sendGmail(accessToken, contact.email, parsed.data.subject, parsed.data.body);
  await sql`INSERT INTO emails (user_id, contact_id, subject, body, status, gmail_message_id, sent_at, follow_up_due) VALUES (${viewer.id}, ${id}, ${parsed.data.subject}, ${parsed.data.body}, 'sent', ${result.id}, NOW(), NOW() + (${parsed.data.followUpDays} * INTERVAL '1 day'))`;
  await sql`UPDATE contacts SET status='contacted', updated_at=NOW() WHERE id=${id} AND user_id=${viewer.id}`;
  return NextResponse.json({ ok: true });
}
