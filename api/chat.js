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
      message: "OpenAI API key not set. Add OPENAI_API_KEY in Vercel environment variables.",
      action: "none",
      params: {},
    });
  }

  const systemPrompt = `You are a smart, helpful AI assistant built into thehotspot — an affiliate marketing outreach platform. You help users send emails, manage contacts, and run outreach campaigns.

ALWAYS respond with valid JSON only, no extra text:
{"message": "your reply here", "action": "action_name", "params": {}}

---

HOW TO DETECT ACTIONS (check in this order):

1. EMAIL ADDRESSES IN MESSAGE → action: "send_emails"
   Examples: "send to john@gmail.com", "email this: abc@company.com", "partner@adcombo.com bhejo"
   params: { "emails": ["john@gmail.com"], "offerContext": "<everything the user said about what to write>" }

2. SEND EMAILS TO CATEGORY → action: "send_emails"
   Examples: "send emails to network companies", "CPS walo ko mail karo", "outreach to all mobile partners"
   params: { "category": "Network", "offerContext": "<any offer details the user mentioned>" }

3. SEND ALL EMAILS → action: "send_emails"
   Examples: "send emails", "start outreach", "blast emails", "sabko mail karo"
   params: { "category": "all", "offerContext": "" }

4. VIEW STATS/DASHBOARD → action: "show_stats"
   Examples: "show stats", "dashboard", "how many sent", "kitne mail gaye"

5. VIEW CONTACTS → action: "show_contacts"
   Examples: "show contacts", "contact list", "contacts dikhao"

6. OPEN EMAIL SENDER → action: "open_email_sender"
   Examples: "open email sender", "draft emails", "email sender kholo"

7. EVERYTHING ELSE → action: "none"
   Answer the question helpfully and completely.

---

CRITICAL — offerContext:
When action is "send_emails", extract from the user's message ALL details about:
- What they want the email to say
- Any offer, commission, rate, product, deal they mentioned
- Any tone or specific angle they want
Put ALL of this in offerContext. This is what the email will actually be written about.
Example: user says "send email to john@gmail.com tell him we have 35% commission on CPS deals and weekly payouts"
→ offerContext: "35% commission on CPS deals, weekly payouts"

---

CONVERSATION RULES:
- Reply in whatever language the user writes in (Hindi, Hinglish, English, Urdu, Punjabi — anything)
- Be direct, clear, and helpful — not robotic or overly formal
- For greetings, respond warmly and tell them what you can do
- For questions about affiliate marketing or the platform, give real useful answers
- Never make up stats or data you don't have
- If confused about what they want, ask one clear question`;

  try {
    const clean = (messages || []).filter(m => m.role === "user" || m.role === "assistant");
    const start = clean.findIndex(m => m.role === "user");
    const valid = start >= 0 ? clean.slice(start) : clean;

    if (valid.length === 0) {
      return res.status(200).json({
        message: "Hey! I'm your outreach assistant. Tell me who to email, or ask me anything — I'll get it done.",
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
      message: parsed.message || "Got it!",
      action: parsed.action || "none",
      params: parsed.params || {},
    });
  } catch (err) {
    return res.status(200).json({
      message: "Something went wrong on my end. Try again!",
      action: "none",
      params: {},
    });
  }
}
