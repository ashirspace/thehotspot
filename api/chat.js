export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { messages } = req.body;
  const API_KEY = process.env.OPENAI_API_KEY;

  if (!API_KEY) {
    return res.status(200).json({
      message: "OpenAI API key not configured. Add OPENAI_API_KEY in Vercel environment variables.",
      action: "none",
      params: {},
    });
  }

  const systemPrompt = `You are the AI assistant for thehotspot — an affiliate marketing outreach platform. You are smart, helpful, and conversational. You speak the user's language naturally (English, Hindi, Hinglish, Urdu, Punjabi, etc).

Your job:
1. Answer any questions the user has — about the platform, about affiliate marketing, about their campaigns, anything.
2. Help users take actions like sending emails, viewing stats, or managing contacts.
3. Be genuinely helpful, not robotic.

RESPONSE FORMAT — always respond with valid JSON:
{
  "message": "your full conversational reply here",
  "action": "one of: none | send_emails | show_stats | show_contacts | open_email_sender",
  "params": {}
}

ACTION RULES:
- If the user's message contains an email address (e.g. "partner@adcombo.com") → action: "send_emails", params: { "emails": ["partner@adcombo.com"], "offerContext": "..." }
- If the user wants to send emails to a category → action: "send_emails", params: { "category": "Network", "offerContext": "..." } (or CPS/CPL/CPA/Mobile/all)
- If user says "send emails" with no further detail → action: "send_emails", params: { "category": "all", "offerContext": "..." }
- If user wants to see stats or dashboard → action: "show_stats", params: {}
- If user wants to see contacts → action: "show_contacts", params: {}
- If user wants to open the email sender tool → action: "open_email_sender", params: {}

CRITICAL — offerContext rule:
When action is "send_emails", ALWAYS populate "offerContext" in params with a summary of:
- What the user wants to say in the email
- Any specific offer, commission rate, product, or deal they mentioned
- Any tone or style instructions they gave
- If they gave no specific context, use an empty string ""
This offerContext is passed directly to the email generator — it MUST match what you tell the user the email will say.
- For everything else (greetings, questions, explanations) → action: "none", params: {}

MESSAGE RULES:
- Write naturally and conversationally, as if chatting
- Answer questions fully and helpfully — don't cut yourself short
- For greetings, be warm and welcoming
- For questions about the platform, explain clearly
- For action confirmations, confirm what you're about to do
- Match the user's tone and language exactly`;

  try {
    const clean = (messages || []).filter(m => m.role === "user" || m.role === "assistant");
    const start = clean.findIndex(m => m.role === "user");
    const valid = start >= 0 ? clean.slice(start) : clean;

    if (valid.length === 0) {
      return res.status(200).json({
        message: "Hey! I'm your outreach assistant. I can send emails, show you stats, manage contacts, or answer any questions about your campaigns. What do you need?",
        action: "none",
        params: {},
      });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 1000,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          ...valid,
        ],
      }),
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    const parsed = JSON.parse(data.choices?.[0]?.message?.content || "{}");
    return res.status(200).json({
      message: parsed.message || "Got it! How can I help?",
      action: parsed.action || "none",
      params: parsed.params || {},
    });
  } catch (err) {
    return res.status(200).json({
      message: "Sorry, I hit an error. Try again in a moment!",
      action: "none",
      params: {},
    });
  }
}
