import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { sendGmail } from "@/lib/gmail";
import { getValidGoogleAccessToken } from "@/lib/google-oauth";

export async function GET(request: Request) {
  if (!process.env.CRON_SECRET || request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sql = getSql();
  const due = await sql`SELECT e.id, e.user_id, e.contact_id, e.subject, e.body, c.first_name, c.email, u.google_access_token, u.google_refresh_token, u.google_token_expires_at FROM emails e JOIN contacts c ON c.id=e.contact_id JOIN users u ON u.id=e.user_id WHERE e.status='sent' AND e.follow_up_due <= NOW() AND c.status NOT IN ('replied','not_interested') AND (u.google_access_token IS NOT NULL OR u.google_refresh_token IS NOT NULL) LIMIT 50` as Array<{ id: string; user_id: string; contact_id: string; subject: string; body: string; first_name: string; email: string; google_access_token: string | null; google_refresh_token: string | null; google_token_expires_at: string | null }>;
  let sent = 0;
  for (const item of due) {
    try {
      const subject = item.subject.toLowerCase().startsWith("re:") ? item.subject : `Re: ${item.subject}`;
      const body = `Hi ${item.first_name},\n\nJust following up in case this got buried. Is this worth a quick conversation?\n\nBest,\nTheHotspot`;
      const accessToken = await getValidGoogleAccessToken(item.user_id, { accessToken: item.google_access_token, refreshToken: item.google_refresh_token, expiresAt: item.google_token_expires_at });
      const result = await sendGmail(accessToken, item.email, subject, body);
      await sql`INSERT INTO emails (user_id, contact_id, subject, body, status, gmail_message_id, sent_at) VALUES (${item.user_id}, ${item.contact_id}, ${subject}, ${body}, 'sent', ${result.id}, NOW())`;
      await sql`UPDATE emails SET follow_up_due=NULL WHERE id=${item.id}`;
      await sql`UPDATE contacts SET status='follow_up', updated_at=NOW() WHERE id=${item.contact_id}`;
      sent += 1;
    } catch { /* One failed Gmail send must not block the remaining queue. */ }
  }
  return NextResponse.json({ processed: due.length, sent });
}
