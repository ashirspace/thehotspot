import { getAccessToken } from "../auth.js";
import { getDb } from "../_db.js";

function buildGmailMessage(to, subject, body) {
  const encodedSubject = `=?UTF-8?B?${Buffer.from(subject, "utf8").toString("base64")}?=`;
  const msg = [
    `To: ${to}`,
    `Subject: ${encodedSubject}`,
    `Content-Type: text/plain; charset=utf-8`,
    `MIME-Version: 1.0`,
    "",
    body,
  ].join("\r\n");
  return Buffer.from(msg, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function sendEmail(accessToken, to, subject, body) {
  const raw = buildGmailMessage(to, subject, body + "\n\n---\nTo unsubscribe, reply STOP.");
  const r = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ raw }),
  });
  const data = await r.json();
  if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
  return { threadId: data.threadId };
}

async function generateEmail(host, proto, company, category, offerContext, maxChars) {
  const r = await fetch(`${proto}://${host}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ company, category, offerContext, maxChars: maxChars || 400 }),
  });
  return r.json();
}

export default async function handler(req, res) {
  let sql;
  try {
    sql = getDb();
  } catch {
    return res.status(200).json({ ok: false, reason: "Database not configured" });
  }

  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers.host;
  const results = { scheduled: 0, followups: 0, errors: [] };

  // Get all users with stored refresh tokens
  let users = [];
  try {
    users = await sql`SELECT id, username, email, gmail_refresh_token FROM users WHERE gmail_refresh_token IS NOT NULL AND gmail_refresh_token != ''`;
  } catch (e) {
    return res.status(200).json({ ok: false, error: e.message });
  }

  const now = new Date().toISOString();

  for (const user of users) {
    const userId = user.username || user.email || String(user.id);

    let accessToken;
    try {
      accessToken = await getAccessToken(user.gmail_refresh_token);
    } catch (e) {
      results.errors.push(`Token refresh failed for ${userId}: ${e.message}`);
      continue;
    }

    // ── Scheduled campaigns ──────────────────────────────────────────────────
    try {
      const scheduled = await sql`
        SELECT * FROM scheduled_campaigns
        WHERE user_id = ${userId} AND status = 'pending' AND scheduled_for <= ${now}
      `;

      for (const sched of scheduled) {
        const { category, offer_context: offerContext, max_chars: maxChars, id: schedId } = sched;

        await sql`UPDATE scheduled_campaigns SET status = 'running' WHERE id = ${schedId}`;

        const contacts = category && category !== "all"
          ? await sql`SELECT * FROM contacts WHERE category = ${category} AND email IS NOT NULL AND email != '' LIMIT 10`
          : await sql`SELECT * FROM contacts WHERE email IS NOT NULL AND email != '' LIMIT 10`;

        let sent = 0, failed = 0;
        for (const c of contacts) {
          try {
            const draft = await generateEmail(host, proto, c.company || c.name || c.email, c.category || category || "Network", offerContext, maxChars);
            await sendEmail(accessToken, c.email, draft.subject, draft.body);
            sent++;
            results.scheduled++;
            await new Promise(r => setTimeout(r, 2500));
          } catch { failed++; }
        }

        await sql`UPDATE scheduled_campaigns SET status = 'completed', sent_count = ${sent}, failed_count = ${failed} WHERE id = ${schedId}`;
      }
    } catch (e) { results.errors.push(`Scheduled campaigns for ${userId}: ${e.message}`); }

    // ── Follow-up sequences ──────────────────────────────────────────────────
    try {
      const sequences = await sql`
        SELECT * FROM sequences
        WHERE status = 'active' AND next_send_at <= ${now}
        LIMIT 10
      `;

      for (const seq of sequences) {
        const { contact_email: email, company, thread_id: threadId, step = 1, id: seqId } = seq;
        if (!email) continue;

        try {
          if (threadId) {
            const tr = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/threads/${threadId}`, {
              headers: { Authorization: `Bearer ${accessToken}` },
            });
            const td = await tr.json();
            if (td.messages?.length > 1) {
              await sql`UPDATE sequences SET status = 'replied', replied_at = NOW() WHERE id = ${seqId}`;
              continue;
            }
          }

          if (step >= 3) {
            await sql`UPDATE sequences SET status = 'completed' WHERE id = ${seqId}`;
            continue;
          }

          const followUpContext = step === 1
            ? "Following up on my previous email — just checking if you had a chance to review it."
            : "Last follow-up from me — wanted to make sure this didn't get lost. Happy to connect whenever timing works.";

          const draft = await generateEmail(host, proto, company || email.split("@")[0], "Network", followUpContext, 200);
          await sendEmail(accessToken, email, `Re: ${draft.subject}`, draft.body);

          const stepDays = [0, 4, 7];
          const nextSendAt = new Date(Date.now() + (stepDays[step] || 7) * 86400000).toISOString();
          await sql`UPDATE sequences SET step = ${step + 1}, next_send_at = ${nextSendAt}, last_sent_at = NOW() WHERE id = ${seqId}`;
          results.followups++;
          await new Promise(r => setTimeout(r, 2500));
        } catch (e) { results.errors.push(`Sequence ${seqId}: ${e.message}`); }
      }
    } catch (e) { results.errors.push(`Follow-ups for ${userId}: ${e.message}`); }
  }

  return res.status(200).json({ ok: true, ...results, timestamp: new Date().toISOString() });
}
