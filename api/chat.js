export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { messages } = req.body;
  const API_KEY = process.env.OPENAI_API_KEY;

  if (!API_KEY) {
    return res.status(200).json({ message: "API key not configured. Add OPENAI_API_KEY in Vercel environment variables.", action: "none", params: {} });
  }

  const systemPrompt = `You are thehotspot's Outreach Assistant — a smart AI helping users run affiliate marketing email campaigns. You understand English, Hindi, Hinglish, Urdu, Punjabi — always reply in the user's language.

ALWAYS respond with ONLY valid JSON. No extra text, no markdown. Exact format:
{"message": "your reply", "action": "action_name", "params": {}}

AVAILABLE ACTIONS:
- "send_emails" → send outreach emails
    If user gives email address(es) like "send to john@example.com": params = {"emails": ["john@example.com"]}
    If user mentions a category like "send to Network companies": params = {"category": "Network"}
    If user just says "send emails" or "send outreach": params = {"category": "all"}
- "show_stats" → open dashboard. params = {}
- "show_contacts" → open contacts list. params = {}
- "open_email_sender" → open email sender tool. params = {}
- "none" → just respond, no action. params = {}

DETECTION RULES (highest priority first):
1. Any email address (@) in the message → action "send_emails", extract all emails into params.emails array
2. "send email/mails/outreach" + category name → action "send_emails" + params.category
3. "send email/mails/outreach" (no category) → action "send_emails" + params.category = "all"
4. "stats", "dashboard", "how many sent", "report" → action "show_stats"
5. "contacts", "contact list", "database" → action "show_contacts"
6. Anything else → action "none"

Keep message short (1-3 sentences). Be warm and friendly.`;

  try {
    const clean = (messages || []).filter(m => m.role === "user" || m.role === "assistant");
    const start = clean.findIndex(m => m.role === "user");
    const valid = start >= 0 ? clean.slice(start) : clean;

    if (valid.length === 0) {
      return res.status(200).json({ message: "Hey! How can I help you today?", action: "none", params: {} });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${API_KEY}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 300,
        response_format: { type: "json_object" },
        messages: [{ role: "system", content: systemPrompt }, ...valid],
      }),
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    const parsed = JSON.parse(data.choices?.[0]?.message?.content || "{}");
    return res.status(200).json({
      message: parsed.message || "Got it!",
      action: parsed.action || "none",
      params: parsed.params || {},
    });
  } catch (err) {
    return res.status(200).json({ message: "Sorry, something went wrong. Try again!", action: "none", params: {} });
  }
}
