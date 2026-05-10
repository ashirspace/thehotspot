export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { company, category, website, offerContext, senderName } = req.body;
  const API_KEY = process.env.OPENAI_API_KEY;
  const sender = senderName || "Ashir";

  const fallback = {
    subject: `Quick question for ${company}`,
    body: `Hi ${company} Team,\n\nWe run an affiliate network and think there's a real fit between what we do and what you're building.\n\n${offerContext ? offerContext + "\n\n" : ""}Want to jump on a quick call this week?\n\nBest,\n${sender}\nthehotspot`,
  };

  if (!API_KEY) return res.status(200).json(fallback);

  const prompt = `You are writing a cold outreach email on behalf of ${sender} from thehotspot, an affiliate marketing network.

RECIPIENT:
- Company: ${company}
- Website: ${website || "unknown"}
- Partnership type: ${category || "affiliate"}
${offerContext ? `- Key message to communicate: ${offerContext}` : ""}

WRITE AN EMAIL THAT:
1. Opens with ONE sentence that references something specific about ${company} — their niche, their product, or what their domain suggests they do. Do NOT say "I came across your website."
2. Immediately explains what thehotspot is offering and why it benefits THEM specifically
3. Includes any concrete details from the key message (commission %, payout schedule, volumes, etc.) — if none provided, keep it brief and invite a conversation
4. Ends with ONE clear ask — a short call, a reply, a quick chat
5. Is 100-150 words MAXIMUM — tight and punchy, not a wall of text
6. Sounds like a real person wrote it, not a marketing department

SIGNATURE — end the email exactly like this (fill in ${sender}):
Best,
${sender}
thehotspot

BANNED WORDS AND PHRASES — DO NOT USE ANY OF THESE:
synergy, synergies, leverage, leveraging, touch base, circle back, move the needle,
drive value, game changer, innovative, revolutionizing, deep dive, bandwidth,
"I hope this email finds you well", "I wanted to reach out", "I came across",
"mutual growth", "exciting opportunity", "look forward to connecting",
"would love to explore", "I believe there's a great opportunity",
[Your Name], [Your Position], [Your Contact Information], [placeholder of any kind]

SUBJECT LINE:
- Under 50 characters
- Specific and curiosity-driving — NOT "Partnership Opportunity" or "Collaboration"
- Something the recipient would actually open

Return ONLY valid JSON:
{"subject": "...", "body": "..."}

Body uses plain text with line breaks (\\n). No HTML. No placeholders.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${API_KEY}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 600,
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    const parsed = JSON.parse(data.choices?.[0]?.message?.content || "{}");
    res.status(200).json({
      subject: parsed.subject || fallback.subject,
      body: parsed.body || fallback.body,
    });
  } catch {
    res.status(200).json(fallback);
  }
}
