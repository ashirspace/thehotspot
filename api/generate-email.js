export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { company, category, website, offerContext } = req.body;
  const API_KEY = process.env.OPENAI_API_KEY;

  const fallback = {
    subject: `Partnership Opportunity with ${company}`,
    body: `Hi ${company} Team,\n\nI came across ${company} and wanted to reach out about a potential affiliate partnership.\n\n${offerContext ? offerContext + "\n\n" : ""}We'd love to explore how we can work together to drive mutual growth. Would you be open to a quick 15-minute call this week?\n\nLooking forward to hearing from you.\n\nBest regards,\nThehotspot Team`,
  };

  if (!API_KEY) return res.status(200).json(fallback);

  const prompt = `You are an expert affiliate marketing outreach specialist. Write a highly personalized, compelling outreach email.

RECIPIENT DETAILS:
- Company: ${company}
- Website: ${website || "unknown"}
- Partnership type: ${category || "affiliate"}
${offerContext ? `- What to communicate: ${offerContext}` : ""}

WRITE AN EMAIL THAT:
1. Opens with something specific about their company (reference their name, what they do based on their domain, or their niche)
2. Gets straight to the point — what you're offering and why it benefits THEM
3. Mentions concrete details if provided (commission rates, payouts, volumes, etc.)
4. Is conversational and human — NOT corporate/stiff
5. Has a clear single call-to-action at the end
6. Is 150-200 words max — short and punchy
7. Does NOT use these clichés: "I hope this email finds you well", "I wanted to reach out", "synergy", "leverage", "touch base"

SUBJECT LINE: Make it specific, curiosity-driven, and under 50 characters. Not generic like "Partnership Opportunity".

Return ONLY valid JSON:
{"subject": "...", "body": "..."}

The body should use plain text with line breaks (\\n), no HTML.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${API_KEY}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 800,
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
