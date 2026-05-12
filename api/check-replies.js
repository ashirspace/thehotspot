export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { gmailToken, threads } = req.body;

  if (!gmailToken) return res.status(400).json({ error: "gmailToken required" });
  if (!threads || threads.length === 0) return res.status(200).json({ replied: [], notReplied: [], checked: 0 });

  const replied = [];
  const notReplied = [];

  for (const item of threads) {
    const email = item.email;
    const threadId = item.threadId;

    if (!threadId) {
      notReplied.push({ email, reason: "no_thread_id" });
      continue;
    }

    try {
      const r = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/threads/${threadId}`, {
        headers: { Authorization: `Bearer ${gmailToken}` },
      });

      if (r.status === 401) {
        return res.status(401).json({ error: "Gmail token expired", replied, notReplied });
      }

      const data = await r.json();

      if (data.error) {
        notReplied.push({ email, reason: "api_error" });
        continue;
      }

      const messageCount = data.messages?.length || 0;
      if (messageCount > 1) {
        // Thread has replies
        const lastMsg = data.messages[data.messages.length - 1];
        const headers = lastMsg.payload?.headers || [];
        const from = headers.find(h => h.name === "From")?.value || "";
        const repliedAt = new Date(parseInt(lastMsg.internalDate)).toISOString();
        replied.push({ email, threadId, messageCount, repliedAt, from });
      } else {
        notReplied.push({ email, threadId, messageCount });
      }
    } catch {
      notReplied.push({ email, reason: "fetch_error" });
    }
  }

  return res.status(200).json({
    replied,
    notReplied,
    checked: threads.length,
    repliedCount: replied.length,
  });
}
