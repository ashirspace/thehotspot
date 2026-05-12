import { getAccessToken, getRefreshTokenForUser } from "../auth.js";

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
  const r = await fetch(`${proto}://${host}/api/generate-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ company, category, offerContext, maxChars: maxChars || 400 }),
  });
  return r.json();
}

export default async function handler(req, res) {
  const AIRTABLE_API_KEY = process.env.VITE_AIRTABLE_API_KEY;
  const AIRTABLE_BASE_ID = process.env.VITE_AIRTABLE_BASE_ID;

  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    return res.status(200).json({ ok: false, reason: "Airtable not configured" });
  }

  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers.host;
  const results = { scheduled: 0, followups: 0, errors: [] };

  // Get all users who have stored refresh tokens
  let users = [];
  try {
    const r = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Users?filterByFormula=NOT({GmailRefreshToken}='')`,
      { headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` } }
    );
    const d = await r.json();
    users = d.records || [];
  } catch (e) {
    return res.status(200).json({ ok: false, error: e.message });
  }

  for (const userRecord of users) {
    const refreshToken = userRecord.fields.GmailRefreshToken;
    const userId = userRecord.fields.Username || userRecord.fields.Email || userRecord.id;

    let accessToken;
    try {
      accessToken = await getAccessToken(refreshToken);
    } catch (e) {
      results.errors.push(`Token refresh failed for ${userId}: ${e.message}`);
      continue;
    }

    // ── Scheduled campaigns ──────────────────────────────────────────
    try {
      const now = new Date().toISOString();
      const schedRes = await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/ScheduledCampaigns?filterByFormula=${encodeURIComponent(`AND({UserId}="${userId}",{Status}="pending",{ScheduledAt}<="${now}")`)}`,
        { headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` } }
      );
      const schedData = await schedRes.json();

      for (const sched of schedData.records || []) {
        const { Category: category, OfferContext: offerContext, MaxChars: maxChars } = sched.fields;

        // Mark as running
        await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/ScheduledCampaigns/${sched.id}`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ fields: { Status: "running" } }),
        });

        // Fetch up to 10 contacts
        const filter = category && category !== "all"
          ? `AND({Category}="${category}",NOT({Email}=''))`
          : "NOT({Email}='')";
        const contactsRes = await fetch(
          `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Contacts?filterByFormula=${encodeURIComponent(filter)}&maxRecords=10`,
          { headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` } }
        );
        const contactsData = await contactsRes.json();

        let sent = 0, failed = 0;
        for (const c of contactsData.records || []) {
          const email = c.fields.Email || c.fields["Mail ID"];
          if (!email) continue;
          try {
            const draft = await generateEmail(
              host, proto,
              c.fields["Company Name"] || c.fields.Name || email,
              c.fields.Category || category || "Network",
              offerContext, maxChars
            );
            await sendEmail(accessToken, email, draft.subject, draft.body);
            sent++;
            results.scheduled++;
            await new Promise(r => setTimeout(r, 2500));
          } catch { failed++; }
        }

        await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/ScheduledCampaigns/${sched.id}`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ fields: { Status: "completed", SentCount: sent, FailedCount: failed } }),
        });
      }
    } catch (e) { results.errors.push(`Scheduled campaigns for ${userId}: ${e.message}`); }

    // ── Follow-up sequences ──────────────────────────────────────────
    try {
      const now = new Date().toISOString();
      const seqRes = await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Sequences?filterByFormula=${encodeURIComponent(`AND({Status}="active",{NextSendAt}<="${now}"`)}&maxRecords=10`,
        { headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` } }
      );
      const seqData = await seqRes.json();

      for (const seq of seqData.records || []) {
        const { ContactEmail: email, Company: company, ThreadId: threadId, Step: step = 1 } = seq.fields;
        if (!email) continue;

        try {
          // Check for reply
          if (threadId) {
            const tr = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/threads/${threadId}`, {
              headers: { Authorization: `Bearer ${accessToken}` },
            });
            const td = await tr.json();
            if (td.messages?.length > 1) {
              await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Sequences/${seq.id}`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}`, "Content-Type": "application/json" },
                body: JSON.stringify({ fields: { Status: "replied", RepliedAt: new Date().toISOString() } }),
              });
              continue;
            }
          }

          if (step >= 3) {
            await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Sequences/${seq.id}`, {
              method: "PATCH",
              headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}`, "Content-Type": "application/json" },
              body: JSON.stringify({ fields: { Status: "completed" } }),
            });
            continue;
          }

          const followUpContext = step === 1
            ? "Following up on my previous email — just checking if you had a chance to review it."
            : "Last follow-up from me — wanted to make sure this didn't get lost. Happy to connect whenever timing works.";

          const draft = await generateEmail(host, proto, company || email.split("@")[0], "Network", followUpContext, 200);
          await sendEmail(accessToken, email, `Re: ${draft.subject}`, draft.body);

          const stepDays = [0, 4, 7];
          const nextSendAt = new Date(Date.now() + (stepDays[step] || 7) * 86400000).toISOString();
          await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Sequences/${seq.id}`, {
            method: "PATCH",
            headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({ fields: { Step: step + 1, NextSendAt: nextSendAt, LastSentAt: new Date().toISOString() } }),
          });
          results.followups++;
          await new Promise(r => setTimeout(r, 2500));
        } catch (e) { results.errors.push(`Sequence ${seq.id}: ${e.message}`); }
      }
    } catch (e) { results.errors.push(`Follow-ups for ${userId}: ${e.message}`); }
  }

  return res.status(200).json({ ok: true, ...results, timestamp: new Date().toISOString() });
}
