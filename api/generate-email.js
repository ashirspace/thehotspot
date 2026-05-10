export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { company, category, website, offerContext } = req.body;
  const API_KEY = process.env.OPENAI_API_KEY;

  const categoryContext = {
    Network: "affiliate network partnership — sharing traffic and leads",
    CPS: "cost-per-sale campaign collaboration",
    CPL: "cost-per-lead generation partnership",
    CPA: "cost-per-action marketing collaboration",
    Mobile: "mobile marketing and app-based advertising partnership",
  };

  const fallback = {
    subject: `Partnership Opportunity — ${company}`,
    body: `Hi ${company} team,\n\nI'm reaching out from thehotspot to explore a ${categoryContext[category] || "marketing partnership"} with you.\n\nWe help affiliate marketers manage outreach campaigns and partnerships efficiently. I believe there's a strong fit between our platforms.\n\nWould you be open to a quick chat this week to explore this?\n\nBest regards`,
  };

  if (!API_KEY) return res.status(200).json(fallback);

  const prompt = `Write a professional outreach email for an affiliate marketing partnership.

Target: ${company}${website ? ` (${website})` : ""}
Partnership type: ${categoryContext[category] || category}
${offerContext ? `Our offer/context: ${offerContext}` : ""}
Sender platform: thehotspot — outreach automation for affiliate marketers

Rules:
- 3 short paragraphs max, professional but warm
- Clear value proposition in first paragraph
- Mention the company name naturally
- End with one specific call-to-action
- No generic openers like "I hope this email finds you well"

Return ONLY valid JSON, no markdown:
{"subject":"...", "body":"..."}`;

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
    res.status(200).json({ subject: parsed.subject || fallback.subject, body: parsed.body || fallback.body });
  } catch {
    res.status(200).json(fallback);
  }
}
