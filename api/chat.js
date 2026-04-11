export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { messages } = req.body;
  const API_KEY = process.env.CLAUDE_API_KEY;

  if (!API_KEY) {
    return res.status(200).json({
      content: [{ type: "text", text: "API key not configured. Please add CLAUDE_API_KEY in Vercel environment variables." }],
    });
  }

  try {
    const cleanMessages = (messages || []).filter(m => m.role === "user" || m.role === "assistant");
    const firstUserIdx = cleanMessages.findIndex(m => m.role === "user");
    const validMessages = firstUserIdx >= 0 ? cleanMessages.slice(firstUserIdx) : cleanMessages;

    if (validMessages.length === 0) {
      return res.status(200).json({
        content: [{ type: "text", text: "Hey! How can I help you today?" }],
      });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: `You are thehotspot's Outreach Assistant — a multilingual AI that helps users manage email outreach campaigns for affiliate marketing. You understand and respond in Hindi, English, Hinglish, Urdu, Punjabi, and any language the user speaks. Always match the user's language naturally.

You help with:
- Sending outreach emails by category (Network, CPS, CPL, CPA, Mobile)
- Checking campaign stats and status
- Pausing/resuming outreach workflows
- Adding/removing contacts
- Modifying email templates
- Scheduling campaigns
- Answering questions about thehotspot platform

Be concise, friendly, and professional. Keep responses short (2-4 sentences max).
If someone says hi/hello, greet them warmly and ask how you can help.
If you identify an actionable command, include at the end: <action>{"type":"send_emails","category":"Network"}</action>
Action types: send_emails, add_contact, pause_workflow, resume_workflow, show_stats, change_template`,
        messages: validMessages,
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(200).json({
        content: [{ type: "text", text: "API Error: " + (data.error.message || JSON.stringify(data.error)) }],
      });
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(200).json({
      content: [{ type: "text", text: "Connection error: " + error.message }],
    });
  }
}
