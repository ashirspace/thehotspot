import { getAccessToken } from "../auth.js";
import { getDb } from "../_db.js";

function escapeEmailHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function htmlToPlainText(value = "") {
  return String(value)
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/\s*(p|div|tr|table|li|h[1-6])\s*>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

function normalizeEmailBody(body = "") {
  return htmlToPlainText(body)
    .replace(/—/g, "-")
    .replace(/<img\b[^>]*>/gi, "")
    .replace(/^[-_]{2,}\s*$/gm, "")
    .replace(/^to unsubscribe,\s*reply\s+stop\.?$/gim, "")
    .replace(/^.*\/api\/track\?.*$/gim, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function parseEmailSignature(body = "", fallback = {}) {
  const lines = normalizeEmailBody(body).split("\n");
  let signoffIndex = -1;
  for (let i = lines.length - 1; i >= 0; i -= 1) {
    if (/^(best|regards|thanks|thank you|sincerely|cheers),?$/i.test(lines[i].trim())) {
      signoffIndex = i;
      break;
    }
  }
  if (signoffIndex === -1) {
    return {
      bodyText: lines.join("\n").trim(),
      signoff: "Best,",
      name: fallback.name || fallback.username || "Ashir Ayaan",
      title: fallback.role_title || fallback.role || "CEO",
      company: fallback.company || "thehotspot",
    };
  }
  const sigLines = lines.slice(signoffIndex).map(line => line.trim()).filter(Boolean);
  return {
    bodyText: lines.slice(0, signoffIndex).join("\n").trim(),
    signoff: sigLines[0] || "Best,",
    name: sigLines[1] || fallback.name || fallback.username || "Ashir Ayaan",
    title: sigLines[2] || fallback.role_title || fallback.role || "",
    company: sigLines[3] || fallback.company || "thehotspot",
  };
}

function renderStructuredSignature(signature, logoUrl = "") {
  const initials = (signature.name || "A").split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]?.toUpperCase()).join("") || "A";
  const mark = logoUrl
    ? `<img src="${escapeEmailHtml(logoUrl)}" width="40" height="40" alt="thehotspot" style="display:block;width:40px;height:40px;border:0;object-fit:contain;" />`
    : `<div style="width:40px;height:40px;border-radius:8px;background:#0d9488;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;line-height:40px;text-align:center;">${escapeEmailHtml(initials)}</div>`;
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:24px 0 0 0;padding-top:18px;border-top:1px solid #e5e7eb;"><tr><td style="width:52px;vertical-align:top;padding:2px 12px 0 0;">${mark}</td><td style="vertical-align:top;padding:0;"><div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.45;color:#111827;margin:0 0 2px 0;">${escapeEmailHtml(signature.signoff)}</div><div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.45;color:#111827;font-weight:700;margin:0;">${escapeEmailHtml(signature.name)}</div>${signature.title ? `<div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.45;color:#475569;margin:1px 0 0 0;">${escapeEmailHtml(signature.title)}</div>` : ""}<div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.45;color:#0d9488;font-weight:700;margin:1px 0 0 0;">${escapeEmailHtml(signature.company)}</div></td></tr></table>`;
}

function wrapEmailHtml(plainBody, sender = {}, logoUrl = "") {
  const signature = parseEmailSignature(plainBody, sender);
  const paragraphs = signature.bodyText
    .split(/\n{2,}/)
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => {
      return `<p style="margin:0 0 16px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.75;color:#1a1a1a;">${escapeEmailHtml(p).replace(/\n/g, "<br>")}</p>`;
    })
    .join("");
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#ffffff;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding:24px 16px;"><table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;"><tr><td style="padding:0;">${paragraphs}${renderStructuredSignature(signature, logoUrl)}<p style="margin:22px 0 0 0;padding-top:14px;border-top:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#9ca3af;">To unsubscribe, reply <strong>STOP</strong> to this email.</p></td></tr></table></td></tr></table></body></html>`;
}

function buildGmailMessage(to, subject, htmlBody) {
  const encodedSubject = `=?UTF-8?B?${Buffer.from(subject, "utf8").toString("base64")}?=`;
  const msg = [
    `To: ${to}`,
    `Subject: ${encodedSubject}`,
    `Content-Type: text/html; charset=utf-8`,
    `Content-Transfer-Encoding: 8bit`,
    `MIME-Version: 1.0`,
    "",
    htmlBody,
  ].join("\r\n");
  return Buffer.from(msg, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function sendEmail(accessToken, to, subject, body, logoUrl = "") {
  const raw = buildGmailMessage(to, subject, wrapEmailHtml(body, {}, logoUrl));
  const r = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ raw }),
  });
  const data = await r.json();
  if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
  return { threadId: data.threadId };
}

async function generateEmail(host, proto, contact, category, offerContext, maxChars) {
  const contactRecord = typeof contact === "string" ? { company: contact } : (contact || {});
  const r = await fetch(`${proto}://${host}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      company: contactRecord.company || contactRecord.company_name || contactRecord.name || contactRecord.email || "the company",
      contactName: contactRecord.name || "",
      email: contactRecord.email || contactRecord.contact_email || "",
      category: contactRecord.category || category,
      website: contactRecord.website || "",
      offerContext,
      maxChars: maxChars || 640,
    }),
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
  const logoUrl = `${proto}://${host}/logo.png`;
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
            const draft = await generateEmail(host, proto, c, c.category || category || "Network", offerContext, maxChars);
            await sendEmail(accessToken, c.email, draft.subject, draft.body, logoUrl);
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

          const draft = await generateEmail(host, proto, { company: company || email.split("@")[0], email }, "Network", followUpContext, 320);
          await sendEmail(accessToken, email, `Re: ${draft.subject}`, draft.body, logoUrl);

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
