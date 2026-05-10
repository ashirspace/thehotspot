export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { messages } = req.body;
  const API_KEY = process.env.ANTHROPIC_API_KEY;

  if (!API_KEY) {
    return res.status(200).json({
      content: [{ type: "text", text: "API key not configured. Add ANTHROPIC_API_KEY in Vercel → Settings → Environment Variables." }],
    });
  }

  const systemPrompt = `You are thehotspot's Outreach Assistant — a smart, friendly AI that helps users manage email outreach campaigns for affiliate marketing.

You help with:
- Sending outreach emails by category (Network, CPS, CPL, CPA, Mobile)
- Checking campaign stats and status
- Pausing/resuming outreach workflows
- Adding/removing contacts
- Modifying email templates
- Scheduling campaigns
- Answering questions about thehotspot platform

You understand and respond in any language the user speaks (English, Hindi, Hinglish, Urdu, Punjabi, etc). Always match the user's language naturally.

Be concise, helpful, and professional. Keep responses short (2-4 sentences max unless detail is needed).

When you identify a clear action the user wants to take, append it at the very end of your response in this exact format:
<action>{"type":"send_emails","category":"Network"}</action>

Available action types: send_emails (with category: "Network"|"CPS"|"CPL"|"CPA"|"Mobile"|"all"), pause_workflow, resume_workflow, show_stats, add_contact, change_template`;

  try {
    const cleanMessages = (messages || [])
      .filter(m => m.role === "user" || m.role === "assistant")
      .map(m => ({ role: m.role, content: m.content }));

    // Anthropic requires messages to start with user and alternate roles
    const firstUserIdx = cleanMessages.findIndex(m => m.role === "user");
    const validMessages = firstUserIdx >= 0 ? cleanMessages.slice(firstUserIdx) : cleanMessages;

    if (validMessages.length === 0) {
      return res.status(200).json({
        content: [{ type: "text", text: "Hey! How can I help you with your outreach today?" }],
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
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: systemPrompt,
        messages: validMessages,
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(200).json({
        content: [{ type: "text", text: "API error: " + (data.error.message || JSON.stringify(data.error)) }],
      });
    }

    // Anthropic response format matches what the frontend already expects
    res.status(200).json({ content: data.content });
  } catch (error) {
    res.status(200).json({
      content: [{ type: "text", text: "Connection error: " + error.message }],
    });
  }
}
